// src/pages/AmcPerformancePage.tsx
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import AmcPerformanceCalculator from "../features/calculators/AmcPerformanceCalculator";
  
  export default function AmcPerformancePage() {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          AMC-wise Mutual Fund Performance
        </Typography>
  
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
        >
          Analyse how different mutual fund schemes from the same fund house
          (AMC) have performed over a selected time period. Enter a lump sum
          amount, choose an AMC and period, and this tool will show scheme-wise
          returns, CAGR and current value so you can easily shortlist the best
          performers.
        </Typography>
  
        <AmcPerformanceCalculator />
  
        <Box sx={{ mt: 6, mb: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}>
            AMC-wise Mutual Fund Performance – FAQ
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="amc-faq-1-content"
              id="amc-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                What is an AMC in mutual funds?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                AMC stands for Asset Management Company. It is the mutual fund
                house which manages multiple schemes – for example, HDFC Mutual
                Fund, SBI Mutual Fund, ICICI Prudential Mutual Fund. Each AMC
                launches and manages many equity, debt and hybrid schemes.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="amc-faq-2-content"
              id="amc-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                How should I use this AMC-wise performance tool?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Pick an AMC you are interested in, choose a reasonable amount
                (for example, ₹1,00,000) and select a time period. The tool will
                show how each scheme of that AMC has grown in that period. You
                can then focus on schemes with consistent returns and suitable
                categories (large cap, flexi cap, ELSS etc.).
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="amc-faq-3-content"
              id="amc-faq-3-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Are these AMC-wise returns guaranteed for the future?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                No. The numbers shown are based on past data for the chosen
                period and are meant for analysis only. Mutual fund returns
                depend on market conditions and future performance can be very
                different. Always read the scheme documents and consider your
                risk profile before investing.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  