"use client";

import * as React from "react";
import { Box, Stack, Typography } from "@/src/ui/components/atoms";
import { T } from "../tokens";

interface UsageBarProps {
  value: number;
  max?: number;
}

function UsageBarBase({ value, max = 130 }: UsageBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        sx={{
          flex: 1,
          height: 4,
          bgcolor: T.usageBg,
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${pct}%`,
            height: "100%",
            bgcolor: T.primary,
            borderRadius: 99,
          }}
        />
      </Box>
      <Typography
        sx={{
          fontSize: "0.65rem",
          fontWeight: 700,
          color: T.textMuted,
          minWidth: 26,
        }}
      >
        {value}×
      </Typography>
    </Stack>
  );
}

export const UsageBar = React.memo(UsageBarBase);
