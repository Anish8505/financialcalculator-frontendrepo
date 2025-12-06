// src/pages/LumpsumCategoryPerformancePage.tsx
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import LumpsumCategoryPerformanceCalculator from "../features/calculators/LumpsumCategoryPerformanceCalculator";
  
  export default function LumpsumCategoryPerformancePage() {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Lumpsum Mutual Fund Performance – Category Wise
        </Typography>
  
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
        >
          Check how a one-time lumpsum investment in different mutual funds of
          the same category would have grown over time. Select an AMC (or All
          AMCs), choose a category, pick a time period and enter your investment
          amount. The tool shows final corpus, absolute returns and CAGR for each
          scheme.
        </Typography>
  
        <LumpsumCategoryPerformanceCalculator />
  
        {/* FAQ section */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
          >
            Lumpsum Category Performance – Frequently Asked Questions
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="lump-cat-faq-1-content"
              id="lump-cat-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                When should I use a lumpsum investment instead of SIP?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Lumpsum is useful when you have a large amount ready to invest,
                for example bonus, inheritance or sale proceeds. SIP is better
                when your cashflows are monthly and you want to average out
                volatility. This tool helps you see how a past lumpsum would have
                grown in different funds of the same category.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="lump-cat-faq-2-content"
              id="lump-cat-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Are these returns guaranteed for future investments?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                No. The numbers are based on historical performance and
                assumptions. Markets are risky and future returns can be very
                different. Use this as a research and comparison tool, not a
                guarantee of returns.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="lump-cat-faq-3-content"
              id="lump-cat-faq-3-header"
            >
              <Typography variant="body2" fontWeight={500}>
                How will this page use live mutual fund data in future?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                In production, the backend can fetch scheme list and NAV history
                from AMFI or an authorised data provider. It can then compute
                lumpsum growth and CAGR for each scheme and return the results in
                the same JSON format used by this page, so AI tools and search
                engines can read and reuse the data.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  