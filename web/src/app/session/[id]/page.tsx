"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Alert, Box, Button, CircularProgress, Container, Stack, Typography } from "@mui/material";
import { useEffect } from "react";

import { SiteAppBar } from "@/components/SiteAppBar";
import type { JourneyDoc } from "@/lib/journey/types";
import type { Mapping, Participant, Session } from "@/domain/sessions/types";
import { SessionJourneyView } from "@/components/session/SessionJourneyView";
import { upsertMapping } from "@/lib/sessions/mappings";

type LocalParticipant = { participantId: string; participantSecret: string; displayName: string; avatarColor?: string };

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
  const [, setParticipants] = useState<Participant[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    es.addEventListener("mapping_updated", (evt) => {
      const data = JSON.parse((evt as MessageEvent).data) as { type: "mapping_updated"; mapping: Mapping };
      setMappings((prev) => upsertMapping(prev, data.mapping));
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
      <SiteAppBar />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
            Session
          </Typography>
          {session ? (
            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
              <Typography sx={{ color: "text.secondary" }}>
                Join code: <strong>{session.joinCode}</strong>
              </Typography>
              <Button
                component={Link}
                href={`/wallboard/${sessionId}?kiosk=1`}
                variant="outlined"
                size="small"
              >
                Open wallboard
              </Button>
            </Stack>
          ) : (
            <Typography sx={{ color: "text.secondary" }}>
              Session ID: <code>{sessionId}</code>
            </Typography>
          )}

          {me ? (
            <Box>
              <Typography sx={{ fontWeight: 800 }}>You</Typography>
              <Typography sx={{ color: "text.secondary" }}>
                {me.displayName} {me.avatarColor ? `(${me.avatarColor})` : ""}
              </Typography>
            </Box>
          ) : (
            <Typography sx={{ color: "text.secondary" }}>
              Join a session first to set your participant identity.
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
                <Button component={Link} href="/s/DEMO20" variant="contained" color="primary">
                  Back to join (DEMO20)
                </Button>
              )}
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Note: the current dev setup uses an in-memory store, so sessions can disappear if the dev server reloads.
                Re-join to recreate the demo session.
              </Typography>
            </Stack>
          ) : journey && me ? (
            <SessionJourneyView
              journey={journey}
              mappings={mappings}
              myParticipantId={me.participantId}
              onToggle={toggle}
            />
          ) : null}
        </Stack>
      </Container>
    </>
  );
}


