"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Stack,
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

type ConnectionState = "connecting" | "connected" | "reconnecting";

export default function WallboardGhostsPage() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;
  const searchParams = useSearchParams();
  const kiosk = searchParams.get("kiosk") === "1";

  const [journey, setJourney] = useState<JourneyDoc | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conn, setConn] = useState<ConnectionState>("connecting");
  const [reduceMotion, setReduceMotion] = useState(false);

  const model = useMemo(() => (journey ? buildSessionJourneyModel(journey) : null), [journey]);
  const ghosts = useMemo(() => {
    if (!model) return null;
    return computeGhostsByPhase({ model, participants, mappings });
  }, [model, participants, mappings]);

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
    });

    es.addEventListener("participant_joined", async () => {
      const res = await fetch(`/api/sessions/state/${sessionId}`, { cache: "no-store" });
      if (!res.ok) return;
      const state = (await res.json()) as { participants: Participant[]; mappings: Mapping[]; session: Session };
      setParticipants(state.participants ?? []);
      setMappings(state.mappings ?? []);
      setSession(state.session);
    });

    es.addEventListener("results_cleared", () => setMappings([]));

    return () => es.close();
  }, [sessionId]);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  async function toggleFullscreen() {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
  }

  const joinCode = session?.joinCode;

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
              <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
                Wallboard (Ghosts)
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                {joinCode ? <Chip label={`Code: ${joinCode}`} /> : null}
                <Chip label={`Participants: ${participants.length}`} />
                <Chip
                  color={conn === "connected" ? "success" : conn === "reconnecting" ? "warning" : "default"}
                  label={conn === "connected" ? "Live" : conn === "reconnecting" ? "Reconnecting…" : "Connecting…"}
                />
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="outlined" onClick={toggleFullscreen}>
                Fullscreen
              </Button>
              {kiosk ? null : (
                <Button component={Link} href={`/session/${sessionId}${joinCode ? `?code=${encodeURIComponent(joinCode)}` : ""}`} variant="text">
                  Back to session →
                </Button>
              )}
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
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                alignItems: "stretch",
              }}
            >
              {ghosts.phases.map((phase) => {
                // Render each participant's ghosts (one per section toggle in this phase).
                const ghostElements: { key: string; color: string }[] = [];
                for (const [participantId, n] of phase.ghostsByParticipantId.entries()) {
                  const color = ghosts.participantIdToColor.get(participantId) ?? "#8E8E93";
                  for (let i = 0; i < n; i++) ghostElements.push({ key: `${participantId}:${i}`, color });
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
                      <Typography sx={{ fontWeight: 900 }}>{phase.title}</Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {ghostElements.length} {ghostElements.length === 1 ? "ghost" : "ghosts"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: "1 1 auto",
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.12)",
                      }}
                    >
                      <svg
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${mazeW} ${mazeH}`}
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <rect x="0" y="0" width={mazeW} height={mazeH} fill="rgba(0,0,0,0.02)" />
                        <path d={wallsPath} stroke="rgba(0,0,0,0.20)" strokeWidth="2" fill="none" />

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
                            const pupilMotion = reduceMotion ? null : pupilMotionForPath(path, durationSeconds);

                            return (
                              <g key={g.key} transform={reduceMotion ? `translate(${startX},${startY})` : undefined}>
                                {reduceMotion ? null : (
                                  <animateMotion dur={`${durationSeconds}s`} repeatCount="indefinite" path={path} />
                                )}
                                <PacmanGhostSvg color={g.color} size={26} pupilMotion={pupilMotion} />
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
          )}
        </Stack>
      </Container>
    </>
  );
}

