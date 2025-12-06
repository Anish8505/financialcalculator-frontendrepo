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

/* ---------- helpers (same style as SIP/FD) ---------- */

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

export default function EmiCalculator() {
  const [amount, setAmount] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");

  const [summary, setSummary] = useState("");
  const [emiWordsSummary, setEmiWordsSummary] = useState("");
  const [interestWordsSummary, setInterestWordsSummary] = useState("");

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

      const url = `http://localhost:8080/api/emi?${params.toString()}`;
      console.log("EMI API URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("API error");
      }

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

      const emiWordsRaw = numberToWords(Math.round(emi));
      const interestWordsRaw = numberToWords(Math.round(totalInterest));

      setEmiWordsSummary(emiWordsRaw ? toTitleCase(emiWordsRaw) : "");
      setInterestWordsSummary(
        interestWordsRaw ? toTitleCase(interestWordsRaw) : ""
      );

      let yearlyPoints: EmiPoint[] = [];

      if (Array.isArray(data.yearlyPoints) && data.yearlyPoints.length > 0) {
        yearlyPoints = data.yearlyPoints.map((p) => ({
          year: p.year,
          principalPaid: p.principalPaid,
          interestPaid: p.interestPaid,
          balanceOutstanding: p.balanceOutstanding,
        }));
      }

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
    ? toTitleCase(numberToWords(annualRateNumeric)) + " Percent Per Annum"
    : "";
  const yearsWords = yearsNumeric
    ? toTitleCase(numberToWords(yearsNumeric)) +
      (yearsNumeric === 1 ? " Year" : " Years")
    : "";

  return (
    <Box>
      {/* TOP: CALCULATOR + EXPLANATION */}
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
              "& .MuiTextField-root": {
                width: "100%",
              },
            }}
          >
            <Stack spacing={2}>
              <TextField
                label="Loan Amount (₹)"
                type="text"
                value={amount}
                onChange={(e) => setAmount(formatIndianNumber(e.target.value))}
              />
              {amountWords && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600, mt: -0.5 }}
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
                  sx={{ color: "text.secondary", fontWeight: 600, mt: -0.5 }}
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
                  sx={{ color: "text.secondary", fontWeight: 600, mt: -0.5 }}
                >
                  {yearsWords}
                </Typography>
              )}

              <Button variant="contained" size="large" onClick={handleCalculate}>
                Calculate EMI
              </Button>
            </Stack>
          </Box>

          {/* RIGHT – EXPLANATION + SUMMARY */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 50%" } }}>
            <Stack spacing={1.5} sx={{ height: "100%" }}>
              <Typography variant="subtitle1">
                How this EMI calculator works
              </Typography>

              <Typography variant="body2" color="text.secondary">
                This EMI (Equated Monthly Instalment) calculator assumes:
              </Typography>

              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>You borrow a fixed amount (loan principal).</li>
                <li>
                  Interest is charged monthly based on the annual rate you
                  enter.
                </li>
                <li>
                  Your EMI (monthly instalment) remains constant throughout the
                  tenure.
                </li>
              </ul>

              <Typography variant="body2" color="text.secondary">
                Formula used:
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
                EMI = P × r × (1 + r)ⁿ / ((1 + r)ⁿ − 1)
              </Box>
              <Typography variant="body2" color="text.secondary">
                where P = loan amount, r = monthly interest rate (annual % ÷ 12
                ÷ 100), n = total number of EMIs (months).
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
                  Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasResult
                    ? summary
                    : "Enter your loan details and click Calculate to see your EMI, total payment and total interest."}
                </Typography>

                {hasResult && (
                  <>
                    {emiWordsSummary && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          mt: 1,
                        }}
                      >
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          EMI in words (approx):
                        </Box>{" "}
                        {emiWordsSummary} Rupees Per Month.
                      </Typography>
                    )}

                    {interestWordsSummary && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          mt: 1,
                        }}
                      >
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          Total interest in words (approx):
                        </Box>{" "}
                        {interestWordsSummary} Rupees.
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
            {/* LEFT CHART – LINE: balance over time */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Loan balance over time (yearly)
              </Typography>
              <Box sx={{ width: "100%", height: { xs: 260, md: 320 } }}>
                <ResponsiveContainer width="100%" height="100%">
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
                      type="monotone"
                      dataKey="balanceOutstanding"
                      name="Outstanding balance"
                      stroke="#0f766e"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="principalPaid"
                      name="Principal repaid (cumulative)"
                      stroke="#94a3b8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, mb: 1 }}
              >
                This table shows how much principal you have repaid and how much
                loan balance is still outstanding at the end of each year.
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  size="small"
                  aria-label="EMI loan yearly principal vs balance table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Year</TableCell>
                      <TableCell align="right">
                        Principal Repaid (₹, cumulative)
                      </TableCell>
                      <TableCell align="right">
                        Interest Paid (₹, cumulative)
                      </TableCell>
                      <TableCell align="right">
                        Balance Outstanding (₹)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lineData.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell>{row.year}</TableCell>
                        <TableCell align="right">
                          {row.principalPaid.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                        <TableCell align="right">
                          {row.interestPaid.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                        <TableCell align="right">
                          {row.balanceOutstanding.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Box>

            {/* RIGHT CHART – BAR: principal vs interest */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Principal vs interest – total cost of loan
              </Typography>
              <Box sx={{ width: "100%", height: { xs: 260, md: 320 } }}>
                <ResponsiveContainer width="100%" height="100%">
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
                      dataKey="Principal"
                      name="Principal amount"
                      fill="#38bdf8"
                    />
                    <Bar
                      dataKey="Interest"
                      name="Total interest"
                      fill="#0f766e"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, mb: 1 }}
              >
                This table compares how much you borrow (principal) against how
                much you pay as interest over the loan tenure.
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  size="small"
                  aria-label="EMI principal vs interest table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell align="right">Principal (₹)</TableCell>
                      <TableCell align="right">Interest (₹)</TableCell>
                      <TableCell align="right">Total Payment (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {barData.map((row, index) => {
                      const total = row.Principal + row.Interest;
                      return (
                        <TableRow key={index}>
                          <TableCell align="right">
                            {row.Principal.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {row.Interest.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {total.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
