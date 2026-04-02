import { AdmissionPriority } from "@/src/screens/ipd/ipd-mock-data";
import { EncounterStatus, OpdEncounterCase } from "../../opd-mock-data";

export type QueueStage = "Waiting" | "In Progress";

export interface QueueItem extends OpdEncounterCase {
  token: string;
  waitMinutes: number;
  stage: QueueStage;
}

export interface QueueTransferDraft {
  priority: AdmissionPriority;
  preferredWard: string;
  provisionalDiagnosis: string;
  admissionReason: string;
  requestNote: string;
}

export interface OpdQueueData {
  // State
  queue: QueueItem[];
  filteredQueue: QueueItem[];
  appointments: any[];
  encounters: any[];
  opdStatus: "idle" | "loading" | "ready" | "error";
  opdError: string | null;
  role: string;
  roleProfile: any;
  capabilities: {
    canStartConsult: boolean;
    canViewHistory: boolean;
    canCreateRegistration: boolean;
    canTransferToIpd: boolean;
  };

  // Filters State
  stageFilter: string;
  priorityFilter: string;
  departmentFilter: string;
  filterDrawerOpen: boolean;

  // Dialog State
  transferDialogOpen: boolean;
  selectedTransferItem: QueueItem | null;
  transferDraft: QueueTransferDraft;

  // Snackbar State
  snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  };

  // Counters
  waitingCount: number;
  inProgressCount: number;
  completedCount: number;
  emergencyCount: number;
  averageWaitMinutes: number;

  // Handlers
  setStageFilter: (val: string) => void;
  setPriorityFilter: (val: string) => void;
  setDepartmentFilter: (val: string) => void;
  setFilterDrawerOpen: (val: boolean) => void;
  resetFilters: () => void;
  setSnackbar: (val: any) => void;

  handleStartConsult: (item: QueueItem) => void;
  handleViewHistory: (item: QueueItem) => void;
  handleOpenTransferDialog: (item: QueueItem) => void;
  handleSubmitTransfer: () => void;
  setTransferDialogOpen: (val: boolean) => void;
  setTransferDraft: (val: any) => void;
  handleNewRegistration: () => void;
}
