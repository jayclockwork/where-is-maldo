import type { JourneyDoc, JourneyItem, JourneyPhase } from "@/lib/journey/types";

export type SessionRow =
  | { type: "section"; id: string; label: string }
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
    const sectionId = `${phase.phaseId}__section__${section.title}`;
    out.push({ type: "section", id: sectionId, label: section.title });
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


