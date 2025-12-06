import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import MfCompareFundsCalculator from "../features/calculators/MfCompareFundsCalculator";
  
  export default function MfCompareFundsPage() {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Mutual Fund Compare – Side by Side
        </Typography>
  
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
        >
          Compare 2–3 mutual funds side-by-side on CAGR, corpus created, AUM,
          expense ratio and risk. This helps you quickly shortlist the right fund
          for your goal instead of checking each fact sheet separately.
        </Typography>
  
        <MfCompareFundsCalculator />
  
        {/* FAQ section */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
          >
            Mutual Fund Comparison – FAQs
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="compare-faq-1-content"
              id="compare-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                What should I focus on when comparing funds?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Look at consistency of returns (3Y, 5Y, 10Y CAGR), expense ratio,
                AUM size and risk level. A slightly lower return with more
                stability and lower expenses can often be better for long-term
                goals than the highest return with very high volatility.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="compare-faq-2-content"
              id="compare-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Will this tool use live data in future?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Yes. The backend can connect to AMFI or SEBI–registered data
                providers to fetch live NAV, AUM, risk scores and performance
                numbers. The API response is structured so that AI models and
                search engines can reuse your comparison results directly.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  