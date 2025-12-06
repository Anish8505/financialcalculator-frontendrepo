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
} from "@mui/material";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

/* ---------- types ---------- */

type MfLiveReturnPoint = {
  year: number;
  investedAmount: number;
  value: number;
};

type MfLiveReturnApiResponse = {
  calculator: string;
  currency: string;
  amcName: string;
  schemeName: string;
  mode: string; // "SIP" or "LUMPSUM"
  periodLabel: string;
  inputAmount: number;
  totalInvestedAmount: number;
  currentValue: number;
  absoluteReturnPercent: number;
  cagrPercent: number;
  fromDate: string;
  toDate: string;
  navAsOfDate: string;
  inputSummary: string;
  summaryText: string;
  chartData: MfLiveReturnPoint[];
};

/* ---------- helpers ---------- */

const formatIndian = (num: number) =>
  num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

/* ---------------- component ---------------- */

export default function MfLiveReturnCalculator() {
  const [amc, setAmc] = useState("HDFC Mutual Fund");
  const [scheme, setScheme] = useState("HDFC Flexi Cap Fund");
  const [mode, setMode] = useState<"SIP" | "LUMPSUM">("SIP");
  const [period, setPeriod] = useState("3Y");
  const [amount, setAmount] = useState("5000");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<MfLiveReturnApiResponse | null>(
    null
  );

  const hasResult = !!response;

  const handleSubmit = async () => {
    setError(null);
    setResponse(null);

    const rawAmount = Number(amount.replace(/,/g, ""));
    if (!rawAmount || rawAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!scheme.trim()) {
      setError("Please enter a mutual fund scheme name.");
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams({
        amc,
        scheme,
        mode,
        amount: rawAmount.toString(),
        period,
      });

      const res = await fetch(
        `http://localhost:8080/api/mf/live-return?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("API error");
      }

      const data: MfLiveReturnApiResponse = await res.json();
      setResponse(data);
    } catch (e) {
      console.error("Error calling MF live return API", e);
      setError(
        "Something went wrong while fetching live return. Please try again."
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
                <MenuItem value="HDFC Mutual Fund">HDFC Mutual Fund</MenuItem>
                <MenuItem value="SBI Mutual Fund">SBI Mutual Fund</MenuItem>
                <MenuItem value="ICICI Prudential Mutual Fund">
                  ICICI Prudential Mutual Fund
                </MenuItem>
                <MenuItem value="Axis Mutual Fund">Axis Mutual Fund</MenuItem>
                <MenuItem value="Kotak Mutual Fund">Kotak Mutual Fund</MenuItem>
                <MenuItem value="All AMCs">All AMCs</MenuItem>
              </TextField>

              <TextField
                label="Scheme name"
                value={scheme}
                onChange={(e) => setScheme(e.target.value)}
                helperText="Type the mutual fund scheme name. In future this can become an autocomplete from AMFI."
              />

              <TextField
                select
                label="Mode"
                value={mode}
                onChange={(e) =>
                  setMode(e.target.value === "LUMPSUM" ? "LUMPSUM" : "SIP")
                }
              >
                <MenuItem value="SIP">SIP (monthly)</MenuItem>
                <MenuItem value="LUMPSUM">Lumpsum (one-time)</MenuItem>
              </TextField>

              <TextField
                select
                label="Period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <MenuItem value="1Y">1 Year</MenuItem>
                <MenuItem value="3Y">3 Years</MenuItem>
                <MenuItem value="5Y">5 Years</MenuItem>
                <MenuItem value="10Y">10 Years</MenuItem>
              </TextField>

              <TextField
                label={mode === "SIP" ? "Monthly SIP Amount (₹)" : "Lumpsum Amount (₹)"}
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
                {loading ? "Calculating..." : "Check Live Return (Demo)"}
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
                What does this live return tool show?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This page is designed to work with live NAV data from AMFI.
                For now it uses sample CAGR numbers, but the JSON format and UI
                are ready for plug-and-play with a real data provider.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter the scheme, choose SIP or lumpsum, select a time period
                and amount. The calculator estimates how much your investment
                would be worth today, along with CAGR and absolute return.
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
                  Live return summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasResult
                    ? response?.summaryText
                    : "Fill the form on the left and click the button to see estimated live returns for the selected fund."}
                </Typography>

                {hasResult && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    <strong>Invested vs Current Value:</strong>{" "}
                    ₹{formatIndian(response.totalInvestedAmount)} → ₹
                    {formatIndian(response.currentValue)}{" "}
                    ({response.absoluteReturnPercent.toFixed(2)}%,
                    CAGR {response.cagrPercent.toFixed(2)}%)
                  </Typography>
                )}
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* CHART */}
      {hasResult && response && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Year-by-year growth of your investment
          </Typography>
          <Box sx={{ width: "100%", height: { xs: 260, md: 320 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={response.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name.includes("Value")) {
                      return `₹${value.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}`;
                    }
                    return `₹${value.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}`;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="investedAmount"
                  name="Invested amount (₹)"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Estimated value (₹)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            The lighter line shows how much you would have invested over time,
            while the darker line shows the estimated value of that investment
            using a constant CAGR. When connected to AMFI, these values can be
            driven directly by daily NAV.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
