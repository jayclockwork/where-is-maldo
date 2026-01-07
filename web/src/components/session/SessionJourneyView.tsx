"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useMemo } from "react";

import type { JourneyDoc, JourneyItem, JourneyPhase } from "@/lib/journey/types";
import type { Mapping } from "@/domain/sessions/types";

type FlatItem = { itemId: string; label: string; depth: number };

function flatten(items: JourneyItem[], depth: number): FlatItem[] {
  const out: FlatItem[] = [];
  for (const it of items) {
    out.push({ itemId: it.itemId, label: it.label, depth });
    if (it.children?.length) out.push(...flatten(it.children, depth + 1));
  }
  return out;
}

function phaseFlatItems(phase: JourneyPhase): FlatItem[] {
  const out: FlatItem[] = [];
  for (const section of phase.sections) {
    out.push({ itemId: `${phase.phaseId}__section__${section.title}`, label: section.title, depth: 0 });
    out.push(...flatten(section.items, 1));
  }
  return out;
}

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

  return (
    <Stack spacing={2}>
      {journey.phases.map((phase) => (
        <Accordion key={phase.phaseId} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 900 }}>
              <Box component="span" sx={{ color: "text.primary" }}>
                {phase.title.split(":")[0]}:
              </Box>{" "}
              <Box component="span" sx={{ color: "secondary.main" }}>
                {phase.title.split(":").slice(1).join(":").trim()}
              </Box>
            </Typography>
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
                {phaseFlatItems(phase).map((it) => {
                  const isSection = it.itemId.includes("__section__");
                  const count = counts.get(it.itemId) ?? 0;
                  const mine = myDoing.has(it.itemId);
                  return (
                    <Box
                      key={it.itemId}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        pl: it.depth * 2,
                        py: 0.5,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: isSection ? 800 : 400 }}>{it.label}</Typography>
                      </Box>
                      {isSection ? null : (
                        <Stack direction="row" spacing={1} alignItems="center">
                          {count ? <Chip size="small" label={count} /> : null}
                          <Switch
                            checked={mine}
                            onChange={(_, checked) => onToggle(it.itemId, checked)}
                            inputProps={{ "aria-label": `Toggle doing for ${it.label}` }}
                          />
                        </Stack>
                      )}
                    </Box>
                  );
                })}
              </Stack>

              {phase.whatToWatchFor.length ? (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                      What to watch for
                    </Typography>
                    <Stack component="ul" spacing={0.75} sx={{ pl: 2, mb: 0, mt: 0 }}>
                      {phase.whatToWatchFor.map((w) => (
                        <Box component="li" key={`${phase.phaseId}__watch__${w}`} sx={{ listStyle: "disc" }}>
                          <Typography variant="body2">{w}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </>
              ) : null}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
}


