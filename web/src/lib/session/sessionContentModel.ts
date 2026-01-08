import type { JourneyDoc, JourneyItem, JourneyPhase } from "@/lib/journey/types";

export type SessionRow =
  | { type: "section"; itemId: string; label: string }
  | { type: "item"; itemId: string; label: string; depth: number };

export type SessionPhaseModel = {
  phaseId: string;
  title: string;
  focus?: string;
  rows: SessionRow[];
};

export type SessionJourneyModel = {
  phases: SessionPhaseModel[];
};

function flatten(items: JourneyItem[], depth: number): SessionRow[] {
  const out: SessionRow[] = [];
  for (const it of items) {
    out.push({ type: "item", itemId: it.itemId, label: it.label, depth });
    if (it.children?.length) out.push(...flatten(it.children, depth + 1));
  }
  return out;
}

function phaseRows(phase: JourneyPhase): SessionRow[] {
  const out: SessionRow[] = [];
  for (const section of phase.sections) {
    // Section headings are the toggle targets in session mode.
    // Keep itemId stable: do not change this format without a migration plan.
    const sectionItemId = `${phase.phaseId}__section__${section.title}`;
    out.push({ type: "section", itemId: sectionItemId, label: section.title });
    out.push(...flatten(section.items, 1));
  }
  return out;
}

export function buildSessionJourneyModel(journey: JourneyDoc): SessionJourneyModel {
  return {
    phases: journey.phases.map((p) => ({
      phaseId: p.phaseId,
      title: p.title,
      focus: p.focus,
      rows: phaseRows(p),
    })),
  };
}


