import { Box, Typography } from "@mui/material";
import MfNavHistoryCalculator from "../features/calculators/MfNavHistoryCalculator";

export default function MfNavHistoryPage() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Mutual Fund NAV History Viewer
      </Typography>

      <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
        View historical NAV chart for any mutual fund scheme. Useful for trend analysis,
        volatility study and long-term behavior of the fund.
      </Typography>

      <MfNavHistoryCalculator />
    </Box>
  );
}
