// src/pages/FdCalculatorPage.tsx
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import FdCalculator from "../features/calculators/FdCalculator";
  
  export default function FdCalculatorPage() {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          FD Calculator
        </Typography>
  
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
        >
          Use this Fixed Deposit (FD) calculator to estimate the maturity amount
          and total interest earned for your FD. Enter your deposit amount,
          interest rate and tenure to see how much you can get on maturity.
        </Typography>
  
        <FdCalculator />
  
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
          >
            FD Calculator – Frequently Asked Questions
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="fd-faq-1-content"
              id="fd-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                What is a Fixed Deposit (FD)?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                A Fixed Deposit (FD) is a savings product where you deposit a
                lump sum amount with a bank or NBFC for a fixed period at a fixed
                interest rate. You earn interest on the deposit and receive the
                maturity amount at the end of the tenure.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="fd-faq-2-content"
              id="fd-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Are FD returns guaranteed?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Yes, FD returns are generally guaranteed as per the interest rate
                offered by the bank at the time of booking the FD. However,
                credit risk depends on the safety of the bank or financial
                institution.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="fd-faq-3-content"
              id="fd-faq-3-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Does this FD calculator include tax or TDS?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                No, this calculator shows pre-tax maturity amounts. In reality,
                interest from FDs may be subject to TDS and income tax as per
                your tax slab.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  