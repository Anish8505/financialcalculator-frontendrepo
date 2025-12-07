// src/features/calculators/TaxCalculator.tsx
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
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

/* ---------- API BASE URL ---------- */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/* ---------- types ---------- */

type BarPoint = {
  name: string;
  Taxable: number;
  Tax: number;
};

type TaxApiResponse = {
  income: number;
  tax: number;
  netIncome: number;
  effectiveRate: number; // percentage, e.g. 2.86
  regime: string;
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

export default function TaxCalculator() {
  const [income, setIncome] = useState("");
  const [regime, setRegime] = useState<"new" | "old">("new");

  const [summary, setSummary] = useState("");
  const [incomeWords, setIncomeWords] = useState("");
  const [taxWords, setTaxWords] = useState("");

  const [barData, setBarData] = useState<BarPoint[]>([]);

  const hasResult = barData.length > 0;

  const handleCalculate = async () => {
    const incomeNumeric = Number(income.replace(/,/g, ""));

    if (!incomeNumeric || incomeNumeric <= 0) {
      setSummary(
        "Please enter your annual taxable income to estimate your income tax."
      );
      setIncomeWords("");
      setTaxWords("");
      setBarData([]);
      return;
    }

    try {
      const params = new URLSearchParams({
        income: incomeNumeric.toString(),
        regime,
      });

      const url = `${API_BASE_URL}/tax?${params.toString()}`;
      console.log("Tax API URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("API error");
      }

      const data: TaxApiResponse = await response.json();

      const totalTax = data.tax;
      const effRate = data.effectiveRate;
      const netIncome = data.netIncome;

      setSummary(
        `For a taxable income of ₹${data.income.toLocaleString(
          "en-IN"
        )}, your approximate income tax is ₹${totalTax.toLocaleString(
          "en-IN"
        )}. Your net income after tax is ₹${netIncome.toLocaleString(
          "en-IN"
        )} (effective tax rate ≈ ${effRate.toFixed(2)}%).`
      );

      const incomeWordsRaw = numberToWords(Math.round(data.income));
      const taxWordsRaw = numberToWords(Math.round(totalTax));

      setIncomeWords(incomeWordsRaw ? toTitleCase(incomeWordsRaw) : "");
      setTaxWords(taxWordsRaw ? toTitleCase(taxWordsRaw) : "");

      setBarData([
        {
          name: "Income vs Tax",
          Taxable: data.income,
          Tax: totalTax,
        },
      ]);
    } catch (err) {
      console.error("Error calling Tax API", err);
      setSummary(
        "Something went wrong while calculating your tax. Please try again."
      );
      setIncomeWords("");
      setTaxWords("");
      setBarData([]);
    }
  };

  const incomeNumeric = Number(income.replace(/,/g, ""));
  const incomeWordsRaw = incomeNumeric
    ? toTitleCase(numberToWords(incomeNumeric))
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
                label="Annual Taxable Income (₹)"
                type="text"
                value={income}
                onChange={(e) => setIncome(formatIndianNumber(e.target.value))}
              />
              {incomeWordsRaw && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600, mt: -0.5 }}
                >
                  {incomeWordsRaw}
                </Typography>
              )}

              <Typography
                variant="body2"
                sx={{ mt: 1, mb: 0.5, fontWeight: 500 }}
              >
                Tax regime
              </Typography>
              <ToggleButtonGroup
                value={regime}
                exclusive
                onChange={(_, val) => val && setRegime(val)}
                size="small"
              >
                <ToggleButton value="new">New regime</ToggleButton>
                <ToggleButton value="old">Old regime</ToggleButton>
              </ToggleButtonGroup>

              <Button variant="contained" size="large" onClick={handleCalculate}>
                Calculate Income Tax
              </Button>
            </Stack>
          </Box>

          {/* RIGHT – EXPLANATION + SUMMARY */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 50%" } }}>
            <Stack spacing={1.5} sx={{ height: "100%" }}>
              <Typography variant="subtitle1">
                How this tax calculator works
              </Typography>

              <Typography variant="body2" color="text.secondary">
                This calculator takes your taxable income and applies backend slab rules to compute total tax, net income, and effective tax rate.
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
                    : "Enter your taxable income and click Calculate to see your approximate tax, net income and effective rate."}
                </Typography>

                {hasResult && (
                  <>
                    {incomeWords && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          mt: 1,
                        }}
                      >
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          Income in words:
                        </Box>{" "}
                        {incomeWords} Rupees.
                      </Typography>
                    )}

                    {taxWords && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          mt: 1,
                        }}
                      >
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          Tax in words (approx):
                        </Box>{" "}
                        {taxWords} Rupees.
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* BOTTOM: CHART + TABLE */}
      {hasResult && (
        <Paper sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
            }}
          >
            {/* LEFT – BAR CHART */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Taxable income vs tax
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
                      dataKey="Taxable"
                      name="Taxable income"
                      fill="#38bdf8"
                    />
                    <Bar dataKey="Tax" name="Tax" fill="#0f766e" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>

            {/* RIGHT – TABLE */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Summary table
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small" aria-label="Income tax summary table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="right">Taxable Income (₹)</TableCell>
                      <TableCell align="right">Tax (₹)</TableCell>
                      <TableCell align="right">Net Income (₹)</TableCell>
                      <TableCell align="right">Effective Rate (%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {barData.map((row, idx) => {
                      const tax = row.Tax;
                      const taxable = row.Taxable;
                      const net = taxable - tax;
                      return (
                        <TableRow key={idx}>
                          <TableCell align="right">
                            {taxable.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {tax.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {net.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {((tax / taxable) * 100).toFixed(2)}
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
