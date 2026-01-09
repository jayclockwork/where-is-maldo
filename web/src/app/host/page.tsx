"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { SiteAppBar } from "@/components/SiteAppBar";

type CreateSessionResponse = {
  session: { id: string; joinCode: string };
  adminToken: string;
};

export default function HostPage() {
  const [title, setTitle] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ sessionId: string; joinCode: string; adminToken: string } | null>(null);

  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const joinUrl = useMemo(() => {
    if (!created) return null;
    return `${origin}/s/${encodeURIComponent(created.joinCode)}`;
  }, [created, origin]);

  const wallboardUrl = useMemo(() => {
    if (!created) return null;
    return `${origin}/w/${encodeURIComponent(created.joinCode)}`;
  }, [created, origin]);

  const adminUrl = useMemo(() => {
    if (!created) return null;
    return `${origin}/admin/${encodeURIComponent(created.sessionId)}?token=${encodeURIComponent(created.adminToken)}`;
  }, [created, origin]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore; user can still select/copy manually
    }
  }

  async function onCreate() {
    setCreating(true);
    setError(null);
    setCreated(null);

    const res = await fetch("/api/sessions/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: title.trim() || undefined,
        joinCode: joinCode.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Failed to create session.");
      setCreating(false);
      return;
    }

    const data = (await res.json()) as CreateSessionResponse;
    setCreated({ sessionId: data.session.id, joinCode: data.session.joinCode, adminToken: data.adminToken });
    window.localStorage.setItem(`session:${data.session.id}:adminToken`, JSON.stringify({ adminToken: data.adminToken }));
    setCreating(false);
  }

  return (
    <>
      <SiteAppBar />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
              Host
            </Typography>
            <Typography sx={{ color: "text.secondary", mt: 1 }}>
              Create a live session and share the join + wallboard links.
            </Typography>
          </Box>

          <Card>
            <CardContent>
              <Stack spacing={2}>
                {error ? <Alert severity="error">{error}</Alert> : null}

                <TextField
                  label="Session title (optional)"
                  placeholder="e.g., Clockwork LLM Workshop"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Join code (optional)"
                  placeholder="Leave blank to generate"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  inputProps={{ autoCapitalize: "characters" }}
                  fullWidth
                />

                <Button variant="contained" color="primary" onClick={onCreate} disabled={creating}>
                  {creating ? "Creating…" : "Create session"}
                </Button>

                {created ? (
                  <>
                    <Divider />
                    <Stack spacing={1.25}>
                      <Typography sx={{ fontWeight: 900 }}>
                        Created session: <code>{created.joinCode}</code>
                      </Typography>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap flexWrap="wrap">
                        {joinUrl ? (
                          <Button component={Link} href={joinUrl} variant="outlined">
                            Open join page
                          </Button>
                        ) : null}
                        {wallboardUrl ? (
                          <Button component={Link} href={wallboardUrl} variant="outlined">
                            Open wallboard
                          </Button>
                        ) : null}
                        {adminUrl ? (
                          <Button component={Link} href={adminUrl} variant="outlined">
                            Open control center
                          </Button>
                        ) : null}
                      </Stack>

                      {joinUrl ? (
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                          <Typography sx={{ color: "text.secondary", minWidth: 110 }}>Join link:</Typography>
                          <Typography component="code" sx={{ flex: 1, bgcolor: "rgba(0,0,0,0.04)", px: 1, py: 0.5, borderRadius: 1 }}>
                            {joinUrl}
                          </Typography>
                          <Button variant="text" onClick={() => copy(joinUrl)}>
                            Copy
                          </Button>
                        </Stack>
                      ) : null}

                      {wallboardUrl ? (
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                          <Typography sx={{ color: "text.secondary", minWidth: 110 }}>Wallboard link:</Typography>
                          <Typography component="code" sx={{ flex: 1, bgcolor: "rgba(0,0,0,0.04)", px: 1, py: 0.5, borderRadius: 1 }}>
                            {wallboardUrl}
                          </Typography>
                          <Button variant="text" onClick={() => copy(wallboardUrl)}>
                            Copy
                          </Button>
                        </Stack>
                      ) : null}

                      {adminUrl ? (
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                          <Typography sx={{ color: "text.secondary", minWidth: 110 }}>Admin link:</Typography>
                          <Typography component="code" sx={{ flex: 1, bgcolor: "rgba(0,0,0,0.04)", px: 1, py: 0.5, borderRadius: 1 }}>
                            {adminUrl}
                          </Typography>
                          <Button variant="text" onClick={() => copy(adminUrl)}>
                            Copy
                          </Button>
                        </Stack>
                      ) : null}
                    </Stack>
                  </>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </>
  );
}


