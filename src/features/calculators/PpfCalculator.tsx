// src/features/calculators/PpfCalculator.tsx
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

type PpfPoint = {
  year: number;
  invested: number;
  total: number;
};

type BarPoint = {
  name: string;
  Invested: number;
  Interest: number;
};

type PpfYearPointApi = {
  year: number;
  invested: number;
  total: number;
};

type PpfApiResponse = {
  calculator: string;
  currency: string;
  yearlyContribution: number;
  annualRatePercent: number;
  years: number;
  investedAmount: number;
  maturityAmount: number;
  interestEarned: number;
  yearlyPoints: PpfYearPointApi[];
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

export default function PpfCalculator() {
  const [yearly, setYearly] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");

  const [summary, setSummary] = useState("");
  const [investedWordsSummary, setInvestedWordsSummary] = useState("");
  const [interestWordsSummary, setInterestWordsSummary] = useState("");
  const [maturityWordsSummary, setMaturityWordsSummary] = useState("");

  const [lineData, setLineData] = useState<PpfPoint[]>([]);
  const [barData, setBarData] = useState<BarPoint[]>([]);

  const hasResult = lineData.length > 0 && barData.length > 0;

  const handleCalculate = async () => {
    const yearlyAmount = Number(yearly.replace(/,/g, ""));
    const r = Number(annualRate);
    const t = Number(years);

    if (!yearlyAmount || !r || !t) {
      setSummary(
        "Please enter yearly PPF contribution, annual interest rate and tenure to calculate PPF maturity."
      );
      setInvestedWordsSummary("");
      setInterestWordsSummary("");
      setMaturityWordsSummary("");
      setLineData([]);
      setBarData([]);
      return;
    }

    try {
      const params = new URLSearchParams({
        yearly: yearlyAmount.toString(),
        rate: r.toString(),
        years: t.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/ppf?${params}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: PpfApiResponse = await response.json();

      // Map backend -> frontend
      const yearlyContribution = data.yearlyContribution;
      const tenureYears = data.years;
      const invested = data.investedAmount;
      const maturity = data.maturityAmount;
      const interest = data.interestEarned;

      const maturityRounded = Math.round(maturity);
      const interestRounded = Math.round(interest);

      setSummary(
        `You invest ₹${yearlyContribution.toLocaleString(
          "en-IN"
        )} every year in PPF for ${tenureYears} years (total investment: ₹${invested.toLocaleString(
          "en-IN"
        )}). At maturity, you may receive about ₹${maturityRounded.toLocaleString(
          "en-IN"
        )}, of which ₹${interestRounded.toLocaleString("en-IN")} is interest.`
      );

      setInvestedWordsSummary(
        toTitleCase(numberToWords(Math.round(invested)))
      );
      setInterestWordsSummary(toTitleCase(numberToWords(interestRounded)));
      setMaturityWordsSummary(toTitleCase(numberToWords(maturityRounded)));

      let yearlyPoints: PpfPoint[] = [];

      if (Array.isArray(data.yearlyPoints) && data.yearlyPoints.length > 0) {
        yearlyPoints = data.yearlyPoints.map((p) => ({
          year: p.year,
          invested: p.invested,
          total: p.total,
        }));
      }

      setLineData(yearlyPoints);

      setBarData([
        {
          name: "PPF",
          Invested: invested,
          Interest: interest,
        },
      ]);
    } catch (err) {
      console.error("Error calling PPF API", err);
      setSummary(
        "Something went wrong while calculating your PPF maturity. Please try again."
      );
      setInvestedWordsSummary("");
      setInterestWordsSummary("");
      setMaturityWordsSummary("");
      setLineData([]);
      setBarData([]);
    }
  };

  const yearlyNumeric = Number(yearly.replace(/,/g, ""));
  const annualRateNumeric = Number(annualRate);
  const yearsNumeric = Number(years);

  const yearlyWords = yearlyNumeric
    ? toTitleCase(numberToWords(yearlyNumeric))
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
          {/* LEFT: FORM */}
          <Box
            sx={{
              flex: { xs: "1 1 auto", md: "0 0 50%" },
              "& .MuiTextField-root": { width: "100%" },
            }}
          >
            <Stack spacing={2}>
              <TextField
                label="Yearly PPF Contribution (₹)"
                value={yearly}
                onChange={(e) => setYearly(formatIndianNumber(e.target.value))}
              />
              {yearlyWords && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {yearlyWords}
                </Typography>
              )}

              <TextField
                label="Interest Rate (p.a. %)"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
              />
              {rateWords && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {rateWords}
                </Typography>
              )}

              <TextField
                label="Tenure (years)"
                value={years}
                onChange={(e) => setYears(e.target.value)}
              />
              {yearsWords && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {yearsWords}
                </Typography>
              )}

              <Button variant="contained" size="large" onClick={handleCalculate}>
                Calculate PPF Maturity
              </Button>
            </Stack>
          </Box>

          {/* RIGHT: HOW IT WORKS + SUMMARY + FORMULA */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 50%" } }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                How this PPF calculator works
              </Typography>

              <Typography variant="body2" color="text.secondary">
                This PPF calculator assumes you invest a fixed amount every year
                and earn a constant interest rate compounded annually. It
                estimates:
              </Typography>

              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>Total amount invested over the tenure</li>
                <li>Total interest earned on your contributions</li>
                <li>Final maturity amount at the end of the PPF term</li>
              </ul>

              <Typography variant="body2" color="text.secondary">
                For yearly investments, the future value (FV) is computed using a
                formula similar to a SIP with yearly frequency:
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
                {/* FV formula */}
                FV = P × [((1 + r)<sup>n</sup> − 1) / r] × (1 + r)
              </Box>

              <Typography variant="caption" color="text.secondary">
                Where P is yearly contribution, r is annual interest rate, and n
                is number of years.
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
                  PPF maturity summary
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {hasResult
                    ? summary
                    : "Enter your yearly contribution, interest rate and tenure to estimate your PPF maturity value."}
                </Typography>

                {hasResult && (
                  <>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Total investment (in words):</strong>{" "}
                      {investedWordsSummary} Rupees
                    </Typography>
                    <Typography variant="body2">
                      <strong>Interest earned (in words):</strong>{" "}
                      {interestWordsSummary} Rupees
                    </Typography>
                    <Typography variant="body2">
                      <strong>Maturity amount (in words):</strong>{" "}
                      {maturityWordsSummary} Rupees
                    </Typography>
                  </>
                )}
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* CHART + TABLE */}
      {hasResult && (
        <Paper sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
            }}
          >
            {/* LEFT – LINE CHART + YEARLY TABLE */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                PPF growth over time (yearly)
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
                      name="Total invested"
                      stroke="#94a3b8"
                      strokeWidth={2}
                    />
                    <Line
                      dataKey="total"
                      name="Corpus value"
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
                Year-by-year PPF balance table
              </Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Year</TableCell>
                    <TableCell align="right">Invested so far (₹)</TableCell>
                    <TableCell align="right">Corpus value (₹)</TableCell>
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
                Total investment vs interest earned
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
                      name="Total invested"
                      fill="#38bdf8"
                    />
                    <Bar
                      dataKey="Interest"
                      name="Interest earned"
                      fill="#0f766e"
                    />
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
