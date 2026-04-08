import * as React from "react";
import { Grid } from "@/src/ui/components/atoms";
import StatTile from "@/src/ui/components/molecules/StatTile";
import {
  LocalHospital as HospitalIcon,
  Science as ScienceIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
} from "@mui/icons-material";

export interface IpdOrdersKpisProps {
  totalOrders: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export default function IpdOrdersKpis({
  totalOrders,
  pending,
  inProgress,
  completed,
}: IpdOrdersKpisProps) {
  return (
    <Grid container spacing={1.5}>
      {[
        {
          label: "Total IPD Orders",
          value: totalOrders,
          subtitle: "All active inpatient orders",
          tone: "primary" as const,
          icon: <HospitalIcon sx={{ fontSize: 26 }} />,
        },
        {
          label: "Pending Receipt",
          value: pending,
          subtitle: "Registered, not yet received",
          tone: "warning" as const,
          icon: <PendingIcon sx={{ fontSize: 26 }} />,
        },
        {
          label: "In Progress",
          value: inProgress,
          subtitle: "Received / Assigned / Analysed",
          tone: "info" as const,
          icon: <ScienceIcon sx={{ fontSize: 26 }} />,
        },
        {
          label: "Completed",
          value: completed,
          subtitle: "Verified or published",
          tone: "success" as const,
          icon: <CheckCircleIcon sx={{ fontSize: 26 }} />,
        },
      ].map((kpi) => (
        <Grid key={kpi.label} item xs={6} sm={3}>
          <StatTile
            label={kpi.label}
            value={kpi.value}
            subtitle={kpi.subtitle}
            tone={kpi.tone}
            icon={kpi.icon}
            variant="soft"
          />
        </Grid>
      ))}
    </Grid>
  );
}
