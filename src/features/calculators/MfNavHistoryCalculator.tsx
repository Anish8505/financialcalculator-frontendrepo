import { useState } from "react";
import {
  Box, Paper, Stack, TextField, Button, Typography
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function MfNavHistoryCalculator() {
  const [schemeCode, setSchemeCode] = useState("120503");
  const [from, setFrom] = useState("2023-01-01");
  const [to, setTo] = useState("2023-12-31");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    const res = await fetch(
      `http://localhost:8080/api/mf/nav-history?schemeCode=${schemeCode}&from=${from}&to=${to}`
    );
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack spacing={2}>
          <TextField
            label="Scheme Code"
            value={schemeCode}
            onChange={(e) => setSchemeCode(e.target.value)}
          />
          <TextField type="date" label="From Date" value={from}
            onChange={(e) => setFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField type="date" label="To Date" value={to}
            onChange={(e) => setTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <Button variant="contained" onClick={fetchHistory} disabled={loading}>
            {loading ? "Loading..." : "Show NAV History"}
          </Button>
        </Stack>
      </Paper>

      {data && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            NAV History for {data.schemeName}
          </Typography>

          <Box sx={{ width: "100%", height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.navData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="nav" stroke="#1976d2" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
