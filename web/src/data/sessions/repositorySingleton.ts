import { InMemorySessionsRepository } from "@/data/sessions/InMemorySessionsRepository";
import { SupabaseSessionsRepository } from "@/data/sessions/SupabaseSessionsRepository";
import type { SessionsRepository } from "@/domain/sessions/repository";

// For PRD 002 initial slice we use an in-memory implementation.
// Later we'll swap to a Supabase-backed implementation behind the same interface.
declare global {
  var __sessionsRepo: SessionsRepository | undefined;
}

export function getSessionsRepository(): SessionsRepository {
  // In Next dev/runtime, different route handlers may load in different module instances.
  // Store the singleton on globalThis so session state is shared across handlers.
  if (!globalThis.__sessionsRepo) {
    const hasSupabase = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    globalThis.__sessionsRepo = hasSupabase ? new SupabaseSessionsRepository() : new InMemorySessionsRepository();
  }
  return globalThis.__sessionsRepo;
}


