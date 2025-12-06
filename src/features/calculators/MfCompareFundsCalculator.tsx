import { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
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

type MfCompareFundRow = {
  schemeCode: string;
  schemeName: string;
  amcName: string;
  category: string;
  riskLevel: string;
  aumCrore: number;
  latestNav: number;
  expenseRatio: number;
  cagr3Y: number;
  cagr5Y: number;
  cagr10Y: number;
  sipCagr10Y: number;
  lumpsum10YCorpus: number;
  sip10YCorpus: number;
  rating: number;
};

type MfCompareFundsResponse = {
  calculator: string;
  currency: string;
  periodLabel: string;
  inputSummary: string;
  summaryText: string;
  funds: MfCompareFundRow[];
};

const formatIndian = (num: number) =>
  num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export default function MfCompareFundsCalculator() {
  const [scheme1, setScheme1] = useState("120503");
  const [scheme2, setScheme2] = useState("120504");
  const [scheme3, setScheme3] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MfCompareFundsResponse | null>(null);

  const hasResult = !!result;

  const handleSubmit = async () => {
    setError(null);
    setResult(null);

    if (!scheme1.trim() || !scheme2.trim()) {
      setError("Please enter at least two scheme codes.");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        scheme1: scheme1.trim(),
        scheme2: scheme2.trim(),
      });

      if (scheme3.trim()) {
        params.append("scheme3", scheme3.trim());
      }

      const res = await fetch(
        `http://localhost:8080/api/mf/compare-funds?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("API error");
      }

      const data: MfCompareFundsResponse = await res.json();
      setResult(data);
    } catch (e) {
      console.error("Error calling compare funds API", e);
      setError(
        "Something went wrong while comparing funds. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* TOP: form + explanation */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          {/* LEFT: form */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 45%" } }}>
            <Stack spacing={2}>
              <TextField
                label="Scheme 1 Code / Name"
                value={scheme1}
                onChange={(e) => setScheme1(e.target.value)}
              />
              <TextField
                label="Scheme 2 Code / Name"
                value={scheme2}
                onChange={(e) => setScheme2(e.target.value)}
              />
              <TextField
                label="Scheme 3 Code / Name (optional)"
                value={scheme3}
                onChange={(e) => setScheme3(e.target.value)}
              />

              {error && (
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              )}

              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Comparing..." : "Compare Mutual Funds"}
              </Button>

              {hasResult && (
                <Typography variant="caption" color="text.secondary">
                  {result?.inputSummary}
                </Typography>
              )}
            </Stack>
          </Box>

          {/* RIGHT: text explanation + summary */}
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 55%" } }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1">
                Why compare mutual funds side-by-side?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comparing funds side-by-side helps you quickly see differences in{" "}
                <strong>CAGR, risk profile, AUM, expense ratio</strong> and the
                approximate corpus created for SIP and lumpsum investments. This
                is much better than checking each fund in isolation.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In production, this page can use live data from AMFI or SEBI
                authorised providers so that AI tools, search engines and users
                can directly rely on your comparison engine.
              </Typography>

              <Box
                sx={{
                  bgcolor: "rgba(240,248,255,0.7)",
                  borderRadius: 2,
                  p: 1.5,
                  mt: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Comparison summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hasResult
                    ? result?.summaryText
                    : "Enter 2–3 scheme codes or names and compare them on returns, risk and corpus created."}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* MIDDLE: chart – compare CAGR */}
      {hasResult && result && (
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            CAGR comparison ({result.periodLabel})
          </Typography>

          <Box sx={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.funds}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="schemeName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cagr3Y" name="3Y CAGR (%)" />
                <Bar dataKey="cagr5Y" name="5Y CAGR (%)" />
                <Bar dataKey="cagr10Y" name="10Y CAGR (%)" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Bars show the approximate annualised returns over different time
            frames. In live mode, this can reflect actual 3Y / 5Y / 10Y
            performance for each scheme from AMFI data.
          </Typography>
        </Paper>
      )}

      {/* BOTTOM: detailed table */}
      {hasResult && result && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Detailed mutual fund comparison
          </Typography>

          <Box sx={{ overflowX: "auto" }}>
            <Table
              size="small"
              aria-label="Mutual fund comparison table"
            >
              <TableHead>
                <TableRow>
                  <TableCell>Scheme</TableCell>
                  <TableCell>AMC</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Risk</TableCell>
                  <TableCell align="right">AUM (Cr)</TableCell>
                  <TableCell align="right">NAV (₹)</TableCell>
                  <TableCell align="right">Expense (%)</TableCell>
                  <TableCell align="right">3Y CAGR (%)</TableCell>
                  <TableCell align="right">5Y CAGR (%)</TableCell>
                  <TableCell align="right">10Y CAGR (%)</TableCell>
                  <TableCell align="right">SIP 10Y CAGR (%)</TableCell>
                  <TableCell align="right">1L Lumpsum 10Y (₹)</TableCell>
                  <TableCell align="right">₹10k SIP 10Y (₹)</TableCell>
                  <TableCell align="right">Rating (/5)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.funds.map((f) => (
                  <TableRow key={f.schemeCode}>
                    <TableCell>{f.schemeName}</TableCell>
                    <TableCell>{f.amcName}</TableCell>
                    <TableCell>{f.category}</TableCell>
                    <TableCell>{f.riskLevel}</TableCell>
                    <TableCell align="right">
                      {f.aumCrore.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>
                    <TableCell align="right">
                      {f.latestNav.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {f.expenseRatio.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {f.cagr3Y.toFixed(1)}
                    </TableCell>
                    <TableCell align="right">
                      {f.cagr5Y.toFixed(1)}
                    </TableCell>
                    <TableCell align="right">
                      {f.cagr10Y.toFixed(1)}
                    </TableCell>
                    <TableCell align="right">
                      {f.sipCagr10Y.toFixed(1)}
                    </TableCell>
                    <TableCell align="right">
                      {formatIndian(f.lumpsum10YCorpus)}
                    </TableCell>
                    <TableCell align="right">
                      {formatIndian(f.sip10YCorpus)}
                    </TableCell>
                    <TableCell align="right">{f.rating}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            The corpus numbers above assume a starting lumpsum of ₹1,00,000 and a
            SIP of ₹10,000 per month for 10 years, based on demo CAGR values.
            When you plug in real data, this table becomes a powerful fund
            comparison engine for investors and AI models.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
