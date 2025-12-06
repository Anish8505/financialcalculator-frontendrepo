import { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  Typography,
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

/* -------- types -------- */

type SipPerDayYearPoint = {
  year: number;
  investedAmount: number;
  corpusValue: number;
};

type SipPerDayApiResponse = {
  calculator: string;
  currency: string;
  targetCorpus: number;
  annualRatePercent: number;
  years: number;
  requiredMonthlySip: number;
  requiredDailySaving: number;
  totalInvestedAmount: number;
  expectedMaturityAmount: number;
  inputSummary: string;
  explanation: string;
  yearlyPoints: SipPerDayYearPoint[];
};

/* -------- helpers -------- */

const formatIndian = (num: number) =>
  num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

/* -------- component -------- */

export default function SipPerDayCalculator() {
  const [goal, setGoal] = useState("1000000");
  const [years, setYears] = useState("10");
  const [rate, setRate] = useState("12");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<SipPerDayApiResponse | null>(null);

  const hasResult = !!response;

  const handleSubmit = async () => {
    setError(null);
    setResponse(null);

    const goalNum = Number(goal.replace(/,/g, ""));
    const yearsNum = Number(years);
    const rateNum = Number(rate);

    if (!goalNum || goalNum <= 0) {
      setError("Please enter a valid target corpus amount.");
      return;
    }
    if (!yearsNum || yearsNum <= 0) {
      setError("Please enter investment duration in years.");
      return;
    }
    if (!rateNum || rateNum <= 0) {
      setError("Please enter expected annual return in %.");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        goal: goalNum.toString(),
        years: yearsNum.toString(),
        rate: rateNum.toString(),
      });

      const res = await fetch(
        `http://localhost:8080/api/sip-per-day?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("API error");
      }

      const data: SipPerDayApiResponse = await res.json();
      setResponse(data);
    } catch (e) {
      console.error("Error calling SIP per day API", e);
      setError(
        "Something went wrong while calculating SIP per day. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* TOP: FORM + EXPLANATION */}
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
                label="Target Corpus (₹)"
                value={goal}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (!raw) {
                    setGoal("");
                    return;
                  }
                  if (!/^\d+$/.test(raw)) return;
                  setGoal(Number(raw).toLocaleString("en-IN"));
                }}
                helperText="Example: 10,00,000 for ₹10 lakh, 1,00,00,000 for ₹1 crore"
              />

              <TextField
                label="Investment Duration (Years)"
                value={years}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (!raw) {
                    setYears("");
                    return;
                  }
                  if (!/^\d+$/.test(raw)) return;
                  setYears(raw);
                }}
              />

              <TextField
                label="Expected Annual Return (%)"
                value={rate}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (!raw) {
                    setRate("");
                    return;
                  }
                  if (!/^\d*\.?\d*$/.test(raw)) return;
                  setRate(raw);
                }}
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
                {loading ? "Calculating..." : "Calculate SIP Per Day"}
              </Button>

              {hasResult && (
                <Typography variant="caption" color="text.secondary">
                  {response?.inputSummary}
                </Typography>
              )}
            </Stack>
          </Box>

          {/* RIGHT: EXPLANATION + SUMMARY BOX */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 55%" } }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                What is a SIP Per Day calculator?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                SIP Per Day shows how much you need to save{" "}
                <strong>every day</strong> to reach a target corpus using mutual
                fund SIPs. Instead of directly choosing a SIP amount, you start
                from your goal (for example ₹1 crore) and work backwards.
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Just enter your goal amount, investment period and expected
                annual return. The calculator tells you:
              </Typography>
              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>Required SIP per month.</li>
                <li>
                  Approximate saving needed per day for that SIP (30 days
                  assumed).
                </li>
                <li>Total amount you will invest over the years.</li>
              </ul>

              <Divider sx={{ my: 1.5 }} />

              <Box
                sx={{
                  bgcolor: "rgba(240,248,255,0.7)",
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  SIP per day summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasResult
                    ? response?.explanation
                    : "Enter your goal, duration and expected return to see how much you should invest per day and per month."}
                </Typography>

                {hasResult && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    <strong>Required SIP:</strong>{" "}
                    ₹{formatIndian(response!.requiredMonthlySip)} per month{" "}
                    (≈ ₹
                    {formatIndian(response!.requiredDailySaving)} per day) •{" "}
                    <strong>Total Invested:</strong> ₹
                    {formatIndian(response!.totalInvestedAmount)} •{" "}
                    <strong>Target Corpus:</strong> ₹
                    {formatIndian(response!.expectedMaturityAmount)}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* BOTTOM: CHART – YEARLY GROWTH */}
      {hasResult && response && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Yearly growth of your SIP (required amount)
          </Typography>
          <Box sx={{ width: "100%", height: { xs: 260, md: 320 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={response.yearlyPoints}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    return [
                      `₹${value.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}`,
                      name === "investedAmount"
                        ? "Total Invested"
                        : "Corpus Value",
                    ];
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="investedAmount"
                  name="Invested (₹)"
                  stroke="#64748b"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="corpusValue"
                  name="Corpus Value (₹)"
                  stroke="#0f766e"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This chart shows how your total investment and estimated corpus grow
            year by year if you consistently invest the required SIP amount.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
