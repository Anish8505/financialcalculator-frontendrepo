// src/features/calculators/CagrCalculator.tsx
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

/* ---------- API BASE URL (dev + prod) ---------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/* ---------- types ---------- */

type CagrPoint = {
  year: number;
  value: number;
};

type BarPoint = {
  name: string;
  Initial: number;
  Final: number;
};

type CagrApiResponse = {
  initialAmount: number;
  finalAmount: number;
  years: number;
  cagrPercent: number;
  totalReturnPercent?: number;
  totalGain: number;
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
    return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
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

export default function CagrCalculator() {
  const [initial, setInitial] = useState("");
  const [finalValue, setFinalValue] = useState("");
  const [years, setYears] = useState("");

  const [summary, setSummary] = useState("");
  const [cagrWordsSummary, setCagrWordsSummary] = useState("");
  const [gainWordsSummary, setGainWordsSummary] = useState("");

  const [lineData, setLineData] = useState<CagrPoint[]>([]);
  const [barData, setBarData] = useState<BarPoint[]>([]);

  const hasResult = lineData.length > 0;

  const handleCalculate = async () => {
    const initialAmount = Number(initial.replace(/,/g, ""));
    const finalAmount = Number(finalValue.replace(/,/g, ""));
    const t = Number(years);

    if (!initialAmount || !finalAmount || !t) {
      setSummary(
        "Please enter initial value, final value and holding period in years to calculate CAGR."
      );
      setCagrWordsSummary("");
      setGainWordsSummary("");
      setLineData([]);
      setBarData([]);
      return;
    }

    try {
      const params = new URLSearchParams({
        initial: initialAmount.toString(),
        final: finalAmount.toString(),
        years: t.toString(),
      });

      // 🔥 UPDATED URL (no localhost hardcode)
      const url = `${API_BASE_URL}/cagr?${params.toString()}`;
      console.log("CAGR API URL:", url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("API error");
      }

      const data: CagrApiResponse = await response.json();

      const totalGain = data.totalGain;
      const cagrPercent = data.cagrPercent;
      const yearsInt = Math.round(data.years);

      setSummary(
        `Your investment grew from ₹${data.initialAmount.toLocaleString(
          "en-IN"
        )} to ₹${data.finalAmount.toLocaleString(
          "en-IN"
        )} over ${yearsInt} years. This is a CAGR of approximately ${cagrPercent.toFixed(
          2
        )}% per year, with a total gain of ₹${totalGain.toLocaleString(
          "en-IN"
        )}.`
      );

      const gainWordsRaw = numberToWords(Math.round(totalGain));
      setGainWordsSummary(gainWordsRaw ? toTitleCase(gainWordsRaw) : "");

      const cagrWordsRaw = numberToWords(Math.round(cagrPercent));
      setCagrWordsSummary(
        cagrWordsRaw ? `${toTitleCase(cagrWordsRaw)} Percent Per Annum (approx).` : ""
      );

      const cagrDecimal = cagrPercent / 100.0;
      const yearlyPoints: CagrPoint[] = [];

      for (let year = 0; year <= yearsInt; year++) {
        const value = data.initialAmount * Math.pow(1 + cagrDecimal, year);
        yearlyPoints.push({
          year,
          value: Math.round(value * 100) / 100,
        });
      }

      setLineData(yearlyPoints);

      setBarData([
        {
          name: "Investment",
          Initial: data.initialAmount,
          Final: data.finalAmount,
        },
      ]);
    } catch (err) {
      console.error("Error calling CAGR API", err);
      setSummary("Something went wrong while calculating your CAGR. Please try again.");
      setCagrWordsSummary("");
      setGainWordsSummary("");
      setLineData([]);
      setBarData([]);
    }
  };

  const initialNumeric = Number(initial.replace(/,/g, ""));
  const finalNumeric = Number(finalValue.replace(/,/g, ""));
  const yearsNumeric = Number(years);

  const initialWords = initialNumeric
    ? toTitleCase(numberToWords(initialNumeric))
    : "";
  const finalWords = finalNumeric
    ? toTitleCase(numberToWords(finalNumeric))
    : "";
  const yearsWords = yearsNumeric
    ? toTitleCase(numberToWords(yearsNumeric)) +
      (yearsNumeric === 1 ? " Year" : " Years")
    : "";

  return (
    <Box>
      {/* UI remains unchanged */}
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
                label="Initial Value / Investment (₹)"
                type="text"
                value={initial}
                onChange={(e) => setInitial(formatIndianNumber(e.target.value))}
              />
              {initialWords && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600, mt: -0.5 }}
                >
                  {initialWords}
                </Typography>
              )}

              <TextField
                label="Final Value (₹)"
                type="text"
                value={finalValue}
                onChange={(e) =>
                  setFinalValue(formatIndianNumber(e.target.value))
                }
              />
              {finalWords && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600, mt: -0.5 }}
                >
                  {finalWords}
                </Typography>
              )}

              <TextField
                label="Holding Period (years)"
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
                Calculate CAGR
              </Button>
            </Stack>
          </Box>

          {/* RIGHT – EXPLANATION + SUMMARY */}
          {/* (UI unchanged—keeping compact for readability) */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 50%" } }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                How this CAGR calculator works
              </Typography>

              <Typography variant="body2" color="text.secondary">
                CAGR (Compound Annual Growth Rate) tells you the fixed annual
                growth rate required to reach the final amount.
              </Typography>

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
                CAGR = (Final / Initial)^{`1 / Years`} − 1
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
                    : "Enter values to calculate CAGR and growth over time."}
                </Typography>

                {hasResult && (
                  <>
                    {cagrWordsSummary && (
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", fontWeight: 500, mt: 1 }}
                      >
                        <strong>CAGR in words (approx): </strong>
                        {cagrWordsSummary}
                      </Typography>
                    )}

                    {gainWordsSummary && (
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", fontWeight: 500, mt: 1 }}
                      >
                        <strong>Total gain in words: </strong>
                        {gainWordsSummary} Rupees.
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* BOTTOM: charts + tables */}
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
                Value growth over time
              </Typography>

              <Box sx={{ width: "100%", height: { xs: 260, md: 320 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0f766e"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              {/* YEARLY TABLE */}
              <Box sx={{ mt: 2, overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Year</TableCell>
                      <TableCell align="right">Value (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lineData.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell>{row.year}</TableCell>
                        <TableCell align="right">
                          {row.value.toLocaleString("en-IN")}
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
                Initial vs Final Value
              </Typography>

              <Box sx={{ width: "100%", height: { xs: 260, md: 320 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Initial" fill="#38bdf8" name="Initial value" />
                    <Bar dataKey="Final" fill="#0f766e" name="Final value" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Box sx={{ mt: 2, overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="right">Initial (₹)</TableCell>
                      <TableCell align="right">Final (₹)</TableCell>
                      <TableCell align="right">Gain (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {barData.map((row, index) => {
                      const gain = row.Final - row.Initial;
                      return (
                        <TableRow key={index}>
                          <TableCell align="right">
                            {row.Initial.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell align="right">
                            {row.Final.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell align="right">
                            {gain.toLocaleString("en-IN")}
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
