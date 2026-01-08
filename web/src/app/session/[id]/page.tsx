"use client";

import { useMemo, useState } from "react";
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
import { useEffect } from "react";

import { SiteAppBar } from "@/components/SiteAppBar";
import type { JourneyDoc } from "@/lib/journey/types";
import type { Mapping, Participant, Session } from "@/domain/sessions/types";
import { SessionJourneyView } from "@/components/session/SessionJourneyView";
import { upsertMapping } from "@/lib/sessions/mappings";
import { PacmanGhostSvg } from "@/components/wallboard/PacmanGhostSvg";

type LocalParticipant = { participantId: string; participantSecret: string; displayName: string; avatarColor?: string };
type ConnectionState = "connecting" | "connected" | "reconnecting";

export default function SessionPage() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;
  const searchParams = useSearchParams();
  const joinCode = searchParams.get("code")?.toUpperCase();

  const storageKey = useMemo(() => `session:${sessionId}:participant`, [sessionId]);

  // Important: don't read localStorage during initial render (SSR/hydration mismatch risk).
  const [me, setMe] = useState<LocalParticipant | null>(null);
  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMe(raw ? (JSON.parse(raw) as LocalParticipant) : null);
  }, [storageKey]);

  const [journey, setJourney] = useState<JourneyDoc | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conn, setConn] = useState<ConnectionState>("connecting");

  const meIsStillParticipant = useMemo(() => {
    if (!me) return false;
    return participants.some((p) => p.id === me.participantId);
  }, [me, participants]);

  const participantWasCleared = useMemo(() => {
    if (loading) return false;
    if (error) return false;
    if (!session) return false;
    if (!me) return false;
    // Avoid a false positive during the initial load (participants can briefly be empty before state arrives).
    if (participants.length === 0) return false;
    return !meIsStillParticipant;
  }, [error, loading, me, meIsStillParticipant, participants.length, session]);

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
      const journeyJson = (await journeyRes.json()) as JourneyDoc;
      setJourney(journeyJson);

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
    es.addEventListener("results_cleared", () => {
      setMappings([]);
    });
    es.addEventListener("participant_joined", async () => {
      // refresh participants list
      const res = await fetch(`/api/sessions/state/${sessionId}`, { cache: "no-store" });
      if (!res.ok) return;
      const state = (await res.json()) as { participants: Participant[]; mappings: Mapping[]; session: Session };
      setParticipants(state.participants ?? []);
      setMappings(state.mappings ?? []);
      setSession(state.session);
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
    }

    const t = window.setInterval(() => void refresh(), 5000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, [sessionId]);

  useEffect(() => {
    if (!participantWasCleared) return;
    window.localStorage.removeItem(storageKey);
  }, [participantWasCleared, storageKey]);

  async function toggle(itemId: string, isDoing: boolean) {
    if (!me) return;
    // Optimistic update
    const optimistic: Mapping = {
      sessionId,
      participantId: me.participantId,
      itemId,
      isDoing,
      updatedAt: new Date().toISOString(),
    };
    setMappings((prev) => upsertMapping(prev, optimistic));

    const res = await fetch("/api/sessions/toggle", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sessionId,
        participantId: me.participantId,
        participantSecret: me.participantSecret,
        itemId,
        isDoing,
      }),
    });

    if (!res.ok) {
      // revert by reloading state
      const stateRes = await fetch(`/api/sessions/state/${sessionId}`, { cache: "no-store" });
      if (stateRes.ok) {
        const state = (await stateRes.json()) as { mappings: Mapping[] };
        setMappings(state.mappings ?? []);
      }
    }
  }

  return (
    <>
      <SiteAppBar
        showJoinSession={false}
        rightActions={
          <Button component={Link} href={`/wallboard/${sessionId}?kiosk=1`} variant="contained" color="primary">
            View Wallboard
          </Button>
        }
      />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={2}>
          {me ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
                {me.displayName}
              </Typography>
              {me.avatarColor ? (
                <Box sx={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden focusable="false">
                    <g transform="translate(14 14)">
                      <PacmanGhostSvg color={me.avatarColor} size={26} />
                    </g>
                  </svg>
                </Box>
              ) : null}
            </Stack>
          ) : (
            <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
              Session
            </Typography>
          )}
          {session ? (
            <Stack spacing={1.25}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap" sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: "text.secondary" }}>
                    Join code: <strong>{session.joinCode}</strong>
                  </Typography>
                  <Chip
                    color={conn === "connected" ? "success" : conn === "reconnecting" ? "warning" : "default"}
                    label={conn === "connected" ? "Live" : conn === "reconnecting" ? "Reconnecting…" : "Connecting…"}
                    size="small"
                  />
                </Stack>
                <Chip label={`Participants: ${participants.length}`} size="small" />
              </Box>
            </Stack>
          ) : (
            <Typography sx={{ color: "text.secondary" }}>
              Session ID: <code>{sessionId}</code>
            </Typography>
          )}

          {loading ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={20} />
              <Typography sx={{ color: "text.secondary" }}>Loading…</Typography>
            </Stack>
          ) : error ? (
            <Stack spacing={2}>
              <Alert severity="error">{error}</Alert>
              {joinCode ? (
                <Button component={Link} href={`/s/${joinCode}`} variant="contained" color="primary">
                  Back to join ({joinCode})
                </Button>
              ) : (
                <Button component={Link} href="/join" variant="contained" color="primary">
                  Back to join
                </Button>
              )}
              {process.env.NODE_ENV === "development" ? (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Note: the current dev setup uses an in-memory store, so sessions can disappear if the dev server reloads.
                  Re-join to recreate the demo session.
                </Typography>
              ) : null}
            </Stack>
          ) : participantWasCleared ? (
            <Stack spacing={2}>
              <Alert severity="warning">This session was reset. Please re-join to continue.</Alert>
              {joinCode ? (
                <Button component={Link} href={`/s/${joinCode}`} variant="contained" color="primary">
                  Re-join ({joinCode})
                </Button>
              ) : (
                <Button component={Link} href="/join" variant="contained" color="primary">
                  Re-join
                </Button>
              )}
            </Stack>
          ) : journey && me ? (
            <>
              {conn === "connected" ? null : (
                <Alert severity="warning">
                  {conn === "reconnecting"
                    ? "Reconnecting… toggles are disabled until we’re live again."
                    : "Connecting… toggles are disabled until we’re live."}
                </Alert>
              )}
              <Divider />
              <SessionJourneyView
                journey={journey}
                mappings={mappings}
                myParticipantId={me.participantId}
                onToggle={toggle}
                togglesDisabled={conn !== "connected"}
              />
            </>
          ) : null}
        </Stack>
      </Container>
    </>
  );
}


