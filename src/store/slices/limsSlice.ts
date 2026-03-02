import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  LabSample,
  LabWorksheet,
  LabClient,
  LabTestCatalogItem,
  LabResultRow,
  LabInstrument,
  LabInventoryItem,
  LabQCRecord,
  LabAuditLogEntry,
  LabSettings,
  SampleStatus,
  WorksheetStatus,
} from '@/src/screens/lab/lab-types';
import { MOCK_LAB_SAMPLES } from '@/src/mocks/lab/labSamples';
import { MOCK_LAB_WORKSHEETS } from '@/src/mocks/lab/labWorksheets';
import { MOCK_LAB_CLIENTS } from '@/src/mocks/lab/labClients';
import { MOCK_LAB_TESTS } from '@/src/mocks/lab/labTests';
import { MOCK_LAB_RESULTS } from '@/src/mocks/lab/labResults';
import { MOCK_LAB_INSTRUMENTS } from '@/src/mocks/lab/labInstruments';
import { MOCK_LAB_INVENTORY } from '@/src/mocks/lab/labInventory';
import { MOCK_LAB_QC } from '@/src/mocks/lab/labQc';
import { MOCK_LAB_SETTINGS } from '@/src/mocks/lab/labSettings';
import { MOCK_LAB_AUDIT } from '@/src/mocks/lab/labAudit';

export interface LimsState {
  samples: LabSample[];
  worksheets: LabWorksheet[];
  clients: LabClient[];
  tests: LabTestCatalogItem[];
  results: LabResultRow[];
  instruments: LabInstrument[];
  inventory: LabInventoryItem[];
  qcRecords: LabQCRecord[];
  settings: LabSettings;
  auditLog: LabAuditLogEntry[];
}

const initialState: LimsState = {
  samples: MOCK_LAB_SAMPLES,
  worksheets: MOCK_LAB_WORKSHEETS,
  clients: MOCK_LAB_CLIENTS,
  tests: MOCK_LAB_TESTS,
  results: MOCK_LAB_RESULTS,
  instruments: MOCK_LAB_INSTRUMENTS,
  inventory: MOCK_LAB_INVENTORY,
  qcRecords: MOCK_LAB_QC,
  settings: MOCK_LAB_SETTINGS,
  auditLog: MOCK_LAB_AUDIT,
};

function refFromLowHigh(low: string, high: string): string {
  if (!low && !high) return '—';
  if (!low) return `≤ ${high}`;
  if (!high) return `≥ ${low}`;
  return `${low} – ${high}`;
}

function nowTimestamp(): string {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

function sampleResults(state: LimsState, sampleId: string): LabResultRow[] {
  return state.results.filter((r) => r.sampleId === sampleId);
}

function updateSampleToAnalysedIfReady(state: LimsState, sampleId: string): void {
  const sample = state.samples.find((x) => x.id === sampleId);
  if (!sample || sample.tests.length === 0) return;

  const resultsForSample = sampleResults(state, sampleId);
  if (resultsForSample.length === 0) return;

  const coveredTests = new Set(resultsForSample.map((r) => r.test));
  const allTestsCovered = sample.tests.every((testCode) => coveredTests.has(testCode));
  if (allTestsCovered && sample.status !== 'verified' && sample.status !== 'published') {
    sample.status = 'analysed';
  }
}

function updateSampleToVerifiedIfReady(state: LimsState, sampleId: string): void {
  const sample = state.samples.find((x) => x.id === sampleId);
  if (!sample || sample.status === 'published') return;

  const resultsForSample = sampleResults(state, sampleId);
  if (resultsForSample.length === 0) return;

  const hasPending = resultsForSample.some((r) => r.status === 'pending');
  if (!hasPending) {
    sample.status = 'verified';
  }
}

const limsSlice = createSlice({
  name: 'lims',
  initialState,
  reducers: {
    addSample(state, action: PayloadAction<Omit<LabSample, 'id' | 'status' | 'analyst' | 'worksheetId'>>) {
      const n = state.samples.length + 1;
      const id = `S-2025-${String(n).padStart(4, '0')}`;
      const barcode = `BC${100000 + n}`;
      state.samples.push({
        ...action.payload,
        id,
        status: 'received',
        received: action.payload.received ?? nowTimestamp(),
        barcode: action.payload.barcode ?? barcode,
        analyst: null,
        worksheetId: null,
      });
    },
    updateSampleStatus(state, action: PayloadAction<{ sampleId: string; status: SampleStatus }>) {
      const s = state.samples.find((x) => x.id === action.payload.sampleId);
      if (s) s.status = action.payload.status;
    },
    assignAnalyst(state, action: PayloadAction<{ sampleId: string; analyst: string }>) {
      const s = state.samples.find((x) => x.id === action.payload.sampleId);
      if (s) {
        s.analyst = action.payload.analyst;
        if (s.status !== 'verified' && s.status !== 'published') s.status = 'assigned';
      }
    },
    assignWorksheet(state, action: PayloadAction<{ sampleId: string; worksheetId: string }>) {
      const s = state.samples.find((x) => x.id === action.payload.sampleId);
      const ws = state.worksheets.find((x) => x.id === action.payload.worksheetId);
      if (s && ws) {
        s.worksheetId = action.payload.worksheetId;
        s.analyst = ws.analyst;
        if (s.status !== 'verified' && s.status !== 'published') s.status = 'assigned';
        if (!ws.samples.includes(action.payload.sampleId)) ws.samples.push(action.payload.sampleId);
      }
    },
    addResult(state, action: PayloadAction<LabResultRow>) {
      const existing = state.results.findIndex(
        (x) =>
          x.sampleId === action.payload.sampleId &&
          x.test === action.payload.test &&
          x.analyte === action.payload.analyte
      );
      if (existing >= 0) {
        state.results[existing] = action.payload;
      } else {
        state.results.push(action.payload);
      }
      updateSampleToAnalysedIfReady(state, action.payload.sampleId);
    },
    addResults(state, action: PayloadAction<LabResultRow[]>) {
      const touchedSampleIds = new Set<string>();

      action.payload.forEach((row) => {
        const existing = state.results.findIndex(
          (x) => x.sampleId === row.sampleId && x.test === row.test && x.analyte === row.analyte
        );
        if (existing >= 0) {
          state.results[existing] = row;
        } else {
          state.results.push(row);
        }
        touchedSampleIds.add(row.sampleId);
      });

      touchedSampleIds.forEach((sampleId) => {
        updateSampleToAnalysedIfReady(state, sampleId);
      });
    },
    verifyResult(state, action: PayloadAction<{ resultId: string; verifiedBy: string }>) {
      const r = state.results.find((x) => x.id === action.payload.resultId);
      if (r) {
        r.status = 'verified';
        r.verifiedBy = action.payload.verifiedBy;
        updateSampleToVerifiedIfReady(state, r.sampleId);
      }
    },
    verifyAllPendingForSample(state, action: PayloadAction<{ sampleId: string; verifiedBy: string }>) {
      state.results.forEach((r) => {
        if (r.sampleId === action.payload.sampleId && r.status === 'pending') {
          r.status = 'verified';
          r.verifiedBy = action.payload.verifiedBy;
        }
      });
      updateSampleToVerifiedIfReady(state, action.payload.sampleId);
    },
    publishSample(state, action: PayloadAction<{ sampleId: string }>) {
      const s = state.samples.find((x) => x.id === action.payload.sampleId);
      if (s && s.status === 'verified') s.status = 'published';
    },
    addWorksheet(state, action: PayloadAction<Omit<LabWorksheet, 'id' | 'samples'>>) {
      const n = state.worksheets.length + 1;
      const id = `WS-${String(n).padStart(3, '0')}`;
      state.worksheets.push({
        ...action.payload,
        id,
        samples: [],
      });
    },
    updateWorksheetStatus(state, action: PayloadAction<{ worksheetId: string; status: WorksheetStatus }>) {
      const ws = state.worksheets.find((x) => x.id === action.payload.worksheetId);
      if (ws) ws.status = action.payload.status;
    },
    addSampleToWorksheet(state, action: PayloadAction<{ worksheetId: string; sampleId: string }>) {
      const ws = state.worksheets.find((x) => x.id === action.payload.worksheetId);
      const s = state.samples.find((x) => x.id === action.payload.sampleId);
      if (ws && s && !ws.samples.includes(action.payload.sampleId)) {
        ws.samples.push(action.payload.sampleId);
        s.worksheetId = action.payload.worksheetId;
        s.analyst = ws.analyst;
        if (s.status !== 'verified' && s.status !== 'published') s.status = 'assigned';
      }
    },
    addClient(state, action: PayloadAction<Omit<LabClient, 'id'>>) {
      const n = state.clients.length + 1;
      const id = `CL-${String(n).padStart(3, '0')}`;
      state.clients.push({ ...action.payload, id });
    },
    updateClient(state, action: PayloadAction<Partial<LabClient> & { id: string }>) {
      const c = state.clients.find((x) => x.id === action.payload.id);
      if (c) Object.assign(c, action.payload);
    },
    toggleClient(state, action: PayloadAction<string>) {
      const c = state.clients.find((x) => x.id === action.payload);
      if (c) c.active = !c.active;
    },
    addTest(state, action: PayloadAction<Omit<LabTestCatalogItem, 'code'> & { code?: string }>) {
      const code = action.payload.code ?? action.payload.name.slice(0, 3).toUpperCase();
      state.tests.push({ ...action.payload, code });
    },
    updateSettings(state, action: PayloadAction<Partial<LabSettings>>) {
      Object.assign(state.settings, action.payload);
    },
    toggleInstrumentStatus(state, action: PayloadAction<string>) {
      const inst = state.instruments.find((x) => x.id === action.payload);
      if (!inst) return;
      inst.status =
        inst.status === 'online'
          ? 'maintenance'
          : inst.status === 'maintenance'
          ? 'offline'
          : 'online';
    },
    addInventoryItem(state, action: PayloadAction<Omit<LabInventoryItem, 'id'>>) {
      const n = state.inventory.length + 1;
      const id = `INV-${String(n).padStart(3, '0')}`;
      state.inventory.unshift({
        ...action.payload,
        id,
      });
    },
    adjustInventoryStock(state, action: PayloadAction<{ itemId: string; delta: number }>) {
      const item = state.inventory.find((x) => x.id === action.payload.itemId);
      if (!item) return;
      item.onHand = Math.max(0, item.onHand + action.payload.delta);
    },
    appendAudit(state, action: PayloadAction<LabAuditLogEntry>) {
      state.auditLog.unshift(action.payload);
    },
  },
});

export const {
  addSample,
  updateSampleStatus,
  assignAnalyst,
  assignWorksheet,
  addResult,
  addResults,
  verifyResult,
  verifyAllPendingForSample,
  publishSample,
  addWorksheet,
  updateWorksheetStatus,
  addSampleToWorksheet,
  addClient,
  updateClient,
  toggleClient,
  addTest,
  updateSettings,
  toggleInstrumentStatus,
  addInventoryItem,
  adjustInventoryStock,
  appendAudit,
} = limsSlice.actions;

export default limsSlice.reducer;

export { refFromLowHigh };
