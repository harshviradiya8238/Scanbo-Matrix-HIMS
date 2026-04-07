"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import {
  Card,
  StatTile,
  WorkspaceHeaderCard,
} from "@/src/ui/components/molecules";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { alpha, useTheme } from "@/src/ui/theme";
import { useAppSelector } from "@/src/store/hooks";
import {
  SettingsApplications as ModalityIcon,
  MonitorHeart as StatIcon,
  HourglassEmpty as PendingIcon,
  CheckCircleOutline as CompletedIcon,
  VideoSettings as PacsIcon,
  CalendarMonth as ScheduleIcon,
  Assignment as ReportsIcon,
  ListAlt as WorklistIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingIcon,
  NotificationsActive as AlertIcon,
  ArrowForward as ArrowForwardIcon,
  Science as ScanIcon,
} from "@mui/icons-material";

// ── COMPONENTS ──────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>
      {action}
    </Box>
  );
}

export default function RadiologyDashboard() {
  const theme = useTheme();
  const router = useRouter();

  // Real data from Redux
  const orders = useAppSelector((state) => state.radiology.orders);
  const worklist = useAppSelector((state) => state.radiology.worklist);
  const reading = useAppSelector((state) => state.radiology.reading);

  // Derived Stats
  const totalStudies = orders.length + worklist.length + reading.length;
  const pendingScans = orders.filter(
    (o) =>
      o.validationState === "Ready" ||
      o.validationState === "Needs Clinical Review",
  ).length;
  const inProgress = worklist.filter((w) => w.state === "In Progress").length;
  const completedToday = reading.filter(
    (r) => r.state === "Final Signed",
  ).length;
  const statCases = [...orders, ...worklist, ...reading].filter(
    (item) => item.priority === "STAT",
  ).length;

  const stats = [
    {
      label: "Total Studies",
      value: totalStudies.toString(),
      subtitle: "Active studies in pipeline",
      tone: "primary" as const,
      icon: <ScanIcon />,
    },
    {
      label: "Pending Scans",
      value: pendingScans.toString(),
      subtitle: `${orders.filter((o) => o.priority === "Urgent").length} Urgent · ${orders.filter((o) => o.priority === "STAT").length} STAT`,
      tone: "warning" as const,
      icon: <PendingIcon />,
    },
    {
      label: "In Progress",
      value: inProgress.toString(),
      subtitle: "Active technologist scans",
      tone: "info" as const,
      icon: <TrendingIcon />,
    },
    {
      label: "Completed",
      value: completedToday.toString(),
      subtitle: "Reports finalized today",
      tone: "success" as const,
      icon: <CompletedIcon />,
    },
    {
      label: "STAT Cases",
      value: statCases.toString().padStart(2, "0"),
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

  const quickLinks = [
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

  // Calculate modality distribution
  const allItems = [...orders, ...worklist, ...reading];
  const modalities = ["MRI", "CT", "X-Ray", "Ultrasound"];
  const modalityBreakdown = modalities.map((mod) => ({
    label: mod,
    count: allItems.filter((item) => item.modality.includes(mod)).length,
    color:
      mod === "MRI"
        ? "#3b82f6"
        : mod === "CT"
          ? "#10b981"
          : mod === "X-Ray"
            ? "#f59e0b"
            : "#6366f1",
  }));

  // Combine recent activity from all lists
  const recentActivity = [
    ...reading.map((r) => ({
      id: r.id,
      patient: r.patientName,
      study: r.study,
      status: r.state,
      priority: r.priority,
      time: "Recently Updated",
    })),
    ...worklist.map((w) => ({
      id: w.id,
      patient: w.patientName,
      study: w.study,
      status: w.state,
      priority: w.priority,
      time: "Scheduled",
    })),
  ].slice(0, 5);

  return (
    <PageTemplate title="Radiology Dashboard">
      <Stack spacing={1.25}>
        {/* HEADER AREA */}
        <WorkspaceHeaderCard sx={{ p: 2.5, borderRadius: '22px' }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: "primary.main",
                }}
              >
                <ModalityIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Welcome back, Radiology Lead
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {" · "}
                  Center: MG Road Diagnostics
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<WorklistIcon />}
                onClick={() => router.push("/radiology/worklist")}
                sx={{ borderRadius: 2 }}
              >
                Worklist
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ScheduleIcon />}
                onClick={() => router.push("/radiology/schedule")}
                sx={{ borderRadius: 2 }}
              >
                Calendar
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<PacsIcon />}
                onClick={() => router.push("/radiology/pacs-viewer")}
                sx={{ borderRadius: 2, boxShadow: "none" }}
              >
                Launch PACS
              </Button>
            </Stack>
          </Box>
        </WorkspaceHeaderCard>

        {/* KPI STRIP */}
        <Grid container spacing={2}>
          {stats.map((stat) => (
            <Grid key={stat.label} item xs={12} sm={6} md={4} lg={2}>
              <StatTile
                label={stat.label}
                value={stat.value}
                subtitle={stat.subtitle}
                tone={stat.tone}
                icon={stat.icon}
                variant="soft"
              />
            </Grid>
          ))}
        </Grid>

        {/* QUICK ACCESS & MODALITY BREAKDOWN */}
        <Grid container spacing={2}>
          {/* Quick Access */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2.5, height: "100%", borderRadius: 3 }}>
              <SectionHeader
                icon={<WorklistIcon sx={{ fontSize: 20 }} />}
                title="Quick Access"
              />
              <Grid container spacing={2}>
                {quickLinks.map((link) => (
                  <Grid key={link.label} item xs={6} sm={3}>
                    <Box
                      onClick={() => router.push(link.route)}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1.5,
                        p: 2.5,
                        borderRadius: 3,
                        cursor: "pointer",
                        bgcolor: alpha(link.color, 0.05),
                        border: `1px solid ${alpha(link.color, 0.1)}`,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          transform: "translateY(-6px)",
                          bgcolor: alpha(link.color, 0.1),
                          boxShadow: `0 8px 24px ${alpha(link.color, 0.15)}`,
                          borderColor: alpha(link.color, 0.3),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: alpha(link.color, 0.15),
                          color: link.color,
                          transition: "all 0.3s",
                        }}
                      >
                        {React.cloneElement(link.icon as React.ReactElement, {
                          sx: { fontSize: 24 },
                        })}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          fontSize: "0.75rem",
                        }}
                      >
                        {link.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Grid>

          {/* Modality Breakdown */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2.5, height: "100%", borderRadius: 3 }}>
              <SectionHeader
                icon={<ScanIcon sx={{ fontSize: 20 }} />}
                title="Modality Distribution"
              />
              <Grid container spacing={1.5}>
                {modalityBreakdown.map((mb) => (
                  <Grid key={mb.label} item xs={12} sm={6} md={3}>
                    <StatTile
                      label={mb.label}
                      value={mb.count.toString().padStart(2, "0")}
                      subtitle={`${totalStudies > 0 ? Math.round((mb.count / totalStudies) * 100) : 0}% of total studies`}
                      tone={
                        mb.label === "MRI"
                          ? "primary"
                          : mb.label === "CT"
                            ? "success"
                            : mb.label === "X-Ray"
                              ? "warning"
                              : "info"
                      }
                      variant="soft"
                      sx={{
                        height: "100%",
                        "& .MuiTypography-h4": {
                          fontSize: "1.5rem",
                          fontWeight: 900,
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Grid>
        </Grid>

        {/* RECENT ACTIVITY & SYSTEM ALERTS */}
        <Grid container spacing={2}>
          {/* Recent Activity */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <SectionHeader
                icon={<HistoryIcon sx={{ fontSize: 20 }} />}
                title="Recent Study Activity"
                action={
                  <Button
                    size="small"
                    variant="text"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => router.push("/radiology/worklist")}
                    sx={{ borderRadius: 1.5 }}
                  >
                    View All
                  </Button>
                }
              />
              <Stack spacing={1.5}>
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <Box
                      key={activity.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                        },
                      }}
                    >
                      <Box
                        sx={{ display: "flex", gap: 2, alignItems: "center" }}
                      >
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            fontSize: 14,
                            fontWeight: 700,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: "primary.main",
                            borderRadius: "12px",
                          }}
                        >
                          {activity.patient
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </Avatar>
                        <Box>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700 }}
                            >
                              {activity.patient}
                            </Typography>
                            <Chip
                              label={activity.priority}
                              size="small"
                              color={
                                activity.priority === "STAT"
                                  ? "error"
                                  : activity.priority === "Urgent"
                                    ? "warning"
                                    : "default"
                              }
                              sx={{
                                height: 18,
                                fontSize: 9,
                                fontWeight: 800,
                                borderRadius: 1,
                              }}
                            />
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {activity.id} · {activity.study}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: alpha(
                              activity.status === "In Progress" ||
                                activity.status === "Queued"
                                ? theme.palette.info.main
                                : theme.palette.success.main,
                              0.1,
                            ),
                            color:
                              activity.status === "In Progress" ||
                              activity.status === "Queued"
                                ? "info.main"
                                : "success.main",
                          }}
                        >
                          {activity.status}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 0.5 }}
                        >
                          {activity.time}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 4, textAlign: "center" }}
                  >
                    No recent activity to show.
                  </Typography>
                )}
              </Stack>
            </Card>
          </Grid>

          {/* System Alerts */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.error.main, 0.01),
                border: "1px solid",
                borderColor: alpha(theme.palette.error.main, 0.1),
                height: "100%",
              }}
            >
              <SectionHeader
                icon={<AlertIcon sx={{ fontSize: 20, color: "error.main" }} />}
                title="System Alerts"
              />
              <Stack spacing={2}>
                {[
                  {
                    type: "Equipment",
                    msg: "MRI-01 requires calibration in 2 days.",
                    sev: "warning",
                  },
                  {
                    type: "STAT",
                    msg: `${statCases} STAT cases pending across modalities.`,
                    sev: "error",
                  },
                  {
                    type: "Reports",
                    msg: `${reading.filter((r) => r.state === "Unread").length} reports awaiting signature.`,
                    sev: "info",
                  },
                ].map((alert, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor:
                        alert.sev === "error"
                          ? alpha(theme.palette.error.main, 0.08)
                          : alert.sev === "warning"
                            ? alpha(theme.palette.warning.main, 0.08)
                            : alpha(theme.palette.info.main, 0.08),
                    }}
                  >
                    {alert.sev === "error" ? (
                      <WarningIcon color="error" sx={{ fontSize: 20 }} />
                    ) : (
                      <AlertIcon
                        color={alert.sev as any}
                        sx={{ fontSize: 20 }}
                      />
                    )}
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 800,
                          textTransform: "uppercase",
                          fontSize: "0.65rem",
                        }}
                        color={alert.sev as any}
                      >
                        {alert.type}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: 13, fontWeight: 500, mt: 0.25 }}
                      >
                        {alert.msg}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 3, borderRadius: 2, borderColor: "divider" }}
                size="small"
              >
                View All Notifications
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </PageTemplate>
  );
}

function HistoryIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
