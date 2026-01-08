import type { Mapping, Participant } from "@/domain/sessions/types";
import type { SessionJourneyModel } from "@/lib/session/sessionContentModel";

export type PhaseGhosts = {
  phaseId: string;
  title: string;
  // participantId -> how many section toggles are ON for that participant in this phase
  ghostsByParticipantId: Map<string, number>;
};

export function computeGhostsByPhase({
  model,
  participants,
  mappings,
}: {
  model: SessionJourneyModel;
  participants: Participant[];
  mappings: Mapping[];
}): {
  phases: PhaseGhosts[];
  participantIdToColor: Map<string, string | null>;
} {
  const participantIdToColor = new Map<string, string | null>();
  const knownParticipantIds = new Set<string>();
  for (const p of participants) {
    knownParticipantIds.add(p.id);
    participantIdToColor.set(p.id, p.avatarColor?.trim() ? p.avatarColor : null);
  }

  // Build per-phase set of toggle targets (section rows only).
  const sectionIdsByPhase = new Map<string, Set<string>>();
  const phaseTitle = new Map<string, string>();
  for (const phase of model.phases) {
    phaseTitle.set(phase.phaseId, phase.title);
    const set = new Set<string>();
    for (const row of phase.rows) if (row.type === "section") set.add(row.itemId);
    sectionIdsByPhase.set(phase.phaseId, set);
  }

  // Fast lookup: section itemId -> phaseId (only for section rows).
  const sectionIdToPhaseId = new Map<string, string>();
  for (const [phaseId, set] of sectionIdsByPhase.entries()) {
    for (const sectionId of set) sectionIdToPhaseId.set(sectionId, phaseId);
  }

  const ghostsByPhaseId = new Map<string, Map<string, number>>();

  for (const m of mappings) {
    if (!m.isDoing) continue;
    if (!knownParticipantIds.has(m.participantId)) continue;
    const phaseId = sectionIdToPhaseId.get(m.itemId);
    if (!phaseId) continue; // ignore bullet-level itemIds; we only count section toggles

    const byParticipant = ghostsByPhaseId.get(phaseId) ?? new Map<string, number>();
    byParticipant.set(m.participantId, (byParticipant.get(m.participantId) ?? 0) + 1);
    ghostsByPhaseId.set(phaseId, byParticipant);
  }

  const phases: PhaseGhosts[] = model.phases.map((p) => ({
    phaseId: p.phaseId,
    title: p.title,
    ghostsByParticipantId: ghostsByPhaseId.get(p.phaseId) ?? new Map<string, number>(),
  }));

  return { phases, participantIdToColor };
}

