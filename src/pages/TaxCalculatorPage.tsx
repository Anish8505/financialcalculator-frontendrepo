import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TaxCalculator from "../features/calculators/TaxCalculator";

export default function TaxCalculatorPage() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Income Tax Calculator (India)
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
      >
        Use this income tax calculator to estimate your annual income tax
        liability in India under the new tax regime. Enter your annual taxable
        income to see slab-wise tax, cess and effective tax rate.
      </Typography>

      <TaxCalculator />

      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
        >
          Income Tax Calculator – Frequently Asked Questions
        </Typography>

        <Accordion disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="tax-faq-1-content"
            id="tax-faq-1-header"
          >
            <Typography variant="body2" fontWeight={500}>
              What income should I enter here?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              Enter your estimated taxable income for the year – that is, income
              after standard deductions, exemptions and eligible deductions like
              80C, 80D, etc. This calculator gives an approximate tax estimate
              and is for guidance only.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="tax-faq-2-content"
            id="tax-faq-2-header"
          >
            <Typography variant="body2" fontWeight={500}>
              Does this follow the exact government rules?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              This is a simplified tax calculator based on slab rates similar to
              the new tax regime. Real-life tax calculations may differ depending
              on surcharges, rebates, deductions and other rules. Always verify
              with a tax professional or official calculator.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
}
