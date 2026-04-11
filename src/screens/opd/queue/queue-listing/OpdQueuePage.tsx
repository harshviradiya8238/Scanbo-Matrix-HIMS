"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { SelectChangeEvent } from "@mui/material";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import { CommonDialog } from "@/src/ui/components/molecules";
import {
  Add as AddIcon,
  AssignmentInd as AssignmentIndIcon,
  Bolt as BoltIcon,
  Close as CloseIcon,
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
  History as HistoryIcon,
  LocalHospital as LocalHospitalIcon,
  PlayArrow as PlayArrowIcon,
  SwapHoriz as SwapHorizIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import { EncounterStatus, OpdEncounterCase } from "../../opd-mock-data";
import { AdmissionPriority } from "@/src/screens/ipd/ipd-mock-data";
import {
  ENCOUNTER_STATUS_LABEL,
  buildEncounterRoute,
} from "../../opd-encounter";
import { useUser } from "@/src/core/auth/UserContext";
import { useAppDispatch } from "@/src/store/hooks";
import { updateEncounter } from "@/src/store/slices/opdSlice";
import { useOpdData } from "@/src/store/opdHooks";
import { usePermission } from "@/src/core/auth/usePermission";
import OpdLayout from "../../components/OpdLayout";
import { StatTile } from "@/src/ui/components/molecules";
import { useIpdEncounters } from "@/src/screens/ipd/ipd-encounter-context";
import { getOpdRoleFlowProfile } from "../../opd-role-flow";
import {
  buildDefaultTransferPayload,
  upsertOpdToIpdTransferLead,
} from "@/src/screens/ipd/ipd-transfer-store";

type QueueStage = "Waiting" | "In Progress";

interface QueueItem extends OpdEncounterCase {
  token: string;
  waitMinutes: number;
  stage: QueueStage;
}

interface QueueTransferDraft {
  priority: AdmissionPriority;
  preferredWard: string;
  provisionalDiagnosis: string;
  admissionReason: string;
  requestNote: string;
}

const ACTIVE_QUEUE_STATUSES: EncounterStatus[] = [
  "ARRIVED",
  "IN_QUEUE",
  "IN_PROGRESS",
];

const queueStatusColor: Record<
  EncounterStatus,
  "default" | "info" | "warning" | "success" | "error"
> = {
  BOOKED: "default",
  ARRIVED: "warning",
  IN_QUEUE: "warning",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  CANCELLED: "error",
};

const statusRank: Record<EncounterStatus, number> = {
  BOOKED: 0,
  ARRIVED: 1,
  IN_QUEUE: 2,
  IN_PROGRESS: 3,
  COMPLETED: 0,
  CANCELLED: 0,
};

function normalizeMrn(mrn: string): string {
  return mrn.trim().toUpperCase();
}

function pickPreferredEncounter(
  current: OpdEncounterCase,
  incoming: OpdEncounterCase,
): OpdEncounterCase {
  const currentRank = statusRank[current.status] ?? 0;
  const incomingRank = statusRank[incoming.status] ?? 0;
  if (incomingRank > currentRank) return incoming;
  if (incomingRank < currentRank) return current;
  if (incoming.appointmentTime >= current.appointmentTime) return incoming;
  return current;
}

function buildQueue(
  encounters: OpdEncounterCase[],
  excludedMrnSet: Set<string>,
): QueueItem[] {
  const activeCandidates = encounters
    .filter((item) => ACTIVE_QUEUE_STATUSES.includes(item.status))
    .filter((item) => !excludedMrnSet.has(normalizeMrn(item.mrn)));

  const activeByMrn = new Map<string, OpdEncounterCase>();
  activeCandidates.forEach((item) => {
    const key = normalizeMrn(item.mrn);
    const existing = activeByMrn.get(key);
    if (!existing) {
      activeByMrn.set(key, item);
      return;
    }
    activeByMrn.set(key, pickPreferredEncounter(existing, item));
  });

  const active = Array.from(activeByMrn.values()).sort((left, right) =>
    left.appointmentTime.localeCompare(right.appointmentTime),
  );

  return active.map((item, index) => {
    const isInProgress = item.status === "IN_PROGRESS";
    const waitMinutes = isInProgress ? 0 : 8 + index * 4;

    return {
      ...item,
      token: String(index + 1).padStart(2, "0"),
      waitMinutes,
      stage: isInProgress ? "In Progress" : "Waiting",
    };
  });
}

import { useSnackbar } from "@/src/ui/components/molecules/Snackbarcontext";

export default function OpdQueuePage() {
  const router = useRouter();
  const { role } = useUser();
  const permissionGate = usePermission();
  const ipdEncounters = useIpdEncounters();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const {
    appointments,
    encounters,
    status: opdStatus,
    error: opdError,
  } = useOpdData();

  const activeIpdMrnSet = React.useMemo(
    () =>
      new Set(
        ipdEncounters
          .filter((record) => record.workflowStatus !== "discharged")
          .map((record) => normalizeMrn(record.mrn)),
      ),
    [ipdEncounters],
  );

  const queue = React.useMemo(
    () => buildQueue(encounters, activeIpdMrnSet),
    [encounters, activeIpdMrnSet],
  );
  const roleProfile = React.useMemo(() => getOpdRoleFlowProfile(role), [role]);
  const canStartConsult = roleProfile.capabilities.canStartConsult;
  const canViewHistory = roleProfile.capabilities.canViewClinicalHistory;
  const canCreateRegistration = roleProfile.capabilities.canManageCalendar;
  const canTransferToIpd =
    roleProfile.capabilities.canTransferToIpd &&
    permissionGate("ipd.transfer.write");
  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [selectedTransferItem, setSelectedTransferItem] =
    React.useState<QueueItem | null>(null);
  const [transferDraft, setTransferDraft] = React.useState<QueueTransferDraft>({
    priority: "Routine",
    preferredWard: "Medical Ward - 1",
    provisionalDiagnosis: "",
    admissionReason: "",
    requestNote: "",
  });
  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const withMrn = React.useCallback((route: string, mrn?: string) => {
    if (!mrn) return route;
    const joiner = route.includes("?") ? "&" : "?";
    return `${route}${joiner}mrn=${encodeURIComponent(mrn)}`;
  }, []);

  const waitingCount = queue.filter((item) => item.stage === "Waiting").length;
  const inProgressCount = queue.filter(
    (item) => item.stage === "In Progress",
  ).length;
  const completedCount = encounters.filter(
    (item) => item.status === "COMPLETED",
  ).length;
  const emergencyCount = queue.filter(
    (item) => item.queuePriority === "Urgent",
  ).length;

  const averageWaitMinutes = React.useMemo(() => {
    const waitingRows = queue.filter((item) => item.stage === "Waiting");
    if (waitingRows.length === 0) return 0;
    const total = waitingRows.reduce((sum, item) => sum + item.waitMinutes, 0);
    return Math.round(total / waitingRows.length);
  }, [queue]);

  const [stageFilter, setStageFilter] = React.useState("All Stage");
  const [priorityFilter, setPriorityFilter] = React.useState("All Priorities");
  const [departmentFilter, setDepartmentFilter] =
    React.useState("All Departments");

  const resetFilters = () => {
    setStageFilter("All Stage");
    setPriorityFilter("All Priorities");
    setDepartmentFilter("All Departments");
  };

  const filteredQueue = React.useMemo(() => {
    return queue.filter((item) => {
      if (stageFilter !== "All Stage" && item.stage !== stageFilter)
        return false;
      if (
        priorityFilter !== "All Priorities" &&
        item.queuePriority !== priorityFilter
      )
        return false;
      if (
        departmentFilter !== "All Departments" &&
        item.department !== departmentFilter
      )
        return false;
      return true;
    });
  }, [queue, stageFilter, priorityFilter, departmentFilter]);

  const filterDropdowns = [
    {
      id: "stage",
      placeholder: "All Stages",
      value: stageFilter,
      options: [
        "All Stage",
        ...Array.from(new Set(queue.map((item) => item.stage))),
      ],
      onChange: setStageFilter,
    },
    {
      id: "priority",
      placeholder: "All Priorities",
      value: priorityFilter,
      options: [
        "All Priorities",
        ...Array.from(new Set(queue.map((item) => item.queuePriority))),
      ],
      onChange: setPriorityFilter,
    },
    {
      id: "department",
      placeholder: "All Departments",
      value: departmentFilter,
      options: [
        "All Departments",
        ...Array.from(new Set(queue.map((item) => item.department))),
      ],
      onChange: setDepartmentFilter,
    },
  ];

  const handleStartConsult = React.useCallback(
    (item: QueueItem) => {
      if (!canStartConsult) {
        snackbar.warning(`${roleProfile.label} cannot start consultation. Please assign to a doctor.`);
        return;
      }
      dispatch(
        updateEncounter({
          id: item.id,
          changes: { status: "IN_PROGRESS" },
        }),
      );
      router.push(withMrn(buildEncounterRoute(item.id), item.mrn));
    },
    [canStartConsult, dispatch, roleProfile.label, router, withMrn],
  );

  const handleViewHistory = React.useCallback(
    (item: QueueItem) => {
      if (!canViewHistory) {
        snackbar.warning(`${roleProfile.label} cannot open clinical history.`);
        return;
      }
      const base = buildEncounterRoute(item.id);
      router.push(withMrn(`${base}?tab=history`, item.mrn));
    },
    [canViewHistory, roleProfile.label, router, withMrn],
  );

  const handleOpenTransferDialog = React.useCallback(
    (item: QueueItem) => {
      if (!canTransferToIpd) {
        snackbar.warning(`${roleProfile.label} does not have permission to move patient to IPD.`);
        return;
      }

      const appointment = appointments.find(
        (row) => row.id === item.appointmentId,
      );
      const defaults = buildDefaultTransferPayload(item, {
        payerType: appointment?.payerType,
        phone: appointment?.phone,
        requestedBy: roleProfile.label,
        requestedByRole: role,
      });

      setSelectedTransferItem(item);
      setTransferDraft({
        priority: defaults.priority,
        preferredWard: defaults.preferredWard,
        provisionalDiagnosis: defaults.provisionalDiagnosis ?? "",
        admissionReason: defaults.admissionReason,
        requestNote: "",
      });
      setTransferDialogOpen(true);
    },
    [appointments, canTransferToIpd, role, roleProfile.label],
  );

  const handleSubmitTransfer = React.useCallback(() => {
    if (!selectedTransferItem) return;
    if (!canTransferToIpd) {
      snackbar.warning(`${roleProfile.label} does not have permission to move patient to IPD.`);
      return;
    }

    if (!transferDraft.preferredWard.trim()) {
      snackbar.error("Preferred ward is required for IPD transfer.");
      return;
    }

    if (!transferDraft.admissionReason.trim()) {
      snackbar.error("Admission reason is required for IPD transfer.");
      return;
    }

    const appointment = appointments.find(
      (row) => row.id === selectedTransferItem.appointmentId,
    );
    const defaults = buildDefaultTransferPayload(selectedTransferItem, {
      payerType: appointment?.payerType,
      phone: appointment?.phone,
      requestedBy: roleProfile.label,
      requestedByRole: role,
    });

    const result = upsertOpdToIpdTransferLead({
      ...defaults,
      priority: transferDraft.priority,
      preferredWard: transferDraft.preferredWard.trim(),
      provisionalDiagnosis:
        transferDraft.provisionalDiagnosis.trim() ||
        defaults.provisionalDiagnosis,
      admissionReason: transferDraft.admissionReason.trim(),
      requestNote: transferDraft.requestNote.trim(),
    });

    dispatch(
      updateEncounter({
        id: selectedTransferItem.id,
        changes: { status: "COMPLETED" },
      }),
    );

    setTransferDialogOpen(false);
    setSelectedTransferItem(null);
    snackbar.success(
      result.status === "created"
        ? `IPD transfer created for ${result.lead.patientName}.`
        : `IPD transfer updated for ${result.lead.patientName}.`
    );
  }, [
    appointments,
    canTransferToIpd,
    dispatch,
    role,
    roleProfile.label,
    router,
    selectedTransferItem,
    transferDraft.admissionReason,
    transferDraft.preferredWard,
    transferDraft.priority,
    transferDraft.provisionalDiagnosis,
    transferDraft.requestNote,
  ]);

  const queueColumns = React.useMemo<CommonColumn<QueueItem>[]>(
    () => [
      {
        field: "patientName",
        headerName: "Patient",
        width: "25%",
        renderCell: (row) => (
          <Stack spacing={0.2}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {row.patientName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.mrn} · {row.ageGender}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "chiefComplaint",
        headerName: "Chief Complaint",
        width: "25%",
        renderCell: (row) => (
          <Typography variant="body2" color="text.secondary">
            {row.chiefComplaint}
          </Typography>
        ),
      },
      {
        field: "doctor",
        headerName: "Consultant",
        width: 170,
        renderCell: (row) => row.doctor,
      },
      {
        field: "status",
        headerName: "Status",
        width: 160,
        renderCell: (row) => {
          if (row.queuePriority === "Urgent") {
            return (
              <Chip
                size="small"
                color="error"
                label="Emergency"
                icon={<WarningAmberIcon fontSize="small" />}
              />
            );
          }
          if (row.stage === "In Progress") {
            return <Chip label="In Progress" color="info" size="small" />;
          }
          return <Chip label="Waiting" color="warning" size="small" />;
        },
      },
      {
        field: "waitMinutes",
        headerName: "Wait",
        width: 100,
        renderCell: (row) => (
          <Typography variant="body2" color="text.secondary">
            {row.stage === "Waiting" ? `${row.waitMinutes} min` : "--"}
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: "Action",
        align: "right",
        width: 380,
        renderCell: (row) => (
          <Stack direction="row" spacing={0.7} justifyContent="flex-end">
            <Button
              size="small"
              variant="outlined"
              startIcon={<PlayArrowIcon />}
              disabled={!canStartConsult}
              onClick={() => handleStartConsult(row)}
            >
              {row.stage === "In Progress" ? "Open Consult" : "Start Consult"}
            </Button>
           
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<SwapHorizIcon />}
              disabled={!canTransferToIpd}
              onClick={() => handleOpenTransferDialog(row)}
            >
              Move to IPD
            </Button>
          </Stack>
        ),
      },
    ],
    [
      canStartConsult,
      canTransferToIpd,
      canViewHistory,
      handleOpenTransferDialog,
      handleStartConsult,
      handleViewHistory,
    ],
  );

  if (!isHydrated) {
    return (
      <OpdLayout
        title="OPD Dashboard"
        currentPageTitle="Queue"
        showRoleGuide={false}
        fullHeight
      >
        <Stack spacing={2}>
          <Alert severity="info">Loading OPD queue...</Alert>
        </Stack>
      </OpdLayout>
    );
  }

  return (
    <OpdLayout
      title="OPD Dashboard"
      currentPageTitle="Queue"
      showRoleGuide={false}
      fullHeight
    >
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {opdStatus === "loading" ? (
          <Alert severity="info">
            Loading OPD data from the local JSON server.
          </Alert>
        ) : null}
        {opdStatus === "error" ? (
          <Alert severity="warning">
            OPD JSON server not reachable. Showing fallback data.
            {opdError ? ` (${opdError})` : ""}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatTile
              label="Patients Today"
              value={appointments.length}
              subtitle={`${averageWaitMinutes} min avg wait`}
              tone="info"
              icon={<AssignmentIndIcon sx={{ fontSize: 28 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatTile
              label="In Queue"
              value={waitingCount}
              subtitle={`${emergencyCount} emergency cases`}
              tone="warning"
              icon={<BoltIcon sx={{ fontSize: 28 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatTile
              label="In Consultation"
              value={inProgressCount}
              subtitle={`${queue.length} active encounter(s)`}
              tone="primary"
              icon={<LocalHospitalIcon sx={{ fontSize: 28 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatTile
              label="Completed"
              value={completedCount}
              subtitle="Visits closed today"
              tone="success"
              icon={<HistoryIcon sx={{ fontSize: 28 }} />}
            />
          </Grid>
        </Grid>

        <CommonDataGrid<QueueItem>
          rows={filteredQueue}
          columns={queueColumns}
          getRowId={(row) => row.id}
          showSerialNo={true}
          emptyTitle="No patients in queue"
          emptyDescription="No patients in queue for the selected filter."
          searchPlaceholder="Search patient, MRN, complaint..."
          searchFields={[
            "token",
            "patientName",
            "mrn",
            "chiefComplaint",
            "doctor",
            "department",
            "queuePriority",
          ]}
          toolbarRight={
            <Stack direction="row" spacing={1}>
              {role !== "DOCTOR" && (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    disabled={!canCreateRegistration}
                    onClick={() => router.push("/patients/registration")}
                  >
                    New Patient Registration
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FileDownloadIcon />}
                    onClick={() => snackbar.info("Report export started.")}
                  >
                    Export Reports
                  </Button>
                </>
              )}
              <Button
                variant="outlined"
                size="small"
                startIcon={<FilterListIcon />}
                onClick={() => setFilterDrawerOpen(true)}
              >
                Filters
              </Button>
              <Button variant="text" size="small" onClick={resetFilters}>
                Clear
              </Button>
            </Stack>
          }
        />

        <Drawer
          anchor="right"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          PaperProps={{
            sx: { width: 360, borderLeft: "1px solid #DDE8F0" },
          }}
        >
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                px: 3,
                py: 2,
                borderBottom: "1px solid #DDE8F0",
                background: "linear-gradient(135deg, #EBF4FF 0%, #F5F8FB 100%)",
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1172BA" }}>
                  Queue Filters
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Narrow down the OPD queue
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => setFilterDrawerOpen(false)}
                sx={{ color: "text.secondary" }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>

            {/* Body */}
            <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
              <Stack spacing={3}>
                {/* Stage Filter */}
                <FormControl fullWidth size="small">
                  <InputLabel>Stage</InputLabel>
                  <Select
                    label="Stage"
                    value={stageFilter}
                    onChange={(e: SelectChangeEvent<unknown>) =>
                      setStageFilter(e.target.value as string)
                    }
                  >
                    {["All Stage", "Waiting", "In Progress"].map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Priority Filter */}
                <FormControl fullWidth size="small">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    label="Priority"
                    value={priorityFilter}
                    onChange={(e: SelectChangeEvent<unknown>) =>
                      setPriorityFilter(e.target.value as string)
                    }
                  >
                    {["All Priorities", "Routine", "Urgent"].map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Department Filter */}
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    label="Department"
                    value={departmentFilter}
                    onChange={(e: SelectChangeEvent<unknown>) =>
                      setDepartmentFilter(e.target.value as string)
                    }
                  >
                    {[
                      "All Departments",
                      ...Array.from(
                        new Set(queue.map((item) => item.department)),
                      ),
                    ].map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Box>

            {/* Footer */}
            <Box sx={{ p: 3, borderTop: "1px solid #DDE8F0" }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setFilterDrawerOpen(false)}
                sx={{ mb: 1 }}
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={resetFilters}
              >
                Reset All
              </Button>
            </Box>
          </Box>
        </Drawer>
      </Stack>

      <CommonDialog
        open={transferDialogOpen}
        onClose={() => {
          setTransferDialogOpen(false);
          setSelectedTransferItem(null);
        }}
        title="Move Patient to IPD"
        subtitle={
          selectedTransferItem
            ? `${selectedTransferItem.patientName} (${selectedTransferItem.mrn})`
            : undefined
        }
        maxWidth="sm"
        content={
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Alert severity="info">
              Create an IPD admission request from OPD. This patient will appear
              in IPD Admission Queue.
            </Alert>
            <TextField
              select
              label="Priority"
              value={transferDraft.priority}
              onChange={(event) =>
                setTransferDraft((prev) => ({
                  ...prev,
                  priority: event.target.value as AdmissionPriority,
                }))
              }
              fullWidth
            >
              {["Routine", "Urgent", "Emergency"].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Preferred Ward"
              value={transferDraft.preferredWard}
              onChange={(event) =>
                setTransferDraft((prev) => ({
                  ...prev,
                  preferredWard: event.target.value,
                }))
              }
              fullWidth
            >
              {[
                "Medical Ward - 1",
                "Medical Ward - 2",
                "Surgical Ward - 1",
                "ICU",
                "HDU",
              ].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Provisional Diagnosis"
              value={transferDraft.provisionalDiagnosis}
              onChange={(event) =>
                setTransferDraft((prev) => ({
                  ...prev,
                  provisionalDiagnosis: event.target.value,
                }))
              }
              fullWidth
            />
            <TextField
              label="Admission Reason"
              value={transferDraft.admissionReason}
              onChange={(event) =>
                setTransferDraft((prev) => ({
                  ...prev,
                  admissionReason: event.target.value,
                }))
              }
              minRows={2}
              multiline
              fullWidth
            />
            <TextField
              label="Internal Note (Optional)"
              value={transferDraft.requestNote}
              onChange={(event) =>
                setTransferDraft((prev) => ({
                  ...prev,
                  requestNote: event.target.value,
                }))
              }
              minRows={2}
              multiline
              fullWidth
            />
          </Stack>
        }
        actions={
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setTransferDialogOpen(false);
                setSelectedTransferItem(null);
              }}
            >
              Cancel
            </Button>
            {role === "DOCTOR" && (
              <Button
                variant="contained"
                startIcon={<SwapHorizIcon />}
                onClick={handleSubmitTransfer}
                disabled={!canTransferToIpd || !selectedTransferItem}
              >
                Move to IPD
              </Button>
            )}
          </>
        }
      />

    </OpdLayout>
  );
}
