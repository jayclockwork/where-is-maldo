"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Box, Button, Container, Stack, TextField, Typography } from "@mui/material";

import { SiteAppBar } from "@/components/SiteAppBar";

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export default function JoinCodePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const normalized = useMemo(() => normalizeCode(code), [code]);
  const canSubmit = normalized.length > 0;

  function submit() {
    if (!canSubmit) {
      setError("Enter a session code.");
      return;
    }
    setError(null);
    router.push(`/s/${encodeURIComponent(normalized)}`);
  }

  return (
    <>
      <SiteAppBar showJoinSession={false} />
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
              Join a session
            </Typography>
            <Typography sx={{ color: "text.secondary", mt: 1 }}>
              Enter the code your host shared.
            </Typography>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label="Session code"
            placeholder="e.g., DEMO20"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            inputProps={{ autoCapitalize: "characters", style: { textTransform: "uppercase" } }}
            fullWidth
          />

          <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
            <Button variant="contained" color="primary" onClick={submit} disabled={!canSubmit}>
              Continue →
            </Button>
            <Button component={Link} href="/" variant="text">
              Home
            </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

