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

type PpfApiResponse = {
  yearlyInvestment: number;
  tenureYears: number;
  maturityAmount: number;
  totalInvestment: number;
  totalInterest: number;
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

  const hasResult = lineData.length > 0;

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

      const invested = data.totalInvestment;
      const maturity = data.maturityAmount;
      const interest = data.totalInterest;
      const tenureYears = data.tenureYears;

      const maturityRounded = Math.round(maturity);
      const interestRounded = Math.round(interest);

      setSummary(
        `You invest ₹${yearlyAmount.toLocaleString(
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

      // Fallback calculation for chart
      const yearlyPoints: PpfPoint[] = [];
      const rateDec = r / 100;
      const nYears = tenureYears || t;

      for (let year = 1; year <= nYears; year++) {
        const totalYear =
          yearlyAmount *
          ((Math.pow(1 + rateDec, year) - 1) / rateDec) *
          (1 + rateDec);

        yearlyPoints.push({
          year,
          invested: yearlyAmount * year,
          total: totalYear,
        });
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
      {/* TOP CARD */}
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

          {/* RIGHT SUMMARY */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 50%" } }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                How this PPF calculator works
              </Typography>

              <Typography variant="body2" color="text.secondary">
                This calculator shows total investment, interest earned, and final
                maturity value based on yearly contributions and compound interest.
              </Typography>

              <Divider />

              <Box
                sx={{
                  bgcolor: "rgba(240,248,255,0.7)",
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <Typography variant="subtitle2">Summary</Typography>

                <Typography variant="body2" color="text.secondary">
                  {hasResult
                    ? summary
                    : "Enter PPF details above to see maturity value."}
                </Typography>

                {hasResult && (
                  <>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Total investment:</strong>{" "}
                      {investedWordsSummary} Rupees
                    </Typography>
                    <Typography variant="body2">
                      <strong>Interest earned:</strong>{" "}
                      {interestWordsSummary} Rupees
                    </Typography>
                    <Typography variant="body2">
                      <strong>Maturity amount:</strong>{" "}
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
            {/* LINE CHART */}
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
                    <Tooltip />
                    <Legend />
                    <Line dataKey="invested" stroke="#94a3b8" />
                    <Line dataKey="total" stroke="#0f766e" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>

            {/* BAR CHART */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Investment vs Interest
              </Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Invested" fill="#38bdf8" />
                    <Bar dataKey="Interest" fill="#0f766e" />
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
