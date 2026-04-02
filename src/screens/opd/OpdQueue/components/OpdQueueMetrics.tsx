"use client";

import * as React from "react";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import {
  AssignmentInd as AssignmentIndIcon,
  Bolt as BoltIcon,
  History as HistoryIcon,
  LocalHospital as LocalHospitalIcon,
} from "@mui/icons-material";
import { IpdMetricCard } from "@/src/screens/ipd/components/ipd-ui";
import { OpdQueueData } from "../utils/opd-queue-types";

interface OpdQueueMetricsProps {
  data: OpdQueueData;
}

export function OpdQueueMetrics({ data }: OpdQueueMetricsProps) {
  const {
    appointments,
    waitingCount,
    emergencyCount,
    inProgressCount,
    queue,
    completedCount,
    averageWaitMinutes,
  } = data;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} lg={3}>
        <IpdMetricCard
          label="Patients Today"
          value={appointments.length}
          trend={`${averageWaitMinutes} min avg wait`}
          tone="info"
          icon={<AssignmentIndIcon sx={{ fontSize: 28 }} />}
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <IpdMetricCard
          label="In Queue"
          value={waitingCount}
          trend={`${emergencyCount} emergency cases`}
          tone="warning"
          icon={<BoltIcon sx={{ fontSize: 28 }} />}
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <IpdMetricCard
          label="In Consultation"
          value={inProgressCount}
          trend={`${queue.length} active encounter(s)`}
          tone="primary"
          icon={<LocalHospitalIcon sx={{ fontSize: 28 }} />}
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={3}>
        <IpdMetricCard
          label="Completed"
          value={completedCount}
          trend="Visits closed today"
          tone="success"
          icon={<HistoryIcon sx={{ fontSize: 28 }} />}
        />
      </Grid>
    </Grid>
  );
}
