import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  LabOrder,
  LabResult,
  LabSample,
  LaboratoryState,
  ResultState,
} from '@/src/core/laboratory/types';

const initialOrders: LabOrder[] = [
  {
    id: 'lab-ord-1',
    patientName: 'Aarav Nair',
    mrn: 'MRN-245781',
    ageGender: '34 / Male',
    testPanel: 'CBC + ESR',
    specimenType: 'Blood',
    priority: 'STAT',
    status: 'Pending Collection',
    requestedAt: '09:05 AM',
    collectionWindow: '09:00 - 10:00',
    orderingPhysician: 'Dr. Nisha Rao',
    department: 'General Medicine',
  },
  {
    id: 'lab-ord-2',
    patientName: 'Fatima Khan',
    mrn: 'MRN-245811',
    ageGender: '41 / Female',
    testPanel: 'Liver Function Panel',
    specimenType: 'Blood',
    priority: 'Routine',
    status: 'Collected',
    requestedAt: '08:30 AM',
    collectionWindow: '08:30 - 09:30',
    orderingPhysician: 'Dr. Sana Khan',
    department: 'ENT',
  },
  {
    id: 'lab-ord-3',
    patientName: 'Ravi Iyer',
    mrn: 'MRN-245802',
    ageGender: '52 / Male',
    testPanel: 'Urine Culture',
    specimenType: 'Urine',
    priority: 'Urgent',
    status: 'In Lab',
    requestedAt: '07:50 AM',
    collectionWindow: '08:00 - 09:00',
    orderingPhysician: 'Dr. Rohan Mehta',
    department: 'Cardiology',
  },
];

const initialSamples: LabSample[] = [
  {
    id: 'lab-ord-2',
    patientName: 'Fatima Khan',
    mrn: 'MRN-245811',
    testPanel: 'Liver Function Panel',
    specimenType: 'Blood',
    container: 'SST Tube',
    collectionSite: 'OPD - Phlebotomy',
    collectedBy: 'Anita Joseph',
    collectionTime: '08:45 AM',
    accessionNumber: 'LAB-2026-1121',
    status: 'Received',
    transport: 'Received at lab',
  },
  {
    id: 'lab-ord-3',
    patientName: 'Ravi Iyer',
    mrn: 'MRN-245802',
    testPanel: 'Urine Culture',
    specimenType: 'Urine',
    container: 'Sterile Cup',
    collectionSite: 'IPD Ward 5A',
    collectedBy: 'Sujata Rao',
    collectionTime: '08:10 AM',
    accessionNumber: 'LAB-2026-1124',
    status: 'In Transit',
    transport: 'Courier pickup 08:20 AM',
  },
];

const initialResults: LabResult[] = [
  {
    id: 'lab-res-1',
    patientName: 'Rahul Menon',
    mrn: 'MRN-245990',
    testName: 'Renal Function Panel',
    specimenType: 'Blood',
    resultValue: 'Creatinine 1.39',
    unit: 'mg/dL',
    referenceRange: '0.7 - 1.3',
    flag: 'Abnormal',
    state: 'Verified',
    reportedAt: '08:20 AM',
    verifiedBy: 'Dr. Kavya Iyer',
  },
  {
    id: 'lab-res-1b',
    patientName: 'Siddharth Roy',
    mrn: 'MRN-245817',
    testName: 'A. baumannii Culture',
    specimenType: 'Sputum',
    resultValue: 'Positive',
    unit: 'CFU/mL',
    referenceRange: 'Negative',
    flag: 'Critical',
    state: 'Verified',
    reportedAt: '07:45 AM',
    verifiedBy: 'Dr. Kavya Iyer',
  },
  {
    id: 'lab-res-2',
    patientName: 'Sneha Patil',
    mrn: 'MRN-245991',
    testName: 'CBC Panel',
    specimenType: 'Blood',
    resultValue: 'WBC 7.8',
    unit: 'x10^9/L',
    referenceRange: '4.0 - 11.0',
    flag: 'Normal',
    state: 'Pending Review',
    reportedAt: '09:10 AM',
    verifiedBy: 'Pending',
  },
  {
    id: 'lab-res-3',
    patientName: 'Aarav Nair',
    mrn: 'MRN-245781',
    testName: 'MRSA Culture',
    specimenType: 'Nasal Swab',
    resultValue: 'Positive',
    unit: 'CFU/mL',
    referenceRange: 'Negative',
    flag: 'Critical',
    state: 'Verified',
    reportedAt: '08:15 AM',
    verifiedBy: 'Dr. Kavya Iyer',
  },
  {
    id: 'lab-res-4',
    patientName: 'Meera Joshi',
    mrn: 'MRN-245799',
    testName: 'VRE Culture',
    specimenType: 'Urine',
    resultValue: 'Positive',
    unit: 'CFU/mL',
    referenceRange: 'Negative',
    flag: 'Critical',
    state: 'Verified',
    reportedAt: '07:50 AM',
    verifiedBy: 'Dr. Kavya Iyer',
  },
  {
    id: 'lab-res-5',
    patientName: 'Ananya Desai',
    mrn: 'MRN-245803',
    testName: 'K. pneumoniae Culture',
    specimenType: 'Sputum',
    resultValue: 'Positive',
    unit: 'CFU/mL',
    referenceRange: 'Negative',
    flag: 'Critical',
    state: 'Pending Review',
    reportedAt: '09:00 AM',
    verifiedBy: 'Pending',
  },
  {
    id: 'lab-res-6',
    patientName: 'Vikram Sethi',
    mrn: 'MRN-245804',
    testName: 'MRSA Blood Culture',
    specimenType: 'Blood',
    resultValue: 'Positive',
    unit: 'CFU/mL',
    referenceRange: 'Negative',
    flag: 'Critical',
    state: 'Verified',
    reportedAt: '08:30 AM',
    verifiedBy: 'Dr. Kavya Iyer',
  },
  {
    id: 'lab-res-7',
    patientName: 'Priya Rajan',
    mrn: 'MRN-245805',
    testName: 'E. coli ESBL Culture',
    specimenType: 'Urine',
    resultValue: 'Positive',
    unit: 'CFU/mL',
    referenceRange: 'Negative',
    flag: 'Abnormal',
    state: 'Verified',
    reportedAt: '08:45 AM',
    verifiedBy: 'Dr. Kavya Iyer',
  },
  {
    id: 'lab-res-8',
    patientName: 'Arjun Kapoor',
    mrn: 'MRN-245806',
    testName: 'VRE Rectal Swab',
    specimenType: 'Rectal Swab',
    resultValue: 'Positive',
    unit: 'CFU/mL',
    referenceRange: 'Negative',
    flag: 'Critical',
    state: 'Verified',
    reportedAt: '07:30 AM',
    verifiedBy: 'Dr. Kavya Iyer',
  },
  {
    id: 'lab-res-9',
    patientName: 'Sanya Gupta',
    mrn: 'MRN-245807',
    testName: 'A. baumannii Culture',
    specimenType: 'Tracheal Aspirate',
    resultValue: 'Positive',
    unit: 'CFU/mL',
    referenceRange: 'Negative',
    flag: 'Critical',
    state: 'Verified',
    reportedAt: '08:00 AM',
    verifiedBy: 'Dr. Kavya Iyer',
  },
  {
    id: 'lab-res-10',
    patientName: 'Karan Malhotra',
    mrn: 'MRN-245808',
    testName: 'C. diff Toxin',
    specimenType: 'Stool',
    resultValue: 'Positive',
    unit: 'ng/mL',
    referenceRange: 'Negative',
    flag: 'Critical',
    state: 'Verified',
    reportedAt: '09:20 AM',
    verifiedBy: 'Dr. Kavya Iyer',
  },
  {
    id: 'lab-res-11',
    patientName: 'Ishani Bose',
    mrn: 'MRN-245809',
    testName: 'MRSA Wound Culture',
    specimenType: 'Wound',
    resultValue: 'Positive',
    unit: 'CFU/mL',
    referenceRange: 'Negative',
    flag: 'Abnormal',
    state: 'Pending Review',
    reportedAt: '08:55 AM',
    verifiedBy: 'Pending',
  },
  {
    id: 'lab-res-12',
    patientName: 'Aditya Verma',
    mrn: 'MRN-245810',
    testName: 'P. aeruginosa Culture',
    specimenType: 'Sputum',
    resultValue: 'Positive',
    unit: 'CFU/mL',
    referenceRange: 'Negative',
    flag: 'Abnormal',
    state: 'Verified',
    reportedAt: '08:10 AM',
    verifiedBy: 'Dr. Kavya Iyer',
  },
  {
    id: 'lab-res-13',
    patientName: 'Deepak Rawat',
    mrn: 'MRN-245813',
    testName: 'C. diff PCR',
    specimenType: 'Stool',
    resultValue: 'Positive',
    unit: 'copies/mL',
    referenceRange: 'Negative',
    flag: 'Critical',
    state: 'Verified',
    reportedAt: '07:40 AM',
    verifiedBy: 'Dr. Kavya Iyer',
  },
  {
    id: 'lab-res-14',
    patientName: 'Ritu Singhania',
    mrn: 'MRN-245814',
    testName: 'K. pneumoniae Blood Culture',
    specimenType: 'Blood',
    resultValue: 'Positive',
    unit: 'CFU/mL',
    referenceRange: 'Negative',
    flag: 'Critical',
    state: 'Verified',
    reportedAt: '08:25 AM',
    verifiedBy: 'Dr. Kavya Iyer',
  },
  {
    id: 'lab-res-15',
    patientName: 'Varun Dhawan',
    mrn: 'MRN-245815',
    testName: 'VRE Blood Culture',
    specimenType: 'Blood',
    resultValue: 'Positive',
    unit: 'CFU/mL',
    referenceRange: 'Negative',
    flag: 'Critical',
    state: 'Verified',
    reportedAt: '08:05 AM',
    verifiedBy: 'Dr. Kavya Iyer',
  },
  {
    id: 'lab-res-16',
    patientName: 'Kiara Advani',
    mrn: 'MRN-245816',
    testName: 'MRSA Nasal Screen',
    specimenType: 'Nasal Swab',
    resultValue: 'Positive',
    unit: 'CFU/mL',
    referenceRange: 'Negative',
    flag: 'Abnormal',
    state: 'Verified',
    reportedAt: '09:05 AM',
    verifiedBy: 'Dr. Kavya Iyer',
  },
];

const resultTemplates = [
  'CBC Panel',
  'Liver Function Panel',
  'Renal Function Panel',
  'Electrolytes',
  'Urine Culture',
];

const buildSampleFromOrder = (order: LabOrder): LabSample => ({
  id: order.id,
  patientName: order.patientName,
  mrn: order.mrn,
  testPanel: order.testPanel,
  specimenType: order.specimenType,
  container: order.specimenType === 'Urine' ? 'Sterile Cup' : 'EDTA Tube',
  collectionSite: 'OPD - Phlebotomy',
  collectedBy: 'Auto Assigned',
  collectionTime: order.requestedAt,
  accessionNumber: `LAB-${order.id.toUpperCase()}`,
  status: 'Pending',
  transport: 'Awaiting pickup',
});

const buildResultFromSample = (sample: LabSample): LabResult => ({
  id: sample.id,
  patientName: sample.patientName,
  mrn: sample.mrn,
  testName: sample.testPanel,
  specimenType: sample.specimenType,
  resultValue: 'Pending',
  unit: sample.specimenType === 'Urine' ? 'CFU/mL' : 'mg/dL',
  referenceRange: sample.specimenType === 'Urine' ? 'Negative' : '0.7 - 1.3',
  flag: 'Normal',
  state: 'Pending Review',
  reportedAt: 'Awaiting',
  verifiedBy: 'Pending',
});

const labSlice = createSlice({
  name: 'lab',
  initialState: {
    orders: initialOrders,
    samples: initialSamples,
    results: initialResults,
    resultTemplates,
  } satisfies LaboratoryState,
  reducers: {
    addOrder: (state, action: PayloadAction<LabOrder>) => {
      state.orders = [action.payload, ...state.orders];
    },
    updateOrder: (state, action: PayloadAction<{ id: string; changes: Partial<LabOrder> }>) => {
      const index = state.orders.findIndex((order) => order.id === action.payload.id);
      if (index === -1) return;
      state.orders[index] = { ...state.orders[index], ...action.payload.changes };
    },
    removeOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter((order) => order.id !== action.payload);
    },
    moveOrderToSamples: (state, action: PayloadAction<string>) => {
      const order = state.orders.find((item) => item.id === action.payload);
      if (!order) return;
      if (!state.samples.find((sample) => sample.id === order.id)) {
        state.samples = [buildSampleFromOrder(order), ...state.samples];
      }
    },
    updateSample: (state, action: PayloadAction<{ id: string; changes: Partial<LabSample> }>) => {
      const index = state.samples.findIndex((sample) => sample.id === action.payload.id);
      if (index === -1) return;
      state.samples[index] = { ...state.samples[index], ...action.payload.changes };
      if (action.payload.changes.status) {
        const order = state.orders.find((item) => item.id === action.payload.id);
        if (!order) return;
        const status = action.payload.changes.status;
        if (status === 'Collected' || status === 'In Transit') {
          order.status = 'Collected';
        } else if (status === 'Received') {
          order.status = 'In Lab';
        } else if (status === 'Rejected' || status === 'Pending') {
          order.status = 'Pending Collection';
        }
      }
    },
    moveSampleToResults: (state, action: PayloadAction<string>) => {
      const sample = state.samples.find((item) => item.id === action.payload);
      if (!sample) return;
      if (!state.results.find((result) => result.id === sample.id)) {
        state.results = [buildResultFromSample(sample), ...state.results];
      }
      sample.status = sample.status === 'Pending' || sample.status === 'In Transit' ? 'Received' : sample.status;
      const order = state.orders.find((item) => item.id === sample.id);
      if (order) {
        order.status = 'Resulted';
      }
    },
    updateResult: (state, action: PayloadAction<{ id: string; changes: Partial<LabResult> }>) => {
      const index = state.results.findIndex((result) => result.id === action.payload.id);
      if (index === -1) return;
      state.results[index] = { ...state.results[index], ...action.payload.changes };
    },
    setResultState: (state, action: PayloadAction<{ id: string; state: ResultState; verifiedBy?: string }>) => {
      const index = state.results.findIndex((result) => result.id === action.payload.id);
      if (index === -1) return;
      state.results[index].state = action.payload.state;
      if (action.payload.verifiedBy) {
        state.results[index].verifiedBy = action.payload.verifiedBy;
      }
    },
  },
});

export const {
  addOrder,
  updateOrder,
  removeOrder,
  moveOrderToSamples,
  updateSample,
  moveSampleToResults,
  updateResult,
  setResultState,
} = labSlice.actions;

export default labSlice.reducer;
