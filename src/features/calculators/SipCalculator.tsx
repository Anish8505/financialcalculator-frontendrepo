// src/features/calculators/SipCalculator.tsx
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

/* ---------- base URL ---------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/* ---------- types ---------- */

type SipPoint = {
  year: number;
  invested: number;
  total: number;
};

type BarPoint = {
  name: string;
  Invested: number;
  Gain: number;
};

type SipYearPointApi = {
  year: number;
  invested: number;
  total: number;
};

type SipApiResponse = {
  investedAmount: number;
  maturityAmount: number;
  profit: number;
  yearlyPoints?: SipYearPointApi[];
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
    return (
      b[Math.floor(n / 10)] + (n % 10 ? " " + a[Math.floor(n % 10)] : "")
    );
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

export default function SipCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");

  const [summary, setSummary] = useState("");
  const [investedWordsSummary, setInvestedWordsSummary] = useState("");
  const [gainWordsSummary, setGainWordsSummary] = useState("");
  const [futureWordsSummary, setFutureWordsSummary] = useState("");

  const [lineData, setLineData] = useState<SipPoint[]>([]);
  const [barData, setBarData] = useState<BarPoint[]>([]);

  const hasResult = lineData.length > 0;

  /* ------------------ API CALL (updated URL) ------------------ */
  const handleCalculate = async () => {
    const p = Number(monthlyInvestment.replace(/,/g, ""));
    const r = Number(annualRate);
    const t = Number(years);

    if (!p || !r || !t) {
      setSummary(
        "Please enter monthly amount, annual return and time period to calculate SIP."
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
        monthly: p.toString(),
        rate: r.toString(),
        years: t.toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/sip?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("API error");
      }

      const data: SipApiResponse = await response.json();

      const invested = data.investedAmount;
      const total = data.maturityAmount;
      const gain = data.profit;

      const totalRounded = Math.round(total);
      const gainRounded = Math.round(gain);

      setSummary(
        `You invest ₹${invested.toLocaleString(
          "en-IN"
        )} and it may grow to ₹${totalRounded.toLocaleString(
          "en-IN"
        )} (gain: ₹${gainRounded.toLocaleString("en-IN")}).`
      );

      const investedWordsRaw = numberToWords(Math.round(invested));
      const gainWordsRaw = numberToWords(gainRounded);
      const futureWordsRaw = numberToWords(totalRounded);

      setInvestedWordsSummary(toTitleCase(investedWordsRaw || ""));
      setGainWordsSummary(toTitleCase(gainWordsRaw || ""));
      setFutureWordsSummary(toTitleCase(futureWordsRaw || ""));

      let yearlyPoints: SipPoint[] = [];

      if (Array.isArray(data.yearlyPoints) && data.yearlyPoints.length > 0) {
        yearlyPoints = data.yearlyPoints.map((p) => ({
          year: p.year,
          invested: p.invested,
          total: p.total,
        }));
      } else {
        const monthlyRate = r / 12 / 100;
        for (let year = 1; year <= t; year++) {
          const n = year * 12;
          const totalYear =
            p *
            ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) *
            (1 + monthlyRate);
          const investedYear = p * n;
          yearlyPoints.push({
            year,
            invested: investedYear,
            total: totalYear,
          });
        }
      }

      setLineData(yearlyPoints);

      setBarData([
        {
          name: "SIP",
          Invested: invested,
          Gain: gain,
        },
      ]);
    } catch (err) {
      console.error("Error calling SIP API", err);
      setSummary(
        "Something went wrong while calculating your SIP. Please try again."
      );
      setInvestedWordsSummary("");
      setGainWordsSummary("");
      setFutureWordsSummary("");
      setLineData([]);
      setBarData([]);
    }
  };

  const monthlyInvestmentNumeric = Number(
    monthlyInvestment.replace(/,/g, "")
  );
  const annualRateNumeric = Number(annualRate);
  const yearsNumeric = Number(years);

  const monthlyWords = monthlyInvestmentNumeric
    ? toTitleCase(numberToWords(monthlyInvestmentNumeric))
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
      {/* TOP SECTION */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          {/* LEFT FORM */}
          <Box
            sx={{
              flex: { xs: "1 1 auto", md: "0 0 50%" },
              "& .MuiTextField-root": {
                width: "100%",
              },
            }}
          >
            <Stack spacing={2}>
              <TextField
                label="Monthly Investment (₹)"
                type="text"
                value={monthlyInvestment}
                onChange={(e) =>
                  setMonthlyInvestment(formatIndianNumber(e.target.value))
                }
              />
              {monthlyWords && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    mt: -0.5,
                  }}
                >
                  {monthlyWords}
                </Typography>
              )}

              <TextField
                label="Expected Return (p.a. %)"
                type="number"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
              />
              {rateWords && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    mt: -0.5,
                  }}
                >
                  {rateWords}
                </Typography>
              )}

              <TextField
                label="Time Period (years)"
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
              />
              {yearsWords && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    mt: -0.5,
                  }}
                >
                  {yearsWords}
                </Typography>
              )}

              <Button variant="contained" size="large" onClick={handleCalculate}>
                Calculate SIP Returns
              </Button>
            </Stack>
          </Box>

          {/* RIGHT SIDE — EXPLANATION + SUMMARY */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 50%" } }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                How this SIP calculator works
              </Typography>

              <Typography variant="body2" color="text.secondary">
                This SIP calculator assumes:
              </Typography>

              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>You invest monthly.</li>
                <li>Returns compound monthly.</li>
                <li>Shows invested amount, future value, and gains.</li>
              </ul>

              <Typography variant="body2" color="text.secondary">
                Formula:
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
                FV = A × [((1 + i)^n − 1) / i] × (1 + i)
              </Box>

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
                  {hasResult
                    ? summary
                    : "Enter SIP details to calculate future value."}
                </Typography>

                {hasResult && (
                  <>
                    {investedWordsSummary && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          mt: 1,
                        }}
                      >
                        <strong>Invested amount:</strong>{" "}
                        {investedWordsSummary} Rupees.
                      </Typography>
                    )}

                    {gainWordsSummary && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          mt: 1,
                        }}
                      >
                        <strong>Wealth gained:</strong>{" "}
                        {gainWordsSummary} Rupees.
                      </Typography>
                    )}

                    {futureWordsSummary && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          mt: 1,
                        }}
                      >
                        <strong>Future value:</strong>{" "}
                        {futureWordsSummary} Rupees.
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* BOTTOM: CHARTS + TABLES */}
      {hasResult && (
        <Paper sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
            }}
          >
            {/* LINE CHART */}
            <Box sx={{ flex: "1 1 0" }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                SIP growth over time (yearly)
              </Typography>

              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="invested"
                      name="Invested"
                      stroke="#94a3b8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Future value"
                      stroke="#0f766e"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              {/* SEO table */}
              <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
                Year-by-year SIP growth table
              </Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Year</TableCell>
                    <TableCell align="right">Invested (₹)</TableCell>
                    <TableCell align="right">Future Value (₹)</TableCell>
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

            {/* BAR CHART */}
            <Box sx={{ flex: "1 1 0" }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Total invested vs wealth gained
              </Typography>

              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="Invested"
                      fill="#38bdf8"
                      name="Invested amount"
                    />
                    <Bar dataKey="Gain" fill="#0f766e" name="Gain" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              {/* SEO table */}
              <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
                Total invested vs wealth gain
              </Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="right">Invested (₹)</TableCell>
                    <TableCell align="right">Grown To (₹)</TableCell>
                    <TableCell align="right">Gain (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {barData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell
