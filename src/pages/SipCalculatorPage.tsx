// src/pages/SipCalculatorPage.tsx
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import SipCalculator from "../features/calculators/SipCalculator";
  
  export default function SipCalculatorPage() {
    return (
      <Box>
        {/* PAGE HEADING */}
        <Typography variant="h5" sx={{ mb: 1 }}>
          SIP Calculator
        </Typography>
  
        {/* INTRO TEXT – FULL WIDTH, SEO FRIENDLY */}
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 3,
            maxWidth: "100%",
          }}
        >
          Use this SIP (Systematic Investment Plan) calculator to estimate how
          much wealth you can create by investing a fixed amount every month.
          Enter your monthly SIP, expected annual return and time period to see
          the total amount invested, projected future value and wealth gained.
        </Typography>
  
        {/* MAIN CALCULATOR + CHARTS */}
        <SipCalculator />
  
        {/* FAQ SECTION – UNDER CALCULATOR */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
          >
            SIP Calculator – Frequently Asked Questions
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="sip-faq-1-content"
              id="sip-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                What is a Systematic Investment Plan (SIP)?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                A Systematic Investment Plan (SIP) lets you invest a fixed amount
                at regular intervals, usually every month, into mutual funds or
                other market–linked products. It helps you average out market ups
                and downs and build wealth gradually over time.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="sip-faq-2-content"
              id="sip-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Are SIP returns guaranteed?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                No. SIP returns depend on the performance of the underlying
                mutual fund or investment product. The calculator shows an
                estimate based on the annual return you enter, not a guaranteed
                rate of return.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="sip-faq-3-content"
              id="sip-faq-3-header"
            >
              <Typography variant="body2" fontWeight={500}>
                What return rate should I use in this SIP calculator?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                You can start with the historical average returns of the type of
                fund you plan to invest in (for example, 10–12% p.a. for equity
                funds over the long term). It&apos;s better to be conservative and
                use a slightly lower rate than the best–case scenario.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  