# OPD Flow (Dummy JSON + Redux)

This project now loads OPD data from a local JSON server when available, and falls back to the in-app mock data when the server is not running. The primary OPD flow is encounter-centric: appointment and queue feed one encounter, and orders/prescriptions are saved against that encounter.

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

3. Open the OPD flow (primary path)

- Calendar: `/appointments/calendar`
- Queue: `/appointments/queue`
- Visit: `/encounters/[encounterId]`
- Orders: `/encounters/[encounterId]/orders`
- Prescriptions: `/encounters/[encounterId]/prescriptions`

Legacy routes still work as redirects:
- `/appointments/visit`
- `/clinical/orders`
- `/clinical/prescriptions`

Optional supporting screens:
- Vitals: `/clinical/vitals`
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
- Queue uses encounter lifecycle states (`ARRIVED`, `IN_QUEUE`, `IN_PROGRESS`, `COMPLETED`).
- Orders and prescriptions can only be saved with an `encounterId`.
- Completing a visit updates the encounter status to `COMPLETED` and syncs the linked appointment status.

## Role-Based OPD Flow

- Front Desk (`RECEPTION`)
  - Primary screen: `/appointments/calendar`
  - Actions: create booking, reschedule, create + check-in, monitor queue handoff
  - Restricted: cannot start consult, place orders, or prescribe
- Doctor (`DOCTOR`)
  - Primary screen: `/appointments/queue`
  - Actions: start consult, document encounter, place orders, issue prescriptions, complete visit
  - Restricted: calendar booking actions are read-only
- Hospital Admin (`HOSPITAL_ADMIN`)
  - Primary screen: `/appointments/queue`
  - Actions: full OPD actions across Front Desk and Doctor stages

Encounter route protection now follows OPD clinical ownership:
- `/encounters/[encounterId]` requires `clinical.ambulatory.write`
- `/encounters/[encounterId]/orders` requires `clinical.orders.write`
- `/encounters/[encounterId]/prescriptions` requires `clinical.prescriptions.write`

## Fallback Behavior

If the JSON server is not running, the app automatically uses the fallback OPD mock data from:

- `src/screens/opd/opd-mock-data.ts`

You will see a warning banner on OPD screens when the JSON server is unavailable.
