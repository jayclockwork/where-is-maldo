import type { Mapping } from "@/domain/sessions/types";
import type { JourneyDoc } from "@/lib/journey/types";
import { buildSessionJourneyModel } from "@/lib/session/sessionContentModel";
import { phaseTitleToStepTitle } from "@/lib/text/phaseToStep";

export type JourneyItemLocation = {
  itemId: string;
  phaseId: string;
  phaseTitle: string;
  stepTitle: string;
  label: string;
  type: "section" | "item";
};

export type ParticipantCurrentFocus = {
  itemId: string;
  updatedAt: string;
  location: JourneyItemLocation;
};

export type ParticipantProgressSummary = {
  doingItemIds: Set<string>;
  currentFocus: ParticipantCurrentFocus | null;
};

export function buildJourneyItemIndex(journey: JourneyDoc): Map<string, JourneyItemLocation> {
  const model = buildSessionJourneyModel(journey);
  const out = new Map<string, JourneyItemLocation>();
  for (const phase of model.phases) {
    const stepTitle = phaseTitleToStepTitle(phase.title);
    for (const row of phase.rows) {
      out.set(row.itemId, {
        itemId: row.itemId,
        phaseId: phase.phaseId,
        phaseTitle: phase.title,
        stepTitle,
        label: row.label,
        type: row.type,
      });
    }
  }
  return out;
}

export function summarizeParticipantProgress({
  journey,
  mappings,
  participantId,
}: {
  journey: JourneyDoc;
  mappings: Mapping[];
  participantId: string;
}): ParticipantProgressSummary {
  const index = buildJourneyItemIndex(journey);

  const doingItemIds = new Set<string>();
  let latestDoing: Mapping | null = null;

  for (const m of mappings) {
    if (m.participantId !== participantId) continue;
    if (!index.has(m.itemId)) continue;
    if (!m.isDoing) continue;

    doingItemIds.add(m.itemId);

    if (!latestDoing) {
      latestDoing = m;
      continue;
    }
    if (Date.parse(m.updatedAt) > Date.parse(latestDoing.updatedAt)) {
      latestDoing = m;
    }
  }

  if (!latestDoing) return { doingItemIds, currentFocus: null };
  const location = index.get(latestDoing.itemId);
  if (!location) return { doingItemIds, currentFocus: null };

  return {
    doingItemIds,
    currentFocus: { itemId: latestDoing.itemId, updatedAt: latestDoing.updatedAt, location },
  };
}

