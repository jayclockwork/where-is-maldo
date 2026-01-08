import type { Mapping, Participant, Session } from "@/domain/sessions/types";

export type CreateSessionInput = { title?: string; joinCode?: string };
export type JoinSessionInput = { joinCode: string; displayName: string; avatarColor?: string };
export type ToggleDoingInput = { sessionId: string; participantId: string; itemId: string; isDoing: boolean };
export type AdminActionInput = { sessionId: string; adminToken: string };

export type SessionEvent =
  | { type: "session_updated"; session: Session }
  | { type: "participant_joined"; participant: Participant }
  | { type: "mapping_updated"; mapping: Mapping }
  | { type: "results_cleared"; sessionId: string };

export type Unsubscribe = () => void;

export type SessionExportV1 = {
  schemaVersion: 1;
  exportedAt: string;
  session: Session;
  participants: Participant[];
  mappings: Mapping[];
};

export interface SessionsRepository {
  createSession(input: CreateSessionInput): Promise<{ session: Session; adminToken: string }>;
  getSessionById(sessionId: string): Promise<Session | null>;
  getSessionByJoinCode(joinCode: string): Promise<Session | null>;

  joinSession(input: JoinSessionInput): Promise<{ session: Session; participant: Participant; participantSecret: string }>;

  toggleDoing(input: ToggleDoingInput & { participantSecret: string }): Promise<Mapping>;

  // Read models
  listParticipants(sessionId: string): Promise<Participant[]>;
  listMappings(sessionId: string): Promise<Mapping[]>;

  // Host/admin controls (PRD 004)
  closeSession(input: AdminActionInput): Promise<Session>;
  reopenSession(input: AdminActionInput): Promise<Session>;
  clearResults(input: AdminActionInput): Promise<void>;
  exportSession(input: AdminActionInput): Promise<SessionExportV1>;

  // Realtime
  subscribe(sessionId: string, onEvent: (event: SessionEvent) => void): Unsubscribe;
}


