"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { SiteAppBar } from "@/components/SiteAppBar";
import type { Mapping, Participant, Session } from "@/domain/sessions/types";

type SessionState = { session: Session; participants: Participant[]; mappings: Mapping[] };

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token")?.trim() || null;

  const storageKey = useMemo(() => `session:${sessionId}:adminToken`, [sessionId]);
  const adminToken = useMemo(() => {
    if (typeof window === "undefined") return tokenFromUrl;
    const stored = window.localStorage.getItem(storageKey);
    const fromStorage = stored ? (JSON.parse(stored) as { adminToken?: string }).adminToken ?? stored : null;
    return tokenFromUrl ?? fromStorage;
  }, [storageKey, tokenFromUrl]);

  const [state, setState] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clearOpen, setClearOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) {
      window.localStorage.setItem(storageKey, JSON.stringify({ adminToken: tokenFromUrl }));
    }
  }, [storageKey, tokenFromUrl]);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/sessions/state/${sessionId}`, { cache: "no-store" });
      if (!alive) return;
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Session not found.");
        setLoading(false);
        return;
      }
      setState((await res.json()) as SessionState);
      setLoading(false);
    }
    void load();
    return () => {
      alive = false;
    };
  }, [sessionId]);

  async function clearResults() {
    if (!adminToken) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/sessions/clear", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, adminToken }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Failed to clear results.");
      setBusy(false);
      return;
    }
    setState((prev) => (prev ? { ...prev, mappings: [] } : prev));
    setClearOpen(false);
    setConfirmText("");
    setBusy(false);
  }

  async function exportResults() {
    if (!adminToken) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/sessions/export", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, adminToken }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Failed to export.");
      setBusy(false);
      return;
    }
    const data = (await res.json()) as unknown;
    downloadJson(`session-${sessionId}-export.json`, data);
    setBusy(false);
  }

  const joinCode = state?.session.joinCode;
  const joinHref = joinCode ? `/s/${encodeURIComponent(joinCode)}` : null;
  const wallboardHref = joinCode ? `/w/${encodeURIComponent(joinCode)}` : null;
  const wallboardHostHref = joinCode && adminToken ? `/w/${encodeURIComponent(joinCode)}?token=${encodeURIComponent(adminToken)}` : null;
  const individualHref = adminToken
    ? `/admin/${encodeURIComponent(sessionId)}/individual?token=${encodeURIComponent(adminToken)}`
    : `/admin/${encodeURIComponent(sessionId)}/individual`;

  return (
    <>
      <SiteAppBar />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
              Control Center
            </Typography>
            <Typography sx={{ color: "text.secondary", mt: 1 }}>
              Host/admin controls for this session.
            </Typography>
          </Box>

          {!adminToken ? (
            <Alert severity="error">
              Missing admin token. Open this page from the Host screen, or include <code>?token=…</code>.
            </Alert>
          ) : null}

          {error ? <Alert severity="error">{error}</Alert> : null}

          {loading ? (
            <Alert severity="info">Loading session…</Alert>
          ) : state ? (
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                    <Chip label={`Code: ${state.session.joinCode}`} />
                    <Chip label={`Status: ${state.session.status}`} />
                    <Chip label={`Participants: ${state.participants.length}`} />
                    <Chip label={`Mappings: ${state.mappings.length}`} />
                  </Stack>

                  <Divider />

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap flexWrap="wrap">
                    {joinHref ? (
                      <Button component={Link} href={joinHref} variant="outlined">
                        Open join page
                      </Button>
                    ) : null}
                    {wallboardHref ? (
                      <Button component={Link} href={wallboardHref} variant="outlined">
                        Open wallboard (audience)
                      </Button>
                    ) : null}
                    {wallboardHostHref ? (
                      <Button component={Link} href={wallboardHostHref} variant="outlined">
                        Open wallboard (host)
                      </Button>
                    ) : null}
                    <Button component={Link} href={individualHref} variant="outlined">
                      Individual view
                    </Button>
                  </Stack>

                  <Divider />

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap flexWrap="wrap">
                    <Button
                      variant="text"
                      color="error"
                      onClick={() => setClearOpen(true)}
                      disabled={!adminToken || busy}
                    >
                      Clear results…
                    </Button>
                    <Button variant="outlined" onClick={exportResults} disabled={!adminToken || busy}>
                      Export JSON
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ) : null}
        </Stack>
      </Container>

      <Dialog open={clearOpen} onClose={() => (busy ? null : setClearOpen(false))}>
        <DialogTitle>Clear results?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This clears all “Doing” mappings for everyone in this session. Type <strong>CLEAR</strong> to confirm.
          </DialogContentText>
          <TextField
            label="Type CLEAR to confirm"
            fullWidth
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={clearResults}
            color="error"
            variant="contained"
            disabled={busy || confirmText.trim().toUpperCase() !== "CLEAR"}
          >
            {busy ? "Clearing…" : "Clear"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

