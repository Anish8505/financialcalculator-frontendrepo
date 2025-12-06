// src/components/Footer.tsx
import { Box, Container, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: "1px solid rgba(148,163,184,0.3)",
        py: 2,
        backgroundColor: "#f8fafc",
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} FinancialGlacier · Smart Calculators for
          Indian Investors
        </Typography>
      </Container>
    </Box>
  );
}
