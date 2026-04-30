"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";

import { SiteAppBar } from "@/components/SiteAppBar";
import type { JourneyDoc } from "@/lib/journey/types";
import type { Mapping, Participant, Session } from "@/domain/sessions/types";
import { upsertMapping } from "@/lib/sessions/mappings";
import { buildSessionJourneyModel } from "@/lib/session/sessionContentModel";
import { computeGhostsByPhase } from "@/lib/wallboard/ghosts";
import { buildGhostLoopPath, buildMazeSvgPaths, generateMaze } from "@/lib/wallboard/maze";
import { PacmanGhostSvg } from "@/components/wallboard/PacmanGhostSvg";
import { PhaseLevelTitle } from "@/components/journey/PhaseLevelTitle";
import { formatRelativeTimeShort } from "@/lib/text/relativeTime";

type ConnectionState = "connecting" | "connected" | "reconnecting";

export default function WallboardGhostsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const sessionId = params.id;
  const searchParams = useSearchParams();
  const kiosk = searchParams.get("kiosk") === "1";
  const tokenFromUrl = searchParams.get("token")?.trim() || null;
  // Default OFF. Only show names if explicitly enabled via ?names=1.
  const [showNames, setShowNames] = useState(searchParams.get("names") === "1");

  const [journey, setJourney] = useState<JourneyDoc | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conn, setConn] = useState<ConnectionState>("connecting");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [hasParticipantIdentity, setHasParticipantIdentity] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);
  const motionArmedRef = useRef(false);
  useEffect(() => {
    const storageKey = `session:${sessionId}:adminToken`;
    const stored = window.localStorage.getItem(storageKey);
    const fromStorage = stored ? (JSON.parse(stored) as { adminToken?: string }).adminToken ?? stored : null;
    const token = tokenFromUrl ?? fromStorage;
    if (tokenFromUrl) window.localStorage.setItem(storageKey, JSON.stringify({ adminToken: tokenFromUrl }));
    setAdminToken(token);
  }, [sessionId, tokenFromUrl]);

  useEffect(() => {
    // Only show "View Your Page" if this browser has joined the session (participant identity stored locally).
    const key = `session:${sessionId}:participant`;
    setHasParticipantIdentity(!!window.localStorage.getItem(key));
  }, [sessionId]);

  const [lastUpdateAtMs, setLastUpdateAtMs] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const model = useMemo(() => (journey ? buildSessionJourneyModel(journey) : null), [journey]);
  const ghosts = useMemo(() => {
    if (!model) return null;
    return computeGhostsByPhase({ model, participants, mappings });
  }, [model, participants, mappings]);
  const hasGhosts = !!ghosts;

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      const [journeyRes, stateRes] = await Promise.all([
        fetch("/api/journey", { cache: "no-store" }),
        fetch(`/api/sessions/state/${sessionId}`, { cache: "no-store" }),
      ]);

      if (!alive) return;

      if (!journeyRes.ok) {
        setError("Failed to load journey.");
        setLoading(false);
        return;
      }
      setJourney((await journeyRes.json()) as JourneyDoc);

      if (!stateRes.ok) {
        const body = (await stateRes.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Session not found.");
        setLoading(false);
        return;
      }
      const state = (await stateRes.json()) as { session: Session; participants: Participant[]; mappings: Mapping[] };
      setSession(state.session);
      setParticipants(state.participants ?? []);
      setMappings(state.mappings ?? []);
      setLastUpdateAtMs(Date.now());
      setLoading(false);
    }

    void load();
    return () => {
      alive = false;
    };
  }, [sessionId]);

  useEffect(() => {
    const es = new EventSource(`/api/sessions/stream/${sessionId}`);
    es.onopen = () => setConn("connected");
    es.onerror = () => setConn("reconnecting");

    es.addEventListener("mapping_updated", (evt) => {
      const data = JSON.parse((evt as MessageEvent).data) as { type: "mapping_updated"; mapping: Mapping };
      setMappings((prev) => upsertMapping(prev, data.mapping));
      setLastUpdateAtMs(Date.now());
    });

    es.addEventListener("participant_joined", async () => {
      const res = await fetch(`/api/sessions/state/${sessionId}`, { cache: "no-store" });
      if (!res.ok) return;
      const state = (await res.json()) as { participants: Participant[]; mappings: Mapping[]; session: Session };
      setParticipants(state.participants ?? []);
      setMappings(state.mappings ?? []);
      setSession(state.session);
      setLastUpdateAtMs(Date.now());
    });

    es.addEventListener("results_cleared", () => {
      setMappings([]);
      setLastUpdateAtMs(Date.now());
    });

    return () => es.close();
  }, [sessionId]);

  // Robustness fallback: background refresh to avoid relying solely on SSE (which can be flaky on some hosts).
  useEffect(() => {
    let alive = true;
    async function refresh() {
      const res = await fetch(`/api/sessions/state/${sessionId}`, { cache: "no-store" });
      if (!alive) return;
      if (!res.ok) return;
      const state = (await res.json()) as { session: Session; participants: Participant[]; mappings: Mapping[] };
      setSession(state.session);
      setParticipants(state.participants ?? []);
      setMappings(state.mappings ?? []);
      setLastUpdateAtMs(Date.now());
    }

    const t = window.setInterval(() => void refresh(), 5000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, [sessionId]);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    // Some browsers can stall SMIL (<animateMotion>) when it's present on the initial heavy SVG mount.
    // Arm motion on the next frame after the wallboard is ready; do not reset due to SSE updates.
    if (loading || error || !hasGhosts) {
      setMotionEnabled(false);
      motionArmedRef.current = false;
      return;
    }
    if (reduceMotion) {
      setMotionEnabled(false);
      motionArmedRef.current = true;
      return;
    }
    if (motionArmedRef.current) return;
    motionArmedRef.current = true;
    const raf = window.requestAnimationFrame(() => setMotionEnabled(true));
    return () => window.cancelAnimationFrame(raf);
  }, [loading, error, hasGhosts, reduceMotion]);

  useEffect(() => {
    // Keep state in sync if URL changes externally.
    setShowNames(searchParams.get("names") === "1");
  }, [searchParams]);

  function setNamesInUrl(nextShowNames: boolean) {
    const sp = new URLSearchParams(searchParams.toString());
    if (nextShowNames) sp.set("names", "1");
    else sp.delete("names");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  async function clearResults() {
    setClearing(true);
    setClearError(null);
    if (!adminToken) {
      setClearError("Missing admin token.");
      setClearing(false);
      return;
    }
    const res = await fetch("/api/sessions/clear", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, adminToken }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setClearError(data.error ?? "Failed to clear results.");
      setClearing(false);
      return;
    }
    setClearOpen(false);
    setClearing(false);
    // Optimistic local clear (SSE will also broadcast results_cleared).
    setMappings([]);
  }

  const joinCode = session?.joinCode;

  function shortenName(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return "Anon";
    return trimmed.length > 14 ? `${trimmed.slice(0, 13)}…` : trimmed;
  }

  function pupilMotionForPath(path: string, durSeconds: number): { durSeconds: number; values: string; keyTimes: string } | null {
    // Parse "M x y L x y ..." into points.
    const nums = path
      .replace(/[ML]/g, " ")
      .trim()
      .split(/\s+/)
      .map((t) => Number(t))
      .filter((n) => Number.isFinite(n));
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push({ x: nums[i]!, y: nums[i + 1]! });
    if (pts.length < 2) return null;

    const offsets: { dx: number; dy: number }[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i]!;
      const b = pts[i + 1]!;
      const vx = b.x - a.x;
      const vy = b.y - a.y;
      // Our paths are grid-ish; pick dominant axis.
      const ax = Math.abs(vx);
      const ay = Math.abs(vy);
      let dx = 0;
      let dy = 0;
      if (ax >= ay) dx = vx === 0 ? 0 : vx > 0 ? 1.4 : -1.4;
      else dy = vy === 0 ? 0 : vy > 0 ? 1.4 : -1.4;
      offsets.push({ dx, dy });
    }
    // Repeat first direction to align with loop.
    offsets.push(offsets[0]!);

    const values = offsets.map((o) => `${o.dx} ${o.dy}`).join(";");
    const keyTimes = offsets.map((_, i) => (i / (offsets.length - 1)).toFixed(4)).join(";");
    return { durSeconds, values, keyTimes };
  }

  return (
    <>
      {kiosk ? null : <SiteAppBar />}
      <Container maxWidth={false} sx={{ py: kiosk ? 2 : { xs: 4, md: 6 } }}>
        <Stack spacing={2.5}>
          <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                {joinCode ? <Chip label={`Code: ${joinCode}`} /> : null}
                <Chip label={`Participants: ${participants.length}`} />
                <Chip
                  color={conn === "connected" ? "success" : conn === "reconnecting" ? "warning" : "default"}
                  label={conn === "connected" ? "Live" : conn === "reconnecting" ? "Reconnecting…" : "Connecting…"}
                />
                {lastUpdateAtMs ? <Chip label={`Updated: ${formatRelativeTimeShort(nowMs - lastUpdateAtMs)}`} /> : null}
              </Stack>
            </Box>

            <Stack direction="row" spacing={5} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={showNames}
                    onChange={(_, checked) => {
                      setShowNames(checked);
                      setNamesInUrl(checked);
                    }}
                  />
                }
                label="Show names"
              />
              {adminToken ? (
                <Button
                  variant="text"
                  color="error"
                  onClick={() => {
                    setClearError(null);
                    setClearOpen(true);
                  }}
                >
                  Clear results
                </Button>
              ) : null}
              <Button component={Link} href="/" variant="text">
                Home
              </Button>
              {hasParticipantIdentity ? (
                <Button
                  component={Link}
                  href={`/session/${sessionId}${joinCode ? `?code=${encodeURIComponent(joinCode)}` : ""}`}
                  variant="contained"
                  color="primary"
                >
                  View Your Page
                </Button>
              ) : null}
            </Stack>
          </Box>

          {loading ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={20} />
              <Typography sx={{ color: "text.secondary" }}>Loading…</Typography>
            </Stack>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : !ghosts ? (
            <Alert severity="warning">Missing journey model.</Alert>
          ) : (
            <>
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                  alignItems: "stretch",
                }}
              >
              {ghosts.phases.map((phase) => {
                const participantIdToName = new Map(participants.map((p) => [p.id, p.displayName] as const));

                // Render each participant's ghosts (one per section toggle in this phase).
                const ghostElements: { key: string; color: string; name: string }[] = [];
                for (const [participantId, n] of phase.ghostsByParticipantId.entries()) {
                  const color = ghosts.participantIdToColor.get(participantId) ?? "#8E8E93";
                  const name = shortenName(participantIdToName.get(participantId) ?? "Anon");
                  for (let i = 0; i < n; i++) ghostElements.push({ key: `${participantId}:${i}`, color, name });
                }

                const durationSeconds = 10;

                // Stable maze per session+phase pane
                const maze = generateMaze({ seed: `${sessionId}:${phase.phaseId}`, cols: 11, rows: 9 });
                const mazeW = 520;
                const mazeH = 360;
                const { wallsPath } = buildMazeSvgPaths({ maze, width: mazeW, height: mazeH, padding: 14 });

                return (
                  <Box
                    key={phase.phaseId}
                    sx={{
                      bgcolor: "grey.50",
                      border: "1px solid rgba(0,0,0,0.12)",
                      borderRadius: 2,
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      minHeight: 360,
                    }}
                  >
                    <Box sx={{ mb: 1.5 }}>
                      <PhaseLevelTitle rawTitle={phase.title} sx={{ fontWeight: 900 }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {ghostElements.length} {ghostElements.length === 1 ? "ghost" : "ghosts"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {phase.ghostsByParticipantId.size} {phase.ghostsByParticipantId.size === 1 ? "person" : "people"}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box
                      sx={{
                        flex: "1 1 auto",
                        borderRadius: 0,
                        overflow: "hidden",
                        border: "none",
                      }}
                    >
                      <svg
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${mazeW} ${mazeH}`}
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <defs>
                          <filter id="ghostShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="1.25" stdDeviation="1.2" floodColor="rgba(0,0,0,0.35)" />
                          </filter>
                        </defs>

                        <rect x="0" y="0" width={mazeW} height={mazeH} fill="rgba(0,0,0,0.015)" />
                        <path
                          d={wallsPath}
                          stroke="rgba(0,87,255,0.50)"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />

                        {ghostElements.length ? (
                          ghostElements.map((g) => {
                            const path = buildGhostLoopPath({
                              maze,
                              seed: `${sessionId}:${phase.phaseId}:${g.key}`,
                              width: mazeW,
                              height: mazeH,
                              padding: 14,
                              steps: 22,
                            });
                            const m = /^M\s+([0-9.]+)\s+([0-9.]+)/.exec(path);
                            const startX = m ? Number(m[1]) : 20;
                            const startY = m ? Number(m[2]) : 20;
                            const allowMotion = motionEnabled && !reduceMotion;
                            const pupilMotion = allowMotion ? pupilMotionForPath(path, durationSeconds) : null;

                            return (
                              <g
                                key={g.key}
                                transform={!allowMotion ? `translate(${startX},${startY})` : undefined}
                              >
                                {allowMotion ? (
                                  <animateMotion dur={`${durationSeconds}s`} repeatCount="indefinite" path={path} />
                                ) : null}
                                <g filter="url(#ghostShadow)">
                                  <PacmanGhostSvg color={g.color} size={26} pupilMotion={pupilMotion} />
                                </g>
                                {showNames ? (
                                  <text
                                    x="0"
                                    y="30"
                                    textAnchor="middle"
                                    fontSize="12"
                                    fontWeight="700"
                                    fill="rgba(0,0,0,0.85)"
                                    stroke="rgba(255,255,255,0.95)"
                                    strokeWidth="4"
                                    paintOrder="stroke"
                                  >
                                    {g.name}
                                  </text>
                                ) : null}
                              </g>
                            );
                          })
                        ) : null}
                      </svg>
                    </Box>
                  </Box>
                );
              })}
              </Box>
            </>
          )}
        </Stack>
      </Container>

      <Dialog open={clearOpen} onClose={() => (clearing ? null : setClearOpen(false))}>
        <DialogTitle>Clear results?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will clear all “Doing” mappings for everyone in this session. This cannot be undone.
          </DialogContentText>
          {clearError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {clearError}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearOpen(false)} disabled={clearing}>
            Cancel
          </Button>
          <Button onClick={clearResults} color="error" variant="contained" disabled={clearing}>
            {clearing ? "Clearing…" : "Clear"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

