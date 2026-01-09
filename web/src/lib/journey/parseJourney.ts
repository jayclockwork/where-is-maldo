import { remark } from "remark";
import remarkParse from "remark-parse";

import { mdastToText, type MdastNode } from "@/lib/journey/mdastText";
import { slugify } from "@/lib/text/slugify";
import type { JourneyDoc, JourneyItem, JourneyPhase, JourneySection } from "@/lib/journey/types";

type HeadingNode = MdastNode & { depth?: number };

type ParsedLevelHeading = { title: string; levelNumber: number; name: string } | null;

function parseLevelHeading(headingText: string): ParsedLevelHeading {
  // Support historical label variants so the markdown doc can evolve without breaking parsing.
  // Examples:
  // - "Phase 1: Research"
  // - "Step 1: Research"
  // - "Level 1: Research"
  const m = headingText.match(/^(phase|step|level)\s+(\d+)\s*:\s*(.+)$/i);
  if (!m) return null;
  const levelNumber = Number(m[2]);
  const name = (m[3] ?? "").trim();
  if (!Number.isFinite(levelNumber) || levelNumber <= 0 || !name) return null;
  return { title: headingText, levelNumber, name };
}

function makeItemId(phaseId: string, pathLabels: string[]) {
  const slugs = pathLabels.map((p) => slugify(p));
  return [phaseId, ...slugs].filter(Boolean).join("__");
}

function extractListItems(listNode: MdastNode, phaseId: string, prefixPath: string[] = []): JourneyItem[] {
  if (listNode.type !== "list" || !listNode.children) return [];

  return listNode.children
    .filter((c) => c.type === "listItem")
    .map((listItem) => {
      const itemChildren = listItem.children ?? [];
      const firstParagraph = itemChildren.find((c) => c.type === "paragraph") ?? itemChildren[0];
      const label = firstParagraph ? mdastToText(firstParagraph).trim() : "";

      const nestedList = itemChildren.find((c) => c.type === "list");
      const path = [...prefixPath, label];
      const item: JourneyItem = {
        itemId: makeItemId(phaseId, path),
        label,
      };

      if (nestedList) {
        item.children = extractListItems(nestedList, phaseId, path);
      }

      return item;
    });
}

function parsePhaseContent(phaseId: string, phaseNodes: MdastNode[]): Pick<JourneyPhase, "focus" | "sections"> {
  let focus: string | undefined;
  const sections: JourneySection[] = [];

  for (let i = 0; i < phaseNodes.length; i += 1) {
    const node = phaseNodes[i];

    if (!focus && node.type === "paragraph") {
      const text = mdastToText(node).trim();
      if (text.toLowerCase().startsWith("focus:")) {
        focus = text.replace(/^focus:\s*/i, "").trim();
      }
    }

    // Phase sections are represented by the first top-level list.
    if (node.type === "list" && sections.length === 0) {
      const sectionItems = extractListItems(node, phaseId);
      // Each top-level bullet is a section; its children become section items.
      for (const s of sectionItems) {
        sections.push({
          title: s.label,
          items: s.children ?? [],
        });
      }
    }

  }

  return { focus, sections };
}

export function parseJourneyMarkdown(markdown: string): JourneyDoc {
  const tree = remark().use(remarkParse).parse(markdown) as unknown as { children: MdastNode[] };
  const nodes = tree.children ?? [];

  const phases: JourneyPhase[] = [];

  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    const heading = node as HeadingNode;
    if (heading.type !== "heading") continue;
    // Historically we used ###, but accept ## too to make the doc less fragile.
    if (heading.depth !== 2 && heading.depth !== 3) continue;

    const headingText = mdastToText(heading).trim();

    const parsed = parseLevelHeading(headingText);
    if (parsed) {
      const title = parsed.title;
      const phaseName = parsed.name;
      const phaseId = `phase-${slugify(phaseName)}`;

      const phaseNodes: MdastNode[] = [];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const n = nodes[j];
        const maybeHeading = n as HeadingNode;
        if (
          maybeHeading.type === "heading" &&
          (maybeHeading.depth === 2 || maybeHeading.depth === 3) &&
          parseLevelHeading(mdastToText(maybeHeading).trim())
        )
          break;
        phaseNodes.push(n);
      }

      const { focus, sections } = parsePhaseContent(phaseId, phaseNodes);
      phases.push({ phaseId, title, focus, sections });
      continue;
    }
  }

  if (phases.length === 0) {
    throw new Error(
      'No levels found in journey markdown. Expected headings like "### Level 1: Research" (or "Phase"/"Step").',
    );
  }

  return { phases };
}


