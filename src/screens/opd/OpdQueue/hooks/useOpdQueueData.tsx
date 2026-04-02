"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/core/auth/UserContext";
import { usePermission } from "@/src/core/auth/usePermission";
import { useIpdEncounters } from "@/src/screens/ipd/ipd-encounter-context";
import { useAppDispatch } from "@/src/store/hooks";
import { useOpdData } from "@/src/store/opdHooks";
import { getOpdRoleFlowProfile } from "@/src/screens/opd/opd-role-flow";
import { updateEncounter } from "@/src/store/slices/opdSlice";
import { buildEncounterRoute } from "@/src/screens/opd/opd-encounter";
import {
  buildDefaultTransferPayload,
  upsertOpdToIpdTransferLead,
} from "@/src/screens/ipd/ipd-transfer-store";

const ACTIVE_QUEUE_STATUSES = ["ARRIVED", "IN_QUEUE", "IN_PROGRESS"];

const statusRank: Record<string, number> = {
  BOOKED: 0,
  ARRIVED: 1,
  IN_QUEUE: 2,
  IN_PROGRESS: 3,
  COMPLETED: 0,
  CANCELLED: 0,
};

function normalizeMrn(mrn: string) {
  return mrn.trim().toUpperCase();
}

function pickPreferredEncounter(current: any, incoming: any) {
  const currentRank = statusRank[current.status] ?? 0;
  const incomingRank = statusRank[incoming.status] ?? 0;
  if (incomingRank > currentRank) return incoming;
  if (incomingRank < currentRank) return current;
  if (incoming.appointmentTime >= current.appointmentTime) return incoming;
  return current;
}

function buildQueue(encounters: any[], excludedMrnSet: Set<string>) {
  const activeCandidates = encounters
    .filter((item) => ACTIVE_QUEUE_STATUSES.includes(item.status))
    .filter((item) => !excludedMrnSet.has(normalizeMrn(item.mrn)));

  const activeByMrn = new Map<string, any>();
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

export function useOpdQueueData() {
  const router = useRouter();
  const { role } = useUser();
  const permissionGate = usePermission();
  const ipdEncounters = useIpdEncounters();
  const dispatch = useAppDispatch();
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

  const capabilities = {
    canStartConsult: roleProfile.capabilities.canStartConsult,
    canViewHistory: roleProfile.capabilities.canViewClinicalHistory,
    canCreateRegistration: roleProfile.capabilities.canManageCalendar,
    canTransferToIpd:
      roleProfile.capabilities.canTransferToIpd &&
      permissionGate("ipd.transfer.write"),
  };

  const [stageFilter, setStageFilter] = React.useState("All Stage");
  const [priorityFilter, setPriorityFilter] = React.useState("All Priorities");
  const [departmentFilter, setDepartmentFilter] =
    React.useState("All Departments");
  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [selectedTransferItem, setSelectedTransferItem] =
    React.useState<any>(null);
  const [transferDraft, setTransferDraft] = React.useState({
    priority: "Routine",
    preferredWard: "Medical Ward - 1",
    provisionalDiagnosis: "",
    admissionReason: "",
    requestNote: "",
  });

  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

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

  const withMrn = React.useCallback((route: string, mrn: string) => {
    if (!mrn) return route;
    const joiner = route.includes("?") ? "&" : "?";
    return `${route}${joiner}mrn=${encodeURIComponent(mrn)}`;
  }, []);

  const handleStartConsult = React.useCallback(
    (item: any) => {
      if (!capabilities.canStartConsult) {
        setSnackbar({
          open: true,
          message: `${roleProfile.label} cannot start consultation. Please assign to a doctor.`,
          severity: "warning",
        });
        return;
      }
      dispatch(
        updateEncounter({
          id: item.id,
          changes: {
            status: "IN_PROGRESS",
          },
        }),
      );
      router.push(withMrn(buildEncounterRoute(item.id), item.mrn));
    },
    [
      capabilities.canStartConsult,
      dispatch,
      roleProfile.label,
      router,
      withMrn,
    ],
  );

  const handleViewHistory = React.useCallback(
    (item: any) => {
      if (!capabilities.canViewHistory) {
        setSnackbar({
          open: true,
          message: `${roleProfile.label} cannot open clinical history.`,
          severity: "warning",
        });
        return;
      }
      router.push(withMrn("/appointments/visit?tab=notes", item.mrn));
    },
    [capabilities.canViewHistory, roleProfile.label, router, withMrn],
  );

  const handleOpenTransferDialog = React.useCallback(
    (item: any) => {
      if (!capabilities.canTransferToIpd) {
        setSnackbar({
          open: true,
          message: `${roleProfile.label} does not have permission to move patient to IPD.`,
          severity: "warning",
        });
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
    [appointments, capabilities.canTransferToIpd, role, roleProfile.label],
  );

  const handleSubmitTransfer = React.useCallback(() => {
    if (!selectedTransferItem) return;
    if (!capabilities.canTransferToIpd) {
      setSnackbar({
        open: true,
        message: `${roleProfile.label} does not have permission to move patient to IPD.`,
        severity: "warning",
      });
      return;
    }
    if (!transferDraft.preferredWard.trim()) {
      setSnackbar({
        open: true,
        message: "Preferred ward is required for IPD transfer.",
        severity: "error",
      });
      return;
    }
    if (!transferDraft.admissionReason.trim()) {
      setSnackbar({
        open: true,
        message: "Admission reason is required for IPD transfer.",
        severity: "error",
      });
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
      priority: transferDraft.priority as any,
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
        changes: {
          status: "COMPLETED",
        },
      }),
    );
    setTransferDialogOpen(false);
    setSelectedTransferItem(null);
    setSnackbar({
      open: true,
      message:
        result.status === "created"
          ? `IPD transfer created for ${result.lead.patientName}.`
          : `IPD transfer updated for ${result.lead.patientName}.`,
      severity: "success",
    });
    router.push(`/ipd/admissions?mrn=${encodeURIComponent(result.lead.mrn)}`);
  }, [
    appointments,
    capabilities.canTransferToIpd,
    dispatch,
    role,
    roleProfile.label,
    router,
    selectedTransferItem,
    transferDraft,
  ]);

  const handleNewRegistration = () => {
    router.push("/patients/registration");
  };

  return {
    queue,
    filteredQueue,
    appointments,
    encounters,
    opdStatus,
    opdError,
    role,
    roleProfile,
    capabilities,
    stageFilter,
    priorityFilter,
    departmentFilter,
    filterDrawerOpen,
    transferDialogOpen,
    selectedTransferItem,
    transferDraft,
    snackbar,
    waitingCount,
    inProgressCount,
    completedCount,
    emergencyCount,
    averageWaitMinutes,
    setStageFilter,
    setPriorityFilter,
    setDepartmentFilter,
    setFilterDrawerOpen,
    resetFilters,
    setSnackbar,
    handleStartConsult,
    handleViewHistory,
    handleOpenTransferDialog,
    handleSubmitTransfer,
    setTransferDialogOpen,
    setTransferDraft,
    handleNewRegistration,
  };
}
