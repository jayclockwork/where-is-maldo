"use client";

import Link from "next/link";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";

export function SiteAppBar({
  showJoinSession = true,
  rightActions,
}: {
  showJoinSession?: boolean;
  rightActions?: React.ReactNode;
}) {
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
              Clockwork
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", display: { xs: "none", sm: "block" } }}>
              LLM Adoption Journey
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {rightActions ?? null}
            {showJoinSession ? (
              <Button
                color="primary"
                variant="contained"
                component={Link}
                href="/join"
              >
                Join a Session
              </Button>
            ) : null}
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
}


