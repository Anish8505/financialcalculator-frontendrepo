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
  years: number;               // backend sends 5.0, but it's still a number
  cagrPercent: number;
  totalReturnPercent?: number; // optional, extra info from backend
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

export default function CagrCalculator() {
  const [initial, setInitial] = useState("");
  const [finalValue, setFinalValue] = useState("");
  const [years, setYears] = useState("");

  const [summary, setSummary] = useState("");
  const [cagrWordsSummary, setCagrWordsSummary] = useState("");
  const [gainWordsSummary, setGainWordsSummary] = useState("");

  const [lineData, setLineData] = useState<CagrPoint[]>([]);
  const [barData, setBarData] = useState<BarPoint[]>([]);

  // hasResult will be true once we have some chart data
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

      const url = `http://localhost:8080/api/cagr?${params.toString()}`;
      console.log("CAGR API URL:", url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("API error");
      }

      const data: CagrApiResponse = await response.json();

      const totalGain = data.totalGain;
      const cagrPercent = data.cagrPercent;
      const yearsFromApi = data.years; // your backend sends e.g. 5.0
      const yearsInt = Math.round(yearsFromApi); // make sure it's an integer

      // ---------- SUMMARY TEXT ----------
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

      const cagrIntApprox = Math.round(cagrPercent);
      const cagrWordsRaw = numberToWords(Math.abs(cagrIntApprox));
      setCagrWordsSummary(
        cagrWordsRaw
          ? `${toTitleCase(cagrWordsRaw)} Percent Per Annum (approx).`
          : ""
      );

      // ---------- YEARLY POINTS (frontend fallback) ----------
      // Backend is not sending yearlyPoints, so we compute them here
      const cagrDecimal = cagrPercent / 100.0;

      const yearlyPoints: CagrPoint[] = [];
      for (let year = 0; year <= yearsInt; year++) {
        const value =
          data.initialAmount * Math.pow(1 + cagrDecimal, year);
        yearlyPoints.push({
          year,
          value: Math.round(value * 100) / 100,
        });
      }

      setLineData(yearlyPoints);

      // ---------- BAR DATA ----------
      setBarData([
        {
          name: "Investment",
          Initial: data.initialAmount,
          Final: data.finalAmount,
        },
      ]);
    } catch (err) {
      console.error("Error calling CAGR API", err);
      setSummary(
        "Something went wrong while calculating your CAGR. Please try again."
      );
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
                onChange={(e) =>
                  setInitial(formatIndianNumber(e.target.value))
                }
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
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 50%" } }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                How this CAGR calculator works
              </Typography>

              <Typography variant="body2" color="text.secondary">
                CAGR (Compound Annual Growth Rate) tells you what fixed annual
                growth rate would convert your initial amount into the final
                amount over the selected time period.
              </Typography>

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
                CAGR = (Final / Initial)^(1 / Years) − 1
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
                    : "Enter initial value, final value and holding period to see CAGR and growth over time."}
                </Typography>

                {hasResult && (
                  <>
                    {cagrWordsSummary && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          mt: 1,
                        }}
                      >
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          CAGR in words (approx):
                        </Box>{" "}
                        {cagrWordsSummary}
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
                          Total gain in words (approx):
                        </Box>{" "}
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
                Value growth over time (yearly)
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
                      dataKey="value"
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
                This table shows how your investment might grow each year if it
                compounds at the calculated CAGR.
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small" aria-label="CAGR yearly value table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Year</TableCell>
                      <TableCell align="right">Estimated Value (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lineData.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell>{row.year}</TableCell>
                        <TableCell align="right">
                          {row.value.toLocaleString("en-IN", {
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
                Initial vs final value
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
                      dataKey="Initial"
                      name="Initial value"
                      fill="#38bdf8"
                    />
                    <Bar dataKey="Final" name="Final value" fill="#0f766e" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, mb: 1 }}
              >
                This table compares your starting value with the final value,
                along with the total gain.
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small" aria-label="CAGR initial vs final table">
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
                            {row.Initial.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {row.Final.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {gain.toLocaleString("en-IN", {
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
