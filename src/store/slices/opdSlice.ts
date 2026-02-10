import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchOpdData } from '@/src/lib/opdApi';
import {
  MedicationCatalogItem,
  NoteTemplate,
  OpdAppointment,
  OpdEncounterCase,
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
} from '@/src/screens/opd/opd-mock-data';

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
  noteTemplates: NoteTemplate[];
  notes: OpdNote[];
  status: OpdLoadStatus;
  source: OpdDataSource;
  error?: string;
};

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
  notes?: OpdNote[];
};

const sortAppointments = (appointments: OpdAppointment[]) =>
  [...appointments].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

const initialState: OpdDataState = {
  providers: [...OPD_PROVIDERS],
  appointments: sortAppointments(OPD_APPOINTMENTS),
  slotTimes: [...OPD_SLOT_TIMES],
  providerAvailability: [...OPD_PROVIDER_AVAILABILITY],
  encounters: [...OPD_ENCOUNTERS],
  vitalTrends: [...OPD_VITAL_TRENDS],
  orderCatalog: [...OPD_ORDER_CATALOG],
  medicationCatalog: [...OPD_MEDICATION_CATALOG],
  noteTemplates: [...OPD_NOTE_TEMPLATES],
  notes: [],
  status: 'idle',
  source: 'fallback',
};

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
    addAppointment: (state, action: PayloadAction<OpdAppointment>) => {
      state.appointments = sortAppointments([...state.appointments, action.payload]);
    },
    addEncounter: (state, action: PayloadAction<OpdEncounterCase>) => {
      state.encounters = [...state.encounters, action.payload];
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
      action: PayloadAction<{ id: string; changes: Partial<OpdEncounterCase> }>
    ) => {
      const target = state.encounters.find((encounter) => encounter.id === action.payload.id);
      if (!target) return;

      const nextVitals = action.payload.changes.vitals
        ? { ...target.vitals, ...action.payload.changes.vitals }
        : target.vitals;
      const updated = { ...target, ...action.payload.changes, vitals: nextVitals };

      state.encounters = state.encounters.map((encounter) =>
        encounter.id === action.payload.id ? updated : encounter
      );

      if (action.payload.changes.status && updated.appointmentId) {
        state.appointments = state.appointments.map((appointment) =>
          appointment.id === updated.appointmentId
            ? { ...appointment, status: updated.status }
            : appointment
        );
      }
    },
    addVitalTrend: (state, action: PayloadAction<VitalTrendRecord>) => {
      state.vitalTrends = [...state.vitalTrends, action.payload];
    },
    addNote: (state, action: PayloadAction<OpdNote>) => {
      state.notes = [action.payload, ...state.notes];
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
        state.encounters = action.payload.encounters;
        state.vitalTrends = action.payload.vitalTrends;
        state.orderCatalog = action.payload.orderCatalog;
        state.medicationCatalog = action.payload.medicationCatalog;
        state.noteTemplates = action.payload.noteTemplates;
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
  addAppointment,
  addEncounter,
  updateAppointment,
  updateEncounter,
  addVitalTrend,
  addNote,
} = opdSlice.actions;

export default opdSlice.reducer;
