// src/features/calculators/SwpCategoryPerformanceCalculator.tsx
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

type SwpCategoryRow = {
  schemeCode: string;
  schemeName: string;
  amcName: string;
  category: string;
  aumCrore: number;
  fromDate: string;
  toDate: string;
  startingCorpusAmount: number;
  totalWithdrawnAmount: number;
  corpusRemaining: number;
  absoluteReturnPercent: number;
  cagrPercent: number;
  cashflowLink: string;
};

type SwpCategoryChartPoint = {
  schemeName: string;
  corpusRemaining: number;
  totalWithdrawnAmount: number;
};

type SwpCategoryPerformanceApiResponse = {
  calculator: string;
  currency: string;
  amcName: string;
  categoryName: string;
  periodLabel: string;
  startingCorpusAmount: number;
  monthlyWithdrawalAmount: number;
  fromDate: string;
  toDate: string;
  asOfDate: string;
  totalSchemes: number;
  bestCagrPercent: number;
  worstCagrPercent: number;
  averageCagrPercent: number;
  totalWithdrawnAmount: number;
  summaryText: string;
  inputSummary: string;
  tableRows: SwpCategoryRow[];
  chartData: SwpCategoryChartPoint[];
};

/* ---------- helpers ---------- */

const formatIndian = (num: number) =>
  num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

/* ---------------- component ---------------- */

export default function SwpCategoryPerformanceCalculator() {
  const [amc, setAmc] = useState("All");
  const [category, setCategory] = useState("Large Cap");
  const [period, setPeriod] = useState("10Y");
  const [corpus, setCorpus] = useState("2000000"); // 20L
  const [monthly, setMonthly] = useState("15000");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [response, setResponse] =
    useState<SwpCategoryPerformanceApiResponse | null>(null);

  const hasResult = !!response;

  const handleSubmit = async () => {
    setError(null);
    setResponse(null);

    const corpusNum = Number(corpus.replace(/,/g, ""));
    const monthlyNum = Number(monthly.replace(/,/g, ""));

    if (!corpusNum || corpusNum <= 0) {
      setError("Please enter a valid starting corpus.");
      return;
    }
    if (!monthlyNum || monthlyNum <= 0) {
      setError("Please enter a valid monthly SWP amount.");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        amc,
        category,
        period,
        corpus: corpusNum.toString(),
        monthly: monthlyNum.toString(),
      });

      const res = await fetch(
        `http://localhost:8080/api/mf/swp-performance?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("API error");
      }

      const data: SwpCategoryPerformanceApiResponse = await res.json();
      setResponse(data);
    } catch (e) {
      console.error("Error calling SWP category performance API", e);
      setError(
        "Something went wrong while fetching SWP performance. Please try again."
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
                label="Starting Corpus (₹)"
                value={corpus}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (!raw) {
                    setCorpus("");
                    return;
                  }
                  if (!/^\d+$/.test(raw)) return;
                  setCorpus(Number(raw).toLocaleString("en-IN"));
                }}
              />

              <TextField
                label="Monthly SWP Amount (₹)"
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
                {loading ? "Calculating..." : "Show SWP Performance"}
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
                What is SWP category performance?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                SWP (Systematic Withdrawal Plan) lets you take a fixed monthly
                amount from your mutual fund corpus. This tool shows how
                different funds in the same category would have behaved if you
                had started a SWP from a lump sum corpus over a long period.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The calculator shows:
              </Typography>
              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>
                  Total amount you would have withdrawn over the selected
                  period.
                </li>
                <li>
                  Approximate remaining corpus for each scheme after SWP
                  withdrawals.
                </li>
                <li>
                  Best, worst and average CAGR across schemes in the category.
                </li>
              </ul>

              <Typography variant="body2" color="text.secondary">
                In production, this can be powered using real AMFI NAV data so
                that both SWP withdrawals and remaining corpus are based on
                actual fund history.
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
                  SWP performance summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasResult
                    ? response?.summaryText
                    : "Select AMC, category, period and enter starting corpus + monthly SWP amount to see how different funds in that category would have behaved."}
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
                SWP category performance – remaining corpus vs withdrawn
              </Typography>
              <Box sx={{ width: "100%", height: { xs: 260, md: 320 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={response.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="schemeName" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        return `₹${value.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}`;
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="totalWithdrawnAmount"
                      name="Total Withdrawn (₹)"
                      fill="#0f766e"
                    />
                    <Bar
                      dataKey="corpusRemaining"
                      name="Corpus Remaining (₹)"
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
                Each bar pair shows how much you could have withdrawn and how
                much corpus is left (approximately) for each scheme in the
                category.
              </Typography>
            </Box>

            {/* TABLE */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Detailed SWP performance table
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  size="small"
                  aria-label="SWP category performance table with scheme, AUM, withdrawn amount, remaining corpus and CAGR"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Scheme Name</TableCell>
                      <TableCell>AMC</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">AUM (Cr)</TableCell>
                      <TableCell align="right">Starting Corpus (₹)</TableCell>
                      <TableCell align="right">Total Withdrawn (₹)</TableCell>
                      <TableCell align="right">Corpus Remaining (₹)</TableCell>
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
                          {formatIndian(row.startingCorpusAmount)}
                        </TableCell>
                        <TableCell align="right">
                          {formatIndian(row.totalWithdrawnAmount)}
                        </TableCell>
                        <TableCell align="right">
                          {formatIndian(row.corpusRemaining)}
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
                These are illustrative numbers. Once connected to live NAV data,
                this page can show actual SWP outcomes for different mutual fund
                categories, helping retirees plan their monthly cash flows.
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
