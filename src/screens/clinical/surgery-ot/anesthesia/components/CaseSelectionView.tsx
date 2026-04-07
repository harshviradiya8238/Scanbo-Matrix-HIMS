import * as React from "react";
import { Box, Typography, Stack, Button } from "@/src/ui/components/atoms";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import { StatTile, WorkspaceHeaderCard } from "@/src/ui/components/molecules";
import { EnterpriseStatusChip } from "@/src/screens/clinical/components/EnterpriseUi";
import { alpha } from "@/src/ui/theme";
import { WorklistCase, WorklistFilter } from "../types";
import { UI_THEME, FILTER_OPTIONS } from "../constants";
import { statusTone } from "../utils";

export function CaseSelectionView({
  query,
  setQuery,
  filter,
  setFilter,
  allCases,
  cases,
  onOpenOrBoard,
  onOpenUrgentCase,
  onSelect,
}: {
  query: string;
  setQuery: (value: string) => void;
  filter: WorklistFilter;
  setFilter: (value: WorklistFilter) => void;
  allCases: WorklistCase[];
  cases: WorklistCase[];
  onOpenOrBoard: () => void;
  onOpenUrgentCase: () => void;
  onSelect: (caseId: string) => void;
}) {
  const statusCounts = React.useMemo(
    () => ({
      all: allCases.length,
      inOr: allCases.filter((item) => item.status === "In OR").length,
      preOp: allCases.filter((item) => item.status === "Pre-Op").length,
      pacu: allCases.filter((item) => item.status === "PACU").length,
      scheduled: allCases.filter((item) => item.status === "Scheduled").length,
    }),
    [allCases],
  );

  const columns = React.useMemo<CommonColumn<WorklistCase>[]>(
    () => [
      { field: "room", headerName: "OR", width: 90 },
      {
        field: "scheduledAt",
        headerName: "Time",
        width: 96,
        renderCell: (item) => (
          <Typography
            sx={{
              fontFamily: '"DM Mono","SFMono-Regular",Consolas,monospace',
              fontWeight: 700,
            }}
          >
            {item.scheduledAt}
          </Typography>
        ),
      },
      {
        field: "patientName",
        headerName: "Patient",
        width: 230,
        renderCell: (item) => (
          <Stack spacing={0.2}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {item.patientName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.mrn} · {item.ageGender}
            </Typography>
          </Stack>
        ),
      },
      { field: "procedure", headerName: "Procedure", width: 280 },
      { field: "surgeon", headerName: "Surgeon", width: 170 },
      { field: "asaClass", headerName: "ASA", width: 100 },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        renderCell: (item) => (
          <EnterpriseStatusChip
            label={item.status}
            tone={statusTone(item.status)}
          />
        ),
      },
      {
        field: "actions",
        headerName: "Action",
        width: 190,
        align: "right",
        renderCell: (item) => (
          <Button
            size="small"
            variant="contained"
            onClick={(event) => {
              event.stopPropagation();
              onSelect(item.id);
            }}
            sx={{ backgroundColor: "primary.main" }}
          >
            Open Workspace
          </Button>
        ),
      },
    ],
    [onSelect],
  );

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: 1.1,
        overflow: "hidden",
      }}
    >
      <WorkspaceHeaderCard
        sx={{
          p: 1.5,
          backgroundColor: alpha(UI_THEME.primary, 0.08),
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", lg: "center" }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{ color: "primary.main", fontWeight: 800 }}
            >
              Anesthesia Worklist Selection
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a patient from OT list and open the complete anesthesia
              workspace.
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.8} flexWrap="wrap">
            <Button
              variant="outlined"
              size="small"
              sx={{ borderColor: "divider" }}
              onClick={onOpenOrBoard}
            >
              OR Board
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{ backgroundColor: "primary.main" }}
              onClick={onOpenUrgentCase}
            >
              Add Urgent Case
            </Button>
          </Stack>
        </Stack>
      </WorkspaceHeaderCard>

      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0,1fr))",
            lg: "repeat(5, minmax(0,1fr))",
          },
        }}
      >
        <StatTile
          label="Total Cases"
          value={statusCounts.all}
          subtitle="OT queue"
          tone="primary"
        />
        <StatTile
          label="In OR"
          value={statusCounts.inOr}
          subtitle="Live cases"
          tone="warning"
        />
        <StatTile
          label="Pre-Op"
          value={statusCounts.preOp}
          subtitle="Readying"
          tone="secondary"
        />
        <StatTile
          label="PACU"
          value={statusCounts.pacu}
          subtitle="Recovery"
          tone="success"
        />
        <StatTile
          label="Scheduled"
          value={statusCounts.scheduled}
          subtitle="Upcoming"
          tone="info"
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <CommonDataGrid<WorklistCase>
          rows={cases}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={(row) => onSelect(row.id)}
          externalSearchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search by MRN, patient name, procedure, room..."
          searchFields={[
            "patientName",
            "mrn",
            "procedure",
            "room",
            "surgeon",
            "asaClass",
          ]}
          defaultRowsPerPage={5}
          rowsPerPageOptions={[5, 10]}
          emptyTitle="No matching OT cases"
          emptyDescription="Try another search or status filter."
          toolbarRight={
            <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
              {FILTER_OPTIONS.map((item) => (
                <Button
                  key={item.value}
                  size="small"
                  variant={filter === item.value ? "contained" : "outlined"}
                  onClick={() => setFilter(item.value)}
                  sx={
                    filter === item.value
                      ? { backgroundColor: "primary.main" }
                      : { borderColor: "divider", color: "text.secondary" }
                  }
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          }
        />
      </Box>
    </Box>
  );
}
