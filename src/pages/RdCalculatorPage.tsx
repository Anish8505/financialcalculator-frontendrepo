import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import RdCalculator from "../features/calculators/RdCalculator";
  
  export default function RdCalculatorPage() {
    return (
      <Box>
        {/* PAGE HEADING */}
        <Typography variant="h5" sx={{ mb: 1 }}>
          RD Calculator – Recurring Deposit
        </Typography>
  
        {/* INTRO – SEO friendly */}
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
        >
          Use this RD (Recurring Deposit) calculator to estimate how much maturity
          amount you can get by investing a fixed amount every month in a bank
          recurring deposit. Enter your monthly RD amount, interest rate and
          tenure to see total deposits, maturity value and interest earned.
        </Typography>
  
        <RdCalculator />
  
        {/* FAQ SECTION */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
          >
            RD Calculator – Frequently Asked Questions
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="rd-faq-1-content"
              id="rd-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                What is a Recurring Deposit (RD)?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                A Recurring Deposit (RD) is a savings option where you invest a
                fixed amount every month for a fixed tenure. The bank pays
                interest on your deposits, and you receive a lump-sum maturity
                amount at the end of the tenure.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="rd-faq-2-content"
              id="rd-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Is RD interest guaranteed?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Yes, in traditional bank RDs the interest rate is usually fixed at
                the time of opening the RD, so the maturity amount is largely
                predictable. However, always check your bank&apos;s terms and any
                special conditions.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="rd-faq-3-content"
              id="rd-faq-3-header"
            >
              <Typography variant="body2" fontWeight={500}>
                What interest rate should I use in this RD calculator?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                You can use the RD interest rate offered by your bank for the
                chosen tenure (for example, 6.5% p.a. or 7% p.a.). You can also
                try different rates to compare maturity amounts across banks or
                tenures.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  