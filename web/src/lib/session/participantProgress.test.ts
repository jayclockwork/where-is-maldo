import { describe, expect, it } from "vitest";

import type { JourneyDoc } from "@/lib/journey/types";
import type { Mapping } from "@/domain/sessions/types";
import { summarizeParticipantProgress } from "@/lib/session/participantProgress";

const journey: JourneyDoc = {
  phases: [
    {
      phaseId: "phase-research",
      title: "Phase 1: Research",
      icon: "menu_book",
      sections: [
        { title: "Basic research", items: [{ itemId: "phase-research__basic__syntax", label: "Syntax" }] },
        { title: "Coding research", items: [{ itemId: "phase-research__coding__compare", label: "Compare approaches" }] },
      ],
    },
  ],
};

describe("summarizeParticipantProgress", () => {
  it("returns empty when participant has no doing mappings", () => {
    const mappings: Mapping[] = [
      {
        sessionId: "s1",
        participantId: "p1",
        itemId: "phase-research__section__Basic research",
        isDoing: false,
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ];

    const summary = summarizeParticipantProgress({ journey, mappings, participantId: "p1" });
    expect([...summary.doingItemIds]).toEqual([]);
    expect(summary.currentFocus).toBeNull();
  });

  it("chooses the latest updated doing mapping as current focus", () => {
    const mappings: Mapping[] = [
      {
        sessionId: "s1",
        participantId: "p1",
        itemId: "phase-research__section__Basic research",
        isDoing: true,
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        sessionId: "s1",
        participantId: "p1",
        itemId: "phase-research__section__Coding research",
        isDoing: true,
        updatedAt: "2026-01-01T00:10:00.000Z",
      },
    ];

    const summary = summarizeParticipantProgress({ journey, mappings, participantId: "p1" });
    expect(summary.currentFocus?.itemId).toBe("phase-research__section__Coding research");
    expect(summary.currentFocus?.location.stepTitle).toBe("Level 1: Research");
    expect(summary.currentFocus?.location.label).toBe("Coding research");
  });

  it("ignores mappings to unknown itemIds", () => {
    const mappings: Mapping[] = [
      {
        sessionId: "s1",
        participantId: "p1",
        itemId: "unknown__item",
        isDoing: true,
        updatedAt: "2026-01-01T00:10:00.000Z",
      },
      {
        sessionId: "s1",
        participantId: "p1",
        itemId: "phase-research__section__Basic research",
        isDoing: true,
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ];

    const summary = summarizeParticipantProgress({ journey, mappings, participantId: "p1" });
    expect(summary.currentFocus?.itemId).toBe("phase-research__section__Basic research");
  });
});

