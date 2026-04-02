"[project]/src/screens/patients/PatientProfile/hooks/usePatientProfileData.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePatientProfileData",
    ()=>usePatientProfileData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$theme$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/ui/theme/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$styles$2f$useTheme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__useTheme$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/styles/useTheme.js [app-client] (ecmascript) <export default as useTheme>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/system/esm/colorManipulator.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$hooks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/hooks.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$opdHooks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/opdHooks.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mocks$2f$global$2d$patients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mocks/global-patients.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mocks$2f$care$2d$companion$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mocks/care-companion.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mocks$2f$infection$2d$control$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mocks/infection-control.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$opdSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/slices/opdSlice.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$patients$2f$PatientProfile$2f$utils$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/screens/patients/PatientProfile/utils/utils.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$MonitorHeart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/MonitorHeart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Favorite$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/Favorite.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Thermostat$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/Thermostat.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Air$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/Air.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$WaterDrop$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/WaterDrop.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Healing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/Healing.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Scale$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/Scale.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$FitnessCenter$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/FitnessCenter.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function usePatientProfileData() {
    _s();
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$styles$2f$useTheme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__useTheme$3e$__["useTheme"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const mrn = searchParams.get("mrn")?.toUpperCase() ?? "";
    const dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$hooks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"])();
    const { appointments, encounters, vitalTrends, medicationCatalog } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$opdHooks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useOpdData"])();
    const patient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mocks$2f$global$2d$patients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPatientByMrn"])(mrn);
    const tileShadow = "0 8px 18px rgba(15, 23, 42, 0.05)";
    const lightBorder = `1px solid ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(theme.palette.text.primary, 0.04)}`;
    const dividerSx = {
        my: 1.5,
        borderColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(theme.palette.text.primary, 0.08)
    };
    const tabHeaderSx = {
        mb: 1.5
    };
    const [cancelTarget, setCancelTarget] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const opdAppointments = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "usePatientProfileData.useMemo[opdAppointments]": ()=>appointments.filter({
                "usePatientProfileData.useMemo[opdAppointments]": (appointment)=>appointment.mrn === patient?.mrn
            }["usePatientProfileData.useMemo[opdAppointments]"])
    }["usePatientProfileData.useMemo[opdAppointments]"], [
        appointments,
        patient?.mrn
    ]);
    const opdEncounter = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "usePatientProfileData.useMemo[opdEncounter]": ()=>encounters.find({
                "usePatientProfileData.useMemo[opdEncounter]": (encounter)=>encounter.mrn === patient?.mrn
            }["usePatientProfileData.useMemo[opdEncounter]"])
    }["usePatientProfileData.useMemo[opdEncounter]"], [
        encounters,
        patient?.mrn
    ]);
    const timelineAppointments = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "usePatientProfileData.useMemo[timelineAppointments]": ()=>[
                ...opdAppointments
            ].sort({
                "usePatientProfileData.useMemo[timelineAppointments]": (a, b)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$patients$2f$PatientProfile$2f$utils$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildDateTime"])(b.date, b.time).getTime() - (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$patients$2f$PatientProfile$2f$utils$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildDateTime"])(a.date, a.time).getTime()
            }["usePatientProfileData.useMemo[timelineAppointments]"])
    }["usePatientProfileData.useMemo[timelineAppointments]"], [
        opdAppointments
    ]);
    const handleReschedule = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "usePatientProfileData.useCallback[handleReschedule]": (appointment)=>{
            router.push(`/appointments/calendar?mrn=${appointment.mrn}&date=${appointment.date}&appointmentId=${appointment.id}`);
        }
    }["usePatientProfileData.useCallback[handleReschedule]"], [
        router
    ]);
    const handleCancelAppointment = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "usePatientProfileData.useCallback[handleCancelAppointment]": (appointment)=>{
            if (appointment.status === "Cancelled") return;
            setCancelTarget(appointment);
        }
    }["usePatientProfileData.useCallback[handleCancelAppointment]"], []);
    const confirmCancelAppointment = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "usePatientProfileData.useCallback[confirmCancelAppointment]": ()=>{
            if (!cancelTarget) return;
            dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$opdSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateAppointment"])({
                id: cancelTarget.id,
                changes: {
                    status: "Cancelled"
                }
            }));
            setCancelTarget(null);
        }
    }["usePatientProfileData.useCallback[confirmCancelAppointment]"], [
        cancelTarget,
        dispatch
    ]);
    const latestAppointment = timelineAppointments[0];
    const vitalHistory = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "usePatientProfileData.useMemo[vitalHistory]": ()=>opdEncounter ? vitalTrends.filter({
                "usePatientProfileData.useMemo[vitalHistory]": (record)=>record.patientId === opdEncounter.id
            }["usePatientProfileData.useMemo[vitalHistory]"]) : []
    }["usePatientProfileData.useMemo[vitalHistory]"], [
        opdEncounter,
        vitalTrends
    ]);
    const latestVital = vitalHistory.length ? vitalHistory[vitalHistory.length - 1] : undefined;
    const tabs = [
        {
            id: "history",
            label: "Medical History"
        },
        {
            id: "vitals",
            label: "Vitals Reports"
        },
        {
            id: "medications",
            label: "Medications"
        },
        {
            id: "ipd",
            label: "IPD / Inpatient"
        },
        {
            id: "billing",
            label: "Billing"
        },
        {
            id: "care",
            label: "Care Companion"
        },
        {
            id: "infection",
            label: "Infection Control"
        },
        {
            id: "radiology",
            label: "Radiology"
        },
        {
            id: "labs",
            label: "Lab Results"
        },
        {
            id: "immunizations",
            label: "Immunizations"
        },
        {
            id: "documents",
            label: "Documents"
        },
        {
            id: "appointments",
            label: "Appointments"
        },
        {
            id: "problems",
            label: "Problem List"
        }
    ];
    const [activeTab, setActiveTab] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](tabs[0].id);
    const [selectedVitalId, setSelectedVitalId] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("bp");
    const [vitalsView, setVitalsView] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("trend");
    const [vitalsPeriod, setVitalsPeriod] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("3M");
    const [vitalHistPage, setVitalHistPage] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](0);
    const [vitalRowsPerPage, setVitalRowsPerPage] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](10);
    const VITAL_STATUS_CFG = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "usePatientProfileData.useMemo[VITAL_STATUS_CFG]": ()=>({
                normal: {
                    color: theme.palette.success.main,
                    bg: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(theme.palette.success.main, 0.08),
                    label: "Normal",
                    border: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(theme.palette.success.main, 0.2)
                },
                elevated: {
                    color: theme.palette.warning.dark,
                    bg: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(theme.palette.warning.main, 0.08),
                    label: "Elevated",
                    border: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(theme.palette.warning.main, 0.2)
                },
                high: {
                    color: theme.palette.error.main,
                    bg: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(theme.palette.error.main, 0.08),
                    label: "High",
                    border: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(theme.palette.error.main, 0.2)
                },
                low: {
                    color: theme.palette.info.main,
                    bg: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(theme.palette.info.main, 0.08),
                    label: "Low",
                    border: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(theme.palette.info.main, 0.2)
                }
            })
    }["usePatientProfileData.useMemo[VITAL_STATUS_CFG]"], [
        theme
    ]);
    const VITAL_NOTES = [
        "Resting",
        "After activity",
        "Morning",
        "Evening",
        "Clinic visit",
        "Post-walk",
        "Night reading",
        "Pre-sleep"
    ];
    /* Extract numeric values for Sparkline from vitalHistory */ const parseVitalNum = (s)=>{
        if (!s) return NaN;
        const m = s.match(/[\d.]+/);
        return m ? parseFloat(m[0]) : NaN;
    };
    const vitalChartValues = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "usePatientProfileData.useMemo[vitalChartValues]": ()=>{
            if (!vitalHistory.length) return [];
            const sorted = [
                ...vitalHistory
            ].sort({
                "usePatientProfileData.useMemo[vitalChartValues].sorted": (a, b)=>a.recordedAt.localeCompare(b.recordedAt)
            }["usePatientProfileData.useMemo[vitalChartValues].sorted"]);
            return sorted.map({
                "usePatientProfileData.useMemo[vitalChartValues]": (r)=>{
                    if (selectedVitalId === "bp") return parseVitalNum(r.bp?.split("/")[0]);
                    if (selectedVitalId === "hr") return parseVitalNum(r.hr);
                    if (selectedVitalId === "rr") return parseVitalNum(r.rr);
                    if (selectedVitalId === "temp") return parseVitalNum(r.temp);
                    if (selectedVitalId === "spo2") return parseVitalNum(r.spo2);
                    if (selectedVitalId === "weight" || selectedVitalId === "bmi") return NaN;
                    return r.painScore;
                }
            }["usePatientProfileData.useMemo[vitalChartValues]"]).filter({
                "usePatientProfileData.useMemo[vitalChartValues]": (v)=>!Number.isNaN(v)
            }["usePatientProfileData.useMemo[vitalChartValues]"]);
        }
    }["usePatientProfileData.useMemo[vitalChartValues]"], [
        vitalHistory,
        selectedVitalId
    ]);
    /* Fallback dummy data when no real vitals — graph always visible */ const chartValuesToShow = vitalChartValues.length >= 2 ? vitalChartValues : selectedVitalId === "bp" ? [
        148,
        142,
        138,
        145,
        140,
        136,
        132,
        128
    ] : selectedVitalId === "hr" ? [
        100,
        96,
        88,
        92,
        84,
        82,
        78,
        74
    ] : selectedVitalId === "rr" ? [
        20,
        18,
        17,
        18,
        16,
        16,
        15,
        14
    ] : selectedVitalId === "temp" ? [
        98.7,
        98.6,
        98.4,
        98.6,
        98.2,
        98.3,
        98.1,
        98.2
    ] : selectedVitalId === "spo2" ? [
        97,
        98,
        99,
        98,
        99,
        98,
        99,
        99
    ] : selectedVitalId === "weight" ? [
        82,
        81.5,
        81,
        80.5,
        80,
        79.5,
        79,
        78.5
    ] : selectedVitalId === "bmi" ? [
        28.5,
        28.2,
        27.9,
        27.6,
        27.3,
        27.0,
        26.7,
        26.4
    ] : [
        2,
        1,
        1,
        0,
        0,
        0,
        0,
        0
    ];
    const vitalChartColor = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "usePatientProfileData.useMemo[vitalChartColor]": ()=>{
            const map = {
                bp: theme.palette.primary.main,
                hr: theme.palette.error.main,
                spo2: theme.palette.info.main,
                temp: theme.palette.warning.dark,
                rr: theme.palette.success.dark,
                weight: theme.palette.text.secondary,
                bmi: theme.palette.warning.main
            };
            return map[selectedVitalId] ?? theme.palette.primary.main;
        }
    }["usePatientProfileData.useMemo[vitalChartColor]"], [
        selectedVitalId,
        theme
    ]);
    const vitalHistorySorted = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "usePatientProfileData.useMemo[vitalHistorySorted]": ()=>[
                ...vitalHistory
            ].sort({
                "usePatientProfileData.useMemo[vitalHistorySorted]": (a, b)=>b.recordedAt.localeCompare(a.recordedAt)
            }["usePatientProfileData.useMemo[vitalHistorySorted]"])
    }["usePatientProfileData.useMemo[vitalHistorySorted]"], [
        vitalHistory
    ]);
    const vitalTotalHistPages = Math.max(1, Math.ceil(vitalHistorySorted.length / vitalRowsPerPage));
    const vitalPagedHistory = vitalHistorySorted.slice(vitalHistPage * vitalRowsPerPage, vitalHistPage * vitalRowsPerPage + vitalRowsPerPage);
    const getVitalValue = (r)=>{
        const v = selectedVitalId === "bp" ? r.bp : selectedVitalId === "hr" ? r.hr : selectedVitalId === "rr" ? r.rr : selectedVitalId === "temp" ? r.temp : selectedVitalId === "spo2" ? r.spo2 : selectedVitalId === "weight" ? opdEncounter?.vitals?.weightKg : selectedVitalId === "bmi" ? opdEncounter?.vitals?.bmi : String(r.painScore);
        return v ?? "—";
    };
    const getVitalUnit = ()=>selectedVitalId === "bp" ? "mmHg" : selectedVitalId === "hr" || selectedVitalId === "rr" ? "bpm" : selectedVitalId === "temp" ? "°C" : selectedVitalId === "spo2" ? "%" : selectedVitalId === "weight" ? "kg" : selectedVitalId === "bmi" ? "kg/m²" : "";
    const readingStatus = (val)=>{
        const n = typeof val === "string" ? parseFloat(val.replace(/[^\d.]/g, "")) : val;
        if (Number.isNaN(n)) return "normal";
        if (selectedVitalId === "bp") return n > 140 ? "elevated" : n > 120 ? "elevated" : "normal";
        if (selectedVitalId === "hr") return n > 100 ? "high" : n < 60 ? "low" : "normal";
        if (selectedVitalId === "spo2") return n < 95 ? "low" : n < 98 ? "elevated" : "normal";
        if (selectedVitalId === "temp") return n > 99 ? "high" : n < 97 ? "low" : "normal";
        if (selectedVitalId === "rr") return n > 20 ? "high" : n < 12 ? "low" : "normal";
        return "normal";
    };
    const formatVitalDate = (recordedAt)=>{
        const parts = recordedAt.split(" ");
        const datePart = parts[0];
        if (!datePart) return recordedAt;
        const [y, m, d] = datePart.split("-").map(Number);
        const date = new Date(y, (m ?? 1) - 1, d);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "usePatientProfileData.useEffect": ()=>{
            setVitalHistPage(0);
        }
    }["usePatientProfileData.useEffect"], [
        selectedVitalId,
        vitalRowsPerPage
    ]);
    const payerType = latestAppointment?.payerType ?? "General";
    const insuranceLabel = payerType === "Insurance" ? "HealthSecure TPA" : payerType === "Corporate" ? "Scanbo Corporate Plan" : "Self Pay";
    const allergiesRaw = opdEncounter?.allergies ?? [];
    const allergies = allergiesRaw.filter((item)=>item && item.toLowerCase() !== "no known allergies");
    const allergyDisplay = allergies.length ? allergies : [
        "No known allergies"
    ];
    const problems = opdEncounter?.problems ?? [];
    const patientMedications = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "usePatientProfileData.useMemo[patientMedications]": ()=>{
            if (!medicationCatalog.length) return [];
            const preferredNames = new Set();
            if (patient?.tags.includes("Diabetic")) preferredNames.add("Metformin");
            if (patient?.tags.includes("Hypertension")) preferredNames.add("Telmisartan");
            if (patient?.tags.includes("Cardiac")) preferredNames.add("Atorvastatin");
            const prioritized = medicationCatalog.filter({
                "usePatientProfileData.useMemo[patientMedications].prioritized": (med)=>preferredNames.has(med.genericName)
            }["usePatientProfileData.useMemo[patientMedications].prioritized"]);
            const fallback = medicationCatalog.filter({
                "usePatientProfileData.useMemo[patientMedications].fallback": (med)=>!preferredNames.has(med.genericName)
            }["usePatientProfileData.useMemo[patientMedications].fallback"]);
            const selected = [
                ...prioritized,
                ...fallback
            ].slice(0, 4);
            return selected.map({
                "usePatientProfileData.useMemo[patientMedications]": (med, index)=>({
                        name: med.genericName,
                        dosage: med.strength,
                        frequency: med.commonFrequency,
                        status: index === selected.length - 1 && selected.length > 2 ? "Discontinued" : "Active"
                    })
            }["usePatientProfileData.useMemo[patientMedications]"]);
        }
    }["usePatientProfileData.useMemo[patientMedications]"], [
        medicationCatalog,
        patient?.tags
    ]);
    const medicationTableRows = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "usePatientProfileData.useMemo[medicationTableRows]": ()=>{
            if (!medicationCatalog.length) return [];
            const metaMap = {
                Metformin: {
                    subtitle: "Antihyperglycemic – Biguanide",
                    startDate: "2024-01-15",
                    refills: "3 remaining"
                },
                Telmisartan: {
                    subtitle: "Antihypertensive – ARB",
                    startDate: "2023-11-02",
                    refills: "2 remaining"
                },
                Pantoprazole: {
                    subtitle: "Proton Pump Inhibitor",
                    startDate: "2024-02-01",
                    refills: "2 remaining"
                },
                Paracetamol: {
                    subtitle: "Analgesic / Antipyretic",
                    startDate: "2024-03-10",
                    refills: "PRN"
                },
                Atorvastatin: {
                    subtitle: "Cholesterol Management – Statin",
                    startDate: "2024-08-05",
                    refills: "4 remaining"
                },
                "Amoxicillin + Clavulanate": {
                    subtitle: "Antibiotic",
                    startDate: "2025-06-22",
                    refills: "N/A",
                    status: "Completed"
                }
            };
            const preferredNames = new Set();
            if (patient?.tags.includes("Diabetic")) preferredNames.add("Metformin");
            if (patient?.tags.includes("Hypertension")) preferredNames.add("Telmisartan");
            if (patient?.tags.includes("Cardiac")) preferredNames.add("Atorvastatin");
            const prioritized = medicationCatalog.filter({
                "usePatientProfileData.useMemo[medicationTableRows].prioritized": (med)=>preferredNames.has(med.genericName)
            }["usePatientProfileData.useMemo[medicationTableRows].prioritized"]);
            const fallback = medicationCatalog.filter({
                "usePatientProfileData.useMemo[medicationTableRows].fallback": (med)=>!preferredNames.has(med.genericName)
            }["usePatientProfileData.useMemo[medicationTableRows].fallback"]);
            const selected = [
                ...prioritized,
                ...fallback
            ].slice(0, 6);
            const prescriber = latestAppointment?.provider ?? patient?.primaryDoctor ?? "—";
            return selected.map({
                "usePatientProfileData.useMemo[medicationTableRows]": (med, index)=>{
                    const meta = metaMap[med.genericName];
                    const fallbackStart = patient?.lastVisit ?? "2024-01-01";
                    const status = meta?.status ?? (index === selected.length - 1 ? "Completed" : "Active");
                    return {
                        name: med.genericName,
                        subtitle: meta?.subtitle ?? med.form,
                        dosage: `${med.strength} · ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$patients$2f$PatientProfile$2f$utils$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatFrequency"])(med.commonFrequency)}`,
                        prescriber,
                        startDate: meta?.startDate ?? fallbackStart,
                        status,
                        refills: meta?.refills ?? (status === "Active" ? "3 remaining" : "N/A")
                    };
                }
            }["usePatientProfileData.useMemo[medicationTableRows]"]);
        }
    }["usePatientProfileData.useMemo[medicationTableRows]"], [
        latestAppointment?.provider,
        medicationCatalog,
        patient?.primaryDoctor,
        patient?.lastVisit,
        patient?.tags
    ]);
    const labResults = [
        {
            category: "Metabolic Panel",
            results: [
                {
                    test: "Glucose (Fasting)",
                    value: "98 mg/dL",
                    range: "70-100",
                    status: "Normal"
                },
                {
                    test: "Creatinine",
                    value: "0.9 mg/dL",
                    range: "0.6-1.3",
                    status: "Normal"
                }
            ]
        },
        {
            category: "Lipid Profile",
            results: [
                {
                    test: "LDL Cholesterol",
                    value: "102 mg/dL",
                    range: "<100",
                    status: "Borderline"
                },
                {
                    test: "HDL Cholesterol",
                    value: "52 mg/dL",
                    range: ">40",
                    status: "Normal"
                }
            ]
        }
    ];
    const documents = [
        {
            name: "Annual Physical Summary",
            type: "PDF",
            date: "2026-02-04"
        },
        {
            name: "Lab Report - Lipid Profile",
            type: "PDF",
            date: "2026-02-01"
        },
        {
            name: "Imaging Order - Chest X-Ray",
            type: "Order",
            date: "2025-12-18"
        }
    ];
    const immunizations = [
        {
            name: "Influenza",
            date: "2025-10-01",
            status: "Completed"
        },
        {
            name: "COVID-19 Booster",
            date: "2025-08-15",
            status: "Completed"
        },
        {
            name: "Tetanus (Tdap)",
            date: "2023-03-12",
            status: "Completed"
        }
    ];
    // ─── IPD / Inpatient Mock ─────────────────────
    const ipdAdmissions = [
        {
            id: "IPD-" + (patient?.mrn ?? "XXX").replace("MRN-", ""),
            admissionDate: "2026-02-01",
            dischargeDate: patient?.status === "Admitted" ? null : "2026-02-10",
            ward: patient?.department ?? "General Ward",
            bed: "B-204",
            primaryDiagnosis: patient?.tags?.[0] ?? "General Observation",
            consultant: patient?.primaryDoctor ?? "Dr. Nisha Rao",
            status: patient?.status === "Admitted" ? "Active" : "Discharged",
            notes: "Patient admitted with chief complaint. Vitals stable. Monitoring in progress."
        },
        {
            id: "IPD-" + (patient?.mrn ?? "XXX").replace("MRN-", "") + "-PREV",
            admissionDate: "2025-09-12",
            dischargeDate: "2025-09-19",
            ward: "General Medicine",
            bed: "A-110",
            primaryDiagnosis: "Acute Respiratory Infection",
            consultant: patient?.primaryDoctor ?? "Dr. Nisha Rao",
            status: "Discharged",
            notes: "7-day admission. Responded well to IV antibiotics. Discharged with oral medication."
        }
    ];
    // ─── Billing Mock ────────────────────────────
    const billingInvoices = [
        {
            id: "INV-2026-0042",
            date: "2026-02-10",
            description: "IPD Stay · 9 days (Ward B)",
            amount: 24500,
            paid: 24500,
            status: "Paid"
        },
        {
            id: "INV-2026-0061",
            date: "2026-02-12",
            description: "Lab Panel: CBC, Metabolic, Lipids",
            amount: 3200,
            paid: 3200,
            status: "Paid"
        },
        {
            id: "INV-2026-0088",
            date: "2026-02-28",
            description: "OPD Consultation + Medications",
            amount: 1800,
            paid: 0,
            status: "Pending"
        },
        {
            id: "INV-2026-0094",
            date: "2026-03-05",
            description: "Chest X-Ray + Radiologist Fee",
            amount: 2200,
            paid: 0,
            status: "Pending"
        }
    ];
    const totalBilled = billingInvoices.reduce((s, i)=>s + i.amount, 0);
    const totalPaid = billingInvoices.reduce((s, i)=>s + i.paid, 0);
    const balanceDue = totalBilled - totalPaid;
    // ─── Care Companion (from shared mock, MRN-based) ──
    const careCompanion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mocks$2f$care$2d$companion$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCareCompanionByMrn"])(mrn);
    // ─── Infection Control (from shared mock, MRN-based) ──
    const infectionCases = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mocks$2f$infection$2d$control$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getInfectionCasesByMrn"])(mrn);
    // ─── Radiology Mock ──────────────────────────
    const radiologyOrders = [
        {
            id: "RAD-20260305-01",
            test: "Chest X-Ray (PA View)",
            orderedBy: patient?.primaryDoctor ?? "Dr. Nisha Rao",
            orderedOn: "2026-03-05",
            status: "Pending",
            modality: "X-Ray",
            priority: "Routine",
            reportUrl: null
        },
        {
            id: "RAD-20260210-01",
            test: "CT Thorax (without contrast)",
            orderedBy: patient?.primaryDoctor ?? "Dr. Nisha Rao",
            orderedOn: "2026-02-10",
            status: "Completed",
            modality: "CT Scan",
            priority: "Urgent",
            reportUrl: "#"
        },
        {
            id: "RAD-20260115-01",
            test: "Ultrasound Abdomen",
            orderedBy: "Dr. Sameer Kulkarni",
            orderedOn: "2026-01-15",
            status: "Completed",
            modality: "Ultrasound",
            priority: "Routine",
            reportUrl: "#"
        }
    ];
    const completedVisits = opdAppointments.filter((appointment)=>appointment.status === "Completed").length;
    const showRate = opdAppointments.length ? Math.round(completedVisits / opdAppointments.length * 100) : null;
    const vitalTiles = [
        {
            label: "Blood Pressure",
            value: latestVital?.bp ?? opdEncounter?.vitals.bp ?? "—",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$MonitorHeart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                fontSize: "small"
            }, void 0, false, {
                fileName: "[project]/src/screens/patients/PatientProfile/hooks/usePatientProfileData.tsx",
                lineNumber: 617,
                columnNumber: 13
            }, this)
        },
        {
            label: "Heart Rate",
            value: latestVital?.hr ?? opdEncounter?.vitals.hr ?? "—",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Favorite$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                fontSize: "small"
            }, void 0, false, {
                fileName: "[project]/src/screens/patients/PatientProfile/hooks/usePatientProfileData.tsx",
                lineNumber: 622,
                columnNumber: 13
            }, this)
        },
        {
            label: "Temperature",
            value: latestVital?.temp ?? opdEncounter?.vitals.temp ?? "—",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Thermostat$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                fontSize: "small"
            }, void 0, false, {
                fileName: "[project]/src/screens/patients/PatientProfile/hooks/usePatientProfileData.tsx",
                lineNumber: 627,
                columnNumber: 13
            }, this)
        },
        {
            label: "Blood Glucose",
            value: latestVital?.rr ?? opdEncounter?.vitals.rr ?? "—",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Air$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                fontSize: "small"
            }, void 0, false, {
                fileName: "[project]/src/screens/patients/PatientProfile/hooks/usePatientProfileData.tsx",
                lineNumber: 632,
                columnNumber: 13
            }, this)
        },
        {
            label: "SpO2",
            value: latestVital?.spo2 ?? opdEncounter?.vitals.spo2 ?? "—",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$WaterDrop$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                fontSize: "small"
            }, void 0, false, {
                fileName: "[project]/src/screens/patients/PatientProfile/hooks/usePatientProfileData.tsx",
                lineNumber: 637,
                columnNumber: 13
            }, this)
        },
        {
            label: "Pain Level",
            value: latestVital?.painScore !== undefined ? `${latestVital.painScore}/10` : "—",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Healing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                fontSize: "small"
            }, void 0, false, {
                fileName: "[project]/src/screens/patients/PatientProfile/hooks/usePatientProfileData.tsx",
                lineNumber: 645,
                columnNumber: 13
            }, this)
        },
        {
            label: "Weight",
            value: opdEncounter?.vitals.weightKg ? `${opdEncounter.vitals.weightKg} kg` : "—",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Scale$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                fontSize: "small"
            }, void 0, false, {
                fileName: "[project]/src/screens/patients/PatientProfile/hooks/usePatientProfileData.tsx",
                lineNumber: 652,
                columnNumber: 13
            }, this)
        },
        {
            label: "BMI",
            value: opdEncounter?.vitals.bmi ?? "—",
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$FitnessCenter$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                fontSize: "small"
            }, void 0, false, {
                fileName: "[project]/src/screens/patients/PatientProfile/hooks/usePatientProfileData.tsx",
                lineNumber: 657,
                columnNumber: 13
            }, this)
        }
    ];
    return {
        theme,
        router,
        searchParams,
        mrn,
        dispatch,
        appointments,
        encounters,
        vitalTrends,
        medicationCatalog,
        patient,
        tileShadow,
        lightBorder,
        dividerSx,
        tabHeaderSx,
        cancelTarget,
        setCancelTarget,
        opdAppointments,
        opdEncounter,
        timelineAppointments,
        handleReschedule,
        handleCancelAppointment,
        confirmCancelAppointment,
        latestAppointment,
        vitalHistory,
        latestVital,
        tabs,
        activeTab,
        setActiveTab,
        selectedVitalId,
        setSelectedVitalId,
        vitalsView,
        setVitalsView,
        vitalsPeriod,
        setVitalsPeriod,
        vitalHistPage,
        setVitalHistPage,
        vitalRowsPerPage,
        setVitalRowsPerPage,
        VITAL_STATUS_CFG,
        VITAL_NOTES,
        parseVitalNum,
        vitalChartValues,
        chartValuesToShow,
        vitalChartColor,
        vitalHistorySorted,
        vitalTotalHistPages,
        vitalPagedHistory,
        getVitalValue,
        getVitalUnit,
        readingStatus,
        formatVitalDate,
        payerType,
        insuranceLabel,
        allergiesRaw,
        allergies,
        allergyDisplay,
        problems,
        patientMedications,
        medicationTableRows,
        labResults,
        documents,
        immunizations,
        ipdAdmissions,
        billingInvoices,
        totalBilled,
        totalPaid,
        balanceDue,
        careCompanion,
        infectionCases,
        radiologyOrders,
        completedVisits,
        showRate,
        vitalTiles
    };
}
_s(usePatientProfileData, "aGRYhwmnzJ8RE9/WfUuTmqM0arU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$styles$2f$useTheme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__useTheme$3e$__["useTheme"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$hooks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$opdHooks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useOpdData"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/screens/patients/PatientProfile/tabs/HistoryTab.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HistoryTab",
    ()=>HistoryTab
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Box/Box.js [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Stack/Stack.js [app-client] (ecmascript) <export default as Stack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Typography/Typography.js [app-client] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$History$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/History.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$theme$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/ui/theme/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/system/esm/colorManipulator.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$patients$2f$PatientProfile$2f$utils$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/screens/patients/PatientProfile/utils/utils.tsx [app-client] (ecmascript)");
;
;
;
;
;
function HistoryTab({ data }) {
    const { activeTab, tabHeaderSx, timelineAppointments, theme, lightBorder, encounters, patient } = data;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$patients$2f$PatientProfile$2f$utils$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabPanel"], {
        value: activeTab,
        tab: "history",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                direction: "row",
                spacing: 1,
                alignItems: "center",
                sx: tabHeaderSx,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$History$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        fontSize: "small",
                        color: "primary"
                    }, void 0, false, {
                        fileName: "[project]/src/screens/patients/PatientProfile/tabs/HistoryTab.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                        variant: "subtitle1",
                        sx: {
                            fontWeight: 700
                        },
                        children: "Encounter Timeline"
                    }, void 0, false, {
                        fileName: "[project]/src/screens/patients/PatientProfile/tabs/HistoryTab.tsx",
                        lineNumber: 120,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/screens/patients/PatientProfile/tabs/HistoryTab.tsx",
                lineNumber: 118,
                columnNumber: 7
            }, this),
            timelineAppointments.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    position: "relative",
                    pl: 4,
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        left: 16,
                        top: 6,
                        bottom: 6,
                        width: 2,
                        backgroundColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(theme.palette.text.primary, 0.08)
                    }
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                    spacing: 2,
                    children: timelineAppointments.map((appointment)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                            sx: {
                                position: "relative",
                                pl: 1
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                    sx: {
                                        position: "absolute",
                                        left: -24,
                                        top: 20,
                                        width: 14,
                                        height: 14,
                                        borderRadius: "50%",
                                        backgroundColor: "background.paper",
                                        border: "3px solid",
                                        borderColor: theme.palette.primary.main
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/screens/patients/PatientProfile/tabs/HistoryTab.tsx",
                                    lineNumber: 143,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                    sx: {
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(theme.palette.text.primary, 0.02),
                                        border: lightBorder
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                                            direction: {
                                                xs: "column",
                                                sm: "row"
                                            },
                                            justifyContent: "space-between",
                                            alignItems: {
                                                xs: "flex-start",
                                                sm: "center"
                                            },
                                            spacing: 1,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                    variant: "subtitle2",
                                                    sx: {
                                                        fontWeight: 700
                                                    },
                                                    children: [
                                                        appointment.visitType,
                                                        " · ",
                                                        appointment.department
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/screens/patients/PatientProfile/tabs/HistoryTab.tsx",
                                                    lineNumber: 170,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                    variant: "caption",
                                                    color: "text.secondary",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$patients$2f$PatientProfile$2f$utils$2f$utils$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatLongDate"])(appointment.date)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/screens/patients/PatientProfile/tabs/HistoryTab.tsx",
                                                    lineNumber: 173,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/screens/patients/PatientProfile/tabs/HistoryTab.tsx",
                                            lineNumber: 164,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                            variant: "body2",
                                            color: "text.secondary",
                                            sx: {
                                                mt: 1
                                            },
                                            children: appointment.chiefComplaint || "Clinical encounter logged."
                                        }, void 0, false, {
                                            fileName: "[project]/src/screens/patients/PatientProfile/tabs/HistoryTab.tsx",
                                            lineNumber: 177,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                                            direction: "row",
                                            spacing: 2,
                                            flexWrap: "wrap",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Typography$2f$Typography$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                                    variant: "caption",
                                                    color: "text.secondary",
                                                    children: [
                                                        "Provider: ",
