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
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import { SiteAppBar } from "@/components/SiteAppBar";
import type { JourneyDoc } from "@/lib/journey/types";
import type { Mapping, Participant, Session } from "@/domain/sessions/types";
import { upsertMapping } from "@/lib/sessions/mappings";
import { buildSessionJourneyModel } from "@/lib/session/sessionContentModel";
import { computeWallboardStats } from "@/lib/wallboard/aggregate";

type ConnectionState = "connecting" | "connected" | "reconnecting";

export default function WallboardPage() {
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
  const [lastUpdateAt, setLastUpdateAt] = useState<string | null>(null);

  const model = useMemo(() => (journey ? buildSessionJourneyModel(journey) : null), [journey]);
  const stats = useMemo(() => {
    if (!model) return null;
    return computeWallboardStats({ model, participants, mappings, topN: 8 });
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
      setLastUpdateAt(new Date().toISOString());
    });

    es.addEventListener("participant_joined", async () => {
      // refresh participants list (aggregate-only wallboard, but we need the count)
      const res = await fetch(`/api/sessions/state/${sessionId}`, { cache: "no-store" });
      if (!res.ok) return;
      const state = (await res.json()) as { participants: Participant[]; mappings: Mapping[]; session: Session };
      setParticipants(state.participants ?? []);
      setMappings(state.mappings ?? []);
      setSession(state.session);
      setLastUpdateAt(new Date().toISOString());
    });

    es.addEventListener("results_cleared", () => {
      setMappings([]);
      setLastUpdateAt(new Date().toISOString());
    });

    return () => es.close();
  }, [sessionId]);

  async function toggleFullscreen() {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
  }

  const joinCode = session?.joinCode;
  const title = session?.title ?? "Wallboard";

  return (
    <>
      {kiosk ? null : <SiteAppBar />}
      <Container maxWidth={false} sx={{ py: kiosk ? 2 : { xs: 4, md: 6 } }}>
        <Stack spacing={3}>
          <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 900 }}>
                {title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                {joinCode ? <Chip label={`Code: ${joinCode}`} /> : null}
                <Chip label={`Participants: ${stats?.participantCount ?? participants.length}`} />
                <Chip
                  color={conn === "connected" ? "success" : conn === "reconnecting" ? "warning" : "default"}
                  label={conn === "connected" ? "Live" : conn === "reconnecting" ? "Reconnecting…" : "Connecting…"}
                />
                {lastUpdateAt ? <Chip label={`Updated: ${new Date(lastUpdateAt).toLocaleTimeString()}`} /> : null}
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
          ) : !stats ? (
            <Alert severity="warning">Missing journey model.</Alert>
          ) : (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                  Where the room is (by phase)
                </Typography>
                <Stack spacing={1.5}>
                  {stats.phases.map((p) => {
                    const max = Math.max(1, stats.maxPhaseCount);
                    const ratio = p.participantCountDoing / max;
                    return (
                      <Box key={p.phaseId}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{ width: { xs: 160, md: 260 }, flex: "0 0 auto" }}>
                            <Typography sx={{ fontWeight: 800 }}>{p.title}</Typography>
                          </Box>
                          <Box sx={{ flex: "1 1 auto", minWidth: 120 }}>
                            <Box
                              sx={{
                                height: 18,
                                borderRadius: 999,
                                bgcolor: "rgba(0,0,0,0.08)",
                                overflow: "hidden",
                              }}
                            >
                              <Box
                                sx={{
                                  height: "100%",
                                  width: `${Math.round(ratio * 100)}%`,
                                  bgcolor: "secondary.main",
                                }}
                              />
                            </Box>
                          </Box>
                          <Box sx={{ width: 64, textAlign: "right" }}>
                            <Typography sx={{ fontWeight: 900 }}>{p.participantCountDoing}</Typography>
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                  Top active subsections
                </Typography>
                {stats.topItems.length ? (
                  <Stack spacing={1.25}>
                    {stats.topItems.map((it) => (
                      <Stack key={it.itemId} direction="row" spacing={2} alignItems="baseline" justifyContent="space-between">
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {it.label}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                          {it.participantCountDoing}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                ) : (
                  <Typography sx={{ color: "text.secondary" }}>No activity yet.</Typography>
                )}
              </Box>
            </Stack>
          )}
        </Stack>
      </Container>
    </>
  );
}

