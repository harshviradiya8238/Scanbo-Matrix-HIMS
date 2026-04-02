"use client";

import * as React from "react";
import { Grid } from "@/src/ui/components/layout";
import { WorkspaceHeaderCard, StatTile } from "@/src/ui/components/molecules";
import {
  People as PeopleIcon,
  Bed as BedIcon,
  Timer as TimerIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { IpdAdmissionsData } from "../utils/ipd-admissions-types";

interface IpdAdmissionsMetricsProps {
  data: IpdAdmissionsData;
}

export function IpdAdmissionsMetrics({ data }: IpdAdmissionsMetricsProps) {
  const { allPatients, queueRows } = data;

  const admittedCount = allPatients.length;
  const pendingAdmissionCount = queueRows.filter(
    (r) => r.stage === "Pending Admission",
  ).length;
  const bedPendingCount = queueRows.filter(
    (r) => r.stage === "Bed Pending",
  ).length;
  const emergencyCount = queueRows.filter(
    (r) => r.priority === "Urgent",
  ).length;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <StatTile
          label="Admitted Today"
          value={String(admittedCount)}
          icon={<PeopleIcon />}
          tone="success"
          subtitle="+4 since morning"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatTile
          label="Pending Admissions"
          value={String(pendingAdmissionCount)}
          icon={<AssignmentIcon />}
          tone="warning"
          subtitle="Next 1 hour"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatTile
          label="Bed Allocation"
          value={String(bedPendingCount)}
          icon={<BedIcon />}
          tone="info"
          subtitle="Available: 8"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatTile
          label="Priority Cases"
          value={String(emergencyCount)}
          icon={<TimerIcon />}
          tone="error"
          subtitle="Immediate attention"
        />
      </Grid>
    </Grid>
  );
}
