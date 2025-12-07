// src/features/calculators/LumpsumCategoryPerformanceCalculator.tsx
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

/* ---------- API BASE URL (added) ---------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/* ---------- types ---------- */

type LumpsumCategoryRow = {
  schemeCode: string;
  schemeName: string;
  amcName: string;
  category: string;
  aumCrore: number;
  fromDate: string;
  toDate: string;
  lumpsumAmount: number;
  currentValue: number;
  absoluteReturnPercent: number;
  cagrPercent: number;
  cashflowLink: string;
};

type LumpsumCategoryChartPoint = {
  schemeName: string;
  cagrPercent: number;
  currentValue: number;
};

type LumpsumCategoryPerformanceApiResponse = {
  calculator: string;
  currency: string;
  amcName: string;
  categoryName: string;
  periodLabel: string;
  lumpsumAmount: number;
  fromDate: string;
  toDate: string;
  asOfDate: string;
  totalSchemes: number;
  bestCagrPercent: number;
  worstCagrPercent: number;
  averageCagrPercent: number;
  totalInvestedAmount: number;
  summaryText: string;
  inputSummary: string;
  tableRows: LumpsumCategoryRow[];
  chartData: LumpsumCategoryChartPoint[];
};

/* ---------- helpers ---------- */

const formatIndian = (num: number) =>
  num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

/* ---------------- component ---------------- */

export default function LumpsumCategoryPerformanceCalculator() {
  const [amc, setAmc] = useState("All");
  const [category, setCategory] = useState("Small Cap");
  const [period, setPeriod] = useState("10Y");
  const [amount, setAmount] = useState("100000");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [response, setResponse] =
    useState<LumpsumCategoryPerformanceApiResponse | null>(null);

  const hasResult = !!response;

  const handleSubmit = async () => {
    setError(null);
    setResponse(null);

    const amountNum = Number(amount.replace(/,/g, ""));
    if (!amountNum || amountNum <= 0) {
      setError("Please enter a valid lumpsum amount.");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        amc,
        category,
        period,
        amount: amountNum.toString(),
      });

      // 🔄 ONLY THIS LINE CHANGED
      const res = await fetch(
        `${API_BASE_URL}/mf/lumpsum-performance?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("API error");
      }

      const data: LumpsumCategoryPerformanceApiResponse = await res.json();
      setResponse(data);
    } catch (e) {
      console.error("Error calling lumpsum category performance API", e);
      setError(
        "Something went wrong while fetching lumpsum performance. Please try again."
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
                label="Lumpsum Investment (₹)"
                value={amount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (!raw) {
                    setAmount("");
                    return;
                  }
                  if (!/^\d+$/.test(raw)) return;
                  setAmount(Number(raw).toLocaleString("en-IN"));
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
                {loading ? "Calculating..." : "Show Lumpsum Performance"}
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
                What is lumpsum category performance?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This tool shows how a one-time lumpsum investment in a mutual
                fund category (for example Small Cap funds) would have grown
                across different schemes over a long period. It helps you see
                which funds created the largest corpus for the same initial
                investment.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The calculator shows:
              </Typography>
              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>Final corpus value for each scheme in the category.</li>
                <li>Absolute return percentage and CAGR for each fund.</li>
                <li>
                  Best, worst and average CAGR for the selected category and
                  period.
                </li>
              </ul>

              <Typography variant="body2" color="text.secondary">
                In production, this data can come from AMFI or SEBI-approved
                data providers using historical NAV, so results automatically
                stay fresh.
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
                  Lumpsum performance summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasResult
                    ? response?.summaryText
                    : "Choose AMC, category, period and enter a lumpsum amount to see how different funds in that category would have grown."}
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
                Lumpsum category performance – corpus vs CAGR
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
                      name="Corpus Value (₹)"
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
                Bars show the estimated corpus and CAGR for each scheme if you
                had invested the same lumpsum amount for the selected period.
              </Typography>
            </Box>

            {/* TABLE */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Detailed lumpsum performance table
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  size="small"
                  aria-label="Lumpsum category performance table with scheme, AUM, invested amount, corpus and CAGR"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Scheme Name</TableCell>
                      <TableCell>AMC</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">AUM (Cr)</TableCell>
                      <TableCell align="right">Invested (₹)</TableCell>
                      <TableCell align="right">Corpus (₹)</TableCell>
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
                          {formatIndian(row.lumpsumAmount)}
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
                These numbers are for illustration. Once connected to live NAV
                data, this page can show actual category-wise lumpsum
                performance similar to premium research platforms.
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
