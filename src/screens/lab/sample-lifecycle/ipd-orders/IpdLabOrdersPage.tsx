"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  Alert,
  Tooltip,
} from "@/src/ui/components/atoms";
import CommonTabs from "@/src/ui/components/molecules/CommonTabs";
import { useTheme, alpha } from "@mui/material";
import {
  LocalHospital as HospitalIcon,
  Science as ScienceIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  ArrowForward as ArrowForwardIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import PageTemplate from "@/src/ui/components/PageTemplate";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import StatTile from "@/src/ui/components/molecules/StatTile";
import { Grid } from "@/src/ui/components/atoms";
import { useAppSelector } from "@/src/store/hooks";
import type { LabSample } from "../../lab-types";
import { useLabStatusConfig } from "../../lab-status-config";
import { useLabTheme } from "../../lab-theme";

import IpdOrdersAlertBanner from "./components/IpdOrdersAlertBanner";
import IpdOrdersKpis from "./components/IpdOrdersKpis";
import IpdOrdersHeader from "./components/IpdOrdersHeader";
import IpdOrdersWorkflowLegend from "./components/IpdOrdersWorkflowLegend";

// ── Helpers ─────────────────────────────────────────────────────────────────
const PRIORITY_COLOR: Record<string, string> = {
  STAT: "#ef4444",
  URGENT: "#f97316",
  NORMAL: "#3b82f6",
  ROUTINE: "#6b7280",
};

function parseIpdNote(notes?: string): {
  ward: string;
  bed: string;
  consultant: string;
  dx: string;
  order: string;
} {
  if (!notes)
    return { ward: "—", bed: "—", consultant: "—", dx: "—", order: "—" };
  const ward = notes.match(/Ward ([^,|]+)/)?.[1]?.trim() ?? "—";
  const bed = notes.match(/Bed ([^\s|,]+)/)?.[1]?.trim() ?? "—";
  const consultant = notes.match(/Consultant:\s*([^|]+)/)?.[1]?.trim() ?? "—";
  const dx = notes.match(/Dx:\s*([^|]+)/)?.[1]?.trim() ?? "—";
  const order = notes.match(/Order:\s*(.+)$/)?.[1]?.trim() ?? "—";
  return { ward, bed, consultant, dx, order };
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function IpdLabOrdersPage() {
  const theme = useTheme();
  const router = useRouter();
  const lab = useLabTheme(theme);
  const { sampleStatus } = useLabStatusConfig();
  const { samples } = useAppSelector((s) => s.lims);

  const [tab, setTab] = React.useState("all");

  // Only show IPD-originated samples (identified by 'WARD-' prefix in client)
  const ipdSamples = React.useMemo(
    () => samples.filter((s) => s.client.startsWith("WARD-")),
    [samples],
  );

  const tabFiltered = React.useMemo(() => {
    if (tab === "pending")
      return ipdSamples.filter((s) => s.status === "registered");
    if (tab === "in_progress")
      return ipdSamples.filter(
        (s) =>
          s.status === "received" ||
          s.status === "assigned" ||
          s.status === "analysed",
      );
    if (tab === "completed")
      return ipdSamples.filter(
        (s) => s.status === "verified" || s.status === "published",
      );
    return ipdSamples;
  }, [ipdSamples, tab]);

  // Stats
  const pending = ipdSamples.filter((s) => s.status === "registered").length;
  const inProgress = ipdSamples.filter(
    (s) =>
      s.status === "received" ||
      s.status === "assigned" ||
      s.status === "analysed",
  ).length;
  const completed = ipdSamples.filter(
    (s) => s.status === "verified" || s.status === "published",
  ).length;
  const statCount = ipdSamples.filter((s) => s.priority === "STAT").length;

  const columns: CommonColumn<LabSample>[] = [
    {
      headerName: "ORDER ID",
      field: "id",
      // width: 160,
      renderCell: (row) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color: "primary.main", cursor: "pointer" }}
        >
          {row.id}
        </Typography>
      ),
    },
    {
      headerName: "PATIENT",
      field: "patient",
      width: 180,
      renderCell: (row) => {
        const { ward, bed } = parseIpdNote(row.notes);
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {row.patient}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {ward} · {bed}
            </Typography>
          </Box>
        );
      },
    },
    {
      headerName: "PRIORITY",
      field: "priority",
      renderCell: (row) => (
        <Chip
          label={row.priority}
          size="small"
          sx={{
            bgcolor: alpha(PRIORITY_COLOR[row.priority] ?? "#6b7280", 0.15),
            color: PRIORITY_COLOR[row.priority] ?? "#6b7280",
            fontWeight: 700,
            fontSize: "0.7rem",
            border: `1px solid ${alpha(
              PRIORITY_COLOR[row.priority] ?? "#6b7280",
              0.35,
            )}`,
          }}
        />
      ),
    },
    {
      headerName: "CONSULTANT",
      field: "notes",
      renderCell: (row) => {
        const { consultant } = parseIpdNote(row.notes);
        return (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {consultant}
          </Typography>
        );
      },
    },
    {
      headerName: "DIAGNOSIS",
      field: "dx",
      // width: 230,
      renderCell: (row) => {
        const { dx } = parseIpdNote(row.notes);
        return (
          <Tooltip title={dx}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                maxWidth: 220,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {dx}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      headerName: "TESTS ORDERED",
      field: "tests",
      // width: 200,
      renderCell: (row) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {row.tests.map((t) => (
            <Chip
              key={t}
              label={t}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                fontSize: "0.68rem",
                fontWeight: 600,
              }}
            />
          ))}
        </Stack>
      ),
    },
    {
      headerName: "SAMPLE TYPE",
      field: "type",
      // width: 110,
      renderCell: (row) => (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor:
                row.type === "Blood"
                  ? "error.main"
                  : row.type === "Urine"
                    ? "warning.main"
                    : row.type === "Serum"
                      ? "info.main"
                      : "text.secondary",
            }}
          />
          <Typography variant="body2">{row.type}</Typography>
        </Stack>
      ),
    },
    {
      headerName: "TIME",
      field: "received",
      // width: 130,
      renderCell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.received?.slice(11) ?? row.date}
        </Typography>
      ),
    },
    {
      headerName: "STATUS",
      field: "status",
      // width: 130,
      renderCell: (row) => {
        const cfg = sampleStatus[row.status];
        return (
          <Chip size="small" label={cfg.label} sx={lab.chipSx(cfg.color)} />
        );
      },
    },
    {
      headerName: "ACTION",
      field: "actions",
      // width: 110,
      renderCell: (row) => (
        <Button
          size="small"
          variant="outlined"
          endIcon={<ArrowForwardIcon />}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/lab/analysis-results?sampleId=${row.id}&tab=entry`);
          }}
          sx={{ fontSize: "0.75rem" }}
        >
          Open
        </Button>
      ),
    },
  ];

  return (
    <PageTemplate
      title="Laboratory"
      subtitle="Inpatient orders arriving from wards & ICU"
      currentPageTitle="IPD Orders"
      fullHeight
    >
      <Stack
        spacing={1.25}
        sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
      >

        <IpdOrdersHeader errorMainColor={theme.palette.error.main} />

        <IpdOrdersAlertBanner statCount={statCount} />

        <IpdOrdersKpis
          totalOrders={ipdSamples.length}
          pending={pending}
          inProgress={inProgress}
          completed={completed}
        />

      
        {/* <Box> */}
          <CommonDataGrid<LabSample>
            rows={tabFiltered}
            columns={columns}
            getRowId={(row) => row.id}
            onRowClick={(row) =>
              router.push(`/lab/analysis-results?sampleId=${row.id}&tab=entry`)
            }
            emptyTitle="No IPD orders match this filter."
            toolbarRight={
              <CommonTabs
                value={tab}
                onChange={(v) => setTab(v)}
                tabs={[
                  { id: "all", label: "All" },
                  {
                    id: "pending",
                    label: (
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <span>Pending (New)</span>
                        {pending > 0 && (
                          <Chip
                            label={pending}
                            size="small"
                            sx={{
                              height: 18,
                              minWidth: 18,
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              bgcolor:
                                tab === "pending"
                                  ? "common.white"
                                  : alpha(theme.palette.primary.main, 0.1),
                              color: "primary.main",
                            }}
                          />
                        )}
                      </Stack>
                    ),
                  },
                  {
                    id: "in_progress",
                    label: (
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <span>In Progress</span>
                        {inProgress > 0 && (
                          <Chip
                            label={inProgress}
                            size="small"
                            sx={{
                              height: 18,
                              minWidth: 18,
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              bgcolor:
                                tab === "in_progress"
                                  ? "common.white"
                                  : alpha(theme.palette.primary.main, 0.1),
                              color: "primary.main",
                            }}
                          />
                        )}
                      </Stack>
                    ),
                  },
                  { id: "completed", label: "Completed" },
                ]}
              />
            }
          />
        {/* </Box> */}

        {/* <IpdOrdersWorkflowLegend cardSx={lab.cardSx} /> */}
      </Stack>
    </PageTemplate>
  );
}
