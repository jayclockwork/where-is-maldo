"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import { SiteAppBar } from "@/components/SiteAppBar";
import { avatarPalette } from "@/ui/colors/avatarPalette";
import { PacmanGhostSvg } from "@/components/wallboard/PacmanGhostSvg";

type Session = { id: string; joinCode: string; title?: string; status: "open" | "closed"; createdAt: string };
type Participant = { id: string; sessionId: string; displayName: string; avatarColor?: string };

export default function JoinSessionPage() {
  const router = useRouter();
  const params = useParams<{ code: string }>();
  const joinCode = (params.code ?? "").toUpperCase();

  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setRefreshing] = useState(false); // used by load() for background refresh paths (join error recovery)
  const [displayName, setDisplayName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [colorTakenMessage, setColorTakenMessage] = useState<string | null>(null);

  const usedColors = useMemo(() => {
    const used = new Set<string>();
    for (const p of participants) if (p.avatarColor) used.add(p.avatarColor.toLowerCase());
    return used;
  }, [participants]);

  const visibleColors = useMemo(() => {
    const selected = selectedColor?.toLowerCase();
    return avatarPalette.filter((hex) => {
      const lower = hex.toLowerCase();
      // Hide taken colors entirely for new users, but keep a user's current selection visible.
      if (usedColors.has(lower) && lower !== selected) return false;
      return true;
    });
  }, [selectedColor, usedColors]);

  async function load({ isInitial }: { isInitial: boolean }) {
    if (!joinCode) return;
    if (isInitial) setLoading(true);
    else setRefreshing(true);

    const res = await fetch(`/api/sessions/by-code/${joinCode}`, { cache: "no-store" });
    if (!res.ok) {
      if (isInitial) {
        setSession(null);
        setParticipants([]);
        setLoading(false);
      } else {
        setRefreshing(false);
      }
      return;
    }
    const data = (await res.json()) as { session: Session; participants: Participant[] };
    setSession(data.session);
    setParticipants(data.participants ?? []);
    if (isInitial) setLoading(false);
    else setRefreshing(false);
  }

  async function ensureDemoSessionIfNeeded() {
    if (joinCode !== "DEMO20") return;
    const res = await fetch(`/api/sessions/by-code/${joinCode}`, { cache: "no-store" });
    if (res.ok) return;
    await fetch("/api/sessions/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ joinCode }),
    });
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      await ensureDemoSessionIfNeeded();
      if (!alive) return;
      await load({ isInitial: true });
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinCode]);

  // Realtime updates for taken colors/presence: subscribe to session events and merge participant joins locally.
  useEffect(() => {
    if (!session?.id) return;
    const es = new EventSource(`/api/sessions/stream/${session.id}`);
    es.addEventListener("participant_joined", (evt) => {
      const data = JSON.parse((evt as MessageEvent).data) as { type: "participant_joined"; participant: Participant };
      setParticipants((prev) => {
        if (prev.some((p) => p.id === data.participant.id)) return prev;
        return [...prev, data.participant];
      });
    });
    return () => es.close();
  }, [session?.id]);

  // If someone else takes the color you selected (or it becomes unavailable), clear it and nudge the user.
  useEffect(() => {
    if (!selectedColor) return;
    if (!usedColors.has(selectedColor.toLowerCase())) return;
    setSelectedColor(null);
    setColorTakenMessage("That color was just taken—please pick another.");
    const t = window.setTimeout(() => setColorTakenMessage(null), 2500);
    return () => window.clearTimeout(t);
  }, [selectedColor, usedColors]);

  async function onJoin() {
    if (!displayName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!selectedColor) {
      setError("Please pick a ghost color.");
      return;
    }

    setJoining(true);
    setError(null);
    const res = await fetch("/api/sessions/join", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ joinCode, displayName, avatarColor: selectedColor }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Join failed.");
      setJoining(false);
      await load({ isInitial: false });
      return;
    }

    const data = (await res.json()) as {
      session: Session;
      participant: { id: string; displayName: string; avatarColor?: string };
      participantSecret: string;
    };

    const key = `session:${data.session.id}:participant`;
    window.localStorage.setItem(
      key,
      JSON.stringify({
        participantId: data.participant.id,
        participantSecret: data.participantSecret,
        displayName: data.participant.displayName,
        avatarColor: data.participant.avatarColor,
      }),
    );

    router.push(`/session/${data.session.id}?code=${encodeURIComponent(joinCode)}`);
  }

  return (
    <>
      <SiteAppBar />
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
              Join a Session
            </Typography>
            <Typography sx={{ color: "text.secondary", mt: 1 }}>
              Session: <strong>{joinCode}</strong>
            </Typography>
          </Box>

          {loading ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={20} />
              <Typography sx={{ color: "text.secondary" }}>Loading session…</Typography>
            </Stack>
          ) : session ? (
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  {error ? <Alert severity="error">{error}</Alert> : null}
                  {colorTakenMessage ? <Alert severity="info">{colorTakenMessage}</Alert> : null}

                  <TextField
                    label="Display name"
                    placeholder="Your name"
                    fullWidth
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />

                  <Box>
                    <Typography sx={{ fontWeight: 800, mb: 1 }}>Pick a ghost color</Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {visibleColors.map((hex) => {
                        const taken = usedColors.has(hex.toLowerCase());
                        const selected = selectedColor?.toLowerCase() === hex.toLowerCase();
                        return (
                          <Tooltip key={hex} title={hex}>
                            <Box
                              role="button"
                              aria-disabled={taken}
                              tabIndex={taken ? -1 : 0}
                              onClick={() => {
                                if (!taken) setSelectedColor(hex);
                              }}
                              onKeyDown={(e) => {
                                if (taken) return;
                                if (e.key === "Enter" || e.key === " ") setSelectedColor(hex);
                              }}
                              sx={{
                                width: 34,
                                height: 34,
                                borderRadius: 2,
                                bgcolor: "rgba(0,0,0,0.03)",
                                border: selected ? "2px solid #111" : "1px solid rgba(0,0,0,0.12)",
                                opacity: taken ? 0.35 : 1,
                                cursor: taken ? "not-allowed" : "pointer",
                                outline: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden focusable="false">
                                <g transform="translate(14 14)">
                                  <PacmanGhostSvg color={hex} size={26} />
                                </g>
                              </svg>
                            </Box>
                          </Tooltip>
                        );
                      })}
                    </Stack>
                  </Box>

                  <Button variant="contained" color="primary" onClick={onJoin} disabled={joining}>
                    {joining ? "Joining…" : "Join"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="warning">
              Session not found. If you meant to join a real session, double-check the code.
            </Alert>
          )}
        </Stack>
      </Container>
    </>
  );
}


