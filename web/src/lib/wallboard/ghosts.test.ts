import { describe, expect, it } from "vitest";

import type { Mapping, Participant } from "@/domain/sessions/types";
import type { SessionJourneyModel } from "@/lib/session/sessionContentModel";
import { computeGhostsByPhase } from "@/lib/wallboard/ghosts";

describe("computeGhostsByPhase", () => {
  it("counts only section toggles (not bullets) per participant per phase", () => {
    const model: SessionJourneyModel = {
      phases: [
        {
          phaseId: "phase-1",
          title: "Phase 1",
          rows: [
            { type: "section", itemId: "phase-1__section__A", label: "A" },
            { type: "item", itemId: "phase-1__bullet__1", label: "bullet", depth: 1 },
            { type: "section", itemId: "phase-1__section__B", label: "B" },
          ],
        },
        {
          phaseId: "phase-2",
          title: "Phase 2",
          rows: [{ type: "section", itemId: "phase-2__section__C", label: "C" }],
        },
      ],
    };

    const participants: Participant[] = [
      { id: "p1", sessionId: "s1", displayName: "A", avatarColor: "#ff0000", joinedAt: "t" },
      { id: "p2", sessionId: "s1", displayName: "B", avatarColor: "#00ff00", joinedAt: "t" },
    ];

    const mappings: Mapping[] = [
      { sessionId: "s1", participantId: "p1", itemId: "phase-1__section__A", isDoing: true, updatedAt: "t" },
      { sessionId: "s1", participantId: "p1", itemId: "phase-1__section__B", isDoing: true, updatedAt: "t" },
      { sessionId: "s1", participantId: "p1", itemId: "phase-1__bullet__1", isDoing: true, updatedAt: "t" }, // ignored
      { sessionId: "s1", participantId: "p2", itemId: "phase-2__section__C", isDoing: true, updatedAt: "t" },
      { sessionId: "s1", participantId: "pX", itemId: "phase-1__section__A", isDoing: true, updatedAt: "t" }, // unknown participant ignored
    ];

    const res = computeGhostsByPhase({ model, participants, mappings });
    const p1Color = res.participantIdToColor.get("p1");
    expect(p1Color).toBe("#ff0000");

    const phase1 = res.phases.find((p) => p.phaseId === "phase-1")!;
    const phase2 = res.phases.find((p) => p.phaseId === "phase-2")!;

    expect(phase1.ghostsByParticipantId.get("p1")).toBe(2);
    expect(phase1.ghostsByParticipantId.get("p2")).toBeUndefined();
    expect(phase2.ghostsByParticipantId.get("p2")).toBe(1);
  });
});

