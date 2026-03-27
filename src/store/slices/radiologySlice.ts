import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ImagingOrder,
  ModalityCase,
  ReadingCase,
  RadiologyState,
  WorklistState,
} from "@/src/core/radiology/types";

const DEFAULT_ROOM_BY_MODALITY: Record<string, string> = {
  MRI: "MRI Suite",
  CT: "CT Suite A",
  "X-Ray": "X-Ray Room 1",
  Ultrasound: "USG Room 2",
};

const initialOrders: ImagingOrder[] = [
  {
    id: "rad-ord-1",
    patientName: "Rahul Menon",
    mrn: "MRN-245990",
    ageGender: "58 / Male",
    modality: "CT",
    study: "CT Chest HRCT",
    priority: "Urgent",
    validationState: "Ready",
    authorization: "Approved",
    clinicalCheck: "NPO complete",
    scheduledSlot: "10:30 AM",
  },
  {
    id: "rad-ord-2",
    patientName: "Sneha Patil",
    mrn: "MRN-245991",
    ageGender: "42 / Female",
    modality: "Ultrasound",
    study: "USG Pelvis Follow-up",
    priority: "Routine",
    validationState: "Ready",
    authorization: "Approved",
    clinicalCheck: "Ready",
    scheduledSlot: "11:45 AM",
  },
  {
    id: "rad-ord-3",
    patientName: "Arvind Sharma",
    mrn: "MRN-245994",
    ageGender: "64 / Male",
    modality: "CT",
    study: "CT Chest HRCT",
    priority: "Urgent",
    validationState: "Needs Clinical Review",
    authorization: "Approved",
    clinicalCheck: "Reviewing history",
    scheduledSlot: "01:20 PM",
  },
  {
    id: "rad-ord-4",
    patientName: "Neha Sinha",
    mrn: "MRN-245998",
    ageGender: "35 / Female",
    modality: "MRI",
    study: "MRI Brain",
    priority: "STAT",
    validationState: "Ready",
    authorization: "Approved",
    clinicalCheck: "Screening done",
    scheduledSlot: "03:10 PM",
  },
];

const initialWorklist: ModalityCase[] = [
  {
    id: "rad-wl-1",
    patientName: "Rahul Menon",
    mrn: "MRN-245990",
    modality: "CT",
    study: "CT Chest HRCT",
    priority: "Urgent",
    protocol: "CT Chest HRCT - Lung Window",
    room: "CT Suite A",
    prepStatus: "Ready",
    state: "Queued",
    transmitState: "Ready to Send",
  },
  {
    id: "rad-wl-2",
    patientName: "Sneha Patil",
    mrn: "MRN-245991",
    modality: "Ultrasound",
    study: "USG Pelvis Follow-up",
    priority: "Routine",
    protocol: "Full Pelvic Scan",
    room: "USG Room 2",
    prepStatus: "Bladder prep done",
    state: "Queued",
    transmitState: "Ready to Send",
  },
  {
    id: "rad-wl-3",
    patientName: "Arvind Sharma",
    mrn: "MRN-245994",
    modality: "X-Ray",
    study: "Chest PA View",
    priority: "Routine",
    protocol: "Standard Chest PA",
    room: "X-Ray Room 1",
    prepStatus: "Ready",
    state: "Queued",
    transmitState: "Ready to Send",
  },
  {
    id: "rad-wl-4",
    patientName: "Neha Sinha",
    mrn: "MRN-245998",
    modality: "MRI",
    study: "MRI Brain",
    priority: "STAT",
    protocol: "Stroke Protocol",
    room: "MRI Suite",
    prepStatus: "Screening complete",
    state: "Queued",
    transmitState: "Ready to Send",
  },
];

const initialReading: ReadingCase[] = [
  {
    id: "rad-read-1",
    patientName: "Rahul Menon",
    mrn: "MRN-245990",
    subspecialty: "Chest",
    modality: "CT",
    study: "CT Chest HRCT",
    priority: "Urgent",
    turnaround: "18 min",
    hasPrior: true,
    state: "Unread",
    contrastSafety: {
      creatinine: "1.39 mg/dL",
      egfr: "58",
      risk: "Review",
    },
  },
  {
    id: "rad-read-2",
    patientName: "Sneha Patil",
    mrn: "MRN-245991",
    subspecialty: "Women Imaging",
    modality: "Ultrasound",
    study: "USG Pelvis Follow-up",
    priority: "Routine",
    turnaround: "41 min",
    hasPrior: false,
    state: "Drafting",
  },
  {
    id: "rad-read-3",
    patientName: "Arvind Sharma",
    mrn: "MRN-245994",
    subspecialty: "Chest",
    modality: "X-Ray",
    study: "Chest PA View",
    priority: "Routine",
    turnaround: "2 hr 05 min",
    hasPrior: true,
    state: "Unread",
  },
  {
    id: "rad-read-4",
    patientName: "Neha Sinha",
    mrn: "MRN-245998",
    subspecialty: "Neuro",
    modality: "MRI",
    study: "MRI Brain",
    priority: "STAT",
    turnaround: "5 min",
    hasPrior: false,
    state: "Unread",
  },
  {
    id: "rad-read-5",
    patientName: "Rahul Menon",
    mrn: "MRN-245990",
    subspecialty: "Chest",
    modality: "X-Ray",
    study: "Chest AP Bedside",
    priority: "Urgent",
    turnaround: "1 hr 12 min",
    hasPrior: true,
    state: "Final Signed",
  },
];

const reportTemplates = [
  "MRI Brain Stroke Protocol",
  "CT Abdomen Contrast",
  "Chest X-Ray Routine",
  "Ultrasound Pelvis Follow-up",
];

const buildWorklistCase = (order: ImagingOrder): ModalityCase => ({
  id: order.id,
  patientName: order.patientName,
  mrn: order.mrn,
  modality: order.modality,
  study: order.study,
  priority: order.priority,
  protocol: order.study,
  room: DEFAULT_ROOM_BY_MODALITY[order.modality] || "Room 1",
  prepStatus: "Ready",
  state: "Queued",
  transmitState: "Ready to Send",
});

const buildReadingCase = (workCase: ModalityCase): ReadingCase => ({
  id: workCase.id,
  patientName: workCase.patientName,
  mrn: workCase.mrn,
  modality: workCase.modality,
  study: workCase.study,
  priority: workCase.priority,
  subspecialty: "General",
  turnaround: "Pending",
  hasPrior: false,
  state: "Unread",
});

const initialState: RadiologyState = {
  orders: initialOrders,
  worklist: initialWorklist,
  reading: initialReading,
  reportTemplates,
};

export const radiologySlice = createSlice({
  name: "radiology",
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<ImagingOrder>) => {
      state.orders = [action.payload, ...state.orders];
    },
    updateOrder: (state, action: PayloadAction<ImagingOrder>) => {
      state.orders = state.orders.map((o) =>
        o.id === action.payload.id ? action.payload : o
      );
    },
    removeOrder: (state, action: PayloadAction<{ id: string }>) => {
      state.orders = state.orders.filter((o) => o.id !== action.payload.id);
    },
    moveOrderToWorklist: (state, action: PayloadAction<{ id: string }>) => {
      const idx = state.orders.findIndex((o) => o.id === action.payload.id);
      if (idx === -1) return;
      const [order] = state.orders.splice(idx, 1);
      state.worklist = [buildWorklistCase(order), ...state.worklist];
    },
    updateWorklistCase: (state, action: PayloadAction<ModalityCase>) => {
      state.worklist = state.worklist.map((c) =>
        c.id === action.payload.id ? action.payload : c
      );
    },
    removeWorklistCase: (state, action: PayloadAction<{ id: string }>) => {
      state.worklist = state.worklist.filter((c) => c.id !== action.payload.id);
    },
    moveWorklistToReading: (state, action: PayloadAction<{ id: string }>) => {
      const idx = state.worklist.findIndex((c) => c.id === action.payload.id);
      if (idx === -1) return;
      const [workCase] = state.worklist.splice(idx, 1);
      state.reading = [buildReadingCase(workCase), ...state.reading];
    },
    updateReadingCase: (state, action: PayloadAction<ReadingCase>) => {
      state.reading = state.reading.map((c) =>
        c.id === action.payload.id ? action.payload : c
      );
    },
    removeReadingCase: (state, action: PayloadAction<{ id: string }>) => {
      state.reading = state.reading.filter((c) => c.id !== action.payload.id);
    },
    setReadingState: (
      state,
      action: PayloadAction<{ id: string; state: any }>
    ) => {
      state.reading = state.reading.map((item) =>
        item.id === action.payload.id
          ? { ...item, state: action.payload.state }
          : item
      );
    },
    setWorklistState: (
      state,
      action: PayloadAction<{ id: string; state: WorklistState }>
    ) => {
      state.worklist = state.worklist.map((item) =>
        item.id === action.payload.id
          ? { ...item, state: action.payload.state }
          : item
      );
    },
    addWorklistCase: (state, action: PayloadAction<ModalityCase>) => {
      state.worklist = [action.payload, ...state.worklist];
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
  addWorklistCase,
} = radiologySlice.actions;

export default radiologySlice.reducer;
