function useOpdQueueData() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { role } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$auth$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"])();
    const permissionGate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$auth$2f$usePermission$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePermission"])();
    const ipdEncounters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$ipd$2f$ipd$2d$encounter$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIpdEncounters"])();
    const dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$hooks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"])();
    const { appointments, encounters, status: opdStatus, error: opdError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$opdHooks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useOpdData"])();
    const activeIpdMrnSet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useOpdQueueData.useMemo[activeIpdMrnSet]": ()=>new Set(ipdEncounters.filter({
                "useOpdQueueData.useMemo[activeIpdMrnSet]": (record)=>record.workflowStatus !== "discharged"
            }["useOpdQueueData.useMemo[activeIpdMrnSet]"]).map({
                "useOpdQueueData.useMemo[activeIpdMrnSet]": (record)=>normalizeMrn(record.mrn)
            }["useOpdQueueData.useMemo[activeIpdMrnSet]"]))
    }["useOpdQueueData.useMemo[activeIpdMrnSet]"], [
        ipdEncounters
    ]);
    const queue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useOpdQueueData.useMemo[queue]": ()=>buildQueue(encounters, activeIpdMrnSet)
    }["useOpdQueueData.useMemo[queue]"], [
        encounters,
        activeIpdMrnSet
    ]);
    const roleProfile = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useOpdQueueData.useMemo[roleProfile]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$opd$2d$role$2d$flow$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getOpdRoleFlowProfile"])(role)
    }["useOpdQueueData.useMemo[roleProfile]"], [
        role
    ]);
    // Capabilities
    const capabilities = {
        canStartConsult: roleProfile.capabilities.canStartConsult,
        canViewHistory: roleProfile.capabilities.canViewClinicalHistory,
        canCreateRegistration: roleProfile.capabilities.canManageCalendar,
        canTransferToIpd: roleProfile.capabilities.canTransferToIpd && permissionGate("ipd.transfer.write")
    };
    // Filters State
    const [stageFilter, setStageFilter] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("All Stage");
    const [priorityFilter, setPriorityFilter] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("All Priorities");
    const [departmentFilter, setDepartmentFilter] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("All Departments");
    const [filterDrawerOpen, setFilterDrawerOpen] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    // Dialog State
    const [transferDialogOpen, setTransferDialogOpen] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const [selectedTransferItem, setSelectedTransferItem] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const [transferDraft, setTransferDraft] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]({
        priority: "Routine",
        preferredWard: "Medical Ward - 1",
        provisionalDiagnosis: "",
        admissionReason: "",
        requestNote: ""
    });
    // Snackbar State
    const [snackbar, setSnackbar] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]({
        open: false,
        message: "",
        severity: "success"
    });
    // Counters
    const waitingCount = queue.filter((item)=>item.stage === "Waiting").length;
    const inProgressCount = queue.filter((item)=>item.stage === "In Progress").length;
    const completedCount = encounters.filter((item)=>item.status === "COMPLETED").length;
    const emergencyCount = queue.filter((item)=>item.queuePriority === "Urgent").length;
    const averageWaitMinutes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useOpdQueueData.useMemo[averageWaitMinutes]": ()=>{
            const waitingRows = queue.filter({
                "useOpdQueueData.useMemo[averageWaitMinutes].waitingRows": (item)=>item.stage === "Waiting"
            }["useOpdQueueData.useMemo[averageWaitMinutes].waitingRows"]);
            if (waitingRows.length === 0) return 0;
            const total = waitingRows.reduce({
                "useOpdQueueData.useMemo[averageWaitMinutes].total": (sum, item)=>sum + item.waitMinutes
            }["useOpdQueueData.useMemo[averageWaitMinutes].total"], 0);
            return Math.round(total / waitingRows.length);
        }
    }["useOpdQueueData.useMemo[averageWaitMinutes]"], [
        queue
    ]);
    const resetFilters = ()=>{
        setStageFilter("All Stage");
        setPriorityFilter("All Priorities");
        setDepartmentFilter("All Departments");
    };
    const filteredQueue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useOpdQueueData.useMemo[filteredQueue]": ()=>{
            return queue.filter({
                "useOpdQueueData.useMemo[filteredQueue]": (item)=>{
                    if (stageFilter !== "All Stage" && item.stage !== stageFilter) return false;
                    if (priorityFilter !== "All Priorities" && item.queuePriority !== priorityFilter) return false;
                    if (departmentFilter !== "All Departments" && item.department !== departmentFilter) return false;
                    return true;
                }
            }["useOpdQueueData.useMemo[filteredQueue]"]);
        }
    }["useOpdQueueData.useMemo[filteredQueue]"], [
        queue,
        stageFilter,
        priorityFilter,
        departmentFilter
    ]);
    const withMrn = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useOpdQueueData.useCallback[withMrn]": (route, mrn)=>{
            if (!mrn) return route;
            const joiner = route.includes("?") ? "&" : "?";
            return `${route}${joiner}mrn=${encodeURIComponent(mrn)}`;
        }
    }["useOpdQueueData.useCallback[withMrn]"], []);
    const handleStartConsult = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useOpdQueueData.useCallback[handleStartConsult]": (item)=>{
            if (!capabilities.canStartConsult) {
                setSnackbar({
                    open: true,
                    message: `${roleProfile.label} cannot start consultation. Please assign to a doctor.`,
                    severity: "warning"
                });
                return;
            }
            dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$opdSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateEncounter"])({
                id: item.id,
                changes: {
                    status: "IN_PROGRESS"
                }
            }));
            router.push(withMrn((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$opd$2d$encounter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildEncounterRoute"])(item.id), item.mrn));
        }
    }["useOpdQueueData.useCallback[handleStartConsult]"], [
        capabilities.canStartConsult,
        dispatch,
        roleProfile.label,
        router,
        withMrn
    ]);
    const handleViewHistory = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useOpdQueueData.useCallback[handleViewHistory]": (item)=>{
            if (!capabilities.canViewHistory) {
                setSnackbar({
                    open: true,
                    message: `${roleProfile.label} cannot open clinical history.`,
                    severity: "warning"
                });
                return;
            }
            router.push(withMrn("/appointments/visit?tab=notes", item.mrn));
        }
    }["useOpdQueueData.useCallback[handleViewHistory]"], [
        capabilities.canViewHistory,
        roleProfile.label,
        router,
        withMrn
    ]);
    const handleOpenTransferDialog = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useOpdQueueData.useCallback[handleOpenTransferDialog]": (item)=>{
            if (!capabilities.canTransferToIpd) {
                setSnackbar({
                    open: true,
                    message: `${roleProfile.label} does not have permission to move patient to IPD.`,
                    severity: "warning"
                });
                return;
            }
            const appointment = appointments.find({
                "useOpdQueueData.useCallback[handleOpenTransferDialog].appointment": (row)=>row.id === item.appointmentId
            }["useOpdQueueData.useCallback[handleOpenTransferDialog].appointment"]);
            const defaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$ipd$2f$ipd$2d$transfer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildDefaultTransferPayload"])(item, {
                payerType: appointment?.payerType,
                phone: appointment?.phone,
                requestedBy: roleProfile.label,
                requestedByRole: role
            });
            setSelectedTransferItem(item);
            setTransferDraft({
                priority: defaults.priority,
                preferredWard: defaults.preferredWard,
                provisionalDiagnosis: defaults.provisionalDiagnosis ?? "",
                admissionReason: defaults.admissionReason,
                requestNote: ""
            });
            setTransferDialogOpen(true);
        }
    }["useOpdQueueData.useCallback[handleOpenTransferDialog]"], [
        appointments,
        capabilities.canTransferToIpd,
        role,
        roleProfile.label
    ]);
    const handleSubmitTransfer = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useOpdQueueData.useCallback[handleSubmitTransfer]": ()=>{
            if (!selectedTransferItem) return;
            if (!capabilities.canTransferToIpd) {
                setSnackbar({
                    open: true,
                    message: `${roleProfile.label} does not have permission to move patient to IPD.`,
                    severity: "warning"
                });
                return;
            }
            if (!transferDraft.preferredWard.trim()) {
                setSnackbar({
                    open: true,
                    message: "Preferred ward is required for IPD transfer.",
                    severity: "error"
                });
                return;
            }
            if (!transferDraft.admissionReason.trim()) {
                setSnackbar({
                    open: true,
                    message: "Admission reason is required for IPD transfer.",
                    severity: "error"
                });
                return;
            }
            const appointment = appointments.find({
                "useOpdQueueData.useCallback[handleSubmitTransfer].appointment": (row)=>row.id === selectedTransferItem.appointmentId
            }["useOpdQueueData.useCallback[handleSubmitTransfer].appointment"]);
            const defaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$ipd$2f$ipd$2d$transfer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildDefaultTransferPayload"])(selectedTransferItem, {
                payerType: appointment?.payerType,
                phone: appointment?.phone,
                requestedBy: roleProfile.label,
                requestedByRole: role
            });
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$ipd$2f$ipd$2d$transfer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["upsertOpdToIpdTransferLead"])({
                ...defaults,
                priority: transferDraft.priority,
                preferredWard: transferDraft.preferredWard.trim(),
                provisionalDiagnosis: transferDraft.provisionalDiagnosis.trim() || defaults.provisionalDiagnosis,
                admissionReason: transferDraft.admissionReason.trim(),
                requestNote: transferDraft.requestNote.trim()
            });
            dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$slices$2f$opdSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateEncounter"])({
                id: selectedTransferItem.id,
                changes: {
                    status: "COMPLETED"
                }
            }));
            setTransferDialogOpen(false);
            setSelectedTransferItem(null);
            setSnackbar({
                open: true,
                message: result.status === "created" ? `IPD transfer created for ${result.lead.patientName}.` : `IPD transfer updated for ${result.lead.patientName}.`,
                severity: "success"
            });
            router.push(`/ipd/admissions?mrn=${encodeURIComponent(result.lead.mrn)}`);
        }
    }["useOpdQueueData.useCallback[handleSubmitTransfer]"], [
        appointments,
        capabilities.canTransferToIpd,
        dispatch,
        role,
        roleProfile.label,
        router,
        selectedTransferItem,
        transferDraft
    ]);
    const handleNewRegistration = ()=>{
        router.push("/patients/registration");
    };
    return {
        queue,
        filteredQueue,
        appointments,
        encounters,
        opdStatus: opdStatus,
        opdError: opdError ?? null,
        role,
        roleProfile,
        capabilities,
        stageFilter,
        priorityFilter,
        departmentFilter,
        filterDrawerOpen,
        transferDialogOpen,
        selectedTransferItem,
        transferDraft,
        snackbar,
        waitingCount,
        inProgressCount,
        completedCount,
        emergencyCount,
        averageWaitMinutes,
        setStageFilter,
        setPriorityFilter,
        setDepartmentFilter,
        setFilterDrawerOpen,
        resetFilters,
        setSnackbar,
        handleStartConsult,
        handleViewHistory,
        handleOpenTransferDialog,
        handleSubmitTransfer,
        setTransferDialogOpen,
        setTransferDraft,
        handleNewRegistration
    };
}
_s(useOpdQueueData, "UtVHjzy1BK6Ad6arBzbpo5HU08Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$auth$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$auth$2f$usePermission$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePermission"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$ipd$2f$ipd$2d$encounter$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIpdEncounters"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$hooks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$opdHooks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useOpdData"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/ui/components/layout/AlignedGrid.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Unstable_Grid2$2f$Grid2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Unstable_Grid2/Grid2.js [app-client] (ecmascript)");
'use client';
;
;
;
const AlignedGrid = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = function AlignedGrid({ item: _item, ...props }, ref) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Unstable_Grid2$2f$Grid2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/src/ui/components/layout/AlignedGrid.tsx",
        lineNumber: 14,
        columnNumber: 10
    }, this);
});
_c1 = AlignedGrid;
const __TURBOPACK__default__export__ = AlignedGrid;
var _c, _c1;
__turbopack_context__.k.register(_c, "AlignedGrid$React.forwardRef");
__turbopack_context__.k.register(_c1, "AlignedGrid");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/screens/ipd/components/ipd-ui.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IPD_COLORS",
    ()=>IPD_COLORS,
    "IPD_FONT_SANS",
    ()=>IPD_FONT_SANS,
    "IPD_FONT_SERIF",
    ()=>IPD_FONT_SERIF,
    "IpdInfoBox",
    ()=>IpdInfoBox,
    "IpdMetricCard",
    ()=>IpdMetricCard,
    "IpdSectionCard",
    ()=>IpdSectionCard,
    "ipdFormStylesSx",
    ()=>ipdFormStylesSx,
    "ipdSurfaceCardSx",
    ()=>ipdSurfaceCardSx
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$theme$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/ui/theme/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/system/esm/colorManipulator.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$theme$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/core/theme/tokens.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Box/Box.js [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Stack/Stack.js [app-client] (ecmascript) <export default as Stack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/Text.tsx [app-client] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$molecules$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/ui/components/molecules/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$molecules$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ui/components/molecules/Card.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
const IPD_COLORS = {
    primary: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$theme$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["palette"].primary.main,
    primaryLight: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$theme$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["palette"].primary.dark,
    accent: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$theme$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["palette"].info.main,
    accentWarm: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$theme$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["palette"].success.main,
    textMain: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$theme$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["palette"].text.primary,
    textMuted: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$theme$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["palette"].text.secondary,
    border: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$theme$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["palette"].grey.A100,
    success: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$theme$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["palette"].success.main,
    warning: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$theme$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["palette"].warning.main,
    danger: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$theme$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["palette"].error.main
};
const IPD_FONT_SERIF = "inherit";
const IPD_FONT_SANS = "inherit";
const ipdSurfaceCardSx = {
    borderRadius: 3,
    border: "1px solid",
    borderColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(IPD_COLORS.primary, 0.14),
    boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
    backgroundColor: "#FFFFFF"
};
const ipdFormStylesSx = {
    "& .MuiInputLabel-root": {
        fontSize: 13,
        fontWeight: 600,
        color: IPD_COLORS.textMain
    },
    "& .MuiInputBase-input": {
        fontSize: 14,
        fontFamily: IPD_FONT_SANS
    },
    "& .MuiOutlinedInput-root": {
        borderRadius: 1.5,
        backgroundColor: "#FFFFFF",
        "& fieldset": {
            borderColor: IPD_COLORS.border
        },
        "&:hover fieldset": {
            borderColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(IPD_COLORS.primary, 0.55)
        },
        "&.Mui-focused fieldset": {
            borderColor: IPD_COLORS.accent,
            boxShadow: `0 0 0 3px ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(IPD_COLORS.accent, 0.14)}`
        }
    },
    "& .MuiFormHelperText-root": {
        fontSize: 11
    }
};
const metricToneMap = {
    primary: {
        accent: IPD_COLORS.primary
    },
    success: {
        accent: IPD_COLORS.success
    },
    warning: {
        accent: IPD_COLORS.warning
    },
    danger: {
        accent: IPD_COLORS.danger
    },
    info: {
        accent: IPD_COLORS.accent
    }
};
function IpdMetricCard({ label, value, trend, tone = "primary", icon }) {
    const toneConfig = metricToneMap[tone];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$molecules$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        elevation: 0,
        sx: {
            ...ipdSurfaceCardSx,
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$theme$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["palette"].primary.main, 0.1),
            boxShadow: "none",
            backgroundColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$theme$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["palette"].primary.main, 0.06)
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
            direction: "row",
            justifyContent: "space-between",
            spacing: 1.5,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                            variant: "body2",
                            sx: {
                                display: "block",
                                fontWeight: 500,
                                color: "text.secondary",
                                fontFamily: IPD_FONT_SANS
                            },
                            children: label
                        }, void 0, false, {
                            fileName: "[project]/src/screens/ipd/components/ipd-ui.tsx",
                            lineNumber: 114,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                            variant: "h3",
                            sx: {
                                mt: 0.15,
                                fontWeight: 700,
                                lineHeight: 1.2,
                                color: "text.primary",
                                fontFamily: IPD_FONT_SERIF
                            },
                            children: value
                        }, void 0, false, {
                            fileName: "[project]/src/screens/ipd/components/ipd-ui.tsx",
                            lineNumber: 125,
                            columnNumber: 11
                        }, this),
                        trend ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                            variant: "body2",
                            sx: {
                                display: "block",
                                mt: 0.1,
                                color: "text.secondary",
                                fontFamily: IPD_FONT_SANS
                            },
                            children: trend
                        }, void 0, false, {
                            fileName: "[project]/src/screens/ipd/components/ipd-ui.tsx",
                            lineNumber: 138,
                            columnNumber: 13
                        }, this) : null
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/screens/ipd/components/ipd-ui.tsx",
                    lineNumber: 113,
                    columnNumber: 9
                }, this),
                icon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                    sx: {
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        color: toneConfig.accent,
                        backgroundColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$theme$2f$tokens$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["palette"].primary.main, 0.12)
                    },
                    children: icon
                }, void 0, false, {
                    fileName: "[project]/src/screens/ipd/components/ipd-ui.tsx",
                    lineNumber: 153,
                    columnNumber: 11
                }, this) : null
            ]
        }, void 0, true, {
            fileName: "[project]/src/screens/ipd/components/ipd-ui.tsx",
            lineNumber: 112,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/screens/ipd/components/ipd-ui.tsx",
        lineNumber: 100,
        columnNumber: 5
    }, this);
}
_c = IpdMetricCard;
function IpdSectionCard({ title, subtitle, action, children, sx, bodySx }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$molecules$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        elevation: 0,
        sx: {
            ...ipdSurfaceCardSx,
            overflow: "hidden",
            ...sx
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                direction: {
                    xs: "column",
                    md: "row"
                },
                spacing: 1.25,
                justifyContent: "space-between",
                alignItems: {
                    xs: "flex-start",
                    md: "center"
                },
                sx: {
                    px: {
                        xs: 2,
                        sm: 2.5
                    },
                    py: {
                        xs: 1.75,
                        sm: 2
                    },
                    borderBottom: "1px solid",
                    borderColor: IPD_COLORS.border,
                    background: `linear-gradient(135deg, ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(IPD_COLORS.primary, 0.04)} 0%, ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(IPD_COLORS.accent, 0.04)} 100%)`
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "h6",
                                sx: {
                                    fontWeight: 700,
                                    color: IPD_COLORS.primary,
                                    lineHeight: 1.2,
                                    fontFamily: IPD_FONT_SERIF
                                },
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/src/screens/ipd/components/ipd-ui.tsx",
                                lineNumber: 212,
                                columnNumber: 11
                            }, this),
                            subtitle ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "body2",
                                sx: {
                                    mt: 0.3,
                                    color: IPD_COLORS.textMuted,
                                    fontFamily: IPD_FONT_SANS
                                },
                                children: subtitle
                            }, void 0, false, {
                                fileName: "[project]/src/screens/ipd/components/ipd-ui.tsx",
                                lineNumber: 224,
                                columnNumber: 13
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/screens/ipd/components/ipd-ui.tsx",
                        lineNumber: 211,
                        columnNumber: 9
                    }, this),
                    action ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        children: action
                    }, void 0, false, {
                        fileName: "[project]/src/screens/ipd/components/ipd-ui.tsx",
                        lineNumber: 236,
                        columnNumber: 19
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/src/screens/ipd/components/ipd-ui.tsx",
                lineNumber: 198,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    px: {
                        xs: 2,
                        sm: 2.5
                    },
                    py: {
                        xs: 2,
                        sm: 2.5
                    },
                    ...bodySx
                },
                children: children
            }, void 0, false, {
                fileName: "[project]/src/screens/ipd/components/ipd-ui.tsx",
                lineNumber: 239,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/screens/ipd/components/ipd-ui.tsx",
        lineNumber: 190,
        columnNumber: 5
    }, this);
}
_c1 = IpdSectionCard;
function IpdInfoBox({ title, description }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
        sx: {
            borderRadius: 1.75,
            border: "1px solid",
            borderColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(IPD_COLORS.accent, 0.35),
            borderLeftWidth: 4,
            px: 2,
            py: 1.5,
            backgroundColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(IPD_COLORS.accent, 0.05)
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                variant: "body2",
                sx: {
                    fontWeight: 700,
                    color: IPD_COLORS.primary,
                    fontFamily: IPD_FONT_SANS
                },
                children: title
            }, void 0, false, {
                fileName: "[project]/src/screens/ipd/components/ipd-ui.tsx",
                lineNumber: 264,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                variant: "caption",
                sx: {
                    display: "block",
                    mt: 0.4,
                    color: IPD_COLORS.textMuted,
                    fontFamily: IPD_FONT_SANS
                },
                children: description
            }, void 0, false, {
                fileName: "[project]/src/screens/ipd/components/ipd-ui.tsx",
                lineNumber: 274,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/screens/ipd/components/ipd-ui.tsx",
        lineNumber: 253,
        columnNumber: 5
    }, this);
}
_c2 = IpdInfoBox;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "IpdMetricCard");
__turbopack_context__.k.register(_c1, "IpdSectionCard");
__turbopack_context__.k.register(_c2, "IpdInfoBox");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/screens/opd/OpdQueue/components/OpdQueueMetrics.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OpdQueueMetrics",
    ()=>OpdQueueMetrics
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$layout$2f$AlignedGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ui/components/layout/AlignedGrid.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$AssignmentInd$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/AssignmentInd.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Bolt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/Bolt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$History$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/History.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$LocalHospital$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/LocalHospital.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$ipd$2f$components$2f$ipd$2d$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/screens/ipd/components/ipd-ui.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function OpdQueueMetrics({ data }) {
    const { appointments, waitingCount, emergencyCount, inProgressCount, queue, completedCount, averageWaitMinutes } = data;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$layout$2f$AlignedGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        container: true,
        spacing: 2,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$layout$2f$AlignedGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                item: true,
                xs: 12,
                sm: 6,
                lg: 3,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$ipd$2f$components$2f$ipd$2d$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IpdMetricCard"], {
                    label: "Patients Today",
                    value: appointments.length,
                    trend: `${averageWaitMinutes} min avg wait`,
                    tone: "info",
                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$AssignmentInd$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        sx: {
                            fontSize: 28
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueMetrics.tsx",
                        lineNumber: 37,
                        columnNumber: 17
                    }, void 0)
                }, void 0, false, {
                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueMetrics.tsx",
                    lineNumber: 32,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueMetrics.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$layout$2f$AlignedGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                item: true,
                xs: 12,
                sm: 6,
                lg: 3,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$ipd$2f$components$2f$ipd$2d$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IpdMetricCard"], {
                    label: "In Queue",
                    value: waitingCount,
                    trend: `${emergencyCount} emergency cases`,
                    tone: "warning",
                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Bolt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        sx: {
                            fontSize: 28
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueMetrics.tsx",
                        lineNumber: 46,
                        columnNumber: 17
                    }, void 0)
                }, void 0, false, {
                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueMetrics.tsx",
                    lineNumber: 41,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueMetrics.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$layout$2f$AlignedGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                item: true,
                xs: 12,
                sm: 6,
                lg: 3,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$ipd$2f$components$2f$ipd$2d$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IpdMetricCard"], {
                    label: "In Consultation",
                    value: inProgressCount,
                    trend: `${queue.length} active encounter(s)`,
                    tone: "primary",
                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$LocalHospital$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        sx: {
                            fontSize: 28
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueMetrics.tsx",
                        lineNumber: 55,
                        columnNumber: 17
                    }, void 0)
                }, void 0, false, {
                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueMetrics.tsx",
                    lineNumber: 50,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueMetrics.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$layout$2f$AlignedGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                item: true,
                xs: 12,
                sm: 6,
                lg: 3,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$ipd$2f$components$2f$ipd$2d$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IpdMetricCard"], {
                    label: "Completed",
                    value: completedCount,
                    trend: "Visits closed today",
                    tone: "success",
                    icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$History$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        sx: {
                            fontSize: 28
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueMetrics.tsx",
                        lineNumber: 64,
                        columnNumber: 17
                    }, void 0)
                }, void 0, false, {
                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueMetrics.tsx",
                    lineNumber: 59,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueMetrics.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueMetrics.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
_c = OpdQueueMetrics;
var _c;
__turbopack_context__.k.register(_c, "OpdQueueMetrics");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/ui/components/atoms/Skeleton.tsx [app-client] (ecmascript) <export default as Skeleton>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Skeleton",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/Skeleton.tsx [app-client] (ecmascript)");
}),
"[project]/src/components/table/CommonDataGrid.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CommonDataGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Box/Box.js [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$InputAdornment$2f$InputAdornment$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__InputAdornment$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/InputAdornment/InputAdornment.js [app-client] (ecmascript) <export default as InputAdornment>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/MenuItem/MenuItem.js [app-client] (ecmascript) <export default as MenuItem>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Skeleton$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/Skeleton.tsx [app-client] (ecmascript) <export default as Skeleton>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Stack/Stack.js [app-client] (ecmascript) <export default as Stack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Table$2f$Table$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Table$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Table/Table.js [app-client] (ecmascript) <export default as Table>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableBody$2f$TableBody$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableBody$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/TableBody/TableBody.js [app-client] (ecmascript) <export default as TableBody>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/TableCell/TableCell.js [app-client] (ecmascript) <export default as TableCell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableContainer$2f$TableContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableContainer$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/TableContainer/TableContainer.js [app-client] (ecmascript) <export default as TableContainer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableHead$2f$TableHead$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableHead$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/TableHead/TableHead.js [app-client] (ecmascript) <export default as TableHead>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TablePagination$2f$TablePagination$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TablePagination$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/TablePagination/TablePagination.js [app-client] (ecmascript) <export default as TablePagination>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableRow$2f$TableRow$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableRow$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/TableRow/TableRow.js [app-client] (ecmascript) <export default as TableRow>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/Input.tsx [app-client] (ecmascript) <export default as TextField>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/Text.tsx [app-client] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Paper$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Paper$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/Paper.tsx [app-client] (ecmascript) <export default as Paper>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/Search.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function CommonDataGrid({ columns, rows, getRowId, loading = false, searchPlaceholder = "Search...", searchFields, filterDropdowns, onRowClick, rowsPerPageOptions = [
    5,
    10,
    25
], defaultRowsPerPage = 10, emptyTitle = "No records found", emptyDescription = "Try adjusting your filters.", toolbarLeft, toolbarRight, showSerialNo = false, hideToolbar = false, externalSearchValue, onSearchChange, hideSearch = false, disableRowPointer = false }) {
    _s();
    const [internalSearch, setInternalSearch] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("");
    const search = externalSearchValue ?? internalSearch;
    const setSearch = onSearchChange ?? setInternalSearch;
    const [page, setPage] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](0);
    const [rowsPerPage, setRowsPerPage] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](defaultRowsPerPage);
    /* ── client-side search ── */ const filtered = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "CommonDataGrid.useMemo[filtered]": ()=>{
            const q = search.trim().toLowerCase();
            if (!q) return rows;
            return rows.filter({
                "CommonDataGrid.useMemo[filtered]": (row)=>{
                    const fields = searchFields ?? Object.keys(row);
                    return fields.some({
                        "CommonDataGrid.useMemo[filtered]": (field)=>{
                            const val = row[field];
                            if (val == null) return false;
                            return String(val).toLowerCase().includes(q);
                        }
                    }["CommonDataGrid.useMemo[filtered]"]);
                }
            }["CommonDataGrid.useMemo[filtered]"]);
        }
    }["CommonDataGrid.useMemo[filtered]"], [
        rows,
        search,
        searchFields
    ]);
    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "CommonDataGrid.useEffect": ()=>{
            setPage(0);
        }
    }["CommonDataGrid.useEffect"], [
        search,
        rows
    ]);
    const getCellValue = (row, col)=>{
        if (col.renderCell) return col.renderCell(row);
        if (col.valueGetter) {
            const v = col.valueGetter(row);
            return v != null ? String(v) : "—";
        }
        const v = row[col.field];
        return v != null ? String(v) : "—";
    };
    const rowKey = (row, index)=>getRowId ? getRowId(row) : index;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Paper$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Paper$3e$__["Paper"], {
        elevation: 0,
        sx: {
            borderRadius: 2,
            border: "1px solid",
            borderColor: "rgba(17, 114, 186, 0.14)",
            overflow: "hidden",
            boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
            width: "100%"
        },
        children: [
            !hideToolbar && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                direction: "row",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
                sx: {
                    px: 2,
                    py: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider"
                },
                children: [
                    toolbarLeft,
                    !hideSearch && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                        size: "small",
                        placeholder: searchPlaceholder,
                        value: search,
                        onChange: (e)=>setSearch(e.target.value),
                        InputProps: {
                            startAdornment: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$InputAdornment$2f$InputAdornment$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__InputAdornment$3e$__["InputAdornment"], {
                                position: "start",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    sx: {
                                        fontSize: 18,
                                        color: "text.disabled"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                    lineNumber: 200,
                                    columnNumber: 21
                                }, void 0)
                            }, void 0, false, {
                                fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                lineNumber: 199,
                                columnNumber: 19
                            }, void 0)
                        },
                        sx: {
                            flex: {
                                xs: 1,
                                md: 2
                            },
                            maxWidth: {
                                md: 600
                            },
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                fontSize: "0.875rem",
                                bgcolor: "background.paper"
                            }
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                        lineNumber: 192,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        sx: {
                            flex: 1
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                        lineNumber: 216,
                        columnNumber: 11
                    }, this),
                    filterDropdowns?.map((fd)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                            select: true,
                            size: "small",
                            label: fd.placeholder,
                            value: fd.value,
                            onChange: (e)=>fd.onChange(e.target.value),
                            sx: {
                                minWidth: 130,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    fontSize: "0.875rem"
                                }
                            },
                            children: fd.options.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                    value: opt,
                                    sx: {
                                        fontSize: "0.875rem"
                                    },
                                    children: opt
                                }, opt, false, {
                                    fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                    lineNumber: 236,
                                    columnNumber: 17
                                }, this))
                        }, fd.id, false, {
                            fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                            lineNumber: 220,
                            columnNumber: 13
                        }, this)),
                    toolbarRight
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                lineNumber: 176,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableContainer$2f$TableContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableContainer$3e$__["TableContainer"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Table$2f$Table$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Table$3e$__["Table"], {
                    sx: {
                        minWidth: 700
                    },
                    size: "small",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableHead$2f$TableHead$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableHead$3e$__["TableHead"], {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableRow$2f$TableRow$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableRow$3e$__["TableRow"], {
                                sx: {
                                    "& .MuiTableCell-head": {
                                        backgroundColor: "#f9fafb",
                                        borderBottom: "1px solid",
                                        borderColor: "rgba(17, 114, 186, 0.07)",
                                        py: 1.25,
                                        px: 2,
                                        fontSize: "0.68rem",
                                        fontWeight: 700,
                                        color: "text.secondary",
                                        letterSpacing: "0.07em",
                                        textTransform: "uppercase",
                                        lineHeight: 1.4,
                                        whiteSpace: "nowrap"
                                    }
                                },
                                children: [
                                    showSerialNo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                        width: 60,
                                        children: "Sr. No."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                        lineNumber: 270,
                                        columnNumber: 32
                                    }, this),
                                    columns.map((col)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                            align: col.align ?? "left",
                                            sx: col.flex ? {
                                                width: "auto"
                                            } : col.width ? {
                                                width: col.width,
                                                minWidth: col.width
                                            } : {},
                                            children: col.renderHeader ? col.renderHeader() : col.headerName
                                        }, col.field, false, {
                                            fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                            lineNumber: 272,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                lineNumber: 252,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                            lineNumber: 251,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableBody$2f$TableBody$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableBody$3e$__["TableBody"], {
                            children: loading ? Array.from({
                                length: rowsPerPage
                            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableRow$2f$TableRow$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableRow$3e$__["TableRow"], {
                                    children: [
                                        showSerialNo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                            sx: {
                                                py: 1.6,
                                                px: 2
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Skeleton$3e$__["Skeleton"], {
                                                variant: "text",
                                                width: 20
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                                lineNumber: 296,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                            lineNumber: 295,
                                            columnNumber: 21
                                        }, this),
                                        columns.map((col)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                                sx: {
                                                    py: 1.6,
                                                    px: 2
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Skeleton$3e$__["Skeleton"], {
                                                    variant: "rounded",
                                                    height: 28
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                                    lineNumber: 301,
                                                    columnNumber: 23
                                                }, this)
                                            }, col.field, false, {
                                                fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                                lineNumber: 300,
                                                columnNumber: 21
                                            }, this))
                                    ]
                                }, i, true, {
                                    fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                    lineNumber: 293,
                                    columnNumber: 17
                                }, this)) : paginated.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableRow$2f$TableRow$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableRow$3e$__["TableRow"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                    colSpan: columns.length + (showSerialNo ? 1 : 0),
                                    align: "center",
                                    sx: {
                                        py: 6,
                                        border: 0
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                            variant: "body2",
                                            sx: {
                                                fontWeight: 600,
                                                color: "text.primary",
                                                mb: 0.5
                                            },
                                            children: emptyTitle
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                            lineNumber: 313,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                            variant: "caption",
                                            color: "text.secondary",
                                            children: emptyDescription
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                            lineNumber: 319,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                    lineNumber: 308,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                lineNumber: 307,
                                columnNumber: 15
                            }, this) : paginated.map((row, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableRow$2f$TableRow$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableRow$3e$__["TableRow"], {
                                    hover: true,
                                    onClick: ()=>onRowClick?.(row),
                                    sx: {
                                        cursor: onRowClick && !disableRowPointer ? "pointer" : "default",
                                        "& .MuiTableCell-body": {
                                            py: 1.5,
                                            px: 2,
                                            borderBottom: "1px solid",
                                            borderColor: "rgba(17, 114, 186, 0.07)",
                                            verticalAlign: "middle"
                                        },
                                        "&:last-child .MuiTableCell-body": {
                                            borderBottom: 0
                                        },
                                        "&:hover": {
                                            backgroundColor: "#f8fafc"
                                        }
                                    },
                                    children: [
                                        showSerialNo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                            sx: {
                                                fontWeight: 500,
                                                color: "text.secondary",
                                                width: 60
                                            },
                                            children: page * rowsPerPage + index + 1
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                            lineNumber: 345,
                                            columnNumber: 21
                                        }, this),
                                        columns.map((col)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TableCell$2f$TableCell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TableCell$3e$__["TableCell"], {
                                                align: col.align ?? "left",
                                                sx: col.flex ? {
                                                    width: "auto"
                                                } : col.width ? {
                                                    width: col.width,
                                                    minWidth: col.width
                                                } : {},
                                                children: getCellValue(row, col)
                                            }, col.field, false, {
                                                fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                                lineNumber: 356,
                                                columnNumber: 21
                                            }, this))
                                    ]
                                }, rowKey(row, index), true, {
                                    fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                                    lineNumber: 326,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                            lineNumber: 290,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                    lineNumber: 249,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                lineNumber: 248,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$TablePagination$2f$TablePagination$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TablePagination$3e$__["TablePagination"], {
                component: "div",
                count: filtered.length,
                page: page,
                onPageChange: (_, newPage)=>setPage(newPage),
                rowsPerPage: rowsPerPage,
                onRowsPerPageChange: (e)=>{
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                },
                rowsPerPageOptions: rowsPerPageOptions,
                sx: {
                    borderTop: "1px solid",
                    borderColor: "divider",
                    "& .MuiTablePagination-toolbar": {
                        fontSize: "0.8rem"
                    },
                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                        fontSize: "0.8rem"
                    }
                }
            }, void 0, false, {
                fileName: "[project]/src/components/table/CommonDataGrid.tsx",
                lineNumber: 378,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/table/CommonDataGrid.tsx",
        lineNumber: 163,
        columnNumber: 5
    }, this);
}
_s(CommonDataGrid, "DsoWTnrx5ThHJ6/hU970tcxCx6U=");
_c = CommonDataGrid;
var _c;
__turbopack_context__.k.register(_c, "CommonDataGrid");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OpdQueueTable",
    ()=>OpdQueueTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Button/Button.js [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Chip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Chip$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/Chip.tsx [app-client] (ecmascript) <export default as Chip>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Stack/Stack.js [app-client] (ecmascript) <export default as Stack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/Text.tsx [app-client] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Add$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/Add.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$FilterList$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/FilterList.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$History$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/History.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$PlayArrow$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/PlayArrow.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$SwapHoriz$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/SwapHoriz.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$WarningAmber$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/WarningAmber.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$table$2f$CommonDataGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/table/CommonDataGrid.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$opd$2d$encounter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/screens/opd/opd-encounter.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
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
const queueStatusColor = {
    BOOKED: "default",
    ARRIVED: "warning",
    IN_QUEUE: "warning",
    IN_PROGRESS: "info",
    COMPLETED: "success",
    CANCELLED: "error"
};
function OpdQueueTable({ data }) {
    _s();
    const { filteredQueue, capabilities, role, handleStartConsult, handleViewHistory, handleOpenTransferDialog, handleNewRegistration, setFilterDrawerOpen, resetFilters } = data;
    const queueColumns = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "OpdQueueTable.useMemo[queueColumns]": ()=>[
                {
                    field: "patientName",
                    headerName: "Patient",
                    width: "25%",
                    renderCell: {
                        "OpdQueueTable.useMemo[queueColumns]": (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                                spacing: 0.2,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                        variant: "body2",
                                        sx: {
                                            fontWeight: 700
                                        },
                                        children: row.patientName
                                    }, void 0, false, {
                                        fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                                        lineNumber: 57,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                        variant: "caption",
                                        color: "text.secondary",
                                        children: [
                                            row.mrn,
                                            " · ",
                                            row.ageGender
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                                        lineNumber: 60,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                                lineNumber: 56,
                                columnNumber: 11
                            }, this)
                    }["OpdQueueTable.useMemo[queueColumns]"]
                },
                {
                    field: "chiefComplaint",
                    headerName: "Chief Complaint",
                    width: "25%",
                    renderCell: {
                        "OpdQueueTable.useMemo[queueColumns]": (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "body2",
                                color: "text.secondary",
                                children: row.chiefComplaint || "--"
                            }, void 0, false, {
                                fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                                lineNumber: 71,
                                columnNumber: 11
                            }, this)
                    }["OpdQueueTable.useMemo[queueColumns]"]
                },
                {
                    field: "doctor",
                    headerName: "Consultant",
                    width: 170,
                    renderCell: {
                        "OpdQueueTable.useMemo[queueColumns]": (row)=>row.doctor || "--"
                    }["OpdQueueTable.useMemo[queueColumns]"]
                },
                {
                    field: "status",
                    headerName: "Status",
                    width: 230,
                    renderCell: {
                        "OpdQueueTable.useMemo[queueColumns]": (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                                direction: "row",
                                spacing: 0.6,
                                flexWrap: "wrap",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Chip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Chip$3e$__["Chip"], {
                                        label: row.stage,
                                        color: row.stage === "In Progress" ? "info" : "warning",
                                        size: "small"
                                    }, void 0, false, {
                                        fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                                        lineNumber: 88,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Chip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Chip$3e$__["Chip"], {
                                        label: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$opd$2d$encounter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENCOUNTER_STATUS_LABEL"][row.status],
                                        color: queueStatusColor[row.status],
                                        variant: "outlined",
                                        size: "small"
                                    }, void 0, false, {
                                        fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                                        lineNumber: 93,
                                        columnNumber: 13
                                    }, this),
                                    row.queuePriority === "Urgent" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Chip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Chip$3e$__["Chip"], {
                                        size: "small",
                                        color: "error",
                                        label: "Emergency",
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$WarningAmber$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            fontSize: "small"
                                        }, void 0, false, {
                                            fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                                            lineNumber: 104,
                                            columnNumber: 23
                                        }, void 0)
                                    }, void 0, false, {
                                        fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                                        lineNumber: 100,
                                        columnNumber: 15
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this)
                    }["OpdQueueTable.useMemo[queueColumns]"]
                },
                {
                    field: "waitMinutes",
                    headerName: "Wait",
                    width: 100,
                    renderCell: {
                        "OpdQueueTable.useMemo[queueColumns]": (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                variant: "body2",
                                color: "text.secondary",
                                children: row.stage === "Waiting" ? `${row.waitMinutes} min` : "--"
                            }, void 0, false, {
                                fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                                lineNumber: 115,
                                columnNumber: 11
                            }, this)
                    }["OpdQueueTable.useMemo[queueColumns]"]
                },
                {
                    field: "actions",
                    headerName: "Action",
                    align: "right",
                    width: 380,
                    renderCell: {
                        "OpdQueueTable.useMemo[queueColumns]": (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                                direction: "row",
                                spacing: 0.7,
                                justifyContent: "flex-end",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "small",
                                        variant: "outlined",
                                        startIcon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$PlayArrow$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                            fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                                            lineNumber: 130,
                                            columnNumber: 26
                                        }, void 0),
                                        disabled: !capabilities.canStartConsult,
                                        onClick: {
                                            "OpdQueueTable.useMemo[queueColumns]": ()=>handleStartConsult(row)
                                        }["OpdQueueTable.useMemo[queueColumns]"],
                                        children: row.stage === "In Progress" ? "Open Consult" : "Start Consult"
                                    }, void 0, false, {
                                        fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                                        lineNumber: 127,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "small",
                                        variant: "outlined",
                                        startIcon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$History$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                            fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                                            lineNumber: 139,
                                            columnNumber: 26
                                        }, void 0),
                                        disabled: !capabilities.canViewHistory,
                                        onClick: {
                                            "OpdQueueTable.useMemo[queueColumns]": ()=>handleViewHistory(row)
                                        }["OpdQueueTable.useMemo[queueColumns]"],
                                        children: "View History"
                                    }, void 0, false, {
                                        fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                                        lineNumber: 136,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        size: "small",
                                        variant: "outlined",
                                        color: "secondary",
                                        startIcon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$SwapHoriz$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                            fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                                            lineNumber: 149,
                                            columnNumber: 26
                                        }, void 0),
                                        disabled: !capabilities.canTransferToIpd,
                                        onClick: {
                                            "OpdQueueTable.useMemo[queueColumns]": ()=>handleOpenTransferDialog(row)
                                        }["OpdQueueTable.useMemo[queueColumns]"],
                                        children: "Move to IPD"
                                    }, void 0, false, {
                                        fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                                        lineNumber: 145,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                                lineNumber: 126,
                                columnNumber: 11
                            }, this)
                    }["OpdQueueTable.useMemo[queueColumns]"]
                }
            ]
    }["OpdQueueTable.useMemo[queueColumns]"], [
        capabilities,
        handleStartConsult,
        handleViewHistory,
        handleOpenTransferDialog
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$table$2f$CommonDataGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        rows: filteredQueue,
        columns: queueColumns,
        getRowId: (row)=>row.id,
        showSerialNo: true,
        emptyTitle: "No patients in queue",
        emptyDescription: "No patients in queue for the selected filter.",
        searchPlaceholder: "Search patient, MRN, complaint...",
        searchFields: [
            "token",
            "patientName",
            "mrn",
            "chiefComplaint",
            "doctor",
            "department",
            "queuePriority"
        ],
        toolbarRight: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
            direction: "row",
            spacing: 1,
            children: [
                role !== "DOCTOR" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                    variant: "contained",
                    size: "small",
                    startIcon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Add$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                        lineNumber: 191,
                        columnNumber: 26
                    }, void 0),
                    disabled: !capabilities.canCreateRegistration,
                    onClick: handleNewRegistration,
                    children: "New Patient Registration"
                }, void 0, false, {
                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                    lineNumber: 188,
                    columnNumber: 13
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                    variant: "outlined",
                    size: "small",
                    startIcon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$FilterList$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                        lineNumber: 201,
                        columnNumber: 24
                    }, void 0),
                    onClick: ()=>setFilterDrawerOpen(true),
                    children: "Filters"
                }, void 0, false, {
                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                    lineNumber: 198,
                    columnNumber: 11
                }, void 0),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                    variant: "text",
                    size: "small",
                    onClick: resetFilters,
                    children: "Clear"
                }, void 0, false, {
                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
                    lineNumber: 206,
                    columnNumber: 11
                }, void 0)
            ]
        }, void 0, true, {
            fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
            lineNumber: 186,
            columnNumber: 9
        }, void 0)
    }, void 0, false, {
        fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueTable.tsx",
        lineNumber: 168,
        columnNumber: 5
    }, this);
}
_s(OpdQueueTable, "rg/Kx3Dft0xrxCJEKHe7hKYGVAg=");
_c = OpdQueueTable;
var _c;
__turbopack_context__.k.register(_c, "OpdQueueTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/ui/components/atoms/Select.tsx [app-client] (ecmascript) <export default as Select>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Select",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/Select.tsx [app-client] (ecmascript)");
}),
"[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OpdQueueFilters",
    ()=>OpdQueueFilters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Box/Box.js [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Divider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Divider$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/Divider.tsx [app-client] (ecmascript) <export default as Divider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Drawer$2f$Drawer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Drawer$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Drawer/Drawer.js [app-client] (ecmascript) <export default as Drawer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$FormControl$2f$FormControl$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormControl$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/FormControl/FormControl.js [app-client] (ecmascript) <export default as FormControl>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$IconButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__IconButton$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/IconButton.tsx [app-client] (ecmascript) <export default as IconButton>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$InputLabel$2f$InputLabel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__InputLabel$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/InputLabel/InputLabel.js [app-client] (ecmascript) <export default as InputLabel>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/MenuItem/MenuItem.js [app-client] (ecmascript) <export default as MenuItem>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Select$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/Select.tsx [app-client] (ecmascript) <export default as Select>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Stack/Stack.js [app-client] (ecmascript) <export default as Stack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/Text.tsx [app-client] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Close$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/Close.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function OpdQueueFilters({ data }) {
    _s();
    const { filterDrawerOpen, setFilterDrawerOpen, stageFilter, setStageFilter, priorityFilter, setPriorityFilter, departmentFilter, setDepartmentFilter, queue } = data;
    const departments = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "OpdQueueFilters.useMemo[departments]": ()=>[
                "All Departments",
                ...Array.from(new Set(queue.map({
                    "OpdQueueFilters.useMemo[departments]": (item)=>item.department
                }["OpdQueueFilters.useMemo[departments]"])))
            ]
    }["OpdQueueFilters.useMemo[departments]"], [
        queue
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Drawer$2f$Drawer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Drawer$3e$__["Drawer"], {
        anchor: "right",
        open: filterDrawerOpen,
        onClose: ()=>setFilterDrawerOpen(false),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
            sx: {
                width: 360,
                p: 3
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                    direction: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    sx: {
                        mb: 2
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                    variant: "h6",
                                    sx: {
                                        fontWeight: 700
                                    },
                                    children: "Queue Filters"
                                }, void 0, false, {
                                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                                    lineNumber: 59,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                                    variant: "caption",
                                    color: "text.secondary",
                                    children: "Narrow down the OPD queue"
                                }, void 0, false, {
                                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                                    lineNumber: 62,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                            lineNumber: 58,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$IconButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__IconButton$3e$__["IconButton"], {
                            onClick: ()=>setFilterDrawerOpen(false),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$Close$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                                lineNumber: 67,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                            lineNumber: 66,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                    lineNumber: 52,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Divider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Divider$3e$__["Divider"], {
                    sx: {
                        mb: 3
                    }
                }, void 0, false, {
                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                    lineNumber: 71,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                    spacing: 3,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$FormControl$2f$FormControl$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormControl$3e$__["FormControl"], {
                            fullWidth: true,
                            size: "small",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$InputLabel$2f$InputLabel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__InputLabel$3e$__["InputLabel"], {
                                    children: "Stage"
                                }, void 0, false, {
                                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                                    lineNumber: 76,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Select$3e$__["Select"], {
                                    label: "Stage",
                                    value: stageFilter,
                                    onChange: (e)=>setStageFilter(e.target.value),
                                    children: [
                                        "All Stage",
                                        "Waiting",
                                        "In Progress"
                                    ].map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                            value: v,
                                            children: v
                                        }, v, false, {
                                            fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                                            lineNumber: 85,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                                    lineNumber: 77,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                            lineNumber: 75,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$FormControl$2f$FormControl$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormControl$3e$__["FormControl"], {
                            fullWidth: true,
                            size: "small",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$InputLabel$2f$InputLabel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__InputLabel$3e$__["InputLabel"], {
                                    children: "Priority"
                                }, void 0, false, {
                                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                                    lineNumber: 94,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Select$3e$__["Select"], {
                                    label: "Priority",
                                    value: priorityFilter,
                                    onChange: (e)=>setPriorityFilter(e.target.value),
                                    children: [
                                        "All Priorities",
                                        "Routine",
                                        "Urgent"
                                    ].map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                            value: v,
                                            children: v
                                        }, v, false, {
                                            fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                                            lineNumber: 103,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                                    lineNumber: 95,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$FormControl$2f$FormControl$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FormControl$3e$__["FormControl"], {
                            fullWidth: true,
                            size: "small",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$InputLabel$2f$InputLabel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__InputLabel$3e$__["InputLabel"], {
                                    children: "Department"
                                }, void 0, false, {
                                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                                    lineNumber: 112,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Select$3e$__["Select"], {
                                    label: "Department",
                                    value: departmentFilter,
                                    onChange: (e)=>setDepartmentFilter(e.target.value),
                                    children: departments.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                            value: v,
                                            children: v
                                        }, v, false, {
                                            fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                                            lineNumber: 121,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                                    lineNumber: 113,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                            lineNumber: 111,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
            lineNumber: 51,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueFilters.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
_s(OpdQueueFilters, "C2jPJzX+9j655bqneTdDrwJ3Pak=");
_c = OpdQueueFilters;
var _c;
__turbopack_context__.k.register(_c, "OpdQueueFilters");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/ui/components/molecules/CommonDialog.tsx [app-client] (ecmascript) <export default as CommonDialog>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CommonDialog",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$molecules$2f$CommonDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$molecules$2f$CommonDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ui/components/molecules/CommonDialog.tsx [app-client] (ecmascript)");
}),
"[project]/src/screens/opd/OpdQueue/components/OpdQueueDialogs.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OpdQueueDialogs",
    ()=>OpdQueueDialogs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Alert$2f$Alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Alert$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Alert/Alert.js [app-client] (ecmascript) <export default as Alert>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Button/Button.js [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/MenuItem/MenuItem.js [app-client] (ecmascript) <export default as MenuItem>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Snackbar$2f$Snackbar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Snackbar$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Snackbar/Snackbar.js [app-client] (ecmascript) <export default as Snackbar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Stack/Stack.js [app-client] (ecmascript) <export default as Stack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/Input.tsx [app-client] (ecmascript) <export default as TextField>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$molecules$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/ui/components/molecules/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$molecules$2f$CommonDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CommonDialog$3e$__ = __turbopack_context__.i("[project]/src/ui/components/molecules/CommonDialog.tsx [app-client] (ecmascript) <export default as CommonDialog>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$layout$2f$AlignedGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ui/components/layout/AlignedGrid.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$SwapHoriz$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/SwapHoriz.js [app-client] (ecmascript)");
"use client";
;
;
;
;
;
function OpdQueueDialogs({ data }) {
    const { transferDialogOpen, setTransferDialogOpen, selectedTransferItem, transferDraft, setTransferDraft, handleSubmitTransfer, snackbar, setSnackbar } = data;
    const handleUpdateDraftField = (field, value)=>{
        setTransferDraft((prev)=>({
                ...prev,
                [field]: value
            }));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$molecules$2f$CommonDialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CommonDialog$3e$__["CommonDialog"], {
                open: transferDialogOpen,
                onClose: ()=>setTransferDialogOpen(false),
                maxWidth: "md",
                title: "Move Patient to IPD (In-Patient Department)",
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$SwapHoriz$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    fontSize: "small"
                }, void 0, false, {
                    fileName: "[project]/src/screens/opd/OpdQueue/components/OpdQueueDialogs.tsx",
                    lineNumber: 48,
                    columnNumber: 15
                }, void 0),
                description: selectedTransferItem ? `Initiate IPD admission request for ${selectedTransferItem.patientName} (${selectedTransferItem.mrn}).` : "Initiate IPD admission request.",
                contentDividers: true,
                content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                    spacing: 2,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$layout$2f$AlignedGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            container: true,
                            spacing: 2,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$layout$2f$AlignedGrid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    item: true,
                                    xs: 12,
                                    sm: 6,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                                        select: true,
                                        fullWidth: true,
                                        label: "Admission Priority",
                                        value: transferDraft.priority,
