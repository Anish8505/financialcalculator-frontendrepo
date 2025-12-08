// src/pages/PpfCalculatorPage.tsx
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PpfCalculator from "../features/calculators/PpfCalculator";

export default function PpfCalculatorPage() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        PPF Calculator – Public Provident Fund
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
      >
        Use this PPF calculator to estimate maturity amount, interest earned, and
        yearly growth on your Public Provident Fund investments.
      </Typography>

      <PpfCalculator />

      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}>
          PPF Calculator – FAQs
        </Typography>

        <Accordion disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={500}>What is PPF?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            PPF is a government-backed savings scheme with guaranteed returns and
            tax benefits.
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={500}>
              How much can I invest yearly?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            You can invest between ₹500 and ₹1,50,000 per year.
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={500}>
              Does this match exact bank calculation?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            This calculator uses simplified annual compounding for easier
            estimation.
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
}
