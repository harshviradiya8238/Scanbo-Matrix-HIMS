"use client";

import * as React from "react";
import { Box, Card, Stack, Typography, LinearProgress, Grid } from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  Notifications as NotificationsIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import { LAB_FEED_ITEMS, DETECTION_SOURCES } from "../utils/infection-control-data";
import { InfectionCase } from "@/src/mocks/infection-control";

interface DetectTabContentProps {
  rows: InfectionCase[];
  columns: CommonColumn<InfectionCase>[];
  onRowClick: (row: InfectionCase) => void;
}

export default function DetectTabContent({
  rows,
  columns,
  onRowClick,
}: DetectTabContentProps) {
  const theme = useTheme();

  return (
    <Grid container spacing={2} sx={{ flex: 1, minHeight: 0, height: "100%" }}>
      {/* ── Main Column ──────────────────────────────────── */}
      <Grid item xs={12} lg={8.5} sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <CommonDataGrid<InfectionCase>
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          showSerialNo={true}
          searchPlaceholder="Search detected cases..."
          searchFields={["patientName", "mrn", "organism"]}
          onRowClick={onRowClick}
          disableRowPointer={true}
        />
      </Grid>
      {/* ── Sidebar Column ───────────────────────────────── */}
      <Grid
        item
        xs={12}
        lg={3.5}
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          height: "100%",
        }}
      >
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          {/* Lab Feed Card */}
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.12),
              boxShadow: "0 10px 30px rgba(10, 77, 104, 0.06)",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              flex: 1,
            }}
          >
            <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
              {/* Header */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    p: 0.75,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    display: "flex",
                  }}
                >
                  <NotificationsIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Lab Feed (Auto-Flag)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Real-time LIS integration
                  </Typography>
                </Box>
              </Stack>

              {/* Scrollable Container */}
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  pr: 1,
                  "&::-webkit-scrollbar": {
                    width: 6,
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    borderRadius: 3,
                  },
                }}
              >
                <Stack spacing={1.5}>
                  {LAB_FEED_ITEMS.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor:
                          item.status === "pending"
                            ? alpha(theme.palette.error.main, 0.3)
                            : item.status === "auto-flagged"
                              ? alpha(theme.palette.warning.main, 0.3)
                              : item.status === "no-pathogen"
                                ? alpha(theme.palette.success.main, 0.3)
                                : alpha(theme.palette.grey[400], 0.2),
                        bgcolor:
                          item.status === "pending"
                            ? alpha(theme.palette.error.main, 0.04)
                            : item.status === "auto-flagged"
                              ? alpha(theme.palette.warning.main, 0.04)
                              : item.status === "no-pathogen"
                                ? alpha(theme.palette.success.main, 0.04)
                                : alpha(theme.palette.grey[500], 0.02),
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.2s",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, mb: 0.25 }}
                      >
                        {item.title}
                      </Typography>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          {item.patient}
                          {item.bed ? ` • ${item.bed}` : ""}
                        </Typography>
                      </Stack>

                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mt: 0.5,
                          fontWeight: 700,
                          color:
                            item.status === "pending" ||
                              item.status === "pending-cultures"
                              ? "error.main"
                              : item.status === "auto-flagged"
                                ? "warning.dark"
                                : item.status === "no-pathogen"
                                  ? "success.main"
                                  : "text.secondary",
                        }}
                      >
                        {item.status === "pending"
                          ? "Action required immediately"
                          : item.status === "auto-flagged"
                            ? "Auto-flagged for review"
                            : item.status === "no-pathogen"
                              ? "No pathogen detected"
                              : item.status === "pending-cultures"
                                ? "Culture in progress"
                                : item.patient}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Card>

          {/* Detection Sources Card */}

        </Stack>
      </Grid>
    </Grid>
  );
}