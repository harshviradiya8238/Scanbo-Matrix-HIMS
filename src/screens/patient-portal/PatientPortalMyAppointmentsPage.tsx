'use client';

import * as React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateClickArg } from '@fullcalendar/interaction';
import type { DatesSetArg, EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { Card, StatTile } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  CalendarMonth as CalendarMonthIcon,
  CalendarMonthOutlined as CalendarMonthOutlinedIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CloudQueueRounded as CloudQueueRoundedIcon,
  CreditCard as CreditCardIcon,
  EventBusy as EventBusyIcon,
  FormatListBulleted as ListIcon,
  HomeRounded as HomeRoundedIcon,
  LocalHospitalOutlined as LocalHospitalOutlinedIcon,
  MedicalServicesOutlined as MedicalServicesOutlinedIcon,
  NightsStayRounded as NightsStayRoundedIcon,
  Phone as PhoneIcon,
  VideocamOutlined as VideocamOutlinedIcon,
  WbSunnyRounded as WbSunnyRoundedIcon,
} from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { APPOINTMENTS, PATIENT } from './patient-portal-mock-data';
import type { Appointment } from './patient-portal-types';
import { useAppDispatch } from '@/src/store/hooks';
import { addAppointment, updateAppointment } from '@/src/store/slices/opdSlice';
import { useOpdData } from '@/src/store/opdHooks';
import type {
  AppointmentStatus,
  OpdAppointment,
  ProviderSlot,
  SlotStatus,
  VisitType,
} from '../opd/opd-mock-data';
import { ppSectionCard, ppSectionHeader, ppInnerCard } from './patient-portal-styles';

/* ─── Types ─────────────────────────────────────────────────────────────── */
type ListTab = 'upcoming' | 'completed' | 'cancelled';
type PageView = 'list' | 'calendar';
type BookingStep = 1 | 2 | 3 | 4;
type ConsultationType = 'clinic' | 'video' | 'audio' | 'home';
type CalendarView = 'timeGridWeek' | 'timeGridDay';

/* ─── Hospitals ─────────────────────────────────────────────────────────── */
const HOSPITALS = [
  { id: 'h1', name: 'Scanbo City Hospital',   requiresPay: true,  fee: 800  },
  { id: 'h2', name: 'Apollo Multispecialty',  requiresPay: true,  fee: 1200 },
  { id: 'h3', name: 'Govt. General Hospital', requiresPay: false, fee: 0    },
  { id: 'h4', name: 'Wellness Care Clinic',   requiresPay: false, fee: 500  },
  { id: 'h5', name: 'MedLife Diagnostics',    requiresPay: true,  fee: 950  },
];

const BOOKING_STEPS: Array<{ id: BookingStep; label: string }> = [
  { id: 1, label: 'Type' },
  { id: 2, label: 'Doctor' },
  { id: 3, label: 'Slot' },
  { id: 4, label: 'Details' },
];

const DEFAULT_SLOT_TIMES = [
  '09:00','09:20','09:40','10:00','10:20','10:40','11:00','11:20','11:40',
  '12:00','12:20','12:40','13:00','14:00','14:20','14:40','15:00','15:20',
  '15:40','16:00','16:20','16:40','17:00','17:20',
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const toMinutes = (v: string) => { const [h, m] = v.split(':').map(Number); return h * 60 + m; };
const addMins = (v: string, n: number) => { const t = toMinutes(v) + n; return `${`${Math.floor(t/60)}`.padStart(2,'0')}:${`${t%60}`.padStart(2,'0')}`; };
const fmtIso  = (d: Date) => `${d.getFullYear()}-${`${d.getMonth()+1}`.padStart(2,'0')}-${`${d.getDate()}`.padStart(2,'0')}`;
const fmtTime = (d: Date) => `${`${d.getHours()}`.padStart(2,'0')}:${`${d.getMinutes()}`.padStart(2,'0')}`;
const isSameDay = (a: Date, b: Date) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
const fmtLabel = (v: string) => { const [h,m]=v.split(':').map(Number); const p=h>=12?'PM':'AM'; return `${h%12||12}:${`${m}`.padStart(2,'0')} ${p}`; };
const fmtCompact = (v: string) => { const [h,m]=v.split(':').map(Number); return `${h%12||12}:${`${m}`.padStart(2,'0')}${h>=12?'pm':'am'}`; };
const fmtChip = (v: string) => { const [h,m]=v.split(':').map(Number); return `${h%12||12}:${`${m}`.padStart(2,'0')}`; };
const parse24 = (v: string) => { if (/^\d{2}:\d{2}$/.test(v)) return v; const match=v.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i); if (!match) return '09:00'; const hr=Number(match[1]),mi=Number(match[2]),p=match[3].toUpperCase(); return `${`${p==='PM'?(hr%12)+12:hr%12}`.padStart(2,'0')}:${`${mi}`.padStart(2,'0')}`; };
const capitalize = (v: string) => v.charAt(0).toUpperCase()+v.slice(1);
const statusColor = (s: AppointmentStatus, pal: any) => s==='Completed'?pal.success.main:s==='Checked-In'?pal.info.main:(s==='In Triage'||s==='In Consultation')?pal.warning.main:(s==='No Show'||s==='Cancelled')?pal.error.main:pal.primary.main;

const toPatientType: Record<ConsultationType, Appointment['type']> = { clinic:'in-person', video:'video', audio:'video', home:'home-visit' };
const toVisitType:   Record<ConsultationType, VisitType>            = { clinic:'New', video:'Follow-up', audio:'Follow-up', home:'Review' };

/* ════════════════════════════════════════════════════════════════════════════ */
export default function PatientPortalMyAppointmentsPage() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const sectionCard = ppSectionCard(theme);
  const sectionHeader = ppSectionHeader(theme);
  const innerCard = ppInnerCard();

  /* ── Page view tab ── */
  const [pageView, setPageView] = React.useState<PageView>('list');

  /* ── List state ── */
  const [listTab, setListTab] = React.useState<ListTab>('upcoming');
  const [listAppointments, setListAppointments] = React.useState<Appointment[]>(() => APPOINTMENTS.map(a=>({...a})));
  const [cancelTarget, setCancelTarget] = React.useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = React.useState('');

  /* ── Calendar / booking state ── */
  const calendarRef = React.useRef<FullCalendar | null>(null);
  const calendarContainerRef = React.useRef<HTMLDivElement | null>(null);
  const bookingSectionRef = React.useRef<HTMLDivElement | null>(null);
  const [portalAppointments, setPortalAppointments] = React.useState<Appointment[]>(APPOINTMENTS);
  const [bookingStep, setBookingStep] = React.useState<BookingStep>(1);
  const [consultationType, setConsultationType] = React.useState<ConsultationType | null>(null);
  const [selectedDoctor, setSelectedDoctor] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState(fmtIso(new Date()));
  const [selectedSlot, setSelectedSlot] = React.useState('');
  const [calendarTitle, setCalendarTitle] = React.useState('');
  const [calendarView, setCalendarView] = React.useState<CalendarView>('timeGridWeek');
  const [phone, setPhone] = React.useState(PATIENT.phone);
  const [reason, setReason] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [homeAddress, setHomeAddress] = React.useState(PATIENT.address);
  const [selectedHospital, setSelectedHospital] = React.useState(HOSPITALS[0].id);
  const [paying, setPaying] = React.useState(false);
  const [doctorSearch, setDoctorSearch] = React.useState('');
  const [specialtyFilter, setSpecialtyFilter] = React.useState('All');
  const [selectedCalAppt, setSelectedCalAppt] = React.useState<OpdAppointment | null>(null);
  const [eventAnchor, setEventAnchor] = React.useState<HTMLElement | null>(null);

  const [snackbar, setSnackbar] = React.useState<{ open: boolean; severity: 'success'|'info'|'warning'|'error'; message: string }>({ open: false, severity: 'success', message: '' });

  const { appointments: opdAppts, providerAvailability, providers, slotTimes, status: opdStatus, error: opdError } = useOpdData();

  /* ── Derived data ── */
  const hospital = HOSPITALS.find(h => h.id === selectedHospital) ?? HOSPITALS[0];

  const normalizedSlotTimes = React.useMemo(() => {
    const src = slotTimes.length > 0 ? slotTimes : DEFAULT_SLOT_TIMES;
    return Array.from(new Set(src)).sort((a,b) => toMinutes(a)-toMinutes(b));
  }, [slotTimes]);

  const slotDurMins = React.useMemo(() => normalizedSlotTimes.length < 2 ? 20 : Math.max(10, toMinutes(normalizedSlotTimes[1])-toMinutes(normalizedSlotTimes[0])), [normalizedSlotTimes]);

  const allProviders = React.useMemo(() => {
    const s = new Set<string>();
    providers.forEach(p => s.add(p));
    opdAppts.forEach(a => s.add(a.provider));
    return Array.from(s).sort((a,b) => a.localeCompare(b));
  }, [providers, opdAppts]);

  const providerMeta = React.useMemo(() => {
    const map = new Map<string,{department:string;location:string}>();
    opdAppts.forEach(a => { if (!map.has(a.provider)) map.set(a.provider,{department:a.department,location:'Main OPD Wing'}); });
    providerAvailability.forEach(e => { const ex=map.get(e.provider); map.set(e.provider,{department:ex?.department??'General Medicine',location:e.location||ex?.location||'Main OPD Wing'}); });
    allProviders.forEach(p => { if (!map.has(p)) map.set(p,{department:'General Medicine',location:'Main OPD Wing'}); });
    return map;
  }, [allProviders, opdAppts, providerAvailability]);

  const doctorOptions = React.useMemo(() => allProviders.map(p => ({ name:p, department:providerMeta.get(p)?.department??'General Medicine', location:providerMeta.get(p)?.location??'Main OPD Wing' })), [allProviders, providerMeta]);
  const specialtyOptions = React.useMemo(() => ['All',...Array.from(new Set(doctorOptions.map(d=>d.department))).sort()], [doctorOptions]);
  const filteredDoctors = React.useMemo(() => doctorOptions.filter(d => {
    if (specialtyFilter!=='All' && d.department!==specialtyFilter) return false;
    const q = doctorSearch.trim().toLowerCase();
    return !q || [d.name,d.department,d.location].some(v => v.toLowerCase().includes(q));
  }), [doctorOptions, doctorSearch, specialtyFilter]);

  React.useEffect(() => {
    if (!filteredDoctors.length) { if (selectedDoctor){setSelectedDoctor('');setSelectedSlot('');} return; }
    if (!selectedDoctor || !filteredDoctors.some(d=>d.name===selectedDoctor)) { setSelectedDoctor(filteredDoctors[0].name); setSelectedSlot(''); }
  }, [filteredDoctors, selectedDoctor]);

  const getSlotsForDate = React.useCallback((provider: string, date: string): ProviderSlot[] => {
    if (!provider||!date) return [];
    const m = new Map<string,SlotStatus>();
    normalizedSlotTimes.forEach(t => m.set(t,'Available'));
    providerAvailability.find(e=>e.provider===provider&&e.date===date)?.slots.forEach(s=>m.set(s.time,s.status));
    opdAppts.filter(a=>a.provider===provider&&a.date===date&&a.status!=='Cancelled').forEach(a=>m.set(a.time,'Booked'));
    return Array.from(m.entries()).map(([time,status])=>({time,status})).sort((a,b)=>toMinutes(a.time)-toMinutes(b.time));
  }, [opdAppts, normalizedSlotTimes, providerAvailability]);

  const providerDaySlots = React.useMemo(() => getSlotsForDate(selectedDoctor, selectedDate), [getSlotsForDate, selectedDate, selectedDoctor]);
  const visibleSlots = React.useMemo(() => {
    const todayIso = fmtIso(new Date());
    if (selectedDate!==todayIso) return providerDaySlots;
    const cur = new Date(); const curMins = cur.getHours()*60+cur.getMinutes();
    return providerDaySlots.filter(s => toMinutes(s.time)>curMins);
  }, [providerDaySlots, selectedDate]);

  React.useEffect(() => { if (!selectedSlot) return; const s=visibleSlots.find(e=>e.time===selectedSlot); if (!s||s.status!=='Available') setSelectedSlot(''); }, [visibleSlots, selectedSlot]);

  const groupedSlots = React.useMemo(() => {
    const morning:ProviderSlot[]=[], afternoon:ProviderSlot[]=[], evening:ProviderSlot[]=[];
    visibleSlots.forEach(s => { const m=toMinutes(s.time); m<720?morning.push(s):m<1020?afternoon.push(s):evening.push(s); });
    return { morning, afternoon, evening };
  }, [visibleSlots]);

  const selectedDoctorMeta = doctorOptions.find(d=>d.name===selectedDoctor)??null;

  const calendarEvents = React.useMemo<EventInput[]>(() => opdAppts
    .filter(a=>a.status!=='Cancelled')
    .filter(a=>selectedDoctor?a.provider===selectedDoctor:true)
    .map(a=>({ id:a.id, title:a.patientName, start:`${a.date}T${a.time}:00`, end:`${a.date}T${addMins(a.time,slotDurMins)}:00`, extendedProps:{status:a.status as AppointmentStatus,appointment:a} })),
  [opdAppts, selectedDoctor, slotDurMins]);

  const upcomingPreview = React.useMemo(() => portalAppointments.filter(a=>a.status==='upcoming').sort((a,b)=>new Date(`${a.date}T${parse24(a.time)}:00`).getTime()-new Date(`${b.date}T${parse24(b.time)}:00`).getTime()).slice(0,3), [portalAppointments]);

  /* ── Calendar handlers ── */
  React.useEffect(() => { calendarRef.current?.getApi().gotoDate(selectedDate); }, [selectedDate]);

  React.useEffect(() => {
    const container = calendarContainerRef.current;
    if (!container||typeof ResizeObserver==='undefined') return;
    let frame: number|null = null;
    const obs = new ResizeObserver(() => { if(frame) window.cancelAnimationFrame(frame); frame=window.requestAnimationFrame(()=>calendarRef.current?.getApi().updateSize()); });
    obs.observe(container);
    return () => { if(frame) window.cancelAnimationFrame(frame); obs.disconnect(); };
  }, []);

  /* Switch to calendar tab when "Book New" is triggered */
  const jumpToBooking = React.useCallback(() => {
    setPageView('calendar');
    window.requestAnimationFrame(() => bookingSectionRef.current?.scrollIntoView({behavior:'smooth',block:'start'}));
  }, []);

  const handleDateClick = React.useCallback((arg: DateClickArg) => {
    const d = fmtIso(arg.date); setSelectedDate(d);
    if (bookingStep<3) setBookingStep(3);
    if (selectedDoctor) {
      const t = fmtTime(arg.date);
      const s = getSlotsForDate(selectedDoctor,d).find(sl=>sl.time===t);
      const todayIso=fmtIso(new Date()); const isPast=d===todayIso&&toMinutes(t)<=(new Date().getHours()*60+new Date().getMinutes());
      if (s?.status==='Available'&&!isPast) setSelectedSlot(t);
    }
  }, [bookingStep, getSlotsForDate, selectedDoctor]);

  const handleDatesSet = React.useCallback((arg: DatesSetArg) => { setCalendarTitle(arg.view.title); setCalendarView(arg.view.type as CalendarView); }, []);
  const handleMiniCalChange = React.useCallback((v: Dayjs|null) => { if (!v) return; setSelectedDate(v.format('YYYY-MM-DD')); setSelectedSlot(''); }, []);
  const dayHeaderContent = React.useCallback((arg: {date:Date}) => {
    const name = arg.date.toLocaleDateString(undefined,{weekday:'short'}).toUpperCase();
    const num = arg.date.getDate(); const today = isSameDay(arg.date, new Date());
    return { html: `<div class="fc-scanbo-dayhead"><div class="fc-scanbo-dayname">${name}</div><div class="fc-scanbo-daynum${today?' is-today':''}">${num}</div></div>` };
  }, []);

  const handleEventClick = React.useCallback((arg: EventClickArg) => {
    const appt = (arg.event.extendedProps as {appointment?:OpdAppointment}).appointment;
    if (!appt) return;
    setSelectedCalAppt(appt); setEventAnchor(arg.el as HTMLElement);
  }, []);

  const handleRescheduleFromCal = React.useCallback(() => {
    if (!selectedCalAppt) return;
    setConsultationType('clinic');
    const dr = doctorOptions.find(d=>d.name===selectedCalAppt.provider)??doctorOptions.find(d=>d.department===selectedCalAppt.department);
    if (dr) setSelectedDoctor(dr.name);
    setSelectedDate(selectedCalAppt.date); setSelectedSlot(selectedCalAppt.time);
    setReason(selectedCalAppt.chiefComplaint||selectedCalAppt.department);
    setPhone(selectedCalAppt.phone||PATIENT.phone);
    setBookingStep(3); setSelectedCalAppt(null); setEventAnchor(null); jumpToBooking();
  }, [doctorOptions, jumpToBooking, selectedCalAppt]);

  const handleCancelFromCal = React.useCallback(() => {
    if (!selectedCalAppt) return;
    if (selectedCalAppt.status!=='Scheduled') { setSnackbar({open:true,severity:'info',message:'Only scheduled appointments can be cancelled.'}); return; }
    dispatch(updateAppointment({id:selectedCalAppt.id,changes:{status:'Cancelled'}}));
    setPortalAppointments(prev=>prev.map(a=>{
      const ok=a.date===selectedCalAppt.date&&a.doctorName===selectedCalAppt.provider&&parse24(a.time)===selectedCalAppt.time;
      return ok?{...a,status:'cancelled'}:a;
    }));
    setSelectedCalAppt(null); setEventAnchor(null);
    setSnackbar({open:true,severity:'success',message:'Appointment cancelled.'});
  }, [dispatch, selectedCalAppt]);

  /* ── Booking flow ── */
  const proceedToNextStep = React.useCallback(() => {
    if (bookingStep===1&&!consultationType) { setSnackbar({open:true,severity:'info',message:'Select consultation type.'}); return; }
    if (bookingStep===2&&!selectedDoctor) { setSnackbar({open:true,severity:'info',message:'Choose a doctor.'}); return; }
    if (bookingStep===3&&!selectedSlot) { setSnackbar({open:true,severity:'info',message:'Choose a time slot.'}); return; }
    if (bookingStep===4) {
      if (!phone.trim()) { setSnackbar({open:true,severity:'info',message:'Phone number is required.'}); return; }
      if (!reason.trim()) { setSnackbar({open:true,severity:'info',message:'Reason for visit is required.'}); return; }
    }
    setBookingStep(prev=>({1:2,2:3,3:4,4:4}[prev] as BookingStep));
  }, [bookingStep, consultationType, phone, reason, selectedDoctor, selectedSlot]);

  const goBackStep = React.useCallback(() => setBookingStep(prev=>({1:1,2:1,3:2,4:3}[prev] as BookingStep)), []);

  const handleConfirmBooking = React.useCallback(() => {
    if (!consultationType||!selectedDoctor||!selectedSlot) { setSnackbar({open:true,severity:'error',message:'Complete all booking steps.'}); return; }
    if (!phone.trim()) { setSnackbar({open:true,severity:'info',message:'Phone number required.'}); return; }
    if (!reason.trim()) { setSnackbar({open:true,severity:'info',message:'Reason for visit required.'}); return; }
    const pickedSlot = visibleSlots.find(s=>s.time===selectedSlot);
    if (!pickedSlot||pickedSlot.status!=='Available') { setBookingStep(3); setSnackbar({open:true,severity:'warning',message:'Slot no longer available.'}); return; }
    const doc = selectedDoctorMeta??{name:selectedDoctor,department:'General Medicine',location:'Main OPD Wing'};
    const mrn = `MRN-${PATIENT.pid.replace(/\D/g,'').slice(-6)||'900001'}`;
    dispatch(addAppointment({ id:`appt-portal-${Date.now()}`, date:selectedDate, time:selectedSlot, provider:doc.name, department:doc.department, patientName:PATIENT.name, mrn, ageGender:`${PATIENT.age} / ${PATIENT.gender}`, visitType:toVisitType[consultationType], status:'Scheduled', chiefComplaint:reason.trim(), payerType:'General', phone:phone.trim() }));
    const bd = new Date(`${selectedDate}T${selectedSlot}:00`);
    const newAppt: Appointment = { id:`pp-${Date.now()}`, doctorName:doc.name, department:doc.department, location:consultationType==='home'?'Home Visit':consultationType==='video'?'Virtual Consultation':consultationType==='audio'?'Audio Consultation':hospital.name, date:selectedDate, day:`${bd.getDate()}`.padStart(2,'0'), month:bd.toLocaleDateString('en-US',{month:'short'}), time:fmtLabel(selectedSlot), token:`#${Math.floor(Math.random()*90+10)}`, type:toPatientType[consultationType], patient:PATIENT.name, status:'upcoming' };
    setPortalAppointments(prev=>[newAppt,...prev]);
    setListAppointments(prev=>[{...newAppt},...prev]);
    setBookingStep(1); setConsultationType(null); setSelectedHospital(HOSPITALS[0].id); setPaying(false); setSelectedSlot(''); setReason(''); setNotes('');
    setSnackbar({open:true,severity:'success',message:`Booked for ${selectedDate} at ${fmtLabel(selectedSlot)}.`});
    setPageView('list');
  }, [consultationType, dispatch, hospital.name, phone, reason, selectedDate, selectedDoctor, selectedDoctorMeta, selectedSlot, visibleSlots]);

  /* ── List cancel ── */
  const handleCancelConfirm = React.useCallback(() => {
    if (!cancelReason.trim()) { setSnackbar({open:true,severity:'info',message:'Please provide a cancellation reason.'}); return; }
    if (!cancelTarget) return;
    setListAppointments(prev=>prev.map(a=>a.id===cancelTarget.id?{...a,status:'cancelled'}:a));
    setCancelTarget(null); setCancelReason('');
    setSnackbar({open:true,severity:'success',message:'Appointment cancelled.'});
  }, [cancelReason, cancelTarget]);

  /* ── Counts ── */
  const listCounts: Record<ListTab,number> = { upcoming:listAppointments.filter(a=>a.status==='upcoming').length, completed:listAppointments.filter(a=>a.status==='completed').length, cancelled:listAppointments.filter(a=>a.status==='cancelled').length };
  const filteredList = listAppointments.filter(a=>a.status===listTab);

  const tabTheme: Record<ListTab,{bg:string;fg:string;dateBg:string}> = {
    upcoming:  { bg:alpha(theme.palette.primary.main,0.1), fg:theme.palette.primary.dark,  dateBg:theme.palette.primary.main  },
    completed: { bg:alpha(theme.palette.success.main,0.1), fg:theme.palette.success.dark,  dateBg:theme.palette.success.main  },
    cancelled: { bg:alpha(theme.palette.error.main,0.1),   fg:theme.palette.error.dark,    dateBg:theme.palette.error.main    },
  };

  const consultationOptions: Array<{id:ConsultationType;label:string;description:string;icon:React.ReactNode}> = [
    { id:'clinic', label:'In-Clinic',  description:'Visit hospital OPD', icon:<LocalHospitalOutlinedIcon fontSize="small"/> },
    { id:'video',  label:'Video Call', description:'Secure online session', icon:<VideocamOutlinedIcon fontSize="small"/> },
    { id:'audio',  label:'Audio Call', description:'Voice call with doctor', icon:<PhoneIcon fontSize="small"/> },
    { id:'home',   label:'Home Visit', description:'Doctor visits your home', icon:<HomeRoundedIcon fontSize="small"/> },
  ];

  const calendarSx = {
    height: { xs:'70vh', md:'78vh' }, minWidth:0,
    '& .fc': { fontFamily:'Nunito, sans-serif', color:theme.palette.text.primary, '--fc-border-color':alpha(theme.palette.divider,0.15), '--fc-page-bg-color':theme.palette.background.paper, '--fc-neutral-bg-color':alpha(theme.palette.primary.main,0.04), '--fc-today-bg-color':alpha(theme.palette.primary.main,0.08) },
    '& .fc-scrollgrid': { borderColor:'transparent' },
    '& .fc-theme-standard td, & .fc-theme-standard th': { borderColor:alpha(theme.palette.divider,0.1) },
    '& .fc-col-header-cell': { backgroundColor:alpha(theme.palette.primary.main,0.06), fontWeight:600, color:theme.palette.text.primary, borderColor:alpha(theme.palette.divider,0.2) },
    '& .fc-col-header-cell-cushion': { padding:0, textDecoration:'none', color:'inherit', display:'flex', justifyContent:'center' },
    '& .fc-scanbo-dayhead': { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, padding:'10px 0 8px' },
    '& .fc-scanbo-dayname': { fontSize:'0.8rem', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700, color:theme.palette.text.secondary },
    '& .fc-scanbo-daynum': { fontSize:'1.35rem', fontWeight:700, borderRadius:'50%', width:40, height:40, display:'inline-flex', alignItems:'center', justifyContent:'center', color:theme.palette.text.primary },
    '& .fc-scanbo-daynum.is-today': { backgroundColor:theme.palette.primary.main, color:theme.palette.common.white },
    '& .fc-daygrid-day.fc-day-today, & .fc-timegrid-col.fc-day-today': { backgroundColor:alpha(theme.palette.primary.main,0.08) },
    '& .fc-event': { borderRadius:10, padding:'3px 6px', boxShadow:'none' },
    '& .fc-timegrid-event': { minHeight:34 },
    '& .fc-timegrid-event-harness, & .fc-timegrid-event-harness-inset': { left:'2px !important', right:'2px !important' },
    '& .fc-event-main': { color:theme.palette.text.primary, fontSize:'0.85rem', lineHeight:1.3, overflow:'hidden' },
    '& .fc-event-time': { fontWeight:700, fontSize:'0.8rem' },
    '& .fc-event-title': { fontWeight:700 },
    '& .fc-timegrid-slot-label': { color:theme.palette.text.secondary, fontSize:'0.8rem' },
    '& .fc-timegrid-axis': { borderColor:alpha(theme.palette.divider,0.2), color:theme.palette.text.secondary, fontSize:'0.8rem' },
    '& .fc-timegrid-slot': { borderColor:alpha(theme.palette.divider,0.2), height:36 },
    '& .fc-timegrid-slot-minor': { borderColor:'transparent' },
    '& .fc-timegrid-now-indicator-line': { borderColor:theme.palette.primary.main },
  };

  const btnSx = { textTransform:'none' as const, fontSize:11, fontWeight:700, borderRadius:1.5, minHeight:28, px:1.5 };

  return (
    <PatientPortalWorkspaceCard current="my-appointments">

      {/* ── View switcher tabs — always at the top ── */}
      <Box sx={{ borderBottom:'1px solid', borderColor:'divider', mb:2, bgcolor:'background.paper', mx:{xs:-2,sm:-3}, px:{xs:1,sm:2} }}>
        <Tabs value={pageView} onChange={(_,v)=>setPageView(v)}
          sx={{ '& .MuiTab-root':{ textTransform:'none', fontWeight:600, fontSize:13, minHeight:44 }, '& .MuiTabs-indicator':{ height:3, borderRadius:'3px 3px 0 0' } }}>
          <Tab value="list"     label="My Appointments" icon={<ListIcon sx={{fontSize:16}}/>} iconPosition="start" />
          <Tab value="calendar" label="Book / Calendar"  icon={<CalendarMonthIcon sx={{fontSize:16}}/>} iconPosition="start" />
        </Tabs>
      </Box>

      {/* ══════════════════════════ LIST VIEW ══════════════════════════ */}
      {pageView === 'list' && (
        <>
        {/* ── Stat tiles — only shown in list view ── */}
        <Box sx={{ display:'grid', gap:1.5, gridTemplateColumns:{ xs:'1fr', sm:'repeat(3, 1fr)' }, mb:2 }}>
          <StatTile label="Upcoming"  value={listCounts.upcoming}  subtitle="Scheduled visits"  tone="primary" variant="soft" icon={<CalendarMonthIcon fontSize="small"/>} />
          <StatTile label="Completed" value={listCounts.completed} subtitle="Visits done"        tone="success" variant="soft" icon={<CheckCircleOutlineIcon fontSize="small"/>} />
          <StatTile label="Cancelled" value={listCounts.cancelled} subtitle="Cancelled visits"   tone="warning" variant="soft" icon={<EventBusyIcon fontSize="small"/>} />
        </Box>
        <Card elevation={0} sx={sectionCard}>
          <Box sx={sectionHeader}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarMonthIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight:700 }}>My Appointments</Typography>
              </Stack>
              <Stack direction="row" spacing={0.75} flexWrap="wrap">
                <Button size="small" variant="contained" disableElevation onClick={()=>setPageView('calendar')}
                  sx={{ textTransform:'none', fontSize:12, fontWeight:700, borderRadius:5, minHeight:28, px:1.75 }}>
                  + Book New
                </Button>
                {(['upcoming','completed','cancelled'] as ListTab[]).map(tab => {
                  const active = tab === listTab;
                  return (
                    <Button key={tab} size="small" variant={active?'contained':'outlined'} disableElevation onClick={()=>setListTab(tab)}
                      sx={{ textTransform:'none', fontSize:12, fontWeight:active?700:500, borderRadius:5, minHeight:28, px:1.75, borderColor:active?'transparent':alpha(theme.palette.primary.main,0.2) }}>
                      {capitalize(tab)} ({listCounts[tab]})
                    </Button>
                  );
                })}
              </Stack>
            </Stack>
          </Box>

          <Stack spacing={1.25} sx={{ p:2 }}>
            {filteredList.length === 0 ? (
              <Alert severity="info">No {listTab} appointments.</Alert>
            ) : (
              filteredList.map(appt => {
                const pal = tabTheme[appt.status as ListTab];
                return (
                  <Box key={appt.id} sx={innerCard}>
                    <Stack direction={{xs:'column',sm:'row'}} alignItems={{xs:'flex-start',sm:'center'}} spacing={1.5}>
                      <Box sx={{ width:52, height:56, borderRadius:1.5, backgroundColor:pal.dateBg, color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Typography sx={{ fontSize:20, fontWeight:800, lineHeight:1 }}>{appt.day}</Typography>
                        <Typography sx={{ fontSize:10, fontWeight:600, textTransform:'uppercase' }}>{appt.month}</Typography>
                      </Box>
                      <Box sx={{ flex:1, minWidth:0 }}>
                        <Typography variant="body2" sx={{ fontWeight:700 }}>{appt.doctorName}</Typography>
                        <Typography variant="caption" color="text.secondary">{appt.department} · {appt.location} · Token {appt.token}</Typography>
                        <Typography variant="caption" display="block" color="text.secondary">{appt.time} · {capitalize(appt.type)} · {appt.patient}</Typography>
                      </Box>
                      <Stack direction={{xs:'row',sm:'column'}} alignItems={{xs:'center',sm:'flex-end'}} spacing={0.75} sx={{ flexShrink:0 }}>
                        <Chip label={capitalize(appt.status)} size="small" sx={{ height:22, fontSize:11, fontWeight:700, backgroundColor:pal.bg, color:pal.fg }} />
                        {appt.status==='upcoming' && (
                          <Stack direction="row" spacing={0.75}>
                            <Button size="small" variant="outlined" color="primary" sx={btnSx} onClick={()=>{ setPageView('calendar'); }}>Reschedule</Button>
                            <Button size="small" variant="outlined" color="error" sx={btnSx} onClick={()=>{ setCancelTarget(appt); setCancelReason(''); }}>Cancel</Button>
                          </Stack>
                        )}
                        {appt.status==='completed' && (
                          <Stack direction="row" spacing={0.75}>
                            <Button size="small" variant="outlined" color="primary" sx={btnSx}>View Report</Button>
                            <Button size="small" variant="outlined" color="primary" sx={btnSx} onClick={()=>setPageView('calendar')}>Rebook</Button>
                          </Stack>
                        )}
                        {appt.status==='cancelled' && (
                          <Button size="small" variant="outlined" color="primary" sx={btnSx} onClick={()=>setPageView('calendar')}>Rebook</Button>
                        )}
                      </Stack>
                    </Stack>
                  </Box>
                );
              })
            )}
          </Stack>
        </Card>
        </>
      )}

      {/* ══════════════════════════ CALENDAR + BOOKING VIEW ══════════════════════════ */}
      {pageView === 'calendar' && (
        <Box ref={bookingSectionRef}>
          {opdStatus==='error' && <Alert severity="warning" sx={{mb:2}}>OPD data feed unavailable. Running on fallback slots.</Alert>}

          <Box sx={{ display:'grid', gap:1.5, gridTemplateColumns:{ xs:'1fr', lg:'minmax(0,1fr) 430px', xl:'minmax(0,1fr) 460px' } }}>

            {/* ── FullCalendar ── */}
            <Card elevation={0} sx={{ border:'none', borderRadius:2, overflow:'hidden', backgroundColor:'transparent', boxShadow:'none' }}>
              <Stack spacing={1}>
                {/* Calendar toolbar */}
                <Stack direction={{xs:'column',md:'row'}} spacing={1.3} alignItems={{xs:'stretch',md:'center'}} justifyContent="space-between"
                  sx={{ p:1.5, pb:1, position:'sticky', top:0, zIndex:4, backdropFilter:'blur(6px)', borderBottom:'1px solid', borderColor:alpha(theme.palette.divider,0.2), backgroundColor:alpha(theme.palette.primary.main,0.03) }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button size="small" variant="outlined" onClick={()=>{ calendarRef.current?.getApi().today(); setSelectedDate(fmtIso(new Date())); }}
                      sx={{ borderRadius:999, textTransform:'none', fontWeight:700 }}>Today</Button>
                    <IconButton size="small" onClick={()=>calendarRef.current?.getApi().prev()} sx={{ border:'1px solid', borderColor:'divider' }}><ChevronLeftIcon fontSize="small"/></IconButton>
                    <IconButton size="small" onClick={()=>calendarRef.current?.getApi().next()} sx={{ border:'1px solid', borderColor:'divider' }}><ChevronRightIcon fontSize="small"/></IconButton>
                    <Typography variant="subtitle2" sx={{ fontWeight:700 }}>{calendarTitle||'Calendar'}</Typography>
                  </Stack>
                  <TextField size="small" select label="View" value={calendarView}
                    onChange={e=>{ const v=e.target.value as CalendarView; setCalendarView(v); calendarRef.current?.getApi().changeView(v); }} sx={{ minWidth:130 }}>
                    <MenuItem value="timeGridWeek">Week</MenuItem>
                    <MenuItem value="timeGridDay">Day</MenuItem>
                  </TextField>
                </Stack>

                {/* Calendar grid */}
                <Box ref={calendarContainerRef} sx={calendarSx}>
                  <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin,timeGridPlugin,interactionPlugin]}
                    initialView={calendarView}
                    initialDate={selectedDate}
                    headerToolbar={false}
                    height="100%"
                    slotMinTime="00:00:00"
                    slotMaxTime="24:00:00"
                    scrollTime="00:00:00"
                    nowIndicator allDaySlot={false} dayMaxEvents expandRows
                    stickyHeaderDates stickyFooterScrollbar
                    slotEventOverlap={false} eventOverlap={false}
                    eventMaxStack={2} eventMinHeight={34} eventShortHeight={34}
                    slotDuration={`${`${Math.floor(slotDurMins/60)}`.padStart(2,'0')}:${`${slotDurMins%60}`.padStart(2,'0')}:00`}
                    slotLabelInterval={{ hours:1 }}
                    slotLabelFormat={{ hour:'numeric', minute:'2-digit', meridiem:'short', omitZeroMinute:true }}
                    eventTimeFormat={{ hour:'numeric', minute:'2-digit', meridiem:'short' }}
                    events={calendarEvents}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    datesSet={handleDatesSet}
                    dayHeaderContent={dayHeaderContent}
                    eventContent={(arg: EventContentArg) => {
                      const s=arg.event.start?fmtTime(arg.event.start):null, e=arg.event.end?fmtTime(arg.event.end):null;
                      const tr=s&&e?`${fmtCompact(s)} - ${fmtCompact(e)}`:arg.timeText;
                      return (<div style={{display:'flex',flexDirection:'column',gap:2}}><span style={{fontSize:11,fontWeight:700,lineHeight:1.1}}>{tr}</span><span style={{fontSize:11,fontWeight:600,lineHeight:1.15}}>{arg.event.title}</span></div>);
                    }}
                    eventDidMount={(info) => {
                      const appt=(info.event.extendedProps as {appointment?:OpdAppointment}).appointment;
                      const status=appt?.status??(info.event.extendedProps as {status?:AppointmentStatus}).status;
                      const color=status?statusColor(status,theme.palette):theme.palette.primary.main;
                      info.el.style.backgroundColor=alpha(color,0.22); info.el.style.border=`1px solid ${alpha(color,0.55)}`;
                      info.el.style.color=theme.palette.text.primary; info.el.style.borderRadius='10px';
                      info.el.style.boxShadow=`0 1px 2px ${alpha(color,0.2)}`; info.el.style.cursor='pointer';
                    }}
                  />
                </Box>
              </Stack>
            </Card>

            {/* ── Right: booking stepper + upcoming preview ── */}
            <Stack spacing={1.5}>
              {/* Booking panel */}
              <Card elevation={0} sx={{ border:'none', borderRadius:2, overflow:'hidden', backgroundColor:'transparent', boxShadow:'none' }}>
                <Box sx={{ px:1.5, py:1.25, borderBottom:'1px solid', borderColor:alpha(theme.palette.primary.main,0.12), backgroundColor:alpha(theme.palette.primary.main,0.04) }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" sx={{ fontWeight:700 }}>Book Appointment</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight:700 }}>Step {bookingStep} of {BOOKING_STEPS.length}</Typography>
                  </Stack>
                </Box>

                <Box sx={{ p:1.5 }}>
                  {/* Step indicators */}
                  <Box sx={{ display:'flex', alignItems:'center', mb:1.8, px:0.2 }}>
                    {BOOKING_STEPS.map((step,i) => {
                      const done=step.id<bookingStep, active=step.id===bookingStep;
                      return (
                        <React.Fragment key={step.id}>
                          <Box sx={{ width:26, height:26, borderRadius:'50%', border:'1px solid', borderColor:done||active?'primary.main':alpha(theme.palette.text.disabled,0.5), backgroundColor:done||active?'primary.main':'transparent', color:done||active?'#fff':'text.secondary', fontSize:11, fontWeight:700, display:'grid', placeItems:'center' }}>
                            {done?'✓':step.id}
                          </Box>
                          {i<BOOKING_STEPS.length-1&&<Box sx={{ flex:1, minWidth:20, height:1.5, mx:0.7, borderRadius:999, backgroundColor:step.id<bookingStep?theme.palette.primary.main:alpha(theme.palette.text.disabled,0.45) }}/>}
                        </React.Fragment>
                      );
                    })}
                  </Box>

                  {/* Step 1 — Hospital + Type */}
                  {bookingStep===1&&(
                    <Stack spacing={1}>
                      <Typography variant="caption" sx={{ fontWeight:800, letterSpacing:0.5, color:'text.secondary' }}>SELECT HOSPITAL</Typography>
                      <FormControl fullWidth size="small">
                        <InputLabel>Hospital</InputLabel>
                        <Select value={selectedHospital} label="Hospital" onChange={e=>setSelectedHospital(e.target.value as string)}>
                          {HOSPITALS.map(h=>(
                            <MenuItem key={h.id} value={h.id}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width:'100%'}}>
                                <Typography variant="body2">{h.name}</Typography>
                                <Chip size="small" label={h.requiresPay?`₹${h.fee}`:'Free'} sx={{ ml:1, fontWeight:700, fontSize:10, bgcolor:h.requiresPay?alpha(theme.palette.warning.main,0.12):alpha(theme.palette.success.main,0.12), color:h.requiresPay?'warning.dark':'success.dark' }}/>
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {hospital.requiresPay&&(
                        <Box sx={{ px:1.25, py:0.75, borderRadius:1.5, bgcolor:alpha(theme.palette.warning.main,0.07), border:'1px solid', borderColor:alpha(theme.palette.warning.main,0.25) }}>
                          <Typography variant="caption" sx={{ fontWeight:600, color:'warning.dark' }}>Consultation fee: <strong>₹{hospital.fee}</strong> — payment required at confirmation</Typography>
                        </Box>
                      )}
                      <Typography variant="caption" sx={{ fontWeight:800, letterSpacing:0.5, color:'text.secondary', pt:0.5 }}>CONSULTATION TYPE</Typography>
                      {consultationOptions.map(opt=>{
                        const sel=consultationType===opt.id;
                        return (
                          <Box key={opt.id} onClick={()=>setConsultationType(opt.id)} sx={{ p:1.2, borderRadius:1.5, border:'1.5px solid', borderColor:sel?'primary.main':'divider', backgroundColor:sel?alpha(theme.palette.primary.main,0.08):'transparent', cursor:'pointer', transition:'all .15s ease', '&:hover':{ borderColor:alpha(theme.palette.primary.main,0.55), backgroundColor:alpha(theme.palette.primary.main,0.05) } }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box sx={{ width:28, height:28, borderRadius:1, display:'grid', placeItems:'center', backgroundColor:alpha(theme.palette.primary.main,0.12), color:'primary.main' }}>{opt.icon}</Box>
                              <Box sx={{ flex:1 }}>
                                <Typography variant="body2" sx={{ fontWeight:700 }}>{opt.label}</Typography>
                                <Typography variant="caption" color="text.secondary">{opt.description}</Typography>
                              </Box>
                              <Chip size="small" label={sel?'Selected':'Select'} color={sel?'primary':'default'} variant={sel?'filled':'outlined'} sx={{ height:22, fontSize:11, fontWeight:700 }}/>
                            </Stack>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}

                  {/* Step 2 — Doctor */}
                  {bookingStep===2&&(
                    <Stack spacing={1}>
                      <Typography variant="caption" sx={{ fontWeight:800, letterSpacing:0.5, color:'text.secondary' }}>CHOOSE DOCTOR</Typography>
                      <Stack direction={{xs:'column',sm:'row'}} spacing={1}>
                        <TextField size="small" label="Search doctor" placeholder="Name, specialty or location" value={doctorSearch} onChange={e=>setDoctorSearch(e.target.value)} sx={{ flex:1 }}/>
                        <TextField size="small" select label="Specialty" value={specialtyFilter} onChange={e=>setSpecialtyFilter(e.target.value)} sx={{ minWidth:{xs:'100%',sm:170} }}>
                          {specialtyOptions.map(o=><MenuItem key={o} value={o}>{o}</MenuItem>)}
                        </TextField>
                      </Stack>
                      <Box sx={{ maxHeight:300, overflowY:'auto', pr:0.4 }}>
                        <Stack spacing={1}>
                          {filteredDoctors.length===0?(
                            <Box sx={{ p:1.1, borderRadius:1.5, border:'1px dashed', borderColor:'divider' }}>
                              <Typography variant="caption" color="text.secondary">No doctors found.</Typography>
                            </Box>
                          ):(
                            filteredDoctors.map(doc=>{
                              const sel=selectedDoctor===doc.name;
                              return (
                                <Box key={doc.name} onClick={()=>{ setSelectedDoctor(doc.name); setSelectedSlot(''); }} sx={{ p:1.1, borderRadius:1.5, border:'1.5px solid', borderColor:sel?'primary.main':'divider', backgroundColor:sel?alpha(theme.palette.primary.main,0.08):'transparent', cursor:'pointer' }}>
                                  <Typography variant="body2" sx={{ fontWeight:700 }}>{doc.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">{doc.department} · {doc.location}</Typography>
                                </Box>
                              );
                            })
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  )}

                  {/* Step 3 — Date + Slot */}
                  {bookingStep===3&&(
                    <Stack spacing={1.2}>
                      <Box sx={{ p:1.15, borderRadius:1.5, border:'1px solid', borderColor:alpha(theme.palette.primary.main,0.34), background:`linear-gradient(135deg, ${alpha(theme.palette.primary.dark,0.94)} 0%, ${alpha(theme.palette.primary.main,0.9)} 100%)`, color:theme.palette.common.white }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width:26, height:26, borderRadius:1, display:'grid', placeItems:'center', bgcolor:alpha(theme.palette.common.white,0.14), color:theme.palette.common.white, flexShrink:0 }}><CalendarMonthOutlinedIcon sx={{fontSize:16}}/></Box>
                          <Box sx={{ flex:1, minWidth:0 }}>
                            <Typography variant="caption" sx={{ fontWeight:700, color:alpha(theme.palette.common.white,0.8) }}>Selected</Typography>
                            <Typography variant="body2" sx={{ fontWeight:800, color:theme.palette.common.white }}>{new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US',{weekday:'short',month:'long',day:'numeric'})}</Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color:alpha(theme.palette.common.white,0.82), textAlign:'right', lineHeight:1.2 }}>Click calendar<br/>to change</Typography>
                        </Stack>
                      </Box>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateCalendar value={selectedDate?dayjs(selectedDate):null} onChange={handleMiniCalChange} showDaysOutsideCurrentMonth disablePast minDate={dayjs().startOf('day')}
                          sx={{ height:'auto', minHeight:0, borderRadius:0, border:'none', backgroundColor:'transparent', p:0, alignSelf:'stretch', width:'100%', maxWidth:'100%', '& .MuiDateCalendar-viewTransitionContainer':{ minHeight:0 }, '& .MuiPickersCalendarHeader-root':{ px:0, mb:0.4, justifyContent:'space-between' }, '& .MuiPickersCalendarHeader-label':{ fontWeight:700, fontSize:'0.8rem', letterSpacing:'0.08em', textTransform:'uppercase' }, '& .MuiPickersArrowSwitcher-root .MuiIconButton-root':{ border:'none', bgcolor:'transparent', width:26, height:26 }, '& .MuiDayCalendar-header':{ mx:0, mb:0.2, justifyContent:'space-between' }, '& .MuiDayCalendar-root':{ minHeight:0 }, '& .MuiDayCalendar-weekContainer':{ margin:0, justifyContent:'space-between' }, '& .MuiDayCalendar-monthContainer':{ minHeight:0 }, '& .MuiDayCalendar-slideTransition':{ minHeight:0 }, '& .MuiDayCalendar-weekDayLabel':{ width:24, height:24, fontSize:'0.66rem', fontWeight:700, color:theme.palette.text.secondary }, '& .MuiPickersDay-root':{ width:26, height:26, margin:0, fontSize:'0.72rem', borderRadius:7 }, '& .MuiPickersSlideTransition-root':{ minHeight:132 }, '& .MuiPickersDay-root.Mui-selected':{ backgroundColor:'primary.main', color:theme.palette.common.white }, '& .MuiPickersDay-root.MuiPickersDay-today':{ border:`1px solid ${alpha(theme.palette.primary.main,0.6)}` } }}
                        />
                      </LocalizationProvider>
                      {selectedDoctorMeta&&(
                        <Box sx={{ p:1.05, borderRadius:1.4, border:'1px solid', borderColor:alpha(theme.palette.primary.main,0.24), backgroundColor:alpha(theme.palette.background.paper,0.88) }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width:28, height:28, borderRadius:1, display:'grid', placeItems:'center', bgcolor:alpha(theme.palette.warning.main,0.2), color:theme.palette.warning.dark, flexShrink:0 }}><MedicalServicesOutlinedIcon sx={{fontSize:16}}/></Box>
                            <Box sx={{ flex:1, minWidth:0 }}><Typography variant="body2" sx={{ fontWeight:700, lineHeight:1.2 }}>{selectedDoctorMeta.name}</Typography><Typography variant="caption" color="text.secondary">{selectedDoctorMeta.department}</Typography></Box>
                          </Stack>
                        </Box>
                      )}
                      <Typography variant="caption" sx={{ fontWeight:800, letterSpacing:0.5, color:alpha(theme.palette.primary.main,0.78) }}>AVAILABLE SLOTS</Typography>
                      {[{key:'morning',title:'MORNING',icon:<WbSunnyRoundedIcon sx={{fontSize:14,color:theme.palette.warning.main}}/>,slots:groupedSlots.morning},{key:'afternoon',title:'AFTERNOON',icon:<CloudQueueRoundedIcon sx={{fontSize:14,color:theme.palette.info.main}}/>,slots:groupedSlots.afternoon},{key:'evening',title:'EVENING',icon:<NightsStayRoundedIcon sx={{fontSize:14,color:theme.palette.warning.dark}}/>,slots:groupedSlots.evening}].map(grp=>(
                        <Box key={grp.key}>
                          <Stack direction="row" spacing={0.45} alignItems="center">{grp.icon}<Typography variant="caption" sx={{ fontWeight:800, letterSpacing:0.3, color:alpha(theme.palette.primary.main,0.65) }}>{grp.title}</Typography></Stack>
                          <Box sx={{ mt:0.6, display:'flex', flexWrap:'wrap', gap:0.7 }}>
                            {grp.slots.length===0?<Typography variant="caption" color="text.secondary">No slots</Typography>:grp.slots.map(slot=>{
                              const sel=selectedSlot===slot.time, dis=slot.status!=='Available', booked=slot.status==='Booked', brk=slot.status==='Break'||slot.status==='Blocked';
                              return (
                                <Button key={`${grp.key}-${slot.time}`} size="small" onClick={()=>{ if (!dis) setSelectedSlot(slot.time); }}
                                  sx={{ minHeight:30, minWidth:48, px:1.1, textTransform:'none', fontSize:12, fontWeight:sel?800:700, borderRadius:1.4, border:'1px solid', borderColor:sel?'primary.main':booked?alpha(theme.palette.text.secondary,0.3):brk?alpha(theme.palette.warning.main,0.45):alpha(theme.palette.primary.main,0.22), backgroundColor:sel?theme.palette.primary.main:booked?alpha(theme.palette.text.secondary,0.08):brk?alpha(theme.palette.warning.main,0.12):alpha(theme.palette.background.paper,0.85), color:sel?theme.palette.common.white:booked?theme.palette.text.secondary:brk?theme.palette.warning.dark:theme.palette.text.primary, opacity:dis&&!sel?0.72:1, textDecoration:booked?'line-through':'none' }}>
                                  {fmtChip(slot.time)}
                                </Button>
                              );
                            })}
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  )}

                  {/* Step 4 — Details */}
                  {bookingStep===4&&(
                    <Stack spacing={1.1}>
                      <Box sx={{ display:'flex', alignItems:'center', gap:1, px:1.2, py:1, borderRadius:2, border:'1px solid', borderColor:alpha(theme.palette.primary.main,0.2), bgcolor:alpha(theme.palette.primary.main,0.06) }}>
                        <Avatar sx={{ width:34, height:34, fontSize:'0.8rem', bgcolor:alpha(theme.palette.primary.main,0.18), color:theme.palette.primary.main, fontWeight:700 }}>
                          {PATIENT.name.split(' ').filter(Boolean).slice(0,2).map(p=>p[0]?.toUpperCase()).join('')}
                        </Avatar>
                        <Box sx={{ minWidth:0 }}><Typography variant="subtitle2" sx={{ fontWeight:700, lineHeight:1.2 }}>{PATIENT.name}</Typography><Typography variant="caption" color="text.secondary">MRN {PATIENT.pid}</Typography></Box>
                      </Box>
                      <TextField size="small" label="Phone" value={phone} onChange={e=>setPhone(e.target.value)}/>
                      <TextField size="small" label="Reason for Visit" value={reason} onChange={e=>setReason(e.target.value)} multiline minRows={2}/>
                      <TextField size="small" label="Additional Notes" value={notes} onChange={e=>setNotes(e.target.value)} multiline minRows={2}/>
                      {consultationType==='home'&&<TextField size="small" label="Home Address" value={homeAddress} onChange={e=>setHomeAddress(e.target.value)} multiline minRows={2}/>}
                      {hospital.requiresPay?(
                        <Box sx={{ p:1.25, borderRadius:1.5, bgcolor:alpha(theme.palette.warning.main,0.07), border:'1px solid', borderColor:alpha(theme.palette.warning.main,0.25) }}>
                          <Typography variant="caption" sx={{ fontWeight:700, color:'warning.dark', display:'block', mb:0.25 }}>Payment Required — {hospital.name}</Typography>
                          <Typography variant="caption" color="text.secondary">Fee: <strong>₹{hospital.fee}</strong>. Click "Pay & Confirm".</Typography>
                        </Box>
                      ):(
                        <Box sx={{ p:1.25, borderRadius:1.5, bgcolor:alpha(theme.palette.success.main,0.06), border:'1px solid', borderColor:alpha(theme.palette.success.main,0.2) }}>
                          <Typography variant="caption" sx={{ fontWeight:700, color:'success.dark' }}>No payment required — confirm directly.</Typography>
                        </Box>
                      )}
                    </Stack>
                  )}

                  {/* Nav buttons */}
                  <Stack direction="row" spacing={1} sx={{ mt:1.8 }}>
                    {bookingStep>1&&<Button variant="outlined" onClick={goBackStep} sx={{ flex:1, textTransform:'none', fontWeight:700 }}>Back</Button>}
                    {bookingStep<4?(
                      <Button variant="contained" onClick={proceedToNextStep} sx={{ flex:1, textTransform:'none', fontWeight:700 }}>Continue</Button>
                    ):hospital.requiresPay?(
                      <Button variant="contained" color="warning" disabled={paying}
                        onClick={()=>{ setPaying(true); setTimeout(()=>{ setPaying(false); handleConfirmBooking(); },1000); }}
                        startIcon={<CreditCardIcon sx={{fontSize:15}}/>} sx={{ flex:1, textTransform:'none', fontWeight:700 }}>
                        {paying?'Processing…':`Pay ₹${hospital.fee} & Confirm`}
                      </Button>
                    ):(
                      <Button variant="contained" color="success" onClick={handleConfirmBooking} sx={{ flex:1, textTransform:'none', fontWeight:700 }}>Confirm Appointment</Button>
                    )}
                  </Stack>
                </Box>
              </Card>

              {/* Upcoming preview */}
              <Card elevation={0} sx={{ border:'none', borderRadius:2, overflow:'hidden', backgroundColor:'transparent', boxShadow:'none' }}>
                <Box sx={{ px:1.5, py:1.15, borderBottom:'1px solid', borderColor:alpha(theme.palette.primary.main,0.12), backgroundColor:alpha(theme.palette.primary.main,0.04) }}>
                  <Typography variant="subtitle2" sx={{ fontWeight:700 }}>Upcoming ({listCounts.upcoming})</Typography>
                </Box>
                <Stack spacing={0} sx={{ px:1.5, py:0.5 }}>
                  {upcomingPreview.length===0?(
                    <Typography variant="caption" color="text.secondary" sx={{ py:1.25 }}>No upcoming appointments.</Typography>
                  ):(
                    upcomingPreview.map((appt,i)=>(
                      <Stack key={appt.id} direction="row" spacing={1} alignItems="center" sx={{ py:0.95, borderBottom:i===upcomingPreview.length-1?'none':'1px solid', borderColor:'divider' }}>
                        <Box sx={{ width:7, height:7, borderRadius:'50%', backgroundColor:theme.palette.primary.main, flexShrink:0 }}/>
                        <Box sx={{ minWidth:0, flex:1 }}>
                          <Typography variant="caption" sx={{ fontWeight:700 }}>{appt.doctorName}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block">{appt.time} · {appt.month} {appt.day}</Typography>
                        </Box>
                        <Button size="small" variant="text" sx={{ textTransform:'none', fontSize:11, minWidth:0 }} onClick={()=>setPageView('calendar')}>Rebook</Button>
                      </Stack>
                    ))
                  )}
                </Stack>
              </Card>
            </Stack>
          </Box>

          {/* Event popover */}
          <Popover open={Boolean(selectedCalAppt&&eventAnchor)} anchorEl={eventAnchor}
            onClose={()=>{ setSelectedCalAppt(null); setEventAnchor(null); }}
            anchorOrigin={{vertical:'top',horizontal:'right'}} transformOrigin={{vertical:'top',horizontal:'left'}} marginThreshold={24}
            PaperProps={{ sx:{ p:2, borderRadius:3, minWidth:280, maxWidth:360, width:'max-content', maxHeight:'70vh', overflowY:'auto', border:'1px solid', borderColor:alpha(theme.palette.primary.main,0.25), boxShadow:'0 18px 40px rgba(15,23,42,0.18)', position:'relative', overflow:'hidden', backgroundColor:theme.palette.common.white, '&:before':{ content:'""', position:'absolute', top:0, left:0, width:6, height:'100%', background:theme.palette.primary.main } } }}>
            {selectedCalAppt&&(
              <Stack spacing={1}>
                <Typography variant="subtitle1" sx={{ fontWeight:700 }}>{selectedCalAppt.patientName}</Typography>
                <Typography variant="caption" color="text.secondary">{selectedCalAppt.date} · {fmtLabel(selectedCalAppt.time)} · {selectedCalAppt.provider}</Typography>
                <Divider/>
                <Typography variant="body2"><strong>Status:</strong> {selectedCalAppt.status}</Typography>
                <Typography variant="body2"><strong>Department:</strong> {selectedCalAppt.department}</Typography>
                <Typography variant="body2"><strong>MRN:</strong> {selectedCalAppt.mrn}</Typography>
                <Typography variant="body2"><strong>Complaint:</strong> {selectedCalAppt.chiefComplaint||'Not specified'}</Typography>
                <Divider/>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" onClick={handleRescheduleFromCal} sx={{ textTransform:'none' }}>Reschedule</Button>
                  <Button size="small" variant="outlined" color="error" onClick={handleCancelFromCal} disabled={selectedCalAppt.status!=='Scheduled'} sx={{ textTransform:'none' }}>Cancel</Button>
                </Stack>
              </Stack>
            )}
          </Popover>
        </Box>
      )}

      {/* ── Cancel Dialog ── */}
      <Dialog open={!!cancelTarget} onClose={()=>setCancelTarget(null)} maxWidth="xs" fullWidth PaperProps={{sx:{borderRadius:3}}}>
        <DialogTitle sx={{ fontWeight:800, pb:0.5, borderBottom:'1px solid', borderColor:'divider' }}>Cancel Appointment</DialogTitle>
        <DialogContent sx={{ pt:'16px !important' }}>
          {cancelTarget&&(
            <Box sx={{ mb:1.75, p:1.25, borderRadius:1.5, bgcolor:alpha(theme.palette.error.main,0.05), border:'1px solid', borderColor:alpha(theme.palette.error.main,0.18) }}>
              <Typography variant="body2" sx={{ fontWeight:700 }}>{cancelTarget.doctorName}</Typography>
              <Typography variant="caption" color="text.secondary">{cancelTarget.date} · {cancelTarget.time} · {cancelTarget.location}</Typography>
            </Box>
          )}
          <TextField size="small" label="Reason for Cancellation" fullWidth multiline minRows={3}
            placeholder="Please tell us why you are cancelling…"
            value={cancelReason} onChange={e=>setCancelReason(e.target.value)}/>
          <Typography variant="caption" color="text.secondary" sx={{ display:'block', mt:1 }}>Cancellations within 2 hours may be subject to a fee.</Typography>
        </DialogContent>
        <DialogActions sx={{ px:2.5, pb:2 }}>
          <Button onClick={()=>setCancelTarget(null)} sx={{ textTransform:'none', fontWeight:600 }}>Back</Button>
          <Button variant="contained" color="error" disableElevation onClick={handleCancelConfirm} sx={{ textTransform:'none', fontWeight:700 }}>Cancel Appointment</Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={()=>setSnackbar(p=>({...p,open:false}))} anchorOrigin={{vertical:'top',horizontal:'right'}}>
        <Alert severity={snackbar.severity} onClose={()=>setSnackbar(p=>({...p,open:false}))} sx={{width:'100%'}}>{snackbar.message}</Alert>
      </Snackbar>
    </PatientPortalWorkspaceCard>
  );
}
