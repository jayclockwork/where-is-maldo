import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { parseJourneyYaml } from "@/lib/journey/parseJourneyYaml";
import type { JourneyDoc, JourneyItem } from "@/lib/journey/types";

function collectItemIds(doc: JourneyDoc): string[] {
  const ids: string[] = [];
  const walk = (items: JourneyItem[]) => {
    for (const item of items) {
      ids.push(item.itemId);
      if (item.children?.length) walk(item.children);
    }
  };
  for (const phase of doc.phases) {
    for (const section of phase.sections) {
      walk(section.items);
    }
  }
  return ids.sort();
}

describe("parseJourneyYaml", () => {
  it("parses phases from docs/journey.yaml", () => {
    const filePath = path.join(process.cwd(), "..", "docs", "journey.yaml");
    const yamlText = readFileSync(filePath, "utf8");
    const doc = parseJourneyYaml(yamlText);

    expect(doc.phases.length).toBe(6);
    expect(doc.phases[0]?.humanRole).toContain("actual code edits");
    expect(doc.phases[0]?.llmRole).toContain("smarter search");
    expect(doc.phases[0]?.icon).toBe("menu_book");
    expect(doc.phases[0]?.phaseId).toMatch(/^phase-/);
    expect(doc.phases[0]?.title).toContain("Reference");
    expect(doc.phases.some((p) => p.title.toLowerCase().includes("conductor"))).toBe(true);

    const ids = collectItemIds(doc);
    expect(ids.length).toBe(61);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(
      "phase-reference__basic-research__how-to-code-a-statement-or-function",
    );
  });

  it("generates stable itemIds that include the phaseId", () => {
    const yamlText = `
phases:
  - title: "Level 1: Research"
    icon: menu_book
    sections:
      - title: Basic research
        items:
          - label: Syntax and libraries
`;

    const doc = parseJourneyYaml(yamlText);
    const phase = doc.phases[0]!;
    const firstItem = phase.sections[0]!.items[0]!;

    expect(firstItem.itemId.startsWith(phase.phaseId)).toBe(true);
    expect(firstItem.itemId).toContain("__");
  });

  it("accepts Phase and Step titles like the former markdown parser", () => {
    const yamlText = `
phases:
  - title: "Step 1: Research"
    icon: menu_book
    sections:
      - title: Section A
        items:
          - label: Item one
  - title: "Phase 2: Code Completion"
    icon: keyboard
    sections:
      - title: Section B
        items:
          - label: Item two
`;

    const doc = parseJourneyYaml(yamlText);
    expect(doc.phases.map((p) => p.title)).toEqual(
      expect.arrayContaining(["Step 1: Research", "Phase 2: Code Completion"]),
    );
  });

  it("parses human_role and llm_role on a phase", () => {
    const yamlText = `
phases:
  - title: "Level 1: Research"
    icon: menu_book
    human_role: "Human does the work."
    llm_role: "LLM assists."
    sections:
      - title: Section A
        items:
          - label: Item one
`;
    const doc = parseJourneyYaml(yamlText);
    expect(doc.phases[0]!.humanRole).toBe("Human does the work.");
    expect(doc.phases[0]!.llmRole).toBe("LLM assists.");
  });

  it("supports nested item children for itemId paths", () => {
    const yamlText = `
phases:
  - title: "Level 1: Research"
    icon: menu_book
    sections:
      - title: Parent section
        items:
          - label: Outer
            children:
              - label: Inner
`;

    const doc = parseJourneyYaml(yamlText);
    const outer = doc.phases[0]!.sections[0]!.items[0]!;
    const inner = outer.children![0]!;
    expect(inner.itemId).toContain("outer");
    expect(inner.itemId).toContain("inner");
  });

  it("requires icon on each phase", () => {
    const yamlText = `
phases:
  - title: "Level 1: Research"
    sections:
      - title: Section A
        items:
          - label: Item one
`;
    expect(() => parseJourneyYaml(yamlText)).toThrow(/icon is required/);
  });

  it("rejects unknown icon keys", () => {
    const yamlText = `
phases:
  - title: "Level 1: Research"
    icon: not_a_registered_icon
    sections:
      - title: Section A
        items:
          - label: Item one
`;
    expect(() => parseJourneyYaml(yamlText)).toThrow(/unknown icon/);
  });
});
