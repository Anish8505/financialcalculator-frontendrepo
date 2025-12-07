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

/* ---------- 🔥 BASE URL HERE ---------- */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/* ---------- types ---------- */

type RetirementPoint = {
  age: number;
  invested: number;
  corpus: number;
  corpusReal: number;
};

type BarPoint = {
  name: string;
  Invested: number;
  Corpus: number;
  CorpusReal: number;
};

type RetirementYearPointApi = {
  age: number;
  invested: number;
  corpus: number;
  corpusReal: number;
};

type RetirementApiResponse = {
  currentAge: number;
  retirementAge: number;
  yearsToInvest: number;
  monthlyInvestment: number;
  currentCorpus: number;
  expectedReturnPercent: number;
  inflationPercent: number;
  totalInvestment: number;
  totalGain: number;
  estimatedCorpusAtRetirement: number;
  corpusInTodayValue: number;
  yearlyPoints?: RetirementYearPointApi[];
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

export default function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState("");
  const [retirementAge, setRetirementAge] = useState("");
  const [monthlyInvestment, setMonthlyInvestment] = useState("");
  const [currentCorpus, setCurrentCorpus] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [inflation, setInflation] = useState("");

  const [summary, setSummary] = useState("");
  const [corpusWordsSummary, setCorpusWordsSummary] = useState("");
  const [corpusTodayWordsSummary, setCorpusTodayWordsSummary] = useState("");

  const [lineData, setLineData] = useState<RetirementPoint[]>([]);
  const [barData, setBarData] = useState<BarPoint[]>([]);

  const hasResult = lineData.length > 0;

  const handleCalculate = async () => {
    const curAge = Number(currentAge);
    const retAge = Number(retirementAge);
    const monthly = Number(monthlyInvestment.replace(/,/g, ""));
    const existingCorpus = Number(
      currentCorpus ? currentCorpus.replace(/,/g, "") : "0"
    );
    const r = Number(expectedReturn);
    const inf = Number(inflation);

    if (!curAge || !retAge || !monthly || !r || inf < 0) {
      setSummary(
        "Please enter current age, retirement age, monthly investment, expected return and inflation."
      );
      setCorpusWordsSummary("");
      setCorpusTodayWordsSummary("");
      setLineData([]);
      setBarData([]);
      return;
    }

    try {
      const params = new URLSearchParams({
        currentAge: curAge.toString(),
        retirementAge: retAge.toString(),
        monthlyInvestment: monthly.toString(),
        currentCorpus: isNaN(existingCorpus) ? "0" : existingCorpus.toString(),
        expectedReturn: r.toString(),
        inflation: inf.toString(),
      });

      /* ---------- 🔥 ONLY THIS LINE CHANGED ---------- */
      const url = `${API_BASE_URL}/retirement?${params.toString()}`;
      console.log("Retirement API URL:", url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("API error");
      }

      const data: RetirementApiResponse = await response.json();

      const corpus = data.estimatedCorpusAtRetirement;
      const corpusToday = data.corpusInTodayValue;
      const invested = data.totalInvestment;

      const yearsToInvest = data.yearsToInvest;

      setSummary(
        `You are currently ${data.currentAge} and plan to retire at ${data.retirementAge}. ` +
          `By investing ₹${monthly.toLocaleString(
            "en-IN"
          )} per month (plus your current corpus of ₹${existingCorpus.toLocaleString(
            "en-IN"
          )}), ` +
          `you may build a retirement corpus of around ₹${corpus.toLocaleString(
            "en-IN"
          )} in ${yearsToInvest} years. ` +
          `In today's value (adjusted for inflation), this is roughly ₹${corpusToday.toLocaleString(
            "en-IN"
          )}.`
      );

      const corpusWords = numberToWords(Math.round(corpus));
      const corpusTodayWords = numberToWords(Math.round(corpusToday));

      setCorpusWordsSummary(corpusWords ? toTitleCase(corpusWords) : "");
      setCorpusTodayWordsSummary(
        corpusTodayWords ? toTitleCase(corpusTodayWords) : ""
      );

      let yearlyPoints: RetirementPoint[] = [];

      if (Array.isArray(data.yearlyPoints) && data.yearlyPoints.length > 0) {
        yearlyPoints = data.yearlyPoints.map((p) => ({
          age: p.age,
          invested: p.invested,
          corpus: p.corpus,
          corpusReal: p.corpusReal,
        }));
      }

      setLineData(yearlyPoints);

      setBarData([
        {
          name: "Retirement",
          Invested: invested,
          Corpus: corpus,
          CorpusReal: corpusToday,
        },
      ]);
    } catch (err) {
      console.error("Error calling Retirement API", err);
      setSummary(
        "Something went wrong while calculating your retirement corpus. Please try again."
      );
      setCorpusWordsSummary("");
      setCorpusTodayWordsSummary("");
      setLineData([]);
      setBarData([]);
    }
  };

  const currentCorpusNumeric = Number(
    currentCorpus ? currentCorpus.replace(/,/g, "") : "0"
  );
  const monthlyNumeric = Number(
    monthlyInvestment ? monthlyInvestment.replace(/,/g, "") : "0"
  );
  const curAgeNum = Number(currentAge);
  const retAgeNum = Number(retirementAge);

  const monthlyWords = monthlyNumeric
    ? toTitleCase(numberToWords(monthlyNumeric))
    : "";
  const currentCorpusWords = currentCorpusNumeric
    ? toTitleCase(numberToWords(currentCorpusNumeric))
    : "";
  const expectedReturnWords = expectedReturn
    ? toTitleCase(numberToWords(Number(expectedReturn))) +
      " Percent Per Annum"
    : "";
  const inflationWords = inflation
    ? toTitleCase(numberToWords(Number(inflation))) + " Percent"
    : "";
  const agesWords =
    curAgeNum && retAgeNum
      ? `From Age ${curAgeNum} To ${retAgeNum}`
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
                label="Current Age (years)"
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(e.target.value)}
              />
              <TextField
                label="Retirement Age (years)"
                type="number"
                value={retirementAge}
                onChange={(e) => setRetirementAge(e.target.value)}
              />
              {agesWords && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600, mt: -0.5 }}
                >
                  {agesWords}
                </Typography>
              )}

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
                  sx={{ color: "text.secondary", fontWeight: 600, mt: -0.5 }}
                >
                  {monthlyWords}
                </Typography>
              )}

              <TextField
                label="Current Corpus (₹, optional)"
                type="text"
                value={currentCorpus}
                onChange={(e) =>
                  setCurrentCorpus(formatIndianNumber(e.target.value))
                }
              />
              {currentCorpusWords && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600, mt: -0.5 }}
                >
                  {currentCorpusWords}
                </Typography>
              )}

              <TextField
                label="Expected Return (p.a. %)"
                type="number"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(e.target.value)}
              />
              {expectedReturnWords && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600, mt: -0.5 }}
                >
                  {expectedReturnWords}
                </Typography>
              )}

              <TextField
                label="Expected Inflation (%)"
                type="number"
                value={inflation}
                onChange={(e) => setInflation(e.target.value)}
              />
              {inflationWords && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600, mt: -0.5 }}
                >
                  {inflationWords}
                </Typography>
              )}

              <Button variant="contained" size="large" onClick={handleCalculate}>
                Calculate Retirement Corpus
              </Button>
            </Stack>
          </Box>

          {/* RIGHT – EXPLANATION + SUMMARY */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 50%" } }}>
            <Stack spacing={1.5} sx={{ height: "100%" }}>
              <Typography variant="subtitle1">
                How this retirement calculator works
              </Typography>

              <Typography variant="body2" color="text.secondary">
                This retirement calculator assumes:
              </Typography>

              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>You invest a fixed amount every month until retirement.</li>
                <li>
                  Your existing corpus and monthly investments grow at the
                  expected return rate.
                </li>
                <li>
                  We adjust your future corpus for inflation to show a rough
                  "today’s value".
                </li>
              </ul>

              <Typography variant="body2" color="text.secondary">
                It uses month-by-month compounding to simulate your journey from
                current age to retirement.
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
                    : "Enter your details to estimate retirement corpus and value in today's money."}
                </Typography>

                {hasResult && (
                  <>
                    {corpusWordsSummary && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          mt: 1,
                        }}
                      >
                        <strong>Corpus at retirement in words:</strong>{" "}
                        {corpusWordsSummary} Rupees.
                      </Typography>
                    )}

                    {corpusTodayWordsSummary && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          mt: 1,
                        }}
                      >
                        <strong>In today's value (approx):</strong>{" "}
                        {corpusTodayWordsSummary} Rupees.
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
                Retirement corpus over your age (nominal vs today’s value)
              </Typography>
              <Box sx={{ width: "100%", height: { xs: 260, md: 320 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
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
                      dataKey="corpus"
                      name="Corpus (nominal)"
                      stroke="#0f766e"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="corpusReal"
                      name="Corpus (today's value)"
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
                This table shows how your retirement corpus grows with age in 
                both nominal and inflation-adjusted terms.
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small" aria-label="Retirement corpus vs age table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Age</TableCell>
                      <TableCell align="right">Invested (₹)</TableCell>
                      <TableCell align="right">Corpus (nominal, ₹)</TableCell>
                      <TableCell align="right">
                        Corpus (today's value, ₹)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lineData.map((row) => (
                      <TableRow key={row.age}>
                        <TableCell>{row.age}</TableCell>
                        <TableCell align="right">
                          {row.invested.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell align="right">
                          {row.corpus.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell align="right">
                          {row.corpusReal.toLocaleString("en-IN")}
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
                Total invested vs retirement corpus
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
                    <Bar dataKey="Invested" name="Total invested" fill="#38bdf8" />
                    <Bar
                      dataKey="Corpus"
                      name="Corpus at retirement"
                      fill="#0f766e"
                    />
                    <Bar
                      dataKey="CorpusReal"
                      name="Corpus in today's value"
                      fill="#94a3b8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, mb: 1 }}
              >
                This table compares your total investment with your estimated 
                retirement corpus (nominal and today's value).
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  size="small"
                  aria-label="Retirement invested vs corpus table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell align="right">Invested (₹)</TableCell>
                      <TableCell align="right">Corpus (nominal, ₹)</TableCell>
                      <TableCell align="right">
                        Corpus (today's value, ₹)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {barData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell align="right">
                          {row.Invested.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell align="right">
                          {row.Corpus.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell align="right">
                          {row.CorpusReal.toLocaleString("en-IN")}
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
