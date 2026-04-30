"use client";

import NextLink from "next/link";
import { Box, Container, Link, Typography } from "@mui/material";

const CLOCKWORK_URL = "https://www.clockwork.com/";

export function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: "1px solid rgba(0,0,0,0.08)",
        py: 3,
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          alignItems: "center",
          columnGap: 2,
          rowGap: 2,
        }}
      >
        <Box
          component="img"
          src="/Clockwork.svg"
          alt=""
          width={93}
          height={48}
          sx={{ height: 36, width: "auto", display: "block" }}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          component="p"
          sx={{ m: 0, justifySelf: "end", textAlign: "right" }}
        >
          Runs like{" "}
          <Link
            component={NextLink}
            href={CLOCKWORK_URL}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ fontWeight: 700 }}
          >
            Clockwork
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}
