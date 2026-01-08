import { describe, expect, it } from "vitest";

import { buildSessionJourneyModel } from "@/lib/session/sessionContentModel";
import type { JourneyDoc } from "@/lib/journey/types";

describe("buildSessionJourneyModel", () => {
  it("builds rows with section headers and nested items", () => {
    const journey: JourneyDoc = {
      phases: [
        {
          phaseId: "phase-research",
          title: "Phase 1: Research",
          focus: "learning fast",
          sections: [
            {
              title: "Basic research",
              items: [
                { itemId: "i1", label: "Syntax", children: [{ itemId: "i2", label: "Regex" }] },
              ],
            },
          ],
        },
      ],
    };

    const model = buildSessionJourneyModel(journey);
    expect(model.phases).toHaveLength(1);
    expect(model.phases[0]!.rows[0]).toEqual({ type: "section", id: "phase-research__section__Basic research", label: "Basic research" });
    expect(model.phases[0]!.rows[1]).toMatchObject({ type: "item", itemId: "i1", depth: 1 });
    expect(model.phases[0]!.rows[2]).toMatchObject({ type: "item", itemId: "i2", depth: 2 });
  });
});


