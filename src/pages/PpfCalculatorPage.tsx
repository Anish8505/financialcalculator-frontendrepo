import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import PpfCalculator from "../features/calculators/PpfCalculator";
  
  export default function PpfCalculatorPage() {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          PPF Calculator – Public Provident Fund
        </Typography>
  
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
        >
          Use this PPF (Public Provident Fund) calculator to estimate how much
          wealth you can build by investing a fixed amount every year in your PPF
          account. Enter your yearly contribution, interest rate and tenure to see
          total investment, maturity amount and interest earned.
        </Typography>
  
        <PpfCalculator />
  
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
          >
            PPF Calculator – Frequently Asked Questions
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="ppf-faq-1-content"
              id="ppf-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                What is PPF (Public Provident Fund)?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                PPF is a long-term, government-backed savings scheme that offers
                tax benefits and guaranteed returns. You invest regularly in your
                PPF account and get a lump-sum maturity amount after the lock-in
                period, usually 15 years.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="ppf-faq-2-content"
              id="ppf-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                How much can I invest in PPF every year?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Currently, you can invest a minimum of ₹500 and a maximum of
                ₹1,50,000 in a financial year in your PPF account. Our calculator
                lets you try different yearly contribution amounts within or
                outside this range for comparison.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="ppf-faq-3-content"
              id="ppf-faq-3-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Does this PPF calculator use the exact bank calculation method?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                This calculator uses a simplified annual compounding model with
                yearly contributions at the start of each year. Actual PPF
                interest is calculated monthly and credited yearly, but results
                will usually be in a similar range for planning purposes.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  