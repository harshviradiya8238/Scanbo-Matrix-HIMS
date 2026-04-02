function useCalendarEvents({ appointments, availability, providerFilter, availabilityProvider, calendarRange, calendarView, slotDurationMinutes, selectedEvent, directDepartment, providerDepartmentMap, bookingDepartment, hasOverlappingAppointment }) {
    _s();
    const appointmentEvents = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useCalendarEvents.useMemo[appointmentEvents]": ()=>{
            const filtered = appointments.filter({
                "useCalendarEvents.useMemo[appointmentEvents].filtered": (a)=>(providerFilter === "All" || a.provider === providerFilter) && a.status !== "Cancelled"
            }["useCalendarEvents.useMemo[appointmentEvents].filtered"]);
            const sorted = [
                ...filtered
            ].sort({
                "useCalendarEvents.useMemo[appointmentEvents].sorted": (a, b)=>{
                    if (a.date !== b.date) return a.date.localeCompare(b.date);
                    const timeDiff = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$OpdCalendar$2f$utils$2f$opd$2d$calendar$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toMinutes"])(a.time) - (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$OpdCalendar$2f$utils$2f$opd$2d$calendar$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toMinutes"])(b.time);
                    if (timeDiff !== 0) return timeDiff;
                    return a.id.localeCompare(b.id);
                }
            }["useCalendarEvents.useMemo[appointmentEvents].sorted"]);
            const intervalsByDate = new Map();
            const nonOverlapping = sorted.filter({
                "useCalendarEvents.useMemo[appointmentEvents].nonOverlapping": (a)=>{
                    const startMinutes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$OpdCalendar$2f$utils$2f$opd$2d$calendar$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toMinutes"])(a.time);
                    const endMinutes = startMinutes + slotDurationMinutes;
                    const intervals = intervalsByDate.get(a.date) ?? [];
                    if (intervals.some({
                        "useCalendarEvents.useMemo[appointmentEvents].nonOverlapping": ([s, e])=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$OpdCalendar$2f$utils$2f$opd$2d$calendar$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rangesOverlap"])(startMinutes, endMinutes, s, e)
                    }["useCalendarEvents.useMemo[appointmentEvents].nonOverlapping"])) return false;
                    intervals.push([
                        startMinutes,
                        endMinutes
                    ]);
                    intervalsByDate.set(a.date, intervals);
                    return true;
                }
            }["useCalendarEvents.useMemo[appointmentEvents].nonOverlapping"]);
            return nonOverlapping.map({
                "useCalendarEvents.useMemo[appointmentEvents]": (a)=>({
                        id: a.id,
                        title: a.patientName,
                        start: `${a.date}T${a.time}:00`,
                        end: `${a.date}T${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$OpdCalendar$2f$utils$2f$opd$2d$calendar$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addMinutesToTime"])(a.time, slotDurationMinutes)}:00`,
                        classNames: selectedEvent && selectedEvent.id === a.id ? [
                            "fc-event-selected"
                        ] : [],
                        extendedProps: {
                            kind: "appointment",
                            appointment: a
                        }
                    })
            }["useCalendarEvents.useMemo[appointmentEvents]"]);
        }
    }["useCalendarEvents.useMemo[appointmentEvents]"], [
        appointments,
        providerFilter,
        selectedEvent,
        slotDurationMinutes
    ]);
    const availabilityEvents = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useCalendarEvents.useMemo[availabilityEvents]": ()=>{
            if (!availabilityProvider || !calendarRange || calendarView === "dayGridMonth") return [];
            const start = calendarRange.start;
            const end = calendarRange.end;
            return availability.filter({
                "useCalendarEvents.useMemo[availabilityEvents]": (entry)=>entry.provider === availabilityProvider
            }["useCalendarEvents.useMemo[availabilityEvents]"]).filter({
                "useCalendarEvents.useMemo[availabilityEvents]": (entry)=>{
                    const dateValue = new Date(`${entry.date}T00:00:00`);
                    return dateValue >= start && dateValue < end;
                }
            }["useCalendarEvents.useMemo[availabilityEvents]"]).flatMap({
                "useCalendarEvents.useMemo[availabilityEvents]": (entry)=>entry.slots.filter({
                        "useCalendarEvents.useMemo[availabilityEvents]": (slot)=>slot.status === "Available"
                    }["useCalendarEvents.useMemo[availabilityEvents]"]).filter({
                        "useCalendarEvents.useMemo[availabilityEvents]": (slot)=>!hasOverlappingAppointment(entry.date, slot.time)
                    }["useCalendarEvents.useMemo[availabilityEvents]"]).map({
                        "useCalendarEvents.useMemo[availabilityEvents]": (slot)=>({
                                id: `avail-${availabilityProvider}-${entry.date}-${slot.time}`,
                                title: "Available",
                                start: `${entry.date}T${slot.time}:00`,
                                end: `${entry.date}T${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$OpdCalendar$2f$utils$2f$opd$2d$calendar$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addMinutesToTime"])(slot.time, slotDurationMinutes)}:00`,
                                classNames: [
                                    "fc-availability-event"
                                ],
                                extendedProps: {
                                    kind: "availability",
                                    slot,
                                    provider: availabilityProvider,
                                    date: entry.date,
                                    department: providerDepartmentMap.get(availabilityProvider) || directDepartment || bookingDepartment
                                }
                            })
                    }["useCalendarEvents.useMemo[availabilityEvents]"])
            }["useCalendarEvents.useMemo[availabilityEvents]"]);
        }
    }["useCalendarEvents.useMemo[availabilityEvents]"], [
        availabilityProvider,
        calendarRange,
        calendarView,
        availability,
        slotDurationMinutes,
        hasOverlappingAppointment,
        providerDepartmentMap,
        directDepartment,
        bookingDepartment
    ]);
    const events = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useCalendarEvents.useMemo[events]": ()=>[
                ...appointmentEvents,
                ...availabilityEvents
            ]
    }["useCalendarEvents.useMemo[events]"], [
        appointmentEvents,
        availabilityEvents
    ]);
    return {
        events
    };
}
_s(useCalendarEvents, "O/cNgSqh+CYwLSKMAc77FSdd6N0=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CalendarToolbar",
    ()=>CalendarToolbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Box/Box.js [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Button/Button.js [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$IconButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__IconButton$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/IconButton.tsx [app-client] (ecmascript) <export default as IconButton>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/MenuItem/MenuItem.js [app-client] (ecmascript) <export default as MenuItem>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/Stack/Stack.js [app-client] (ecmascript) <export default as Stack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/Input.tsx [app-client] (ecmascript) <export default as TextField>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__ = __turbopack_context__.i("[project]/src/ui/components/atoms/Text.tsx [app-client] (ecmascript) <export default as Typography>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$theme$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/ui/theme/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/system/esm/colorManipulator.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$styles$2f$useTheme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__useTheme$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/styles/useTheme.js [app-client] (ecmascript) <export default as useTheme>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$ChevronLeft$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/ChevronLeft.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$ChevronRight$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mui/icons-material/ChevronRight.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function StatsPill({ label, count }) {
    _s();
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$styles$2f$useTheme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__useTheme$3e$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
        sx: {
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.4,
            py: 0.55,
            borderRadius: 999,
            border: "1px solid",
            borderColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(theme.palette.primary.main, 0.25),
            bgcolor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(theme.palette.primary.main, 0.08),
            boxShadow: `0 8px 16px ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(theme.palette.primary.main, 0.08)}`
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                variant: "caption",
                sx: {
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    fontSize: "0.72rem",
                    letterSpacing: "0.02em"
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                sx: {
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.common.white,
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    display: "grid",
                    placeItems: "center"
                },
                children: count
            }, void 0, false, {
                fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, this);
}
_s(StatsPill, "VrMvFCCB9Haniz3VCRPNUiCauHs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$styles$2f$useTheme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__useTheme$3e$__["useTheme"]
    ];
});
_c = StatsPill;
function CalendarToolbar({ calendarTitle, calendarView, directDate, availableSlotCount, appointmentStats, canManageCalendar, onPrev, onNext, onToday, onViewSelect, onNewBooking }) {
    _s1();
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$styles$2f$useTheme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__useTheme$3e$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
        spacing: 1.2,
        sx: {
            p: 1.5,
            pb: 1,
            position: "sticky",
            top: 0,
            zIndex: 4,
            backdropFilter: "blur(6px)",
            borderBottom: "1px solid",
            borderColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$system$2f$esm$2f$colorManipulator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["alpha"])(theme.palette.divider, 0.2)
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
            direction: {
                xs: "column",
                md: "row"
            },
            spacing: 1.5,
            alignItems: {
                xs: "flex-start",
                md: "center"
            },
            justifyContent: "space-between",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                    direction: "row",
                    spacing: 1.2,
                    alignItems: "center",
                    flexWrap: "wrap",
                    sx: {
                        flexShrink: 0
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            size: "small",
                            variant: "outlined",
                            onClick: onToday,
                            sx: {
                                borderRadius: 999,
                                px: 2.5,
                                fontWeight: 600
                            },
                            children: "Today"
                        }, void 0, false, {
                            fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                            lineNumber: 138,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$IconButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__IconButton$3e$__["IconButton"], {
                            size: "small",
                            onClick: onPrev,
                            "aria-label": "Previous",
                            sx: {
                                border: "1px solid",
                                borderColor: "divider"
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$ChevronLeft$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                fontSize: "small"
                            }, void 0, false, {
                                fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                                lineNumber: 152,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                            lineNumber: 146,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$IconButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__IconButton$3e$__["IconButton"], {
                            size: "small",
                            onClick: onNext,
                            "aria-label": "Next",
                            sx: {
                                border: "1px solid",
                                borderColor: "divider"
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$icons$2d$material$2f$ChevronRight$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                fontSize: "small"
                            }, void 0, false, {
                                fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                                lineNumber: 160,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                            lineNumber: 154,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Text$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Typography$3e$__["Typography"], {
                            variant: "subtitle1",
                            sx: {
                                fontWeight: 700,
                                ml: 1
                            },
                            children: calendarTitle || "Calendar"
                        }, void 0, false, {
                            fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                            lineNumber: 162,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                    lineNumber: 131,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Box$2f$Box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                    sx: {
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: {
                            xs: "flex-start",
                            md: "center"
                        },
                        overflowX: "auto",
                        py: 0.25
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                        direction: "row",
                        spacing: 1,
                        alignItems: "center",
                        sx: {
                            flexWrap: "nowrap",
                            "& > *": {
                                flexShrink: 0
                            }
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatsPill, {
                                label: `Slots on ${directDate}`,
                                count: availableSlotCount
                            }, void 0, false, {
                                fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                                lineNumber: 185,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatsPill, {
                                label: "Checked-In",
                                count: appointmentStats.checkedIn
                            }, void 0, false, {
                                fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                                lineNumber: 189,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatsPill, {
                                label: "In Triage / Consult",
                                count: appointmentStats.inTriageConsult
                            }, void 0, false, {
                                fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                                lineNumber: 190,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatsPill, {
                                label: "No Show",
                                count: appointmentStats.noShow
                            }, void 0, false, {
                                fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                                lineNumber: 194,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                        lineNumber: 179,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                    lineNumber: 168,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Stack$2f$Stack$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Stack$3e$__["Stack"], {
                    direction: {
                        xs: "column",
                        md: "row"
                    },
                    spacing: 1,
                    alignItems: {
                        xs: "stretch",
                        md: "center"
                    },
                    sx: {
                        flexShrink: 0
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ui$2f$components$2f$atoms$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TextField$3e$__["TextField"], {
                            size: "small",
                            select: true,
                            label: "View",
                            value: calendarView,
                            onChange: (e)=>onViewSelect(e),
                            sx: {
                                minWidth: 140
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                    value: "dayGridMonth",
                                    children: "Month"
                                }, void 0, false, {
                                    fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                                    lineNumber: 213,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                    value: "timeGridWeek",
                                    children: "Week"
                                }, void 0, false, {
                                    fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                                    lineNumber: 214,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$MenuItem$2f$MenuItem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MenuItem$3e$__["MenuItem"], {
                                    value: "timeGridDay",
                                    children: "Day"
                                }, void 0, false, {
                                    fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                                    lineNumber: 215,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                            lineNumber: 205,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$Button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                            size: "small",
                            variant: "contained",
                            disabled: !canManageCalendar,
                            onClick: onNewBooking,
                            children: "New Booking"
                        }, void 0, false, {
                            fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                            lineNumber: 217,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
                    lineNumber: 199,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
            lineNumber: 124,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/screens/opd/OpdCalendar/components/CalendarToolbar.tsx",
        lineNumber: 111,
        columnNumber: 5
    }, this);
}
_s1(CalendarToolbar, "VrMvFCCB9Haniz3VCRPNUiCauHs=", false, function() {
