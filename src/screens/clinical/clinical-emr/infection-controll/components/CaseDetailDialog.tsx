"use client";

import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { CommonDialog } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Biotech as BiotechIcon,
  Block as BlockIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { type InfectionCase } from "@/src/mocks/infection-control";
import { CaseDetailEvent } from "../utils/infection-control-types";

interface CaseDetailDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCase: InfectionCase | undefined;
  CASE_EXTRA: Record<
    string,
    { admissionDate: string; diagnosis: string; genderAge: string }
  >;
  CASE_DETAIL_EVENTS: Record<string, CaseDetailEvent[]>;
  canWrite: boolean;
  setActiveTab: (tab: any) => void;
  setAuditDialogOpen: (open: boolean) => void;
  openCloseCaseDialog: (targetCase: InfectionCase) => void;
  setCaseDetailOpen: (open: boolean) => void;
}

const CaseDetailDialog: React.FC<CaseDetailDialogProps> = ({
  open,
  onClose,
  selectedCase,
  CASE_EXTRA,
  CASE_DETAIL_EVENTS,
  canWrite,
  setActiveTab,
  setAuditDialogOpen,
  openCloseCaseDialog,
  setCaseDetailOpen,
}) => {
  const theme = useTheme();

  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      title={`Case Detail — ${selectedCase?.patientName ?? "—"}`}
      subtitle={
        selectedCase
          ? `${selectedCase.mrn} • ${selectedCase.organism} • ${selectedCase.unit} • Bed ${selectedCase.bed}`
          : undefined
      }
      icon={
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.success.main, 0.12),
            color: "success.main",
          }}
        >
          <BiotechIcon sx={{ fontSize: 22 }} />
        </Box>
      }
      maxWidth="md"
      fullWidth
      content={
        selectedCase ? (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Patient card */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.2),
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="flex-start"
                flexWrap="wrap"
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "primary.main",
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
                  {selectedCase.patientName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </Avatar>
                <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {selectedCase.patientName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {CASE_EXTRA[selectedCase.id]?.genderAge ?? "—"} •{" "}
                    {selectedCase.mrn} • {selectedCase.unit} • Bed{" "}
                    {selectedCase.bed}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Admitted:{" "}
                    {CASE_EXTRA[selectedCase.id]?.admissionDate ?? "—"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Diagnosis: {CASE_EXTRA[selectedCase.id]?.diagnosis ?? "—"}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    size="small"
                    icon={
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: "error.main",
                        }}
                      />
                    }
                    label="Isolated"
                    sx={{
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.warning.main, 0.15),
                      borderColor: alpha(theme.palette.warning.main, 0.5),
                      "& .MuiChip-icon": { ml: 0.5 },
                    }}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={selectedCase.isolationType}
                    sx={{
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.warning.main, 0.15),
                      borderColor: alpha(theme.palette.warning.main, 0.5),
                    }}
                    variant="outlined"
                  />
                </Stack>
              </Stack>
            </Box>

            {/* Timeline */}
            <Box
              sx={{
                position: "relative",
                pl: 1,
                borderLeft: "2px solid",
                borderColor: alpha(theme.palette.grey[500], 0.25),
                ml: 1.5,
              }}
            >
              <Stack spacing={2}>
                {(CASE_DETAIL_EVENTS[selectedCase.id] ?? []).map((evt) => {
                  const IconComponent =
                    evt.icon === "detect"
                      ? SearchIcon
                      : evt.icon === "isolate"
                        ? BlockIcon
                        : evt.icon === "notify"
                          ? NotificationsIcon
                          : AssignmentTurnedInIcon;
                  const iconColor =
                    evt.icon === "detect"
                      ? "primary.main"
                      : evt.icon === "isolate"
                        ? "error.main"
                        : evt.icon === "notify"
                          ? "warning.main"
                          : "info.main";
                  return (
                    <Stack
                      key={evt.id}
                      direction="row"
                      spacing={1.5}
                      sx={{ position: "relative", ml: -2.5 }}
                    >
                      <Stack
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor:
                            evt.icon === "detect"
                              ? alpha(theme.palette.primary.main, 0.12)
                              : evt.icon === "isolate"
                                ? alpha(theme.palette.error.main, 0.12)
                                : evt.icon === "notify"
                                  ? alpha(theme.palette.warning.main, 0.12)
                                  : alpha(theme.palette.info.main, 0.12),
                          color: iconColor,
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          border: "2px solid",
                          borderColor: "background.paper",
                          boxShadow:
                            "0 0 0 1px " + alpha(theme.palette.grey[500], 0.2),
                        }}
                      >
                        <IconComponent sx={{ fontSize: 16 }} />
                      </Stack>
                      <Stack sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {evt.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {evt.date}
                          {evt.source ? ` • ${evt.source}` : ""}
                        </Typography>
                        <Box
                          sx={{
                            mt: 1,
                            p: 1.25,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.grey[500], 0.06),
                            border: "1px solid",
                            borderColor: alpha(theme.palette.grey[500], 0.12),
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {evt.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          </Stack>
        ) : null
      }
      actions={
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          width="100%"
          flexWrap="wrap"
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="warning"
            disabled={!canWrite}
            onClick={() => {
              setCaseDetailOpen(false);
              setActiveTab("notify");
            }}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Send Notification
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!canWrite}
            onClick={() => {
              setCaseDetailOpen(false);
              setAuditDialogOpen(true);
            }}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Log Audit
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={!canWrite}
            onClick={() => {
              if (selectedCase) {
                setCaseDetailOpen(false);
                openCloseCaseDialog(selectedCase);
              }
            }}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Close Case
          </Button>
        </Stack>
      }
    />
  );
};

export default CaseDetailDialog;
