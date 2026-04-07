import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { Card } from "@/src/ui/components/molecules";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  ArrowForward as ArrowForwardIcon,
  NotificationsActive as AlertIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { RecentActivityItem } from "../types";

import SectionHeader from "./SectionHeader";

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

interface ActivitySectionProps {
  recentActivity: RecentActivityItem[];
  systemAlerts: Array<{ type: string; msg: string; sev: string }>;
}

export default function ActivitySection({
  recentActivity,
  systemAlerts,
}: ActivitySectionProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
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
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
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
                        .map((n: string) => n[0])
                        .join("")}
                    </Avatar>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
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
            {systemAlerts.map((alert, i) => (
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
                  <AlertIcon color={alert.sev as any} sx={{ fontSize: 20 }} />
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
  );
}
