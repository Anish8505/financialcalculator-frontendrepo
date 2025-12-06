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

// ✅ match backend JSON exactly
type PpfApiResponse = {
  yearlyInvestment: number;
  tenureYears: number;
  maturityAmount: number;
  totalInvestment: number;
  totalInterest: number;
};

/* ---------- helpers (same style as others) ---------- */

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

      const url = `http://localhost:8080/api/ppf?${params.toString()}`;
      console.log("PPF API URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: PpfApiResponse = await response.json();
      console.log("PPF API data:", data);

      // ✅ map to your JSON keys
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
        )}, of which ₹${interestRounded.toLocaleString(
          "en-IN"
        )} is interest.`
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

      // ----- yearly points for charts (frontend fallback) -----
      const yearlyPoints: PpfPoint[] = [];
      const rateDec = r / 100;
      const nYears = tenureYears || t;

      for (let year = 1; year <= nYears; year++) {
        const k = year;
        const totalYear =
          yearlyAmount *
          ((Math.pow(1 + rateDec, k) - 1) / rateDec) *
          (1 + rateDec);
        const investedYear = yearlyAmount * k;

        yearlyPoints.push({
          year,
          invested: investedYear,
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
                label="Yearly PPF Contribution (₹)"
                type="text"
                value={yearly}
                onChange={(e) => setYearly(formatIndianNumber(e.target.value))}
              />
              {yearlyWords && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600, mt: -0.5 }}
                >
                  {yearlyWords}
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
                Calculate PPF Maturity
              </Button>
            </Stack>
          </Box>

          {/* RIGHT – EXPLANATION + SUMMARY */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 50%" } }}>
            <Stack spacing={1.5} sx={{ height: "100%" }}>
              <Typography variant="subtitle1">
                How this PPF calculator works
              </Typography>

              <Typography variant="body2" color="text.secondary">
                This PPF calculator assumes:
              </Typography>

              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>You invest a fixed amount every year in PPF.</li>
                <li>
                  Interest is compounded annually at the rate you enter (simple
                  planning approximation).
                </li>
                <li>
                  It shows your total investment, estimated maturity amount and
                  interest earned.
                </li>
              </ul>

              <Typography variant="body2" color="text.secondary">
                Formula used (annuity-due style):
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
                M = A × [((1 + r)ⁿ − 1) / r] × (1 + r)
              </Box>
              <Typography variant="body2" color="text.secondary">
                where A = yearly contribution, r = annual interest rate
                (decimal), n = number of years.
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
                    : "Enter your PPF details and click Calculate to see your maturity amount and interest earned."}
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
                          Total investment in words:
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
                PPF growth over time (yearly)
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
                      name="Total investment"
                      stroke="#94a3b8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Estimated value"
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
                This table shows how your PPF balance grows year by year,
                comparing total amount invested and estimated maturity value.
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  size="small"
                  aria-label="PPF growth table: year, investment and estimated value"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Year</TableCell>
                      <TableCell align="right">Total Investment (₹)</TableCell>
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
                Investment vs interest earned (PPF)
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
                      name="Total investment"
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
                This table compares your total PPF investment with the interest
                earned and final maturity value.
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  size="small"
                  aria-label="PPF investment vs maturity vs interest table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell align="right">Investment (₹)</TableCell>
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
