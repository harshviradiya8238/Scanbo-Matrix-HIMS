function useOpdCalendar() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const { role } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$auth$2f$UserContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"])();
    const mrnParam = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$patients$2f$useMrnParam$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMrnParam"])();
    const dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$hooks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"])();
    const { appointments, providerAvailability, providers, slotTimes } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$opdHooks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useOpdData"])();
    const [availability, setAvailability] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](providerAvailability);
    const [selectedDate, setSelectedDate] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](appointments[0]?.date ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$OpdCalendar$2f$utils$2f$opd$2d$calendar$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatIsoDate"])(new Date()));
    const [directDate, setDirectDate] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]({
        "useOpdCalendar.useState": ()=>selectedDate
    }["useOpdCalendar.useState"]);
    const [providerFilter, setProviderFilter] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("All");
    const [directDepartment, setDirectDepartment] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$OpdCalendar$2f$utils$2f$opd$2d$calendar$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultDepartment"]);
    const [directProvider, setDirectProvider] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const [booking, setBooking] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]({
        "useOpdCalendar.useState": ()=>buildDefaultBooking(providers, slotTimes, appointments[0]?.date ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$OpdCalendar$2f$utils$2f$opd$2d$calendar$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatIsoDate"])(new Date()))
    }["useOpdCalendar.useState"]);
    const [errors, setErrors] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]({});
    const [selectedPatientOption, setSelectedPatientOption] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const [bookingOpen, setBookingOpen] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const [editingAppointment, setEditingAppointment] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const [slotLocked, setSlotLocked] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const [calendarView, setCalendarView] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("timeGridWeek");
    const [calendarTitle, setCalendarTitle] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("");
    const [selectedEvent, setSelectedEvent] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const [eventAnchor, setEventAnchor] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const [calendarRange, setCalendarRange] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const [snackbar, setSnackbar] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]({
        open: false,
        message: "",
        severity: "success"
    });
    const [mrnApplied, setMrnApplied] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const [registrationPayloadApplied, setRegistrationPayloadApplied] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const roleProfile = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useOpdCalendar.useMemo[roleProfile]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$opd$2d$role$2d$flow$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getOpdRoleFlowProfile"])(role)
    }["useOpdCalendar.useMemo[roleProfile]"], [
        role
    ]);
    const canManageCalendar = roleProfile.capabilities.canManageCalendar;
    const slotDurationMinutes = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useOpdCalendar.useMemo[slotDurationMinutes]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$OpdCalendar$2f$utils$2f$opd$2d$calendar$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSlotDurationMinutes"])(slotTimes)
    }["useOpdCalendar.useMemo[slotDurationMinutes]"], [
        slotTimes
    ]);
    const guardCalendarAction = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useOpdCalendar.useCallback[guardCalendarAction]": (actionLabel)=>{
            if (canManageCalendar) return true;
            setSnackbar({
                open: true,
                message: `${roleProfile.label} has read-only calendar access. ${actionLabel} is restricted.`,
                severity: "warning"
            });
            return false;
        }
    }["useOpdCalendar.useCallback[guardCalendarAction]"], [
        canManageCalendar,
        roleProfile.label
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "useOpdCalendar.useEffect": ()=>{
            if (providerAvailability.length > 0) {
                setAvailability(providerAvailability);
            }
        }
    }["useOpdCalendar.useEffect"], [
        providerAvailability
    ]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "useOpdCalendar.useEffect": ()=>{
            if (!providers.length || !slotTimes.length) return;
            setBooking({
                "useOpdCalendar.useEffect": (prev)=>({
                        ...prev,
                        provider: prev.provider || providers[0],
                        time: prev.time || slotTimes[0]
                    })
            }["useOpdCalendar.useEffect"]);
        }
    }["useOpdCalendar.useEffect"], [
        providers,
        slotTimes
    ]);
    const seededPatient = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useOpdCalendar.useMemo[seededPatient]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mocks$2f$global$2d$patients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPatientByMrn"])(booking.mrn || mrnParam)
    }["useOpdCalendar.useMemo[seededPatient]"], [
        booking.mrn,
        mrnParam
    ]);
    const activePatient = selectedPatientOption ?? seededPatient ?? null;
    const patientName = booking.patientName || seededPatient?.name;
    const patientMrn = booking.mrn || seededPatient?.mrn || mrnParam;
    const patientSummary = {
        name: booking.patientName || activePatient?.name || "",
        mrn: booking.mrn || activePatient?.mrn || mrnParam || "",
        ageGender: booking.ageGender || activePatient?.ageGender || "",
        phone: booking.phone || activePatient?.phone || "",
        department: booking.department || activePatient?.department || directDepartment || ""
    };
    const departmentOptions = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useOpdCalendar.useMemo[departmentOptions]": ()=>{
            const departments = new Set();
            appointments.forEach({
                "useOpdCalendar.useMemo[departmentOptions]": (a)=>departments.add(a.department)
            }["useOpdCalendar.useMemo[departmentOptions]"]);
            if (seededPatient?.department) departments.add(seededPatient.department);
            return Array.from(departments).sort({
                "useOpdCalendar.useMemo[departmentOptions]": (a, b)=>a.localeCompare(b)
            }["useOpdCalendar.useMemo[departmentOptions]"]);
        }
    }["useOpdCalendar.useMemo[departmentOptions]"], [
        appointments,
        seededPatient?.department
    ]);
    const providersByDepartment = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useOpdCalendar.useMemo[providersByDepartment]": ()=>{
            const map = new Map();
            appointments.forEach({
                "useOpdCalendar.useMemo[providersByDepartment]": (a)=>{
                    const current = map.get(a.department) ?? [];
                    if (!current.includes(a.provider)) current.push(a.provider);
                    map.set(a.department, current);
                }
            }["useOpdCalendar.useMemo[providersByDepartment]"]);
            departmentOptions.forEach({
                "useOpdCalendar.useMemo[providersByDepartment]": (d)=>{
                    if (!map.has(d)) map.set(d, []);
                }
            }["useOpdCalendar.useMemo[providersByDepartment]"]);
            map.forEach({
                "useOpdCalendar.useMemo[providersByDepartment]": (list)=>list.sort({
                        "useOpdCalendar.useMemo[providersByDepartment]": (a, b)=>a.localeCompare(b)
                    }["useOpdCalendar.useMemo[providersByDepartment]"])
            }["useOpdCalendar.useMemo[providersByDepartment]"]);
            return map;
        }
    }["useOpdCalendar.useMemo[providersByDepartment]"], [
        appointments,
        departmentOptions
    ]);
    const providerDepartmentMap = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useOpdCalendar.useMemo[providerDepartmentMap]": ()=>{
            const map = new Map();
            appointments.forEach({
                "useOpdCalendar.useMemo[providerDepartmentMap]": (a)=>{
                    if (!map.has(a.provider)) map.set(a.provider, a.department);
                }
            }["useOpdCalendar.useMemo[providerDepartmentMap]"]);
            return map;
        }
    }["useOpdCalendar.useMemo[providerDepartmentMap]"], [
        appointments
    ]);
    const directProviderOptions = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useOpdCalendar.useMemo[directProviderOptions]": ()=>{
            if (!directDepartment) return providers;
            const list = providersByDepartment.get(directDepartment) ?? [];
            return list.length ? list : providers;
        }
    }["useOpdCalendar.useMemo[directProviderOptions]"], [
        directDepartment,
        providers,
        providersByDepartment
    ]);
    const directAvailability = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useOpdCalendar.useMemo[directAvailability]": ()=>{
            if (!directProvider) return null;
            return availability.find({
                "useOpdCalendar.useMemo[directAvailability]": (e)=>e.provider === directProvider && e.date === directDate
            }["useOpdCalendar.useMemo[directAvailability]"]) ?? null;
        }
    }["useOpdCalendar.useMemo[directAvailability]"], [
        availability,
        directDate,
        directProvider
    ]);
    const directSlots = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useOpdCalendar.useMemo[directSlots]": ()=>{
            if (!directAvailability) return [];
            return [
                ...directAvailability.slots
            ].sort({
                "useOpdCalendar.useMemo[directSlots]": (a, b)=>a.time.localeCompare(b.time)
            }["useOpdCalendar.useMemo[directSlots]"]);
        }
    }["useOpdCalendar.useMemo[directSlots]"], [
        directAvailability
    ]);
    const availableSlotCount = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useOpdCalendar.useMemo[availableSlotCount]": ()=>directSlots.filter({
                "useOpdCalendar.useMemo[availableSlotCount]": (s)=>s.status === "Available"
            }["useOpdCalendar.useMemo[availableSlotCount]"]).length
    }["useOpdCalendar.useMemo[availableSlotCount]"], [
        directSlots
    ]);
    const availabilityProvider = directProvider || (providerFilter !== "All" ? providerFilter : null);
    const appointmentStats = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "useOpdCalendar.useMemo[appointmentStats]": ()=>{
            const date = directDate;
            let checkedIn = 0;
            let inTriageConsult = 0;
            let noShow = 0;
            appointments.forEach({
                "useOpdCalendar.useMemo[appointmentStats]": (a)=>{
                    if (a.date !== date) return;
                    if (directDepartment && a.department !== directDepartment) return;
                    if (directProvider && a.provider !== directProvider) return;
                    if (a.status === "Checked-In") checkedIn += 1;
                    else if (a.status === "In Triage" || a.status === "In Consultation") inTriageConsult += 1;
                    else if (a.status === "No Show") noShow += 1;
                }
            }["useOpdCalendar.useMemo[appointmentStats]"]);
            return {
                checkedIn,
                inTriageConsult,
                noShow
            };
        }
    }["useOpdCalendar.useMemo[appointmentStats]"], [
        appointments,
        directDate,
        directDepartment,
        directProvider
    ]);
    const updateBookingField = (field, value)=>{
        setBooking((prev)=>({
                ...prev,
                [field]: value
            }));
        if (errors[field]) {
            setErrors((prev)=>{
                const next = {
                    ...prev
                };
                delete next[field];
                return next;
            });
        }
    };
    const getSlotForSelection = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useOpdCalendar.useCallback[getSlotForSelection]": (provider, date, time)=>{
            const entry = availability.find({
                "useOpdCalendar.useCallback[getSlotForSelection].entry": (e)=>e.provider === provider && e.date === date
            }["useOpdCalendar.useCallback[getSlotForSelection].entry"]);
            return entry?.slots.find({
                "useOpdCalendar.useCallback[getSlotForSelection]": (s)=>s.time === time
            }["useOpdCalendar.useCallback[getSlotForSelection]"]);
        }
    }["useOpdCalendar.useCallback[getSlotForSelection]"], [
        availability
    ]);
    const hasOverlappingAppointment = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useOpdCalendar.useCallback[hasOverlappingAppointment]": (date, time, excludeId)=>{
            const startMinutes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$OpdCalendar$2f$utils$2f$opd$2d$calendar$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toMinutes"])(time);
            const endMinutes = startMinutes + slotDurationMinutes;
            return appointments.some({
                "useOpdCalendar.useCallback[hasOverlappingAppointment]": (a)=>{
                    if (a.date !== date) return false;
                    if (a.status === "Cancelled") return false;
                    if (excludeId && a.id === excludeId) return false;
                    const apptStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$OpdCalendar$2f$utils$2f$opd$2d$calendar$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toMinutes"])(a.time);
                    const apptEnd = apptStart + slotDurationMinutes;
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$screens$2f$opd$2f$OpdCalendar$2f$utils$2f$opd$2d$calendar$2e$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rangesOverlap"])(startMinutes, endMinutes, apptStart, apptEnd);
                }
            }["useOpdCalendar.useCallback[hasOverlappingAppointment]"]);
        }
    }["useOpdCalendar.useCallback[hasOverlappingAppointment]"], [
        appointments,
        slotDurationMinutes
    ]);
    const getSlotCheck = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useOpdCalendar.useCallback[getSlotCheck]": (provider, date, time, editTarget)=>{
            if (!provider || !date || !time) {
                return {
                    status: "Select time",
                    available: false,
                    tone: "info",
                    message: ""
                };
            }
            if (hasOverlappingAppointment(date, time, editTarget?.id)) {
                return {
                    status: "Overlap",
                    available: false,
                    tone: "error",
                    message: "Conflicts with another appointment."
                };
            }
            const slot = getSlotForSelection(provider, date, time);
            const isSameSlot = Boolean(editTarget && provider === editTarget.provider && date === editTarget.date && time === editTarget.time);
            if (!slot || slot.status === "Available") {
                return {
                    status: "Available",
                    available: true,
                    tone: "success",
                    message: ""
                };
            }
            if (isSameSlot) {
                return {
                    status: slot.status,
                    available: true,
                    tone: "info",
                    message: ""
                };
            }
            const tone = slot.status === "Booked" ? "error" : "warning";
            return {
                status: slot.status,
                available: false,
                tone,
                message: `Slot is ${slot.status.toLowerCase()}.`
            };
        }
    }["useOpdCalendar.useCallback[getSlotCheck]"], [
        getSlotForSelection,
        hasOverlappingAppointment
    ]);
    const ensureAvailabilitySlot = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useOpdCalendar.useCallback[ensureAvailabilitySlot]": (provider, date, time)=>{
            setAvailability({
                "useOpdCalendar.useCallback[ensureAvailabilitySlot]": (prev)=>{
                    let foundEntry = false;
                    const next = prev.map({
                        "useOpdCalendar.useCallback[ensureAvailabilitySlot].next": (entry)=>{
                            if (entry.provider !== provider || entry.date !== date) return entry;
                            foundEntry = true;
                            if (entry.slots.some({
                                "useOpdCalendar.useCallback[ensureAvailabilitySlot].next": (s)=>s.time === time
                            }["useOpdCalendar.useCallback[ensureAvailabilitySlot].next"])) return entry;
                            return {
                                ...entry,
                                slots: [
                                    ...entry.slots,
                                    {
                                        time,
                                        status: "Available"
                                    }
                                ]
                            };
                        }
                    }["useOpdCalendar.useCallback[ensureAvailabilitySlot].next"]);
                    if (!foundEntry) {
                        next.push({
                            provider,
                            date,
                            location: "Main OPD Wing",
                            slots: [
                                {
                                    time,
                                    status: "Available"
                                }
                            ]
                        });
                    }
                    return next;
                }
            }["useOpdCalendar.useCallback[ensureAvailabilitySlot]"]);
        }
    }["useOpdCalendar.useCallback[ensureAvailabilitySlot]"], []);
    const markSlotBooked = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "useOpdCalendar.useCallback[markSlotBooked]": (provider, date, time)=>{
            setAvailability({
                "useOpdCalendar.useCallback[markSlotBooked]": (prev)=>{
                    let foundEntry = false;
                    const next = prev.map({
                        "useOpdCalendar.useCallback[markSlotBooked].next": (entry)=>{
                            if (entry.provider !== provider || entry.date !== date) return entry;
                            foundEntry = true;
                            if (!entry.slots.some({
                                "useOpdCalendar.useCallback[markSlotBooked].next": (s)=>s.time === time
                            }["useOpdCalendar.useCallback[markSlotBooked].next"])) {
                                return {
                                    ...entry,
                                    slots: [
                                        ...entry.slots,
                                        {
                                            time,
                                            status: "Booked"
                                        }
                                    ]
                                };
                            }
                            return {
                                ...entry,
                                slots: entry.slots.map({
                                    "useOpdCalendar.useCallback[markSlotBooked].next": (s)=>s.time === time ? {
                                            ...s,
                                            status: "Booked"
                                        } : s
                                }["useOpdCalendar.useCallback[markSlotBooked].next"])
                            };
                        }
                    }["useOpdCalendar.useCallback[markSlotBooked].next"]);
                    if (!foundEntry) {
                        next.push({
