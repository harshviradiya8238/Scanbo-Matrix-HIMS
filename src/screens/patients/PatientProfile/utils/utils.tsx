import * as React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { AppointmentStatus } from "@/src/screens/opd/opd-mock-data";

export const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "—";

export const formatLongDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "—";

export const buildDateTime = (date: string, time: string) =>
  new Date(`${date}T${time}:00`);

export const appointmentStatusTone: Record<
  AppointmentStatus,
  "default" | "info" | "warning" | "success" | "error"
> = {
  Pending: "default",
  Scheduled: "info",
  "Checked-In": "success",
  "In Triage": "warning",
  "In Consultation": "warning",
  Completed: "success",
  "No Show": "error",
  Cancelled: "error",
};

export const formatFrequency = (value: string) => {
  switch (value) {
    case "BD":
      return "Twice daily";
    case "OD":
      return "Once daily";
    case "HS":
      return "At bedtime";
    case "SOS":
      return "As needed";
    default:
      return value;
  }
};

export interface InfoRowProps {
  label: string;
  value?: React.ReactNode;
}

export const InfoRow = ({ label, value }: InfoRowProps) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{
      py: 1,
      borderBottom: "1px solid",
      borderColor: "rgba(15, 23, 42, 0.06)",
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right" }}>
      {value ?? "—"}
    </Typography>
  </Stack>
);

export interface TabPanelProps {
  value: string;
  tab: string;
  children: React.ReactNode;
}

export const TabPanel = ({ value, tab, children }: TabPanelProps) =>
  value === tab ? <Box sx={{ mt: 0 }}>{children}</Box> : null;

/* Sparkline chart — same as patient-portal lab reports */
export function Sparkline({
  values,
  color,
  width = 700,
  height = 90,
  id = "vital",
}: {
  values: number[];
  color: string;
  width?: number;
  height?: number;
  id?: string;
}) {
  if (values.length < 2) return null;
  const pad = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x, y] as [number, number];
  });
  const d = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const fillPts = [
    ...pts,
    [pts[pts.length - 1][0], height],
    [pts[0][0], height],
  ];
  const fill =
    fillPts
      .map(
        ([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`,
      )
      .join(" ") + "Z";
  const gradId = `vital-spark-grad-${id}`;
  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block", overflow: "visible", minWidth: 200 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0.01} />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${gradId})`} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === pts.length - 1 ? 5 : 3}
          fill={i === pts.length - 1 ? color : "#fff"}
          stroke={color}
          strokeWidth={i === pts.length - 1 ? 0 : 2}
        />
      ))}
    </svg>
  );
}
