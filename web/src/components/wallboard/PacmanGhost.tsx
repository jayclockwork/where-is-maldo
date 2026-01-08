import { Box } from "@mui/material";

export function PacmanGhost({
  color,
  size = 26,
}: {
  color: string;
  size?: number;
}) {
  // Simple ghost SVG (Pac-man style). Color is provided by participant avatarColor.
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 64 64">
        <path
          d="M16 28c0-11 7.2-20 16-20s16 9 16 20v28l-5-4-6 4-5-4-6 4-5-4-5 4V28z"
          fill={color}
          stroke="rgba(0,0,0,0.22)"
          strokeWidth="2"
        />
        <circle cx="26" cy="30" r="5" fill="#fff" />
        <circle cx="38" cy="30" r="5" fill="#fff" />
        <circle cx="28" cy="30" r="2.2" fill="#111" />
        <circle cx="40" cy="30" r="2.2" fill="#111" />
      </svg>
    </Box>
  );
}

