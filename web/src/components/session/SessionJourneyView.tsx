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
import { buildSessionJourneyModel, type SessionRow } from "@/lib/session/sessionContentModel";
import { launchConfetti } from "@/ui/effects/confetti";
import { PhaseLevelTitle } from "@/components/journey/PhaseLevelTitle";

type PhaseRenderNode =
  | { type: "section"; row: Extract<SessionRow, { type: "section" }>; nextIsSection: boolean }
  | { type: "items"; rows: Extract<SessionRow, { type: "item" }>[]; followedBySection: boolean };

/** Groups flat phase rows into section headers and bullet lists for layout. */
export function buildPhaseRenderNodes(rows: SessionRow[]): PhaseRenderNode[] {
  const nodes: PhaseRenderNode[] = [];
  let i = 0;
  while (i < rows.length) {
    const row = rows[i];
    if (row.type !== "section") {
      i += 1;
      continue;
    }
    const next = rows[i + 1];
    nodes.push({ type: "section", row, nextIsSection: next?.type === "section" });
    i += 1;
    const itemRows: Extract<SessionRow, { type: "item" }>[] = [];
    while (i < rows.length && rows[i].type === "item") {
      itemRows.push(rows[i] as Extract<SessionRow, { type: "item" }>);
      i += 1;
    }
    if (itemRows.length) {
      const nextAfter = rows[i];
      nodes.push({
        type: "items",
        rows: itemRows,
        followedBySection: nextAfter?.type === "section",
      });
    }
  }
  return nodes;
}

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
            <Box sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              <PhaseLevelTitle
                rawTitle={phase.title}
                sx={{ fontWeight: 900, minWidth: 0 }}
                suffix={
                  completedPhaseIds.has(phase.phaseId) ? (
                    <Box component="span" aria-hidden sx={{ ml: 1 }}>
                      ✅
                    </Box>
                  ) : null
                }
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ py: 1.25 }}>
            <Stack spacing={1.25}>
              {phase.humanRole || phase.llmRole ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    columnGap: 1,
                    rowGap: 1,
                    alignItems: "start",
                  }}
                >
                  {phase.humanRole ? (
                    <>
                      <Chip
                        label="Human role"
                        size="small"
                        sx={{
                          justifySelf: "center",
                          mt: 0.25,
                          bgcolor: "rgba(245,196,0,0.25)",
                          color: "text.primary",
                        }}
                      />
                      <Typography variant="body1" component="div" sx={{ minWidth: 0, mt: 0.25 }}>
                        {phase.humanRole}
                      </Typography>
                    </>
                  ) : null}
                  {phase.llmRole ? (
                    <>
                      <Chip
                        label="LLM role"
                        size="small"
                        sx={{
                          justifySelf: "center",
                          mt: 0.25,
                          bgcolor: "rgba(245,196,0,0.25)",
                          color: "text.primary",
                        }}
                      />
                      <Typography variant="body1" component="div" sx={{ minWidth: 0, mt: 0.25 }}>
                        {phase.llmRole}
                      </Typography>
                    </>
                  ) : null}
                </Box>
              ) : null}

              <Stack spacing={0.25}>
                {buildPhaseRenderNodes(phase.rows).map((node) => {
                  if (node.type === "section") {
                    const row = node.row;
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
                          mb: node.nextIsSection ? SECTION_GROUP_GAP_Y : 0,
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

                  // Bullet rows: informational list under each section heading (toggles stay on headings).
                  return (
                    <Fragment key={`items-${node.rows[0].itemId}`}>
                      <Stack
                        component="ul"
                        spacing={0.75}
                        sx={{ pl: 4, mb: 0, mt: 0, listStylePosition: "outside" }}
                      >
                        {node.rows.map((row) => (
                          <Box
                            component="li"
                            key={row.itemId}
                            sx={{
                              listStyle: "disc",
                              py: 0.25,
                              ml: row.depth > 1 ? (row.depth - 1) * 2 : 0,
                            }}
                          >
                            <Typography variant="body2" component="span" sx={{ color: "text.secondary" }}>
                              {row.label}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                      {node.followedBySection ? (
                        <Box
                          aria-hidden
                          sx={{
                            height: (theme) => theme.spacing(SECTION_GROUP_GAP_Y),
                          }}
                        />
                      ) : null}
                    </Fragment>
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


