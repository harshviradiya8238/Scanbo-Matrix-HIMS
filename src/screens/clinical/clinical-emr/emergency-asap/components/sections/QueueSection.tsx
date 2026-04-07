"use client";

import * as React from "react";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from "@/src/ui/components/atoms";
import {
  Search as SearchIcon,
  ViewList as ViewListIcon,
  Dashboard as DashboardIcon,
  PersonAddAlt1 as PersonAddAlt1Icon,
  Bed as BedIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import {
  type EmergencyPatient,
  type TriageLevel,
  type ArrivalMode,
  type PatientStatus,
  type QueueViewMode,
  type EmergencyPageId,
} from "../../types";
import { TRIAGE_META } from "../../AsapEmergencyData";

interface QueueSectionProps {
  queueFilter: "ALL" | TriageLevel;
  setQueueFilter: (filter: "ALL" | TriageLevel) => void;
  sortedQueueRows: EmergencyPatient[];
  arrivalColumns: CommonColumn<EmergencyPatient>[];
  queueView: QueueViewMode;
  setQueueView: (mode: QueueViewMode) => void;
  queueDoctorOptions: string[];
  queueDoctorFilter: "ALL" | string;
  setQueueDoctorFilter: (value: "ALL" | string) => void;
  queueStatusFilter: "ALL" | PatientStatus;
  setQueueStatusFilter: (value: "ALL" | PatientStatus) => void;
  queueArrivalFilter: "ALL" | ArrivalMode;
  setQueueArrivalFilter: (value: "ALL" | ArrivalMode) => void;
  queueSearch: string;
  setQueueSearch: (value: string) => void;
  queueKanbanColumns: Array<{ level: TriageLevel; rows: EmergencyPatient[] }>;
  activePage: EmergencyPageId;
  openTriageAssessment: (patientId: string) => void;
  openAssignBedModal: (patientId: string) => void;
  handleOpenPatientChart: (patientId: string) => void;
  availableBedsLength: number;
  openRegistrationModal: () => void;
}

export function QueueSection({
  queueFilter,
  setQueueFilter,
  sortedQueueRows,
  arrivalColumns,
  queueView,
  setQueueView,
  queueDoctorOptions,
  queueDoctorFilter,
  setQueueDoctorFilter,
  queueStatusFilter,
  setQueueStatusFilter,
  queueArrivalFilter,
  setQueueArrivalFilter,
  queueSearch,
  setQueueSearch,
  queueKanbanColumns,
  activePage,
  openTriageAssessment,
  openAssignBedModal,
  handleOpenPatientChart,
  availableBedsLength,
  openRegistrationModal,
}: QueueSectionProps) {
  const theme = useTheme();

  return (
    <Stack spacing={2}>
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: 2,
          // border: "1px solid",
          // borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <TextField
              size="small"
              placeholder="Search patients..."
              value={queueSearch}
              onChange={(event) => setQueueSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 260 }}
            />

            <TextField
              size="small"
              value={queueStatusFilter}
              onChange={(event) =>
                setQueueStatusFilter(
                  event.target.value as "ALL" | PatientStatus,
                )
              }
              select
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              {(
                [
                  "Waiting",
                  "In Treatment",
                  "Observation",
                  "Ready for Disposition",
                ] as PatientStatus[]
              ).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              value={queueArrivalFilter}
              onChange={(event) =>
                setQueueArrivalFilter(event.target.value as "ALL" | ArrivalMode)
              }
              select
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="ALL">All Arrival</MenuItem>
              {(
                ["Ambulance", "Walk-in", "Referral", "Police"] as ArrivalMode[]
              ).map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {mode}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              value={queueDoctorFilter}
              onChange={(event) => setQueueDoctorFilter(event.target.value)}
              select
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="ALL">All Doctors</MenuItem>
              {queueDoctorOptions.map((doctor: string) => (
                <MenuItem key={doctor} value={doctor}>
                  {doctor}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Paper
              elevation={0}
              sx={{
                p: 0.5,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                borderRadius: 2,
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.08),
              }}
            >
              <Button
                size="small"
                variant={queueView === "table" ? "contained" : "text"}
                onClick={() => setQueueView("table")}
                startIcon={<ViewListIcon />}
                disabled={queueView === "table"} // The image shows active without hover state, but contained gives a good indication. Let's keep toggle functionality.
                disableElevation
                sx={{
                  borderRadius: 1.5,
                  px: 2,
                  py: 0.5,
                  fontWeight: 600,
                  ...(queueView !== "table" && {
                    color: "text.secondary",
                    "&:hover": { bgcolor: "action.hover" },
                  }),
                }}
              >
                Table
              </Button>
              <Button
                size="small"
                variant={queueView === "kanban" ? "contained" : "text"}
                onClick={() => setQueueView("kanban")}
                startIcon={<DashboardIcon />}
                disableElevation
                sx={{
                  borderRadius: 1.5,
                  px: 2,
                  py: 0.5,
                  fontWeight: 600,
                  ...(queueView !== "kanban" && {
                    color: "text.secondary",
                    "&:hover": { bgcolor: "action.hover" },
                  }),
                }}
              >
                Kanban
              </Button>
            </Paper>

            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddAlt1Icon />}
              onClick={openRegistrationModal}
              disableElevation
              sx={{
                px: 2.5,
                py: 0.875,
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              Register Patient
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box>
        {queueView === "table" ? (
          <CommonDataGrid<EmergencyPatient>
            rows={sortedQueueRows}
            columns={arrivalColumns}
            getRowId={(row) => row.id}
            hideToolbar
            tableHeight={600}
            emptyTitle="No queue rows found for the selected filter."
          />
        ) : (
          <Box sx={{ overflowX: "auto", pb: 0.5 }}>
            <Stack direction="row" spacing={2} sx={{ minWidth: 1200 }}>
              {queueKanbanColumns.map((column) => (
                <Box
                  key={column.level}
                  sx={{ flex: 1, minWidth: 280, maxWidth: 320 }}
                >
                  <Stack spacing={1.5}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 4,
                            height: 16,
                            bgcolor: TRIAGE_META[column.level].accent,
                            borderRadius: 1,
                          }}
                        />
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 800, color: "text.primary" }}
                        >
                          {column.level}
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          minWidth: 20,
                          height: 20,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid",
                          borderColor: alpha(
                            TRIAGE_META[column.level].accent,
                            0.3,
                          ),
                          bgcolor: alpha(TRIAGE_META[column.level].accent, 0.1),
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            fontSize: 11,
                            color: TRIAGE_META[column.level].accent,
                            lineHeight: 1,
                          }}
                        >
                          {column.rows.length}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack spacing={1.25} sx={{ px: 0.5 }}>
                      {column.rows.map((row) => (
                        <Paper
                          key={row.id}
                          elevation={0}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: alpha(
                              TRIAGE_META[column.level].accent,
                              0.3,
                            ),
                            bgcolor: alpha(
                              TRIAGE_META[column.level].accent,
                              0.02,
                            ),
                          }}
                        >
                          <Stack spacing={1.5}>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700, color: "text.primary" }}
                              >
                                {row.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {row.id} · {row.mrn}
                              </Typography>
                            </Box>

                            <Stack spacing={0.5}>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <BedIcon
                                  sx={{ fontSize: 16, color: "text.secondary" }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "text.secondary",
                                    fontWeight: 500,
                                  }}
                                >
                                  Bed: {row.assignedBed || "Not Assigned"}
                                </Typography>
                              </Stack>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <FavoriteBorderIcon
                                  sx={{ fontSize: 16, color: "text.secondary" }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "text.secondary",
                                    fontWeight: 500,
                                  }}
                                >
                                  Dr: {row.assignedDoctor || "Not Assigned"}
                                </Typography>
                              </Stack>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <TimelineIcon
                                  sx={{
                                    fontSize: 16,
                                    color: theme.palette.success.main,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: theme.palette.success.main,
                                    fontWeight: 700,
                                  }}
                                >
                                  Wait: {row.waitingMinutes} min
                                </Typography>
                              </Stack>
                            </Stack>

                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => openTriageAssessment(row.id)}
                                disabled={activePage !== "triage"}
                                sx={{
                                  flex: 1,
                                  color: "primary.main",
                                  borderColor: "divider",
                                }}
                              >
                                Triage
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                disabled={availableBedsLength === 0}
                                onClick={() => openAssignBedModal(row.id)}
                                sx={{
                                  flex: 1,
                                  color: "primary.main",
                                  borderColor: "divider",
                                }}
                              >
                                Assign
                              </Button>
                              <IconButton
                                size="small"
                                sx={{
                                  border: "1px solid",
                                  borderColor: "divider",
                                  borderRadius: 1,
                                }}
                                onClick={() => handleOpenPatientChart(row.id)}
                              >
                                <TimelineIcon
                                  fontSize="small"
                                  sx={{ color: "primary.main" }}
                                />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </Stack>
  );
}
