import { InMemorySessionsRepository } from "@/data/sessions/InMemorySessionsRepository";
import type { SessionsRepository } from "@/domain/sessions/repository";

// For PRD 002 initial slice we use an in-memory implementation.
// Later we'll swap to a Supabase-backed implementation behind the same interface.
declare global {
  var __sessionsRepo: SessionsRepository | undefined;
}

export function getSessionsRepository(): SessionsRepository {
  // In Next dev/runtime, different route handlers may load in different module instances.
  // Store the singleton on globalThis so session state is shared across handlers.
  if (!globalThis.__sessionsRepo) globalThis.__sessionsRepo = new InMemorySessionsRepository();
  return globalThis.__sessionsRepo;
}


