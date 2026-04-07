"use client";

import * as React from "react";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import { StatTile } from "@/src/ui/components/molecules";
import {
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Bed as BedIcon,
  MonitorHeart as MonitorHeartIcon,
  PersonAddAlt1 as PersonAddAlt1Icon,
  Timeline as TimelineIcon,
  ViewList as ViewListIcon,
} from "@mui/icons-material";
import {
  EmergencyPageId,
  EmergencyPatient,
  EmergencyBed,
  TriageLevel,
  PatientStatus,
  QueueViewMode,
  BedBoardFilter,
  OrderForm,
} from "../../types";
import { TriageBadge } from "../shared";

interface DashboardSectionProps {
  dashboardMetrics: {
    totalPatients: number;
    criticalPatients: number;
    waitingPatients: number;
    availableBeds: number;
    bedOccupancyPercent: number;
    avgWaitMinutes: number;
    doorToDocMinutes: number;
  };
  bedOccupancy: {
    free: number;
    occupied: number;
    cleaning: number;
    critical: number;
  };
  bedsLength: number;
  sortedQueueRows: EmergencyPatient[];
  arrivalColumns: CommonColumn<EmergencyPatient>[];
  availableBedsLength: number;
  setRegistrationModalOpen: (open: boolean) => void;
  setActivePage: (page: EmergencyPageId) => void;
  openTriageAssessment: (patientId: string) => void;
  openAssignBedModal: (patientId: string) => void;
  handleOpenPatientChart: (patientId: string) => void;
  activePage: EmergencyPageId;
}

export function DashboardSection({
  dashboardMetrics,
  bedOccupancy,
  bedsLength,
  sortedQueueRows,
  arrivalColumns,
  availableBedsLength,
  setRegistrationModalOpen,
  setActivePage,
  openTriageAssessment,
  openAssignBedModal,
  handleOpenPatientChart,
  activePage,
}: DashboardSectionProps) {
  const theme = useTheme();

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatTile
            label="Critical Patients"
            value={dashboardMetrics.criticalPatients}
            subtitle="Highest acuity cases"
            icon={<MonitorHeartIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatTile
            label="In Queue"
            value={dashboardMetrics.waitingPatients}
            subtitle={`Avg wait ${dashboardMetrics.avgWaitMinutes} min`}
            icon={<ViewListIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatTile
            label="Bed Occupancy"
            value={`${dashboardMetrics.bedOccupancyPercent}%`}
            subtitle={`${bedOccupancy.occupied + bedOccupancy.critical}/${bedsLength} occupied`}
            icon={<BedIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatTile
            label="Discharged Today"
            value={31}
            subtitle="Shift cumulative"
            icon={<AssignmentTurnedInIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatTile
            label="Staff On Duty"
            value={`${14}`}
            subtitle="6 MD · 8 RN"
            icon={<PersonAddAlt1Icon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatTile
            label="Door-to-Doc"
            value={`${dashboardMetrics.doorToDocMinutes}m`}
            subtitle="Operational average"
            icon={<TimelineIcon />}
          />
        </Grid>
      </Grid>

      {/* <Card elevation={0} sx={{ p: 0, borderRadius: 0, border: "none" }}> */}
      <Stack spacing={2}>
        {sortedQueueRows.length === 0 ? (
          <Stack spacing={1.25} alignItems="flex-start">
            <Typography variant="body2" color="text.secondary">
              No emergency arrivals yet for this shift.
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddAlt1Icon />}
              onClick={() => setRegistrationModalOpen(true)}
            >
              Register First Patient
            </Button>
          </Stack>
        ) : (
          <CommonDataGrid<EmergencyPatient>
            rows={sortedQueueRows.slice(0, 8)}
            columns={arrivalColumns}
            getRowId={(row) => row.id}
            searchPlaceholder="Search patients..."
            searchFields={["name", "mrn", "id"]}
            tableHeight={550}
            toolbarRight={
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PersonAddAlt1Icon />}
                  onClick={() => setRegistrationModalOpen(true)}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  New Arrival
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setActivePage("triage")}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  View All
                </Button>
              </Stack>
            }
          />
        )}
      </Stack>
      {/* </Card> */}
    </Stack>
  );
}
