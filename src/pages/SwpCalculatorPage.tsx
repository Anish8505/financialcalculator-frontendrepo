// src/pages/SwpCalculatorPage.tsx
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import SwpCalculator from "../features/calculators/SwpCalculator";
  
  export default function SwpCalculatorPage() {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          SWP Calculator – Systematic Withdrawal Plan
        </Typography>
  
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
        >
          Use this SWP (Systematic Withdrawal Plan) calculator to estimate how
          long your corpus may last and what balance you might have left if you
          withdraw a fixed amount every month while your money continues to grow.
        </Typography>
  
        <SwpCalculator />
  
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
          >
            SWP Calculator – Frequently Asked Questions
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="swp-faq-1-content"
              id="swp-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                What is a Systematic Withdrawal Plan (SWP)?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                An SWP lets you withdraw a fixed amount from your investment at
                regular intervals (like every month), while the remaining amount
                stays invested and continues to grow.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="swp-faq-2-content"
              id="swp-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Is SWP better than keeping money in a savings account?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                SWP is usually used with debt or balanced funds which may offer
                better potential returns than a regular savings account, along
                with more flexibility in withdrawals. However, returns are market
                linked and not guaranteed.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  