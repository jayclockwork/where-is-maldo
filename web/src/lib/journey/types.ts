import type { JourneyPhaseIconKey } from "@/lib/journey/journeyPhaseIcons";

export type JourneyItem = {
  itemId: string;
  label: string;
  children?: JourneyItem[];
};

export type JourneySection = {
  title: string;
  items: JourneyItem[];
};

export type JourneyPhase = {
  phaseId: string;
  title: string;
  /** Declared in `docs/journey.yaml` as `icon` (see `JOURNEY_PHASE_ICONS`). */
  icon: JourneyPhaseIconKey;
  humanRole?: string;
  llmRole?: string;
  sections: JourneySection[];
};

export type JourneyDoc = {
  phases: JourneyPhase[];
};
