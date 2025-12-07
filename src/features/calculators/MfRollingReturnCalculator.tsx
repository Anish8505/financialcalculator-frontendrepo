import { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

/* ---------- API BASE URL added ---------- */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

type RollingPoint = {
  startDate: string;
  endDate: string;
  rollingReturnPercent: number;
};

type MfRollingReturnResponse = {
  calculator: string;
  currency: string;
  schemeCode: string;
  schemeName: string;
  periodLabel: string;
  lookbackYears: number;
  observations: number;
  minRollingReturnPercent: number;
  maxRollingReturnPercent: number;
  averageRollingReturnPercent: number;
  inputSummary: string;
  summaryText: string;
  points: RollingPoint[];
};

export default function MfRollingReturnCalculator() {
  const [schemeCode, setSchemeCode] = useState("120503");
  const [period, setPeriod] = useState("3Y");
  const [years, setYears] = useState("10");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MfRollingReturnResponse | null>(null);

  const hasResult = !!result;

  const handleSubmit = async () => {
    setError(null);
    setResult(null);

    const yearsNum = Number(years);
    if (!yearsNum || yearsNum <= 0) {
      setError("Please enter valid lookback years (> 0).");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        schemeCode,
        period,
        years: yearsNum.toString(),
      });

      const res = await fetch(
        `${API_BASE_URL}/mf/rolling-returns?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("API error");
      }

      const data: MfRollingReturnResponse = await res.json();
      setResult(data);
    } catch (e) {
      console.error("Error fetching rolling returns", e);
      setError(
        "Something went wrong while fetching rolling returns. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* TOP: form + explanation */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          {/* LEFT: form */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 45%" } }}>
            <Stack spacing={2}>
              <TextField
                label="Scheme Code"
                value={schemeCode}
                onChange={(e) => setSchemeCode(e.target.value)}
                helperText="Enter mutual fund scheme code or internal ID (demo)."
              />

              <TextField
                select
                label="Rolling Period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <MenuItem value="1Y">1 Year Rolling</MenuItem>
                <MenuItem value="3Y">3 Year Rolling</MenuItem>
                <MenuItem value="5Y">5 Year Rolling</MenuItem>
              </TextField>

              <TextField
                label="Lookback Years"
                value={years}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setYears(raw);
                }}
                helperText="How many past years of history to consider (e.g. 10, 15)."
              />

              {error && (
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              )}

              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Calculating..." : "Show Rolling Returns"}
              </Button>

              {hasResult && (
                <Typography variant="caption" color="text.secondary">
                  {result?.inputSummary}
                </Typography>
              )}
            </Stack>
          </Box>

          {/* RIGHT: text explanation + summary */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 55%" } }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                What are rolling returns?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rolling returns tell you how a fund behaved over every possible{" "}
                <strong>time window</strong> – for example, every 3-year period in the
                last 10 years. Instead of looking at only a single point like “last
                3-year return”, rolling returns show consistency across time.
              </Typography>

              <Typography variant="body2" color="text.secondary">
                This tool takes a chosen rolling period (1Y / 3Y / 5Y) and a
                lookback history (for example 10 years) and then calculates the
                return for each overlapping window. You can then see the minimum,
                maximum and average rolling returns.
              </Typography>

              <Box
                sx={{
                  bgcolor: "rgba(240,248,255,0.7)",
                  borderRadius: 2,
                  p: 1.5,
                  mt: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Rolling return summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasResult
                    ? result?.summaryText
                    : "Enter a scheme code, select rolling period and lookback years to see the range of rolling returns."}
                </Typography>

                {hasResult && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    <strong>Min / Max / Average:</strong>{" "}
                    {result?.minRollingReturnPercent.toFixed(2)}% /{" "}
                    {result?.maxRollingReturnPercent.toFixed(2)}% /{" "}
                    {result?.averageRollingReturnPercent.toFixed(2)}%
                  </Typography>
                )}
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* BOTTOM: chart */}
      {hasResult && result && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Rolling {result.periodLabel} returns over {result.lookbackYears} years
          </Typography>

          <Box sx={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.points}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="endDate" tick={false} />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                  labelFormatter={(label: string, payload) => {
                    if (payload && payload[0]) {
                      const p = payload[0].payload as RollingPoint;
                      return `${p.startDate} → ${p.endDate}`;
                    }
                    return label;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rollingReturnPercent"
                  stroke="#0f766e"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Each point represents the annualised return for one rolling window.
            A fund with less extreme ups and downs in this chart generally has
            more consistent performance.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
