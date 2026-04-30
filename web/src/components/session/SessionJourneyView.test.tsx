import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";

import { renderWithTheme } from "@/test/renderWithTheme";
import { buildPhaseRenderNodes, SessionJourneyView } from "@/components/session/SessionJourneyView";
import type { JourneyDoc } from "@/lib/journey/types";
import type { Mapping } from "@/domain/sessions/types";

vi.mock("@/ui/effects/confetti", () => ({ launchConfetti: vi.fn() }));
import { launchConfetti } from "@/ui/effects/confetti";

const journey: JourneyDoc = {
  phases: [
    {
      phaseId: "phase-research",
      title: "Phase 1: Research",
      icon: "menu_book",
      humanRole: "You write the journey.",
      llmRole: "Suggests copy.",
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

describe("buildPhaseRenderNodes", () => {
  it("groups section headings with the bullet rows that follow until the next section", () => {
    const rows = [
      { type: "section" as const, itemId: "s1", label: "A" },
      { type: "item" as const, itemId: "i1", label: "x", depth: 1 },
      { type: "section" as const, itemId: "s2", label: "B" },
      { type: "item" as const, itemId: "i2", label: "y", depth: 1 },
    ];
    expect(buildPhaseRenderNodes(rows)).toEqual([
      { type: "section", row: rows[0], nextIsSection: false },
      { type: "items", rows: [rows[1]], followedBySection: true },
      { type: "section", row: rows[2], nextIsSection: false },
      { type: "items", rows: [rows[3]], followedBySection: false },
    ]);
  });

  it("marks a section as followed by another section when there are no bullets in between", () => {
    const rows = [
      { type: "section" as const, itemId: "s1", label: "A" },
      { type: "section" as const, itemId: "s2", label: "B" },
    ];
    expect(buildPhaseRenderNodes(rows)).toEqual([
      { type: "section", row: rows[0], nextIsSection: true },
      { type: "section", row: rows[1], nextIsSection: false },
    ]);
  });
});

describe("<SessionJourneyView />", () => {
  it("renders bullet rows under each section as list items", () => {
    renderWithTheme(
      <SessionJourneyView journey={journey} mappings={[]} myParticipantId="p1" onToggle={() => {}} />,
    );

    const lists = screen.getAllByRole("list");
    expect(lists).toHaveLength(2);
    expect(within(lists[0]).getByText("Syntax").closest("li")).toBeInTheDocument();
    expect(within(lists[1]).getByText("Compare approaches").closest("li")).toBeInTheDocument();
  });

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
    expect(screen.getByRole("button", { name: /level\s*1\s*:\s*research/i })).toHaveAttribute("aria-expanded", "true");

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

    expect(screen.getByRole("button", { name: /level\s*1\s*:\s*research/i })).toHaveTextContent("✅");
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


