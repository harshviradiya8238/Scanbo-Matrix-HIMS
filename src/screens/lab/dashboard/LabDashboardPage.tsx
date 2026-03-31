"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Box,
  Chip,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@/src/ui/components/atoms";
import { useTheme } from "@mui/material";
import { Grid } from "@/src/ui/components/atoms";
import StatTile from "@/src/ui/components/molecules/StatTile";
import { useAppSelector } from "@/src/store/hooks";
import { useLabStatusConfig } from "../lab-status-config";
import { useLabTheme, LAB_CARD_BORDER_RADIUS } from "../lab-theme";
import type { LabWorksheet } from "../lab-types";
import {
  Science as ScienceIcon,
  PlaylistAddCheck as ChecklistIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircleOutline as CheckCircleIcon,
  Storefront as StorefrontIcon,
  Inventory2 as InventoryIcon,
  Assessment as AssessmentIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";

function worksheetProgress(
  w: LabWorksheet,
  results: { sampleId: string; status: string }[],
): number {
  if (w.samples.length === 0) return 0;
  const sampleIds = new Set(w.samples);
  const relevant = results.filter((r) => sampleIds.has(r.sampleId));
  if (relevant.length === 0) return 0;
  const verified = relevant.filter((r) => r.status === "verified").length;
  return Math.round((verified / relevant.length) * 100);
}

export default function LabDashboardPage() {
  const theme = useTheme();
  const router = useRouter();
  const lab = useLabTheme(theme);
  const { sampleStatus, instrumentStatus } = useLabStatusConfig();
  const { samples, worksheets, results, instruments, clients, inventory } =
    useAppSelector((state) => state.lims);

  const pendingAnalysis = samples.filter(
    (s) => s.status === "received" || s.status === "assigned",
  ).length;
  const resultsPending = samples.filter((s) => s.status === "analysed").length;
  const publishedToday = samples.filter((s) => s.status === "published").length;
  const activeClients = clients.filter((c) => c.active).length;
  const toVerify = worksheets.filter(
    (w) => w.status === "to_be_verified",
  ).length;
  const lowStock = inventory.filter(
    (item) => item.onHand <= item.reorderLevel,
  ).length;

  return (
    <PageTemplate
      title="Laboratory"
      subtitle={new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      })}
      currentPageTitle="Dashboard"
    >
      <Stack spacing={2}>
        {/* ══════════════════════════════════════════════════════════════════
              KPI STRIP — Laboratory Stats
          ══════════════════════════════════════════════════════════════════ */}
        <Grid container spacing={1.5}>
          {[
            {
              label: "Total Samples",
              value: samples.length,
              subtitle: `${pendingAnalysis} pending analysis`,
              tone: "primary" as const,
              icon: <ScienceIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Pending Analysis",
              value: pendingAnalysis,
              subtitle: "Received or assigned status",
              tone: "warning" as const,
              icon: <ChecklistIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Results Pending",
              value: resultsPending,
              subtitle: "Analysed, awaiting finalization",
              tone: "error" as const,
              icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Published Today",
              value: publishedToday,
              subtitle: "Ready for client delivery",
              tone: "success" as const,
              icon: <CheckCircleIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Active Clients",
              value: activeClients,
              subtitle: `${clients.length} total registered`,
              tone: "info" as const,
              icon: <StorefrontIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Worksheets",
              value: worksheets.length,
              subtitle: `${toVerify} pending verification`,
              tone: "primary" as const,
              icon: <InventoryIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "To Verify",
              value: toVerify,
              subtitle: "Awaiting validation",
              tone: "warning" as const,
              icon: <AssessmentIcon sx={{ fontSize: 28 }} />,
            },
            {
              label: "Low Stock Items",
              value: lowStock,
              subtitle: "Below reorder threshold",
              tone: lowStock > 0 ? ("error" as const) : ("success" as const),
              icon: <WarningAmberIcon sx={{ fontSize: 28 }} />,
            },
          ].map((kpi) => (
            <Grid key={kpi.label} item xs={6} sm={4} md={3}>
              <StatTile
                label={kpi.label}
                value={kpi.value}
                subtitle={kpi.subtitle}
                tone={kpi.tone}
                icon={kpi.icon}
                variant="soft"
              />
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          }}
        >
          <Box sx={lab.cardSx}>
            <Box sx={{ px: 2, pt: 2, pb: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                Recent samples
              </Typography>
            </Box>
            <TableContainer sx={lab.tableContainerSx}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...samples]
                    .reverse()
                    .slice(0, 6)
                    .map((s) => {
                      const cfg = sampleStatus[s.status];
                      return (
                        <TableRow
                          key={s.id}
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => router.push(`/lab/samples?id=${s.id}`)}
                        >
                          <TableCell
                            sx={{ fontWeight: 600, color: "primary.main" }}
                          >
                            {s.id}
                          </TableCell>
                          <TableCell>{s.patient}</TableCell>
                          <TableCell>{s.type}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={cfg.label}
                              sx={lab.chipSx(cfg.color)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box sx={lab.cardSx}>
            <Box sx={{ px: 2, pt: 2, pb: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                Worksheets
              </Typography>
            </Box>
            <Stack spacing={1.5} sx={{ px: 2, pb: 2 }}>
              {worksheets.slice(0, 4).map((w) => {
                const progress = worksheetProgress(w, results);
                return (
                  <Box
                    key={w.id}
                    onClick={() => router.push(`/lab/worksheets?id=${w.id}`)}
                    sx={{
                      p: 1.25,
                      borderRadius: LAB_CARD_BORDER_RADIUS,
                      border: "1px solid",
                      borderColor: "divider",
                      cursor: "pointer",
                      "&:hover": { bgcolor: lab.softSurface },
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {w.id}
                      </Typography>
                      <Chip
                        size="small"
                        label={
                          w.status === "open"
                            ? "Open"
                            : w.status === "to_be_verified"
                              ? "To verify"
                              : w.status === "verified"
                                ? "Verified"
                                : "Closed"
                        }
                        color={
                          w.status === "to_be_verified"
                            ? "warning"
                            : w.status === "open"
                              ? "info"
                              : w.status === "verified"
                                ? "success"
                                : "default"
                        }
                        sx={{ fontWeight: 600 }}
                      />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ height: 6, borderRadius: 1 }}
                      color={progress === 100 ? "success" : "primary"}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      {w.analyst} · {w.samples.length} samples
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Box>

        <Box sx={lab.cardSx}>
          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Typography
              variant="overline"
              sx={{
                color: "primary.main",
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              Instruments
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              px: 2,
              pb: 2,
            }}
          >
            {instruments.map((inst) => {
              const cfg = instrumentStatus[inst.status];
              return (
                <Box
                  key={inst.id}
                  sx={{
                    p: 1.5,
                    borderRadius: LAB_CARD_BORDER_RADIUS,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {inst.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {inst.dept}
                  </Typography>
                  <Chip
                    size="small"
                    label={cfg.label}
                    sx={{ ...lab.chipSx(cfg.color), mt: 1 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    Calib: {inst.nextCalib}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Stack>
    </PageTemplate>
  );
}
