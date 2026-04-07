import React from "react";
import { Theme, alpha } from "@mui/material/styles";
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import {
  CaseStatus,
  OtCase,
  ViewMode,
  PRIORITY_COLOR,
  STATUS_COLOR,
} from "../OpTimeData";

interface OpTimeWorkspaceHeaderProps {
  theme: Theme;
  selectedCase: OtCase | null;
  setViewMode: (mode: ViewMode) => void;
  roomLabelById: Map<string, string>;
}

export const OpTimeWorkspaceHeader: React.FC<OpTimeWorkspaceHeaderProps> = ({
  theme,
  selectedCase,
  setViewMode,
  roomLabelById,
}) => {
  return (
    <Box
      sx={{
        px: { xs: 1, sm: 1.25 },
        py: { xs: 0.75, sm: 0.85 },
        borderRadius: 1.75,
        border: "1px solid",
        borderColor: alpha(theme.palette.primary.main, 0.2),
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        backgroundImage: `linear-gradient(90deg, ${alpha(theme.palette.primary.light, 0.12)} 0%, ${alpha(theme.palette.background.paper, 0.75)} 75%)`,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={0.9}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
      >
        <Stack spacing={0.35} sx={{ minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={0.65}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Button
              size="small"
              variant="text"
              startIcon={<ArrowBackIcon fontSize="small" />}
              onClick={() => setViewMode("board")}
              sx={{ px: 0.75, minWidth: "unset", fontWeight: 700 }}
            >
              Back to OR Board
            </Button>
            <Typography
              sx={{
                fontFamily:
                  '"IBM Plex Mono","SFMono-Regular",Consolas,monospace',
                fontWeight: 700,
                color: "primary.main",
              }}
            >
              {selectedCase?.caseNo ?? "--"}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: "text.primary", fontWeight: 800 }}
            >
              {selectedCase?.patientName ?? "No Case Selected"}
            </Typography>
            {selectedCase ? (
              <Chip
                size="small"
                label={selectedCase.priority}
                color={PRIORITY_COLOR[selectedCase.priority]}
              />
            ) : null}
            {selectedCase ? (
              <Chip
                size="small"
                label={selectedCase.status}
                color={STATUS_COLOR[selectedCase.status]}
              />
            ) : null}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ pl: 0.1 }}>
            {selectedCase?.mrn ?? "--"} • {selectedCase?.department ?? "--"} •
            Room {roomLabelById.get(selectedCase?.roomId ?? "") ?? "--"} •{" "}
            {selectedCase?.surgeon ?? "--"}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={0.65}
          sx={{ alignSelf: { xs: "stretch", md: "center" } }}
        >
          <Button
            size="small"
            variant="outlined"
            startIcon={<PrintIcon fontSize="small" />}
            sx={{ py: 0.55 }}
          >
            Print Summary
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<SaveIcon fontSize="small" />}
            sx={{ py: 0.55 }}
          >
            Save Case
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
