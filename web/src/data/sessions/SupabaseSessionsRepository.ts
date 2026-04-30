import type {
  AdminActionInput,
  CreateSessionInput,
  JoinSessionInput,
  SessionsRepository,
  SessionEvent,
  SessionExportV1,
  ToggleDoingInput,
  Unsubscribe,
} from "@/domain/sessions/repository";
import type { Mapping, Participant, Session } from "@/domain/sessions/types";
import { makeId, nowIso } from "@/domain/sessions/id";
import { getSupabaseServerClient } from "@/data/supabase/serverClient";

type DbSessionRow = {
  id: string;
  join_code: string;
  title: string | null;
  status: "open" | "closed";
  created_at: string;
  results_cleared_at: string | null;
};

type DbParticipantRow = {
  id: string;
  session_id: string;
  display_name: string;
  avatar_color: string | null;
  joined_at: string;
};

type DbMappingRow = {
  session_id: string;
  participant_id: string;
  item_id: string;
  is_doing: boolean;
  updated_at: string;
};

function toSession(row: DbSessionRow): Session {
  return {
    id: row.id,
    joinCode: row.join_code,
    title: row.title ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    resultsClearedAt: row.results_cleared_at ?? undefined,
  };
}

function toParticipant(row: DbParticipantRow): Participant {
  return {
    id: row.id,
    sessionId: row.session_id,
    displayName: row.display_name,
    avatarColor: row.avatar_color ?? undefined,
    joinedAt: row.joined_at,
  };
}

function toMapping(row: DbMappingRow): Mapping {
  return {
    sessionId: row.session_id,
    participantId: row.participant_id,
    itemId: row.item_id,
    isDoing: row.is_doing,
    updatedAt: row.updated_at,
  };
}

export class SupabaseSessionsRepository implements SessionsRepository {
  async createSession(input: CreateSessionInput): Promise<{ session: Session; adminToken: string }> {
    const supabase = getSupabaseServerClient();
    const id = makeId("sess");
    const joinCode = input.joinCode.trim().toUpperCase();
    if (!joinCode) throw new Error("Join code is required");
    const adminToken = makeId("admin");

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        id,
        join_code: joinCode,
        title: input.title ?? null,
        status: "open",
        admin_token: adminToken,
        created_at: nowIso(),
        results_cleared_at: null,
      })
      .select("id,join_code,title,status,created_at,results_cleared_at")
      .single();

    if (error) {
      // unique violation on join_code etc
      throw new Error(error.message);
    }

    return { session: toSession(data as DbSessionRow), adminToken };
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("sessions")
      .select("id,join_code,title,status,created_at,results_cleared_at")
      .eq("id", sessionId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return toSession(data as DbSessionRow);
  }

  async getSessionByJoinCode(joinCode: string): Promise<Session | null> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("sessions")
      .select("id,join_code,title,status,created_at,results_cleared_at")
      .eq("join_code", joinCode.toUpperCase())
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return toSession(data as DbSessionRow);
  }

  async joinSession(input: JoinSessionInput): Promise<{ session: Session; participant: Participant; participantSecret: string }> {
    const supabase = getSupabaseServerClient();

    const session = await this.getSessionByJoinCode(input.joinCode);
    if (!session) throw new Error("Session not found");
    if (session.status !== "open") throw new Error("Session is closed");

    const requestedColor = input.avatarColor?.trim();
    const normalizedColor = requestedColor ? requestedColor.toLowerCase() : null;
    if (normalizedColor) {
      const { data: existing, error } = await supabase
        .from("participants")
        .select("id")
        .eq("session_id", session.id)
        .eq("avatar_color", normalizedColor)
        .limit(1);
      if (error) throw new Error(error.message);
      if (existing && existing.length) throw new Error("Avatar color unavailable");
    }

    const participantId = makeId("p");
    const participantSecret = makeId("secret");

    const { data, error } = await supabase
      .from("participants")
      .insert({
        id: participantId,
        session_id: session.id,
        display_name: input.displayName.trim(),
        avatar_color: normalizedColor,
        secret: participantSecret,
        joined_at: nowIso(),
      })
      .select("id,session_id,display_name,avatar_color,joined_at")
      .single();

    if (error) {
      const msg = error.message.toLowerCase().includes("duplicate") ? "Avatar color unavailable" : error.message;
      throw new Error(msg);
    }

    return { session, participant: toParticipant(data as DbParticipantRow), participantSecret };
  }

  async toggleDoing(input: ToggleDoingInput & { participantSecret: string }): Promise<Mapping> {
    const supabase = getSupabaseServerClient();

    const { data: p, error: pErr } = await supabase
      .from("participants")
      .select("id")
      .eq("id", input.participantId)
      .eq("session_id", input.sessionId)
      .eq("secret", input.participantSecret)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!p) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from("mappings")
      .upsert(
        {
          session_id: input.sessionId,
          participant_id: input.participantId,
          item_id: input.itemId,
          is_doing: input.isDoing,
          updated_at: nowIso(),
        },
        { onConflict: "session_id,participant_id,item_id" },
      )
      .select("session_id,participant_id,item_id,is_doing,updated_at")
      .single();

    if (error) throw new Error(error.message);
    return toMapping(data as DbMappingRow);
  }

  async listParticipants(sessionId: string): Promise<Participant[]> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("participants")
      .select("id,session_id,display_name,avatar_color,joined_at")
      .eq("session_id", sessionId)
      .order("joined_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data as DbParticipantRow[]).map(toParticipant);
  }

  async listMappings(sessionId: string): Promise<Mapping[]> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("mappings")
      .select("session_id,participant_id,item_id,is_doing,updated_at")
      .eq("session_id", sessionId);
    if (error) throw new Error(error.message);
    return (data as DbMappingRow[]).map(toMapping);
  }

  async clearResults(input: AdminActionInput): Promise<void> {
    const supabase = getSupabaseServerClient();
    await this.assertAdmin(input);

    const { error: delErr } = await supabase.from("mappings").delete().eq("session_id", input.sessionId);
    if (delErr) throw new Error(delErr.message);

    // Also clear participants so avatar colors become available again after a reset.
    // (We delete mappings first so this works even if FK cascade is not configured as expected.)
    const { error: delParticipantsErr } = await supabase.from("participants").delete().eq("session_id", input.sessionId);
    if (delParticipantsErr) throw new Error(delParticipantsErr.message);

    // Update session to broadcast a "results cleared" signal via realtime.
    const { error: updErr } = await supabase
      .from("sessions")
      .update({ results_cleared_at: nowIso() })
      .eq("id", input.sessionId);
    if (updErr) throw new Error(updErr.message);
  }

  async exportSession(input: AdminActionInput): Promise<SessionExportV1> {
    await this.assertAdmin(input);
    const session = await this.getSessionById(input.sessionId);
    if (!session) throw new Error("Session not found");
    const participants = await this.listParticipants(input.sessionId);
    const mappings = await this.listMappings(input.sessionId);
    return { schemaVersion: 1, exportedAt: nowIso(), session, participants, mappings };
  }

  subscribe(sessionId: string, onEvent: (event: SessionEvent) => void): Unsubscribe {
    const supabase = getSupabaseServerClient();

    let lastClearedAt: string | null = null;

    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "participants", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const row = payload.new as unknown as DbParticipantRow;
          onEvent({ type: "participant_joined", participant: toParticipant(row) });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mappings", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const row = payload.new as unknown as DbMappingRow;
          if (!row || !row.session_id) return;
          onEvent({ type: "mapping_updated", mapping: toMapping(row) });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sessions", filter: `id=eq.${sessionId}` },
        (payload) => {
          const row = payload.new as unknown as DbSessionRow;
          if (!row || !row.id) return;
          const session = toSession(row);
          onEvent({ type: "session_updated", session });
          const clearedAt = row.results_cleared_at ?? null;
          if (clearedAt && clearedAt !== lastClearedAt) {
            lastClearedAt = clearedAt;
            onEvent({ type: "results_cleared", sessionId });
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }

  private async assertAdmin(input: AdminActionInput): Promise<void> {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from("sessions").select("admin_token").eq("id", input.sessionId).maybeSingle();
    if (error) throw new Error(error.message);
    const expected = (data as { admin_token?: string } | null)?.admin_token;
    if (!expected || expected !== input.adminToken) throw new Error("Unauthorized");
  }
}

