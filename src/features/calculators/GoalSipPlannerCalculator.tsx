// src/features/calculators/GoalSipPlannerCalculator.tsx
import { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Button,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

/* ---------- types ---------- */

type GoalSipScenarioRow = {
  label: string;
  assumedCagrPercent: number;
  monthlySipRequired: number;
  totalInvestedAmount: number;
  expectedMaturityAmount: number;
  note: string;
};

type GoalSipChartPoint = {
  scenarioLabel: string;
  monthlySipRequired: number;
  totalInvestedAmount: number;
};

type GoalSipPlannerApiResponse = {
  calculator: string;
  currency: string;
  amcName: string;
  categoryName: string;
  periodLabel: string;
  targetAmount: number;
  fromDate: string;
  toDate: string;
  asOfDate: string;
  summaryText: string;
  inputSummary: string;
  scenarios: GoalSipScenarioRow[];
  chartData: GoalSipChartPoint[];
};

/* ---------- helpers ---------- */

const formatIndian = (num: number) =>
  num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

/* ---------------- component ---------------- */

export default function GoalSipPlannerCalculator() {
  const [amc, setAmc] = useState("All");
  const [category, setCategory] = useState("Large Cap");
  const [period, setPeriod] = useState("10Y");
  const [target, setTarget] = useState("5000000"); // 50L

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [response, setResponse] =
    useState<GoalSipPlannerApiResponse | null>(null);

  const hasResult = !!response;

  const handleSubmit = async () => {
    setError(null);
    setResponse(null);

    const targetNum = Number(target.replace(/,/g, ""));
    if (!targetNum || targetNum <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        amc,
        category,
        period,
        target: targetNum.toString(),
      });

      const res = await fetch(
        `http://localhost:8080/api/mf/goal-sip-planner?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("API error");
      }

      const data: GoalSipPlannerApiResponse = await res.json();
      setResponse(data);
    } catch (e) {
      console.error("Error calling goal SIP planner API", e);
      setError(
        "Something went wrong while calculating the goal SIP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* TOP CARD: FORM + EXPLANATION / SUMMARY */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          {/* LEFT: FORM */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 45%" } }}>
            <Stack spacing={2}>
              <TextField
                select
                label="Select AMC"
                value={amc}
                onChange={(e) => setAmc(e.target.value)}
              >
                <MenuItem value="All">All AMCs</MenuItem>
                <MenuItem value="SBI Mutual Fund">SBI Mutual Fund</MenuItem>
                <MenuItem value="HDFC Mutual Fund">HDFC Mutual Fund</MenuItem>
                <MenuItem value="ICICI Prudential Mutual Fund">
                  ICICI Prudential Mutual Fund
                </MenuItem>
                <MenuItem value="Axis Mutual Fund">Axis Mutual Fund</MenuItem>
                <MenuItem value="Kotak Mutual Fund">Kotak Mutual Fund</MenuItem>
              </TextField>

              <TextField
                select
                label="Select Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="Large Cap">Large Cap</MenuItem>
                <MenuItem value="Mid Cap">Mid Cap</MenuItem>
                <MenuItem value="Small Cap">Small Cap</MenuItem>
                <MenuItem value="ELSS (Tax Saving)">
                  ELSS (Tax Saving)
                </MenuItem>
                <MenuItem value="Flexi Cap">Flexi Cap</MenuItem>
              </TextField>

              <TextField
                select
                label="Select Period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <MenuItem value="5Y">5 Years</MenuItem>
                <MenuItem value="10Y">10 Years</MenuItem>
                <MenuItem value="15Y">15 Years</MenuItem>
              </TextField>

              <TextField
                label="Target Amount (₹)"
                value={target}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (!raw) {
                    setTarget("");
                    return;
                  }
                  if (!/^\d+$/.test(raw)) return;
                  setTarget(Number(raw).toLocaleString("en-IN"));
                }}
              />

              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}

              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Calculating..." : "Calculate Required SIP"}
              </Button>

              {hasResult && (
                <Typography variant="caption" color="text.secondary">
                  {response?.inputSummary}
                </Typography>
              )}
            </Stack>
          </Box>

          {/* RIGHT: EXPLANATION + SUMMARY */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 55%" } }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                What is a goal-based SIP planner?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Instead of asking “how much will I get?”, a goal planner starts
                with a target like “I need ₹50 lakh in 10 years” and works
                backwards to estimate the SIP amount required, based on assumed
                returns in a specific mutual fund category.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This tool gives:
              </Typography>
              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>
                  Required SIP amount for conservative, moderate and aggressive
                  return assumptions.
                </li>
                <li>
                  Total amount you will invest over the period under each
                  scenario.
                </li>
                <li>
                  A simple chart to compare SIP required vs total invested.
                </li>
              </ul>

              <Typography variant="body2" color="text.secondary">
                In production, you can tie these scenarios to real category-wise
                historical returns (rolling 5/10/15 year data) so that the
                assumptions match how that category actually behaved.
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              <Box
                sx={{
                  bgcolor: "rgba(240,248,255,0.7)",
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Goal SIP summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasResult
                    ? response?.summaryText
                    : "Choose AMC, category, period and enter your goal amount to estimate the SIP required under different return scenarios."}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* BOTTOM: CHART + TABLE */}
      {hasResult && response && (
        <Paper sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
            }}
          >
            {/* CHART */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                SIP required vs total invested – scenario comparison
              </Typography>
              <Box sx={{ width: "100%", height: { xs: 260, md: 320 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={response.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scenarioLabel" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) =>
                        `₹${value.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}`
                      }
                    />
                    <Legend />
                    <Bar
                      dataKey="monthlySipRequired"
                      name="Required SIP / month (₹)"
                      fill="#0f766e"
                    />
                    <Bar
                      dataKey="totalInvestedAmount"
                      name="Total Invested (₹)"
                      fill="#38bdf8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                As expected returns go up, the required monthly SIP reduces –
                but risk also increases. Use this to balance comfort vs risk
                level when choosing a category and SIP amount.
              </Typography>
            </Box>

            {/* TABLE */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Goal SIP scenarios (category-wise)
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  size="small"
                  aria-label="Goal SIP planner scenarios with different return assumptions"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Scenario</TableCell>
                      <TableCell align="right">Assumed CAGR (%)</TableCell>
                      <TableCell align="right">Monthly SIP (₹)</TableCell>
                      <TableCell align="right">Total Invested (₹)</TableCell>
                      <TableCell align="right">Target Amount (₹)</TableCell>
                      <TableCell>Note</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {response.scenarios.map((row) => (
                      <TableRow key={row.label}>
                        <TableCell>{row.label}</TableCell>
                        <TableCell align="right">
                          {row.assumedCagrPercent.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          {formatIndian(row.monthlySipRequired)}
                        </TableCell>
                        <TableCell align="right">
                          {formatIndian(row.totalInvestedAmount)}
                        </TableCell>
                        <TableCell align="right">
                          {formatIndian(row.expectedMaturityAmount)}
                        </TableCell>
                        <TableCell>{row.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                These numbers are illustrative. When linked with live category
                data, you can tune the conservative / moderate / aggressive
                assumptions as per actual long-term returns of that category.
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
