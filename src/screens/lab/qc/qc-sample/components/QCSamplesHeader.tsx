"use client";

import * as React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";
import type { QCSampleView } from "../types";

interface QCSamplesHeaderProps {
  activeView: QCSampleView;
  onShowList: () => void;
  onShowVisual: () => void;
  onAddSample: () => void;
}

function QCSamplesHeaderBase({
  activeView,
  onShowList,
  onShowVisual,
  onAddSample,
}: QCSamplesHeaderProps) {
  const theme = useTheme();

  return (
    <WorkspaceHeaderCard sx={{ p: 2, borderRadius: '22px' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "primary.main", mb: 0.5 }}
          >
            QC Samples Monitoring
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            Analyze internal quality control results using Westgard rules
            and Levey-Jennings charts.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Stack
            direction="row"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              p: 0.5,
              borderRadius: 2,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Button
              size="small"
              onClick={onShowList}
              sx={{
                borderRadius: 1.5,
                px: 2,
                textTransform: "none",
                fontWeight: 700,
                bgcolor:
                  activeView === "list" ? "primary.main" : "transparent",
                color: activeView === "list" ? "white" : "text.secondary",
                "&:hover": {
                  bgcolor:
                    activeView === "list"
                      ? "primary.dark"
                      : alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              List View
            </Button>
            <Button
              size="small"
              onClick={onShowVisual}
              sx={{
                borderRadius: 1.5,
                px: 2,
                textTransform: "none",
                fontWeight: 700,
                bgcolor:
                  activeView === "visual" ? "primary.main" : "transparent",
                color: activeView === "visual" ? "white" : "text.secondary",
                "&:hover": {
                  bgcolor:
                    activeView === "visual"
                      ? "primary.dark"
                      : alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              Visual QC
            </Button>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddSample}
            sx={{ borderRadius: 1.5, px: 2, fontWeight: 700 }}
          >
            Add QC Sample
          </Button>
        </Stack>
      </Stack>
    </WorkspaceHeaderCard>
  );
}

export const QCSamplesHeader = React.memo(QCSamplesHeaderBase);
