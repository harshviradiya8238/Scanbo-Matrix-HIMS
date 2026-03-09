"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Stack, Typography } from "@/src/ui/components/atoms";
import { Card, WorkspaceHeaderCard } from "@/src/ui/components/molecules";
import { useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Add as AddIcon } from "@mui/icons-material";

export interface LabWorkspaceCardProps {
  children: React.ReactNode;
  /** Optional actions (e.g. "Add Sample") shown in the header card */
  actions?: React.ReactNode;
  current?: string;
}

export default function LabWorkspaceCard({
  children,
  actions,
}: LabWorkspaceCardProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Stack spacing={0}>
      {/* Header card – same pattern as Clinical Care Workspace */}
      <WorkspaceHeaderCard>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", lg: "center" }}
          spacing={1.25}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1.1 }}
            >
              Laboratory
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Samples, worksheets, results, test catalog, instruments, and
              reports.
            </Typography>
          </Box>

          {actions ?? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon fontSize="small" />}
                onClick={() => router.push("/lab/samples")}
              >
                Add Sample
              </Button>
            </Stack>
          )}
        </Stack>
      </WorkspaceHeaderCard>

      {/* Page content below the card */}
      <Box sx={{ pt: 1.5 }}>{children}</Box>
    </Stack>
  );
}
