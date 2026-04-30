import { describe, expect, it } from "vitest";
import MenuBook from "@mui/icons-material/MenuBook";

import {
  assertJourneyPhaseIconKey,
  getJourneyPhaseIconComponent,
} from "@/lib/journey/journeyPhaseIcons";

describe("journeyPhaseIcons registry", () => {
  it("assertJourneyPhaseIconKey accepts known keys", () => {
    expect(assertJourneyPhaseIconKey("menu_book", "test")).toBe("menu_book");
  });

  it("assertJourneyPhaseIconKey throws for unknown keys", () => {
    expect(() => assertJourneyPhaseIconKey("not_registered", "phases[0].icon")).toThrow(/unknown icon/);
  });

  it("getJourneyPhaseIconComponent returns the MUI icon", () => {
    expect(getJourneyPhaseIconComponent("menu_book")).toBe(MenuBook);
  });
});
