'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card, CommonDialog } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { alpha, useTheme } from '@/src/ui/theme';
import {
  Bolt as BoltIcon,
  Biotech as BiotechIcon,
  Description as DescriptionIcon,
  EditOutlined as EditOutlinedIcon,
  HistoryEdu as HistoryEduIcon,
  History as HistoryIcon,
  LibraryAdd as LibraryAddIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Medication as MedicationIcon,
  Mic as MicIcon,
  MonitorHeart as MonitorHeartIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  Save as SaveIcon,
  Science as ScienceIcon,
  TextSnippet as TextSnippetIcon,
  Timer as TimerIcon,
  WarningAmber as WarningAmberIcon,
  DeleteOutline as DeleteOutlineIcon,
} from '@mui/icons-material';
import { useMrnParam } from '@/src/core/patients/useMrnParam';
import { useUser } from '@/src/core/auth/UserContext';
import { getSoftSurface } from '@/src/core/theme/surfaces';
import { useAppDispatch } from '@/src/store/hooks';
import {
  addEncounterOrder,
  addEncounterPrescription,
  addNote,
  addVitalTrend,
  removeEncounterOrder,
  removeEncounterPrescription,
  removeNote,
  updateEncounter,
  updateEncounterOrder,
  updateEncounterPrescription,
  updateNote,
} from '@/src/store/slices/opdSlice';
import { useOpdData } from '@/src/store/opdHooks';
import { MedicationCatalogItem, OrderCatalogItem } from './opd-mock-data';
import { resolveEncounterFromState } from './opd-encounter';
import { getOpdRoleFlowProfile } from './opd-role-flow';
import OpdLayout from './components/OpdLayout';
import OpdTable from './components/OpdTable';
import OpdTabs, { OpdTabItem } from './components/OpdTabs';
import ConsultationWorkspaceHeader from './components/ConsultationWorkspaceHeader';

interface OpdVisitPageProps {
  encounterId?: string;
}

interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface VitalsDraft {
  bp: string;
  hr: string;
  rr: string;
  temp: string;
  spo2: string;
  weightKg: string;
  bmi: string;
}

interface HistoryDraft {
  chiefComplaint: string;
  hpi: string;
  duration: string;
  severity: string;
}

interface HistoryTemplate {
  id: string;
  name: string;
  chiefComplaint: string;
  hpi: string;
  duration: string;
  severity: string;
}

interface SymptomDraft {
  symptom: string;
  duration: string;
  severity: string;
}

interface DiagnosisCatalogItem {
  id: string;
  name: string;
  icd10: string;
}

interface DiagnosisLine {
  id: string;
  diagnosisId: string;
  diagnosisName: string;
  icd10: string;
  type: 'Primary' | 'Secondary' | 'Provisional' | 'Differential';
  status: 'Active' | 'Resolved' | 'Ruled Out';
  notes: string;
}

interface NoteDraftLine {
  title: string;
  content: string;
  author: string;
}

interface NotesTabDraft {
  progressNotes: string;
  patientInstructions: string;
  followupRequired: string;
  followupNotes: string;
}

interface DraftOrderLine {
  id: string;
  catalogId: string;
  priority: 'Routine' | 'Urgent';
  instructions: string;
}

interface PrescriptionLine {
  id: string;
  medicationId: string;
  dose: string;
  frequency: string;
  durationDays: string;
  route: 'Oral' | 'IV' | 'IM' | 'Topical';
  instructions: string;
}

type VisitTab = 'vitals' | 'history' | 'diagnosis' | 'orders' | 'prescriptions' | 'notes';

const VISIT_TABS: OpdTabItem[] = [
  { id: 'vitals', label: 'Vitals', icon: <MonitorHeartIcon /> },
  { id: 'history', label: 'History', icon: <HistoryIcon /> },
  { id: 'diagnosis', label: 'Diagnosis', icon: <BiotechIcon /> },
  { id: 'orders', label: 'Orders', icon: <ScienceIcon /> },
  { id: 'prescriptions', label: 'Prescription', icon: <MedicationIcon /> },
  { id: 'notes', label: 'Notes', icon: <DescriptionIcon /> },
];

const HISTORY_TEMPLATES: HistoryTemplate[] = [
  {
    id: 'h-tpl-1',
    name: 'Chest Pain Review',
    chiefComplaint: 'Chest discomfort and shortness of breath for the past 2 days',
    hpi: 'Intermittent retrosternal discomfort on exertion with mild breathlessness. No syncope or active palpitations.',
    duration: '1-3 days',
    severity: 'Moderate',
  },
  {
    id: 'h-tpl-2',
    name: 'Diabetes Follow-up',
    chiefComplaint: 'High blood sugar with fatigue',
    hpi: 'Home glucose readings above target for one week with daytime fatigue and reduced appetite. No vomiting or abdominal pain.',
    duration: '4-7 days',
    severity: 'Moderate',
  },
  {
    id: 'h-tpl-3',
    name: 'Acute Respiratory',
    chiefComplaint: 'Fever and cough with breathlessness',
    hpi: 'Fever with productive cough and exertional breathlessness. Symptoms worsening since onset.',
    duration: '1-3 days',
    severity: 'Severe',
  },
];

const DIAGNOSIS_CATALOG: DiagnosisCatalogItem[] = [
  { id: 'dx-1', name: 'Type 2 Diabetes Mellitus', icd10: 'E11.9' },
  { id: 'dx-2', name: 'Hypertension', icd10: 'I10' },
  { id: 'dx-3', name: 'Coronary artery disease', icd10: 'I25.10' },
  { id: 'dx-4', name: 'Migraine', icd10: 'G43.909' },
  { id: 'dx-5', name: 'Recurrent pharyngitis', icd10: 'J02.9' },
  { id: 'dx-6', name: 'Acute sinusitis', icd10: 'J01.90' },
];

const DIAGNOSIS_TYPE_OPTIONS: DiagnosisLine['type'][] = ['Primary', 'Secondary', 'Provisional', 'Differential'];
const DIAGNOSIS_STATUS_OPTIONS: DiagnosisLine['status'][] = ['Active', 'Resolved', 'Ruled Out'];

const formatElapsed = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

const getPatientAge = (ageGender: string): string => ageGender.split('/')[0]?.trim() ?? ageGender;
const getPatientGender = (ageGender: string): string => ageGender.split('/')[1]?.trim() ?? '--';
const sanitizeAllergies = (allergies: string[]): string[] =>
  Array.from(
    new Set(
      allergies
        .map((item) => item.trim())
        .filter((item) => item && item.toLowerCase() !== 'no known allergies')
    )
  );

const isVisitTab = (value: string | null): value is VisitTab =>
  !!value && VISIT_TABS.some((tab) => tab.id === value);

const buildDefaultOrderLine = (catalog: OrderCatalogItem[]): DraftOrderLine => {
  const first = catalog[0];
  return {
    id: `line-${Date.now()}`,
    catalogId: first?.id ?? '',
    priority: first?.defaultPriority ?? 'Routine',
    instructions: '',
  };
};

const buildDefaultPrescriptionLine = (catalog: MedicationCatalogItem[]): PrescriptionLine => {
  const first = catalog[0];
  return {
    id: `rx-${Date.now()}`,
    medicationId: first?.id ?? '',
    dose: first?.strength ?? '',
    frequency: first?.commonFrequency ?? 'OD',
    durationDays: '5',
    route: 'Oral',
    instructions: '',
  };
};

const buildDiagnosisLineFromCatalog = (item?: DiagnosisCatalogItem): DiagnosisLine => ({
  id: `dx-line-${Date.now()}`,
  diagnosisId: item?.id ?? '',
  diagnosisName: item?.name ?? '',
  icd10: item?.icd10 ?? '',
  type: 'Primary',
  status: 'Active',
  notes: '',
});

const mapProblemToDiagnosisLine = (problem: string, index: number): DiagnosisLine => {
  const fromCatalog = DIAGNOSIS_CATALOG.find(
    (item) => item.name.toLowerCase() === problem.toLowerCase()
  );

  return {
    id: `dx-existing-${index}-${problem.toLowerCase().replace(/\s+/g, '-')}`,
    diagnosisId: fromCatalog?.id ?? '',
    diagnosisName: problem,
    icd10: fromCatalog?.icd10 ?? '',
    type: index === 0 ? 'Primary' : 'Secondary',
    status: 'Active',
    notes: '',
  };
};

export default function OpdVisitPage({ encounterId }: OpdVisitPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const { role } = useUser();
  const dispatch = useAppDispatch();
  const mrnParam = useMrnParam();
  const {
    encounters,
    orders,
    prescriptions,
    noteTemplates,
    notes,
    vitalTrends,
    orderCatalog,
    medicationCatalog,
    status: opdStatus,
    error: opdError,
  } = useOpdData();

  const encounter = React.useMemo(
    () => resolveEncounterFromState(encounters, { encounterId, mrn: mrnParam }),
    [encounters, encounterId, mrnParam]
  );

  const [activeTab, setActiveTab] = React.useState<VisitTab>('vitals');
  const [soap, setSoap] = React.useState<SoapNote>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });
  const [vitalsDraft, setVitalsDraft] = React.useState<VitalsDraft>({
    bp: '',
    hr: '',
    rr: '',
    temp: '',
    spo2: '',
    weightKg: '',
    bmi: '',
  });
  const [historyDraft, setHistoryDraft] = React.useState<HistoryDraft>({
    chiefComplaint: '',
    hpi: '',
    duration: '',
    severity: '',
  });
  const [historyTemplateOpen, setHistoryTemplateOpen] = React.useState(false);
  const [historyTemplateId, setHistoryTemplateId] = React.useState(HISTORY_TEMPLATES[0]?.id ?? '');
  const [voiceDialogOpen, setVoiceDialogOpen] = React.useState(false);
  const [voiceInputText, setVoiceInputText] = React.useState('');
  const [symptomDialogOpen, setSymptomDialogOpen] = React.useState(false);
  const [symptomDraft, setSymptomDraft] = React.useState<SymptomDraft>({
    symptom: '',
    duration: '',
    severity: '',
  });
  const [pastHistoryOpen, setPastHistoryOpen] = React.useState(false);
  const [allergyDialogOpen, setAllergyDialogOpen] = React.useState(false);
  const [allergyInput, setAllergyInput] = React.useState('');
  const [editingAllergyIndex, setEditingAllergyIndex] = React.useState<number | null>(null);
  const [diagnosisDialogOpen, setDiagnosisDialogOpen] = React.useState(false);
  const [diagnosisLines, setDiagnosisLines] = React.useState<DiagnosisLine[]>([]);
  const [diagnosisDraft, setDiagnosisDraft] = React.useState<DiagnosisLine>(() =>
    buildDiagnosisLineFromCatalog(DIAGNOSIS_CATALOG[0])
  );
  const [editingDiagnosisId, setEditingDiagnosisId] = React.useState<string | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = React.useState(false);
  const [notesDraft, setNotesDraft] = React.useState<NoteDraftLine>({
    title: '',
    content: '',
    author: '',
  });
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);
  const [notesTabDraft, setNotesTabDraft] = React.useState<NotesTabDraft>({
    progressNotes: '',
    patientInstructions: '',
    followupRequired: '',
    followupNotes: '',
  });
  const [selectedNoteTemplateId, setSelectedNoteTemplateId] = React.useState('');
  const [notesDictationOpen, setNotesDictationOpen] = React.useState(false);
  const [notesDictationText, setNotesDictationText] = React.useState('');
  const [workspaceStartedAt] = React.useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [ordersDialogOpen, setOrdersDialogOpen] = React.useState(false);
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = React.useState(false);
  const [orderCategoryFilter, setOrderCategoryFilter] = React.useState<'All' | OrderCatalogItem['category']>('All');
  const [orderDraft, setOrderDraft] = React.useState<DraftOrderLine>(() => buildDefaultOrderLine(orderCatalog));
  const [editingOrderId, setEditingOrderId] = React.useState<string | null>(null);
  const [prescriptionDraft, setPrescriptionDraft] = React.useState<PrescriptionLine>(() =>
    buildDefaultPrescriptionLine(medicationCatalog)
  );
  const [editingPrescriptionId, setEditingPrescriptionId] = React.useState<string | null>(null);
  const roleProfile = React.useMemo(() => getOpdRoleFlowProfile(role), [role]);
  const canStartConsult = roleProfile.capabilities.canStartConsult;
  const canViewClinicalHistory = roleProfile.capabilities.canViewClinicalHistory;
  const canDocumentConsultation = roleProfile.capabilities.canDocumentConsultation;
  const canPlaceOrders = roleProfile.capabilities.canPlaceOrders;
  const canPrescribe = roleProfile.capabilities.canPrescribe;
  const canCompleteVisit = roleProfile.capabilities.canCompleteVisit;
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const guardRoleAction = React.useCallback(
    (allowed: boolean, actionLabel: string): boolean => {
      if (allowed) return true;
      setSnackbar({
        open: true,
        message: `${roleProfile.label} cannot ${actionLabel}.`,
        severity: 'warning',
      });
      return false;
    },
    [roleProfile.label]
  );

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - workspaceStartedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [workspaceStartedAt]);

  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (!tabParam) return;

    if (isVisitTab(tabParam)) {
      setActiveTab(tabParam);
      return;
    }

    if (tabParam === 'overview') {
      setActiveTab('history');
    }
  }, [searchParams]);

  React.useEffect(() => {
    if (!encounter) return;

    setSoap((prev) => ({
      subjective: prev.subjective || encounter.triageNote,
      objective:
        prev.objective ||
        `BP ${encounter.vitals.bp}, HR ${encounter.vitals.hr}, Temp ${encounter.vitals.temp}, SpO2 ${encounter.vitals.spo2}`,
      assessment: prev.assessment || (encounter.problems.length ? encounter.problems.join(', ') : ''),
      plan: prev.plan,
    }));

    setVitalsDraft({
      bp: encounter.vitals.bp,
      hr: encounter.vitals.hr,
      rr: encounter.vitals.rr,
      temp: encounter.vitals.temp,
      spo2: encounter.vitals.spo2,
      weightKg: encounter.vitals.weightKg,
      bmi: encounter.vitals.bmi,
    });

    setHistoryDraft((prev) => ({
      chiefComplaint: prev.chiefComplaint || encounter.chiefComplaint,
      hpi: prev.hpi || encounter.triageNote,
      duration: prev.duration,
      severity: prev.severity,
    }));

    setDiagnosisLines(
      (encounter.problems ?? []).map((problem, index) => mapProblemToDiagnosisLine(problem, index))
    );
    setDiagnosisDraft(buildDiagnosisLineFromCatalog(DIAGNOSIS_CATALOG[0]));
    setEditingDiagnosisId(null);
    setDiagnosisDialogOpen(false);

    setNotesTabDraft({
      progressNotes: `Chief Complaint: ${encounter.chiefComplaint}\nHPI: ${encounter.triageNote}`,
      patientInstructions: '',
      followupRequired: '',
      followupNotes: '',
    });
  }, [encounter?.id]);

  React.useEffect(() => {
    if (!orderDraft.catalogId && orderCatalog.length > 0) {
      setOrderDraft(buildDefaultOrderLine(orderCatalog));
    }
  }, [orderCatalog, orderDraft.catalogId]);

  React.useEffect(() => {
    if (!prescriptionDraft.medicationId && medicationCatalog.length > 0) {
      setPrescriptionDraft(buildDefaultPrescriptionLine(medicationCatalog));
    }
  }, [medicationCatalog, prescriptionDraft.medicationId]);

  React.useEffect(() => {
    if (!selectedNoteTemplateId && noteTemplates.length > 0) {
      setSelectedNoteTemplateId(noteTemplates[0].id);
    }
  }, [noteTemplates, selectedNoteTemplateId]);

  const encounterOrders = React.useMemo(
    () => orders.filter((item) => item.encounterId === encounter?.id),
    [orders, encounter?.id]
  );
  const encounterPrescriptions = React.useMemo(
    () => prescriptions.filter((item) => item.encounterId === encounter?.id),
    [prescriptions, encounter?.id]
  );
  const encounterNotes = React.useMemo(
    () => notes.filter((item) => item.patientId === encounter?.id),
    [notes, encounter?.id]
  );
  const priorEncounters = React.useMemo(
    () =>
      encounters.filter(
        (item) => item.mrn === encounter?.mrn && item.id !== encounter?.id
      ),
    [encounters, encounter?.id, encounter?.mrn]
  );
  const priorEncounterIds = React.useMemo(
    () => new Set(priorEncounters.map((item) => item.id)),
    [priorEncounters]
  );
  const priorNotes = React.useMemo(
    () => notes.filter((item) => priorEncounterIds.has(item.patientId)),
    [notes, priorEncounterIds]
  );
  const latestTrend = React.useMemo(() => {
    const trends = vitalTrends.filter((item) => item.patientId === encounter?.id);
    return trends.length ? trends[trends.length - 1] : undefined;
  }, [encounter?.id, vitalTrends]);
  const filteredOrderCatalog = React.useMemo(
    () =>
      orderCatalog.filter(
        (item) => orderCategoryFilter === 'All' || item.category === orderCategoryFilter
      ),
    [orderCatalog, orderCategoryFilter]
  );

  const persistDiagnosisProblems = React.useCallback(
    (nextLines: DiagnosisLine[]) => {
      if (!encounter) return;
      dispatch(
        updateEncounter({
          id: encounter.id,
          changes: {
            problems: nextLines.map((line) => line.diagnosisName).filter(Boolean),
          },
        })
      );
    },
    [dispatch, encounter]
  );

  const resetDiagnosisForm = React.useCallback(() => {
    setDiagnosisDraft(buildDiagnosisLineFromCatalog(DIAGNOSIS_CATALOG[0]));
    setEditingDiagnosisId(null);
  }, []);

  const openDiagnosisDialog = () => {
    if (!guardRoleAction(canDocumentConsultation, 'manage diagnosis details in this encounter')) return;
    resetDiagnosisForm();
    setDiagnosisDialogOpen(true);
  };

  const closeDiagnosisDialog = () => {
    setDiagnosisDialogOpen(false);
    resetDiagnosisForm();
  };

  const handleDiagnosisSelection = (diagnosisId: string) => {
    const selected = DIAGNOSIS_CATALOG.find((item) => item.id === diagnosisId);
    setDiagnosisDraft((prev) => ({
      ...prev,
      diagnosisId,
      diagnosisName: selected?.name ?? '',
      icd10: selected?.icd10 ?? '',
    }));
  };

  const handleEditDiagnosis = (diagnosisId: string) => {
    if (!guardRoleAction(canDocumentConsultation, 'edit diagnosis details')) return;
    const selected = diagnosisLines.find((line) => line.id === diagnosisId);
    if (!selected) return;
    setDiagnosisDraft({
      ...selected,
      id: `dx-edit-${Date.now()}`,
    });
    setEditingDiagnosisId(selected.id);
    setDiagnosisDialogOpen(true);
  };

  const handleDeleteDiagnosis = (diagnosisId: string) => {
    if (!guardRoleAction(canDocumentConsultation, 'delete diagnosis entries')) return;
    const next = diagnosisLines.filter((line) => line.id !== diagnosisId);
    setDiagnosisLines(next);
    persistDiagnosisProblems(next);
    if (editingDiagnosisId === diagnosisId) {
      resetDiagnosisForm();
    }
    setSoap((prev) => ({
      ...prev,
      assessment: next.length ? next.map((line) => line.diagnosisName).join(', ') : '',
    }));
    setSnackbar({ open: true, message: 'Diagnosis removed successfully.', severity: 'success' });
  };

  const handleSaveDiagnosis = () => {
    if (!guardRoleAction(canDocumentConsultation, 'save diagnosis details')) return;
    const name = diagnosisDraft.diagnosisName.trim();
    if (!name) {
      setSnackbar({ open: true, message: 'Diagnosis is required.', severity: 'error' });
      return;
    }

    const normalizedName = name.toLowerCase();
    const duplicate = diagnosisLines.some(
      (line) => line.diagnosisName.trim().toLowerCase() === normalizedName && line.id !== editingDiagnosisId
    );

    if (duplicate) {
      setSnackbar({ open: true, message: 'Diagnosis already added.', severity: 'error' });
      return;
    }

    const payload: DiagnosisLine = {
      ...diagnosisDraft,
      diagnosisName: name,
    };

    if (editingDiagnosisId) {
      const next = diagnosisLines.map((line) => (line.id === editingDiagnosisId ? { ...payload, id: editingDiagnosisId } : line));
      setDiagnosisLines(next);
      persistDiagnosisProblems(next);
      setSoap((prev) => ({
        ...prev,
        assessment: next.map((line) => line.diagnosisName).join(', '),
      }));
      closeDiagnosisDialog();
      setSnackbar({ open: true, message: 'Diagnosis updated successfully.', severity: 'success' });
      return;
    }

    const created: DiagnosisLine = {
      ...payload,
      id: `dx-${Date.now()}`,
    };
    const next = [created, ...diagnosisLines];
    setDiagnosisLines(next);
    persistDiagnosisProblems(next);
    setSoap((prev) => ({
      ...prev,
      assessment: next.map((line) => line.diagnosisName).join(', '),
    }));
    closeDiagnosisDialog();
    setSnackbar({ open: true, message: 'Diagnosis added successfully.', severity: 'success' });
  };

  const handleViewDifferentialDx = () => {
    const differential = diagnosisLines.filter((line) => line.type === 'Differential');
    if (!differential.length) {
      setSnackbar({ open: true, message: 'No differential diagnosis added yet.', severity: 'info' });
      return;
    }
    setSnackbar({
      open: true,
      message: `Differential diagnosis: ${differential.map((line) => line.diagnosisName).join(', ')}`,
      severity: 'info',
    });
  };

  const handleUseClinicalGuidelines = () => {
    setSnackbar({
      open: true,
      message: 'Clinical guideline integration is not connected in this screen yet.',
      severity: 'info',
    });
  };

  const resetNotesForm = React.useCallback(() => {
    setNotesDraft({
      title: encounter ? `${encounter.patientName} - OPD Progress Note` : '',
      content: '',
      author: encounter?.doctor ?? '',
    });
    setEditingNoteId(null);
  }, [encounter]);

  const openNotesDialog = () => {
    if (!guardRoleAction(canDocumentConsultation, 'manage consultation notes')) return;
    resetNotesForm();
    setNotesDialogOpen(true);
  };

  const closeNotesDialog = () => {
    setNotesDialogOpen(false);
    resetNotesForm();
  };

  const handleEditNote = (noteId: string) => {
    if (!guardRoleAction(canDocumentConsultation, 'edit consultation notes')) return;
    const selected = encounterNotes.find((note) => note.id === noteId);
    if (!selected) return;
    setNotesDraft({
      title: selected.title,
      content: selected.content,
      author: selected.author,
    });
    setEditingNoteId(selected.id);
    setNotesDialogOpen(true);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!guardRoleAction(canDocumentConsultation, 'delete consultation notes')) return;
    dispatch(removeNote(noteId));
    if (editingNoteId === noteId) {
      resetNotesForm();
    }
    setSnackbar({ open: true, message: 'Note deleted successfully.', severity: 'success' });
  };

  const handleSaveNotesFromDialog = () => {
    if (!guardRoleAction(canDocumentConsultation, 'save consultation notes')) return;
    if (!encounter) return;
    if (!notesDraft.title.trim() || !notesDraft.content.trim()) {
      setSnackbar({ open: true, message: 'Note title and content are required.', severity: 'error' });
      return;
    }

    const savedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const payload = {
      title: notesDraft.title.trim(),
      content: notesDraft.content.trim(),
      author: notesDraft.author.trim() || encounter.doctor,
      savedAt,
    };

    if (editingNoteId) {
      dispatch(
        updateNote({
          id: editingNoteId,
          changes: payload,
        })
      );
      closeNotesDialog();
      setSnackbar({ open: true, message: 'Note updated successfully.', severity: 'success' });
      return;
    }

    dispatch(
      addNote({
        id: `note-${Date.now()}`,
        patientId: encounter.id,
        title: payload.title,
        content: payload.content,
        savedAt: payload.savedAt,
        author: payload.author,
      })
    );
    closeNotesDialog();
    setSnackbar({ open: true, message: 'Note added successfully.', severity: 'success' });
  };

  const handleOpenNotesDictation = () => {
    if (!guardRoleAction(canDocumentConsultation, 'dictate consultation notes')) return;
    setNotesDictationText(notesTabDraft.progressNotes);
    setNotesDictationOpen(true);
  };

  const handleApplyNotesDictation = () => {
    if (!guardRoleAction(canDocumentConsultation, 'apply dictated consultation notes')) return;
    const text = notesDictationText.trim();
    if (!text) {
      setSnackbar({ open: true, message: 'Enter dictated text before applying.', severity: 'error' });
      return;
    }
    setNotesTabDraft((prev) => ({ ...prev, progressNotes: text }));
    setNotesDictationOpen(false);
    setSnackbar({ open: true, message: 'Dictation applied to progress notes.', severity: 'success' });
  };

  const handleInsertNotesTemplate = () => {
    if (!guardRoleAction(canDocumentConsultation, 'insert note templates')) return;
    const template = noteTemplates.find((item) => item.id === selectedNoteTemplateId);
    if (!template) {
      setSnackbar({ open: true, message: 'Select a template first.', severity: 'error' });
      return;
    }

    setNotesTabDraft((prev) => ({
      ...prev,
      progressNotes: prev.progressNotes
        ? `${prev.progressNotes}\n\n${template.content}`
        : template.content,
    }));
    setSnackbar({ open: true, message: `${template.name} template inserted.`, severity: 'success' });
  };

  const handleInsertNotesMacro = () => {
    if (!guardRoleAction(canDocumentConsultation, 'insert clinical note macros')) return;
    const macro = [
      'Clinical reassessment done. Red-flag symptoms explained.',
      'Medication adherence reinforced and lifestyle modifications advised.',
    ].join('\n');
    setNotesTabDraft((prev) => ({
      ...prev,
      progressNotes: prev.progressNotes ? `${prev.progressNotes}\n\n${macro}` : macro,
    }));
    setSnackbar({ open: true, message: 'Clinical macro inserted.', severity: 'success' });
  };

  const handleGenerateHandout = () => {
    if (!guardRoleAction(canDocumentConsultation, 'generate patient handouts')) return;
    if (!encounter) return;
    if (!notesTabDraft.patientInstructions.trim()) {
      setSnackbar({ open: true, message: 'Add patient instructions to generate handout.', severity: 'error' });
      return;
    }

    setNotesDraft({
      title: `${encounter.patientName} - Patient Instructions`,
      author: encounter.doctor,
      content: [
        'Patient Instructions',
        notesTabDraft.patientInstructions.trim(),
        notesTabDraft.followupRequired ? `Follow-up: ${notesTabDraft.followupRequired}` : '',
        notesTabDraft.followupNotes ? `Follow-up Notes: ${notesTabDraft.followupNotes}` : '',
      ]
        .filter(Boolean)
        .join('\n\n'),
    });
    setEditingNoteId(null);
    setNotesDialogOpen(true);
    setSnackbar({ open: true, message: 'Handout draft prepared in notes dialog.', severity: 'info' });
  };

  const handleScheduleFollowup = () => {
    if (!guardRoleAction(canDocumentConsultation, 'schedule follow-up plans')) return;
    if (!encounter) return;
    if (!notesTabDraft.followupRequired) {
      setSnackbar({ open: true, message: 'Select follow-up timeframe.', severity: 'error' });
      return;
    }

    const content = [
      `Progress Notes: ${notesTabDraft.progressNotes || '--'}`,
      `Patient Instructions: ${notesTabDraft.patientInstructions || '--'}`,
      `Follow-up Required: ${notesTabDraft.followupRequired}`,
      `Follow-up Notes: ${notesTabDraft.followupNotes || '--'}`,
    ].join('\n');

    dispatch(
      addNote({
        id: `note-followup-${Date.now()}`,
        patientId: encounter.id,
        title: `${encounter.patientName} - Follow-up Plan`,
        content,
        savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: encounter.doctor,
      })
    );

    setSnackbar({
      open: true,
      message: `Follow-up scheduled for ${notesTabDraft.followupRequired}.`,
      severity: 'success',
    });
  };

  const resetOrderForm = React.useCallback(() => {
    setOrderDraft(buildDefaultOrderLine(orderCatalog));
    setEditingOrderId(null);
  }, [orderCatalog]);

  const openOrderDialog = () => {
    if (!guardRoleAction(canPlaceOrders, 'manage encounter orders')) return;
    resetOrderForm();
    setOrdersDialogOpen(true);
  };

  const closeOrderDialog = () => {
    setOrdersDialogOpen(false);
    resetOrderForm();
  };

  const handleEditOrder = (orderId: string) => {
    if (!guardRoleAction(canPlaceOrders, 'edit encounter orders')) return;
    const selectedOrder = encounterOrders.find((item) => item.id === orderId);
    if (!selectedOrder) return;

    const matchingCatalog = orderCatalog.find(
      (item) => item.name === selectedOrder.orderName && item.category === selectedOrder.category
    );

    setOrderCategoryFilter(selectedOrder.category);
    setOrderDraft({
      id: `order-edit-${Date.now()}`,
      catalogId: matchingCatalog?.id ?? orderCatalog[0]?.id ?? '',
      priority: selectedOrder.priority,
      instructions: selectedOrder.instructions,
    });
    setEditingOrderId(selectedOrder.id);
    setOrdersDialogOpen(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (!guardRoleAction(canPlaceOrders, 'delete encounter orders')) return;
    dispatch(removeEncounterOrder(orderId));
    if (editingOrderId === orderId) {
      resetOrderForm();
    }
    setSnackbar({ open: true, message: 'Order removed successfully.', severity: 'success' });
  };

  const resetPrescriptionForm = React.useCallback(() => {
    setPrescriptionDraft(buildDefaultPrescriptionLine(medicationCatalog));
    setEditingPrescriptionId(null);
  }, [medicationCatalog]);

  const openPrescriptionDialog = () => {
    if (!guardRoleAction(canPrescribe, 'manage encounter prescriptions')) return;
    resetPrescriptionForm();
    setPrescriptionDialogOpen(true);
  };

  const closePrescriptionDialog = () => {
    setPrescriptionDialogOpen(false);
    resetPrescriptionForm();
  };

  const handleEditPrescription = (prescriptionId: string) => {
    if (!guardRoleAction(canPrescribe, 'edit encounter prescriptions')) return;
    const selectedPrescription = encounterPrescriptions.find((item) => item.id === prescriptionId);
    if (!selectedPrescription) return;

    const matchingMedication = medicationCatalog.find(
      (item) => `${item.genericName} ${item.strength}` === selectedPrescription.medicationName
    );

    setPrescriptionDraft({
      id: `rx-edit-${Date.now()}`,
      medicationId: matchingMedication?.id ?? medicationCatalog[0]?.id ?? '',
      dose: selectedPrescription.dose,
      frequency: selectedPrescription.frequency,
      durationDays: selectedPrescription.durationDays,
      route: selectedPrescription.route,
      instructions: selectedPrescription.instructions,
    });
    setEditingPrescriptionId(selectedPrescription.id);
    setPrescriptionDialogOpen(true);
  };

  const handleDeletePrescription = (prescriptionId: string) => {
    if (!guardRoleAction(canPrescribe, 'delete encounter prescriptions')) return;
    dispatch(removeEncounterPrescription(prescriptionId));
    if (editingPrescriptionId === prescriptionId) {
      resetPrescriptionForm();
    }

    setSnackbar({ open: true, message: 'Medication removed from prescription list.', severity: 'success' });
  };

  const saveVitals = () => {
    if (!guardRoleAction(canDocumentConsultation, 'save vitals')) return;
    if (!encounter) return;
    if (!vitalsDraft.bp || !vitalsDraft.hr || !vitalsDraft.rr || !vitalsDraft.temp || !vitalsDraft.spo2) {
      setSnackbar({ open: true, message: 'BP, HR, RR, Temp and SpO2 are required.', severity: 'error' });
      return;
    }

    dispatch(
      updateEncounter({
        id: encounter.id,
        changes: { vitals: vitalsDraft },
      })
    );

    dispatch(
      addVitalTrend({
        id: `vt-${Date.now()}`,
        patientId: encounter.id,
        recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bp: vitalsDraft.bp,
        hr: vitalsDraft.hr,
        rr: vitalsDraft.rr,
        temp: vitalsDraft.temp,
        spo2: vitalsDraft.spo2,
        painScore: latestTrend?.painScore ?? 0,
        nurse: 'Nurse Duty',
      })
    );

    setSnackbar({ open: true, message: 'Vitals saved to encounter timeline.', severity: 'success' });
  };

  const saveClinicalNote = () => {
    if (!guardRoleAction(canDocumentConsultation, 'save consultation notes')) return;
    if (!encounter) return;
    if (!soap.assessment.trim() || !soap.plan.trim()) {
      setSnackbar({ open: true, message: 'Assessment and plan are required.', severity: 'error' });
      return;
    }

    const subjectiveSummary = [
      historyDraft.chiefComplaint ? `Chief Complaint: ${historyDraft.chiefComplaint}` : '',
      historyDraft.hpi ? `HPI: ${historyDraft.hpi}` : '',
      historyDraft.duration ? `Duration: ${historyDraft.duration}` : '',
      historyDraft.severity ? `Severity: ${historyDraft.severity}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    dispatch(
      addNote({
        id: `note-${Date.now()}`,
        patientId: encounter.id,
        title: `${encounter.patientName} - OPD Progress Note`,
        content: [
          `Subjective: ${subjectiveSummary || soap.subjective}`,
          `Objective: ${soap.objective}`,
          `Assessment: ${soap.assessment}`,
          `Plan: ${soap.plan}`,
        ].join('\n'),
        savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        author: encounter.doctor,
      })
    );

    setSnackbar({ open: true, message: 'Consultation note saved.', severity: 'success' });
  };

  const persistHistoryDraft = React.useCallback(
    (nextDraft: HistoryDraft) => {
      if (!encounter) return;
      dispatch(
        updateEncounter({
          id: encounter.id,
          changes: {
            chiefComplaint: nextDraft.chiefComplaint,
            triageNote: nextDraft.hpi,
          },
        })
      );
    },
    [dispatch, encounter]
  );

  const persistAllergies = React.useCallback(
    (allergies: string[]) => {
      if (!encounter) return;
      const cleaned = sanitizeAllergies(allergies);
      dispatch(
        updateEncounter({
          id: encounter.id,
          changes: {
            allergies: cleaned.length > 0 ? cleaned : ['No known allergies'],
          },
        })
      );
    },
    [dispatch, encounter]
  );

  const handleVoiceInput = () => {
    if (!guardRoleAction(canDocumentConsultation, 'capture voice complaint notes')) return;
    setVoiceInputText(historyDraft.chiefComplaint);
    setVoiceDialogOpen(true);
  };

  const handleApplyVoiceInput = () => {
    if (!guardRoleAction(canDocumentConsultation, 'apply voice complaint notes')) return;
    const transcript = voiceInputText.trim();
    if (!transcript) {
      setSnackbar({ open: true, message: 'Enter dictated text before applying.', severity: 'error' });
      return;
    }

    const nextDraft = { ...historyDraft, chiefComplaint: transcript };
    setHistoryDraft(nextDraft);
    persistHistoryDraft(nextDraft);
    setVoiceDialogOpen(false);
    setSnackbar({ open: true, message: 'Voice input applied to chief complaint.', severity: 'success' });
  };

  const handleUseComplaintTemplate = () => {
    if (!guardRoleAction(canDocumentConsultation, 'use history templates')) return;
    setHistoryTemplateOpen(true);
  };

  const handleApplyComplaintTemplate = () => {
    if (!guardRoleAction(canDocumentConsultation, 'apply history templates')) return;
    const selected = HISTORY_TEMPLATES.find((item) => item.id === historyTemplateId);
    if (!selected) {
      setSnackbar({ open: true, message: 'Select a template to apply.', severity: 'error' });
      return;
    }

    const nextDraft: HistoryDraft = {
      chiefComplaint: selected.chiefComplaint,
      hpi: selected.hpi,
      duration: selected.duration,
      severity: selected.severity,
    };

    setHistoryDraft(nextDraft);
    setSoap((prev) => ({ ...prev, subjective: selected.hpi }));
    persistHistoryDraft(nextDraft);
    setHistoryTemplateOpen(false);
    setSnackbar({ open: true, message: `${selected.name} template applied.`, severity: 'success' });
  };

  const handleAddSymptom = () => {
    if (!guardRoleAction(canDocumentConsultation, 'add symptom details')) return;
    setSymptomDraft({
      symptom: '',
      duration: historyDraft.duration,
      severity: historyDraft.severity,
    });
    setSymptomDialogOpen(true);
  };

  const handleSaveSymptom = () => {
    if (!guardRoleAction(canDocumentConsultation, 'save symptom details')) return;
    const symptom = symptomDraft.symptom.trim();
    if (!symptom) {
      setSnackbar({ open: true, message: 'Symptom name is required.', severity: 'error' });
      return;
    }

    const symptomDuration = symptomDraft.duration || historyDraft.duration || 'Unspecified duration';
    const symptomSeverity = symptomDraft.severity || historyDraft.severity || 'Unspecified severity';
    const symptomLine = `- ${symptom} (${symptomDuration}, ${symptomSeverity})`;
    const nextHpi = historyDraft.hpi ? `${historyDraft.hpi}\n${symptomLine}` : symptomLine;
    const nextDraft: HistoryDraft = {
      ...historyDraft,
      hpi: nextHpi,
      duration: symptomDraft.duration || historyDraft.duration,
      severity: symptomDraft.severity || historyDraft.severity,
    };

    setHistoryDraft(nextDraft);
    setSoap((prev) => ({ ...prev, subjective: nextHpi }));
    persistHistoryDraft(nextDraft);
    setSymptomDialogOpen(false);
    setSnackbar({ open: true, message: 'Symptom added to HPI.', severity: 'success' });
  };

  const handleViewPastHistory = () => {
    setPastHistoryOpen(true);
  };

  const handleInsertPastHistory = (sourceEncounterId: string) => {
    if (!guardRoleAction(canDocumentConsultation, 'insert past history details')) return;
    const source = priorEncounters.find((item) => item.id === sourceEncounterId);
    if (!source) {
      setSnackbar({ open: true, message: 'Unable to find selected past encounter.', severity: 'error' });
      return;
    }

    const summary = `Past history (${source.appointmentTime}): ${source.chiefComplaint}. ${source.triageNote}`;
    const nextHpi = historyDraft.hpi ? `${historyDraft.hpi}\n${summary}` : summary;
    const nextDraft = { ...historyDraft, hpi: nextHpi };

    setHistoryDraft(nextDraft);
    setSoap((prev) => ({ ...prev, subjective: nextHpi }));
    persistHistoryDraft(nextDraft);
    setPastHistoryOpen(false);
    setSnackbar({ open: true, message: 'Past history inserted into HPI.', severity: 'success' });
  };

  const handleReviewCurrentMedications = () => {
    if (!guardRoleAction(canPrescribe, 'review current medications in prescriptions')) return;
    setActiveTab('prescriptions');
    setSnackbar({ open: true, message: 'Opened prescriptions for medication review.', severity: 'info' });
  };

  const handleAddAllergy = () => {
    if (!guardRoleAction(canDocumentConsultation, 'add allergy details')) return;
    setAllergyDialogOpen(true);
    setEditingAllergyIndex(null);
    setAllergyInput('');
  };

  const handleEditAllergies = () => {
    if (!guardRoleAction(canDocumentConsultation, 'edit allergy details')) return;
    setAllergyDialogOpen(true);
    setEditingAllergyIndex(null);
    setAllergyInput('');
  };

  const closeAllergyDialog = () => {
    setAllergyDialogOpen(false);
    setEditingAllergyIndex(null);
    setAllergyInput('');
  };

  const handleSelectAllergyForEdit = (index: number) => {
    if (!encounter) return;
    const cleaned = sanitizeAllergies(encounter.allergies);
    const selected = cleaned[index];
    if (!selected) return;
    setEditingAllergyIndex(index);
    setAllergyInput(selected);
  };

  const handleSaveAllergy = () => {
    if (!guardRoleAction(canDocumentConsultation, 'save allergy details')) return;
    if (!encounter) return;
    const value = allergyInput.trim();
    if (!value) {
      setSnackbar({ open: true, message: 'Allergy name is required.', severity: 'error' });
      return;
    }

    const current = sanitizeAllergies(encounter.allergies);
    const next = editingAllergyIndex === null
      ? [...current, value]
      : current.map((item, index) => (index === editingAllergyIndex ? value : item));

    persistAllergies(next);
    setAllergyInput('');
    setEditingAllergyIndex(null);
    setSnackbar({
      open: true,
      message: editingAllergyIndex === null ? 'Allergy added.' : 'Allergy updated.',
      severity: 'success',
    });
  };

  const handleDeleteAllergy = (index: number) => {
    if (!guardRoleAction(canDocumentConsultation, 'delete allergy details')) return;
    if (!encounter) return;
    const current = sanitizeAllergies(encounter.allergies);
    const next = current.filter((_, itemIndex) => itemIndex !== index);
    persistAllergies(next);
    if (editingAllergyIndex === index) {
      setEditingAllergyIndex(null);
      setAllergyInput('');
    }
    setSnackbar({ open: true, message: 'Allergy removed.', severity: 'success' });
  };

  const handleStartVisit = () => {
    if (!guardRoleAction(canStartConsult, 'start consultation')) return;
    if (!encounter) return;

    dispatch(
      updateEncounter({
        id: encounter.id,
        changes: { status: 'IN_PROGRESS' },
      })
    );
    setSnackbar({ open: true, message: 'Consultation started.', severity: 'success' });
  };

  const handleSaveConsultationDraft = () => {
    if (!guardRoleAction(canDocumentConsultation, 'save consultation draft')) return;
    setSnackbar({ open: true, message: 'Consultation draft saved locally.', severity: 'info' });
  };

  const handleExitVisit = () => {
    if (!encounter) return;
    router.push(`/appointments/queue?mrn=${encodeURIComponent(encounter.mrn)}`);
  };

  const handleCompleteVisit = () => {
    if (!guardRoleAction(canCompleteVisit, 'complete consultation')) return;
    if (!encounter) return;
    if (encounter.status !== 'IN_PROGRESS') {
      setSnackbar({
        open: true,
        message: 'Consultation must be IN_PROGRESS before completion.',
        severity: 'error',
      });
      return;
    }

    dispatch(
      updateEncounter({
        id: encounter.id,
        changes: { status: 'COMPLETED' },
      })
    );

    setSnackbar({ open: true, message: `Visit completed for ${encounter.patientName}.`, severity: 'success' });
    router.push(`/appointments/queue?mrn=${encodeURIComponent(encounter.mrn)}`);
  };

  const handleSaveOrder = () => {
    if (!guardRoleAction(canPlaceOrders, 'save encounter orders')) return;
    if (!encounter) return;
    const selectedCatalog = orderCatalog.find((item) => item.id === orderDraft.catalogId);
    if (!selectedCatalog) {
      setSnackbar({ open: true, message: 'Select an order from catalog.', severity: 'error' });
      return;
    }

    const orderedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (editingOrderId) {
      dispatch(
        updateEncounterOrder({
          id: editingOrderId,
          changes: {
            orderName: selectedCatalog.name,
            category: selectedCatalog.category,
            priority: orderDraft.priority,
            instructions: orderDraft.instructions,
            orderedAt,
          },
        })
      );
      closeOrderDialog();
      setSnackbar({ open: true, message: 'Order updated successfully.', severity: 'success' });
      return;
    }

    dispatch(
      addEncounterOrder({
        id: `order-${Date.now()}`,
        encounterId: encounter.id,
        patientId: encounter.patientId,
        orderName: selectedCatalog.name,
        category: selectedCatalog.category,
        priority: orderDraft.priority,
        status: 'Pending',
        instructions: orderDraft.instructions,
        orderedAt,
      })
    );

    dispatch(
      updateEncounter({
        id: encounter.id,
        changes: { status: 'IN_PROGRESS' },
      })
    );

    closeOrderDialog();
    setSnackbar({ open: true, message: 'Order added successfully.', severity: 'success' });
  };

  const handleSavePrescription = () => {
    if (!guardRoleAction(canPrescribe, 'save encounter prescriptions')) return;
    if (!encounter) return;

    if (
      !prescriptionDraft.medicationId ||
      !prescriptionDraft.dose ||
      !prescriptionDraft.frequency ||
      !prescriptionDraft.durationDays
    ) {
      setSnackbar({ open: true, message: 'Medication, dose, frequency and duration are required.', severity: 'error' });
      return;
    }

    const medication = medicationCatalog.find((item) => item.id === prescriptionDraft.medicationId);
    if (!medication) {
      setSnackbar({ open: true, message: 'Select a valid medication from catalog.', severity: 'error' });
      return;
    }

    const issuedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (editingPrescriptionId) {
      dispatch(
        updateEncounterPrescription({
          id: editingPrescriptionId,
          changes: {
            medicationName: `${medication.genericName} ${medication.strength}`,
            dose: prescriptionDraft.dose,
            frequency: prescriptionDraft.frequency,
            durationDays: prescriptionDraft.durationDays,
            route: prescriptionDraft.route,
            instructions: prescriptionDraft.instructions,
            issuedAt,
          },
        })
      );
      closePrescriptionDialog();
      setSnackbar({ open: true, message: 'Medication updated successfully.', severity: 'success' });
      return;
    }

    dispatch(
      addEncounterPrescription({
        id: `rx-issued-${Date.now()}`,
        encounterId: encounter.id,
        patientId: encounter.patientId,
        medicationName: `${medication.genericName} ${medication.strength}`,
        dose: prescriptionDraft.dose,
        frequency: prescriptionDraft.frequency,
        durationDays: prescriptionDraft.durationDays,
        route: prescriptionDraft.route,
        instructions: prescriptionDraft.instructions,
        issuedAt,
      })
    );

    dispatch(
      updateEncounter({
        id: encounter.id,
        changes: { status: 'IN_PROGRESS' },
      })
    );

    closePrescriptionDialog();
    setSnackbar({ open: true, message: 'Medication added successfully.', severity: 'success' });
  };

  if (!encounter) {
    return (
      <OpdLayout title="Encounter" currentPageTitle="Encounter" subtitle={mrnParam ? `MRN ${mrnParam}` : undefined}>
        <Alert severity="warning">No encounter found. Start from Queue and select a patient.</Alert>
      </OpdLayout>
    );
  }

  const allergyList = encounter.allergies.filter(
    (item) => item && item.toLowerCase() !== 'no known allergies'
  );
  const managedAllergies = sanitizeAllergies(encounter.allergies);
  const workspaceDateLabel = React.useMemo(() => {
    const current = new Date();
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    return `Date ${year}-${month}-${day}`;
  }, []);

  return (
    <OpdLayout title="Consultation Workspace" currentPageTitle="Consultation">
      {opdStatus === 'loading' ? <Alert severity="info">Loading OPD data from the local JSON server.</Alert> : null}
      {opdStatus === 'error' ? (
        <Alert severity="warning">
          OPD JSON server not reachable. Showing fallback data.
          {opdError ? ` (${opdError})` : ''}
        </Alert>
      ) : null}

      <ConsultationWorkspaceHeader
        status={encounter.status}
        elapsedLabel={formatElapsed(elapsedSeconds)}
        dateLabel={workspaceDateLabel}
        surfaceColor={softSurface}
        onSaveDraft={handleSaveConsultationDraft}
        onExit={handleExitVisit}
        onComplete={handleCompleteVisit}
        onStart={handleStartVisit}
        canSaveDraft={canDocumentConsultation}
        canStart={canStartConsult}
        canComplete={canCompleteVisit}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} lg={3}>
          <Card
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
              backgroundColor: 'background.paper',
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 700, fontSize: 22 }}>
                  {getInitials(encounter.patientName)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {encounter.patientName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {encounter.mrn}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <Stack spacing={0.8}>
                {[
                  ['Age', getPatientAge(encounter.ageGender)],
                  ['Gender', getPatientGender(encounter.ageGender)],
                  ['Department', encounter.department],
                  ['Check-in Time', encounter.appointmentTime],
                ].map(([label, value]) => (
                  <Stack
                    key={label}
                    direction="row"
                    justifyContent="space-between"
                    sx={{
                      px: 1.2,
                      py: 1.05,
                      borderRadius: 1.2,
                      backgroundColor: alpha(theme.palette.text.primary, 0.02),
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Divider />

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Alerts
              </Typography>

              <Stack spacing={0.7}>
                <Box
                  sx={{
                    px: 1.2,
                    py: 0.45,
                    borderRadius: 999,
                    border: '1px solid',
                    borderColor:
                      encounter.queuePriority === 'Urgent'
                        ? alpha(theme.palette.error.main, 0.4)
                        : alpha(theme.palette.info.main, 0.4),
                    color: encounter.queuePriority === 'Urgent' ? 'error.main' : 'info.main',
                    backgroundColor:
                      encounter.queuePriority === 'Urgent'
                        ? alpha(theme.palette.error.main, 0.08)
                        : alpha(theme.palette.info.main, 0.08),
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  Priority: {encounter.queuePriority}
                </Box>

                {allergyList.length === 0 ? (
                  <Box
                    sx={{
                      px: 1.2,
                      py: 0.45,
                      borderRadius: 999,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.success.main, 0.35),
                      color: 'success.main',
                      backgroundColor: alpha(theme.palette.success.main, 0.08),
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    No known allergies
                  </Box>
                ) : (
                  allergyList.map((allergy) => (
                    <Box
                      key={allergy}
                      sx={{
                        px: 1.2,
                        py: 0.45,
                        borderRadius: 999,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.error.main, 0.4),
                        color: 'error.main',
                        backgroundColor: alpha(theme.palette.error.main, 0.08),
                        textAlign: 'center',
                        fontWeight: 600,
                      }}
                    >
                      Allergy: {allergy}
                    </Box>
                  ))
                )}
              </Stack>

              <Stack spacing={0.8} sx={{ pt: 0.6 }}>
                <Button
                  variant="outlined"
                  disabled={!canViewClinicalHistory}
                  onClick={() => setActiveTab('history')}
                >
                  View Full Medical History
                </Button>
                <Button
                  variant="outlined"
                  disabled={!canViewClinicalHistory}
                  onClick={() => setActiveTab('notes')}
                >
                  View Documents & Notes
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} lg={9}>
          <Card
            elevation={0}
            sx={{
              p: 0,
              borderRadius: 2,
              boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
              backgroundColor: 'background.paper',
            }}
          >
            <Box
              sx={{
                px: 0.75,
                py: 0.75,
                borderBottom: '1px solid',
                borderColor: alpha(theme.palette.text.primary, 0.06),
              }}
            >
              <OpdTabs tabs={VISIT_TABS} value={activeTab} onChange={(value) => setActiveTab(value as VisitTab)} />
            </Box>

            <Stack spacing={1.5} sx={{ p: 2 }}>

              {activeTab === 'vitals' ? (
                <Stack spacing={1.2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MonitorHeartIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Vital Signs
                    </Typography>
                  </Stack>
                  <Grid container spacing={1.2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Blood Pressure"
                        value={vitalsDraft.bp}
                        onChange={(event) => setVitalsDraft((prev) => ({ ...prev, bp: event.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Heart Rate"
                        value={vitalsDraft.hr}
                        onChange={(event) => setVitalsDraft((prev) => ({ ...prev, hr: event.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Respiratory Rate"
                        value={vitalsDraft.rr}
                        onChange={(event) => setVitalsDraft((prev) => ({ ...prev, rr: event.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Temperature"
                        value={vitalsDraft.temp}
                        onChange={(event) => setVitalsDraft((prev) => ({ ...prev, temp: event.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SpO2"
                        value={vitalsDraft.spo2}
                        onChange={(event) => setVitalsDraft((prev) => ({ ...prev, spo2: event.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Weight (kg)"
                        value={vitalsDraft.weightKg}
                        onChange={(event) => setVitalsDraft((prev) => ({ ...prev, weightKg: event.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="BMI"
                        value={vitalsDraft.bmi}
                        onChange={(event) => setVitalsDraft((prev) => ({ ...prev, bmi: event.target.value }))}
                      />
                    </Grid>
                  </Grid>
                  <Stack direction="row" justifyContent="flex-end">
                    <Button variant="contained" disabled={!canDocumentConsultation} onClick={saveVitals}>
                      Save Vitals
                    </Button>
                  </Stack>
                </Stack>
              ) : null}

              {activeTab === 'history' ? (
                <Stack spacing={1.2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <HistoryIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      History
                    </Typography>
                  </Stack>
                  <Card variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
                    <Stack spacing={1.1}>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <RecordVoiceOverIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Chief Complaint
                        </Typography>
                      </Stack>
                      <TextField
                        fullWidth
                        required
                        multiline
                        minRows={3}
                        label="Primary Complaint"
                        value={historyDraft.chiefComplaint}
                        onChange={(event) => {
                          const nextDraft = { ...historyDraft, chiefComplaint: event.target.value };
                          setHistoryDraft(nextDraft);
                        }}
                        onBlur={() => persistHistoryDraft(historyDraft)}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Brief description of the patient&apos;s main concern.
                      </Typography>
                      <Stack direction="row" spacing={0.8} flexWrap="wrap">
                        <Button variant="outlined" size="small" startIcon={<MicIcon />} onClick={handleVoiceInput}>
                          Voice Input
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<TextSnippetIcon />}
                          onClick={handleUseComplaintTemplate}
                        >
                          Use Template
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>

                  <Card variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
                    <Stack spacing={1.1}>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <HistoryEduIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          History of Present Illness (HPI)
                        </Typography>
                      </Stack>
                      <TextField
                        fullWidth
                        multiline
                        minRows={6}
                        label="Detailed History"
                        value={historyDraft.hpi}
                        onChange={(event) => {
                          const nextHpi = event.target.value;
                          const nextDraft = { ...historyDraft, hpi: nextHpi };
                          setHistoryDraft(nextDraft);
                          setSoap((prev) => ({ ...prev, subjective: nextHpi }));
                        }}
                        onBlur={() => persistHistoryDraft(historyDraft)}
                      />
                      <Grid container spacing={1.2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            select
                            fullWidth
                            label="Duration"
                            value={historyDraft.duration}
                            onChange={(event) => {
                              const nextDraft = { ...historyDraft, duration: event.target.value };
                              setHistoryDraft(nextDraft);
                            }}
                            onBlur={() => persistHistoryDraft(historyDraft)}
                          >
                            <MenuItem value="">Select duration</MenuItem>
                            {[
                              'Less than 24 hours',
                              '1-3 days',
                              '4-7 days',
                              '1-2 weeks',
                              '2-4 weeks',
                              'More than 1 month',
                            ].map((durationOption) => (
                              <MenuItem key={durationOption} value={durationOption}>
                                {durationOption}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            select
                            fullWidth
                            label="Severity"
                            value={historyDraft.severity}
                            onChange={(event) => {
                              const nextDraft = { ...historyDraft, severity: event.target.value };
                              setHistoryDraft(nextDraft);
                            }}
                            onBlur={() => persistHistoryDraft(historyDraft)}
                          >
                            <MenuItem value="">Select severity</MenuItem>
                            {['Mild', 'Moderate', 'Severe'].map((severityOption) => (
                              <MenuItem key={severityOption} value={severityOption}>
                                {severityOption}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                      </Grid>
                      <Stack direction="row" spacing={0.8} flexWrap="wrap">
                        <Button variant="outlined" size="small" startIcon={<LibraryAddIcon />} onClick={handleAddSymptom}>
                          Add Symptom
                        </Button>
                        <Button variant="outlined" size="small" startIcon={<HistoryIcon />} onClick={handleViewPastHistory}>
                          Past History
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>

                  <Card variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
                    <Stack spacing={1.1}>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <LocalPharmacyIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Current Medications
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.8}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<LocalPharmacyIcon />}
                          onClick={handleReviewCurrentMedications}
                        >
                          Review Current Medications
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>

                  <Card variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
                    <Stack spacing={1.1}>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <WarningAmberIcon color={allergyList.length ? 'error' : 'primary'} fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Allergies
                        </Typography>
                      </Stack>
                      <Alert severity={allergyList.length ? 'error' : 'success'}>
                        {allergyList.length
                          ? `Known Allergies: ${allergyList.join(', ')}`
                          : 'No known allergies documented.'}
                      </Alert>
                      <Stack direction="row" spacing={0.8} flexWrap="wrap">
                        <Button variant="outlined" size="small" startIcon={<LibraryAddIcon />} onClick={handleAddAllergy}>
                          Add Allergy
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditOutlinedIcon />}
                          onClick={handleEditAllergies}
                        >
                          Edit Allergies
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                </Stack>
              ) : null}

              {activeTab === 'diagnosis' ? (
                <Stack spacing={1.2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BiotechIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Diagnosis
                    </Typography>
                  </Stack>
                  <OpdTable
                    title="Diagnosis List"
                    action={(
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<BiotechIcon />}
                        disabled={!canDocumentConsultation}
                        onClick={openDiagnosisDialog}
                      >
                        Manage Diagnosis
                      </Button>
                    )}
                    rows={diagnosisLines}
                    emptyMessage="No diagnosis added yet."
                    rowKey={(row) => row.id}
                    variant="plain"
                    columns={[
                      {
                        id: 'diagnosis',
                        label: 'Diagnosis',
                        render: (row) => (
                          <Stack spacing={0.2}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {row.diagnosisName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.icd10 || 'ICD code not set'}
                            </Typography>
                          </Stack>
                        ),
                      },
                      { id: 'type', label: 'Type', render: (row) => row.type },
                      {
                        id: 'status',
                        label: 'Status',
                        render: (row) => (
                          <Chip
                            size="small"
                            label={row.status}
                            color={row.status === 'Active' ? 'success' : row.status === 'Resolved' ? 'default' : 'warning'}
                            variant={row.status === 'Active' ? 'filled' : 'outlined'}
                          />
                        ),
                      },
                      { id: 'notes', label: 'Notes', render: (row) => row.notes || '--' },
                      {
                        id: 'actions',
                        label: 'Actions',
                        align: 'right',
                        render: (row) => (
                          <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                            <IconButton
                              size="small"
                              aria-label="Edit diagnosis"
                              disabled={!canDocumentConsultation}
                              onClick={() => handleEditDiagnosis(row.id)}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              aria-label="Delete diagnosis"
                              color="error"
                              disabled={!canDocumentConsultation}
                              onClick={() => handleDeleteDiagnosis(row.id)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        ),
                      },
                    ]}
                  />
                  {/* <Stack direction="row" spacing={0.8} flexWrap="wrap">
                    <Button variant="outlined" size="small" startIcon={<BiotechIcon />} onClick={handleViewDifferentialDx}>
                      Differential Diagnosis
                    </Button>
                    <Button variant="outlined" size="small" startIcon={<DescriptionIcon />} onClick={handleUseClinicalGuidelines}>
                      Clinical Guidelines
                    </Button>
                  </Stack> */}

                  <Stack spacing={1}>
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <DescriptionIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Assessment & Plan
                      </Typography>
                    </Stack>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      label="Clinical Assessment"
                      value={soap.assessment}
                      onChange={(event) => setSoap((prev) => ({ ...prev, assessment: event.target.value }))}
                    />
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      label="Treatment Plan"
                      value={soap.plan}
                      onChange={(event) => setSoap((prev) => ({ ...prev, plan: event.target.value }))}
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={!canDocumentConsultation}
                      onClick={saveClinicalNote}
                    >
                      Save Consultation Note
                    </Button>
                  </Stack>
                </Stack>
              ) : null}

              {activeTab === 'orders' ? (
                <Stack spacing={1}>
                  <OpdTable
                    title="Orders"
                    action={(
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ScienceIcon />}
                        disabled={!canPlaceOrders}
                        onClick={openOrderDialog}
                      >
                        Manage Orders
                      </Button>
                    )}
                    rows={encounterOrders}
                    emptyMessage="No orders on this encounter."
                    rowKey={(row) => row.id}
                    variant="plain"
                    columns={[
                      { id: 'name', label: 'Order', render: (row) => row.orderName },
                      { id: 'category', label: 'Category', render: (row) => row.category },
                      { id: 'priority', label: 'Priority', render: (row) => row.priority },
                      { id: 'status', label: 'Status', render: (row) => row.status },
                      {
                        id: 'actions',
                        label: 'Actions',
                        align: 'right',
                        render: (row) => (
                          <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                            <IconButton
                              size="small"
                              aria-label="Edit order"
                              disabled={!canPlaceOrders}
                              onClick={() => handleEditOrder(row.id)}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              aria-label="Delete order"
                              color="error"
                              disabled={!canPlaceOrders}
                              onClick={() => handleDeleteOrder(row.id)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        ),
                      },
                    ]}
                  />
                </Stack>
              ) : null}

              {activeTab === 'prescriptions' ? (
                <Stack spacing={1}>
                  <OpdTable
                    title="Prescriptions"
                    action={(
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<LocalPharmacyIcon />}
                        disabled={!canPrescribe}
                        onClick={openPrescriptionDialog}
                      >
                        Manage Prescriptions
                      </Button>
                    )}
                    rows={encounterPrescriptions}
                    emptyMessage="No prescriptions on this encounter."
                    rowKey={(row) => row.id}
                    variant="plain"
                    columns={[
                      { id: 'drug', label: 'Medication', render: (row) => row.medicationName },
                      { id: 'dose', label: 'Dose', render: (row) => row.dose },
                      { id: 'freq', label: 'Frequency', render: (row) => row.frequency },
                      { id: 'duration', label: 'Duration', render: (row) => `${row.durationDays} days` },
                      {
                        id: 'actions',
                        label: 'Actions',
                        align: 'right',
                        render: (row) => (
                          <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                            <IconButton
                              size="small"
                              aria-label="Edit prescription"
                              disabled={!canPrescribe}
                              onClick={() => handleEditPrescription(row.id)}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              aria-label="Delete prescription"
                              color="error"
                              disabled={!canPrescribe}
                              onClick={() => handleDeletePrescription(row.id)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        ),
                      },
                    ]}
                  />
                </Stack>
              ) : null}

              {activeTab === 'notes' ? (
                <Stack spacing={1.2}>
                  <Card variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
                    <Stack spacing={1.1}>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <DescriptionIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Clinical Notes
                        </Typography>
                      </Stack>
                      <TextField
                        fullWidth
                        multiline
                        minRows={8}
                        label="Progress Notes"
                        value={notesTabDraft.progressNotes}
                        onChange={(event) =>
                          setNotesTabDraft((prev) => ({ ...prev, progressNotes: event.target.value }))
                        }
                      />
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={0.8} flexWrap="wrap">
                        <Button variant="outlined" size="small" startIcon={<MicIcon />} onClick={handleOpenNotesDictation}>
                          Dictate
                        </Button>
                        <TextField
                          select
                          size="small"
                          label="Template"
                          value={selectedNoteTemplateId}
                          onChange={(event) => setSelectedNoteTemplateId(event.target.value)}
                          sx={{ minWidth: { xs: '100%', md: 220 } }}
                        >
                          {noteTemplates.map((template) => (
                            <MenuItem key={template.id} value={template.id}>
                              {template.name}
                            </MenuItem>
                          ))}
                        </TextField>
                        <Button variant="outlined" size="small" startIcon={<TextSnippetIcon />} onClick={handleInsertNotesTemplate}>
                          Template
                        </Button>
                        <Button variant="outlined" size="small" startIcon={<BoltIcon />} onClick={handleInsertNotesMacro}>
                          Macro
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>

                  <Card variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
                    <Stack spacing={1.1}>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <TextSnippetIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Instructions
                        </Typography>
                      </Stack>
                      <TextField
                        fullWidth
                        multiline
                        minRows={6}
                        label="Patient Instructions"
                        value={notesTabDraft.patientInstructions}
                        onChange={(event) =>
                          setNotesTabDraft((prev) => ({ ...prev, patientInstructions: event.target.value }))
                        }
                      />
                      <Stack direction="row">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DescriptionIcon />}
                          disabled={!canDocumentConsultation}
                          onClick={handleGenerateHandout}
                        >
                          Generate Handout
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>

                  <Card variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
                    <Stack spacing={1.1}>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <TimerIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Follow-up
                        </Typography>
                      </Stack>
                      <TextField
                        select
                        fullWidth
                        label="Follow-up Required"
                        value={notesTabDraft.followupRequired}
                        onChange={(event) =>
                          setNotesTabDraft((prev) => ({ ...prev, followupRequired: event.target.value }))
                        }
                      >
                        <MenuItem value="">Select follow-up timeframe</MenuItem>
                        {['1 week', '2 weeks', '1 month', '3 months', '6 months', 'As needed'].map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        label="Follow-up Notes"
                        value={notesTabDraft.followupNotes}
                        onChange={(event) =>
                          setNotesTabDraft((prev) => ({ ...prev, followupNotes: event.target.value }))
                        }
                      />
                      <Stack direction="row">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<TimerIcon />}
                          disabled={!canDocumentConsultation}
                          onClick={handleScheduleFollowup}
                        >
                          Schedule Follow-up
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>

                  <OpdTable
                    title="Saved Notes"
                    action={(
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DescriptionIcon />}
                        disabled={!canDocumentConsultation}
                        onClick={openNotesDialog}
                      >
                        Manage Notes
                      </Button>
                    )}
                    rows={encounterNotes}
                    emptyMessage="No consultation notes saved yet."
                    rowKey={(row) => row.id}
                    variant="plain"
                    columns={[
                      {
                        id: 'title',
                        label: 'Title',
                        render: (row) => (
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {row.title}
                          </Typography>
                        ),
                      },
                      {
                        id: 'preview',
                        label: 'Preview',
                        render: (row) => (
                          <Typography variant="caption" color="text.secondary">
                            {row.content.split('\n')[0] || '--'}
                          </Typography>
                        ),
                      },
                      { id: 'savedAt', label: 'Saved At', render: (row) => row.savedAt },
                      { id: 'author', label: 'Author', render: (row) => row.author },
                      {
                        id: 'actions',
                        label: 'Actions',
                        align: 'right',
                        render: (row) => (
                          <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                            <IconButton
                              size="small"
                              aria-label="Edit note"
                              disabled={!canDocumentConsultation}
                              onClick={() => handleEditNote(row.id)}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              aria-label="Delete note"
                              color="error"
                              disabled={!canDocumentConsultation}
                              onClick={() => handleDeleteNote(row.id)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        ),
                      },
                    ]}
                  />
                </Stack>
              ) : null}
            </Stack>
          </Card>
        </Grid>

      </Grid>

      <CommonDialog
        open={voiceDialogOpen}
        onClose={() => setVoiceDialogOpen(false)}
        maxWidth="sm"
        title="Voice Input"
        icon={<MicIcon fontSize="small" />}
        description="Paste dictated text and apply it to the chief complaint."
        contentDividers
        content={(
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Dictated text"
            value={voiceInputText}
            onChange={(event) => setVoiceInputText(event.target.value)}
          />
        )}
        actions={(
          <>
            <Button onClick={() => setVoiceDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" startIcon={<MicIcon />} onClick={handleApplyVoiceInput}>
              Apply Voice Text
            </Button>
          </>
        )}
      />

      <CommonDialog
        open={notesDictationOpen}
        onClose={() => setNotesDictationOpen(false)}
        maxWidth="sm"
        title="Dictate Notes"
        icon={<MicIcon fontSize="small" />}
        description="Paste dictated notes and apply to Progress Notes."
        contentDividers
        content={(
          <TextField
            fullWidth
            multiline
            minRows={5}
            label="Dictated Notes"
            value={notesDictationText}
            onChange={(event) => setNotesDictationText(event.target.value)}
          />
        )}
        actions={(
          <>
            <Button onClick={() => setNotesDictationOpen(false)}>Cancel</Button>
            <Button variant="contained" startIcon={<MicIcon />} onClick={handleApplyNotesDictation}>
              Apply Dictation
            </Button>
          </>
        )}
      />

      <CommonDialog
        open={historyTemplateOpen}
        onClose={() => setHistoryTemplateOpen(false)}
        maxWidth="sm"
        title="Use History Template"
        icon={<TextSnippetIcon fontSize="small" />}
        contentDividers
        content={(
          <Stack spacing={1.2}>
            <TextField
              select
              fullWidth
              label="Template"
              value={historyTemplateId}
              onChange={(event) => setHistoryTemplateId(event.target.value)}
            >
              {HISTORY_TEMPLATES.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))}
            </TextField>
            {(() => {
              const selected = HISTORY_TEMPLATES.find((item) => item.id === historyTemplateId);
              if (!selected) return null;
              return (
                <Card variant="outlined" sx={{ p: 1, borderRadius: 1.5 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Chief Complaint
                    </Typography>
                    <Typography variant="body2">{selected.chiefComplaint}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      HPI
                    </Typography>
                    <Typography variant="body2">{selected.hpi}</Typography>
                  </Stack>
                </Card>
              );
            })()}
          </Stack>
        )}
        actions={(
          <>
            <Button onClick={() => setHistoryTemplateOpen(false)}>Cancel</Button>
            <Button variant="contained" startIcon={<TextSnippetIcon />} onClick={handleApplyComplaintTemplate}>
              Apply Template
            </Button>
          </>
        )}
      />

      <CommonDialog
        open={symptomDialogOpen}
        onClose={() => setSymptomDialogOpen(false)}
        maxWidth="sm"
        title="Add Symptom"
        icon={<LibraryAddIcon fontSize="small" />}
        contentDividers
        content={(
          <Stack spacing={1.2}>
            <TextField
              fullWidth
              required
              label="Symptom"
              value={symptomDraft.symptom}
              onChange={(event) => setSymptomDraft((prev) => ({ ...prev, symptom: event.target.value }))}
            />
            <TextField
              select
              fullWidth
              label="Duration"
              value={symptomDraft.duration}
              onChange={(event) => setSymptomDraft((prev) => ({ ...prev, duration: event.target.value }))}
            >
              <MenuItem value="">Select duration</MenuItem>
              {[
                'Less than 24 hours',
                '1-3 days',
                '4-7 days',
                '1-2 weeks',
                '2-4 weeks',
                'More than 1 month',
              ].map((durationOption) => (
                <MenuItem key={durationOption} value={durationOption}>
                  {durationOption}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Severity"
              value={symptomDraft.severity}
              onChange={(event) => setSymptomDraft((prev) => ({ ...prev, severity: event.target.value }))}
            >
              <MenuItem value="">Select severity</MenuItem>
              {['Mild', 'Moderate', 'Severe'].map((severityOption) => (
                <MenuItem key={severityOption} value={severityOption}>
                  {severityOption}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        )}
        actions={(
          <>
            <Button onClick={() => setSymptomDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" startIcon={<LibraryAddIcon />} onClick={handleSaveSymptom}>
              Add Symptom
            </Button>
          </>
        )}
      />

      <CommonDialog
        open={pastHistoryOpen}
        onClose={() => setPastHistoryOpen(false)}
        maxWidth="md"
        title="Past History"
        icon={<HistoryIcon fontSize="small" />}
        contentDividers
        content={(
          <Stack spacing={1.2}>
            {priorEncounters.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No previous encounters available for this patient.
              </Typography>
            ) : (
              priorEncounters.map((item) => (
                <Card key={item.id} variant="outlined" sx={{ p: 1.2, borderRadius: 1.5 }}>
                  <Stack spacing={0.8}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {item.appointmentTime} • {item.department}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<TextSnippetIcon />}
                        onClick={() => handleInsertPastHistory(item.id)}
                      >
                        Insert in HPI
                      </Button>
                    </Stack>
                    <Typography variant="body2">
                      <strong>Chief Complaint:</strong> {item.chiefComplaint}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Triage Note:</strong> {item.triageNote}
                    </Typography>
                  </Stack>
                </Card>
              ))
            )}

            {priorNotes.length > 0 ? (
              <Card variant="outlined" sx={{ p: 1.2, borderRadius: 1.5 }}>
                <Stack spacing={0.8}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Previous Consultation Notes
                  </Typography>
                  {priorNotes.slice(0, 5).map((note) => (
                    <Typography key={note.id} variant="caption" color="text.secondary">
                      {note.savedAt} • {note.author} • {note.title}
                    </Typography>
                  ))}
                </Stack>
              </Card>
            ) : null}
          </Stack>
        )}
        actions={<Button onClick={() => setPastHistoryOpen(false)}>Close</Button>}
      />

      <CommonDialog
        open={allergyDialogOpen}
        onClose={closeAllergyDialog}
        maxWidth="sm"
        title="Manage Allergies"
        icon={(
          <WarningAmberIcon color={managedAllergies.length ? 'error' : 'primary'} fontSize="small" />
        )}
        contentDividers
        content={(
          <Stack spacing={1.2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.8}>
              <TextField
                fullWidth
                label={editingAllergyIndex === null ? 'Add allergy' : 'Edit allergy'}
                value={allergyInput}
                onChange={(event) => setAllergyInput(event.target.value)}
              />
              <Button
                variant="contained"
                startIcon={<LibraryAddIcon />}
                onClick={handleSaveAllergy}
                sx={{ flexShrink: 0 }}
              >
                {editingAllergyIndex === null ? 'Add' : 'Update'}
              </Button>
            </Stack>

            {managedAllergies.length === 0 ? (
              <Alert severity="success">No known allergies documented.</Alert>
            ) : (
              <Stack spacing={0.6}>
                {managedAllergies.map((allergy, index) => (
                  <Card key={allergy} variant="outlined" sx={{ p: 0.8, borderRadius: 1.2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{allergy}</Typography>
                      <Stack direction="row" spacing={0.25}>
                        <IconButton size="small" aria-label="Edit allergy" onClick={() => handleSelectAllergyForEdit(index)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="Delete allergy"
                          color="error"
                          onClick={() => handleDeleteAllergy(index)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        )}
        actions={<Button onClick={closeAllergyDialog}>Close</Button>}
      />

      <CommonDialog
        open={diagnosisDialogOpen}
        onClose={closeDiagnosisDialog}
        maxWidth="md"
        title={editingDiagnosisId ? 'Edit Diagnosis' : 'Add Diagnosis'}
        icon={<BiotechIcon fontSize="small" />}
        contentDividers
        content={(
          <Stack spacing={1.5}>
            <Grid container spacing={1.2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Diagnosis Catalog"
                  value={diagnosisDraft.diagnosisId}
                  onChange={(event) => handleDiagnosisSelection(event.target.value)}
                >
                  <MenuItem value="">Select diagnosis</MenuItem>
                  {DIAGNOSIS_CATALOG.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name} ({item.icd10})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Diagnosis"
                  value={diagnosisDraft.diagnosisName}
                  onChange={(event) =>
                    setDiagnosisDraft((prev) => ({
                      ...prev,
                      diagnosisName: event.target.value,
                    }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="ICD-10"
                  value={diagnosisDraft.icd10}
                  onChange={(event) => setDiagnosisDraft((prev) => ({ ...prev, icd10: event.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Type"
                  value={diagnosisDraft.type}
                  onChange={(event) =>
                    setDiagnosisDraft((prev) => ({
                      ...prev,
                      type: event.target.value as DiagnosisLine['type'],
                    }))
                  }
                >
                  {DIAGNOSIS_TYPE_OPTIONS.map((typeOption) => (
                    <MenuItem key={typeOption} value={typeOption}>
                      {typeOption}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={diagnosisDraft.status}
                  onChange={(event) =>
                    setDiagnosisDraft((prev) => ({
                      ...prev,
                      status: event.target.value as DiagnosisLine['status'],
                    }))
                  }
                >
                  {DIAGNOSIS_STATUS_OPTIONS.map((statusOption) => (
                    <MenuItem key={statusOption} value={statusOption}>
                      {statusOption}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={diagnosisDraft.notes}
                  onChange={(event) => setDiagnosisDraft((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </Grid>
            </Grid>
          </Stack>
        )}
        actions={(
          <>
            <Button onClick={closeDiagnosisDialog}>Cancel</Button>
            <Button variant="contained" startIcon={<BiotechIcon />} onClick={handleSaveDiagnosis}>
              {editingDiagnosisId ? 'Update Diagnosis' : 'Add Diagnosis'}
            </Button>
          </>
        )}
      />

      <CommonDialog
        open={notesDialogOpen}
        onClose={closeNotesDialog}
        maxWidth="md"
        title={editingNoteId ? 'Edit Note' : 'Add Note'}
        icon={<DescriptionIcon fontSize="small" />}
        contentDividers
        content={(
          <Stack spacing={1.5}>
            <Grid container spacing={1.2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  required
                  label="Title"
                  value={notesDraft.title}
                  onChange={(event) => setNotesDraft((prev) => ({ ...prev, title: event.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Author"
                  value={notesDraft.author}
                  onChange={(event) => setNotesDraft((prev) => ({ ...prev, author: event.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  minRows={6}
                  label="Note Content"
                  value={notesDraft.content}
                  onChange={(event) => setNotesDraft((prev) => ({ ...prev, content: event.target.value }))}
                />
              </Grid>
            </Grid>
          </Stack>
        )}
        actions={(
          <>
            <Button onClick={closeNotesDialog}>Cancel</Button>
            <Button variant="contained" startIcon={<DescriptionIcon />} onClick={handleSaveNotesFromDialog}>
              {editingNoteId ? 'Update Note' : 'Add Note'}
            </Button>
          </>
        )}
      />

      <CommonDialog
        open={ordersDialogOpen}
        onClose={closeOrderDialog}
        maxWidth="md"
        title={editingOrderId ? 'Edit Order' : 'Add Order'}
        icon={<ScienceIcon fontSize="small" />}
        contentDividers
        content={(
          <Stack spacing={1.5}>
            <Grid container spacing={1.2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  value={orderCategoryFilter}
                  onChange={(event) =>
                    setOrderCategoryFilter(event.target.value as 'All' | OrderCatalogItem['category'])
                  }
                >
                  {['All', 'Lab', 'Radiology', 'Procedure'].map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  select
                  fullWidth
                  label="Order"
                  value={orderDraft.catalogId}
                  onChange={(event) => setOrderDraft((prev) => ({ ...prev, catalogId: event.target.value }))}
                >
                  {filteredOrderCatalog.map((catalog) => (
                    <MenuItem key={catalog.id} value={catalog.id}>
                      {catalog.name} ({catalog.category})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Priority"
                  value={orderDraft.priority}
                  onChange={(event) =>
                    setOrderDraft((prev) => ({ ...prev, priority: event.target.value as 'Routine' | 'Urgent' }))
                  }
                >
                  {['Routine', 'Urgent'].map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Instructions"
                  value={orderDraft.instructions}
                  onChange={(event) => setOrderDraft((prev) => ({ ...prev, instructions: event.target.value }))}
                />
              </Grid>
            </Grid>
          </Stack>
        )}
        actions={(
          <>
            <Button onClick={closeOrderDialog}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveOrder}>
              {editingOrderId ? 'Update Order' : 'Add Order'}
            </Button>
          </>
        )}
      />

      <CommonDialog
        open={prescriptionDialogOpen}
        onClose={closePrescriptionDialog}
        maxWidth="md"
        title={editingPrescriptionId ? 'Edit Medication' : 'Add Medication'}
        icon={<MedicationIcon fontSize="small" />}
        contentDividers
        content={(
          <Stack spacing={1.5}>
            <Grid container spacing={1.2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Medication"
                  value={prescriptionDraft.medicationId}
                  onChange={(event) => {
                    const medicationId = event.target.value;
                    const medication = medicationCatalog.find((item) => item.id === medicationId);
                    setPrescriptionDraft((prev) => ({
                      ...prev,
                      medicationId,
                      dose: medication?.strength ?? prev.dose,
                      frequency: medication?.commonFrequency ?? prev.frequency,
                    }));
                  }}
                >
                  {medicationCatalog.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.genericName} {item.strength}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Dose"
                  value={prescriptionDraft.dose}
                  onChange={(event) => setPrescriptionDraft((prev) => ({ ...prev, dose: event.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Frequency"
                  value={prescriptionDraft.frequency}
                  onChange={(event) => setPrescriptionDraft((prev) => ({ ...prev, frequency: event.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Duration (days)"
                  value={prescriptionDraft.durationDays}
                  onChange={(event) => setPrescriptionDraft((prev) => ({ ...prev, durationDays: event.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  select
                  fullWidth
                  label="Route"
                  value={prescriptionDraft.route}
                  onChange={(event) =>
                    setPrescriptionDraft((prev) => ({
                      ...prev,
                      route: event.target.value as 'Oral' | 'IV' | 'IM' | 'Topical',
                    }))
                  }
                >
                  {['Oral', 'IV', 'IM', 'Topical'].map((route) => (
                    <MenuItem key={route} value={route}>
                      {route}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Instructions"
                  value={prescriptionDraft.instructions}
                  onChange={(event) =>
                    setPrescriptionDraft((prev) => ({ ...prev, instructions: event.target.value }))
                  }
                />
              </Grid>
            </Grid>
          </Stack>
        )}
        actions={(
          <>
            <Button onClick={closePrescriptionDialog}>Cancel</Button>
            <Button variant="contained" startIcon={<LocalPharmacyIcon />} onClick={handleSavePrescription}>
              {editingPrescriptionId ? 'Update Medicine' : 'Add Medicine'}
            </Button>
          </>
        )}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3200}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </OpdLayout>
  );
}
