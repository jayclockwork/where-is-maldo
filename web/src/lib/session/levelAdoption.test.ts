import { describe, expect, it } from "vitest";

import type { JourneyDoc } from "@/lib/journey/types";
import type { Mapping, Participant } from "@/domain/sessions/types";
import { computeAdoptionByLevel } from "@/lib/session/levelAdoption";

const journey: JourneyDoc = {
  phases: [
    {
      phaseId: "phase-1",
      title: "Phase 1: Research",
      sections: [
        { title: "A", items: [] },
        { title: "B", items: [] },
      ],
    },
    {
      phaseId: "phase-2",
      title: "Phase 2: Build",
      sections: [{ title: "C", items: [] }],
    },
  ],
};

function p(id: string): Participant {
  return { id, sessionId: "s1", displayName: id, joinedAt: "2026-01-01T00:00:00.000Z" };
}

describe("computeAdoptionByLevel", () => {
  it("counts participants with any doing and those who completed each level", () => {
    const participants = [p("p1"), p("p2")];
    const mappings: Mapping[] = [
      // p1 doing one section in phase-1
      { sessionId: "s1", participantId: "p1", itemId: "phase-1__section__A", isDoing: true, updatedAt: "2026-01-01T00:00:00.000Z" },
      // p2 completes phase-1 by doing both sections
      { sessionId: "s1", participantId: "p2", itemId: "phase-1__section__A", isDoing: true, updatedAt: "2026-01-01T00:00:00.000Z" },
      { sessionId: "s1", participantId: "p2", itemId: "phase-1__section__B", isDoing: true, updatedAt: "2026-01-01T00:00:01.000Z" },
      // p2 also does phase-2
      { sessionId: "s1", participantId: "p2", itemId: "phase-2__section__C", isDoing: true, updatedAt: "2026-01-01T00:00:02.000Z" },
    ];

    const rows = computeAdoptionByLevel({ journey, participants, mappings });
    expect(rows).toHaveLength(2);

    const level1 = rows[0]!;
    expect(level1.stepTitle).toBe("Level 1: Research");
    expect(level1.participantsTotal).toBe(2);
    expect(level1.participantsWithAnyDoing).toBe(2);
    expect(level1.participantsCompleted).toBe(1);

    const level2 = rows[1]!;
    expect(level2.stepTitle).toBe("Level 2: Build");
    expect(level2.participantsWithAnyDoing).toBe(1);
    expect(level2.participantsCompleted).toBe(1);
  });
});

