import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import RetirementCalculator from "../features/calculators/RetirementCalculator";
  
  export default function RetirementCalculatorPage() {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Retirement Calculator
        </Typography>
  
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
        >
          Use this retirement calculator to estimate how much corpus you may build
          by investing regularly until retirement. Enter your age, monthly
          investment, existing savings, expected return and inflation to see your
          retirement corpus and its value in today&apos;s terms.
        </Typography>
  
        <RetirementCalculator />
  
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
          >
            Retirement Calculator – Frequently Asked Questions
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="ret-faq-1-content"
              id="ret-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                How accurate is this retirement calculator?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                This calculator gives an estimate based on the return and inflation
                you enter. Actual results can differ because markets, inflation and
                your investments can change over time. Use it as a planning tool,
                not as a guarantee.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="ret-faq-2-content"
              id="ret-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Why do you show &quot;today&apos;s value&quot; of the corpus?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                ₹1 crore after 30 years will not have the same buying power as ₹1
                crore today. By adjusting for inflation, we show an approximate
                value of your future corpus in today&apos;s money so you can judge
                whether it is enough.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="ret-faq-3-content"
              id="ret-faq-3-header"
            >
              <Typography variant="body2" fontWeight={500}>
                What return and inflation should I use?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                For long-term equity-heavy portfolios, many investors use 10–12%
                expected return and 5–6% inflation as a starting point. It&apos;s
                safer to be conservative and assume slightly lower returns and
                slightly higher inflation.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  