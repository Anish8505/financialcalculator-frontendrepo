// src/features/calculators/LumpsumCalculator.tsx
import { useState } from "react";
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

/* ---------- API BASE URL ---------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/* ---------- types ---------- */

type LumpsumPoint = {
  year: number;
  invested: number;
  total: number;
};

type BarPoint = {
  name: string;
  Invested: number;
  Gain: number;
};

type LumpsumYearPointApi = {
  year: number;
  invested: number;
  total: number;
};

type LumpsumApiResponse = {
  investedAmount: number;
  maturityAmount: number;
  profit: number;
  yearlyPoints?: LumpsumYearPointApi[];
};

/* ---------- helpers ---------- */

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
    return b[Math.floor(n / 10)] + (n % 10 ? " " + a[Math.floor(n % 10)] : "");
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

/* ------------------------------- component ------------------------------- */

export default function LumpsumCalculator() {
  const [amount, setAmount] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");

  const [summary, setSummary] = useState("");
  const [investedWordsSummary, setInvestedWordsSummary] = useState("");
  const [gainWordsSummary, setGainWordsSummary] = useState("");
  const [futureWordsSummary, setFutureWordsSummary] = useState("");

  const [lineData, setLineData] = useState<LumpsumPoint[]>([]);
  const [barData, setBarData] = useState<BarPoint[]>([]);

  const hasResult = lineData.length > 0 && barData.length > 0;

  const handleCalculate = async () => {
    const principal = Number(amount.replace(/,/g, ""));
    const r = Number(annualRate);
    const t = Number(years);

    if (!principal || !r || !t) {
      setSummary(
        "Please enter investment amount, annual return and time period to calculate lumpsum growth."
      );
      setInvestedWordsSummary("");
      setGainWordsSummary("");
      setFutureWordsSummary("");
      setLineData([]);
      setBarData([]);
      return;
    }

    try {
      const params = new URLSearchParams({
        amount: principal.toString(),
        rate: r.toString(),
        years: t.toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/lumpsum?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("API error");
      }

      const data: LumpsumApiResponse = await response.json();

      const invested = data.investedAmount;
      const total = data.maturityAmount;
      const gain = data.profit;

      const totalRounded = Math.round(total);
      const gainRounded = Math.round(gain);

      setSummary(
        `You invest ₹${invested.toLocaleString(
          "en-IN"
        )} as a one-time lumpsum and it may grow to ₹${totalRounded.toLocaleString(
          "en-IN"
        )} (gain: ₹${gainRounded.toLocaleString("en-IN")}).`
      );

      const investedWordsRaw = numberToWords(Math.round(invested));
      const gainWordsRaw = numberToWords(gainRounded);
      const futureWordsRaw = numberToWords(totalRounded);

      setInvestedWordsSummary(
        investedWordsRaw ? toTitleCase(investedWordsRaw) : ""
      );
      setGainWordsSummary(gainWordsRaw ? toTitleCase(gainWordsRaw) : "");
      setFutureWordsSummary(futureWordsRaw ? toTitleCase(futureWordsRaw) : "");

      let yearlyPoints: LumpsumPoint[] = [];

      if (Array.isArray(data.yearlyPoints) && data.yearlyPoints.length > 0) {
        yearlyPoints = data.yearlyPoints.map((p) => ({
          year: p.year,
          invested: p.invested,
          total: p.total,
        }));
      } else {
        // Fallback: approximate monthly compounding
        const monthlyRate = r / 12 / 100;
        for (let year = 1; year <= t; year++) {
          const n = year * 12;
          const totalYear = principal * Math.pow(1 + monthlyRate, n);
          yearlyPoints.push({
            year,
            invested: principal,
            total: totalYear,
          });
        }
      }

      setLineData(yearlyPoints);

      setBarData([
        {
          name: "Lumpsum",
          Invested: invested,
          Gain: gain,
        },
      ]);
    } catch (err) {
      console.error("Error calling Lumpsum API", err);
      setSummary(
        "Something went wrong while calculating your lumpsum returns. Please try again."
      );
      setInvestedWordsSummary("");
      setGainWordsSummary("");
      setFutureWordsSummary("");
      setLineData([]);
      setBarData([]);
    }
  };

  const amountNumeric = Number(amount.replace(/,/g, ""));
  const annualRateNumeric = Number(annualRate);
  const yearsNumeric = Number(years);

  const amountWords = amountNumeric
    ? toTitleCase(numberToWords(amountNumeric))
    : "";
  const rateWords = annualRateNumeric
    ? toTitleCase(numberToWords(annualRateNumeric)) + " Percent Per Annum"
    : "";
  const yearsWords = yearsNumeric
    ? toTitleCase(numberToWords(yearsNumeric)) +
      (yearsNumeric === 1 ? " Year" : " Years")
    : "";

  return (
    <Box>
      {/* TOP CARD – FORM + EXPLANATION + SUMMARY */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          {/* LEFT – FORM */}
          <Box
            sx={{
              flex: { xs: "1 1 auto", md: "0 0 50%" },
              "& .MuiTextField-root": { width: "100%" },
            }}
          >
            <Stack spacing={2}>
              <TextField
                label="Lumpsum Investment (₹)"
                value={amount}
                onChange={(e) =>
                  setAmount(formatIndianNumber(e.target.value))
                }
              />
              {amountWords && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {amountWords}
                </Typography>
              )}

              <TextField
                label="Expected Return (p.a. %)"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
              />
              {rateWords && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {rateWords}
                </Typography>
              )}

              <TextField
                label="Time Period (years)"
                value={years}
                onChange={(e) => setYears(e.target.value)}
              />
              {yearsWords && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {yearsWords}
                </Typography>
              )}

              <Button variant="contained" size="large" onClick={handleCalculate}>
                Calculate Lumpsum Growth
              </Button>
            </Stack>
          </Box>

          {/* RIGHT – HOW IT WORKS + FORMULA + SUMMARY */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 50%" } }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                How this lumpsum calculator works
              </Typography>

              <Typography variant="body2" color="text.secondary">
                This calculator assumes you invest a one-time amount and let it
                grow at a constant annual return, compounded monthly. It shows:
              </Typography>

              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>Total amount invested (your lumpsum)</li>
                <li>Future value after the selected period</li>
                <li>Wealth created (gain over your principal)</li>
              </ul>

              <Typography variant="body2" color="text.secondary">
                We use a standard compound interest formula for lumpsum
                investments:
              </Typography>

              <Box
                sx={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  bgcolor: "rgba(15,118,110,0.04)",
                  borderRadius: 1,
                  p: 1.2,
                }}
              >
                FV = P × (1 + r/n)<sup>n×t</sup>
              </Box>

              <Typography variant="caption" color="text.secondary">
                Where P is your one-time investment, r is annual interest rate,
                n is compounding frequency (12 for monthly), and t is years.
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
                  Lumpsum summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasResult
                    ? summary
                    : "Enter your one-time investment, expected return and time period to see the future value and wealth created."}
                </Typography>

                {hasResult && (
                  <>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Invested amount (in words):</strong>{" "}
                      {investedWordsSummary} Rupees
                    </Typography>
                    <Typography variant="body2">
                      <strong>Wealth created (in words):</strong>{" "}
                      {gainWordsSummary} Rupees
                    </Typography>
                    <Typography variant="body2">
                      <strong>Future value (in words):</strong>{" "}
                      {futureWordsSummary} Rupees
                    </Typography>
                  </>
                )}
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* CHARTS + TABLE */}
      {hasResult && (
        <Paper sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
            }}
          >
            {/* LEFT – LINE CHART + TABLE */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Lumpsum growth over time (yearly)
              </Typography>

              <Box sx={{ height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip
                      formatter={(v: number) =>
                        `₹${v.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}`
                      }
                    />
                    <Legend />
                    <Line
                      dataKey="invested"
                      name="Invested amount"
                      stroke="#94a3b8"
                      strokeWidth={2}
                    />
                    <Line
                      dataKey="total"
                      name="Future value"
                      stroke="#0f766e"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              <Typography
                variant="body2"
                sx={{ mt: 2 }}
                color="text.secondary"
              >
                Year-by-year growth table
              </Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Year</TableCell>
                    <TableCell align="right">Invested (₹)</TableCell>
                    <TableCell align="right">Future value (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineData.map((row) => (
                    <TableRow key={row.year}>
                      <TableCell>{row.year}</TableCell>
                      <TableCell align="right">
                        {row.invested.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell align="right">
                        {row.total.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            {/* RIGHT – BAR CHART */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Total invested vs wealth gained
              </Typography>

              <Box sx={{ height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(v: number) =>
                        `₹${v.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}`
                      }
                    />
                    <Legend />
                    <Bar
                      dataKey="Invested"
                      name="Invested amount"
                      fill="#38bdf8"
                    />
                    <Bar dataKey="Gain" name="Wealth gained" fill="#0f766e" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
