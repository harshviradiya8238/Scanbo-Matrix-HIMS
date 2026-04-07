import * as React from "react";
import {
  SettingsApplications as ModalityIcon,
  MonitorHeart as StatIcon,
  HourglassEmpty as PendingIcon,
  CheckCircleOutline as CompletedIcon,
  VideoSettings as PacsIcon,
  CalendarMonth as ScheduleIcon,
  Assignment as ReportsIcon,
  ListAlt as WorklistIcon,
  TrendingUp as TrendingIcon,
  NotificationsActive as AlertIcon,
  Science as ScanIcon,
} from "@mui/icons-material";
import { DashboardStats } from "./types";

export const getStatsConfig = (stats: DashboardStats) => [
  {
    label: "Total Studies",
    value: stats.totalStudies.toString(),
    subtitle: "Active studies in pipeline",
    tone: "primary" as const,
    icon: <ScanIcon />,
  },
  {
    label: "Pending Scans",
    value: stats.pendingScans.toString(),
    subtitle: `${stats.urgentOrders} Urgent · ${stats.statOrders} STAT`,
    tone: "warning" as const,
    icon: <PendingIcon />,
  },
  {
    label: "In Progress",
    value: stats.inProgress.toString(),
    subtitle: "Active technologist scans",
    tone: "info" as const,
    icon: <TrendingIcon />,
  },
  {
    label: "Completed",
    value: stats.completedToday.toString(),
    subtitle: "Reports finalized today",
    tone: "success" as const,
    icon: <CompletedIcon />,
  },
  {
    label: "STAT Cases",
    value: stats.statCases.toString().padStart(2, "0"),
    subtitle: "Needs immediate attention",
    tone: "error" as const,
    icon: <StatIcon />,
  },
  {
    label: "Avg. TAT",
    value: "38m",
    subtitle: "Turnaround time today",
    tone: "primary" as const,
    icon: <AlertIcon />,
  },
];

export const getQuickLinks = (theme: any) => [
  {
    label: "Worklist",
    icon: <WorklistIcon />,
    route: "/radiology/worklist",
    color: theme.palette.primary.main,
  },
  {
    label: "Schedule",
    icon: <ScheduleIcon />,
    route: "/radiology/schedule",
    color: "#0B84D0",
  },
  {
    label: "PACS Viewer",
    icon: <PacsIcon />,
    route: "/radiology/pacs-viewer",
    color: "#7c3aed",
  },
  {
    label: "Reports",
    icon: <ReportsIcon />,
    route: "/radiology/reports",
    color: "#059669",
  },
];

export const MODALITIES = ["MRI", "CT", "X-Ray", "Ultrasound"];

export const getModalityColor = (modality: string) => {
  switch (modality) {
    case "MRI":
      return "#3b82f6";
    case "CT":
      return "#10b981";
    case "X-Ray":
      return "#f59e0b";
    case "Ultrasound":
      return "#6366f1";
    default:
      return "#94a3b8";
  }
};
