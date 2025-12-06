// src/pages/ComingSoonPage.tsx
import { Box, Paper, Typography } from "@mui/material";

interface ComingSoonPageProps {
  title: string;
}

export default function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {title}
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Coming soon 🚧
        </Typography>
        <Typography variant="body2" color="text.secondary">
          We’re designing this calculator to match the same clean, graph-based
          experience as SIP and FD. Stay tuned – it will be added here shortly.
        </Typography>
      </Paper>
    </Box>
  );
}
