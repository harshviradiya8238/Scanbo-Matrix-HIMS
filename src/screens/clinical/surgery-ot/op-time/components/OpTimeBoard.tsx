import React from "react";
import { Box, Button, Typography } from "@/src/ui/components/atoms";
import { Card, CommonTable, StatTile } from "@/src/ui/components/molecules";
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
import {
  CommonTableColumn,
  CommonTableFilter,
} from "@/src/ui/components/molecules/CommonTable";

interface OpTimeBoardProps {
  boardStats: {
    scheduled: number;
    inProgress: number;
    pendingRecovery: number;
    completed: number;
    utilization: number;
  };
  boardRows: OtCase[];
  caseBoardColumns: CommonTableColumn<OtCase>[];
  boardFilters: CommonTableFilter<OtCase>[];
  setScheduleForm: (form: ScheduleForm) => void;
  setScheduleDialogOpen: (open: boolean) => void;
  dashboardCardSx: any;
  roomLabelById: Map<string, string>;
}

export const OpTimeBoard: React.FC<OpTimeBoardProps> = ({
  boardStats,
  boardRows,
  caseBoardColumns,
  boardFilters,
  setScheduleForm,
  setScheduleDialogOpen,
  dashboardCardSx,
  roomLabelById,
}) => {
  return (
    <>
      <EnterpriseModuleHeader
        title="OpTime Enterprise OT Command Center"
        subtitle="Global OT scheduling and perioperative execution workspace"
        icon={<LocalHospitalIcon fontSize="small" />}
        accent="blue"
        actions={
          <>
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
            >
              Schedule Case
            </Button>
          </>
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

      <Card
        elevation={0}
        sx={{
          ...dashboardCardSx,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 1.6,
            py: 1.2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Today's OR Case Board
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Open one patient case to continue full workflow in Pre-Op, Intra-Op,
            and Post-Op modules.
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1.2,
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <CommonTable
            rows={boardRows}
            columns={caseBoardColumns}
            getRowId={(row) => row.id}
            searchBy={(row) =>
              [
                row.caseNo,
                row.patientName,
                row.mrn,
                row.procedure,
                row.department,
                row.diagnosis,
                row.surgeon,
                row.anesthetist,
                roomLabelById.get(row.roomId) ?? row.roomId,
                row.status,
                row.priority,
              ].join(" ")
            }
            searchPlaceholder="Search by case, patient, MRN, procedure, department, doctor..."
            filters={boardFilters}
            emptyMessage="No OT cases found for current filters."
            initialRowsPerPage={10}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Box>
      </Card>
    </>
  );
};
