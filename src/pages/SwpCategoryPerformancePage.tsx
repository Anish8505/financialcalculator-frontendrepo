// src/pages/SwpCategoryPerformancePage.tsx
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import SwpCategoryPerformanceCalculator from "../features/calculators/SwpCategoryPerformanceCalculator";
  
  export default function SwpCategoryPerformancePage() {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          SWP Mutual Fund Performance – Category Wise
        </Typography>
  
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
        >
          See how a Systematic Withdrawal Plan (SWP) from different mutual funds
          in the same category would have behaved. Select an AMC (or All AMCs),
          choose a category, pick a time period and enter your starting corpus and
          monthly withdrawal amount. The tool shows total withdrawn amount,
          remaining corpus and CAGR for each scheme.
        </Typography>
  
        <SwpCategoryPerformanceCalculator />
  
        {/* FAQ section */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
          >
            SWP Category Performance – Frequently Asked Questions
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="swp-cat-faq-1-content"
              id="swp-cat-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Who should use SWP instead of normal redemption?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                SWP is useful for retirees or people who need regular monthly
                income from their investments. Instead of withdrawing a large
                lump sum, you take a fixed amount every month while the remaining
                corpus continues to stay invested in the market.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="swp-cat-faq-2-content"
              id="swp-cat-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Are these SWP results guaranteed for the future?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                No. These are based on historical assumptions and do not guarantee
                future performance. Markets are volatile and actual returns can be
                different. Use this as a research tool to understand how SWP risk
                works across different categories.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="swp-cat-faq-3-content"
              id="swp-cat-faq-3-header"
            >
              <Typography variant="body2" fontWeight={500}>
                From where will live data be fetched in production?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                In a live version, your backend can fetch scheme list and NAV
                history from AMFI or SEBI–registered data vendors. It can then
                compute SWP cash flows and remaining corpus for each scheme and
                serve that in the same JSON format that this page already
                consumes.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  