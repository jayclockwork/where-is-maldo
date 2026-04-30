"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Alert, Box, Button, CircularProgress, Container, Stack, Typography } from "@mui/material";
import { SiteAppBar } from "@/components/SiteAppBar";

type ByCodeResponse = {
  session: { id: string; joinCode: string };
};

export default function WallboardByCodePage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? "").toString().trim();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!code) {
        setError("Missing session code.");
        return;
      }

      const res = await fetch(`/api/sessions/by-code/${encodeURIComponent(code)}`, { cache: "no-store" });
      if (!alive) return;

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Session not found.");
        return;
      }

      const data = (await res.json()) as ByCodeResponse;
      const sessionId = data.session?.id;
      if (!sessionId) {
        setError("Session not found.");
        return;
      }

      const sp = new URLSearchParams(searchParams.toString());
      if (!sp.has("kiosk")) sp.set("kiosk", "1");
      const qs = sp.toString();
      window.location.replace(`/wallboard/${encodeURIComponent(sessionId)}${qs ? `?${qs}` : ""}`);
    }

    void run();
    return () => {
      alive = false;
    };
  }, [code, searchParams]);

  return (
    <>
      <SiteAppBar />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={2.5}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
            Opening wallboard…
          </Typography>

          {error ? (
            <Alert
              severity="error"
              action={
                <Button component={Link} href="/" color="inherit" size="small">
                  Home
                </Button>
              }
            >
              {error}
            </Alert>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CircularProgress size={20} />
              <Typography sx={{ color: "text.secondary" }}>Looking up session {code}…</Typography>
            </Box>
          )}

          <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
            <Button component={Link} href="/" variant="text">
              Home
            </Button>
            <Button component={Link} href={`/s/${encodeURIComponent(code)}`} variant="text">
              Join a session →
            </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

