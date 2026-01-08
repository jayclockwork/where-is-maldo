import type { Mapping, Participant } from "@/domain/sessions/types";
import type { SessionJourneyModel } from "@/lib/session/sessionContentModel";

export type WallboardPhaseStat = {
  phaseId: string;
  title: string;
  participantCountDoing: number;
};

export type WallboardTopItem = {
  itemId: string;
  label: string;
  participantCountDoing: number;
  phaseId: string | null;
};

export function computeWallboardStats({
  model,
  participants,
  mappings,
  topN = 8,
}: {
  model: SessionJourneyModel;
  participants: Participant[];
  mappings: Mapping[];
  topN?: number;
}): {
  participantCount: number;
  phases: WallboardPhaseStat[];
  topItems: WallboardTopItem[];
  maxPhaseCount: number;
} {
  const participantCount = participants.length;
  const knownParticipantIds = new Set(participants.map((p) => p.id));

  const itemIdToPhaseId = new Map<string, string>();
  const sectionItemIdToLabel = new Map<string, string>();

  for (const phase of model.phases) {
    for (const row of phase.rows) {
      // Prefer first mapping if duplicates exist (shouldn't).
      if (!itemIdToPhaseId.has(row.itemId)) itemIdToPhaseId.set(row.itemId, phase.phaseId);
      if (row.type === "section" && !sectionItemIdToLabel.has(row.itemId)) sectionItemIdToLabel.set(row.itemId, row.label);
    }
  }

  const phaseToParticipantIds = new Map<string, Set<string>>();
  const itemToParticipantIds = new Map<string, Set<string>>();

  for (const m of mappings) {
    if (!m.isDoing) continue;
    if (!knownParticipantIds.has(m.participantId)) continue;

    const phaseId = itemIdToPhaseId.get(m.itemId);
    if (phaseId) {
      const set = phaseToParticipantIds.get(phaseId) ?? new Set<string>();
      set.add(m.participantId);
      phaseToParticipantIds.set(phaseId, set);
    }

    const itemSet = itemToParticipantIds.get(m.itemId) ?? new Set<string>();
    itemSet.add(m.participantId);
    itemToParticipantIds.set(m.itemId, itemSet);
  }

  const phases: WallboardPhaseStat[] = model.phases.map((p) => ({
    phaseId: p.phaseId,
    title: p.title,
    participantCountDoing: phaseToParticipantIds.get(p.phaseId)?.size ?? 0,
  }));

  const maxPhaseCount = Math.max(0, ...phases.map((p) => p.participantCountDoing));

  const topItems: WallboardTopItem[] = Array.from(sectionItemIdToLabel.entries())
    .map(([itemId, label]) => {
      const phaseId = itemIdToPhaseId.get(itemId) ?? null;
      return {
        itemId,
        label,
        participantCountDoing: itemToParticipantIds.get(itemId)?.size ?? 0,
        phaseId,
      };
    })
    .filter((x) => x.participantCountDoing > 0)
    .sort((a, b) => b.participantCountDoing - a.participantCountDoing || a.label.localeCompare(b.label))
    .slice(0, topN);

  return { participantCount, phases, topItems, maxPhaseCount };
}

