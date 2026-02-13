import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchOpdData } from '@/src/lib/opdApi';
import {
  MedicationCatalogItem,
  NoteTemplate,
  OpdAppointment,
  OpdEncounterCase,
  OpdEncounterOrder,
  OpdEncounterPrescription,
  OrderCatalogItem,
  ProviderAvailability,
  VitalTrendRecord,
  OPD_APPOINTMENTS,
  OPD_ENCOUNTERS,
  OPD_MEDICATION_CATALOG,
  OPD_NOTE_TEMPLATES,
  OPD_ORDER_CATALOG,
  OPD_PROVIDER_AVAILABILITY,
  OPD_PROVIDERS,
  OPD_SLOT_TIMES,
  OPD_VITAL_TRENDS,
  EncounterStatus,
} from '@/src/screens/opd/opd-mock-data';
import {
  canTransitionEncounterStatus,
  mapEncounterStatusToAppointmentStatus,
  normalizeEncounterStatus,
} from '@/src/screens/opd/opd-encounter';

export interface OpdNote {
  id: string;
  patientId: string;
  title: string;
  content: string;
  savedAt: string;
  author: string;
}

export type OpdLoadStatus = 'idle' | 'loading' | 'ready' | 'error';
export type OpdDataSource = 'fallback' | 'server';

export type OpdDataState = {
  providers: string[];
  appointments: OpdAppointment[];
  slotTimes: string[];
  providerAvailability: ProviderAvailability[];
  encounters: OpdEncounterCase[];
  vitalTrends: VitalTrendRecord[];
  orderCatalog: OrderCatalogItem[];
  medicationCatalog: MedicationCatalogItem[];
  orders: OpdEncounterOrder[];
  prescriptions: OpdEncounterPrescription[];
  noteTemplates: NoteTemplate[];
  notes: OpdNote[];
  status: OpdLoadStatus;
  source: OpdDataSource;
  error?: string;
};

export type OpdPersistedData = Pick<
  OpdDataState,
  | 'providers'
  | 'appointments'
  | 'slotTimes'
  | 'providerAvailability'
  | 'encounters'
  | 'vitalTrends'
  | 'orderCatalog'
  | 'medicationCatalog'
  | 'orders'
  | 'prescriptions'
  | 'noteTemplates'
  | 'notes'
>;

type OpdRemotePayload = {
  providers: string[];
  appointments: OpdAppointment[];
  slotTimes: string[];
  providerAvailability: ProviderAvailability[];
  encounters: OpdEncounterCase[];
  vitalTrends: VitalTrendRecord[];
  orderCatalog: OrderCatalogItem[];
  medicationCatalog: MedicationCatalogItem[];
  noteTemplates: NoteTemplate[];
  orders?: OpdEncounterOrder[];
  prescriptions?: OpdEncounterPrescription[];
  notes?: OpdNote[];
};

type UpdateEncounterChanges = Partial<Omit<OpdEncounterCase, 'vitals'>> & {
  vitals?: Partial<OpdEncounterCase['vitals']>;
};

const sortAppointments = (appointments: OpdAppointment[]) =>
  [...appointments].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

const normalizeEncounter = (encounter: OpdEncounterCase): OpdEncounterCase => {
  const status = normalizeEncounterStatus(String(encounter.status));
  return {
    ...encounter,
    patientId: encounter.patientId || encounter.mrn,
    status,
    notes: Array.isArray(encounter.notes) ? encounter.notes : [],
    orders: Array.isArray(encounter.orders) ? encounter.orders : [],
    prescriptions: Array.isArray(encounter.prescriptions) ? encounter.prescriptions : [],
    vitals: {
      bp: encounter.vitals?.bp ?? '',
      hr: encounter.vitals?.hr ?? '',
      rr: encounter.vitals?.rr ?? '',
      temp: encounter.vitals?.temp ?? '',
      spo2: encounter.vitals?.spo2 ?? '',
      weightKg: encounter.vitals?.weightKg ?? '',
      bmi: encounter.vitals?.bmi ?? '',
    },
  };
};

const applyEncounterStatusUpdate = (
  currentStatus: EncounterStatus,
  requestedStatus?: EncounterStatus
): EncounterStatus => {
  if (!requestedStatus) return currentStatus;
  if (!canTransitionEncounterStatus(currentStatus, requestedStatus)) {
    return currentStatus;
  }
  return requestedStatus;
};

const initialState: OpdDataState = {
  providers: [...OPD_PROVIDERS],
  appointments: sortAppointments(OPD_APPOINTMENTS),
  slotTimes: [...OPD_SLOT_TIMES],
  providerAvailability: [...OPD_PROVIDER_AVAILABILITY],
  encounters: OPD_ENCOUNTERS.map(normalizeEncounter),
  vitalTrends: [...OPD_VITAL_TRENDS],
  orderCatalog: [...OPD_ORDER_CATALOG],
  medicationCatalog: [...OPD_MEDICATION_CATALOG],
  orders: [],
  prescriptions: [],
  noteTemplates: [...OPD_NOTE_TEMPLATES],
  notes: [],
  status: 'idle',
  source: 'fallback',
};

export const selectPersistableOpdData = (state: OpdDataState): OpdPersistedData => ({
  providers: state.providers,
  appointments: state.appointments,
  slotTimes: state.slotTimes,
  providerAvailability: state.providerAvailability,
  encounters: state.encounters,
  vitalTrends: state.vitalTrends,
  orderCatalog: state.orderCatalog,
  medicationCatalog: state.medicationCatalog,
  orders: state.orders,
  prescriptions: state.prescriptions,
  noteTemplates: state.noteTemplates,
  notes: state.notes,
});

export const loadOpdData = createAsyncThunk<OpdRemotePayload>(
  'opd/loadOpdData',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchOpdData();
      return {
        providers: data.providers,
        appointments: data.appointments as OpdAppointment[],
        slotTimes: data.slotTimes,
        providerAvailability: data.providerAvailability as ProviderAvailability[],
        encounters: data.encounters as OpdEncounterCase[],
        vitalTrends: data.vitalTrends as VitalTrendRecord[],
        orderCatalog: data.orderCatalog as OrderCatalogItem[],
        medicationCatalog: data.medicationCatalog as MedicationCatalogItem[],
        noteTemplates: data.noteTemplates as NoteTemplate[],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load OPD data.';
      return rejectWithValue(message);
    }
  }
);

const opdSlice = createSlice({
  name: 'opd',
  initialState,
  reducers: {
    hydrateOpdFromStorage: (
      state,
      action: PayloadAction<Partial<OpdPersistedData>>
    ) => {
      const payload = action.payload;
      if (!payload) return;

      if (Array.isArray(payload.providers)) state.providers = [...payload.providers];
      if (Array.isArray(payload.appointments)) state.appointments = sortAppointments(payload.appointments);
      if (Array.isArray(payload.slotTimes)) state.slotTimes = [...payload.slotTimes];
      if (Array.isArray(payload.providerAvailability)) state.providerAvailability = [...payload.providerAvailability];
      if (Array.isArray(payload.encounters)) state.encounters = payload.encounters.map(normalizeEncounter);
      if (Array.isArray(payload.vitalTrends)) state.vitalTrends = [...payload.vitalTrends];
      if (Array.isArray(payload.orderCatalog)) state.orderCatalog = [...payload.orderCatalog];
      if (Array.isArray(payload.medicationCatalog)) state.medicationCatalog = [...payload.medicationCatalog];
      if (Array.isArray(payload.orders)) state.orders = [...payload.orders];
      if (Array.isArray(payload.prescriptions)) state.prescriptions = [...payload.prescriptions];
      if (Array.isArray(payload.noteTemplates)) state.noteTemplates = [...payload.noteTemplates];
      if (Array.isArray(payload.notes)) state.notes = [...payload.notes];

      state.status = 'ready';
      state.source = 'fallback';
      state.error = undefined;
    },
    addAppointment: (state, action: PayloadAction<OpdAppointment>) => {
      state.appointments = sortAppointments([...state.appointments, action.payload]);
    },
    addEncounter: (state, action: PayloadAction<OpdEncounterCase>) => {
      state.encounters = [...state.encounters, normalizeEncounter(action.payload)];
    },
    updateAppointment: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<OpdAppointment> }>
    ) => {
      state.appointments = state.appointments.map((appointment) =>
        appointment.id === action.payload.id
          ? { ...appointment, ...action.payload.changes }
          : appointment
      );
    },
    updateEncounter: (
      state,
      action: PayloadAction<{ id: string; changes: UpdateEncounterChanges }>
    ) => {
      const target = state.encounters.find((encounter) => encounter.id === action.payload.id);
      if (!target) return;

      const requestedStatus = action.payload.changes.status
        ? normalizeEncounterStatus(String(action.payload.changes.status))
        : undefined;
      const nextStatus = applyEncounterStatusUpdate(target.status, requestedStatus);

      const nextVitals = action.payload.changes.vitals
        ? { ...target.vitals, ...action.payload.changes.vitals }
        : target.vitals;

      const updated: OpdEncounterCase = {
        ...target,
        ...action.payload.changes,
        status: nextStatus,
        patientId: target.patientId || target.mrn,
        notes: action.payload.changes.notes ?? target.notes,
        orders: action.payload.changes.orders ?? target.orders,
        prescriptions: action.payload.changes.prescriptions ?? target.prescriptions,
        vitals: nextVitals,
      };

      state.encounters = state.encounters.map((encounter) =>
        encounter.id === action.payload.id ? updated : encounter
      );

      if (updated.appointmentId) {
        const appointmentStatus = mapEncounterStatusToAppointmentStatus(updated.status);
        state.appointments = state.appointments.map((appointment) =>
          appointment.id === updated.appointmentId
            ? { ...appointment, status: appointmentStatus }
            : appointment
        );
      }
    },
    addEncounterOrder: (state, action: PayloadAction<OpdEncounterOrder>) => {
      state.orders = [action.payload, ...state.orders];

      const encounter = state.encounters.find((item) => item.id === action.payload.encounterId);
      if (encounter && !encounter.orders.includes(action.payload.id)) {
        encounter.orders = [action.payload.id, ...encounter.orders];
      }
    },
    updateEncounterOrder: (
      state,
      action: PayloadAction<{
        id: string;
        changes: Partial<Omit<OpdEncounterOrder, 'id' | 'encounterId' | 'patientId'>>;
      }>
    ) => {
      state.orders = state.orders.map((order) =>
        order.id === action.payload.id
          ? { ...order, ...action.payload.changes }
          : order
      );
    },
    removeEncounterOrder: (state, action: PayloadAction<string>) => {
      const removed = state.orders.find((item) => item.id === action.payload);
      if (!removed) return;

      state.orders = state.orders.filter((item) => item.id !== action.payload);

      const encounter = state.encounters.find((item) => item.id === removed.encounterId);
      if (encounter) {
        encounter.orders = encounter.orders.filter((id) => id !== action.payload);
      }
    },
    addEncounterPrescription: (state, action: PayloadAction<OpdEncounterPrescription>) => {
      state.prescriptions = [action.payload, ...state.prescriptions];

      const encounter = state.encounters.find((item) => item.id === action.payload.encounterId);
      if (encounter && !encounter.prescriptions.includes(action.payload.id)) {
        encounter.prescriptions = [action.payload.id, ...encounter.prescriptions];
      }
    },
    updateEncounterPrescription: (
      state,
      action: PayloadAction<{
        id: string;
        changes: Partial<Omit<OpdEncounterPrescription, 'id' | 'encounterId' | 'patientId'>>;
      }>
    ) => {
      state.prescriptions = state.prescriptions.map((prescription) =>
        prescription.id === action.payload.id
          ? { ...prescription, ...action.payload.changes }
          : prescription
      );
    },
    removeEncounterPrescription: (state, action: PayloadAction<string>) => {
      const removed = state.prescriptions.find((item) => item.id === action.payload);
      if (!removed) return;

      state.prescriptions = state.prescriptions.filter((item) => item.id !== action.payload);

      const encounter = state.encounters.find((item) => item.id === removed.encounterId);
      if (encounter) {
        encounter.prescriptions = encounter.prescriptions.filter((id) => id !== action.payload);
      }
    },
    addVitalTrend: (state, action: PayloadAction<VitalTrendRecord>) => {
      state.vitalTrends = [...state.vitalTrends, action.payload];
    },
    addNote: (state, action: PayloadAction<OpdNote>) => {
      state.notes = [action.payload, ...state.notes];

      const encounter = state.encounters.find((item) => item.id === action.payload.patientId);
      if (encounter && !encounter.notes.includes(action.payload.id)) {
        encounter.notes = [action.payload.id, ...encounter.notes];
      }
    },
    updateNote: (
      state,
      action: PayloadAction<{
        id: string;
        changes: Partial<Omit<OpdNote, 'id' | 'patientId'>>;
      }>
    ) => {
      state.notes = state.notes.map((note) =>
        note.id === action.payload.id
          ? { ...note, ...action.payload.changes }
          : note
      );
    },
    removeNote: (state, action: PayloadAction<string>) => {
      const removed = state.notes.find((item) => item.id === action.payload);
      if (!removed) return;

      state.notes = state.notes.filter((item) => item.id !== action.payload);

      const encounter = state.encounters.find((item) => item.id === removed.patientId);
      if (encounter) {
        encounter.notes = encounter.notes.filter((id) => id !== action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOpdData.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(loadOpdData.fulfilled, (state, action) => {
        state.providers = action.payload.providers;
        state.appointments = sortAppointments(action.payload.appointments);
        state.slotTimes = action.payload.slotTimes;
        state.providerAvailability = action.payload.providerAvailability;
        state.encounters = action.payload.encounters.map(normalizeEncounter);
        state.vitalTrends = action.payload.vitalTrends;
        state.orderCatalog = action.payload.orderCatalog;
        state.medicationCatalog = action.payload.medicationCatalog;
        state.noteTemplates = action.payload.noteTemplates;
        state.orders = action.payload.orders ?? state.orders;
        state.prescriptions = action.payload.prescriptions ?? state.prescriptions;
        state.notes = action.payload.notes ?? state.notes;
        state.status = 'ready';
        state.source = 'server';
        state.error = undefined;
      })
      .addCase(loadOpdData.rejected, (state, action) => {
        state.status = 'error';
        state.source = 'fallback';
        state.error = typeof action.payload === 'string'
          ? action.payload
          : action.error.message;
      });
  },
});

export const {
  hydrateOpdFromStorage,
  addAppointment,
  addEncounter,
  updateAppointment,
  updateEncounter,
  addEncounterOrder,
  updateEncounterOrder,
  removeEncounterOrder,
  addEncounterPrescription,
  updateEncounterPrescription,
  removeEncounterPrescription,
  addVitalTrend,
  addNote,
  updateNote,
  removeNote,
} = opdSlice.actions;

export default opdSlice.reducer;
