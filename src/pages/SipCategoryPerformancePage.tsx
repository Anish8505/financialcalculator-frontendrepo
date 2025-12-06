import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SipCategoryPerformanceCalculator from "../features/calculators/SipCategoryPerformanceCalculator";

export default function SipCategoryPerformancePage() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        SIP Performance – Category Wise
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
      >
        Analyse how different mutual funds within the same category have
        rewarded SIP investors. Select an AMC (or All AMCs), choose a category,
        pick a time period and enter your monthly SIP amount. The tool shows
        invested amount, estimated current value and CAGR for each scheme.
      </Typography>

      <SipCategoryPerformanceCalculator />

      {/* FAQ section */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
        >
          SIP Category Performance – Frequently Asked Questions
        </Typography>

        <Accordion disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="sip-cat-faq-1-content"
            id="sip-cat-faq-1-header"
          >
            <Typography variant="body2" fontWeight={500}>
              Why should I compare SIP returns category-wise?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              Comparing funds within the same category (for example all Small
              Cap funds) gives a fair picture because they have similar risk
              profiles and invest in a similar universe of stocks. It is more
              meaningful than comparing a Small Cap fund with a Liquid fund.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="sip-cat-faq-2-content"
            id="sip-cat-faq-2-header"
          >
            <Typography variant="body2" fontWeight={500}>
              Are these SIP performance numbers guaranteed?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              No. The numbers are based on historical data and assumptions. Past
              performance does not guarantee future returns. Use this as a
              research tool to shortlist funds and always read scheme documents
              before investing.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="sip-cat-faq-3-content"
            id="sip-cat-faq-3-header"
          >
            <Typography variant="body2" fontWeight={500}>
              From where will the live data come in future?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              In production you can fetch scheme list and NAV history from AMFI
              or any SEBI–registered data provider. The backend can then compute
              SIP cash flows and CAGR for each scheme and return it in the same
              JSON format used by this page.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
}
