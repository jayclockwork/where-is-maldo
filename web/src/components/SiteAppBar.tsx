"use client";

import Link from "next/link";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";

export function SiteAppBar() {
  return (
    <AppBar position="sticky">
      <Toolbar disableGutters>
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            py: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography component={Link} href="/" variant="h6" sx={{ fontWeight: 900 }}>
              Journey Mapping
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", display: { xs: "none", sm: "block" } }}>
              LLM adoption journey
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button component={Link} href="/journey" color="inherit" variant="text">
              Journey
            </Button>
            <Button
              color="primary"
              variant="contained"
              disabled
              aria-disabled
              title="Join sessions is part of PRD 002"
            >
              Join Session
            </Button>
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
}


