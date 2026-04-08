import * as React from "react";
import { Box, Chip, Stack, Typography } from "@/src/ui/components/atoms";
import { alpha } from "@mui/material";

export interface IpdOrdersWorkflowLegendProps {
  cardSx: any;
}

export default function IpdOrdersWorkflowLegend({
  cardSx,
}: IpdOrdersWorkflowLegendProps) {
  return (
    <Box sx={{ ...cardSx, p: 2 }}>
      <Typography
        variant="overline"
        sx={{ color: "primary.main", fontWeight: 600, letterSpacing: 1 }}
      >
        IPD → Lab Workflow
      </Typography>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        flexWrap="wrap"
        sx={{ mt: 1.5 }}
      >
        {[
          { label: "Doctor places order (IPD)", color: "#6366f1" },
          { label: "→" },
          { label: "Sample Registered", color: "#f59e0b" },
          { label: "→" },
          { label: "Sample Collected & Received", color: "#3b82f6" },
          { label: "→" },
          { label: "Assigned to Analyst", color: "#8b5cf6" },
          { label: "→" },
          { label: "Analysis Done", color: "#06b6d4" },
          { label: "→" },
          { label: "Verified", color: "#22c55e" },
          { label: "→" },
          { label: "Published to Doctor", color: "#10b981" },
        ].map((step, i) =>
          step.label === "→" ? (
            <Typography key={i} variant="caption" color="text.secondary">
              →
            </Typography>
          ) : (
            <Chip
              key={step.label}
              size="small"
              label={step.label}
              sx={{
                bgcolor: alpha(step.color!, 0.12),
                color: step.color,
                fontWeight: 600,
                fontSize: "0.7rem",
                border: `1px solid ${alpha(step.color!, 0.3)}`,
              }}
            />
          ),
        )}
      </Stack>
    </Box>
  );
}
