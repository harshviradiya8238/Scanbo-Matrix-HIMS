"use client";

import * as React from "react";
import { Box, Stack, Typography } from "@/src/ui/components/atoms";
import { T } from "../tokens";

interface TatBarProps {
  value: number;
}

function TatBarBase({ value }: TatBarProps) {
  const color = value >= 85 ? T.activeTxt : value >= 60 ? "#92400E" : "#9F1239";
  const trackBg =
    value >= 85 ? T.activeBg : value >= 60 ? "#FFFBEB" : "#FFF1F2";
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        sx={{
          flex: 1,
          height: 4,
          bgcolor: trackBg,
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${value}%`,
            height: "100%",
            bgcolor: color,
            borderRadius: 99,
          }}
        />
      </Box>
      <Typography
        sx={{ fontSize: "0.68rem", fontWeight: 700, color, minWidth: 28 }}
      >
        {value}%
      </Typography>
    </Stack>
  );
}

export const TatBar = React.memo(TatBarBase);
