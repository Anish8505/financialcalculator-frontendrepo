// src/App.tsx
import { Box, Container } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import SipCalculatorPage from "./pages/SipCalculatorPage";
import FdCalculatorPage from "./pages/FdCalculatorPage";
import LumpsumCalculatorPage from "./pages/LumpsumCalculatorPage";
import RdCalculatorPage from "./pages/RdCalculatorPage";
import PpfCalculatorPage from "./pages/PpfCalculatorPage";
import EmiCalculatorPage from "./pages/EmiCalculatorPage";
import TaxCalculatorPage from "./pages/TaxCalculatorPage";
import RetirementCalculatorPage from "./pages/RetirementCalculatorPage";
import CagrCalculatorPage from "./pages/CagrCalculatorPage";
import SwpCalculatorPage from "./pages/SwpCalculatorPage";

import AmcPerformancePage from "./pages/AmcPerformancePage";
import SipCategoryPerformancePage from "./pages/SipCategoryPerformancePage";
import LumpsumCategoryPerformancePage from "./pages/LumpsumCategoryPerformancePage";
import SwpCategoryPerformancePage from "./pages/SwpCategoryPerformancePage";
import GoalSipPlannerPage from "./pages/GoalSipPlannerPage";
import SipPerDayCalculatorPage from "./pages/SipPerDayCalculatorPage";
import StepUpSipCalculatorPage from "./pages/StepUpSipCalculatorPage";
import SipAmcWisePerformancePage from "./pages/SipAmcWisePerformancePage";
import MfLiveReturnPage from "./pages/MfLiveReturnPage";
import PortfolioReturnPage from "./pages/PortfolioReturnPage";
import MfNavHistoryPage from "./pages/MfNavHistoryPage";
import MfRollingReturnPage from "./pages/MfRollingReturnPage";
import MfCompareFundsPage from "./pages/MfCompareFundsPage";

export default function App() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Header />
      <Box component="main" sx={{ pt: 10, pb: 6 }}>
        <Container maxWidth="lg">
          <Routes>
            <Route path="/" element={<HomePage />} />

            {/* Core calculators */}
            <Route path="/sip" element={<SipCalculatorPage />} />
            <Route path="/sip-per-day" element={<SipPerDayCalculatorPage />} />
            <Route path="/step-up-sip" element={<StepUpSipCalculatorPage />} />
            <Route path="/lumpsum" element={<LumpsumCalculatorPage />} />
            <Route path="/fd" element={<FdCalculatorPage />} />
            <Route path="/rd" element={<RdCalculatorPage />} />
            <Route path="/ppf" element={<PpfCalculatorPage />} />
            <Route path="/emi" element={<EmiCalculatorPage />} />
            <Route path="/tax" element={<TaxCalculatorPage />} />
            <Route path="/retirement" element={<RetirementCalculatorPage />} />
            <Route path="/cagr" element={<CagrCalculatorPage />} />
            <Route path="/swp" element={<SwpCalculatorPage />} />

            {/* Mutual fund research tools */}
            <Route
              path="/mutual-funds/amc-performance"
              element={<AmcPerformancePage />}
            />
            <Route
              path="/mutual-funds/sip-performance"
              element={<SipCategoryPerformancePage />}
            />
            <Route
              path="/mutual-funds/sip-amc-wise"
              element={<SipAmcWisePerformancePage />}
            />
            <Route
              path="/mutual-funds/lumpsum-performance"
              element={<LumpsumCategoryPerformancePage />}
            />
            <Route
              path="/mutual-funds/swp-category-performance"
              element={<SwpCategoryPerformancePage />}
            />
            <Route
              path="/mutual-funds/goal-sip-planner"
              element={<GoalSipPlannerPage />}
            />
            <Route
              path="/mutual-funds/live-return"
              element={<MfLiveReturnPage />}
            />
            <Route
              path="/mutual-funds/portfolio-return"
              element={<PortfolioReturnPage />}
            />
            <Route path="/mutual-funds/nav-history" element={<MfNavHistoryPage />} />
            <Route path="/mutual-funds/rolling-returns" element={<MfRollingReturnPage />} />
            <Route path="/mutual-funds/compare-funds" element={<MfCompareFundsPage />} />
          </Routes>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
