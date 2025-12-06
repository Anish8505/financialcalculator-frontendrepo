import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import SipAmcWisePerformanceCalculator from "../features/calculators/SipAmcWisePerformanceCalculator";
  
  export default function SipAmcWisePerformancePage() {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          SIP Performance – AMC Wise
        </Typography>
  
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
        >
          Compare how different schemes of the same mutual fund house have
          rewarded SIP investors. Select an AMC, choose the SIP duration and enter
          your monthly SIP amount. The tool shows invested amount, estimated
          current value and CAGR for each scheme of that AMC.
        </Typography>
  
        <SipAmcWisePerformanceCalculator />
  
        {/* FAQ section */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
          >
            SIP AMC-wise Performance – Frequently Asked Questions
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="sip-amc-faq-1-content"
              id="sip-amc-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Why should I analyse SIP performance AMC-wise?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Many investors prefer to stay with one or two trusted AMCs. This
                tool helps you see which schemes from the same fund house have
                historically rewarded SIPs better, so you can fine-tune your
                portfolio within that AMC instead of randomly picking funds.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="sip-amc-faq-2-content"
              id="sip-amc-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Are these SIP returns guaranteed going forward?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                No. The numbers are based on historical data and assumptions. Past
                performance is not a guarantee of future returns. Always read
                scheme documents and match the fund&apos;s risk profile with your
                own risk appetite.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="sip-amc-faq-3-content"
              id="sip-amc-faq-3-header"
            >
              <Typography variant="body2" fontWeight={500}>
                How will this page use live mutual fund data?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                The backend can fetch complete scheme lists and NAV history for
                each AMC from AMFI or other authorised data sources. It can then
                compute SIP cashflows and CAGR for every scheme and return the
                same JSON format used here, so this page and AI tools can stay in
                sync automatically.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  