import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { parseJourneyMarkdown } from "@/lib/journey/parseJourney";

describe("parseJourneyMarkdown", () => {
  it("parses phases from the journey markdown", () => {
    const filePath = path.join(process.cwd(), "..", "docs", "journey-better.md");
    const markdown = readFileSync(filePath, "utf8");

    const doc = parseJourneyMarkdown(markdown);

    expect(doc.phases.length).toBeGreaterThanOrEqual(4);
    expect(doc.phases[0]?.phaseId).toMatch(/^phase-/);
    expect(doc.phases.some((p) => p.title.toLowerCase().includes("research"))).toBe(true);
  });

  it("generates stable itemIds that include the phaseId", () => {
    const markdown = `
### Phase 1: Research
_Focus: learning._

- **Basic research**
  - Syntax and libraries
`;

    const doc = parseJourneyMarkdown(markdown);
    const phase = doc.phases[0]!;
    const firstItem = phase.sections[0]!.items[0]!;

    expect(firstItem.itemId.startsWith(phase.phaseId)).toBe(true);
    expect(firstItem.itemId).toContain("__");
  });
});


