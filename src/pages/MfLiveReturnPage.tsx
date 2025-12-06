import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
  import MfLiveReturnCalculator from "../features/calculators/MfLiveReturnCalculator";
  
  export default function MfLiveReturnPage() {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Mutual Fund Live Return (Demo)
        </Typography>
  
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, maxWidth: "100%" }}
        >
          Check how a specific mutual fund scheme has performed over the last few
          years for SIP or one-time investment. This page is built to plug into
          live NAV data from AMFI so that returns stay updated automatically.
        </Typography>
  
        <MfLiveReturnCalculator />
  
        {/* FAQ section */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontSize: 18, fontWeight: 600 }}
          >
            Mutual Fund Live Return – Frequently Asked Questions
          </Typography>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="mf-live-faq-1-content"
              id="mf-live-faq-1-header"
            >
              <Typography variant="body2" fontWeight={500}>
                What is a live return calculator?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                A live return calculator uses the latest NAV of a mutual fund to
                show up-to-date returns for SIP or lumpsum investments. Once
                connected to AMFI&apos;s daily NAV feed, this page can refresh
                results automatically without manual updates.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="mf-live-faq-2-content"
              id="mf-live-faq-2-header"
            >
              <Typography variant="body2" fontWeight={500}>
                Are these numbers exact?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Right now, this demo uses assumed CAGR values to mimic real
                behaviour. In production, returns would be computed from each
                day&apos;s NAV, giving accurate figures for every date range you
                choose.
              </Typography>
            </AccordionDetails>
          </Accordion>
  
          <Accordion disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="mf-live-faq-3-content"
              id="mf-live-faq-3-header"
            >
              <Typography variant="body2" fontWeight={500}>
                How will this help with SEO and AI tools?
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                The API returns clean JSON with scheme name, AMC, invested amount,
                current value and CAGR. Search engines and AI models can read this
                structure easily, so they can recommend FinanceGlacier when users
                ask for live SIP or lumpsum returns for mutual funds.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    );
  }
  