# OPD Flow (Dummy JSON + Redux)

This project now loads OPD data from a local JSON server when available, and falls back to the in-app mock data when the server is not running. The OPD flow screens (calendar, queue, visit, vitals, orders, prescriptions, notes) all read from the same Redux slice so changes persist across the flow.

## Quick Start

1. Start the JSON server (dummy data)

```bash
npm run opd:server
```

This serves the data file at `data/opd-db.json` on `http://localhost:4000`.

2. Start the app

```bash
npm run dev
```

3. Open the OPD flow

- Calendar: `/appointments/calendar`
- Queue: `/appointments/queue`
- Visit: `/appointments/visit`
- Vitals: `/clinical/vitals`
- Orders: `/clinical/orders`
- Prescriptions: `/clinical/prescriptions`
- Notes: `/clinical/notes`

## Environment

The OPD data base URL defaults to `http://localhost:4000` if not provided. You can override it with:

```
NEXT_PUBLIC_OPD_API_BASE_URL=http://localhost:4000
```

See `env.example` for reference.

## What Data Is Served

`data/opd-db.json` exposes these collections:

- `opdProviders`
- `opdAppointments`
- `opdSlotTimes`
- `opdProviderAvailability`
- `opdEncounters`
- `opdVitalTrends`
- `opdOrderCatalog`
- `opdMedicationCatalog`
- `opdNoteTemplates`

## Flow Notes

- Creating a booking and choosing “Send to Queue” will add a new encounter and route you to the queue.
- Queue triage updates encounter status and vitals in Redux.
- Vitals capture writes to the vitals trend list and updates the encounter vitals.
- Completing a visit updates the encounter (and linked appointment status) to `Completed`.

## Fallback Behavior

If the JSON server is not running, the app automatically uses the fallback OPD mock data from:

- `src/screens/opd/opd-mock-data.ts`

You will see a warning banner on OPD screens when the JSON server is unavailable.
