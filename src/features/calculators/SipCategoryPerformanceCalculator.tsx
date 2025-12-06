// src/features/calculators/SipCategoryPerformanceCalculator.tsx
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

type SipCategoryRow = {
  schemeCode: string;
  schemeName: string;
  amcName: string;
  category: string;
  aumCrore: number;
  fromDate: string;
  toDate: string;
  monthlySipAmount: number;
  totalInvestedAmount: number; // ✅ match JSON
  currentValue: number;
  absoluteReturnPercent: number;
  cagrPercent: number;
  cashflowLink: string;
};

type SipCategoryChartPoint = {
  schemeName: string;
  cagrPercent: number;
  currentValue: number;
};

type SipCategoryPerformanceApiResponse = {
  calculator: string;
  currency: string;
  amcName: string;
  categoryName: string;
  periodLabel: string;
  monthlySipAmount: number;
  fromDate: string;
  toDate: string;
  asOfDate: string;
  totalSchemes: number;
  bestCagrPercent: number;
  worstCagrPercent: number;
  averageCagrPercent: number;
  totalInvestedAmount: number; // ✅ match JSON
  summaryText: string;
  inputSummary: string;
  tableRows: SipCategoryRow[];
  chartData: SipCategoryChartPoint[];
};

/* ---------- helpers ---------- */

const formatIndian = (num: number) =>
  num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

/* ---------------- component ---------------- */

export default function SipCategoryPerformanceCalculator() {
  const [amc, setAmc] = useState("All");
  const [category, setCategory] = useState("Small Cap");
  const [period, setPeriod] = useState("10Y");
  const [monthly, setMonthly] = useState("5000");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [response, setResponse] =
    useState<SipCategoryPerformanceApiResponse | null>(null);

  const hasResult = !!response;

  const handleSubmit = async () => {
    setError(null);
    setResponse(null);

    const monthlyNum = Number(monthly.replace(/,/g, ""));
    if (!monthlyNum || monthlyNum <= 0) {
      setError("Please enter a valid monthly SIP amount.");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        amc,
        category,
        period,
        monthly: monthlyNum.toString(),
      });

      const res = await fetch(
        `http://localhost:8080/api/mf/sip-performance?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("API error");
      }

      const data: SipCategoryPerformanceApiResponse = await res.json();
      setResponse(data);
    } catch (e) {
      console.error("Error calling SIP category performance API", e);
      setError(
        "Something went wrong while fetching SIP performance. Please try again."
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
                label="Monthly SIP Amount (₹)"
                value={monthly}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (!raw) {
                    setMonthly("");
                    return;
                  }
                  if (!/^\d+$/.test(raw)) return;
                  setMonthly(Number(raw).toLocaleString("en-IN"));
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
                {loading ? "Calculating..." : "Show SIP Performance"}
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
                What is SIP category performance?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This tool analyses how different mutual fund schemes within the
                same category (for example Small Cap funds) have performed for a
                fixed monthly SIP over a long period. It helps you compare funds
                from the same bucket instead of randomly picking any scheme.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The calculator shows:
              </Typography>
              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>
                  Total amount invested if you ran a SIP for the selected
                  period.
                </li>
                <li>
                  Current value, CAGR and absolute return for each scheme (demo
                  values for now).
                </li>
                <li>
                  Best, worst and average CAGR across schemes in the category.
                </li>
              </ul>

              <Typography variant="body2" color="text.secondary">
                In production, the data can be powered using AMFI NAV history so
                that numbers refresh automatically as markets move.
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
                  SIP performance summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasResult
                    ? response?.summaryText
                    : "Enter AMC, category, period and monthly SIP amount to see how different funds in that category would have performed."}
                </Typography>

                {hasResult && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    <strong>Best / Worst / Average CAGR:</strong>{" "}
                    {response?.bestCagrPercent.toFixed(2)}% /{" "}
                    {response?.worstCagrPercent.toFixed(2)}% /{" "}
                    {response?.averageCagrPercent.toFixed(2)}%
                  </Typography>
                )}
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
                SIP category performance – current value vs CAGR
              </Typography>
              <Box sx={{ width: "100%", height: { xs: 260, md: 320 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={response.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="schemeName" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        if (name.includes("CAGR")) {
                          return `${value.toFixed(2)}%`;
                        }
                        return `₹${value.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}`;
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="currentValue"
                      name="Current Value (₹)"
                      fill="#0f766e"
                    />
                    <Bar
                      dataKey="cagrPercent"
                      name="CAGR (%)"
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
                Bars show the approximate corpus created per scheme and its CAGR
                for the same SIP amount and period. This helps you visually
                compare which schemes rewarded SIP investors better.
              </Typography>
            </Box>

            {/* TABLE */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Detailed SIP performance table
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  size="small"
                  aria-label="SIP category performance table with scheme, AUM, invested amount, value and CAGR"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Scheme Name</TableCell>
                      <TableCell>AMC</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">AUM (Cr)</TableCell>
                      <TableCell align="right">Invested (₹)</TableCell>
                      <TableCell align="right">Current Value (₹)</TableCell>
                      <TableCell align="right">Abs Return (%)</TableCell>
                      <TableCell align="right">CAGR (%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {response.tableRows.map((row) => (
                      <TableRow key={row.schemeCode}>
                        <TableCell>{row.schemeName}</TableCell>
                        <TableCell>{row.amcName}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell align="right">
                          {row.aumCrore.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                        <TableCell align="right">
                          {formatIndian(row.totalInvestedAmount)}
                        </TableCell>
                        <TableCell align="right">
                          {formatIndian(row.currentValue)}
                        </TableCell>
                        <TableCell align="right">
                          {row.absoluteReturnPercent.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          {row.cagrPercent.toFixed(2)}
                        </TableCell>
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
                These figures are for illustration. When connected to live AMFI
                data, this table can show actual SIP performance for all funds
                in the selected category, similar to professional research tools.
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
