"use client";

import * as React from "react";
import { Box, Card, Stack, Typography, LinearProgress, Grid } from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  Notifications as NotificationsIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
} from "@mui/icons-material";
import { LAB_FEED_ITEMS, DETECTION_SOURCES } from "../utils/infection-control-data";

interface DetectTabContentProps {
  casesTableBlock: React.ReactNode;
}

export default function DetectTabContent({ casesTableBlock }: DetectTabContentProps) {
  const theme = useTheme();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={9.5}>
        {casesTableBlock}
      </Grid>
      <Grid item xs={12} lg={2.5}>
        <Stack spacing={1.5}>
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
                <NotificationsIcon
                  sx={{ fontSize: 18, color: "primary.main" }}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Lab Feed (Auto-Flag)
                </Typography>
              </Stack>
              {LAB_FEED_ITEMS.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    border: "2px solid",
                    borderColor:
                      item.status === "pending"
                        ? "error.main"
                        : item.status === "auto-flagged"
                          ? "warning.main"
                          : item.status === "no-pathogen"
                            ? "success.main"
                            : "grey.400",
                    bgcolor:
                      item.status === "pending"
                        ? alpha(theme.palette.error.main, 0.04)
                        : item.status === "auto-flagged"
                          ? alpha(theme.palette.warning.main, 0.04)
                          : item.status === "no-pathogen"
                            ? alpha(theme.palette.success.main, 0.04)
                            : alpha(theme.palette.grey[500], 0.04),
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.patient}
                    {item.bed ? ` - ${item.bed}` : ""}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.25,
                      color:
                        item.status === "pending"
                          ? "error.main"
                          : item.status === "auto-flagged"
                            ? "warning.dark"
                            : "text.secondary",
                    }}
                  >
                    {item.status === "pending"
                      ? "Pending action"
                      : item.status === "auto-flagged"
                        ? "Auto-flagged."
                        : item.status === "no-pathogen"
                          ? "No pathogen."
                          : item.patient}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>
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
                <AssignmentTurnedInIcon
                  sx={{ fontSize: 18, color: "primary.main" }}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Detection Sources
                </Typography>
              </Stack>
              {DETECTION_SOURCES.map((src) => (
                <Box key={src.id}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 0.5 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {src.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {src.count}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={
                      src.id === "ds-1" ? 50 : src.id === "ds-2" ? 27 : 23
                    }
                    sx={{
                      height: 6,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      "& .MuiLinearProgress-bar": {
                        bgcolor: src.color,
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );
}