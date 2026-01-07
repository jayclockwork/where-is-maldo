import type { Mapping } from "@/domain/sessions/types";

export function upsertMapping(mappings: Mapping[], next: Mapping): Mapping[] {
  const idx = mappings.findIndex(
    (m) => m.sessionId === next.sessionId && m.participantId === next.participantId && m.itemId === next.itemId,
  );
  if (idx === -1) return [...mappings, next];
  const copy = mappings.slice();
  copy[idx] = next;
  return copy;
}


