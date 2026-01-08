"use client";

import Link from "next/link";
import { Box, Button, Card, CardContent, Container, Stack, Typography } from "@mui/material";
import { SiteAppBar } from "@/components/SiteAppBar";

export default function Home() {
  return (
    <>
      <SiteAppBar />

      <Box sx={{ bgcolor: "secondary.main", color: "secondary.contrastText", py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Stack spacing={3} sx={{ maxWidth: 860 }}>
            <Typography variant="h2" component="h1" sx={{ lineHeight: 1.05 }}>
              Map your engineering team’s LLM journey.
            </Typography>
            <Typography variant="h5" sx={{ color: "rgba(0,0,0,0.75)", maxWidth: 720 }}>
              The common phases software engineers go through when adopting LLMs, built for
              reading and for live workshops.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
              <Button component={Link} href="/journey" variant="contained" color="primary" size="large">
                View Journey
              </Button>
              <Button variant="outlined" color="inherit" size="large" component={Link} href="/w/DEMO20">
                View Wallboard
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
                  Open Journey →
                </Button>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Run a live session (soon)
                </Typography>
                <Typography sx={{ color: "text.secondary", mt: 1 }}>
                  Participants join with a code and toggle what they’re doing. Updates appear live for everyone.
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: "wrap" }}>
                  <Button variant="text" component={Link} href="/s/DEMO20">
                    Join Session →
                  </Button>
                  <Button variant="text" component={Link} href="/w/DEMO20">
                    View Wallboard →
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}
