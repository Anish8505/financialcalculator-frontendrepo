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

// matches the improved backend response
type SipYearPointApi = {
  year: number;
  invested: number;
  total: number;
};

type SipApiResponse = {
  investedAmount: number;
  maturityAmount: number;
  profit: number;
  yearlyPoints?: SipYearPointApi[]; // optional, we also support old backend
};

/* ---------- helpers: indian formatting + number to words ---------- */

// Format string as Indian number (e.g. 66666 -> 66,666; 666666 -> 6,66,666)
const formatIndianNumber = (value: string) => {
  if (!value) return "";

  const cleaned = value.replace(/,/g, "");
  if (cleaned === "") return "";
  if (isNaN(Number(cleaned))) return value;

  return Number(cleaned).toLocaleString("en-IN");
};

// Convert number to words in Indian system (crore / lakh / thousand)
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

// Turn "seven hundred ..." into "Seven Hundred ..."
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

  // 🔗 This is where we call your Spring Boot backend: GET http://localhost:8080/api/sip
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
        `http://localhost:8080/api/sip?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("API error");
      }

      const data: SipApiResponse = await response.json();

      const invested = data.investedAmount;
      const total = data.maturityAmount;
      const gain = data.profit;

      // summary line
      const totalRounded = Math.round(total);
      const gainRounded = Math.round(gain);

      setSummary(
        `You invest ₹${invested.toLocaleString(
          "en-IN"
        )} and it may grow to ₹${totalRounded.toLocaleString(
          "en-IN"
        )} (gain: ₹${gainRounded.toLocaleString("en-IN")}).`
      );

      // words
      const investedWordsRaw = numberToWords(Math.round(invested));
      const gainWordsRaw = numberToWords(gainRounded);
      const futureWordsRaw = numberToWords(totalRounded);

      setInvestedWordsSummary(
        investedWordsRaw ? toTitleCase(investedWordsRaw) : ""
      );
      setGainWordsSummary(gainWordsRaw ? toTitleCase(gainWordsRaw) : "");
      setFutureWordsSummary(futureWordsRaw ? toTitleCase(futureWordsRaw) : "");

      // yearly points for line chart
      let yearlyPoints: SipPoint[] = [];

      if (Array.isArray(data.yearlyPoints) && data.yearlyPoints.length > 0) {
        // use series from backend (preferred)
        yearlyPoints = data.yearlyPoints.map((p) => ({
          year: p.year,
          invested: p.invested,
          total: p.total,
        }));
      } else {
        // fallback: compute on frontend if backend only returns totals
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

      // bar data
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
      {/* TOP: CALCULATOR + EXPLANATION (50 / 50) */}
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

          {/* RIGHT – HOW IT WORKS + FORMULA + SUMMARY */}
          <Box
            sx={{
              flex: { xs: "1 1 auto", md: "0 0 50%" },
            }}
          >
            <Stack spacing={1.5} sx={{ height: "100%" }}>
              <Typography variant="subtitle1">
                How this SIP calculator works
              </Typography>

              <Typography variant="body2" color="text.secondary">
                This SIP (Systematic Investment Plan) calculator assumes:
              </Typography>

              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>You invest a fixed amount every month (monthly SIP).</li>
                <li>
                  Returns are compounded monthly at the annual rate you enter.
                </li>
                <li>
                  It shows total amount invested, estimated future value and
                  wealth created (profit).
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
                FV = A × [((1 + i)^n − 1) / i] × (1 + i)
              </Box>
              <Typography variant="body2" color="text.secondary">
                where A = monthly SIP, i = monthly rate (annual % ÷ 12 ÷ 100),
                n = total months (years × 12).
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
                    : "Enter your SIP details and click Calculate to see the projected value and profit."}
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
                          Invested amount in words:
                        </Box>{" "}
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
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          Wealth gained in words:
                        </Box>{" "}
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
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          Future value in words (approx):
                        </Box>{" "}
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

      {/* BOTTOM: CHARTS + SEO/AI-FRIENDLY TABLES */}
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
                SIP growth over time (yearly)
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
                      name="Invested amount"
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

              {/* Caption + Table for SEO/AI */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, mb: 1 }}
              >
                This table shows how your SIP investment grows year by year,
                comparing total amount invested and estimated future value.
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  size="small"
                  aria-label="SIP growth table: year, invested amount and estimated value"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Year</TableCell>
                      <TableCell align="right">Total Invested (₹)</TableCell>
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
                Total invested vs wealth gained
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
                      name="Invested amount"
                      fill="#38bdf8"
                    />
                    <Bar dataKey="Gain" name="Total gain" fill="#0f766e" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              {/* Caption + Table for SEO/AI */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, mb: 1 }}
              >
                This table compares the total amount you invest through SIP with
                the estimated wealth gained at the end of the period.
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  size="small"
                  aria-label="SIP invested vs grown vs gain table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell align="right">Invested (₹)</TableCell>
                      <TableCell align="right">Grown To (₹)</TableCell>
                      <TableCell align="right">Gain (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {barData.map((row, index) => {
                      const grownTo = row.Invested + row.Gain;
                      return (
                        <TableRow key={index}>
                          <TableCell align="right">
                            {row.Invested.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {grownTo.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {row.Gain.toLocaleString("en-IN", {
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
