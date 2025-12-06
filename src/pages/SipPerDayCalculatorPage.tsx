import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import SipPerDayCalculator from "../features/calculators/SipPerDayCalculator";
  
  export default function SipPerDayCalculatorPage() {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          SIP Per Day Calculator – Goal Based
        </Typography>
  
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
        >
          Find out how much you should save per day and per month to reach a
          target amount using mutual fund SIPs. Start with your financial goal
          (like ₹10 lakh or ₹1 crore), choose how many years you have and enter
          the expected annual return.
        </Typography>
  
        <SipPerDayCalculator />
  
        {/* FAQ section */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
          >
            SIP Per Day – Frequently Asked Questions
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="sip-day-faq-1-content"
              id="sip-day-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Why think in terms of SIP per day instead of SIP per month?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Many investors find it easier to commit to small daily savings
                like ₹200 or ₹300 per day instead of a big monthly amount. It
                builds the habit of saving and makes large goals feel more
                achievable.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="sip-day-faq-2-content"
              id="sip-day-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Are the SIP per day numbers guaranteed?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                No. The calculator works on assumed annual return. Actual mutual
                fund returns can be higher or lower. Use these numbers as a
                planning guide and review your investments regularly.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="sip-day-faq-3-content"
              id="sip-day-faq-3-header"
            >
              <Typography variant="body2" fontWeight={500}>
                How can this calculator help advisors and platforms?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Financial advisors and apps can embed this tool to quickly show
                clients the daily saving needed for their goals. It is very
                effective for converting users into SIP investors, especially when
                combined with mutual fund recommendations.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  