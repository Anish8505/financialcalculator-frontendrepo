// src/features/calculators/SwpCalculator.tsx
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

type SwpPoint = {
  year: number;
  balance: number;
  totalWithdrawn: number;
};

type BarPoint = {
  name: string;
  Withdrawn: number;
  Remaining: number;
};

type SwpYearPointApi = {
  year: number;
  balance: number;
  totalWithdrawn: number;
};

type SwpApiResponse = {
  initialCorpus: number;
  monthlyWithdrawal: number;
  annualRatePercent: number;
  years: number;
  totalWithdrawn: number;
  endingCorpus: number;
  totalGrowth: number;
  yearlyPoints?: SwpYearPointApi[];
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

export default function SwpCalculator() {
  const [corpus, setCorpus] = useState("");
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");

  const [summary, setSummary] = useState("");
  const [withdrawnWordsSummary, setWithdrawnWordsSummary] = useState("");
  const [remainingWordsSummary, setRemainingWordsSummary] = useState("");

  const [lineData, setLineData] = useState<SwpPoint[]>([]);
  const [barData, setBarData] = useState<BarPoint[]>([]);

  const hasResult = lineData.length > 0;

  const handleCalculate = async () => {
    const corpusNum = Number(corpus.replace(/,/g, ""));
    const withdrawalNum = Number(monthlyWithdrawal.replace(/,/g, ""));
    const r = Number(annualRate);
    const t = Number(years);

    if (!corpusNum || !withdrawalNum || !r || !t) {
      setSummary(
        "Please enter initial corpus, monthly withdrawal, interest rate and tenure to calculate SWP."
      );
      setWithdrawnWordsSummary("");
      setRemainingWordsSummary("");
      setLineData([]);
      setBarData([]);
      return;
    }

    try {
      const params = new URLSearchParams({
        corpus: corpusNum.toString(),
        withdrawal: withdrawalNum.toString(),
        rate: r.toString(),
        years: t.toString(),
      });

      const url = `http://localhost:8080/api/swp?${params.toString()}`;
      console.log("SWP API URL:", url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("API error");
      }

      const data: SwpApiResponse = await response.json();

      const totalWithdrawn = data.totalWithdrawn;
      const endingCorpus = data.endingCorpus;
      const totalGrowth = data.totalGrowth;

      setSummary(
        `You start with a corpus of ₹${data.initialCorpus.toLocaleString(
          "en-IN"
        )} and withdraw ₹${data.monthlyWithdrawal.toLocaleString(
          "en-IN"
        )} every month for ${data.years} years at ${data.annualRatePercent.toFixed(
          2
        )}% p.a. In total, you withdraw about ₹${totalWithdrawn.toLocaleString(
          "en-IN"
        )} and are left with an estimated corpus of ₹${endingCorpus.toLocaleString(
          "en-IN"
        )}. Overall growth (interest) is approximately ₹${totalGrowth.toLocaleString(
          "en-IN"
        )}.`
      );

      const withdrawnWordsRaw = numberToWords(Math.round(totalWithdrawn));
      const remainingWordsRaw = numberToWords(Math.round(endingCorpus));

      setWithdrawnWordsSummary(
        withdrawnWordsRaw ? toTitleCase(withdrawnWordsRaw) : ""
      );
      setRemainingWordsSummary(
        remainingWordsRaw ? toTitleCase(remainingWordsRaw) : ""
      );

      let yearlyPoints: SwpPoint[] = [];

      if (Array.isArray(data.yearlyPoints) && data.yearlyPoints.length > 0) {
        yearlyPoints = data.yearlyPoints.map((p) => ({
          year: p.year,
          balance: p.balance,
          totalWithdrawn: p.totalWithdrawn,
        }));
      }

      setLineData(yearlyPoints);

      setBarData([
        {
          name: "SWP",
          Withdrawn: totalWithdrawn,
          Remaining: endingCorpus,
        },
      ]);
    } catch (err) {
      console.error("Error calling SWP API", err);
      setSummary(
        "Something went wrong while calculating your SWP. Please try again."
      );
      setWithdrawnWordsSummary("");
      setRemainingWordsSummary("");
      setLineData([]);
      setBarData([]);
    }
  };

  const corpusNumeric = Number(corpus.replace(/,/g, ""));
  const withdrawalNumeric = Number(monthlyWithdrawal.replace(/,/g, ""));
  const annualRateNumeric = Number(annualRate);
  const yearsNumeric = Number(years);

  const corpusWords = corpusNumeric
    ? toTitleCase(numberToWords(corpusNumeric))
    : "";
  const withdrawalWords = withdrawalNumeric
    ? toTitleCase(numberToWords(withdrawalNumeric))
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
              "& .MuiTextField-root": { width: "100%" },
            }}
          >
            <Stack spacing={2}>
              <TextField
                label="Initial Corpus (₹)"
                type="text"
                value={corpus}
                onChange={(e) =>
                  setCorpus(formatIndianNumber(e.target.value))
                }
              />
              {corpusWords && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600, mt: -0.5 }}
                >
                  {corpusWords}
                </Typography>
              )}

              <TextField
                label="Monthly Withdrawal (₹)"
                type="text"
                value={monthlyWithdrawal}
                onChange={(e) =>
                  setMonthlyWithdrawal(formatIndianNumber(e.target.value))
                }
              />
              {withdrawalWords && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600, mt: -0.5 }}
                >
                  {withdrawalWords}
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
                Calculate SWP
              </Button>
            </Stack>
          </Box>

          {/* RIGHT – EXPLANATION + SUMMARY */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 50%" } }}>
            <Stack spacing={1.5} sx={{ height: "100%" }}>
              <Typography variant="subtitle1">
                How this SWP calculator works
              </Typography>

              <Typography variant="body2" color="text.secondary">
                In a Systematic Withdrawal Plan (SWP), you start with a lump sum
                corpus and withdraw a fixed amount every month. The remaining
                balance continues to earn returns.
              </Typography>

              <Typography variant="body2" color="text.secondary">
                This calculator:
              </Typography>
              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>Grows your corpus monthly at the entered annual rate.</li>
                <li>Deducts a fixed monthly withdrawal from the corpus.</li>
                <li>
                  Shows total withdrawn, remaining corpus and approximate growth.
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
                  Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasResult
                    ? summary
                    : "Enter your SWP details and click Calculate to see how long your corpus may last and what balance you might have left."}
                </Typography>

                {hasResult && (
                  <>
                    {withdrawnWordsSummary && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          mt: 1,
                        }}
                      >
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          Total withdrawn in words:
                        </Box>{" "}
                        {withdrawnWordsSummary} Rupees.
                      </Typography>
                    )}

                    {remainingWordsSummary && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          mt: 1,
                        }}
                      >
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          Remaining corpus in words (approx):
                        </Box>{" "}
                        {remainingWordsSummary} Rupees.
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
            {/* LEFT – LINE CHART */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                SWP: balance & withdrawals over time (yearly)
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
                      dataKey="balance"
                      name="Corpus balance"
                      stroke="#0f766e"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalWithdrawn"
                      name="Total withdrawn"
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
                This table shows how much you have withdrawn in total and how
                much corpus remains at the end of each year.
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  size="small"
                  aria-label="SWP yearly balance and withdrawals table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Year</TableCell>
                      <TableCell align="right">
                        Total Withdrawn (₹)
                      </TableCell>
                      <TableCell align="right">
                        Corpus Balance (₹)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lineData.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell>{row.year}</TableCell>
                        <TableCell align="right">
                          {row.totalWithdrawn.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                        <TableCell align="right">
                          {row.balance.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Box>

            {/* RIGHT – BAR CHART */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Total withdrawals vs remaining corpus
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
                      dataKey="Withdrawn"
                      name="Total withdrawn"
                      fill="#38bdf8"
                    />
                    <Bar
                      dataKey="Remaining"
                      name="Remaining corpus"
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
                This table compares the total amount you withdraw through SWP
                with the corpus that still remains invested.
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small" aria-label="SWP total vs remaining table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="right">Total Withdrawn (₹)</TableCell>
                      <TableCell align="right">Remaining Corpus (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {barData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell align="right">
                          {row.Withdrawn.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                        <TableCell align="right">
                          {row.Remaining.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
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
