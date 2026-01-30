"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

import { SiteAppBar } from "@/components/SiteAppBar";
import type { JourneyDoc } from "@/lib/journey/types";
import type { Mapping, Participant, Session } from "@/domain/sessions/types";
import type { JourneyItemLocation } from "@/lib/session/participantProgress";
import { buildJourneyItemIndex, summarizeParticipantProgress } from "@/lib/session/participantProgress";
import { formatRelativeTimeShort } from "@/lib/text/relativeTime";
import { upsertMapping } from "@/lib/sessions/mappings";
import { PacmanGhostSvg } from "@/components/wallboard/PacmanGhostSvg";

type SessionState = { session: Session; participants: Participant[]; mappings: Mapping[] };

type ConnectionState = "connecting" | "connected" | "reconnecting";

export default function IndividualProgressPage() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;
  const searchParams = useSearchParams();
  const adminToken = searchParams.get("token")?.trim() || null;

  const [journey, setJourney] = useState<JourneyDoc | null>(null);
  const [state, setState] = useState<SessionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conn, setConn] = useState<ConnectionState>("connecting");

  const [selectedParticipantId, setSelectedParticipantId] = useState<string>("");
  const [showAllSections, setShowAllSections] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Keep relative timestamps fresh without being noisy.
  useEffect(() => {
    const t = window.setInterval(() => setNowMs(Date.now()), 15_000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    let alive = true;
    async function load() {
      setError(null);
      const [journeyRes, stateRes] = await Promise.all([
        fetch("/api/journey", { cache: "no-store" }),
        fetch(`/api/sessions/state/${encodeURIComponent(sessionId)}`, { cache: "no-store" }),
      ]);

      if (!alive) return;

      if (!journeyRes.ok) {
        setError("Failed to load journey.");
        return;
      }
      setJourney((await journeyRes.json()) as JourneyDoc);

      if (!stateRes.ok) {
        const body = (await stateRes.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Session not found.");
        return;
      }
      setState((await stateRes.json()) as SessionState);
    }

    void load();
    return () => {
      alive = false;
    };
  }, [sessionId]);

  // Live updates (same SSE stream as the session client).
  useEffect(() => {
    const es = new EventSource(`/api/sessions/stream/${encodeURIComponent(sessionId)}`);
    es.onopen = () => setConn("connected");
    es.onerror = () => setConn("reconnecting");
    es.addEventListener("mapping_updated", (evt) => {
      const data = JSON.parse((evt as MessageEvent).data) as { type: "mapping_updated"; mapping: Mapping };
      setState((prev) => {
        if (!prev) return prev;
        return { ...prev, mappings: upsertMapping(prev.mappings, data.mapping) };
      });
    });
    es.addEventListener("results_cleared", () => {
      setState((prev) => (prev ? { ...prev, mappings: [] } : prev));
    });
    es.addEventListener("participant_joined", async () => {
      const res = await fetch(`/api/sessions/state/${encodeURIComponent(sessionId)}`, { cache: "no-store" });
      if (!res.ok) return;
      setState((await res.json()) as SessionState);
    });
    return () => es.close();
  }, [sessionId]);

  // If no selection, default to the first participant (stable + deterministic).
  useEffect(() => {
    if (!state?.participants?.length) return;
    if (selectedParticipantId && state.participants.some((p) => p.id === selectedParticipantId)) return;
    const sorted = [...state.participants].sort((a, b) => Date.parse(a.joinedAt) - Date.parse(b.joinedAt));
    setSelectedParticipantId(sorted[0]?.id ?? "");
  }, [selectedParticipantId, state?.participants]);

  const selected = useMemo(() => {
    return state?.participants.find((p) => p.id === selectedParticipantId) ?? null;
  }, [selectedParticipantId, state?.participants]);

  const journeyIndex = useMemo(() => (journey ? buildJourneyItemIndex(journey) : null), [journey]);

  const participantMappingsByItem = useMemo(() => {
    if (!state || !selectedParticipantId) return new Map<string, Mapping>();
    const out = new Map<string, Mapping>();
    for (const m of state.mappings) {
      if (m.participantId !== selectedParticipantId) continue;
      const prev = out.get(m.itemId);
      if (!prev) out.set(m.itemId, m);
      else if (Date.parse(m.updatedAt) > Date.parse(prev.updatedAt)) out.set(m.itemId, m);
    }
    return out;
  }, [selectedParticipantId, state]);

  const progress = useMemo(() => {
    if (!journey || !state || !selectedParticipantId) return null;
    return summarizeParticipantProgress({ journey, mappings: state.mappings, participantId: selectedParticipantId });
  }, [journey, selectedParticipantId, state]);

  const doingSectionsByStep = useMemo(() => {
    if (!journeyIndex || !state || !selectedParticipantId) return [];

    // Preserve journey order (phases/rows) for readability.
    // Build a stable list of sections in order:
    // We'll walk the index entries by regenerating from the underlying journey model,
    // but we already have a stable itemId -> location map (journeyIndex).
    const entries: JourneyItemLocation[] = [];
    // Note: Map preserves insertion order; buildJourneyItemIndex inserts phases/rows in order.
    for (const loc of journeyIndex.values()) {
      if (loc.type !== "section") continue;
      entries.push(loc);
    }

    const byStep = new Map<string, { stepTitle: string; phaseId: string; phaseTitle: string; sections: JourneyItemLocation[] }>();
    for (const loc of entries) {
      const key = loc.phaseId;
      const existing = byStep.get(key) ?? { stepTitle: loc.stepTitle, phaseId: loc.phaseId, phaseTitle: loc.phaseTitle, sections: [] };
      existing.sections.push(loc);
      byStep.set(key, existing);
    }

    return [...byStep.values()];
  }, [journey, journeyIndex, selectedParticipantId, state]);

  const backHref = useMemo(() => {
    const base = `/admin/${encodeURIComponent(sessionId)}`;
    return adminToken ? `${base}?token=${encodeURIComponent(adminToken)}` : base;
  }, [adminToken, sessionId]);

  return (
    <>
      <SiteAppBar showJoinSession={false} />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
              <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
                Individual View
              </Typography>
              <Chip
                color={conn === "connected" ? "success" : conn === "reconnecting" ? "warning" : "default"}
                label={conn === "connected" ? "Live" : conn === "reconnecting" ? "Reconnecting…" : "Connecting…"}
                size="small"
              />
            </Stack>
            <Typography sx={{ color: "text.secondary", mt: 1 }}>
              Select a participant to see their current “Doing” progress on the journey map.
            </Typography>
          </Box>

          {error ? (
            <Alert
              severity="error"
              action={
                <Button component={Link} href={backHref} color="inherit" size="small">
                  Back
                </Button>
              }
            >
              {error}
            </Alert>
          ) : null}

          {state ? (
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                    <Chip label={`Code: ${state.session.joinCode}`} />
                    <Chip label={`Participants: ${state.participants.length}`} />
                  </Stack>

                  <Divider />

                  <Stack spacing={1.25}>
                    <TextField
                      select
                      label="Participant"
                      value={selectedParticipantId}
                      onChange={(e) => setSelectedParticipantId(e.target.value)}
                      fullWidth
                      helperText={state.participants.length ? "Pick someone to inspect." : "No participants have joined yet."}
                    >
                      {state.participants
                        .slice()
                        .sort((a, b) => a.displayName.localeCompare(b.displayName))
                        .map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.displayName}
                          </MenuItem>
                        ))}
                    </TextField>

                    {selected ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 900 }}>
                          {selected.displayName}
                        </Typography>
                        {selected.avatarColor ? (
                          <Box sx={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden focusable="false">
                              <g transform="translate(14 14)">
                                <PacmanGhostSvg color={selected.avatarColor} size={26} />
                              </g>
                            </svg>
                          </Box>
                        ) : null}
                      </Stack>
                    ) : null}

                    <FormControlLabel
                      control={
                        <Switch checked={showAllSections} onChange={(_, checked) => setShowAllSections(checked)} />
                      }
                      label="Show all sections (including not-doing)"
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ) : null}

          {journey && state && selectedParticipantId && journeyIndex ? (
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Current focus
                  </Typography>

                  {progress?.currentFocus ? (
                    <Box>
                      <Typography sx={{ fontWeight: 900 }}>
                        {progress.currentFocus.location.stepTitle} — {progress.currentFocus.location.label}
                      </Typography>
                      <Typography sx={{ color: "text.secondary" }}>
                        Updated {formatRelativeTimeShort(nowMs - Date.parse(progress.currentFocus.updatedAt))}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography sx={{ color: "text.secondary" }}>No “Doing” selections yet.</Typography>
                  )}

                  <Divider />

                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Doing by level
                  </Typography>

                  <Stack spacing={2}>
                    {doingSectionsByStep.map((step) => {
                      const visibleSections = step.sections.filter((loc) => {
                        const m = participantMappingsByItem.get(loc.itemId);
                        const doing = m?.isDoing ?? false;
                        return showAllSections ? true : doing;
                      });

                      return (
                        <Box key={step.phaseId}>
                          <Typography sx={{ fontWeight: 900, mb: 1 }}>{step.stepTitle}</Typography>
                          {visibleSections.length ? (
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                              {visibleSections.map((loc) => {
                                const m = participantMappingsByItem.get(loc.itemId);
                                const doing = m?.isDoing ?? false;
                                return (
                                  <Chip
                                    key={loc.itemId}
                                    label={loc.label}
                                    color={doing ? "success" : "default"}
                                    variant={doing ? "filled" : "outlined"}
                                  />
                                );
                              })}
                            </Stack>
                          ) : (
                            <Typography sx={{ color: "text.secondary" }}>No sections selected in this level.</Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ) : null}

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button component={Link} href={backHref} variant="outlined">
              Back to Control Center
            </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

