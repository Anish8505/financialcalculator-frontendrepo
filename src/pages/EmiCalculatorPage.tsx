import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import EmiCalculator from "../features/calculators/EmiCalculator";
  
  export default function EmiCalculatorPage() {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          EMI Calculator
        </Typography>
  
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
        >
          Use this EMI (Equated Monthly Instalment) calculator to estimate your
          monthly EMI, total interest and total payment for any home loan, car
          loan or personal loan. Enter your loan amount, interest rate and tenure
          to see how your loan behaves over time.
        </Typography>
  
        <EmiCalculator />
  
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
          >
            EMI Calculator – Frequently Asked Questions
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="emi-faq-1-content"
              id="emi-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                What is an EMI?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                EMI (Equated Monthly Instalment) is the fixed amount you pay every
                month to repay a loan. It includes both principal and interest
                components and continues until the loan is fully paid.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="emi-faq-2-content"
              id="emi-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Does the EMI amount change over time?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                For most fixed-rate loans, the EMI remains constant for the entire
                tenure. However, the proportion of interest and principal inside
                the EMI changes every month. In floating-rate loans, the EMI or
                tenure can change when the interest rate changes.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="emi-faq-3-content"
              id="emi-faq-3-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Does this EMI calculator consider prepayment or part-payment?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                No, this EMI calculator assumes no prepayments. It calculates EMI,
                total interest and amortization based on a fixed tenure and rate.
                In reality, part-payments can reduce your interest outgo and loan
                duration.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  