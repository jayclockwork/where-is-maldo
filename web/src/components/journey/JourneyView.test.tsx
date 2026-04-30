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
      icon: "menu_book",
      humanRole: "You write the journey.",
      llmRole: "Suggests copy.",
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
      icon: "groups",
      humanRole: "You own decisions.",
      llmRole: "Pair-programs.",
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
    // AccordionSummary accessible name may join segments without a space after the colon.
    expect(screen.getByRole("button", { name: /level\s*1\s*:\s*research/i })).toHaveAttribute("aria-expanded", "false");

    await user.click(screen.getByRole("button", { name: /level\s*1\s*:\s*research/i }));
    expect(screen.getByRole("button", { name: /level\s*1\s*:\s*research/i })).toHaveAttribute("aria-expanded", "true");
  });
});


