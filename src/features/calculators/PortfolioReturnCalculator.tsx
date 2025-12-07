import { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  Typography,
  Button,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
} from "@mui/material";
import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

/* ---------- API BASE URL ---------- */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/* ---------- types ---------- */

type PortfolioFundResult = {
  schemeName: string;
  amcName: string;
  category: string;
  investmentDate: string;
  investedAmount: number;
  currentValue: number;
  profit: number;
  cagrPercent: number;
  weightPercent: number;
  holdingYears: number;
};

type PortfolioAllocationPoint = {
  schemeName: string;
  weightPercent: number;
};

type PortfolioReturnApiResponse = {
  calculator: string;
  currency: string;
  totalInvested: number;
  totalCurrentValue: number;
  totalProfit: number;
  portfolioCagrPercent: number;
  asOfDate: string;
  summaryText: string;
  inputSummary: string;
  funds: PortfolioFundResult[];
  allocationChart: PortfolioAllocationPoint[];
};

type PortfolioRowInput = {
  schemeName: string;
  amcName: string;
  category: string;
  investmentDate: string;
  investedAmount: string;
  currentValue: string;
};

/* ---------- helpers ---------- */

const formatIndian = (num: number) =>
  num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

const COLORS = ["#0f766e", "#38bdf8", "#f97316", "#6366f1", "#e11d48", "#22c55e"];

/* ---------- component ---------- */

export default function PortfolioReturnCalculator() {
  const [rows, setRows] = useState<PortfolioRowInput[]>([
    {
      schemeName: "Flexi Cap Fund A",
      amcName: "HDFC Mutual Fund",
      category: "Flexi Cap",
      investmentDate: "2018-01-15",
      investedAmount: "100000",
      currentValue: "180000",
    },
    {
      schemeName: "Small Cap Fund B",
      amcName: "SBI Mutual Fund",
      category: "Small Cap",
      investmentDate: "2020-06-10",
      investedAmount: "50000",
      currentValue: "95000",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<PortfolioReturnApiResponse | null>(
    null
  );

  const hasResult = !!response;

  const handleRowChange = (
    index: number,
    field: keyof PortfolioRowInput,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]:
                field === "investedAmount" || field === "currentValue"
                  ? formatAmountInput(value)
                  : value,
            }
          : row
      )
    );
  };

  const formatAmountInput = (value: string) => {
    const raw = value.replace(/,/g, "");
    if (!raw) return "";
    if (!/^\d+$/.test(raw)) return value;
    return Number(raw).toLocaleString("en-IN");
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        schemeName: "",
        amcName: "",
        category: "",
        investmentDate: "",
        investedAmount: "",
        currentValue: "",
      },
    ]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError(null);
    setResponse(null);

    const cleanedFunds = rows
      .map((row, index) => {
        const invested = Number(row.investedAmount.replace(/,/g, ""));
        const current = Number(row.currentValue.replace(/,/g, ""));

        if (!row.investmentDate || !invested || !current) {
          return null;
        }

        return {
          schemeName: row.schemeName || `Fund ${index + 1}`,
          amcName: row.amcName,
          category: row.category,
          investmentDate: row.investmentDate,
          investedAmount: invested,
          currentValue: current,
        };
      })
      .filter((f) => f !== null);

    if (cleanedFunds.length === 0) {
      setError(
        "Please enter at least one fund with date, invested amount and current value."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/mf/portfolio-return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funds: cleanedFunds }),
      });

      if (!res.ok) {
        throw new Error("API error");
      }

      const data: PortfolioReturnApiResponse = await res.json();
      setResponse(data);
    } catch (e) {
      console.error("Error calling portfolio return API", e);
      setError(
        "Something went wrong while calculating portfolio returns. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* TOP CARD: FORM + EXPLANATION / SUMMARY */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          {/* LEFT: TABLE INPUT */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 60%" } }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Enter your mutual fund portfolio
            </Typography>

            <Box sx={{ overflowX: "auto" }}>
              <Table
                size="small"
                aria-label="Portfolio input table for mutual fund holdings"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Scheme Name</TableCell>
                    <TableCell>AMC</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Investment Date</TableCell>
                    <TableCell align="right">Invested (₹)</TableCell>
                    <TableCell align="right">Current Value (₹)</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          variant="standard"
                          value={row.schemeName}
                          onChange={(e) =>
                            handleRowChange(index, "schemeName", e.target.value)
                          }
                          placeholder="Flexi Cap Fund"
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          variant="standard"
                          value={row.amcName}
                          onChange={(e) =>
                            handleRowChange(index, "amcName", e.target.value)
                          }
                          placeholder="SBI / HDFC / ICICI"
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          variant="standard"
                          value={row.category}
                          onChange={(e) =>
                            handleRowChange(index, "category", e.target.value)
                          }
                          placeholder="Large Cap / Small Cap"
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          variant="standard"
                          type="date"
                          value={row.investmentDate}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "investmentDate",
                              e.target.value
                            )
                          }
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          variant="standard"
                          value={row.investedAmount}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "investedAmount",
                              e.target.value
                            )
                          }
                          placeholder="50,000"
                          inputProps={{ style: { textAlign: "right" } }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          variant="standard"
                          value={row.currentValue}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "currentValue",
                              e.target.value
                            )
                          }
                          placeholder="95,000"
                          inputProps={{ style: { textAlign: "right" } }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => removeRow(index)}
                          disabled={rows.length === 1}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow>
                    <TableCell colSpan={7}>
                      <Button
                        startIcon={<AddCircleOutline />}
                        onClick={addRow}
                        size="small"
                      >
                        Add another fund
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Calculating..." : "Calculate Portfolio Returns"}
              </Button>
            </Box>

            {hasResult && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {response?.inputSummary}
              </Typography>
            )}
          </Box>

          {/* RIGHT: EXPLANATION + SUMMARY */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 40%" } }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                What does this portfolio calculator do?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This tool helps you estimate the overall performance of your
                mutual fund portfolio. You simply enter each holding with its
                investment date, amount and current value. The calculator then:
              </Typography>
              <ul style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
                <li>
                  Calculates profit or loss for each fund and for the overall
                  portfolio.
                </li>
                <li>
                  Computes an approximate CAGR (annualised return) for every
                  holding based on its holding period.
                </li>
                <li>
                  Calculates the weighted average CAGR of your total portfolio.
                </li>
                <li>
                  Shows allocation of your portfolio by scheme in a pie chart.
                </li>
              </ul>

              <Typography variant="body2" color="text.secondary">
                This is a simple, clean, ad–free way to track whether your
                mutual funds are actually beating fixed deposits and inflation.
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
                  Portfolio summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasResult
                    ? response?.summaryText
                    : "Enter your mutual fund holdings above to see total invested amount, current value, profit and the weighted average CAGR of your portfolio."}
                </Typography>

                {hasResult && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    <strong>Total invested:</strong>{" "}
                    ₹{formatIndian(response!.totalInvested)} &nbsp;|&nbsp;
                    <strong>Current value:</strong>{" "}
                    ₹{formatIndian(response!.totalCurrentValue)} &nbsp;|&nbsp;
                    <strong>Overall CAGR:</strong>{" "}
                    {response!.portfolioCagrPercent.toFixed(2)}% p.a.
                  </Typography>
                )}
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* BOTTOM: CHART + TABLE RESULTS */}
      {hasResult && response && (
        <Paper sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
            }}
          >
            {/* PIE CHART – ALLOCATION */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Portfolio allocation by scheme
              </Typography>
              <Box sx={{ width: "100%", height: { xs: 260, md: 320 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={response.allocationChart}
                      dataKey="weightPercent"
                      nameKey="schemeName"
                      outerRadius={90}
                      label={(entry) =>
                        `${entry.schemeName} (${entry.weightPercent.toFixed(
                          1
                        )}%)`
                      }
                    >
                      {response.allocationChart.map((entry, index) => (
                        <Cell
                          key={entry.schemeName}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) =>
                        `${value.toFixed(2)}% of portfolio`
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                This chart shows how your current portfolio value is distributed
                across funds. High concentration in a single scheme or category
                increases risk.
              </Typography>
            </Box>

            {/* TABLE – DETAILED RESULTS */}
            <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Fund–wise portfolio performance
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  size="small"
                  aria-label="Portfolio result table with fund-wise CAGR and profit"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Scheme</TableCell>
                      <TableCell>AMC</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Invest. Date</TableCell>
                      <TableCell align="right">Invested (₹)</TableCell>
                      <TableCell align="right">Current (₹)</TableCell>
                      <TableCell align="right">Profit (₹)</TableCell>
                      <TableCell align="right">Holding (yrs)</TableCell>
                      <TableCell align="right">CAGR (%)</TableCell>
                      <TableCell align="right">Portfolio %</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {response.funds.map((f) => (
                      <TableRow key={f.schemeName + f.investmentDate}>
                        <TableCell>{f.schemeName}</TableCell>
                        <TableCell>{f.amcName}</TableCell>
                        <TableCell>{f.category}</TableCell>
                        <TableCell>{f.investmentDate}</TableCell>
                        <TableCell align="right">
                          {formatIndian(f.investedAmount)}
                        </TableCell>
                        <TableCell align="right">
                          {formatIndian(f.currentValue)}
                        </TableCell>
                        <TableCell align="right">
                          {formatIndian(f.profit)}
                        </TableCell>
                        <TableCell align="right">
                          {f.holdingYears.toFixed(1)}
                        </TableCell>
                        <TableCell align="right">
                          {f.cagrPercent.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          {f.weightPercent.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Use this breakdown to identify lagging funds, funds with very
                high allocation, and schemes that are delivering strong
                risk-adjusted returns over your holding period.
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
