import {
  SoapNote,
  VitalsDraft,
  HistoryDraft,
  SymptomDraft,
  DiagnosisLine,
  NoteDraftLine,
  NotesTabDraft,
  DraftOrderLine,
  PrescriptionLine,
  VisitTransferDraft,
  VisitTab,
} from "./opd-visit.utils";

export interface OpdVisitData {
  encounter: any;
  activeTab: VisitTab;
  setActiveTab: (tab: VisitTab) => void;
  soap: SoapNote;
  setSoap: React.Dispatch<React.SetStateAction<SoapNote>>;
  vitalsDraft: VitalsDraft;
  setVitalsDraft: React.Dispatch<React.SetStateAction<VitalsDraft>>;
  historyDraft: HistoryDraft;
  setHistoryDraft: React.Dispatch<React.SetStateAction<HistoryDraft>>;
  historyTemplateOpen: boolean;
  setHistoryTemplateOpen: (open: boolean) => void;
  historyTemplateId: string;
  setHistoryTemplateId: (id: string) => void;
  ambientDialogOpen: boolean;
  setAmbientDialogOpen: (open: boolean) => void;
  ambientInputText: string;
  setAmbientInputText: (text: string) => void;
  symptomDialogOpen: boolean;
  setSymptomDialogOpen: (open: boolean) => void;
  symptomDraft: SymptomDraft;
  setSymptomDraft: React.Dispatch<React.SetStateAction<SymptomDraft>>;
  pastHistoryOpen: boolean;
  setPastHistoryOpen: (open: boolean) => void;
  allergyDialogOpen: boolean;
  setAllergyDialogOpen: (open: boolean) => void;
  allergyInput: string;
  setAllergyInput: (input: string) => void;
  editingAllergyIndex: number | null;
  setEditingAllergyIndex: (index: number | null) => void;
  diagnosisDialogOpen: boolean;
  setDiagnosisDialogOpen: (open: boolean) => void;
  diagnosisLines: DiagnosisLine[];
  setDiagnosisLines: React.Dispatch<React.SetStateAction<DiagnosisLine[]>>;
  diagnosisDraft: DiagnosisLine;
  setDiagnosisDraft: React.Dispatch<React.SetStateAction<DiagnosisLine>>;
  editingDiagnosisId: string | null;
  setEditingDiagnosisId: (id: string | null) => void;
  notesDialogOpen: boolean;
  setNotesDialogOpen: (open: boolean) => void;
  notesDraft: NoteDraftLine;
  setNotesDraft: React.Dispatch<React.SetStateAction<NoteDraftLine>>;
  editingNoteId: string | null;
  setEditingNoteId: (id: string | null) => void;
  notesTabDraft: NotesTabDraft;
  setNotesTabDraft: React.Dispatch<React.SetStateAction<NotesTabDraft>>;
  selectedNoteTemplateId: string;
  setSelectedNoteTemplateId: (id: string) => void;
  voiceConsentTranscript: string;
  setVoiceConsentTranscript: (text: string) => void;
  voiceConsentCapturedAt: string;
  setVoiceConsentCapturedAt: (text: string) => void;
  elapsedSeconds: number;
  isPullingScanboVitals: boolean;
  setIsPullingScanboVitals: (pulling: boolean) => void;
  ordersDialogOpen: boolean;
  setOrdersDialogOpen: (open: boolean) => void;
  prescriptionDialogOpen: boolean;
  setPrescriptionDialogOpen: (open: boolean) => void;
  rxShieldDialogOpen: boolean;
  setRxShieldDialogOpen: (open: boolean) => void;
  orderCategoryFilter: string;
  setOrderCategoryFilter: (filter: any) => void;
  orderDraft: DraftOrderLine;
  setOrderDraft: React.Dispatch<React.SetStateAction<DraftOrderLine>>;
  editingOrderId: string | null;
  setEditingOrderId: (id: string | null) => void;
  prescriptionDraft: PrescriptionLine;
  setPrescriptionDraft: React.Dispatch<React.SetStateAction<PrescriptionLine>>;
  editingPrescriptionId: string | null;
  setEditingPrescriptionId: (id: string | null) => void;
  transferDialogOpen: boolean;
  setTransferDialogOpen: (open: boolean) => void;
  transferDraft: VisitTransferDraft;
  setTransferDraft: React.Dispatch<React.SetStateAction<VisitTransferDraft>>;
  snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  };
  setSnackbar: (snackbar: any) => void;
  roleProfile: any;
  capabilities: {
    canStartConsult: boolean;
    canDocumentConsultation: boolean;
    canPlaceOrders: boolean;
    canPrescribe: boolean;
    canCompleteVisit: boolean;
    canTransferToIpd: boolean;
  };
  encounterOrders: any[];
  encounterPrescriptions: any[];
  rxShieldFindings: any;
  encounterNotes: any[];
  priorEncounters: any[];
  priorNotes: any[];
  latestTrend: any;
  filteredOrderCatalog: any[];

  // Handlers
  handleOpenAmbientInteraction: () => void;
  handleApplyAmbientInteraction: () => void;
  handleInsertNotesTemplate: () => void;
  handleInsertNotesMacro: () => void;
  handleGenerateHandout: () => void;
  handleScheduleFollowup: () => void;
  handleDeleteOrder: (id: string) => void;
  handleEditOrder: (id: string) => void;
  handleSaveOrder: () => void;
  handleDeletePrescription: (id: string) => void;
  handleEditPrescription: (id: string) => void;
  handleSavePrescription: () => void;
  saveVitals: () => void;
  handlePullVitalsFromScanbo: () => Promise<void>;
  saveClinicalNote: () => void;
  handleApplyComplaintTemplate: () => void;
  handleSaveSymptom: () => void;
  handleInsertPastHistory: (id: string) => void;
  handleSaveAllergy: () => void;
  handleDeleteAllergy: (index: number) => void;
  handleSaveDiagnosis: () => void;
  handleDeleteDiagnosis: (id: string) => void;
  handleEditDiagnosis: (id: string) => void;
  handleSaveNotesFromDialog: () => void;
  handleDeleteNote: (id: string) => void;
  handleEditNote: (id: string) => void;
  handleStartVisit: () => void;
  handleExitVisit: () => void;
  handleCompleteVisit: () => void;
  handleOpenTransferToIpd: () => void;
  handleSubmitTransferToIpd: () => void;

  // Dialog Openers
  openOrderDialog: () => void;
  openPrescriptionDialog: () => void;
  openDiagnosisDialog: () => void;
  openNotesDialog: () => void;
  handleAddSymptom: () => void;
  handleUseComplaintTemplate: () => void;
  handleAddAllergy: () => void;
  handleViewPastHistory: () => void;
  handleOpenRxShieldComparison: () => void;
  handleViewDifferentialDx: () => void;
  handleUseClinicalGuidelines: () => void;

  // Helper for role guards
  guardRoleAction: (allowed: boolean, label: string) => boolean;
}
