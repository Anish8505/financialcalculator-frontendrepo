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

/* ---------- dynamic API base URL ---------- */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/* ---------- types ---------- */

type EmiPoint = {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balanceOutstanding: number;
};

type BarPoint = {
  name: string;
  Principal: number;
  Interest: number;
};

type EmiYearPointApi = {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balanceOutstanding: number;
};

type EmiApiResponse = {
  loanAmount: number;
  annualRatePercent: number;
  years: number;
  emiPerMonth: number;
  totalPayment: number;
  totalInterest: number;
  yearlyPoints?: EmiYearPointApi[];
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

  const twoDigits = (n: number): string =>
    n < 20 ? a[n] : b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");

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
      words +=
        threeDigits(chunk) + (u.label ? " " + u.label : "") + " ";
      num = num % u.value;
    }
  }

  return words.trim();
};

const toTitleCase = (str: string): string =>
  str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));

/* ----------------------------- Component ----------------------------- */

export default function EmiCalculator() {
  const [amount, setAmount] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");

  const [summary, setSummary] = useState("");
  const [emiWordsSummary, setEmiWordsSummary] = useState("");
  const [interestWordsSummary, setInterestWordsSummary] =
    useState("");

  const [lineData, setLineData] = useState<EmiPoint[]>([]);
  const [barData, setBarData] = useState<BarPoint[]>([]);

  const hasResult = lineData.length > 0;

  const handleCalculate = async () => {
    const principal = Number(amount.replace(/,/g, ""));
    const r = Number(annualRate);
    const t = Number(years);

    if (!principal || !r || !t) {
      setSummary(
        "Please enter loan amount, annual interest rate and tenure to calculate EMI."
      );
      setEmiWordsSummary("");
      setInterestWordsSummary("");
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

      const url = `${API_BASE_URL}/emi?${params.toString()}`;
      console.log("EMI API URL:", url);

      const response = await fetch(url);
      if (!response.ok) throw new Error("API error");

      const data: EmiApiResponse = await response.json();

      const emi = data.emiPerMonth;
      const totalPayment = data.totalPayment;
      const totalInterest = data.totalInterest;

      setSummary(
        `Your approximate EMI is ₹${emi.toLocaleString(
          "en-IN"
        )} per month. Over ${data.years} years, you pay a total of ₹${totalPayment.toLocaleString(
          "en-IN"
        )}, of which ₹${totalInterest.toLocaleString(
          "en-IN"
        )} is interest.`
      );

      setEmiWordsSummary(
        toTitleCase(numberToWords(Math.round(emi)))
      );
      setInterestWordsSummary(
        toTitleCase(numberToWords(Math.round(totalInterest)))
      );

      const yearlyPoints =
        data.yearlyPoints?.map((p) => ({
          year: p.year,
          principalPaid: p.principalPaid,
          interestPaid: p.interestPaid,
          balanceOutstanding: p.balanceOutstanding,
        })) || [];

      setLineData(yearlyPoints);

      setBarData([
        {
          name: "Loan",
          Principal: data.loanAmount,
          Interest: totalInterest,
        },
      ]);
    } catch (err) {
      console.error("Error calling EMI API", err);
      setSummary(
        "Something went wrong while calculating your EMI. Please try again."
      );
      setEmiWordsSummary("");
      setInterestWordsSummary("");
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
    ? toTitleCase(numberToWords(annualRateNumeric)) +
      " Percent Per Annum"
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
                label="Loan Amount (₹)"
                value={amount}
                onChange={(e) =>
                  setAmount(formatIndianNumber(e.target.value))
                }
              />
              {amountWords && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600 }}
                >
                  {amountWords}
                </Typography>
              )}

              <TextField
                label="Interest Rate (p.a. %)"
                type="number"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
              />
              {rateWords && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600 }}
                >
                  {rateWords}
                </Typography>
              )}

              <TextField
                label="Tenure (years)"
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
              />
              {yearsWords && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600 }}
                >
                  {yearsWords}
                </Typography>
              )}

              <Button variant="contained" size="large" onClick={handleCalculate}>
                Calculate EMI
              </Button>
            </Stack>
          </Box>

          {/* RIGHT SUMMARY */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 50%" } }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                How this EMI calculator works
              </Typography>

              <Typography variant="body2" color="text.secondary">
                This EMI calculator assumes:
              </Typography>

              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>Fixed loan principal amount.</li>
                <li>Monthly compounding interest.</li>
                <li>Equal EMI throughout the loan tenure.</li>
              </ul>

              <Divider sx={{ my: 1.5 }} />

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
                    : "Enter details to calculate EMI, interest, repayment chart."}
                </Typography>

                {hasResult && (
                  <>
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, fontWeight: 500 }}
                    >
                      <strong>EMI (in words):</strong>{" "}
                      {emiWordsSummary} Rupees Per Month
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ mt: 1, fontWeight: 500 }}
                    >
                      <strong>Total Interest (in words):</strong>{" "}
                      {interestWordsSummary} Rupees
                    </Typography>
                  </>
                )}
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* BOTTOM CHARTS */}
      {hasResult && (
        <Paper sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
            }}
          >
            {/* LEFT – BALANCE CHART */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Balance over time (yearly)
              </Typography>
              <Box sx={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="balanceOutstanding"
                      stroke="#0f766e"
                      name="Remaining balance"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>

            {/* RIGHT – PRINCIPAL VS INTEREST */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Principal vs Interest (Total Cost)
              </Typography>

              <Box sx={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Principal" fill="#38bdf8" />
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
