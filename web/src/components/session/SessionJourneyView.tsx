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
import { useMemo } from "react";

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
    <Stack spacing={2}>
      {model.phases.map((phase) => (
        <Accordion key={phase.phaseId} defaultExpanded sx={{ bgcolor: "grey.50" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              borderBottom: "1px solid rgba(0,0,0,0.12)",
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
          <AccordionDetails>
            <Stack spacing={2}>
              {phase.focus ? (
                <Box>
                  <Chip label="Focus" size="small" sx={{ mr: 1, bgcolor: "rgba(245,196,0,0.25)", color: "text.primary" }} />
                  <Typography variant="body1" component="span">
                    {phase.focus}
                  </Typography>
                </Box>
              ) : null}

              <Stack spacing={1}>
                {phase.rows.map((row) => {
                  if (row.type === "section") {
                    return (
                      <Box key={row.id} sx={{ py: 0.5 }}>
                        <Typography sx={{ fontWeight: 800 }}>{row.label}</Typography>
                      </Box>
                    );
                  }

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
                        pl: row.depth * 2,
                        py: 0.5,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography>{row.label}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {count ? <Chip size="small" label={count} /> : null}
                        <Switch
                          checked={mine}
                          onChange={(_, checked) => onToggle(row.itemId, checked)}
                          inputProps={{ "aria-label": `Toggle doing for ${row.label}` }}
                        />
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>

              {/* Intentionally hiding "What to watch for" in session mode as well. */}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
}


