import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import StepUpSipCalculator from "../features/calculators/StepUpSipCalculator";
  
  export default function StepUpSipCalculatorPage() {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Step-Up SIP Calculator
        </Typography>
  
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
        >
          Plan a SIP that grows with your income. Start with a comfortable monthly
          SIP and increase it every year by a fixed percentage or amount. This
          calculator shows how your total investment and final corpus change with
          a step-up strategy.
        </Typography>
  
        <StepUpSipCalculator />
  
        {/* FAQ section */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
          >
            Step-Up SIP – Frequently Asked Questions
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="stepup-faq-1-content"
              id="stepup-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Why should I use Step-Up SIP instead of a normal SIP?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Step-Up SIP lets you start small and automatically increase your
                investment as your income grows. This helps you build discipline
                early and still reach big goals like retirement, child education
                or buying a house.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="stepup-faq-2-content"
              id="stepup-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Which is better – percentage step-up or fixed amount?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Percentage step-up (like 10% every year) keeps the increase
                proportional to your SIP size. Fixed amount step-up (like ₹1,000
                extra per year) is simpler to understand. You can test both
                options using this calculator and see what fits your cash flow.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="stepup-faq-3-content"
              id="stepup-faq-3-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Does this guarantee the future corpus?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                No. The corpus depends on actual mutual fund returns which can be
                higher or lower than the assumed rate. Use this tool for planning,
                but always review your investments and adjust the SIP whenever
                your income or goals change.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  