"use client";

import Link from "next/link";
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

type Session = { id: string; joinCode: string; title?: string; status: "open" | "closed"; createdAt: string };
type Participant = { id: string; sessionId: string; displayName: string; avatarColor?: string };

export default function JoinSessionPage() {
  const router = useRouter();
  const params = useParams<{ code: string }>();
  const joinCode = (params.code ?? "").toUpperCase();

  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setRefreshing] = useState(false); // keep internal state to avoid re-showing initial loader during polling
  const [displayName, setDisplayName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const usedColors = useMemo(() => {
    const used = new Set<string>();
    for (const p of participants) if (p.avatarColor) used.add(p.avatarColor.toLowerCase());
    return used;
  }, [participants]);

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

    const t = window.setInterval(() => {
      // Background refresh: do not flip the whole page into a loading state (keeps typing stable).
      void load({ isInitial: false });
    }, 5000);

    return () => {
      alive = false;
      window.clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinCode]);

  async function onJoin() {
    if (!displayName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!selectedColor) {
      setError("Please pick a color.");
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
              Join session
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

                  <TextField
                    label="Display name"
                    placeholder="Your name"
                    fullWidth
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />

                  <Box>
                    <Typography sx={{ fontWeight: 800, mb: 1 }}>Pick a color</Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {avatarPalette.map((hex) => {
                        const taken = usedColors.has(hex.toLowerCase());
                        const selected = selectedColor?.toLowerCase() === hex.toLowerCase();
                        return (
                          <Tooltip key={hex} title={taken ? "Taken" : hex}>
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
                                width: 28,
                                height: 28,
                                borderRadius: "999px",
                                bgcolor: hex,
                                border: selected ? "3px solid #111" : "2px solid rgba(0,0,0,0.12)",
                                opacity: taken ? 0.35 : 1,
                                cursor: taken ? "not-allowed" : "pointer",
                                outline: "none",
                              }}
                            />
                          </Tooltip>
                        );
                      })}
                    </Stack>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
                      Colors are unique per session—once someone picks one, it becomes unavailable.
                    </Typography>
                  </Box>

                  <Button variant="contained" color="primary" onClick={onJoin} disabled={joining}>
                    {joining ? "Joining…" : "Join"}
                  </Button>

                  <Button component={Link} href="/journey" variant="text">
                    Back to journey →
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


