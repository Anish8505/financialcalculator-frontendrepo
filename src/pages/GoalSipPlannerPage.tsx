// src/pages/GoalSipPlannerPage.tsx
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import GoalSipPlannerCalculator from "../features/calculators/GoalSipPlannerCalculator";
  
  export default function GoalSipPlannerPage() {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Goal-based SIP Planner – Mutual Fund Category Wise
        </Typography>
  
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
        >
          Start with a goal – like child education, house downpayment or early
          retirement – and see how much SIP you may need in a chosen mutual fund
          category. This page uses different return assumptions (conservative,
          moderate, aggressive) to give you a SIP range instead of a single rigid
          number.
        </Typography>
  
        <GoalSipPlannerCalculator />
  
        {/* FAQ section */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
          >
            Goal SIP Planner – Frequently Asked Questions
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="goal-sip-faq-1-content"
              id="goal-sip-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Why do you show multiple SIP amounts for the same goal?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Because future returns are unknown. If markets do better than the
                conservative assumption, you can reach the goal with a lower SIP.
                If returns are lower, you may need a higher SIP or longer
                duration. Showing a band of SIP values makes planning more honest
                and realistic.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="goal-sip-faq-2-content"
              id="goal-sip-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Are these SIP amounts guaranteed to reach my goal?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                No. Mutual funds are market-linked and do not offer guarantees.
                Think of this as a planning tool – you should review your SIP
                every year and adjust based on actual fund performance and changes
                in your goal amount (inflation, lifestyle, etc.).
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="goal-sip-faq-3-content"
              id="goal-sip-faq-3-header"
            >
              <Typography variant="body2" fontWeight={500}>
                How will this integrate with live data in future?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Your backend can pull long-term rolling returns for each category
                from AMFI / SEBI–registered data providers. From that, it can
                derive realistic conservative / moderate / aggressive CAGR bands
                and plug them into the same JSON structure that this page already
                uses.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  