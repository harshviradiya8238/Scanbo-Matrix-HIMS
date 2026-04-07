import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import { AppointmentEvent } from "../schedule.types";
import { RESOURCES, STATUS_META } from "../schedule.types";
import { UNSCHEDULED, isSameDate } from "../schedule.data";

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({
  events,
  onUnscheduledBook,
  selectedResourceId,
  setSelectedResourceId,
}: {
  events: AppointmentEvent[];
  onUnscheduledBook: (u: (typeof UNSCHEDULED)[0]) => void;
  selectedResourceId: string | null;
  setSelectedResourceId: (id: string | null) => void;
}) {
  const theme = useTheme();
  const today = new Date();
  const todayEvts = events.filter((e) => {
    const d = new Date(e.start);
    return isSameDate(d, today);
  });
  const total = todayEvts.length;
  const done = todayEvts.filter(
    (e) => e.extendedProps.status === "done",
  ).length;
  const stat = todayEvts.filter(
    (e) =>
      e.extendedProps.priority === "STAT" ||
      e.extendedProps.status === "urgent",
  ).length;

  return (
    <Box
      sx={{
        width: 272,
        flexShrink: 0,
        borderRight: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography
          variant="subtitle2"
          fontWeight={800}
          color="text.primary"
          sx={{ mb: 1.5 }}
        >
          Today's Summary
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
          {[
            { label: "Total", value: total, bg: "#eff6ff", color: "#1d4ed8" },
            { label: "Done", value: done, bg: "#f0fdf4", color: "#15803d" },
            {
              label: "Pending",
              value: total - done,
              bg: "#fffbeb",
              color: "#b45309",
            },
            { label: "STAT", value: stat, bg: "#fff1f2", color: "#b91c1c" },
          ].map(({ label, value, bg, color }) => (
            <Box
              key={label}
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: bg,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color }}>
                {value}
              </Typography>
              <Typography sx={{ fontSize: "0.65rem", color, fontWeight: 700 }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          sx={{ px: 2, py: 1.5, display: "block", textTransform: "uppercase" }}
        >
          Testing Rooms
        </Typography>
        <Stack spacing={0}>
          {RESOURCES.map((r) => (
            <Box
              key={r.id}
              onClick={() =>
                setSelectedResourceId(selectedResourceId === r.id ? null : r.id)
              }
              sx={{
                py: 1.25,
                px: 2,
                cursor: "pointer",
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor:
                  selectedResourceId === r.id
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
                borderLeft:
                  selectedResourceId === r.id
                    ? `3px solid ${theme.palette.primary.main}`
                    : "3px solid transparent",
                "&:hover": {
                  bgcolor:
                    selectedResourceId === r.id
                      ? alpha(theme.palette.primary.main, 0.12)
                      : alpha(theme.palette.primary.main, 0.04),
                },
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    borderRadius: 1.5,
                  }}
                >
                  {r.id === "xray" ? "XR" : r.id === "ct1" ? "CT" : "US"}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                    {r.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {todayEvts.filter((e) => e.resourceId === r.id).length}{" "}
                    appts
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.warning.main, 0.02),
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "warning.main",
            }}
          />
          <Typography
            variant="caption"
            fontWeight={800}
            color="warning.main"
            sx={{ textTransform: "uppercase" }}
          >
            Unscheduled ({UNSCHEDULED.length})
          </Typography>
        </Stack>
        <Stack spacing={1}>
          {UNSCHEDULED.map((u) => (
            <Box
              key={u.id}
              sx={{
                p: 1.25,
                borderRadius: 2,
                border: "1px solid",
                borderColor: alpha(theme.palette.warning.main, 0.3),
                bgcolor: "background.paper",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
              }}
            >
              <Typography
                sx={{ fontWeight: 700, fontSize: "0.75rem", mb: 0.25 }}
              >
                {u.patientName}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1 }}
              >
                {u.study}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                color="warning"
                fullWidth
                onClick={() => onUnscheduledBook(u)}
                sx={{
                  py: 0.4,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 1.5,
                }}
              >
                Schedule Now
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
