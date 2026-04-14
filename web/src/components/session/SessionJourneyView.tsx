"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { Fragment, useEffect, useMemo, useRef } from "react";
import { visuallyHidden } from "@mui/utils";

import type { JourneyDoc } from "@/lib/journey/types";
import type { Mapping } from "@/domain/sessions/types";
import { buildSessionJourneyModel } from "@/lib/session/sessionContentModel";
import { launchConfetti } from "@/ui/effects/confetti";
import { phaseTitleToStepTitle } from "@/lib/text/phaseToStep";

export function SessionJourneyView({
  journey,
  mappings,
  myParticipantId,
  onToggle,
  togglesDisabled = false,
}: {
  journey: JourneyDoc;
  mappings: Mapping[];
  myParticipantId: string;
  onToggle: (itemId: string, isDoing: boolean) => void;
  togglesDisabled?: boolean;
}) {
  // Intentional break between section groups (after the last bullet in a section list).
  // This is the “How technologies compare and contrast” → “Coding research” gap.
  const SECTION_GROUP_GAP_Y = 2;

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of mappings) {
      if (!m.isDoing) continue;
      map.set(m.itemId, (map.get(m.itemId) ?? 0) + 1);
    }
    return map;
  }, [mappings]);

  const myDoing = useMemo(() => {
    const set = new Set<string>();
    for (const m of mappings) {
      if (m.participantId === myParticipantId && m.isDoing) set.add(m.itemId);
    }
    return set;
  }, [mappings, myParticipantId]);

  const model = useMemo(() => buildSessionJourneyModel(journey), [journey]);

  const completedPhaseIds = useMemo(() => {
    const out = new Set<string>();
    for (const phase of model.phases) {
      const sectionIds = phase.rows.filter((r) => r.type === "section").map((r) => r.itemId);
      if (!sectionIds.length) continue;
      const allChecked = sectionIds.every((id) => myDoing.has(id));
      if (allChecked) out.add(phase.phaseId);
    }
    return out;
  }, [model.phases, myDoing]);

  const didMountRef = useRef(false);
  const prevCompletedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      prevCompletedRef.current = completedPhaseIds;
      return;
    }

    // Fire once per phase when it transitions into "complete" for me.
    for (const phaseId of completedPhaseIds) {
      if (!prevCompletedRef.current.has(phaseId)) {
        launchConfetti();
      }
    }
    prevCompletedRef.current = completedPhaseIds;
  }, [completedPhaseIds]);

  return (
    <Stack spacing={1.25}>
      {model.phases.map((phase) => (
        // A phase is “complete” for me when every section heading in the phase is toggled on.
        // (Bullets are informational and not toggle targets.)
        <Accordion key={phase.phaseId} defaultExpanded sx={{ bgcolor: "grey.50" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "text.primary" }} />}
            sx={{
              borderBottom: "1px solid rgba(0,0,0,0.12)",
              bgcolor: "secondary.main",
              py: 0.35,
              color: "text.primary",
              "& .MuiAccordionSummary-content": { my: 0.25 },
              "&.Mui-expanded": { minHeight: "unset" },
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Typography sx={{ fontWeight: 900 }}>
                {phaseTitleToStepTitle(phase.title)}
                {completedPhaseIds.has(phase.phaseId) ? (
                  <Box component="span" aria-hidden sx={{ ml: 1 }}>
                    ✅
                  </Box>
                ) : null}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ py: 1.25 }}>
            <Stack spacing={1.25}>
              {phase.focus ? (
                <Box sx={{ display: "flex", alignItems: "flex-start", columnGap: 1 }}>
                  <Chip
                    label="Who Drives"
                    size="small"
                    sx={{
                      flexShrink: 0,
                      mt: 0.25,
                      bgcolor: "rgba(245,196,0,0.25)",
                      color: "text.primary",
                    }}
                  />
                  <Typography variant="body1" component="div" sx={{ flex: "1 1 auto", minWidth: 0 }}>
                    {phase.focus}
                  </Typography>
                </Box>
              ) : null}

              <Stack spacing={0.25}>
                {(() => {
                  return phase.rows.map((row, idx) => {
                    const nextRow = phase.rows[idx + 1];
                    // Add breathing room AFTER the last item in a section group
                    // (i.e., the row immediately before the next section heading).
                    const isEndOfSectionGroup = nextRow?.type === "section";

                    if (row.type === "section") {
                      const count = counts.get(row.itemId) ?? 0;
                      const mine = myDoing.has(row.itemId);

                      return (
                        <Box
                          key={row.itemId}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                            py: 0.5,
                            mb: isEndOfSectionGroup ? SECTION_GROUP_GAP_Y : 0,
                          }}
                        >
                          <Typography sx={{ fontWeight: 800 }}>
                            {row.label}
                            {mine ? (
                              <Box component="span" aria-hidden sx={{ ml: 1 }}>
                                ✅
                              </Box>
                            ) : null}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {count ? <Chip size="small" label={count} /> : null}
                            <Box component="label" sx={{ display: "inline-flex", alignItems: "center" }}>
                              <Switch
                                checked={mine}
                                disabled={togglesDisabled}
                                onChange={(_, checked) => onToggle(row.itemId, checked)}
                              />
                              <Box component="span" sx={visuallyHidden}>
                                Toggle doing for {row.label}
                              </Box>
                            </Box>
                          </Stack>
                        </Box>
                      );
                    }

                    // Bullet rows are informational in session mode; toggles live on the section headings.
                    return (
                      <Fragment key={row.itemId}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                            pl: row.depth * 2,
                            py: 0.25,
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                              {row.label}
                            </Typography>
                          </Box>
                        </Box>
                        {isEndOfSectionGroup ? (
                          <Box
                            aria-hidden
                            sx={{
                              height: (theme) => theme.spacing(SECTION_GROUP_GAP_Y),
                            }}
                          />
                        ) : null}
                      </Fragment>
                    );
                  });
                })()}
              </Stack>

              {/* Intentionally hiding "What to watch for" in session mode as well. */}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
}


