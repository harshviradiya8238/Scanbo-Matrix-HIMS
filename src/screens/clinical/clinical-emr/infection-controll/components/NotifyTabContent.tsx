"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  Stack,
  Typography,
  Grid,
} from "@/src/ui/components/atoms";
import { CommonDialog } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckCircle as CheckCircleIcon,
  FiberManualRecord as DotIcon,
  FlashOn as FlashOnIcon,
  History as HistoryIcon,
  NotificationsActive as NotificationsActiveIcon,
  Science as ScienceIcon,
  Send as SendIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import { SEND_TO_OPTIONS } from "../utils/infection-control-data";
import { type NotificationFeedItem } from "../utils/infection-control-types";

interface NotifyTabContentProps {
  casesTableBlock: React.ReactNode;
  canWrite: boolean;
  notifications: NotificationFeedItem[];
  onAddNotification: (notif: NotificationFeedItem) => void;
  onAcknowledgeNotification?: (id: string) => void;
}

const TYPE_CONFIG: Record<
  NotificationFeedItem["type"],
  { icon: React.ReactNode; color: string; label: string }
> = {
  critical: {
    icon: <DotIcon sx={{ fontSize: 14 }} />,
    color: "#E53935",
    label: "Critical",
  },
  exposure: {
    icon: <WarningAmberIcon sx={{ fontSize: 14 }} />,
    color: "#FB8C00",
    label: "Exposure",
  },
  acknowledged: {
    icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
    color: "#43A047",
    label: "Acknowledged",
  },
  "lab-ready": {
    icon: <ScienceIcon sx={{ fontSize: 14 }} />,
    color: "#1E88E5",
    label: "Lab Ready",
  },
};

export default function NotifyTabContent({
  casesTableBlock,
  canWrite,
  notifications,
  onAddNotification,
  onAcknowledgeNotification,
}: NotifyTabContentProps) {
  const theme = useTheme();
  const [selectedNotif, setSelectedNotif] =
    React.useState<NotificationFeedItem | null>(null);
  const [localAcknowledged, setLocalAcknowledged] = React.useState<
    Set<string>
  >(new Set());

  const [sendToChannels, setSendToChannels] = React.useState<
    Record<string, boolean>
  >(
    SEND_TO_OPTIONS.reduce(
      (acc, item) => ({ ...acc, [item.id]: item.checked }),
      {},
    ),
  );

  const selectedChannels = SEND_TO_OPTIONS.filter(
    (opt) => sendToChannels[opt.id],
  );

  const handleBroadcast = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const channelNames = selectedChannels.map((c) => c.label).join(", ");
    const broadcast: NotificationFeedItem = {
      id: `nf-manual-${Date.now()}`,
      type: "exposure",
      title: `Manual Broadcast — ${channelNames}`,
      body: `Infection control alert sent to ${selectedChannels.length} channel${selectedChannels.length !== 1 ? "s" : ""}. All relevant staff have been notified.`,
      actionLabel: "View Log",
      timestamp: timeStr,
    };
    onAddNotification(broadcast);
  };

  // Live badge counts by type
  const typeCounts = React.useMemo(
    () =>
      notifications.reduce(
        (acc, n) => {
          acc[n.type] = (acc[n.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [notifications],
  );

  return (
    <Grid container spacing={2}>
      {/* ── Main Column ──────────────────────────────────── */}
      <Grid item xs={12} lg={8.5}>
        <Stack spacing={2}>
          {/* {casesTableBlock} */}

          {/* Notification Feed Card */}
          <Box
            sx={{
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                px: 2.5,
                py: 1.75,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <NotificationsActiveIcon
                  sx={{ color: "primary.main", fontSize: 20 }}
                />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Notification Feed
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notifications.length} notification
                    {notifications.length !== 1 ? "s" : ""} · Updates in
                    real-time
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                {/* Type badges */}
                {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
                  const count = typeCounts[type] ?? 0;
                  if (!count) return null;
                  return (
                    <Chip
                      key={type}
                      size="small"
                      label={count}
                      icon={
                        <Box sx={{ color: cfg.color, display: "flex" }}>
                          {cfg.icon}
                        </Box>
                      }
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        bgcolor: alpha(cfg.color, 0.1),
                        color: cfg.color,
                        border: `1px solid ${alpha(cfg.color, 0.25)}`,
                        height: 24,
                        "& .MuiChip-icon": { ml: 0.5 },
                      }}
                    />
                  );
                })}
              </Stack>
            </Stack>

            {/* Feed Items */}
            {notifications.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <NotificationsActiveIcon
                  sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  No notifications yet. Move a case to "Notify" to generate
                  alerts.
                </Typography>
              </Box>
            ) : (
              <Stack divider={<Divider />} spacing={0}>
                {notifications.map((item, idx) => {
                  const cfg = TYPE_CONFIG[item.type];
                  const isNew = item.id.startsWith("nf-live-") || item.id.startsWith("nf-manual-");
                  return (
                    <Stack
                      key={item.id}
                      direction="row"
                      spacing={2}
                      alignItems="flex-start"
                      sx={{
                        px: 2.5,
                        py: 1.75,
                        transition: "background 0.2s",
                        bgcolor: isNew && idx === 0
                          ? alpha(cfg.color, 0.04)
                          : "transparent",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.03),
                        },
                      }}
                    >
                      {/* Icon */}
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: "10px",
                          display: "grid",
                          placeItems: "center",
                          bgcolor: alpha(cfg.color, 0.1),
                          color: cfg.color,
                          flexShrink: 0,
                          mt: 0.25,
                        }}
                      >
                        {cfg.icon}
                      </Box>

                      {/* Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mb: 0.25 }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700 }}
                          >
                            {item.title}
                          </Typography>
                          {isNew && idx === 0 && (
                            <Chip
                              label="NEW"
                              size="small"
                              icon={
                                <FlashOnIcon sx={{ fontSize: 12 }} />
                              }
                              sx={{
                                height: 18,
                                fontSize: "0.6rem",
                                fontWeight: 800,
                                bgcolor: alpha(cfg.color, 0.15),
                                color: cfg.color,
                                "& .MuiChip-icon": { color: cfg.color, ml: 0.5 },
                              }}
                            />
                          )}
                        </Stack>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ lineHeight: 1.5 }}
                        >
                          {item.body}
                        </Typography>
                        {item.actionLabel && (
                          <Typography
                            component="button"
                            variant="caption"
                            sx={{
                              mt: 0.5,
                              color: "primary.main",
                              fontWeight: 700,
                              textDecoration: "underline",
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                              p: 0,
                              display: "block",
                            }}
                            onClick={() => setSelectedNotif(item)}
                          >
                            {item.actionLabel} →
                          </Typography>
                        )}
                      </Box>

                      {/* Timestamp + type badge */}
                      <Stack
                        spacing={0.5}
                        alignItems="flex-end"
                        sx={{ flexShrink: 0 }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {item.timestamp}
                        </Typography>
                        <Chip
                          size="small"
                          label={cfg.label}
                          sx={{
                            height: 18,
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            bgcolor: alpha(cfg.color, 0.1),
                            color: cfg.color,
                          }}
                        />
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Stack>
      </Grid>

      {/* ── Send To Panel ─────────────────────────────────── */}
      <Grid item xs={12} lg={3.5}>
        <Card
          elevation={0}
          sx={{
            p: 2,
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
            position: "sticky",
            top: 16,
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <SendIcon sx={{ fontSize: 18, color: "primary.main" }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Send To
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Choose notification channels
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={0.5}>
              {SEND_TO_OPTIONS.map((item) => (
                <Stack
                  key={item.id}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    py: 0.75,
                    px: 1,
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                  onClick={() =>
                    setSendToChannels((prev) => ({
                      ...prev,
                      [item.id]: !prev[item.id],
                    }))
                  }
                >
                  <Checkbox
                    checked={sendToChannels[item.id] ?? item.checked}
                    onChange={(_, checked) =>
                      setSendToChannels((prev) => ({
                        ...prev,
                        [item.id]: checked,
                      }))
                    }
                    icon={<CheckBoxOutlineBlankIcon />}
                    checkedIcon={
                      <CheckBoxIcon sx={{ color: "primary.main" }} />
                    }
                    sx={{ p: 0.25 }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {item.label}
                  </Typography>
                  {sendToChannels[item.id] && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                      }}
                    />
                  )}
                </Stack>
              ))}
            </Stack>

            {/* Selected count */}
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: "10px",
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.15),
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {selectedChannels.length} channel
                {selectedChannels.length !== 1 ? "s" : ""} selected
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "primary.main", fontWeight: 600 }}
              >
                {selectedChannels.map((c) => c.label).join(" · ") || "None"}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              startIcon={<SendIcon />}
              disabled={!canWrite || selectedChannels.length === 0}
              onClick={handleBroadcast}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "10px",
                bgcolor: "#8E24AA",
                "&:hover": { bgcolor: "#6A1B9A" },
                "&:disabled": { opacity: 0.5 },
              }}
            >
              Broadcast Alert
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              Broadcasts appear instantly in the Notification Feed
            </Typography>
          </Stack>
        </Card>
      </Grid>
      {/* ── Notification Detail Dialog ──────────────────── */}
      {selectedNotif && (() => {
        const cfg = TYPE_CONFIG[selectedNotif.type];
        const isAcknowledged =
          selectedNotif.type === "acknowledged" ||
          localAcknowledged.has(selectedNotif.id);

        return (
          <CommonDialog
            open={Boolean(selectedNotif)}
            onClose={() => setSelectedNotif(null)}
            title="Notification Log"
            subtitle={selectedNotif.title}
            maxWidth="sm"
            fullWidth
            icon={
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(cfg.color, 0.12),
                  color: cfg.color,
                }}
              >
                <HistoryIcon sx={{ fontSize: 22 }} />
              </Box>
            }
            content={
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                {/* Status banner */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: alpha(cfg.color, 0.25),
                    bgcolor: alpha(cfg.color, 0.05),
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: alpha(cfg.color, 0.15),
                        color: cfg.color,
                        flexShrink: 0,
                      }}
                    >
                      {cfg.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Chip
                          label={cfg.label}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.65rem",
                            bgcolor: alpha(cfg.color, 0.15),
                            color: cfg.color,
                          }}
                        />
                        {isAcknowledged && (
                          <Chip
                            label="Acknowledged"
                            size="small"
                            icon={<CheckCircleIcon sx={{ fontSize: 12 }} />}
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.65rem",
                              bgcolor: alpha("#43A047", 0.1),
                              color: "#43A047",
                              "& .MuiChip-icon": { color: "#43A047" },
                            }}
                          />
                        )}
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedNotif.body}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Log metadata */}
                <Stack spacing={1}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Log Details
                  </Typography>
                  {[
                    { label: "Timestamp", value: selectedNotif.timestamp },
                    { label: "Notification ID", value: selectedNotif.id },
                    { label: "Priority", value: cfg.label },
                    {
                      label: "Status",
                      value: isAcknowledged ? "Acknowledged" : "Pending Action",
                    },
                  ].map((row) => (
                    <Stack
                      key={row.label}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        py: 0.75,
                        px: 1.5,
                        borderRadius: "8px",
                        bgcolor: alpha(theme.palette.divider, 0.3),
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {row.label}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {row.value}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                {/* Channels */}
                <Stack spacing={1}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Sent Via
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {SEND_TO_OPTIONS.filter((opt) => opt.checked).map((opt) => (
                      <Chip
                        key={opt.id}
                        size="small"
                        label={opt.label}
                        icon={<CheckCircleIcon sx={{ fontSize: 12 }} />}
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.72rem",
                          bgcolor: alpha(theme.palette.success.main, 0.08),
                          color: "success.dark",
                          border: "1px solid",
                          borderColor: alpha(theme.palette.success.main, 0.25),
                          "& .MuiChip-icon": { color: "success.main" },
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            }
            actions={
              <Stack direction="row" spacing={1.5} sx={{ width: "100%", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => setSelectedNotif(null)}
                  sx={{ textTransform: "none", fontWeight: 600, borderRadius: "8px" }}
                >
                  Close
                </Button>
                {!isAcknowledged && (
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    disabled={!canWrite}
                    onClick={() => {
                      setLocalAcknowledged((prev) => {
                        const next = new Set(prev);
                        next.add(selectedNotif.id);
                        return next;
                      });
                      onAcknowledgeNotification?.(selectedNotif.id);
                      setSelectedNotif(null);
                    }}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "8px",
                      bgcolor: "#43A047",
                      "&:hover": { bgcolor: "#2E7D32" },
                    }}
                  >
                    Mark as Acknowledged
                  </Button>
                )}
              </Stack>
            }
          />
        );
      })()}
    </Grid>
  );
}
