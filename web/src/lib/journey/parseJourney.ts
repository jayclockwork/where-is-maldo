import { remark } from "remark";
import remarkParse from "remark-parse";

import { mdastToText, type MdastNode } from "@/lib/journey/mdastText";
import { slugify } from "@/lib/text/slugify";
import type { JourneyDoc, JourneyItem, JourneyPhase, JourneySection } from "@/lib/journey/types";

type HeadingNode = MdastNode & { depth?: number };

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

function parsePhaseContent(phaseId: string, phaseNodes: MdastNode[]): Pick<JourneyPhase, "focus" | "sections" | "whatToWatchFor"> {
  let focus: string | undefined;
  const sections: JourneySection[] = [];
  let whatToWatchFor: string[] = [];

  for (let i = 0; i < phaseNodes.length; i += 1) {
    const node = phaseNodes[i];

    if (!focus && node.type === "paragraph") {
      const text = mdastToText(node).trim();
      if (text.toLowerCase().startsWith("focus:")) {
        focus = text.replace(/^focus:\s*/i, "").trim();
      }
    }

    // Phase sections are represented by the first top-level list (until "What to watch for").
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

    if (node.type === "paragraph") {
      const text = mdastToText(node).trim().toLowerCase();
      if (text === "what to watch for") {
        const next = phaseNodes[i + 1];
        if (next?.type === "list") {
          whatToWatchFor = extractListItems(next, phaseId).map((x) => x.label);
        }
      }
    }
  }

  return { focus, sections, whatToWatchFor };
}

export function parseJourneyMarkdown(markdown: string): JourneyDoc {
  const tree = remark().use(remarkParse).parse(markdown) as unknown as { children: MdastNode[] };
  const nodes = tree.children ?? [];

  const phases: JourneyPhase[] = [];

  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    const heading = node as HeadingNode;
    if (heading.type !== "heading" || heading.depth !== 3) continue;

    const headingText = mdastToText(heading).trim();

    if (headingText.toLowerCase().startsWith("phase")) {
      const title = headingText;
      const phaseName = headingText.replace(/^phase\s+\d+\s*:\s*/i, "").trim();
      const phaseId = `phase-${slugify(phaseName)}`;

      const phaseNodes: MdastNode[] = [];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const n = nodes[j];
        const maybeHeading = n as HeadingNode;
        if (maybeHeading.type === "heading" && maybeHeading.depth === 3) break;
        phaseNodes.push(n);
      }

      const { focus, sections, whatToWatchFor } = parsePhaseContent(phaseId, phaseNodes);
      phases.push({ phaseId, title, focus, sections, whatToWatchFor });
      continue;
    }
  }

  return { phases };
}


