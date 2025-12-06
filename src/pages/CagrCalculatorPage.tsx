// src/pages/CagrCalculatorPage.tsx
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import CagrCalculator from "../features/calculators/CagrCalculator";
  
  export default function CagrCalculatorPage() {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          CAGR Calculator – Compound Annual Growth Rate
        </Typography>
  
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
        >
          Use this CAGR calculator to find the compound annual growth rate of your
          investment. Enter the initial value, final value and holding period to
          see the yearly growth rate and value progression.
        </Typography>
  
        <CagrCalculator />
  
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
          >
            CAGR Calculator – Frequently Asked Questions
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="cagr-faq-1-content"
              id="cagr-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                What is CAGR?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                CAGR (Compound Annual Growth Rate) is the fixed annual growth rate
                that would take your investment from its starting value to its
                ending value over a given time period. It smooths out ups and
                downs and expresses growth as a single yearly percentage.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="cagr-faq-2-content"
              id="cagr-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                How is CAGR different from simple returns?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Simple returns look at total gain over the period, while CAGR
                tells you the equivalent constant yearly rate. CAGR is more useful
                when comparing investments held for different time periods.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  