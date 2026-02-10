import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ImagingOrder,
  ModalityCase,
  ReadingCase,
  RadiologyState,
  ReportState,
  WorklistState,
} from '@/src/core/radiology/types';

const DEFAULT_ROOM_BY_MODALITY: Record<string, string> = {
  MRI: 'MRI Suite',
  CT: 'CT Suite A',
  'X-Ray': 'X-Ray Room 1',
  Ultrasound: 'USG Room 2',
};

const DEFAULT_SUBSPECIALTY_BY_MODALITY: Record<string, string> = {
  MRI: 'Neuro',
  CT: 'Chest',
  'X-Ray': 'Chest',
  Ultrasound: 'Women Imaging',
};

const initialOrders: ImagingOrder[] = [
  {
    id: 'rad-ord-1',
    patientName: 'Aarav Nair',
    mrn: 'MRN-245781',
    ageGender: '34 / Male',
    modality: 'MRI',
    study: 'MRI Brain with Contrast',
    priority: 'STAT',
    validationState: 'Needs Authorization',
    authorization: 'Insurance callback pending',
    clinicalCheck: 'Creatinine check required',
    scheduledSlot: '11:20 AM',
  },
  {
    id: 'rad-ord-2',
    patientName: 'Fatima Khan',
    mrn: 'MRN-245811',
    ageGender: '41 / Female',
    modality: 'CT',
    study: 'CT Sinus',
    priority: 'Routine',
    validationState: 'Ready',
    authorization: 'Approved',
    clinicalCheck: 'NPO complete',
    scheduledSlot: '12:40 PM',
  },
  {
    id: 'rad-ord-3',
    patientName: 'Arvind Sharma',
    mrn: 'MRN-245994',
    ageGender: '64 / Male',
    modality: 'CT',
    study: 'CT Chest HRCT',
    priority: 'Urgent',
    validationState: 'Needs Clinical Review',
    authorization: 'Approved',
    clinicalCheck: 'Referral mismatch',
    scheduledSlot: '02:15 PM',
  },
];

const initialWorklist: ModalityCase[] = [
  {
    id: 'rad-wl-1',
    patientName: 'Meera Joshi',
    mrn: 'MRN-245799',
    modality: 'CT',
    study: 'CT Abdomen with Contrast',
    priority: 'Urgent',
    protocol: 'CT Abdomen with Contrast',
    room: 'CT Suite A',
    prepStatus: 'IV line ready',
    state: 'In Progress',
    transmitState: 'Ready to Send',
  },
  {
    id: 'rad-wl-2',
    patientName: 'Ravi Iyer',
    mrn: 'MRN-245802',
    modality: 'X-Ray',
    study: 'Chest PA View',
    priority: 'Routine',
    protocol: 'Chest PA View',
    room: 'X-Ray Room 1',
    prepStatus: 'Ready',
    state: 'Tech QA',
    transmitState: 'Retry',
  },
  {
    id: 'rad-wl-3',
    patientName: 'Pooja Menon',
    mrn: 'MRN-246002',
    modality: 'Ultrasound',
    study: 'USG Pelvis',
    priority: 'Routine',
    protocol: 'USG Pelvis',
    room: 'USG Room 2',
    prepStatus: 'Bladder prep done',
    state: 'Queued',
    transmitState: 'Ready to Send',
  },
];

const initialReading: ReadingCase[] = [
  {
    id: 'rad-read-1',
    patientName: 'Rahul Menon',
    mrn: 'MRN-245990',
    subspecialty: 'Chest',
    modality: 'CT',
    study: 'CT Chest HRCT',
    priority: 'Urgent',
    turnaround: '18 min',
    hasPrior: true,
    state: 'Unread',
    contrastSafety: {
      creatinine: '1.39 mg/dL',
      egfr: '58',
      risk: 'Review',
    },
  },
  {
    id: 'rad-read-2',
    patientName: 'Sneha Patil',
    mrn: 'MRN-245991',
    subspecialty: 'Women Imaging',
    modality: 'Ultrasound',
    study: 'USG Pelvis Follow-up',
    priority: 'Routine',
    turnaround: '41 min',
    hasPrior: false,
    state: 'Drafting',
  },
  {
    id: 'rad-read-3',
    patientName: 'Vikram Bedi',
    mrn: 'MRN-246003',
    subspecialty: 'Chest',
    modality: 'X-Ray',
    study: 'Chest PA View',
    priority: 'Routine',
    turnaround: '2 hr 05 min',
    hasPrior: true,
    state: 'Final Signed',
  },
];

const reportTemplates = [
  'MRI Brain Stroke Protocol',
  'CT Abdomen Contrast',
  'Chest X-Ray Routine',
  'Ultrasound Pelvis Follow-up',
];

const buildWorklistCase = (order: ImagingOrder): ModalityCase => ({
  id: order.id,
  patientName: order.patientName,
  mrn: order.mrn,
  modality: order.modality,
  study: order.study,
  priority: order.priority,
  protocol: order.study,
  room: DEFAULT_ROOM_BY_MODALITY[order.modality] ?? 'Imaging Room',
  prepStatus: order.clinicalCheck || 'Prep pending',
  state: 'Queued',
  transmitState: 'Ready to Send',
});

const buildReadingCase = (worklist: ModalityCase): ReadingCase => ({
  id: worklist.id,
  patientName: worklist.patientName,
  mrn: worklist.mrn,
  subspecialty: DEFAULT_SUBSPECIALTY_BY_MODALITY[worklist.modality] ?? 'General',
  modality: worklist.modality,
  study: worklist.study,
  priority: worklist.priority,
  turnaround: 'New',
  hasPrior: false,
  state: 'Unread',
});

const radiologySlice = createSlice({
  name: 'radiology',
  initialState: {
    orders: initialOrders,
    worklist: initialWorklist,
    reading: initialReading,
    reportTemplates,
  } satisfies RadiologyState,
  reducers: {
    addOrder: (state, action: PayloadAction<ImagingOrder>) => {
      state.orders = [action.payload, ...state.orders];
    },
    updateOrder: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<ImagingOrder> }>
    ) => {
      state.orders = state.orders.map((order) =>
        order.id === action.payload.id ? { ...order, ...action.payload.changes } : order
      );
    },
    removeOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter((order) => order.id !== action.payload);
    },
    moveOrderToWorklist: (state, action: PayloadAction<{ id: string }>) => {
      const index = state.orders.findIndex((order) => order.id === action.payload.id);
      if (index === -1) return;
      const [order] = state.orders.splice(index, 1);
      state.worklist = [buildWorklistCase(order), ...state.worklist];
    },
    updateWorklistCase: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<ModalityCase> }>
    ) => {
      state.worklist = state.worklist.map((item) =>
        item.id === action.payload.id ? { ...item, ...action.payload.changes } : item
      );
    },
    removeWorklistCase: (state, action: PayloadAction<string>) => {
      state.worklist = state.worklist.filter((item) => item.id !== action.payload);
    },
    moveWorklistToReading: (state, action: PayloadAction<{ id: string }>) => {
      const index = state.worklist.findIndex((item) => item.id === action.payload.id);
      if (index === -1) return;
      const [worklist] = state.worklist.splice(index, 1);
      state.reading = [buildReadingCase(worklist), ...state.reading];
    },
    updateReadingCase: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<ReadingCase> }>
    ) => {
      state.reading = state.reading.map((item) =>
        item.id === action.payload.id ? { ...item, ...action.payload.changes } : item
      );
    },
    removeReadingCase: (state, action: PayloadAction<string>) => {
      state.reading = state.reading.filter((item) => item.id !== action.payload);
    },
    setReadingState: (
      state,
      action: PayloadAction<{ id: string; state: ReportState }>
    ) => {
      state.reading = state.reading.map((item) =>
        item.id === action.payload.id ? { ...item, state: action.payload.state } : item
      );
    },
    setWorklistState: (
      state,
      action: PayloadAction<{ id: string; state: WorklistState }>
    ) => {
      state.worklist = state.worklist.map((item) =>
        item.id === action.payload.id ? { ...item, state: action.payload.state } : item
      );
    },
  },
});

export const {
  addOrder,
  updateOrder,
  removeOrder,
  moveOrderToWorklist,
  updateWorklistCase,
  removeWorklistCase,
  moveWorklistToReading,
  updateReadingCase,
  removeReadingCase,
  setReadingState,
  setWorklistState,
} = radiologySlice.actions;

export default radiologySlice.reducer;
