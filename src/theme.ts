// src/theme.ts
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f766e", // teal
    },
    secondary: {
      main: "#2563eb", // blue
    },
    background: {
      default: "#f4f7fb", // page background
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
  },
  typography: {
    fontFamily: [
      "Inter",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "sans-serif",
    ].join(","),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    body1: { fontSize: 14 },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: "1px solid rgba(148,163,184,0.25)",
          boxShadow:
            "0 18px 45px rgba(15,23,42,0.08), 0 0 0 1px rgba(148,163,184,0.1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 999,
          fontWeight: 600,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 3,
        },
      },
    },
  },
});
