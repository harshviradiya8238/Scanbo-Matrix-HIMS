"use client";

import * as React from "react";
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { useTheme } from "@mui/material";
import { useLabStatusConfig } from "../../../lab-status-config";
import { useLabTheme } from "../../../lab-theme";
import type { LabWorksheet } from "../../../lab-types";

interface WorksheetCardProps {
  worksheet: LabWorksheet;
  progress: number;
  onClick: () => void;
  onManage: () => void;
}

export default function WorksheetCard({
  worksheet,
  progress,
  onClick,
  onManage,
}: WorksheetCardProps) {
  const theme = useTheme();
  const lab = useLabTheme(theme);
  const { worksheetStatus } = useLabStatusConfig();
  const cfg = worksheetStatus[worksheet.status];

  return (
    <Box sx={{ ...lab.cardSx, p: 2, cursor: "pointer" }} onClick={onClick}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "primary.main" }}
          >
            {worksheet.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {worksheet.template}
          </Typography>
        </Box>
        <Chip size="small" label={cfg.label} sx={lab.chipSx(cfg.color)} />
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 6, borderRadius: 1, mb: 1 }}
        color={progress === 100 ? "success" : "primary"}
      />
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          {progress}% complete
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {worksheet.samples.length} samples
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          👤 {worksheet.analyst}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          color="info"
          onClick={(e) => {
            e.stopPropagation();
            onManage();
          }}
        >
          Manage
        </Button>
      </Stack>
    </Box>
  );
}
