import type { Mapping, Participant } from "@/domain/sessions/types";
import type { JourneyDoc } from "@/lib/journey/types";
import { buildSessionJourneyModel } from "@/lib/session/sessionContentModel";
import { phaseTitleToStepTitle } from "@/lib/text/phaseToStep";

export type LevelAdoptionRow = {
  phaseId: string;
  stepTitle: string;
  participantsTotal: number;
  participantsWithAnyDoing: number;
  participantsCompleted: number;
};

export function computeAdoptionByLevel({
  journey,
  participants,
  mappings,
}: {
  journey: JourneyDoc;
  participants: Participant[];
  mappings: Mapping[];
}): LevelAdoptionRow[] {
  const model = buildSessionJourneyModel(journey);
  const participantsTotal = participants.length;

  const participantToDoing = new Map<string, Set<string>>();
  for (const m of mappings) {
    if (!m.isDoing) continue;
    const set = participantToDoing.get(m.participantId) ?? new Set<string>();
    set.add(m.itemId);
    participantToDoing.set(m.participantId, set);
  }

  const rows: LevelAdoptionRow[] = [];
  for (const phase of model.phases) {
    const sectionIds = phase.rows.filter((r) => r.type === "section").map((r) => r.itemId);
    const stepTitle = phaseTitleToStepTitle(phase.title);

    let participantsWithAnyDoing = 0;
    let participantsCompleted = 0;

    for (const p of participants) {
      const doing = participantToDoing.get(p.id) ?? new Set<string>();
      const any = sectionIds.some((id) => doing.has(id));
      if (any) participantsWithAnyDoing += 1;

      const complete = sectionIds.length ? sectionIds.every((id) => doing.has(id)) : false;
      if (complete) participantsCompleted += 1;
    }

    rows.push({ phaseId: phase.phaseId, stepTitle, participantsTotal, participantsWithAnyDoing, participantsCompleted });
  }

  return rows;
}

