import { describe, expect, it } from "vitest";

import { upsertMapping } from "@/lib/sessions/mappings";
import type { Mapping } from "@/domain/sessions/types";

describe("upsertMapping", () => {
  it("adds a new mapping when not present", () => {
    const base: Mapping[] = [];
    const next: Mapping = {
      sessionId: "s1",
      participantId: "p1",
      itemId: "item1",
      isDoing: true,
      updatedAt: "t1",
    };
    expect(upsertMapping(base, next)).toEqual([next]);
  });

  it("replaces an existing mapping with the same key", () => {
    const a: Mapping = {
      sessionId: "s1",
      participantId: "p1",
      itemId: "item1",
      isDoing: false,
      updatedAt: "t0",
    };
    const b: Mapping = { ...a, isDoing: true, updatedAt: "t1" };
    expect(upsertMapping([a], b)).toEqual([b]);
  });
});


