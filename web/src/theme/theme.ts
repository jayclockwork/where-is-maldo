import { createTheme } from "@mui/material/styles";

// Approximate Clockwork cues: high contrast, bold type, signature yellow accent, strong blue CTAs.
export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0057FF", contrastText: "#FFFFFF" },
    secondary: { main: "#F5C400", contrastText: "#111111" },
    background: { default: "#FFFFFF", paper: "#FFFFFF" },
    text: { primary: "#111111", secondary: "#3A3A3A" },
  },
  typography: {
    fontFamily:
      'var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: -0.5 },
    h2: { fontWeight: 800, letterSpacing: -0.25 },
    h3: { fontWeight: 800 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#FFFFFF",
        },
        a: {
          color: "inherit",
          textDecoration: "none",
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          color: "#111111",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingLeft: 18,
          paddingRight: 18,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(0,0,0,0.10)",
        },
      },
    },
  },
});


