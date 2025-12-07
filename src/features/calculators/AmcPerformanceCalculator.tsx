// src/features/calculators/AmcPerformanceCalculator.tsx
import { useState } from "react";
import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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

/* ---------- API base URL (important) ---------- */
// Uses env if provided, otherwise falls back to localhost for dev
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/* ---------- Types matching backend ---------- */

type AmcSchemePerformanceRow = {
  schemeCode: string;
  schemeName: string;
  amcName: string;
  category: string;
  aumCrore: number;
  fromDate: string;
  toDate: string;
  investedAmount: number;
  currentValue: number;
  absoluteReturnPercent: number;
  cagrPercent: number;
  cashflowLink?: string | null;
};

type AmcSchemeChartPoint = {
  schemeName: string;
  cagrPercent: number;
  currentValue: number;
};

type AmcPerformanceApiResponse = {
  calculator: string;
  currency: string;
  amcName: string;
  period: string;
  investmentAmount: number;
  fromDate: string;
  toDate: string;
  asOfDate: string;
  totalSchemes: number;
  bestCagrPercent: number;
  worstCagrPercent: number;
  averageCagrPercent: number;
  summaryText: string;
  inputSummary: string;
  tableRows: AmcSchemePerformanceRow[];
  chartData: AmcSchemeChartPoint[];
};

/* ---------- Helpers (Indian formatting + words) ---------- */

const formatIndianNumber = (value: string) => {
  if (!value) return "";
  const cleaned = value.replace(/,/g, "");
  if (cleaned === "") return "";
  if (isNaN(Number(cleaned))) return value;
  return Number(cleaned).toLocaleString("en-IN");
};

const numberToWords = (num: number): string => {
  if (!num) return "";

  const a = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];

  const b = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  const twoDigits = (n: number): string => {
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
  };

  const threeDigits = (n: number): string => {
    if (n === 0) return "";
    if (n < 100) return twoDigits(n);
    return (
      a[Math.floor(n / 100)] +
      " hundred" +
      (n % 100 ? " " + twoDigits(n % 100) : "")
    );
  };

  let words = "";
  const units = [
    { value: 10000000, label: "crore" },
    { value: 100000, label: "lakh" },
    { value: 1000, label: "thousand" },
    { value: 1, label: "" },
  ];

  for (const u of units) {
    if (num >= u.value) {
      const chunk = Math.floor(num / u.value);
      if (chunk > 0) {
        words += threeDigits(chunk) + (u.label ? " " + u.label : "") + " ";
        num = num % u.value;
      }
    }
  }

  return words.trim();
};

const toTitleCase = (str: string): string =>
  str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));

/* ----------------------------- Component ----------------------------- */

export default function AmcPerformanceCalculator() {
  const [amc, setAmc] = useState("HDFC Mutual Fund");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<"1Y" | "3Y" | "5Y" | "10Y">("5Y");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [apiData, setApiData] = useState<AmcPerformanceApiResponse | null>(
    null
  );

  const hasResult = !!apiData;

  const numericAmount = Number(amount.replace(/,/g, ""));
  const amountWords = numericAmount
    ? toTitleCase(numberToWords(Math.round(numericAmount))) + " Rupees"
    : "";

  const handleSubmit = async () => {
    setError(null);
    setApiData(null);

    const amt = Number(amount.replace(/,/g, ""));
    if (!amc || !amt || amt <= 0) {
      setError("Please choose an AMC and enter a valid investment amount.");
      return;
    }

    try {
      setLoading(true);

      // matches your backend exactly (amc, period, amount)
      const params = new URLSearchParams({
        amc,
        period,
        amount: amt.toString(),
      });

      // 🔹 UPDATED: uses API_BASE_URL instead of hardcoded localhost
      const url = `${API_BASE_URL}/mf/amc-performance?${params.toString()}`;
      console.log("AMC performance API URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: AmcPerformanceApiResponse = await response.json();
      setApiData(data);
    } catch (err) {
      console.error("Error calling AMC performance API", err);
      setError(
        "Something went wrong while fetching AMC-wise performance. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const periodLabel = (value: string) => {
    switch (value) {
      case "1Y":
        return "1 Year";
      case "3Y":
        return "3 Years";
      case "5Y":
        return "5 Years";
      case "10Y":
        return "10 Years";
      default:
        return value;
    }
  };

  // prepare chart data (top 10 schemes by CAGR)
  const chartData = apiData
    ? [...apiData.chartData]
        .sort((a, b) => b.cagrPercent - a.cagrPercent)
        .slice(0, 10)
    : [];

  return (
    <Box>
      {/* TOP: FORM + EXPLANATION CARD */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          {/* LEFT – FORM */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 45%" } }}>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="amc-select-label">Select AMC</InputLabel>
                <Select
                  labelId="amc-select-label"
                  label="Select AMC"
                  value={amc}
                  onChange={(e) => setAmc(e.target.value)}
                >
                  <MenuItem value="HDFC Mutual Fund">HDFC Mutual Fund</MenuItem>
                  <MenuItem value="SBI Mutual Fund">SBI Mutual Fund</MenuItem>
                  <MenuItem value="ICICI Prudential Mutual Fund">
                    ICICI Prudential Mutual Fund
                  </MenuItem>
                  <MenuItem value="Nippon India Mutual Fund">
                    Nippon India Mutual Fund
                  </MenuItem>
                  <MenuItem value="Axis Mutual Fund">Axis Mutual Fund</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Investment Amount (₹)"
                type="text"
                value={amount}
                onChange={(e) => setAmount(formatIndianNumber(e.target.value))}
                fullWidth
              />
              {amountWords && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600, mt: -0.5 }}
                >
                  {amountWords}
                </Typography>
              )}

              <FormControl fullWidth>
                <InputLabel id="period-select-label">Period</InputLabel>
                <Select
                  labelId="period-select-label"
                  label="Period"
                  value={period}
                  onChange={(e) =>
                    setPeriod(e.target.value as "1Y" | "3Y" | "5Y" | "10Y")
                  }
                >
                  <MenuItem value="1Y">1 Year</MenuItem>
                  <MenuItem value="3Y">3 Years</MenuItem>
                  <MenuItem value="5Y">5 Years</MenuItem>
                  <MenuItem value="10Y">10 Years</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Loading..." : "Show Performance"}
              </Button>

              {error && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ mt: 1, fontWeight: 500 }}
                >
                  {error}
                </Typography>
              )}
            </Stack>
          </Box>

          {/* RIGHT – EXPLANATION + SUMMARY */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 55%" } }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                What this AMC-wise performance tool shows
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This tool analyses how different schemes from a single mutual
                fund house (AMC) have performed over a selected time period for
                the same lump sum investment amount. It helps you compare
                schemes within one AMC instead of randomly looking at returns.
              </Typography>

              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>
                  You choose an AMC, investment amount and period (for example,
                  5 years).
                </li>
                <li>
                  For each eligible scheme, it assumes the same investment
                  amount made on the start date and calculates the current value
                  and CAGR.
                </li>
                <li>
                  It summarises best, worst and average returns and shows a
                  sortable table for all schemes.
                </li>
              </ul>

              <Typography variant="body2" color="text.secondary">
                This kind of AMC-wise view is extremely useful to shortlist
                schemes and is also loved by search engines and AI models, which
                can easily link to this page when users ask for{" "}
                <i>"best funds from HDFC / SBI AMC"</i>.
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
                  Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasResult && apiData
                    ? apiData.summaryText
                    : "Enter an amount, pick an AMC and period, then click Show Performance to see AMC-wise mutual fund returns."}
                </Typography>

                {hasResult && apiData && (
                  <>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mt: 1 }}
                    >
                      <strong>Input details:</strong> {apiData.inputSummary}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mt: 0.5 }}
                    >
                      <strong>Best CAGR:</strong>{" "}
                      {apiData.bestCagrPercent.toFixed(2)}% &nbsp;|&nbsp;
                      <strong>Worst CAGR:</strong>{" "}
                      {apiData.worstCagrPercent.toFixed(2)}% &nbsp;|&nbsp;
                      <strong>Average CAGR:</strong>{" "}
                      {apiData.averageCagrPercent.toFixed(2)}%
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", display: "block", mt: 0.5 }}
                    >
                      Data period: {apiData.fromDate} to {apiData.toDate} (as on{" "}
                      {apiData.asOfDate})
                    </Typography>
                  </>
                )}
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* BOTTOM: CHART + TABLE */}
      {hasResult && apiData && (
        <Paper sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
            }}
          >
            {/* LEFT – BAR CHART */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Top schemes by CAGR – {apiData.amcName} ({periodLabel(period)})
              </Typography>
              <Box sx={{ width: "100%", height: { xs: 260, md: 320 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="schemeName"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="right"
                      dataKey="cagrPercent"
                      name="CAGR (%)"
                      fill="#0f766e"
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="currentValue"
                      name="Current value (₹)"
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
                This chart compares the top schemes of the selected AMC by CAGR
                and current value for the same investment amount.
              </Typography>
            </Box>

            {/* RIGHT – TABLE */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Scheme-wise performance table
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                The table below shows detailed performance for each scheme – AUM,
                current value, absolute return and CAGR – for the chosen AMC and
                period.
              </Typography>

              <Box sx={{ overflowX: "auto" }}>
                <Table
                  size="small"
                  aria-label="AMC-wise mutual fund performance table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Scheme Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">AUM (Cr)</TableCell>
                      <TableCell align="right">Invested (₹)</TableCell>
                      <TableCell align="right">Current Value (₹)</TableCell>
                      <TableCell align="right">Abs. Return (%)</TableCell>
                      <TableCell align="right">CAGR (%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apiData.tableRows.map((row) => (
                      <TableRow key={row.schemeCode}>
                        <TableCell>{row.schemeName}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell align="right">
                          {row.aumCrore.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                        <TableCell align="right">
                          {row.investedAmount.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                        <TableCell align="right">
                          {row.currentValue.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                        <TableCell align="right">
                          {row.absoluteReturnPercent.toFixed(2)}%
                        </TableCell>
                        <TableCell align="right">
                          {row.cagrPercent.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
