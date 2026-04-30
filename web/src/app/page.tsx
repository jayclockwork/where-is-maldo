"use client";

import type { ReactNode } from "react";
import GroupsIcon from "@mui/icons-material/Groups";
import LoginIcon from "@mui/icons-material/Login";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import Image from "next/image";
import Link from "next/link";
import { Box, Button, Card, CardActionArea, CardContent, Container, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { SiteAppBar } from "@/components/SiteAppBar";

function HomeLinkCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        height: "100%",
      }}
    >
      <CardActionArea
        component={Link}
        href={href}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          alignSelf: "stretch",
          textAlign: "left",
          p: 0,
        }}
      >
        <Box
          aria-hidden
          sx={{
            flexShrink: 0,
            width: { xs: 72, sm: 80 },
            alignSelf: "stretch",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
            color: "primary.main",
          }}
        >
          {icon}
        </Box>
        <CardContent
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            py: 2,
            px: 2,
            "&:last-child": { pb: 2 },
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          <Typography sx={{ color: "text.secondary", flex: 1 }}>{description}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function Home() {
  return (
    <>
      <SiteAppBar />

      <Box
        sx={{
          bgcolor: "secondary.main",
          color: "secondary.contrastText",
          display: "flex",
          flexDirection: { xs: "column-reverse", md: "row" },
          alignItems: "stretch",
          gap: { xs: 4, md: 6 },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            flex: { md: "1 1 0" },
            minWidth: 0,
            display: "flex",
            alignItems: "flex-start",
            py: { xs: 6, md: 10 },
          }}
        >
          <Stack spacing={3} sx={{ width: "100%", maxWidth: { md: 560 }, pl: { md: 4 } }}>
            <Stack spacing={1.5}>
              <Typography variant="h2" component="h1" sx={{ lineHeight: 1.05 }}>
                Where’s Maldo?
              </Typography>
              <Typography
                variant="h6"
                component="p"
                sx={{
                  color: "inherit",
                  opacity: 0.92,
                  lineHeight: 1.4,
                  maxWidth: 520,
                  fontWeight: 400,
                }}
              >
                Find your team’s place on an LLM adoption journey
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
              <Button component={Link} href="/journey" variant="contained" color="primary" size="large">
                Start exploring
              </Button>
            </Stack>
          </Stack>
        </Container>

        <Box
          sx={{
            position: "relative",
            flex: { md: "0 0 min(44vw, 560px)" },
            width: { xs: "100%", md: "auto" },
            alignSelf: "stretch",
            minHeight: { xs: 260 },
            overflow: "hidden",
            borderRadius: 0,
            maxWidth: { xs: 560, md: "none" },
            mx: { xs: "auto", md: 0 },
          }}
        >
          <Image
            src="/maldo.png"
            alt="A friendly robot character walks a cobblestone path through a bright green hedge maze, with a gazebo, fountain, and butterflies in the distance."
            priority
            fill
            sizes="(max-width: 900px) min(100vw - 48px, 560px), 44vw"
            style={{ objectFit: "cover", objectPosition: "right center" }}
          />
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Box
          sx={{
            mx: "auto",
            width: "100%",
            maxWidth: { md: 720, lg: 1000 },
            px: { xs: 0, md: 3, lg: 5 },
          }}
        >
          <Stack spacing={3}>
            <Typography variant="h4" component="h2">
              Explore, host, or join
            </Typography>

            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", lg: "repeat(3, minmax(0, 1fr))" },
                alignItems: "stretch",
              }}
            >
              <HomeLinkCard
                href="/journey"
                icon={<TravelExploreIcon sx={{ fontSize: 40 }} />}
                title="Explore the journey"
                description="Read about the levels and their behaviors, habits, and examples."
              />
              <HomeLinkCard
                href="/host"
                icon={<GroupsIcon sx={{ fontSize: 40 }} />}
                title="Create a team session"
                description="Start a live session so your team can reflect, respond, and see where adoption is landing across the group."
              />
              <HomeLinkCard
                href="/join"
                icon={<LoginIcon sx={{ fontSize: 40 }} />}
                title="Join a session"
                description="Enter a session code to add your responses to a live team session already in progress."
              />
            </Box>
          </Stack>
        </Box>
      </Container>
    </>
  );
}
