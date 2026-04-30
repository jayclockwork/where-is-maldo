import type { SvgIconProps } from "@mui/material/SvgIcon";
import Assignment from "@mui/icons-material/Assignment";
import Groups from "@mui/icons-material/Groups";
import Hub from "@mui/icons-material/Hub";
import Keyboard from "@mui/icons-material/Keyboard";
import Layers from "@mui/icons-material/Layers";
import MenuBook from "@mui/icons-material/MenuBook";
import SmartToy from "@mui/icons-material/SmartToy";

import type { SvgIconComponent } from "@mui/material";

/** Maps each journey level’s stable `phaseId` to an icon. Unknown ids use `Layers`. */
const PHASE_ICONS: Record<string, SvgIconComponent> = {
  "phase-reference": MenuBook,
  "phase-inline-assist": Keyboard,
  "phase-pair-programmer": Groups,
  "phase-delegator": Assignment,
  "phase-agent-director": SmartToy,
  "phase-conductor": Hub,
};

export function getJourneyPhaseIconComponent(phaseId: string): SvgIconComponent {
  return PHASE_ICONS[phaseId] ?? Layers;
}

export function JourneyPhaseIcon({ phaseId, ...props }: { phaseId: string } & SvgIconProps) {
  const Icon = getJourneyPhaseIconComponent(phaseId);
  return <Icon aria-hidden fontSize="small" {...props} />;
}
