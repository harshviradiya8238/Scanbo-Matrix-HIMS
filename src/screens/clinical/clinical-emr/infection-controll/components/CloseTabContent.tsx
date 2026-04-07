"use client";

import * as React from "react";
import {
  Box,
  Card,
  Checkbox,
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
  HealthAndSafety as HealthAndSafetyIcon,
  Notifications as NotificationsIcon,
  PushPin as PushPinIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { CLOSURE_CRITERIA, CASE_TIMELINE_EVENTS } from "../utils/infection-control-data";

interface CloseTabContentProps {
  casesTableBlock: React.ReactNode;
}

export default function CloseTabContent({ casesTableBlock }: CloseTabContentProps) {
  const theme = useTheme();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={9.5}>
        <Stack spacing={1.5} sx={{ flex: 1 }}>
          {casesTableBlock}
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
              <Box
                sx={{
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 1 }}
                >
                  CLOSURE CRITERIA — SNEHA PATIL
                </Typography>
                <Stack spacing={0.75}>
                  {CLOSURE_CRITERIA.map((item) =>
                    item.met ? (
                      <Stack
                        key={item.id}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                          py: 0.75,
                          px: 1.25,
                          borderRadius: 1.5,
                          bgcolor: alpha(
                            theme.palette.success.main,
                            0.08,
                          ),
                          border: "1px solid",
                          borderColor: alpha(
                            theme.palette.success.main,
                            0.25,
                          ),
                        }}
                      >
                        <CheckCircleIcon
                          sx={{ fontSize: 18, color: "success.main" }}
                        />
                        <Typography variant="body2">
                          {item.label}
                        </Typography>
                      </Stack>
                    ) : (
                      <Stack
                        key={item.id}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ py: 0.75, px: 1 }}
                      >
                        <Checkbox
                          checked={false}
                          onChange={(_, checked) => {}}
                          icon={<CheckBoxOutlineBlankIcon />}
                          checkedIcon={
                            <CheckBoxIcon
                              sx={{ color: "success.main" }}
                            />
                          }
                          sx={{ p: 0.25 }}
                        />
                        <Typography variant="body2">
                          {item.label}
                        </Typography>
                      </Stack>
                    ),
                  )}
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Stack>
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
              <PushPinIcon sx={{ fontSize: 18, color: "error.main" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Case Timeline — Sneha Patil
              </Typography>
            </Stack>
            {CASE_TIMELINE_EVENTS.map((evt) => (
              <Stack
                key={evt.id}
                direction="row"
                spacing={1}
                alignItems="flex-start"
                sx={{
                  py: 1,
                  px: 1,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    flexShrink: 0,
                  }}
                >
                  {evt.iconColor === "success.main" ? (
                    <CheckCircleIcon
                      sx={{ fontSize: 18, color: "success.main" }}
                    />
                  ) : evt.iconColor === "error.main" ? (
                    <HealthAndSafetyIcon
                      sx={{ fontSize: 18, color: "error.main" }}
                    />
                  ) : evt.iconColor === "warning.main" ? (
                    <NotificationsIcon
                      sx={{ fontSize: 18, color: "warning.main" }}
                    />
                  ) : (
                    <SearchIcon
                      sx={{ fontSize: 18, color: "info.main" }}
                    />
                  )}
                </Box>
                <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {evt.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {evt.date}
                    {evt.source ? ` · ${evt.source}` : ""}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {evt.description}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}