import { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  Typography,
  Button,
  MenuItem,
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

type StepUpSipYearPoint = {
  year: number;
  monthlySip: number;
  investedAmount: number;
  corpusValue: number;
};

type StepUpSipApiResponse = {
  calculator: string;
  currency: string;
  startMonthlySip: number;
  annualRatePercent: number;
  years: number;
  stepType: string; // "PERCENT" | "FIXED"
  stepPercent: number;
  stepAmount: number;
  totalInvestedAmount: number;
  maturityAmount: number;
  totalGain: number;
  inputSummary: string;
  explanation: string;
  yearlyPoints: StepUpSipYearPoint[];
};

/* ---------- helpers ---------- */

const formatIndian = (num: number) =>
  num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

/* ---------- component ---------- */

export default function StepUpSipCalculator() {
  const [monthly, setMonthly] = useState("5000");
  const [years, setYears] = useState("15");
  const [rate, setRate] = useState("12");
  const [stepType, setStepType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [stepValue, setStepValue] = useState("10");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<StepUpSipApiResponse | null>(null);

  const hasResult = !!response;

  const handleSubmit = async () => {
    setError(null);
    setResponse(null);

    const monthlyNum = Number(monthly.replace(/,/g, ""));
    const yearsNum = Number(years);
    const rateNum = Number(rate);
    const stepNum = Number(stepValue);

    if (!monthlyNum || monthlyNum <= 0) {
      setError("Please enter a valid starting monthly SIP amount.");
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
    if (stepNum < 0) {
      setError("Step-up value cannot be negative.");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        monthly: monthlyNum.toString(),
        years: yearsNum.toString(),
        rate: rateNum.toString(),
        stepType,
        stepValue: stepNum.toString(),
      });

      const res = await fetch(
        `http://localhost:8080/api/step-up-sip?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("API error");
      }

      const data: StepUpSipApiResponse = await res.json();
      setResponse(data);
    } catch (e) {
      console.error("Error calling step-up SIP API", e);
      setError(
        "Something went wrong while calculating step-up SIP. Please try again."
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
                label="Starting Monthly SIP (₹)"
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

              <TextField
                select
                label="Step-up Type"
                value={stepType}
                onChange={(e) =>
                  setStepType(e.target.value as "PERCENT" | "FIXED")
                }
              >
                <MenuItem value="PERCENT">Percentage increase every year</MenuItem>
                <MenuItem value="FIXED">Fixed amount increase every year</MenuItem>
              </TextField>

              <TextField
                label={
                  stepType === "PERCENT"
                    ? "Step-up Percentage per Year (%)"
                    : "Step-up Amount per Year (₹)"
                }
                value={stepValue}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (!raw) {
                    setStepValue("");
                    return;
                  }
                  if (!/^\d*\.?\d*$/.test(raw)) return;
                  setStepValue(raw);
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
                {loading ? "Calculating..." : "Calculate Step-Up SIP"}
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
                What is a Step-Up SIP?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Step-Up SIP is a regular SIP where you increase the monthly
                investment every year. This matches your growing income and
                helps you reach goals faster without feeling a big burden in the
                beginning.
              </Typography>

              <Typography variant="body2" color="text.secondary">
                With this calculator you can:
              </Typography>
              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>Start with a comfortable monthly SIP.</li>
                <li>
                  Choose yearly step-up as a{" "}
                  <strong>percentage</strong> (for example 10% per year) or a{" "}
                  <strong>fixed amount</strong> (like ₹1,000 extra per year).
                </li>
                <li>
                  See total invested amount, final corpus and how the SIP and
                  corpus grow year by year.
                </li>
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
                  Step-Up SIP summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasResult
                    ? response?.explanation
                    : "Enter starting SIP, years, expected return and step-up rule to see how your investment grows over time."}
                </Typography>

                {hasResult && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    <strong>Total Invested:</strong> ₹
                    {formatIndian(response!.totalInvestedAmount)} •{" "}
                    <strong>Estimated Corpus:</strong> ₹
                    {formatIndian(response!.maturityAmount)} •{" "}
                    <strong>Gain:</strong> ₹
                    {formatIndian(response!.totalGain)}
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
            Year-wise SIP step-up and corpus growth
          </Typography>

          <Box sx={{ width: "100%", height: { xs: 260, md: 320 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={response.yearlyPoints}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    switch (name) {
                      case "monthlySip":
                        return [
                          `₹${value.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}`,
                          "Monthly SIP",
                        ];
                      case "investedAmount":
                        return [
                          `₹${value.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}`,
                          "Total Invested",
                        ];
                      default:
                        return [
                          `₹${value.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}`,
                          "Corpus Value",
                        ];
                    }
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="monthlySip"
                  name="Monthly SIP (₹)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="investedAmount"
                  name="Total Invested (₹)"
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
            The blue line shows how your monthly SIP increases every year, grey
            shows how much you have invested till that year, and green shows the
            estimated corpus at the same time.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
