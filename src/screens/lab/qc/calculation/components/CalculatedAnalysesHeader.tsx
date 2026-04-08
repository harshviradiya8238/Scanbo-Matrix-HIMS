"use client";

import * as React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@mui/material";
import {
  Add as AddIcon,
  Calculate as CalculateIcon,
} from "@mui/icons-material";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";

interface CalculatedAnalysesHeaderProps {
  onAdd: () => void;
}

function CalculatedAnalysesHeaderBase({ onAdd }: CalculatedAnalysesHeaderProps) {
  const theme = useTheme();

  return (
    <WorkspaceHeaderCard>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              p: 1.25,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CalculateIcon sx={{ color: "primary.main" }} />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: "primary.main" }}
          >
            Calculated Analyses
          </Typography>
        </Stack>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{ fontWeight: 700 }}
        >
          Add Calculation
        </Button>
      </Stack>
    </WorkspaceHeaderCard>
  );
}

export const CalculatedAnalysesHeader = React.memo(CalculatedAnalysesHeaderBase);
