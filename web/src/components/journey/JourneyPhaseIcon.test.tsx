import { describe, expect, it } from "vitest";
import MenuBook from "@mui/icons-material/MenuBook";
import Layers from "@mui/icons-material/Layers";

import { getJourneyPhaseIconComponent } from "@/components/journey/JourneyPhaseIcon";

describe("getJourneyPhaseIconComponent", () => {
  it("returns a distinct icon for each production phase id", () => {
    expect(getJourneyPhaseIconComponent("phase-reference")).toBe(MenuBook);
  });

  it("returns a default icon for unknown phase ids (e.g. test fixtures)", () => {
    expect(getJourneyPhaseIconComponent("phase-legacy-unknown")).toBe(Layers);
  });
});
