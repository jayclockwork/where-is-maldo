import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithTheme } from "@/test/renderWithTheme";
import { SessionJourneyView } from "@/components/session/SessionJourneyView";
import type { JourneyDoc } from "@/lib/journey/types";
import type { Mapping } from "@/domain/sessions/types";

const journey: JourneyDoc = {
  phases: [
    {
      phaseId: "phase-research",
      title: "Phase 1: Research",
      focus: "learning fast",
      sections: [
        {
          title: "Basic research",
          items: [{ itemId: "phase-research__basic__syntax", label: "Syntax" }],
        },
      ],
    },
  ],
};

describe("<SessionJourneyView />", () => {
  it("defaults phases to expanded in session mode", () => {
    const mappings: Mapping[] = [];
    renderWithTheme(
      <SessionJourneyView journey={journey} mappings={mappings} myParticipantId="p1" onToggle={() => {}} />,
    );

    // MUI AccordionSummary renders as a button with aria-expanded.
    expect(screen.getByRole("button", { name: /phase 1: research/i })).toHaveAttribute("aria-expanded", "true");
  });
});


