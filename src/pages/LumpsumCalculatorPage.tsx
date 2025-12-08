// src/pages/LumpsumCalculatorPage.tsx
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LumpsumCalculator from "../features/calculators/LumpsumCalculator";

export default function LumpsumCalculatorPage() {
  return (
    <Box>
      {/* PAGE HEADING */}
      <Typography variant="h5" sx={{ mb: 1 }}>
        Lumpsum Investment Calculator
      </Typography>

      {/* INTRO TEXT – SEO FRIENDLY */}
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          mb: 3,
          maxWidth: "100%",
        }}
      >
        Use this Lumpsum Investment Calculator on{" "}
        <strong>FinancialGlacier</strong> to estimate how much your one-time
        investment can grow over time. Enter your investment amount, expected
        annual return and time period to see the total value and wealth created.
      </Typography>

      {/* MAIN CALCULATOR + CHARTS */}
      <LumpsumCalculator />

      {/* FAQ SECTION – UNDER CALCULATOR */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
        >
          Lumpsum Calculator – Frequently Asked Questions
        </Typography>

        <Accordion disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" fontWeight={500}>
              What is a lumpsum investment?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              A lumpsum investment means investing a single, one-time amount
              instead of investing monthly like SIP. For example, putting
              ₹1,00,000 at once into a mutual fund is a lumpsum investment.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" fontWeight={500}>
              Is lumpsum better than SIP?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              There is no fixed answer. Lumpsum can work well if markets are at
              attractive levels and you have a big amount ready. SIP spreads
              your investment over time and reduces market timing risk. Many
              investors use both together.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" fontWeight={500}>
              What return rate should I use in this calculator?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              You can start with the historical average returns of the product
              you&apos;re investing in (for example, 10–12% p.a. for equity
              mutual funds over the long term). Always be conservative and use a
              slightly lower rate than the best case.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
}
