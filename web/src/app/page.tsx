"use client";

import Image from "next/image";
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
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 4, md: 6 }}
            alignItems="center"
          >
            <Stack spacing={3} sx={{ flex: 1, minWidth: 0, maxWidth: { md: 560 }, pl: { md: 4 } }}>
              <Typography variant="h2" component="h1" sx={{ lineHeight: 1.05 }}>
                Map your engineering team’s LLM adoption.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                <Button component={Link} href="/journey" variant="contained" color="primary" size="large">
                  View the Journey
                </Button>
              </Stack>
            </Stack>

            <Box
              sx={{
                flex: { md: "0 1 50%" },
                width: "100%",
                maxWidth: { xs: 560, md: "none" },
                mx: { xs: "auto", md: 0 },
                borderRadius: 2,
                overflow: "hidden",
                lineHeight: 0,
              }}
            >
              <Image
                src="/maldo.png"
                alt="A friendly robot character walks a cobblestone path through a bright green hedge maze, with a gazebo, fountain, and butterflies in the distance."
                width={1440}
                height={1072}
                priority
                sizes="(max-width: 900px) min(100vw - 48px, 560px), 50vw"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </Box>
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
                    Join a Session →
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
