// src/features/calculators/CalculatorTabs.tsx
import { useState } from "react";
import { Box, Paper, Tab, Tabs } from "@mui/material";
import SipCalculator from "./SipCalculator";
import FdCalculator from "./FdCalculator";

export default function CalculatorTabs() {
  const [tab, setTab] = useState(0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        <Tab label="SIP Calculator" />
        <Tab label="FD Calculator" />
      </Tabs>

      <Box sx={{ flex: 1 }}>
        {tab === 0 && <SipCalculator />}
        {tab === 1 && <FdCalculator />}
      </Box>
    </Paper>
  );
}
