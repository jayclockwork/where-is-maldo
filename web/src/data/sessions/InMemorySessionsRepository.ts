import type {
  CreateSessionInput,
  JoinSessionInput,
  SessionsRepository,
  SessionEvent,
  ToggleDoingInput,
  Unsubscribe,
} from "@/domain/sessions/repository";
import type { Mapping, Participant, Session } from "@/domain/sessions/types";
import { makeId, makeJoinCode, nowIso } from "@/domain/sessions/id";

type Listener = (event: SessionEvent) => void;

export class InMemorySessionsRepository implements SessionsRepository {
  private sessionsById = new Map<string, Session>();
  private sessionsByJoinCode = new Map<string, string>(); // joinCode -> sessionId
  private participantsById = new Map<string, Participant>();
  private participantsBySessionId = new Map<string, Set<string>>();
  private mappingsByKey = new Map<string, Mapping>(); // sessionId|participantId|itemId
  private mappingKeysBySessionId = new Map<string, Set<string>>();
  private participantSecrets = new Map<string, string>(); // participantId -> secret
  private listenersBySessionId = new Map<string, Set<Listener>>();

  async createSession(input: CreateSessionInput): Promise<{ session: Session; adminToken: string }> {
    const id = makeId("sess");
    const joinCode = (input.joinCode ?? makeJoinCode(6)).toUpperCase();
    if (this.sessionsByJoinCode.has(joinCode)) throw new Error("Join code already exists");
    const session: Session = {
      id,
      joinCode,
      title: input.title,
      status: "open",
      createdAt: nowIso(),
    };

    this.sessionsById.set(id, session);
    this.sessionsByJoinCode.set(joinCode, id);

    return { session, adminToken: makeId("admin") };
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    return this.sessionsById.get(sessionId) ?? null;
  }

  async getSessionByJoinCode(joinCode: string): Promise<Session | null> {
    const sessionId = this.sessionsByJoinCode.get(joinCode);
    if (!sessionId) return null;
    return this.sessionsById.get(sessionId) ?? null;
  }

  async joinSession(input: JoinSessionInput): Promise<{ session: Session; participant: Participant; participantSecret: string }> {
    const session = await this.getSessionByJoinCode(input.joinCode);
    if (!session) throw new Error("Session not found");
    if (session.status !== "open") throw new Error("Session is closed");

    const requestedColor = input.avatarColor?.trim();
    if (requestedColor) {
      const existingIds = Array.from(this.participantsBySessionId.get(session.id) ?? []);
      const used = existingIds
        .map((id) => this.participantsById.get(id)?.avatarColor)
        .filter(Boolean)
        .map((c) => c!.toLowerCase());
      if (used.includes(requestedColor.toLowerCase())) throw new Error("Avatar color unavailable");
    }

    const participant: Participant = {
      id: makeId("p"),
      sessionId: session.id,
      displayName: input.displayName.trim(),
      avatarColor: requestedColor,
      joinedAt: nowIso(),
    };

    this.participantsById.set(participant.id, participant);
    if (!this.participantsBySessionId.has(session.id)) this.participantsBySessionId.set(session.id, new Set());
    this.participantsBySessionId.get(session.id)!.add(participant.id);

    const secret = makeId("secret");
    this.participantSecrets.set(participant.id, secret);

    this.emit(session.id, { type: "participant_joined", participant });
    return { session, participant, participantSecret: secret };
  }

  async toggleDoing(input: ToggleDoingInput & { participantSecret: string }): Promise<Mapping> {
    const session = this.sessionsById.get(input.sessionId);
    if (!session) throw new Error("Session not found");

    const expected = this.participantSecrets.get(input.participantId);
    if (!expected || expected !== input.participantSecret) throw new Error("Unauthorized");

    const key = `${input.sessionId}|${input.participantId}|${input.itemId}`;
    const mapping: Mapping = {
      sessionId: input.sessionId,
      participantId: input.participantId,
      itemId: input.itemId,
      isDoing: input.isDoing,
      updatedAt: nowIso(),
    };

    this.mappingsByKey.set(key, mapping);
    if (!this.mappingKeysBySessionId.has(input.sessionId)) this.mappingKeysBySessionId.set(input.sessionId, new Set());
    this.mappingKeysBySessionId.get(input.sessionId)!.add(key);

    this.emit(input.sessionId, { type: "mapping_updated", mapping });
    return mapping;
  }

  async listParticipants(sessionId: string): Promise<Participant[]> {
    const ids = Array.from(this.participantsBySessionId.get(sessionId) ?? []);
    return ids.map((id) => this.participantsById.get(id)!).filter(Boolean);
  }

  async listMappings(sessionId: string): Promise<Mapping[]> {
    const keys = Array.from(this.mappingKeysBySessionId.get(sessionId) ?? []);
    return keys.map((k) => this.mappingsByKey.get(k)!).filter(Boolean);
  }

  subscribe(sessionId: string, onEvent: (event: SessionEvent) => void): Unsubscribe {
    const set = this.listenersBySessionId.get(sessionId) ?? new Set<Listener>();
    set.add(onEvent);
    this.listenersBySessionId.set(sessionId, set);
    return () => {
      const s = this.listenersBySessionId.get(sessionId);
      s?.delete(onEvent);
    };
  }

  async clearResults(sessionId: string): Promise<void> {
    const keys = this.mappingKeysBySessionId.get(sessionId);
    if (keys) {
      for (const key of keys) this.mappingsByKey.delete(key);
      keys.clear();
    }
    this.emit(sessionId, { type: "results_cleared", sessionId });
  }

  private emit(sessionId: string, event: SessionEvent) {
    const listeners = this.listenersBySessionId.get(sessionId);
    if (!listeners) return;
    for (const l of listeners) l(event);
  }
}


