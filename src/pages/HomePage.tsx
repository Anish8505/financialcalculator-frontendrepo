// src/pages/HomePage.tsx
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import MuiGrid from "@mui/material/Grid";
import { Link as RouterLink } from "react-router-dom";
import heroImage from "../assets/financialglacier-hero.png";

// Bypass over-strict TS types for Grid in this file only
const Grid: any = MuiGrid;

export default function HomePage() {
  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        {/* HERO SECTION WITH GLACIER IMAGE BACKGROUND */}
        <Box
          sx={{
            position: "relative",
            borderRadius: 4,
            overflow: "hidden",
            minHeight: 360,
            mb: 6,
            boxShadow: 4,
          }}
        >
          {/* Background image */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${heroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.9)",
            }}
          />

          {/* White gradient overlay so text is readable */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.82) 45%, rgba(255,255,255,0.1) 100%)",
            }}
          />

          {/* Text content on top of image */}
          <Box
            sx={{
              position: "relative",
              px: { xs: 4, md: 6 },
              py: { xs: 4, md: 6 },
              maxWidth: 560,
            }}
          >
            <Typography
              variant="overline"
              sx={{ letterSpacing: 2, color: "primary.main" }}
            >
              FinancialGlacier
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                lineHeight: 1.1,
              }}
            >
              Simplify your financial planning.
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: "text.secondary", mb: 3 }}
            >
              Plan SIPs, FDs, lumpsum investments, retirement corpus and more
              with clean, distraction-free calculators built for Indian
              investors.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/sip"
              >
                Start with SIP calculator
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to="/fd"
              >
                Explore all calculators
              </Button>
            </Box>
          </Box>
        </Box>

        {/* FEATURE CARDS UNDER HERO (SEO + INFO) */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Built for Indian investors
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Calculators tuned for Indian rupee, common interest rates and
                real-world use cases like SIPs, FDs, PPF and EMIs.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Transparent formulas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Every calculator shows the formula and assumptions used, so you
                always know how the numbers are derived.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                No clutter, just numbers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fast, clean UI designed to help you focus on planning, not
                fighting ads or pop-ups.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* NEW: MUTUAL FUND TOOLS SECTION (AI + SEO friendly) */}
        <Box sx={{ mt: 5 }}>
          <Paper sx={{ p: 3.5, borderRadius: 3, boxShadow: 1 }}>
            <Typography
              variant="h6"
              sx={{ mb: 1.5, fontSize: 18, fontWeight: 600 }}
            >
              Mutual fund research tools
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mb: 2, maxWidth: 720 }}
            >
              Compare mutual fund schemes AMC-wise and see how a single lumpsum
              investment would have performed across different funds. Use this
              to shortlist consistent performers before starting your SIP or
              lumpsum investment.
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              <Button
                variant="contained"
                size="medium"
                component={RouterLink}
                to="/mutual-funds/amc-performance"
              >
                AMC-wise performance tool
              </Button>
              <Typography
                variant="caption"
                sx={{ alignSelf: "center", color: "text.secondary" }}
              >
                New · Analyse AMC-wise returns and CAGR for top mutual funds.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
