import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MfRollingReturnCalculator from "../features/calculators/MfRollingReturnCalculator";

export default function MfRollingReturnPage() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Mutual Fund Rolling Return Calculator
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
      >
        Analyse how consistently a mutual fund has delivered returns over
        different time windows. Rolling returns help you see not just one
        period&apos;s performance, but how the fund behaved across multiple
        overlapping periods.
      </Typography>

      <MfRollingReturnCalculator />

      {/* FAQ section */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
        >
          Rolling Returns – Frequently Asked Questions
        </Typography>

        <Accordion disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="rolling-faq-1-content"
            id="rolling-faq-1-header"
          >
            <Typography variant="body2" fontWeight={500}>
              Why are rolling returns better than point-to-point returns?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              Point-to-point returns only tell you how a fund performed between
              two specific dates. Rolling returns show performance across many
              overlapping periods, which captures consistency and reduces the
              impact of lucky or unlucky entry dates.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="rolling-faq-2-content"
            id="rolling-faq-2-header"
          >
            <Typography variant="body2" fontWeight={500}>
              How will this work with live mutual fund data?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              In production, the backend can pull daily NAV history from AMFI or
              a SEBI–registered provider and compute rolling returns using actual
              data. This demo uses synthetic returns, but the JSON structure is
              ready for real integration.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
}
