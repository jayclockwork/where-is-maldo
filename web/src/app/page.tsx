"use client";

import Image from "next/image";
import Link from "next/link";
import { Box, Button, Card, CardActionArea, CardContent, Container, Stack, Typography } from "@mui/material";
import { SiteAppBar } from "@/components/SiteAppBar";

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
                View the Journey
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
                  href="/journey"
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    textAlign: "left",
                  }}
                >
                  <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Explore the journey
                    </Typography>
                    <Typography sx={{ color: "text.secondary", mt: 1, flex: 1 }}>
                      Read through the LLM adoption levels and see the behaviors, habits, and examples that define each
                      stage.
                    </Typography>
                  </CardContent>
                </CardActionArea>
            </Card>

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
                href="/host"
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  textAlign: "left",
                }}
              >
                <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Create a team session
                  </Typography>
                  <Typography sx={{ color: "text.secondary", mt: 1, flex: 1 }}>
                    Start a live session so your team can join, reflect on what they’re doing, and see where adoption is
                    landing across the group.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>

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
                href="/join"
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  textAlign: "left",
                }}
              >
                <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Join a session
                  </Typography>
                  <Typography sx={{ color: "text.secondary", mt: 1, flex: 1 }}>
                    Enter a session code to add your responses to a live team session already in progress.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
            </Box>
          </Stack>
        </Box>
      </Container>
    </>
  );
}
