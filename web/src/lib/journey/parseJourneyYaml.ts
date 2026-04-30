import { parse as parseYaml } from "yaml";

import { slugify } from "@/lib/text/slugify";
import type { JourneyDoc, JourneyItem, JourneyPhase, JourneySection } from "@/lib/journey/types";

type ParsedLevelHeading = { title: string; levelNumber: number; name: string } | null;

function parseLevelHeading(headingText: string): ParsedLevelHeading {
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

function assertRecord(value: unknown, ctx: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${ctx}: expected an object`);
  }
  return value as Record<string, unknown>;
}

function assertString(value: unknown, ctx: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${ctx}: expected a non-empty string`);
  }
  return value.trim();
}

function buildItems(phaseId: string, pathPrefix: string[], rawItems: unknown, ctx: string): JourneyItem[] {
  if (!Array.isArray(rawItems)) {
    throw new Error(`${ctx}: "items" must be an array`);
  }

  return rawItems.map((raw, i) => {
    const itemCtx = `${ctx}[${i}]`;
    const obj = assertRecord(raw, itemCtx);
    const label = assertString(obj.label, `${itemCtx}.label`);
    const path = [...pathPrefix, label];
    const item: JourneyItem = {
      itemId: makeItemId(phaseId, path),
      label,
    };

    if (obj.children !== undefined && obj.children !== null) {
      if (!Array.isArray(obj.children)) {
        throw new Error(`${itemCtx}.children must be an array`);
      }
      item.children = buildItems(phaseId, path, obj.children, `${itemCtx}.children`);
    }

    return item;
  });
}

function parseSections(phaseId: string, rawSections: unknown, ctx: string): JourneySection[] {
  if (!Array.isArray(rawSections)) {
    throw new Error(`${ctx}: "sections" must be an array`);
  }

  return rawSections.map((raw, i) => {
    const secCtx = `${ctx}[${i}]`;
    const obj = assertRecord(raw, secCtx);
    const title = assertString(obj.title, `${secCtx}.title`);
    const items = buildItems(phaseId, [title], obj.items, `${secCtx}.items`);
    return { title, items };
  });
}

export function parseJourneyYaml(yamlText: string): JourneyDoc {
  const root = parseYaml(yamlText) as unknown;
  const doc = assertRecord(root, "Journey YAML root");

  if (!Array.isArray(doc.phases)) {
    throw new Error('Journey YAML must have a top-level "phases" array');
  }

  const phases: JourneyPhase[] = doc.phases.map((raw, i) => {
    const phaseCtx = `phases[${i}]`;
    const obj = assertRecord(raw, phaseCtx);
    const title = assertString(obj.title, `${phaseCtx}.title`);
    const parsed = parseLevelHeading(title);
    if (!parsed) {
      throw new Error(
        `${phaseCtx}.title must match "Level N: Name", "Phase N: Name", or "Step N: Name" (got ${JSON.stringify(title)})`,
      );
    }

    const phaseId = `phase-${slugify(parsed.name)}`;
    let humanRole: string | undefined;
    if (obj.human_role !== undefined && obj.human_role !== null) {
      humanRole = assertString(obj.human_role, `${phaseCtx}.human_role`);
    }
    let llmRole: string | undefined;
    if (obj.llm_role !== undefined && obj.llm_role !== null) {
      llmRole = assertString(obj.llm_role, `${phaseCtx}.llm_role`);
    }

    const sections = parseSections(phaseId, obj.sections, `${phaseCtx}.sections`);
    return { phaseId, title: parsed.title, humanRole, llmRole, sections };
  });

  if (phases.length === 0) {
    throw new Error('Journey YAML "phases" array must not be empty');
  }

  return { phases };
}
