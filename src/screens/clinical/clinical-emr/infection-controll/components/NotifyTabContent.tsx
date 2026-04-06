"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Paper,
  Stack,
  Typography,
  Grid,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import { NOTIFICATION_FEED, SEND_TO_OPTIONS } from "../utils/infection-control-data";

interface NotifyTabContentProps {
  sendToChannels: Record<string, boolean>;
  setSendToChannels: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  canWrite: boolean;
}

export default function NotifyTabContent({
  sendToChannels,
  setSendToChannels,
  canWrite,
}: NotifyTabContentProps) {
  const theme = useTheme();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={9.5}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.14),
            overflow: "hidden",
            boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
          }}
        >
          <Stack spacing={1.25} sx={{ p: 1.75 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              flexWrap="wrap"
              gap={1}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Notification Feed
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<SendIcon />}
                disabled={!canWrite}
                onClick={() => {}}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: "warning.main",
                  "&:hover": { bgcolor: "warning.dark" },
                }}
              >
                Send Notification
              </Button>
            </Stack>
            <Stack divider={<Divider />} spacing={0}>
              {NOTIFICATION_FEED.map((item) => (
                <Stack
                  key={item.id}
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ py: 1.25 }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                    sx={{ flex: 1, minWidth: 0 }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        bgcolor:
                          item.type === "critical"
                            ? alpha(theme.palette.error.main, 0.12)
                            : item.type === "exposure" ||
                                item.type === "lab-ready"
                              ? alpha(theme.palette.warning.main, 0.12)
                              : item.type === "acknowledged"
                                ? alpha(theme.palette.grey[500], 0.12)
                                : "transparent",
                      }}
                    >
                      {item.type === "critical" && (
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: "error.main",
                          }}
                        />
                      )}
                      {item.type === "exposure" && (
                        <WarningAmberIcon
                          sx={{ fontSize: 18, color: "warning.main" }}
                        />
                      )}
                      {item.type === "acknowledged" && (
                        <CheckCircleIcon
                          sx={{ fontSize: 18, color: "success.main" }}
                        />
                      )}
                      {item.type === "lab-ready" && (
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: 0.5,
                            bgcolor: alpha(
                              theme.palette.warning.main,
                              0.5,
                            ),
                          }}
                        />
                      )}
                    </Box>
                    <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.body}
                      </Typography>
                      {item.actionLabel && (
                        <Typography
                          component="button"
                          variant="body2"
                          sx={{
                            color: "primary.main",
                            fontWeight: 600,
                            textDecoration: "underline",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            p: 0,
                            alignSelf: "flex-start",
                          }}
                          onClick={() => {}}
                        >
                          {item.actionLabel}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ flexShrink: 0 }}
                  >
                    {item.timestamp}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Paper>
      </Grid>
      <Grid item xs={12} lg={2.5}>
        <Card
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.14),
            boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
          }}
        >
          <Stack spacing={1.25}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <SendIcon sx={{ fontSize: 18, color: "primary.main" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Send To
              </Typography>
            </Stack>
            {SEND_TO_OPTIONS.map((item) => (
              <Stack
                key={item.id}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ py: 0.25 }}
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
                />
                <Typography variant="body2">{item.label}</Typography>
              </Stack>
            ))}
            <Button
              variant="contained"
              fullWidth
              startIcon={<SendIcon />}
              disabled={!canWrite}
              onClick={() => {}}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                mt: 0.5,
                bgcolor: "warning.main",
                "&:hover": { bgcolor: "warning.dark" },
              }}
            >
              Configure & Send
            </Button>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}