import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { parseJourneyMarkdown } from "@/lib/journey/parseJourney";

describe("parseJourneyMarkdown", () => {
  it("parses phases from the journey markdown", () => {
    const filePath = path.join(process.cwd(), "..", "docs", "journey.md");
    const markdown = readFileSync(filePath, "utf8");

    const doc = parseJourneyMarkdown(markdown);

    expect(doc.phases.length).toBe(6);
    expect(doc.phases[0]?.phaseId).toMatch(/^phase-/);
    expect(doc.phases[0]?.title).toContain("Reference");
    expect(doc.phases.some((p) => p.title.toLowerCase().includes("conductor"))).toBe(true);
  });

  it("generates stable itemIds that include the phaseId", () => {
    const markdown = `
### Level 1: Research
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

  it("accepts Step/Phase/Level heading variants", () => {
    const markdown = `
## Step 1: Research
_Focus: learning._

- **Basic research**
  - Syntax and libraries

### Phase 2: Code Completion
_Focus: shipping._
`;

    const doc = parseJourneyMarkdown(markdown);
    expect(doc.phases.map((p) => p.title)).toEqual(expect.arrayContaining(["Step 1: Research", "Phase 2: Code Completion"]));
  });
});


