// src/components/Header.tsx
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", path: "/" },

  // Core calculators
  { label: "SIP", path: "/sip" },
  { label: "SIP per Day", path: "/sip-per-day" },
  { label: "Step-Up SIP", path: "/step-up-sip" },
  { label: "Lumpsum", path: "/lumpsum" },
  { label: "FD", path: "/fd" },
  { label: "RD", path: "/rd" },
  { label: "PPF", path: "/ppf" },
  { label: "EMI", path: "/emi" },
  { label: "Tax", path: "/tax" },
  { label: "Retirement", path: "/retirement" },
  { label: "CAGR", path: "/cagr" },
  { label: "SWP", path: "/swp" },

  // Mutual fund research
  { label: "AMC Performance", path: "/mutual-funds/amc-performance" },
  { label: "SIP Performance", path: "/mutual-funds/sip-performance" },
  { label: "SIP AMC Wise", path: "/mutual-funds/sip-amc-wise" },
  { label: "MF Lumpsum", path: "/mutual-funds/lumpsum-performance" },
  { label: "MF SWP Category", path: "/mutual-funds/swp-category-performance" },
  { label: "MF Goal SIP", path: "/mutual-funds/goal-sip-planner" },
  { label: "MF Live Return", path: "/mutual-funds/live-return" },
  { label: "MF Portfolio", path: "/mutual-funds/portfolio-return" },
  { label: "MF NAV History", path: "/mutual-funds/nav-history" },
  { label: "MF Rolling Returns", path: "/mutual-funds/rolling-returns" },
  { label: "MF Compare", path: "/mutual-funds/compare-funds" },
];

export default function Header() {
  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        borderBottom: "1px solid rgba(148,163,184,0.35)",
        backgroundColor: "rgba(248,250,252,0.95)",
        backdropFilter: "blur(14px)",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{ display: "flex", justifyContent: "space-between", gap: 4 }}
        >
          <Typography
            variant="h6"
            component={NavLink}
            to="/"
            sx={{
              textDecoration: "none",
              color: "text.primary",
              fontWeight: 700,
            }}
          >
            FinancialGlacier
          </Typography>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 0.5,
              flexWrap: "wrap",          // 👈 allow wrapping onto 2nd row
              justifyContent: "flex-end",
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={NavLink}
                to={item.path}
                size="small"
                sx={{
                  fontSize: 13,
                  textTransform: "none",
                  "&.active": {
                    color: "primary.main",
                    fontWeight: 600,
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
