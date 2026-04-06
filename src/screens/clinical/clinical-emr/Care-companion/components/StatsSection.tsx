import * as React from "react";
import { Box } from "@/src/ui/components/atoms";
import { StatTile } from "@/src/ui/components/molecules";
import {
  CalendarToday as CalendarTodayIcon,
  CheckCircle as CheckCircleIcon,
  Group as GroupIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import type { EnrolledPatient } from "../utils/types";

interface StatsSectionProps {
  patients: EnrolledPatient[];
}

export default function StatsSection({ patients }: StatsSectionProps) {
  const activePatients = patients.filter((p) => p.status !== "closed");
  const highRiskCount = patients.filter((p) => p.status === "high_risk").length;
  const adherenceAvg = Math.round(
    activePatients.reduce((a, p) => a + p.adherence, 0) /
      Math.max(1, activePatients.length),
  );

  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.5,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        },
      }}
    >
      <StatTile
        label="Total Enrolled"
        value={patients.length.toString()}
        subtitle="Active care plans · +12%"
        tone="primary"
        icon={<GroupIcon sx={{ fontSize: 22 }} />}
      />
      <StatTile
        label="High-Risk Alerts"
        value={highRiskCount}
        subtitle="BP / Sugar out of range"
        tone="primary"
        icon={<WarningAmberIcon sx={{ fontSize: 22 }} />}
      />
      <StatTile
        label="Adherence Rate"
        value={`${adherenceAvg}%`}
        subtitle="Medicines + check-ins · +4%"
        tone="primary"
        icon={<CheckCircleIcon sx={{ fontSize: 22 }} />}
      />
      <StatTile
        label="Upcoming Reviews"
        value="9"
        subtitle="Scheduled for today"
        tone="primary"
        icon={<CalendarTodayIcon sx={{ fontSize: 22 }} />}
      />
    </Box>
  );
}
