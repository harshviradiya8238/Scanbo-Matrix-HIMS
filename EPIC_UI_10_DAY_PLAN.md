# EPIC UI Prototype Plan (10 Days)

Scope baseline:
- UI only (no backend integration required)
- Clickable flows, routed pages, mock data states
- Responsive layout for desktop/tablet/mobile
- Existing design system reuse

## Definition of Done (Prototype)

- Every module from `EPIC-SHEET (1).xlsx` is visible in the app
- Route opens for each module from module reference
- No dead buttons in module screens
- Core empty/loading/error visual states included
- Consistent top bar, workspace card, actions, and section cards

## Current Module Status Snapshot

- Total modules: 31
- Covered: 11
- Remaining: 20

Covered includes:
- EpicCare Ambulatory (OPD), EpicCare Inpatient / ClinDoc, Epic Welcome Kiosk, Epic Care Companion, Bugsy, Radiant, Beaker, Calendar Scheduling (Cadence), Registration & ADT (Prelude/Grand Central), Open Scheduling, MyChart

## 10-Day Delivery Plan

### Day 1
- Completed:
- Add `Epic Welcome Kiosk` to module registry as implemented
- Wire `welcome-kiosk` in clinical module client
- Mark `MyChart` as implemented and route to patient portal home

### Day 2
- Build `Willow` pharmacy module UI shell
- Sections: verification queue, dispense panel, stock alerts, safety checks

### Day 3
- Build `Resolute Billing` UI shell
- Sections: claim worklist, denials, AR aging, payment posting, statement actions

### Day 4
- Build `ASAP` emergency module UI shell
- Sections: triage board, acuity lanes, tracking timeline, disposition actions

### Day 5
- Build `OpTime` + `Anesthesia` UI shells
- Sections: OR board, case prep, intra-op timeline, recovery handoff

### Day 6
- Build `Care Everywhere` + `Care Link` UI shells
- Sections: referral inbox, external chart summary, continuity notes

### Day 7
- Build `Reporting Workbench` + `Healthy Planet` UI shells
- Sections: report builder, saved reports, registry cards, quality measures

### Day 8
- Build specialty module shells: `Beacon`, `Cupid`, `Stork`
- Oncology/cardiology/obstetrics workflows and KPI cards

### Day 9
- Build remaining productivity modules: `Haiku`, `Lumens`, `Lucy`, `Dorothy`, `Chronicles`, `Hyperspace`
- Provide connected navigation between related modules

### Day 10
- UX polish and consistency pass
- Button routing audit
- Role visibility checks
- Responsive and visual QA pass

## Execution Rules

- All module pages must have:
- Header summary with status and role chips
- Main worklist panel
- Right action panel
- Quick filters/search
- At least one modal/drawer interaction
- Mock dataset with realistic healthcare labels

## Risks

- Scope is large for 10 days; this plan is for prototype UI only
- Production readiness (API + validation + test automation) is out of this window
