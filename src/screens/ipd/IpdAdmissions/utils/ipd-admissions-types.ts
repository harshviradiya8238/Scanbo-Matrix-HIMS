import { AdmissionPriority, AdmissionLead } from "../../ipd-mock-data";
import { IpdPatientOption, IpdPatientTopBarField } from "../../components/IpdPatientTopBar";

export interface AdmissionDialogForm {
  patientName: string;
  mrn: string;
  mobile: string;
  admissionType: string;
  admissionSource: string;
  priority: AdmissionPriority;
  department: string;
  consultant: string;
  preferredWard: string;
  provisionalDiagnosis: string;
  admissionReason: string;
  payerType: string;
  insuranceProvider: string;
  policyNumber: string;
  termsAccepted: boolean;
}

export type AdmissionErrors = Partial<Record<keyof AdmissionDialogForm, string>>;

export interface PatientRow {
  id: string;
  mrn: string;
  patientName: string;
  ageGender: string;
  admissionDate: string;
  admissionTimestamp: number;
  consultant: string;
  diagnosis: string;
  ward: string;
  bed: string;
  status: "Admitted" | "Observation";
  entryType: "Existing" | "Created Now";
}

export interface AdmissionQueueRow {
  id: string;
  mrn: string;
  patientName: string;
  source: "OPD" | "ER" | "Transfer" | string;
  priority: AdmissionPriority;
  preferredWard: string;
  consultant: string;
  provisionalDiagnosis: string;
  stage: "Pending Admission" | "Bed Pending";
}

export interface IpdAdmissionsData {
  // Filters & State
  allSearch: string;
  setAllSearch: (val: string) => void;
  allStatusFilter: string;
  setAllStatusFilter: (val: string) => void;
  allWardFilter: string;
  setAllWardFilter: (val: string) => void;
  queueSearch: string;
  setQueueSearch: (val: string) => void;
  queuePriorityFilter: string;
  setQueuePriorityFilter: (val: string) => void;
  queueSourceFilter: string;
  setQueueSourceFilter: (val: string) => void;
  historyTab: "all" | "queue";
  setHistoryTab: (val: "all" | "queue") => void;

  // Dialog State
  dialogOpen: boolean;
  setDialogOpen: (val: boolean) => void;
  selectedLeadId: string;
  setSelectedLeadId: (val: string) => void;
  form: AdmissionDialogForm;
  setForm: React.Dispatch<React.SetStateAction<AdmissionDialogForm>>;
  errors: AdmissionErrors;
  setErrors: React.Dispatch<React.SetStateAction<AdmissionErrors>>;

  // Data & Lists
  allPatients: PatientRow[];
  queueRows: AdmissionQueueRow[];
  visibleAllPatients: PatientRow[];
  visibleQueueRows: AdmissionQueueRow[];
  
  // TopBar
  topBarPatientOptions: IpdPatientOption[];
  selectedTopBarPatient: IpdPatientOption | null;
  topBarFields: IpdPatientTopBarField[];
  onSelectTopBarPatient: (mrn: string) => void;

  // Handlers
  handleOpenAdmissionDialog: (rowId?: string) => void;
  handleSaveAdmission: () => void;
  handleOpenBedBoard: (row: PatientRow | AdmissionQueueRow) => void;
  
  // Permissions
  canManageAdmissions: boolean;
  canOpenBedBoard: boolean;

  // Snackbar
  snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  };
  setSnackbar: React.Dispatch<React.SetStateAction<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>>;
}
