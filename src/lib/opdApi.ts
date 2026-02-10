export type OpdApiData = {
  providers: string[];
  appointments: unknown[];
  slotTimes: string[];
  providerAvailability: unknown[];
  encounters: unknown[];
  vitalTrends: unknown[];
  orderCatalog: unknown[];
  medicationCatalog: unknown[];
  noteTemplates: unknown[];
};

const DEFAULT_BASE_URL = 'http://localhost:4000';

const normalizeBaseUrl = (value?: string | null) => {
  const base = value && value.trim().length > 0 ? value.trim() : DEFAULT_BASE_URL;
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`OPD API request failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
};

export const fetchOpdData = async (baseUrl?: string): Promise<OpdApiData> => {
  const root = normalizeBaseUrl(baseUrl ?? process.env.NEXT_PUBLIC_OPD_API_BASE_URL);

  const [
    providers,
    appointments,
    slotTimes,
    providerAvailability,
    encounters,
    vitalTrends,
    orderCatalog,
    medicationCatalog,
    noteTemplates,
  ] = await Promise.all([
    fetchJson<string[]>(`${root}/opdProviders`),
    fetchJson<unknown[]>(`${root}/opdAppointments`),
    fetchJson<string[]>(`${root}/opdSlotTimes`),
    fetchJson<unknown[]>(`${root}/opdProviderAvailability`),
    fetchJson<unknown[]>(`${root}/opdEncounters`),
    fetchJson<unknown[]>(`${root}/opdVitalTrends`),
    fetchJson<unknown[]>(`${root}/opdOrderCatalog`),
    fetchJson<unknown[]>(`${root}/opdMedicationCatalog`),
    fetchJson<unknown[]>(`${root}/opdNoteTemplates`),
  ]);

  return {
    providers,
    appointments,
    slotTimes,
    providerAvailability,
    encounters,
    vitalTrends,
    orderCatalog,
    medicationCatalog,
    noteTemplates,
  };
};
