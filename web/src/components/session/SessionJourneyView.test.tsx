import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";

import { renderWithTheme } from "@/test/renderWithTheme";
import { SessionJourneyView } from "@/components/session/SessionJourneyView";
import type { JourneyDoc } from "@/lib/journey/types";
import type { Mapping } from "@/domain/sessions/types";

vi.mock("@/ui/effects/confetti", () => ({ launchConfetti: vi.fn() }));
import { launchConfetti } from "@/ui/effects/confetti";

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
        {
          title: "Coding research",
          items: [{ itemId: "phase-research__coding__compare", label: "Compare approaches" }],
        },
      ],
    },
  ],
};

describe("<SessionJourneyView />", () => {
  it("defaults phases to expanded in session mode", () => {
    const mappings: Mapping[] = [
      {
        sessionId: "phase-research",
        participantId: "p1",
        itemId: "phase-research__section__Basic research",
        isDoing: true,
        updatedAt: new Date().toISOString(),
      },
    ];
    renderWithTheme(
      <SessionJourneyView journey={journey} mappings={mappings} myParticipantId="p1" onToggle={() => {}} />,
    );

    // MUI AccordionSummary renders as a button with aria-expanded.
    expect(screen.getByRole("button", { name: /step 1: research/i })).toHaveAttribute("aria-expanded", "true");

    // Toggles should live on the section heading (not the bullet).
    expect(screen.getByRole("switch", { name: /toggle doing for basic research/i })).toBeInTheDocument();
    expect(screen.queryByRole("switch", { name: /toggle doing for syntax/i })).toBeNull();

    // When my toggle is on, show a checkmark after the subsection heading text.
    expect(screen.getAllByText(/basic research/i, { selector: "p" })[0]).toHaveTextContent("✅");
  });

  it("shows a celebration emoji on the phase heading when all sections are checked for me", () => {
    const mappings: Mapping[] = [
      {
        sessionId: "phase-research",
        participantId: "p1",
        itemId: "phase-research__section__Basic research",
        isDoing: true,
        updatedAt: new Date().toISOString(),
      },
      {
        sessionId: "phase-research",
        participantId: "p1",
        itemId: "phase-research__section__Coding research",
        isDoing: true,
        updatedAt: new Date().toISOString(),
      },
    ];
    renderWithTheme(
      <SessionJourneyView journey={journey} mappings={mappings} myParticipantId="p1" onToggle={() => {}} />,
    );

    expect(screen.getByRole("button", { name: /step 1: research/i })).toHaveTextContent("✅");
  });

  it("fires confetti when a phase transitions into complete", async () => {
    const incomplete: Mapping[] = [
      {
        sessionId: "phase-research",
        participantId: "p1",
        itemId: "phase-research__section__Basic research",
        isDoing: true,
        updatedAt: new Date().toISOString(),
      },
    ];

    const complete: Mapping[] = [
      ...incomplete,
      {
        sessionId: "phase-research",
        participantId: "p1",
        itemId: "phase-research__section__Coding research",
        isDoing: true,
        updatedAt: new Date().toISOString(),
      },
    ];

    const { rerender } = renderWithTheme(
      <SessionJourneyView journey={journey} mappings={incomplete} myParticipantId="p1" onToggle={() => {}} />,
    );

    rerender(<SessionJourneyView journey={journey} mappings={complete} myParticipantId="p1" onToggle={() => {}} />);

    await waitFor(() => expect(launchConfetti).toHaveBeenCalledTimes(1));
  });

  it("disables toggles when togglesDisabled is true", () => {
    renderWithTheme(
      <SessionJourneyView
        journey={journey}
        mappings={[]}
        myParticipantId="p1"
        onToggle={() => {}}
        togglesDisabled
      />,
    );

    expect(screen.getByRole("switch", { name: /toggle doing for basic research/i })).toBeDisabled();
  });
});


