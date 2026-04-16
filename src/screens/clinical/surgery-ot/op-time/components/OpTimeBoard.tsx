import React from "react";
import { Box, Button, Typography, MenuItem, TextField, Stack } from "@/src/ui/components/atoms";
import { Card, StatTile } from "@/src/ui/components/molecules";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { EnterpriseModuleHeader } from "../../../components/EnterpriseUi";
import {
  AddCircleOutline as AddCircleOutlineIcon,
  LocalHospital as LocalHospitalIcon,
  Schedule as ScheduleIcon,
  Timeline as TimelineIcon,
  MonitorHeart as MonitorHeartIcon,
  TaskAlt as TaskAltIcon,
} from "@mui/icons-material";
import {
  OtCase,
  ScheduleForm,
  ROOM_OPTIONS,
  defaultScheduleForm,
} from "../OpTimeData";
import CommonDataGrid, { CommonColumn } from "@/src/components/table/CommonDataGrid";

interface OpTimeBoardProps {
  boardStats: {
    scheduled: number;
    inProgress: number;
    pendingRecovery: number;
    completed: number;
    utilization: number;
  };
  boardRows: OtCase[];
  caseBoardColumns: CommonColumn<OtCase>[];
  setScheduleForm: (form: ScheduleForm) => void;
  setScheduleDialogOpen: (open: boolean) => void;
  dashboardCardSx: any;
  roomLabelById: Map<string, string>;
}

export const OpTimeBoard: React.FC<OpTimeBoardProps> = ({
  boardStats,
  boardRows,
  caseBoardColumns,
  setScheduleForm,
  setScheduleDialogOpen,
  dashboardCardSx,
  roomLabelById,
}) => {
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [roomFilter, setRoomFilter] = React.useState("all");
  const [priorityFilter, setPriorityFilter] = React.useState("all");

  const filteredRows = React.useMemo(() => {
    return boardRows.filter((row) => {
      const matchStatus = statusFilter === "all" || row.status === statusFilter;
      const matchRoom = roomFilter === "all" || row.roomId === roomFilter;
      const matchPriority = priorityFilter === "all" || row.priority === priorityFilter;
      return matchStatus && matchRoom && matchPriority;
    });
  }, [boardRows, statusFilter, roomFilter, priorityFilter]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, gap: 1.1 }}>
      <EnterpriseModuleHeader
        title="OpTime Enterprise OT Command Center"
        subtitle="Global OT scheduling and perioperative execution workspace"
        icon={<LocalHospitalIcon fontSize="small" />}
        accent="blue"
        actions={
          <Button
            size="small"
            variant="contained"
            startIcon={<AddCircleOutlineIcon fontSize="small" />}
            onClick={() => {
              setScheduleForm(
                defaultScheduleForm(ROOM_OPTIONS[0]?.id ?? "or-1"),
              );
              setScheduleDialogOpen(true);
            }}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Schedule Case
          </Button>
        }
      />

      <Grid container spacing={1.1}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatTile
            label="OT Utilization"
            value={`${boardStats.utilization}%`}
            subtitle="Live throughput status"
            tone="primary"
            icon={<LocalHospitalIcon sx={{ fontSize: 24 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatTile
            label="Scheduled"
            value={boardStats.scheduled}
            subtitle="Awaiting OT execution"
            tone="secondary"
            icon={<ScheduleIcon sx={{ fontSize: 24 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatTile
            label="In Progress"
            value={boardStats.inProgress}
            subtitle="In OR + closing"
            tone="warning"
            icon={<TimelineIcon sx={{ fontSize: 24 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatTile
            label="PACU Queue"
            value={boardStats.pendingRecovery}
            subtitle="Recovery bay workload"
            tone="success"
            icon={<MonitorHeartIcon sx={{ fontSize: 24 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatTile
            label="Completed"
            value={boardStats.completed}
            subtitle="Closed OT cases today"
            tone="info"
            icon={<TaskAltIcon sx={{ fontSize: 24 }} />}
          />
        </Grid>
      </Grid>


      <CommonDataGrid<OtCase>
        rows={filteredRows}
        columns={caseBoardColumns}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by patient, MRN, procedure, surgeon..."
        searchFields={[
          "caseNo",
          "patientName",
          "mrn",
          "procedure",
          "department",
          "diagnosis",
          "surgeon",
          "anesthetist",
        ]}
        toolbarRight={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <TextField
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              select
              sx={{ minWidth: 130, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.81rem" } }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              {["Scheduled", "Pre-Op", "In OR", "Closing", "PACU", "Completed", "Cancelled"].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              select
              sx={{ minWidth: 130, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.81rem" } }}
            >
              <MenuItem value="all">All Rooms</MenuItem>
              {ROOM_OPTIONS.map(r => (
                <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              select
              sx={{ minWidth: 130, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.81rem" } }}
            >
              <MenuItem value="all">All Priorities</MenuItem>
              {["STAT", "Urgent", "Elective"].map(p => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
          </Stack>
        }
        emptyTitle="No OT cases found for current filters."
        showSerialNo={true}
        disableRowPointer={true}
      />

    </Box>
  );
};
