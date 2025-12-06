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

type FdPoint = {
  year: number;
  invested: number;
  total: number;
};

type BarPoint = {
  name: string;
  Invested: number;
  Interest: number;
};

type FdYearPointApi = {
  year: number;
  invested: number;
  total: number;
};

type FdApiResponse = {
  investedAmount: number;
  maturityAmount: number;
  interestEarned: number;
  yearlyPoints?: FdYearPointApi[];
};

/* ---------- helpers: copy from SIP ---------- */

// Format string as Indian number
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

export default function FdCalculator() {
  const [amount, setAmount] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");

  const [summary, setSummary] = useState("");
  const [investedWordsSummary, setInvestedWordsSummary] = useState("");
  const [interestWordsSummary, setInterestWordsSummary] = useState("");
  const [maturityWordsSummary, setMaturityWordsSummary] = useState("");

  const [lineData, setLineData] = useState<FdPoint[]>([]);
  const [barData, setBarData] = useState<BarPoint[]>([]);

  const hasResult = lineData.length > 0;

  const handleCalculate = async () => {
    const principal = Number(amount.replace(/,/g, ""));
    const r = Number(annualRate);
    const t = Number(years);

    if (!principal || !r || !t) {
      setSummary(
        "Please enter deposit amount, annual interest rate and tenure to calculate FD maturity."
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
        amount: principal.toString(),
        rate: r.toString(),
        years: t.toString(),
      });

      const response = await fetch(`http://localhost:8080/api/fd?${params.toString()}`);

      if (!response.ok) {
        throw new Error("API error");
      }

      const data: FdApiResponse = await response.json();

      const invested = data.investedAmount;
      const maturity = data.maturityAmount;
      const interest = data.interestEarned;

      const maturityRounded = Math.round(maturity);
      const interestRounded = Math.round(interest);

      setSummary(
        `You deposit ₹${invested.toLocaleString(
          "en-IN"
        )} in an FD and it may grow to ₹${maturityRounded.toLocaleString(
          "en-IN"
        )} (interest earned: ₹${interestRounded.toLocaleString("en-IN")}).`
      );

      const investedWordsRaw = numberToWords(Math.round(invested));
      const interestWordsRaw = numberToWords(interestRounded);
      const maturityWordsRaw = numberToWords(maturityRounded);

      setInvestedWordsSummary(
        investedWordsRaw ? toTitleCase(investedWordsRaw) : ""
      );
      setInterestWordsSummary(
        interestWordsRaw ? toTitleCase(interestWordsRaw) : ""
      );
      setMaturityWordsSummary(
        maturityWordsRaw ? toTitleCase(maturityWordsRaw) : ""
      );

      let yearlyPoints: FdPoint[] = [];

      if (Array.isArray(data.yearlyPoints) && data.yearlyPoints.length > 0) {
        yearlyPoints = data.yearlyPoints.map((p) => ({
          year: p.year,
          invested: p.invested,
          total: p.total,
        }));
      } else {
        // fallback recompute if needed
        const n = 4;
        const rateDec = r / 100;
        for (let year = 1; year <= t; year++) {
          const totalYear = principal * Math.pow(1 + rateDec / n, n * year);
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
          name: "FD",
          Invested: invested,
          Interest: interest,
        },
      ]);
    } catch (err) {
      console.error("Error calling FD API", err);
      setSummary(
        "Something went wrong while calculating your FD maturity. Please try again."
      );
      setInvestedWordsSummary("");
      setInterestWordsSummary("");
      setMaturityWordsSummary("");
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
                label="FD Amount (₹)"
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
                Calculate FD Maturity
              </Button>
            </Stack>
          </Box>

          {/* RIGHT – EXPLANATION + SUMMARY */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 50%" } }}>
            <Stack spacing={1.5} sx={{ height: "100%" }}>
              <Typography variant="subtitle1">
                How this FD calculator works
              </Typography>

              <Typography variant="body2" color="text.secondary">
                This Fixed Deposit (FD) calculator assumes:
              </Typography>

              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>You deposit a one-time amount in an FD.</li>
                <li>
                  Interest is compounded quarterly at the annual rate you enter.
                </li>
                <li>
                  It shows your maturity amount and total interest earned over
                  the tenure.
                </li>
              </ul>

              <Typography variant="body2" color="text.secondary">
                Formula used (quarterly compounding):
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
                M = P × (1 + r / n)^(n × t)
              </Box>
              <Typography variant="body2" color="text.secondary">
                where P = deposit, r = annual rate (in decimal), n = 4 (quarters
                per year), t = tenure in years.
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
                    : "Enter your FD details and click Calculate to see your maturity amount and interest earned."}
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
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          Deposit amount in words:
                        </Box>{" "}
                        {investedWordsSummary} Rupees.
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
                          Interest earned in words:
                        </Box>{" "}
                        {interestWordsSummary} Rupees.
                      </Typography>
                    )}

                    {maturityWordsSummary && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          mt: 1,
                        }}
                      >
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          Maturity amount in words (approx):
                        </Box>{" "}
                        {maturityWordsSummary} Rupees.
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
            {/* LEFT CHART – LINE */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                FD growth over time (yearly)
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
                      dataKey="invested"
                      name="Deposit amount"
                      stroke="#94a3b8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Maturity value"
                      stroke="#0f766e"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, mb: 1 }}
              >
                This table shows how your fixed deposit grows year by year,
                comparing the original deposit and estimated maturity value at
                each year.
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  size="small"
                  aria-label="FD growth table: year, deposit amount and estimated value"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Year</TableCell>
                      <TableCell align="right">Deposit Amount (₹)</TableCell>
                      <TableCell align="right">
                        Estimated Value (₹)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lineData.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell>{row.year}</TableCell>
                        <TableCell align="right">
                          {row.invested.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                        <TableCell align="right">
                          {row.total.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Box>

            {/* RIGHT CHART – BAR */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Deposit vs interest earned (FD)
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
                      dataKey="Invested"
                      name="Deposit amount"
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

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, mb: 1 }}
              >
                This table compares your deposit amount with the interest earned
                and total maturity value at the end of the FD.
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  size="small"
                  aria-label="FD deposit vs maturity vs interest table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell align="right">Deposit (₹)</TableCell>
                      <TableCell align="right">Maturity (₹)</TableCell>
                      <TableCell align="right">Interest (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {barData.map((row, index) => {
                      const maturity = row.Invested + row.Interest;
                      return (
                        <TableRow key={index}>
                          <TableCell align="right">
                            {row.Invested.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {maturity.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {row.Interest.toLocaleString("en-IN", {
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
