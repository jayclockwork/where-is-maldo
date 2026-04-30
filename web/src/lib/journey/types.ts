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
  humanRole?: string;
  llmRole?: string;
  sections: JourneySection[];
};

export type JourneyDoc = {
  phases: JourneyPhase[];
};


