import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

import { renderWithTheme } from "@/test/renderWithTheme";
import { JourneyView } from "@/components/journey/JourneyView";
import type { JourneyDoc } from "@/lib/journey/types";

const sample: JourneyDoc = {
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
    {
      phaseId: "phase-collaboration",
      title: "Phase 3: Collaboration",
      focus: "working with the repo",
      sections: [
        {
          title: "Chatting with code",
          items: [{ itemId: "phase-collaboration__chat__repo", label: "Repo Q&A" }],
        },
      ],
    },
  ],
};

describe("<JourneyView />", () => {
  it("defaults to all phases collapsed and allows expanding a phase", async () => {
    const user = userEvent.setup();
    renderWithTheme(<JourneyView journey={sample} />);

    // MUI AccordionSummary is a button; when collapsed, aria-expanded should be false.
    expect(screen.getByRole("button", { name: /phase 1: research/i })).toHaveAttribute("aria-expanded", "false");

    await user.click(screen.getByRole("button", { name: /phase 1: research/i }));
    expect(screen.getByRole("button", { name: /phase 1: research/i })).toHaveAttribute("aria-expanded", "true");
  });
});


