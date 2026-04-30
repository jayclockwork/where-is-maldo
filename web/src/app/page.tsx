"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Container, Stack, Typography } from "@mui/material";
import { SiteAppBar } from "@/components/SiteAppBar";

function readLastJoinCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const code = window.localStorage.getItem("lastJoinCode");
    return code ? code.toUpperCase() : null;
  } catch {
    return null;
  }
}

export default function Home() {
  const [lastJoinCode, setLastJoinCode] = useState<string | null>(() => readLastJoinCode());

  // Keep in sync across tabs/windows; avoids setState directly in the effect body (lint rule).
  useEffect(() => {
    const handler = () => setLastJoinCode(readLastJoinCode());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <>
      <SiteAppBar />

      <Box sx={{ bgcolor: "secondary.main", color: "secondary.contrastText", py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Stack spacing={3} sx={{ maxWidth: 860 }}>
            <Typography variant="h2" component="h1" sx={{ lineHeight: 1.05 }}>
              Map your engineering team’s LLM adoption.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
              <Button component={Link} href="/journey" variant="contained" color="primary" size="large">
                View Journey
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Stack spacing={3}>
          <Typography variant="h4" component="h2">
            What you can do here
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Read the journey
                </Typography>
                <Typography sx={{ color: "text.secondary", mt: 1 }}>
                  Navigate phases, collapse sections, and share deep links to specific phases.
                </Typography>
                <Button component={Link} href="/journey" sx={{ mt: 2 }} variant="text">
                  View Journey →
                </Button>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Run a live session
                </Typography>
                <Typography sx={{ color: "text.secondary", mt: 1 }}>
                  Participants join with a code and indicate what they’re doing. Updates appear live for everyone.
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: "wrap" }}>
                  <Button variant="text" component={Link} href="/host">
                    Create session →
                  </Button>
                  <Button variant="text" component={Link} href="/join">
                    Join Session →
                  </Button>
                  {lastJoinCode ? (
                    <Button variant="text" component={Link} href={`/w/${encodeURIComponent(lastJoinCode)}`}>
                      View Wallboard →
                    </Button>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}
