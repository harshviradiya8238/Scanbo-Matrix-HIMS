"use client";

import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  Checkbox,
  Grid,
  Divider,
} from "@/src/ui/components/atoms";
import { CommonDialog } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Biotech as BiotechIcon,
  Block as BlockIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { type InfectionCase } from "@/src/mocks/infection-control";
import { CaseDetailEvent, IsolationRoom } from "../../utils/infection-control-types";
import { getPpeChecklistForPatient } from "../../utils/infection-control-data";

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
  ppeChecklist: Record<string, Record<string, boolean>>;
  setPpeChecklist: React.Dispatch<React.SetStateAction<Record<string, Record<string, boolean>>>>;
  isolations: IsolationRoom[];
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
  ppeChecklist,
  setPpeChecklist,
  isolations,
}) => {
  const theme = useTheme();

  const selectedIsolation = React.useMemo(() => {
    return isolations.find((item) => item.mrn === selectedCase?.mrn);
  }, [isolations, selectedCase?.mrn]);

  const checklistKey = selectedCase?.mrn ?? "default";
  const checklistItems = React.useMemo(
    () => getPpeChecklistForPatient(selectedCase?.mrn ?? ""),
    [selectedCase],
  );
  const checklistState = ppeChecklist[checklistKey] ?? {};

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

            {/* PPE Checklist Grid */}
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mt: 1 }}>
              PPE Safety Protocols
            </Typography>
            <Grid container spacing={2}>
              {checklistItems.map((item) => {
                const checked = checklistState[item.id] ?? item.checked;
                return (
                  <Grid item xs={6} key={item.id}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: checked ? alpha(theme.palette.success.main, 0.2) : 'divider',
                        bgcolor: checked
                          ? alpha(theme.palette.success.main, 0.04)
                          : "transparent",
                        transition: 'all 0.2s'
                      }}
                    >
                      <Checkbox
                        checked={checked}
                        onChange={(_, checked) =>
                          setPpeChecklist((prev) => ({
                            ...prev,
                            [checklistKey]: {
                              ...(prev[checklistKey] ?? {}),
                              [item.id]: checked,
                            },
                          }))
                        }
                        icon={<CheckBoxOutlineBlankIcon sx={{ fontSize: 18 }} />}
                        checkedIcon={
                          <CheckBoxIcon sx={{ color: "success.main", fontSize: 18 }} />
                        }
                        sx={{ p: 0.25 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '12px' }}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
                          {item.role}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                );
              })}
            </Grid>

            <Divider sx={{ my: 1 }} />

            {/* Timeline */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, mb: 1 }}>
              <HistoryIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1.5 }}>
                Case Timeline & History
              </Typography>
            </Stack>

            <Box
              sx={{
                position: "relative",
                pl: 4,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 15,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.main, 0.4)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                  borderRadius: 1
                }
              }}
            >
              <Stack spacing={3}>
                {(CASE_DETAIL_EVENTS[selectedCase.id] ?? []).map((evt, idx) => {
                  const IconComponent =
                    evt.icon === "detect"
                      ? SearchIcon
                      : evt.icon === "isolate"
                        ? BlockIcon
                        : evt.icon === "notify"
                          ? NotificationsIcon
                          : AssignmentTurnedInIcon;

                  const colorMap = {
                    detect: theme.palette.primary.main,
                    isolate: theme.palette.error.main,
                    notify: theme.palette.warning.main,
                    audit: theme.palette.info.main,
                  };

                  const brandColor = (colorMap as any)[evt.icon] || theme.palette.primary.main;

                  return (
                    <Box key={evt.id} sx={{ position: "relative" }}>
                      {/* Timeline Dot with Icon */}
                      <Box
                        sx={{
                          position: "absolute",
                          left: -33, // Correctly centered on the line
                          top: 0,
                          width: 32,
                          height: 32,
                          borderRadius: "10px",
                          bgcolor: 'background.paper',
                          border: "2px solid",
                          borderColor: alpha(brandColor, 0.5),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 1,
                          boxShadow: `0 0 0 4px ${alpha(brandColor, 0.08)}`,
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            borderColor: brandColor,
                            boxShadow: `0 0 12px ${alpha(brandColor, 0.2)}`,
                          }
                        }}
                      >
                        <IconComponent sx={{ fontSize: 16, color: brandColor }} />
                      </Box>

                      {/* Content Card */}
                      <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {evt.title}
                          </Typography>
                          <Typography variant="caption" sx={{
                            fontWeight: 700,
                            color: 'text.secondary',
                            bgcolor: alpha(theme.palette.grey[500], 0.08),
                            px: 1, py: 0.25, borderRadius: 1
                          }}>
                            {evt.date}
                          </Typography>
                        </Stack>

                        {evt.source && (
                          <Typography variant="caption" sx={{ fontWeight: 600, color: alpha(brandColor, 0.7) }}>
                            via {evt.source}
                          </Typography>
                        )}

                        <Box
                          sx={{
                            mt: 1,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(brandColor, 0.03),
                            border: "1px solid",
                            borderColor: alpha(brandColor, 0.08),
                            position: 'relative',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              left: 0, top: 0, bottom: 0,
                              width: 3,
                              bgcolor: brandColor,
                              borderRadius: '2px 0 0 2px'
                            }
                          }}
                        >
                          <Typography variant="body2" sx={{
                            color: 'text.secondary',
                            fontSize: '0.8125rem',
                            lineHeight: 1.6,
                            fontStyle: 'italic'
                          }}>
                            "{evt.description}"
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
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
