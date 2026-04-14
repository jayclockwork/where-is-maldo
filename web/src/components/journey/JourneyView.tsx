"use client";

import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Container,
  Fab,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useEffect, useState } from "react";

import type { JourneyDoc, JourneyItem } from "@/lib/journey/types";
import { CopyLinkButton } from "@/components/journey/CopyLinkButton";
import { phaseTitleToStepTitle } from "@/lib/text/phaseToStep";

function ItemsList({ items, depth = 0 }: { items: JourneyItem[]; depth?: number }) {
  return (
    <Stack
      component="ul"
      spacing={0.75}
      // Add space after the last item in each section list (but not after nested lists).
      sx={{ pl: depth ? 3 : 2, mb: 0, mt: 0 }}
    >
      {items.map((it) => (
        <Box component="li" key={it.itemId} sx={{ listStyle: "disc" }}>
          <Typography variant="body1" sx={{ display: "inline" }}>
            {it.label}
          </Typography>
          {it.children?.length ? <ItemsList items={it.children} depth={depth + 1} /> : null}
        </Box>
      ))}
    </Stack>
  );
}

export function JourneyView({ journey }: { journey: JourneyDoc }) {
  const { phases } = journey;
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(phases.map((p) => [p.phaseId, false])),
  );

  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 500);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box
        sx={{
          minWidth: 0,
          // Keep the journey content comfortably readable on wide displays.
          // ~half-screen on desktop, full width on mobile.
          maxWidth: { xs: "100%", md: 720 },
          mx: "auto",
        }}
      >
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h3" component="h1">
            Levels of LLM Adoption
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Use this as a loose guide for evaluating your own software engineering team’s LLM adoption journey.
          </Typography>
        </Stack>

        <Stack spacing={2.5}>
          {phases.map((phase) => (
            <Accordion
              key={phase.phaseId}
              id={phase.phaseId}
              expanded={!!expanded[phase.phaseId]}
              onChange={(_, next) => setExpanded((p) => ({ ...p, [phase.phaseId]: next }))}
                sx={{ scrollMarginTop: 96, bgcolor: "grey.50" }}
            >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "text.primary" }} />}
                  sx={{
                    borderBottom: "1px solid rgba(0,0,0,0.12)",
                    bgcolor: "secondary.main",
                    color: "text.primary",
                    "&.Mui-expanded": { minHeight: "unset" },
                  }}
                >
                <Box sx={{ width: "100%", minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      {phaseTitleToStepTitle(phase.title)}
                    </Typography>
                    <CopyLinkButton anchorId={phase.phaseId} />
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Stack spacing={2}>
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

                  {phase.sections.map((section) => (
                    <Box key={`${phase.phaseId}:${section.title}`}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {section.title}
                      </Typography>
                      <ItemsList items={section.items} />
                    </Box>
                  ))}

                    {/* Intentionally hiding "What to watch for" on the Journey page UI. */}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}

          {/* Quick self-check intentionally omitted (per current product direction). */}
        </Stack>
      </Box>

      {showTop ? (
        <Fab
          color="primary"
          aria-label="Back to top"
          sx={{ position: "fixed", bottom: 24, right: 24 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      ) : null}
    </Container>
  );
}


