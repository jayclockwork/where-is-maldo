import type { SvgIconComponent } from "@mui/material";
import Assignment from "@mui/icons-material/Assignment";
import Groups from "@mui/icons-material/Groups";
import Hub from "@mui/icons-material/Hub";
import Keyboard from "@mui/icons-material/Keyboard";
import MenuBook from "@mui/icons-material/MenuBook";
import SmartToy from "@mui/icons-material/SmartToy";

/**
 * Keys must match `icon` on each phase in `docs/journey.yaml`.
 * Add a new MUI icon import here when you introduce a new key.
 */
export const JOURNEY_PHASE_ICONS = {
  menu_book: MenuBook,
  keyboard: Keyboard,
  groups: Groups,
  assignment: Assignment,
  smart_toy: SmartToy,
  hub: Hub,
} as const satisfies Record<string, SvgIconComponent>;

export type JourneyPhaseIconKey = keyof typeof JOURNEY_PHASE_ICONS;

const ALLOWED = Object.keys(JOURNEY_PHASE_ICONS).sort().join(", ");

export function assertJourneyPhaseIconKey(value: string, ctx: string): JourneyPhaseIconKey {
  if (value in JOURNEY_PHASE_ICONS) {
    return value as JourneyPhaseIconKey;
  }
  throw new Error(
    `${ctx}: unknown icon ${JSON.stringify(value)}. Use one of: ${ALLOWED}`,
  );
}

export function getJourneyPhaseIconComponent(key: JourneyPhaseIconKey): SvgIconComponent {
  return JOURNEY_PHASE_ICONS[key];
}
