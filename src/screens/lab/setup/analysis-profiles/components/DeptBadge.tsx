"use client";

import * as React from "react";
import { Box, Typography } from "@/src/ui/components/atoms";
import { T } from "../tokens";

interface DeptBadgeProps {
  dept: string;
}

function DeptBadgeBase({ dept }: DeptBadgeProps) {
  const c = T.deptColors[dept] ?? T.deptColors.default;
  return (
    <Box
      sx={{
        display: "inline-flex",
        px: 1,
        py: 0.35,
        bgcolor: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: "6px",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.63rem",
          fontWeight: 700,
          color: c.text,
          lineHeight: 1,
        }}
      >
        {dept}
      </Typography>
    </Box>
  );
}

export const DeptBadge = React.memo(DeptBadgeBase);
