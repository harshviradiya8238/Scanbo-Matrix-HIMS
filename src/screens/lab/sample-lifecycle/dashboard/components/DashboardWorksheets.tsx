import * as React from "react";
import {
  Box,
  Card,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { LAB_CARD_BORDER_RADIUS } from "../../../lab-theme";
import type { LabWorksheet } from "../../../lab-types";

// Extracted from original LabDashboardPage
export function worksheetProgress(
  w: LabWorksheet,
  results: { sampleId: string; status: string }[],
): number {
  if (w.samples.length === 0) return 0;
  const sampleIds = new Set(w.samples);
  const relevant = results.filter((r) => sampleIds.has(r.sampleId));
  if (relevant.length === 0) return 0;
  const verified = relevant.filter((r) => r.status === "verified").length;
  return Math.round((verified / relevant.length) * 100);
}

export interface DashboardWorksheetsProps {
  worksheets: LabWorksheet[];
  results: any[];
  cardSx: any;
  softSurface: string;
  onWorksheetClick: (id: string) => void;
}

export default function DashboardWorksheets({
  worksheets,
  results,
  cardSx,
  softSurface,
  onWorksheetClick,
}: DashboardWorksheetsProps) {
  return (
    <Card>
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography
          variant="overline"
          sx={{
            color: "primary.main",
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          Worksheets
        </Typography>
      </Box>
      <Stack spacing={1.5} sx={{ px: 2, pb: 2 }}>
        {worksheets.slice(0, 4).map((w) => {
          const progress = worksheetProgress(w, results);
          return (
            <Box
              key={w.id}
              onClick={() => onWorksheetClick(w.id)}
              sx={{
                p: 1.25,
                borderRadius: LAB_CARD_BORDER_RADIUS,
                border: "1px solid",
                borderColor: "divider",
                cursor: "pointer",
                "&:hover": { bgcolor: softSurface },
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 0.5 }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {w.id}
                </Typography>
                <Chip
                  size="small"
                  label={
                    w.status === "open"
                      ? "Open"
                      : w.status === "to_be_verified"
                        ? "To verify"
                        : w.status === "verified"
                          ? "Verified"
                          : "Closed"
                  }
                  color={
                    w.status === "to_be_verified"
                      ? "warning"
                      : w.status === "open"
                        ? "info"
                        : w.status === "verified"
                          ? "success"
                          : "default"
                  }
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 6, borderRadius: 1 }}
                color={progress === 100 ? "success" : "primary"}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                {w.analyst} · {w.samples.length} samples
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Card>
  );
}
