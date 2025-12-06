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

type SipAmcWiseRow = {
  schemeCode: string;
  schemeName: string;
  amcName: string;
  category: string;
  aumCrore: number;
  fromDate: string;
  toDate: string;
  monthlySipAmount: number;
  totalInvestedAmount: number;
  currentValue: number;
  absoluteReturnPercent: number;
  cagrPercent: number;
  cashflowLink: string;
};

type SipAmcWiseChartPoint = {
  schemeName: string;
  cagrPercent: number;
  currentValue: number;
};

type SipAmcWisePerformanceApiResponse = {
  calculator: string;
  currency: string;
  amcName: string;
  periodLabel: string;
  monthlySipAmount: number;
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
  tableRows: SipAmcWiseRow[];
  chartData: SipAmcWiseChartPoint[];
};

/* ---------- helpers ---------- */

const formatIndian = (num: number) =>
  num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

/* ---------------- component ---------------- */

export default function SipAmcWisePerformanceCalculator() {
  const [amc, setAmc] = useState("SBI Mutual Fund");
  const [period, setPeriod] = useState("10Y");
  const [monthly, setMonthly] = useState("5000");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [response, setResponse] =
    useState<SipAmcWisePerformanceApiResponse | null>(null);

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
        period,
        monthly: monthlyNum.toString(),
      });

      const res = await fetch(
        `http://localhost:8080/api/mf/sip-amc-wise?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("API error");
      }

      const data: SipAmcWisePerformanceApiResponse = await res.json();
      setResponse(data);
    } catch (e) {
      console.error("Error calling SIP AMC-wise performance API", e);
      setError(
        "Something went wrong while fetching AMC-wise SIP performance. Please try again."
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
                {loading ? "Calculating..." : "Show AMC-wise SIP Performance"}
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
                What is SIP AMC-wise performance?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This tool compares how different schemes from the same asset
                management company (AMC) have rewarded SIP investors. You enter
                one AMC, a SIP amount and time period, and the tool shows which
                schemes of that AMC created better wealth.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The calculator shows:
              </Typography>
              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>
                  Total amount invested via SIP in the selected AMC over the
                  chosen period.
                </li>
                <li>
                  Current value, absolute return and CAGR for each scheme (demo
                  values for now).
                </li>
                <li>
                  Best, worst and average CAGR among schemes of that AMC.
                </li>
              </ul>

              <Typography variant="body2" color="text.secondary">
                In production this page can be powered by AMFI NAV data so that
                every scheme under the AMC is evaluated automatically.
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
                  AMC-wise SIP performance summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasResult
                    ? response?.summaryText
                    : "Select an AMC, period and SIP amount to see which schemes from that AMC would have rewarded your SIPs better."}
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
                SIP performance for {response.amcName} schemes
              </Typography>
              <Box sx={{ width: "100%", height: { xs: 260, md: 320 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={response.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="schemeName" />
                    <YAxis />
                    <Tooltip />
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
                Each bar shows the estimated corpus and CAGR of your SIP if it
                was run only in that scheme of the chosen AMC.
              </Typography>
            </Box>

            {/* TABLE */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Detailed SIP performance – {response.amcName}
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  size="small"
                  aria-label="AMC-wise SIP performance table with scheme, AUM, invested amount, value and CAGR"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Scheme Name</TableCell>
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
                These are sample numbers for demo purposes. Once connected to
                live data, this page can show real AMC-wise SIP performance to
                help you pick the best schemes within one fund house.
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
