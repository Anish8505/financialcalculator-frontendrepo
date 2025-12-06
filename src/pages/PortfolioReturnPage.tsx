import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import PortfolioReturnCalculator from "../features/calculators/PortfolioReturnCalculator";
  
  export default function PortfolioReturnPage() {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Mutual Fund Portfolio Return Calculator
        </Typography>
  
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
        >
          Calculate the overall performance of your mutual fund portfolio. Add
          each fund with its investment date, invested amount and current value.
          The calculator shows total profit, weighted average CAGR and portfolio
          allocation, so you can see whether your investments are really beating
          FDs and inflation.
        </Typography>
  
        <PortfolioReturnCalculator />
  
        {/* FAQ section */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
          >
            Mutual fund portfolio returns – Frequently Asked Questions
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="mf-portfolio-faq-1-content"
              id="mf-portfolio-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                How is portfolio CAGR calculated?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                This page first calculates an approximate CAGR for every holding
                based on its invested amount, current value and holding period.
                Then it takes a weighted average of those CAGRs using current
                value of each fund as the weight. This gives a single, easy-to
                understand annualised return for your full portfolio.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="mf-portfolio-faq-2-content"
              id="mf-portfolio-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Is this the same as XIRR?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                XIRR is a more advanced method that handles multiple cash flows
                (for example SIP, top-ups, redemptions). This calculator assumes
                one initial investment per fund and a single current value, so it
                uses an annualised CAGR formula. It is a good quick approximation
                for most buy-and-hold investments.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="mf-portfolio-faq-3-content"
              id="mf-portfolio-faq-3-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Can I use this to decide which funds to exit?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                The calculator helps you identify underperformers and very
                high-conviction bets in your portfolio. However, exit decisions
                should also consider risk profile, asset allocation, tax impact
                and your financial goals. Use this page as a research helper, not
                as the only decision tool.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  