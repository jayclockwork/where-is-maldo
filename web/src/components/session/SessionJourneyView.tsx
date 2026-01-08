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
import { Fragment, useMemo } from "react";
import { visuallyHidden } from "@mui/utils";

import type { JourneyDoc } from "@/lib/journey/types";
import type { Mapping } from "@/domain/sessions/types";
import { buildSessionJourneyModel } from "@/lib/session/sessionContentModel";

export function SessionJourneyView({
  journey,
  mappings,
  myParticipantId,
  onToggle,
}: {
  journey: JourneyDoc;
  mappings: Mapping[];
  myParticipantId: string;
  onToggle: (itemId: string, isDoing: boolean) => void;
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

  return (
    <Stack spacing={1.25}>
      {model.phases.map((phase) => (
        <Accordion key={phase.phaseId} defaultExpanded sx={{ bgcolor: "grey.50" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              borderBottom: "1px solid rgba(0,0,0,0.12)",
              py: 0.35,
              "& .MuiAccordionSummary-content": { my: 0.25 },
              "&.Mui-expanded": { minHeight: "unset" },
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Typography sx={{ fontWeight: 900 }}>
                <Box component="span" sx={{ color: "text.primary" }}>
                  {phase.title.split(":")[0]}:
                </Box>{" "}
                <Box component="span" sx={{ color: "secondary.main" }}>
                  {phase.title.split(":").slice(1).join(":").trim()}
                </Box>
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ py: 1.25 }}>
            <Stack spacing={1.25}>
              {phase.focus ? (
                <Box>
                  <Chip label="Focus" size="small" sx={{ mr: 1, bgcolor: "rgba(245,196,0,0.25)", color: "text.primary" }} />
                  <Typography variant="body1" component="span">
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
                          <Typography sx={{ fontWeight: 800 }}>{row.label}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {count ? <Chip size="small" label={count} /> : null}
                            <Box component="label" sx={{ display: "inline-flex", alignItems: "center" }}>
                              <Switch checked={mine} onChange={(_, checked) => onToggle(row.itemId, checked)} />
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


