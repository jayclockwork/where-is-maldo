import { describe, expect, it } from "vitest";

import type { Mapping, Participant } from "@/domain/sessions/types";
import type { SessionJourneyModel } from "@/lib/session/sessionContentModel";
import { computeWallboardStats } from "@/lib/wallboard/aggregate";

describe("computeWallboardStats", () => {
  it("counts unique participants doing per phase and returns top section items", () => {
    const participants: Participant[] = [
      { id: "p1", sessionId: "s1", displayName: "A", joinedAt: "t" },
      { id: "p2", sessionId: "s1", displayName: "B", joinedAt: "t" },
      { id: "p3", sessionId: "s1", displayName: "C", joinedAt: "t" },
    ];

    const model: SessionJourneyModel = {
      phases: [
        {
          phaseId: "phase-1",
          title: "Phase 1: Research",
          rows: [
            { type: "section", itemId: "phase-1__section__Basic research", label: "Basic research" },
            { type: "item", itemId: "i1", label: "Bullet 1", depth: 1 },
            { type: "section", itemId: "phase-1__section__Coding research", label: "Coding research" },
          ],
        },
        {
          phaseId: "phase-2",
          title: "Phase 2: Completion",
          rows: [{ type: "section", itemId: "phase-2__section__Advanced completion", label: "Advanced completion" }],
        },
      ],
    };

    const mappings: Mapping[] = [
      { sessionId: "s1", participantId: "p1", itemId: "phase-1__section__Basic research", isDoing: true, updatedAt: "t" },
      { sessionId: "s1", participantId: "p2", itemId: "phase-1__section__Basic research", isDoing: true, updatedAt: "t" },
      { sessionId: "s1", participantId: "p2", itemId: "phase-2__section__Advanced completion", isDoing: true, updatedAt: "t" },
      { sessionId: "s1", participantId: "p3", itemId: "phase-1__section__Coding research", isDoing: false, updatedAt: "t" },
      // Unknown participant should be ignored
      { sessionId: "s1", participantId: "pX", itemId: "phase-1__section__Basic research", isDoing: true, updatedAt: "t" },
    ];

    const stats = computeWallboardStats({ model, participants, mappings, topN: 5 });
    expect(stats.participantCount).toBe(3);
    expect(stats.phases.find((p) => p.phaseId === "phase-1")?.participantCountDoing).toBe(2);
    expect(stats.phases.find((p) => p.phaseId === "phase-2")?.participantCountDoing).toBe(1);
    expect(stats.maxPhaseCount).toBe(2);

    expect(stats.topItems).toEqual([
      {
        itemId: "phase-1__section__Basic research",
        label: "Basic research",
        participantCountDoing: 2,
        phaseId: "phase-1",
      },
      {
        itemId: "phase-2__section__Advanced completion",
        label: "Advanced completion",
        participantCountDoing: 1,
        phaseId: "phase-2",
      },
    ]);
  });
});

