import { Box, Typography, type TypographyProps } from "@mui/material";
import type { ReactNode } from "react";

import { phaseTitleToStepTitle, splitPhaseTitleForDisplay } from "@/lib/text/phaseToStep";

const prefixSx = {
  color: "text.secondary",
  fontWeight: 600,
} as const;

export function PhaseLevelTitle({
  rawTitle,
  suffix = null,
  ...typographyProps
}: { rawTitle: string; suffix?: ReactNode } & TypographyProps) {
  const stepTitle = phaseTitleToStepTitle(rawTitle);
  const parts = splitPhaseTitleForDisplay(stepTitle);

  if (!parts) {
    return (
      <Typography {...typographyProps}>
        {stepTitle}
        {suffix}
      </Typography>
    );
  }

  return (
    <Typography {...typographyProps}>
      <Box component="span" sx={prefixSx}>{`${parts.prefix}: `}</Box>
      <Box component="span" sx={{ pl: 0.25 }}>{parts.name}</Box>
      {suffix}
    </Typography>
  );
}
