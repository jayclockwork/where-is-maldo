import { describe, expect, it } from "vitest";

import { phaseTitleToStepTitle, splitPhaseTitleForDisplay } from "@/lib/text/phaseToStep";

describe("phaseTitleToStepTitle", () => {
  it("replaces leading Phase with Level", () => {
    expect(phaseTitleToStepTitle("Phase 1: Research")).toBe("Level 1: Research");
  });

  it("leaves Level-prefixed titles unchanged", () => {
    expect(phaseTitleToStepTitle("Level 2: Build")).toBe("Level 2: Build");
  });
});

describe("splitPhaseTitleForDisplay", () => {
  it("splits Level N: Name", () => {
    expect(splitPhaseTitleForDisplay("Level 1: Reference")).toEqual({
      prefix: "Level 1",
      name: "Reference",
    });
  });

  it("accepts Phase/Step keywords in the display string", () => {
    expect(splitPhaseTitleForDisplay("Phase 3: Collaboration")).toEqual({
      prefix: "Phase 3",
      name: "Collaboration",
    });
  });

  it("returns null when there is no colon name", () => {
    expect(splitPhaseTitleForDisplay("Level 1:")).toBeNull();
    expect(splitPhaseTitleForDisplay("Intro")).toBeNull();
  });
});
