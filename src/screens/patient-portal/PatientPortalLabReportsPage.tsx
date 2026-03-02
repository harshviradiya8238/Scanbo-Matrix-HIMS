'use client';

import React from 'react';
import {
  Box, Button, Chip, Stack, Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { cardShadow } from '@/src/core/theme/tokens';
import { alpha, useTheme } from '@/src/ui/theme';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Divider from '@mui/material/Divider';
import {
  CalendarMonth as CalendarMonthIcon,
  Chat as ChatIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Download as DownloadIcon,
  FavoriteBorder as HeartIcon,
  MonitorHeart as MonitorHeartIcon,
  Print as PrintIcon,
  Science as ScienceIcon,
  Search as SearchIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import PatientPortalWorkspaceCard from './components/PatientPortalWorkspaceCard';
import { ppSectionCard } from './patient-portal-styles';
import { useRouter } from 'next/navigation';

/* ─── Rich lab data ─────────────────────────────────────────── */
interface LabResult {
  name: string;
  value: number | string;
  unit: string;
  range: string;
  status: 'normal' | 'high' | 'low';
}
interface LabReport {
  id: string;
  date: string;
  type: string;
  doctor: string;
  status: 'Normal' | 'Review' | 'Abnormal';
  category: string;
  results: LabResult[];
  notes: string;
}

const LAB_DATA: LabReport[] = [
  {
    id: 'LR-2026-001', date: '2026-02-20', type: 'Complete Blood Count (CBC)',
    doctor: 'Dr. Sneha Rao', status: 'Normal', category: 'Hematology',
    results: [
      { name: 'WBC',        value: 7.2,  unit: 'K/uL',  range: '4.5–11.0', status: 'normal' },
      { name: 'RBC',        value: 4.8,  unit: 'M/uL',  range: '4.2–5.4',  status: 'normal' },
      { name: 'Hemoglobin', value: 13.5, unit: 'g/dL',  range: '13.5–17.5',status: 'normal' },
      { name: 'Hematocrit', value: 42.1, unit: '%',     range: '37–47',    status: 'normal' },
      { name: 'Platelets',  value: 285,  unit: 'K/uL',  range: '150–400',  status: 'normal' },
      { name: 'MCV',        value: 88,   unit: 'fL',    range: '80–100',   status: 'normal' },
    ],
    notes: 'All values within normal range. No concerns.',
  },
  {
    id: 'LR-2026-002', date: '2026-02-20', type: 'Comprehensive Metabolic Panel',
    doctor: 'Dr. Sneha Rao', status: 'Review', category: 'Chemistry',
    results: [
      { name: 'Glucose (F)',  value: 108, unit: 'mg/dL', range: '70–99',   status: 'high'   },
      { name: 'BUN',          value: 18,  unit: 'mg/dL', range: '7–25',    status: 'normal' },
      { name: 'Creatinine',   value: 0.9, unit: 'mg/dL', range: '0.6–1.2', status: 'normal' },
      { name: 'Sodium',       value: 140, unit: 'mEq/L', range: '136–145', status: 'normal' },
      { name: 'Potassium',    value: 4.1, unit: 'mEq/L', range: '3.5–5.1', status: 'normal' },
      { name: 'ALT',          value: 32,  unit: 'U/L',   range: '7–56',    status: 'normal' },
    ],
    notes: 'Glucose mildly elevated. Monitor fasting glucose. Lifestyle modifications advised.',
  },
  {
    id: 'LR-2026-003', date: '2026-02-20', type: 'Lipid Panel',
    doctor: 'Dr. Priya Sharma', status: 'Abnormal', category: 'Cardiology',
    results: [
      { name: 'Total Cholesterol', value: 185, unit: 'mg/dL', range: '<200',  status: 'normal' },
      { name: 'LDL',               value: 102, unit: 'mg/dL', range: '<100',  status: 'high'   },
      { name: 'HDL',               value: 52,  unit: 'mg/dL', range: '>40',   status: 'normal' },
      { name: 'Triglycerides',     value: 148, unit: 'mg/dL', range: '<150',  status: 'normal' },
    ],
    notes: 'LDL slightly elevated. Continue Atorvastatin. Recheck in 3 months.',
  },
  {
    id: 'LR-2026-004', date: '2026-02-20', type: 'Diabetes Panel (HbA1c)',
    doctor: 'Dr. Arvind Mehta', status: 'Review', category: 'Diabetes',
    results: [
      { name: 'HbA1c',              value: '7.1%', unit: '%',     range: '<5.7%',    status: 'high'   },
      { name: 'Fasting Glucose',    value: 108,    unit: 'mg/dL', range: '70–100',   status: 'high'   },
      { name: 'Post-Prandial',      value: 145,    unit: 'mg/dL', range: '<140',     status: 'high'   },
      { name: 'Insulin (fasting)',  value: 12,     unit: 'µU/mL', range: '2.6–24.9', status: 'normal' },
    ],
    notes: 'HbA1c elevated — diabetes not well controlled. Adjust Metformin dosage and recheck in 6 weeks.',
  },
  {
    id: 'LR-2025-005', date: '2025-11-10', type: 'Vitamin & Mineral Panel',
    doctor: 'Dr. Sneha Rao', status: 'Review', category: 'Vitamins',
    results: [
      { name: 'Vitamin D',   value: 18,  unit: 'ng/mL', range: '20–50',  status: 'low'    },
      { name: 'Vitamin B12', value: 310, unit: 'pg/mL', range: '200–900',status: 'normal' },
      { name: 'Ferritin',    value: 52,  unit: 'ng/mL', range: '20–250', status: 'normal' },
      { name: 'Calcium',     value: 9.4, unit: 'mg/dL', range: '8.6–10.2', status: 'normal' },
    ],
    notes: 'Vitamin D deficient. Continue supplementation 60,000 IU weekly for 8 weeks.',
  },
  {
    id: 'LR-2025-006', date: '2025-08-12', type: 'Thyroid Function Panel',
    doctor: 'Dr. Sneha Rao', status: 'Normal', category: 'Endocrinology',
    results: [
      { name: 'TSH',     value: 2.1, unit: 'mIU/L', range: '0.4–4.0', status: 'normal' },
      { name: 'Free T4', value: 1.2, unit: 'ng/dL', range: '0.8–1.8', status: 'normal' },
      { name: 'Free T3', value: 3.1, unit: 'pg/mL', range: '2.3–4.2', status: 'normal' },
    ],
    notes: 'Thyroid function normal. No changes required.',
  },
];

const CATEGORIES = ['All', 'Hematology', 'Chemistry', 'Cardiology', 'Diabetes', 'Vitamins', 'Endocrinology'];

const STATUS_CFG = {
  Normal:   { color: '#2FA77A', bg: 'rgba(47,167,122,0.1)',  border: 'rgba(47,167,122,0.25)',  label: 'All values within normal range' },
  Review:   { color: '#F3C44E', bg: 'rgba(243,196,78,0.1)',  border: 'rgba(243,196,78,0.25)',  label: 'Some values need attention' },
  Abnormal: { color: '#E77B7B', bg: 'rgba(231,123,123,0.1)', border: 'rgba(231,123,123,0.25)', label: 'Abnormal values — consult your doctor' },
};

const RESULT_CFG = {
  normal: { color: 'text.primary',    badge: '',  barColor: '#2FA77A' },
  high:   { color: '#E77B7B',          badge: '↑', barColor: '#E77B7B' },
  low:    { color: '#2C8AD3',          badge: '↓', barColor: '#2C8AD3' },
};

function getBarPct(value: number | string, range: string): number {
  if (typeof value !== 'number') return 50;
  const clean = range.replace(/[<>]/g, '');
  const parts = clean.split('–');
  if (parts.length === 2) {
    const min = parseFloat(parts[0]);
    const max = parseFloat(parts[1]);
    if (!isNaN(min) && !isNaN(max)) return Math.max(5, Math.min(95, ((value - min) / (max - min)) * 100));
  }
  return 50;
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const fmtShort  = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/* ─── Vitals data ────────────────────────────────────────────────────────── */
interface VitalReading { date: string; value: number; label: string; note?: string; }

/* Helper — adds days to a date string */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/* Generate dense weekly history going back N weeks from a seed array */
function extendHistory(seed: VitalReading[], extraWeeks: number, baseVal: number, variance: number, fmt: (v: number) => string, notes: string[]): VitalReading[] {
  const last = seed[seed.length - 1];
  const extra: VitalReading[] = [];
  for (let i = 1; i <= extraWeeks; i++) {
    const d = addDays(last.date, -(i * 7));
    const v = Math.round((baseVal + (Math.random() * variance * 2 - variance)) * 10) / 10;
    extra.push({ date: d, value: v, label: fmt(v), note: notes[i % notes.length] });
  }
  return [...seed, ...extra].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
interface VitalSign {
  id: string; name: string; unit: string; icon: string;
  current: string; currentNum: number; status: 'normal' | 'elevated' | 'low' | 'high';
  range: string; rangeMin: number; rangeMax: number;
  category: string; history: VitalReading[];
  secondary?: { label: string; value: string };
}

const BP_NOTES = ['Morning reading', 'Evening reading', 'Post-exercise', 'Resting', 'Clinic visit', 'Stress reported', 'After medication', 'Fasting'];
const HR_NOTES = ['Resting', 'Post-meal', 'Morning', 'Evening', 'After walk', 'Clinic visit', 'Pre-sleep', 'Waking'];
const SPO2_NOTES = ['Resting', 'After activity', 'Morning', 'Evening', 'Cold reported', 'Clinic visit', 'Post-walk', 'Night reading'];
const TEMP_NOTES = ['Morning', 'Evening', 'Mild fever', 'Normal', 'After bath', 'Clinic visit', 'Night', 'After meal'];
const GLUC_NOTES = ['Fasting', 'Post-meal 2h', 'Pre-meal', 'Morning fasting', 'After exercise', 'Clinic — fasting', 'Evening fasting', 'Random'];
const WT_NOTES   = ['Morning', 'After breakfast', 'Post holidays', 'Clinic weigh-in', 'Evening', 'After gym', 'Weekly check', 'Doctor visit'];

const VITALS_DATA: VitalSign[] = [
  {
    id: 'bp', name: 'Blood Pressure', unit: 'mmHg', icon: '🩸',
    current: '138/90', currentNum: 138, status: 'elevated', category: 'Cardiovascular',
    range: 'Normal < 120/80', rangeMin: 80, rangeMax: 120,
    secondary: { label: 'Diastolic', value: '90 mmHg' },
    history: extendHistory([
      { date: '2026-02-20', value: 138, label: '138/90', note: 'Morning reading' },
      { date: '2026-02-13', value: 142, label: '142/92', note: 'Post-exercise' },
      { date: '2026-02-06', value: 136, label: '136/88', note: 'Resting' },
      { date: '2026-01-30', value: 140, label: '140/90', note: 'Evening reading' },
      { date: '2026-01-23', value: 145, label: '145/94', note: 'Stress reported' },
      { date: '2026-01-10', value: 138, label: '138/90', note: 'Clinic visit' },
    ], 46, 140, 8, (v) => `${v}/${Math.round(v * 0.65)}`, BP_NOTES),
  },
  {
    id: 'hr', name: 'Heart Rate', unit: 'bpm', icon: '❤️',
    current: '72 bpm', currentNum: 72, status: 'normal', category: 'Cardiovascular',
    range: '60 – 100 bpm', rangeMin: 60, rangeMax: 100,
    history: extendHistory([
      { date: '2026-02-20', value: 72, label: '72', note: 'Resting' },
      { date: '2026-02-13', value: 78, label: '78', note: 'Post-meal' },
      { date: '2026-02-06', value: 68, label: '68', note: 'Morning' },
      { date: '2026-01-30', value: 74, label: '74', note: 'Evening' },
      { date: '2026-01-23', value: 80, label: '80', note: 'Anxious' },
      { date: '2026-01-10', value: 70, label: '70', note: 'Clinic visit' },
    ], 46, 74, 8, (v) => `${Math.round(v)}`, HR_NOTES),
  },
  {
    id: 'spo2', name: 'SpO₂', unit: '%', icon: '🫁',
    current: '98%', currentNum: 98, status: 'normal', category: 'Respiratory',
    range: '95 – 100%', rangeMin: 95, rangeMax: 100,
    history: extendHistory([
      { date: '2026-02-20', value: 98, label: '98%', note: 'Resting' },
      { date: '2026-02-13', value: 97, label: '97%', note: 'After activity' },
      { date: '2026-02-06', value: 99, label: '99%', note: 'Morning' },
      { date: '2026-01-30', value: 98, label: '98%', note: 'Evening' },
      { date: '2026-01-23', value: 97, label: '97%', note: 'Cold reported' },
      { date: '2026-01-10', value: 98, label: '98%', note: 'Clinic visit' },
    ], 46, 98, 1.5, (v) => `${Math.min(100, Math.round(v))}%`, SPO2_NOTES),
  },
  {
    id: 'temp', name: 'Temperature', unit: '°F', icon: '🌡️',
    current: '98.6°F', currentNum: 98.6, status: 'normal', category: 'General',
    range: '97.0 – 99.0°F', rangeMin: 97.0, rangeMax: 99.0,
    history: extendHistory([
      { date: '2026-02-20', value: 98.6, label: '98.6°F', note: 'Morning' },
      { date: '2026-02-13', value: 98.4, label: '98.4°F', note: 'Evening' },
      { date: '2026-02-06', value: 99.1, label: '99.1°F', note: 'Mild fever' },
      { date: '2026-01-30', value: 98.6, label: '98.6°F', note: 'Normal' },
      { date: '2026-01-23', value: 98.2, label: '98.2°F', note: 'Morning' },
      { date: '2026-01-10', value: 98.6, label: '98.6°F', note: 'Clinic visit' },
    ], 46, 98.6, 0.6, (v) => `${v.toFixed(1)}°F`, TEMP_NOTES),
  },
  {
    id: 'glucose', name: 'Blood Glucose', unit: 'mg/dL', icon: '🩻',
    current: '108 mg/dL', currentNum: 108, status: 'elevated', category: 'Metabolic',
    range: '70 – 99 mg/dL (Fasting)', rangeMin: 70, rangeMax: 99,
    history: extendHistory([
      { date: '2026-02-20', value: 108, label: '108', note: 'Fasting' },
      { date: '2026-02-13', value: 112, label: '112', note: 'Fasting' },
      { date: '2026-02-06', value: 105, label: '105', note: 'Fasting' },
      { date: '2026-01-30', value: 115, label: '115', note: 'After exercise miss' },
      { date: '2026-01-23', value: 110, label: '110', note: 'Fasting' },
      { date: '2026-01-10', value: 118, label: '118', note: 'Clinic — fasting' },
    ], 46, 110, 10, (v) => `${Math.round(v)}`, GLUC_NOTES),
  },
  {
    id: 'weight', name: 'Weight', unit: 'kg', icon: '⚖️',
    current: '78 kg', currentNum: 78, status: 'normal', category: 'Anthropometric',
    range: 'Target: 70 – 75 kg', rangeMin: 70, rangeMax: 75,
    history: extendHistory([
      { date: '2026-02-20', value: 78, label: '78 kg', note: 'Morning' },
      { date: '2026-02-13', value: 78.5, label: '78.5 kg', note: 'Morning' },
      { date: '2026-02-06', value: 79, label: '79 kg', note: 'Morning' },
      { date: '2026-01-30', value: 79.2, label: '79.2 kg', note: 'Post holidays' },
      { date: '2026-01-23', value: 79.5, label: '79.5 kg', note: 'Morning' },
      { date: '2026-01-10', value: 80, label: '80 kg', note: 'Clinic visit' },
    ], 46, 79, 1, (v) => `${v.toFixed(1)} kg`, WT_NOTES),
  },
  {
    id: 'bmi', name: 'BMI', unit: 'kg/m²', icon: '📊',
    current: '26.4', currentNum: 26.4, status: 'elevated', category: 'Anthropometric',
    range: '18.5 – 24.9 (Normal)', rangeMin: 18.5, rangeMax: 24.9,
    history: extendHistory([
      { date: '2026-02-20', value: 26.4, label: '26.4', note: 'Calculated' },
      { date: '2026-02-13', value: 26.6, label: '26.6', note: 'Calculated' },
      { date: '2026-02-06', value: 26.8, label: '26.8', note: 'Calculated' },
      { date: '2026-01-30', value: 26.9, label: '26.9', note: 'Calculated' },
      { date: '2026-01-23', value: 27.0, label: '27.0', note: 'Calculated' },
      { date: '2026-01-10', value: 27.1, label: '27.1', note: 'Clinic visit' },
    ], 46, 26.8, 0.4, (v) => `${v.toFixed(1)}`, WT_NOTES),
  },
];

const VITAL_STATUS_CFG = {
  normal:   { color: '#2FA77A', bg: 'rgba(47,167,122,0.08)',  label: 'Normal',   border: 'rgba(47,167,122,0.2)'  },
  elevated: { color: '#F3A64E', bg: 'rgba(243,166,78,0.08)',  label: 'Elevated', border: 'rgba(243,166,78,0.2)'  },
  high:     { color: '#E77B7B', bg: 'rgba(231,123,123,0.08)', label: 'High',     border: 'rgba(231,123,123,0.2)' },
  low:      { color: '#2C8AD3', bg: 'rgba(44,138,211,0.08)',  label: 'Low',      border: 'rgba(44,138,211,0.2)'  },
};

/* ─── SVG Sparkline ─────────────────────────────────────────────────────── */
function Sparkline({ values, color, width = 280, height = 60 }: { values: number[]; color: string; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const pad = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x, y] as [number, number];
  });
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const fillPts = [...pts, [pts[pts.length - 1][0], height], [pts[0][0], height]];
  const fill = fillPts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') + 'Z';
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0.01} />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 5 : 3}
          fill={i === pts.length - 1 ? color : '#fff'}
          stroke={color} strokeWidth={i === pts.length - 1 ? 0 : 2} />
      ))}
    </svg>
  );
}

export default function PatientPortalLabReportsPage() {
  const theme = useTheme();
  const router = useRouter();

  /* tab */
  const [activeTab, setActiveTab] = React.useState(0);

  /* lab reports state */
  const [selected, setSelected] = React.useState<string | null>(LAB_DATA[0].id);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('All');
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null);

  /* vitals state */
  const [selectedVital, setSelectedVital] = React.useState<VitalSign>(VITALS_DATA[0]);
  const [vitalSearch, setVitalSearch] = React.useState('');
  const [dateRange, setDateRange] = React.useState<'1W' | '1M' | '3M' | '6M' | 'All'>('3M');
  /* vitals right-panel sub-tab: 0 = Trend, 1 = History */
  const [vDetailTab, setVDetailTab] = React.useState(0);
  /* history pagination */
  const [histPage, setHistPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; severity: 'success' | 'info' }>({ open: false, msg: '', severity: 'success' });

  const sectionCard = ppSectionCard(theme);

  const filtered = LAB_DATA.filter((r) => {
    const matchSearch =
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      r.doctor.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || r.category === filter;
    return matchSearch && matchFilter;
  });

  const selectedReport = LAB_DATA.find((r) => r.id === selected) ?? null;

  const totalReports = LAB_DATA.length;
  const needsReview = LAB_DATA.filter((r) => r.status !== 'Normal').length;
  const normalCount = LAB_DATA.filter((r) => r.status === 'Normal').length;

  /* shared scrollbar style */
  const scrollbar = {
    '&::-webkit-scrollbar': { width: 4 },
    '&::-webkit-scrollbar-thumb': { bgcolor: alpha(theme.palette.primary.main, 0.18), borderRadius: 99 },
  };

  const pr = theme.palette.primary;
  const PANEL_H = 'calc(100vh - 240px)';

  const filteredVitals = VITALS_DATA.filter((v) =>
    v.name.toLowerCase().includes(vitalSearch.toLowerCase()) || v.category.toLowerCase().includes(vitalSearch.toLowerCase())
  );
  const normalVitals    = VITALS_DATA.filter((v) => v.status === 'normal').length;
  const attentionVitals = VITALS_DATA.filter((v) => v.status !== 'normal').length;

  /* filter vital history by date range */
  const filteredHistory = React.useMemo(() => {
    const now = new Date('2026-02-24');
    const dayMs = 86_400_000;
    const cutoff: Record<string, number> = { '1W': 7, '1M': 30, '3M': 90, '6M': 180, 'All': Infinity };
    const days = cutoff[dateRange];
    return selectedVital.history.filter((h) => {
      const diff = (now.getTime() - new Date(h.date).getTime()) / dayMs;
      return diff <= days;
    });
  }, [selectedVital, dateRange]);

  /* reset pagination when vital or date filter changes */
  React.useEffect(() => { setHistPage(0); }, [selectedVital, dateRange]);

  const totalHistPages = Math.ceil(filteredHistory.length / rowsPerPage);
  const pagedHistory = filteredHistory.slice(histPage * rowsPerPage, histPage * rowsPerPage + rowsPerPage);

  /* status badge for a history reading */
  const readingStatus = (v: number): 'normal' | 'elevated' | 'high' | 'low' => {
    if (v < selectedVital.rangeMin) return 'low';
    if (v > selectedVital.rangeMax) return 'high';
    if (v > selectedVital.rangeMax * 0.9 && v <= selectedVital.rangeMax) return 'elevated';
    return 'normal';
  };

  return (
    <PatientPortalWorkspaceCard current="lab-reports">

      {/* ── Tab bar ── */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mx: { xs: -2, sm: -3 }, bgcolor: 'background.paper' }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
          sx={{ px: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 13.5, minHeight: 44 }, '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' } }}>
          <Tab label="Lab Reports" icon={<ScienceIcon sx={{ fontSize: 17 }} />} iconPosition="start" />
          <Tab label="Vitals" icon={<MonitorHeartIcon sx={{ fontSize: 17 }} />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* ══════════════ TAB 0 — LAB REPORTS ══════════════ */}
      {activeTab === 0 && (
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '360px 1fr' },
        gap: 2,
        height: PANEL_H,
        overflow: 'hidden',
        mx: { xs: -2, sm: -3 },
        px: { xs: 2, sm: 3 },
      }}>

        {/* ══ LEFT PANEL ══ */}
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', gap: 0 }}>

          {/* ── Fixed top: stats + search + filters ── */}
          <Stack spacing={1.5} sx={{ flexShrink: 0, pb: 1.5 }}>

            {/* Stat tiles */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.25 }}>
              {[
                { label: 'Total Reports', value: totalReports, icon: <ScienceIcon sx={{ fontSize: 16 }} />,             color: theme.palette.primary.main },
                { label: 'Needs Review',  value: needsReview,  icon: <WarningAmberIcon sx={{ fontSize: 16 }} />,        color: theme.palette.warning.dark  },
                { label: 'Normal',        value: normalCount,  icon: <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />,  color: theme.palette.success.main  },
              ].map((s) => (
                <Card key={s.label} elevation={0} sx={{ p: 1.75, borderRadius: 2, boxShadow: cardShadow, border: 'none', bgcolor: 'background.paper' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: s.color, lineHeight: 1.1, mb: 0.3 }}>{s.value}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: 11 }}>{s.label}</Typography>
                    </Box>
                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(s.color, 0.12), color: s.color, flexShrink: 0 }}>
                      {s.icon}
                    </Box>
                  </Stack>
                </Card>
              ))}
            </Box>

            {/* Search */}
            <TextField
              size="small" fullWidth placeholder="Search reports, doctors, IDs…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ fontSize: 16, color: 'text.disabled', mr: 0.75 }} /> }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }}
            />

            {/* Category chips */}
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => {
                const active = filter === cat;
                return (
                  <Chip key={cat} label={cat} size="small" onClick={() => setFilter(cat)}
                    sx={{
                      fontWeight: 700, fontSize: 12, cursor: 'pointer',
                      bgcolor: active ? alpha(theme.palette.primary.main, 0.14) : 'background.paper',
                      color: active ? 'primary.main' : 'text.secondary',
                      border: '1px solid',
                      borderColor: active ? alpha(theme.palette.primary.main, 0.35) : 'divider',
                    }} />
                );
              })}
            </Box>
          </Stack>

          {/* ── Scrollable report list ── */}
          <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5, ...scrollbar }}>
            <Stack spacing={1}>
              {filtered.length === 0 && (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                  <ScienceIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No reports found</Typography>
                </Box>
              )}
              {filtered.map((report) => {
                const s = STATUS_CFG[report.status];
                const isActive = selected === report.id;
                return (
                  <Box key={report.id}
                    onClick={() => setSelected(isActive ? null : report.id)}
                    sx={{
                      p: 2, borderRadius: 2.5, border: '1px solid', cursor: 'pointer',
                      borderColor: isActive ? 'primary.main' : 'divider',
                      bgcolor: isActive ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.03), transform: 'translateX(2px)' },
                    }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1, minWidth: 0, mr: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.4 }} noWrap>{report.type}</Typography>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Typography variant="caption" color="text.secondary">{formatDate(report.date)}</Typography>
                          <Typography variant="caption" color="text.disabled">·</Typography>
                          <Typography variant="caption" color="text.secondary">{report.doctor}</Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block', fontFamily: 'monospace' }}>{report.id}</Typography>
                      </Box>
                      <Chip size="small" label={report.status}
                        sx={{ fontWeight: 700, fontSize: 11, flexShrink: 0, bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}` }} />
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Box>

        {/* ══ RIGHT PANEL — Report Detail ══ */}
        {selectedReport && (
          <Box sx={{
            ...sectionCard,
            bgcolor: 'background.paper',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeSlideIn 0.2s ease',
            '@keyframes fadeSlideIn': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
          }}>

            {/* ── Fixed detail header (never scrolls) ── */}
            <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                    {selectedReport.category}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3, mt: 0.25 }}>{selectedReport.type}</Typography>
                  <Typography variant="caption" color="text.secondary">{formatDate(selectedReport.date)} · {selectedReport.doctor}</Typography>
                </Box>
                <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0, mt: 0.5 }}>
                  <Tooltip title="Print report">
                    <Button size="small" variant="outlined"
                      startIcon={<PrintIcon sx={{ fontSize: 14 }} />}
                      onClick={() => typeof window !== 'undefined' && window.print()}
                      sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12 }}>Print</Button>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>

            {/* ── Scrollable content area ── */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2, ...scrollbar }}>

              {/* Status banner */}
              {(() => {
                const s = STATUS_CFG[selectedReport.status];
                return (
                  <Box sx={{ p: 1.75, mb: 2.5, borderRadius: 2, bgcolor: s.bg, border: `1px solid ${s.border}` }}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color, flexShrink: 0, mt: 0.6 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: s.color }}>{s.label}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>{selectedReport.notes}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                );
              })()}

              {/* Results */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', mb: 1.25 }}>
                  Test Results
                </Typography>

                {/* Column header */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1.6fr 0.9fr 0.7fr 1fr 90px', gap: 1, px: 1.5, py: 0.75, mb: 0.5 }}>
                  {['Test', 'Value', 'Unit', 'Ref Range', 'Status'].map((h) => (
                    <Typography key={h} variant="caption" sx={{ fontWeight: 800, fontSize: 10.5, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</Typography>
                  ))}
                </Box>

                <Stack spacing={0.25}>
                  {selectedReport.results.map((r, i) => {
                    const rc = RESULT_CFG[r.status];
                    const rowKey = `${selectedReport.id}-${i}`;
                    const isExpanded = expandedRow === rowKey;
                    const barPct = getBarPct(r.value, r.range);
                    return (
                      <Box key={rowKey}>
                        <Box
                          onClick={() => setExpandedRow(isExpanded ? null : rowKey)}
                          sx={{
                            display: 'grid', gridTemplateColumns: '1.6fr 0.9fr 0.7fr 1fr 90px',
                            gap: 1, px: 1.5, py: 1.25, borderRadius: 1.5, alignItems: 'center',
                            cursor: 'pointer',
                            bgcolor: isExpanded ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) },
                            transition: 'background 0.12s',
                          }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.name}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: rc.color }}>
                            {r.value} <Typography component="span" sx={{ fontSize: 12, fontWeight: 700 }}>{rc.badge}</Typography>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{r.unit}</Typography>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.disabled' }}>{r.range}</Typography>
                          <Chip size="small" label={r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                            sx={{ fontWeight: 700, fontSize: 10.5, bgcolor: alpha(rc.barColor, 0.12), color: rc.barColor, border: `1px solid ${alpha(rc.barColor, 0.25)}` }} />
                        </Box>

                        {/* Expanded range bar */}
                        {isExpanded && typeof r.value === 'number' && (
                          <Box sx={{ mx: 1.5, mb: 1, px: 1.75, py: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.03), border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                              Value distribution within reference range
                            </Typography>
                            <LinearProgress variant="determinate" value={barPct}
                              sx={{ borderRadius: 99, height: 7, bgcolor: alpha(rc.barColor, 0.1), '& .MuiLinearProgress-bar': { bgcolor: rc.barColor, borderRadius: 99 } }} />
                            <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10 }}>Min</Typography>
                              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10 }}>Max</Typography>
                            </Stack>
                            <Typography variant="caption" sx={{ mt: 0.75, display: 'block', color: 'text.secondary' }}>
                              Your value: <Typography component="span" sx={{ fontWeight: 800, color: rc.barColor }}>{r.value} {r.unit}</Typography>
                              {' '}· Reference: <Typography component="span" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.range} {r.unit}</Typography>
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </Box>

            {/* ── Fixed footer actions (always visible) ── */}
            <Box sx={{ px: 2.5, py: 1.75, flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 1 }}>
                <Button variant="contained" disableElevation size="small"
                  startIcon={<CalendarMonthIcon sx={{ fontSize: 14 }} />}
                  onClick={() => router.push('/patient-portal/appointments')}
                  sx={{ textTransform: 'none', fontWeight: 700, py: 1.1 }}>
                  Book Follow-up
                </Button>
                <Button variant="outlined" size="small"
                  startIcon={<ChatIcon sx={{ fontSize: 14 }} />}
                  onClick={() => router.push('/patient-portal/chat')}
                  sx={{ textTransform: 'none', fontWeight: 700, py: 1.1 }}>
                  Message Doctor
                </Button>
                <Tooltip title="Download PDF">
                  <Button variant="outlined" size="small"
                    onClick={() => setSnack({ open: true, msg: `Downloaded: ${selectedReport.type}`, severity: 'success' })}
                    sx={{ minWidth: 40, width: 40, height: 40, p: 0, borderRadius: 1.5 }}>
                    <DownloadIcon sx={{ fontSize: 18 }} />
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        )}

      </Box>
      )}

      {/* ══════════════ TAB 1 — VITALS ══════════════ */}
      {activeTab === 1 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '300px 1fr' }, height: PANEL_H, overflow: 'hidden', mx: { xs: -2, sm: -3 } }}>

          {/* ── Left: vital list ── */}
          <Box sx={{ borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Stat tiles */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.25 }}>
                {[
                  { label: 'Total', value: VITALS_DATA.length, color: pr.main },
                  { label: 'Normal', value: normalVitals, color: theme.palette.success.main },
                  { label: 'Attention', value: attentionVitals, color: theme.palette.warning.main },
                ].map((s) => (
                  <Card key={s.label} elevation={0} sx={{ boxShadow: cardShadow, border: 'none', p: 1.25, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 20, color: s.color, lineHeight: 1.1 }}>{s.value}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: 10.5 }}>{s.label}</Typography>
                  </Card>
                ))}
              </Box>
            </Box>

            {/* Scrollable vital list */}
            <Box sx={{ flex: 1, overflowY: 'auto', ...scrollbar }}>
              <Stack spacing={0}>
                {VITALS_DATA.map((v) => {
                  const sc = VITAL_STATUS_CFG[v.status];
                  const isSelected = selectedVital.id === v.id;
                  const trend = v.history[0].value - v.history[v.history.length - 1].value;
                  return (
                    <Box key={v.id} onClick={() => setSelectedVital(v)} sx={{
                      px: 2, py: 1.75, borderBottom: '1px solid', borderColor: 'divider',
                      cursor: 'pointer',
                      bgcolor: isSelected ? alpha(pr.main, 0.06) : 'background.paper',
                      borderLeft: isSelected ? `3px solid ${pr.main}` : '3px solid transparent',
                      '&:hover': { bgcolor: isSelected ? alpha(pr.main, 0.06) : alpha(pr.main, 0.03) },
                      transition: 'background 0.15s',
                    }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{v.icon}</Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13 }}>{v.name}</Typography>
                            <Chip size="small" label={sc.label}
                              sx={{ fontWeight: 700, fontSize: 10, bgcolor: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }} />
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.3 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: sc.color, fontSize: 13 }}>{v.current}</Typography>
                            {trend < 0
                              ? <TrendingDownIcon sx={{ fontSize: 13, color: 'success.main' }} />
                              : trend > 0
                              ? <TrendingUpIcon sx={{ fontSize: 13, color: 'warning.main' }} />
                              : null}
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10.5 }}>{v.category}</Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Box>

          {/* ── Right: detail panel ── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: alpha(theme.palette.grey[100], 0.35) }}>

            {/* Fixed header — vital name + status */}
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ fontSize: 24 }}>{selectedVital.icon}</Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10.5 }}>{selectedVital.category}</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>{selectedVital.name}</Typography>
                  </Box>
                  <Chip size="small" label={VITAL_STATUS_CFG[selectedVital.status].label}
                    sx={{ fontWeight: 700, fontSize: 10.5, bgcolor: VITAL_STATUS_CFG[selectedVital.status].bg, color: VITAL_STATUS_CFG[selectedVital.status].color, border: `1px solid ${VITAL_STATUS_CFG[selectedVital.status].border}` }} />
                </Stack>
                {/* Date range chips */}
                <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mr: 0.25, fontSize: 11 }}>Period:</Typography>
                  {(['1W', '1M', '3M', '6M', 'All'] as const).map((r) => (
                    <Chip key={r} label={r} size="small" onClick={() => setDateRange(r)}
                      variant={dateRange === r ? 'filled' : 'outlined'}
                      color={dateRange === r ? 'primary' : 'default'}
                      sx={{ fontWeight: 700, fontSize: 11, cursor: 'pointer', height: 24 }}
                    />
                  ))}
                </Stack>
              </Stack>

              {/* Sub-tabs: Trend | History */}
              <Box sx={{ mt: 1.25, mx: -2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Tabs value={vDetailTab} onChange={(_, v) => { setVDetailTab(v); setHistPage(0); }}
                  sx={{ px: 2, minHeight: 36, '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: 12.5, minHeight: 36, py: 0.5 }, '& .MuiTabs-indicator': { height: 2.5, borderRadius: '2px 2px 0 0' } }}>
                  <Tab label="Trend" icon={<TrendingUpIcon sx={{ fontSize: 15 }} />} iconPosition="start" />
                  <Tab label={`History (${filteredHistory.length})`} icon={<ScienceIcon sx={{ fontSize: 15 }} />} iconPosition="start" />
                </Tabs>
              </Box>
            </Box>

            {/* ── Sub-tab 0: TREND ── */}
            {vDetailTab === 0 && (
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.75, ...scrollbar }}>

              {/* 4 stat cards */}
              {(() => {
                const vals = filteredHistory.map((h) => h.value);
                const avg  = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
                const minV = vals.length ? Math.min(...vals).toFixed(1) : '—';
                const maxV = vals.length ? Math.max(...vals).toFixed(1) : '—';
                const sc   = VITAL_STATUS_CFG[selectedVital.status];
                const trend = vals.length >= 2 ? vals[0] - vals[vals.length - 1] : 0;
                return (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.25 }}>
                    {[
                      { label: 'Latest',  value: selectedVital.current,           color: sc.color, trend },
                      { label: 'Average', value: `${avg} ${selectedVital.unit}`,  color: pr.main,  trend: 0 },
                      { label: 'Minimum', value: `${minV} ${selectedVital.unit}`, color: theme.palette.info.main, trend: 0 },
                      { label: 'Maximum', value: `${maxV} ${selectedVital.unit}`, color: theme.palette.warning.main, trend: 0 },
                    ].map((s) => (
                      <Card key={s.label} elevation={0} sx={{ boxShadow: cardShadow, border: 'none', borderRadius: 2, p: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>{s.label}</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900, fontSize: 15, color: s.color, lineHeight: 1.2 }}>{s.value}</Typography>
                        {s.trend !== 0 && (
                          s.trend > 0
                            ? <TrendingUpIcon sx={{ fontSize: 12, color: 'warning.main', mt: 0.25 }} />
                            : <TrendingDownIcon sx={{ fontSize: 12, color: 'success.main', mt: 0.25 }} />
                        )}
                      </Card>
                    ))}
                  </Box>
                );
              })()}

              {/* Chart card */}
              <Card elevation={0} sx={{ boxShadow: cardShadow, border: 'none', borderRadius: 2, p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                  <Stack direction="row" spacing={1.5} alignItems="baseline">
                    <Typography variant="h4" sx={{ fontWeight: 900, color: VITAL_STATUS_CFG[selectedVital.status].color, lineHeight: 1 }}>{selectedVital.current}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{selectedVital.unit}</Typography>
                    {selectedVital.secondary && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{selectedVital.secondary.label}: {selectedVital.secondary.value}</Typography>
                    )}
                  </Stack>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.disabled', fontSize: 11 }}>
                    {filteredHistory.length} readings · {dateRange === 'All' ? 'All time' : `Last ${dateRange}`}
                  </Typography>
                </Stack>

                {filteredHistory.length >= 2 ? (
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ width: '100%', overflow: 'hidden', height: 90 }}>
                      <Sparkline
                        values={[...filteredHistory].reverse().map((h) => h.value)}
                        color={VITAL_STATUS_CFG[selectedVital.status].color}
                        width={700} height={90}
                      />
                    </Box>
                    {/* Show only first + last + a few labels to avoid crowding */}
                    {(() => {
                      const reversed = [...filteredHistory].reverse();
                      const step = Math.max(1, Math.floor(reversed.length / 6));
                      const shown = reversed.filter((_, i) => i === 0 || i === reversed.length - 1 || i % step === 0);
                      return (
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5, px: 0.25 }}>
                          {shown.map((h) => (
                            <Typography key={h.date} variant="caption" sx={{ fontSize: 9.5, color: 'text.disabled', fontWeight: 600 }}>{fmtShort(h.date)}</Typography>
                          ))}
                        </Stack>
                      );
                    })()}
                  </Box>
                ) : (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Not enough data for this period.</Typography>
                  </Box>
                )}

                {/* Range gauge */}
                <Box sx={{ mt: 1.75, pt: 1.75, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: 11 }}>Position within Normal Range</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11, color: 'text.secondary' }}>Ref: {selectedVital.range}</Typography>
                  </Stack>
                  <LinearProgress variant="determinate"
                    value={Math.min(100, Math.max(5, ((selectedVital.currentNum - selectedVital.rangeMin) / (selectedVital.rangeMax - selectedVital.rangeMin)) * 100))}
                    sx={{ height: 7, borderRadius: 99, bgcolor: alpha(VITAL_STATUS_CFG[selectedVital.status].color, 0.12), '& .MuiLinearProgress-bar': { bgcolor: VITAL_STATUS_CFG[selectedVital.status].color, borderRadius: 99 } }}
                  />
                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.4 }}>
                    <Typography variant="caption" sx={{ fontSize: 10, color: 'text.disabled' }}>{selectedVital.rangeMin} {selectedVital.unit}</Typography>
                    <Typography variant="caption" sx={{ fontSize: 10, color: 'text.disabled' }}>{selectedVital.rangeMax} {selectedVital.unit}</Typography>
                  </Stack>
                </Box>
              </Card>

            </Box>
            )}

            {/* ── Sub-tab 1: HISTORY (paginated table) ── */}
            {vDetailTab === 1 && (
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

              {/* Table toolbar */}
              <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'text.secondary', fontSize: 10.5 }}>
                    {filteredHistory.length} records · showing {histPage * rowsPerPage + 1}–{Math.min((histPage + 1) * rowsPerPage, filteredHistory.length)}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 600 }}>Rows:</Typography>
                    {[10, 25, 50].map((n) => (
                      <Chip key={n} label={n} size="small" clickable
                        variant={rowsPerPage === n ? 'filled' : 'outlined'}
                        color={rowsPerPage === n ? 'primary' : 'default'}
                        onClick={() => { setRowsPerPage(n); setHistPage(0); }}
                        sx={{ fontWeight: 700, fontSize: 11, height: 22 }}
                      />
                    ))}
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                    <Tooltip title="Download all history">
                      <Button size="small" variant="text" onClick={() => setSnack({ open: true, msg: `${selectedVital.name} history downloaded!`, severity: 'success' })}
                        sx={{ minWidth: 28, p: 0.5, color: 'text.secondary' }}>
                        <DownloadIcon sx={{ fontSize: 15 }} />
                      </Button>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Box>

              {/* Column headers */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '36px 1.6fr 1.1fr 0.8fr 0.9fr 1.8fr', gap: 1, px: 2, py: 0.9, bgcolor: alpha(theme.palette.grey[100], 0.9), borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
                {['#', 'Date', 'Value', 'Unit', 'Status', 'Note'].map((h) => (
                  <Typography key={h} variant="caption" sx={{ fontWeight: 800, fontSize: 10.5, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</Typography>
                ))}
              </Box>

              {/* Scrollable rows */}
              <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', ...scrollbar }}>
                {filteredHistory.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No readings found for this period.</Typography>
                  </Box>
                ) : pagedHistory.map((h, idx) => {
                  const globalIdx = histPage * rowsPerPage + idx;
                  const isLatest  = globalIdx === 0;
                  const rSt       = readingStatus(h.value);
                  const rCfg      = VITAL_STATUS_CFG[rSt];
                  return (
                    <Box key={h.date + idx} sx={{
                      display: 'grid', gridTemplateColumns: '36px 1.6fr 1.1fr 0.8fr 0.9fr 1.8fr',
                      gap: 1, px: 2, py: 1.1,
                      borderBottom: '1px solid', borderColor: 'divider',
                      bgcolor: isLatest ? alpha(pr.main, 0.04) : idx % 2 === 0 ? 'background.paper' : alpha(theme.palette.grey[50], 0.6),
                      '&:hover': { bgcolor: alpha(pr.main, 0.03) },
                      transition: 'background 0.12s',
                    }}>
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, fontSize: 11, mt: 0.2 }}>{globalIdx + 1}</Typography>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12 }}>{formatDate(h.date)}</Typography>
                        {isLatest && <Chip size="small" label="Latest" sx={{ fontSize: 9, fontWeight: 700, height: 15, bgcolor: alpha(pr.main, 0.1), color: pr.main }} />}
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 800, fontSize: 13, color: rCfg.color }}>{h.label}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.2 }}>{selectedVital.unit}</Typography>
                      <Chip size="small" label={rCfg.label}
                        sx={{ fontWeight: 700, fontSize: 9.5, height: 18, alignSelf: 'center', bgcolor: rCfg.bg, color: rCfg.color, border: `1px solid ${rCfg.border}` }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, mt: 0.2 }}>{h.note ?? '—'}</Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* Pagination footer */}
              <Box sx={{ px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 600 }}>
                    Page {histPage + 1} of {totalHistPages || 1}
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    <Button size="small" variant="outlined" disabled={histPage === 0}
                      onClick={() => setHistPage(0)}
                      sx={{ minWidth: 32, px: 0.75, fontSize: 11, fontWeight: 700, py: 0.4 }}>«</Button>
                    <Button size="small" variant="outlined" disabled={histPage === 0}
                      onClick={() => setHistPage((p) => p - 1)}
                      sx={{ minWidth: 32, px: 0.75, fontSize: 11, fontWeight: 700, py: 0.4 }}>‹</Button>
                    {/* page number chips */}
                    {Array.from({ length: totalHistPages }, (_, i) => i)
                      .filter((i) => Math.abs(i - histPage) <= 2)
                      .map((i) => (
                        <Button key={i} size="small"
                          variant={i === histPage ? 'contained' : 'outlined'}
                          onClick={() => setHistPage(i)}
                          sx={{ minWidth: 32, px: 0.75, fontSize: 11, fontWeight: 700, py: 0.4 }}>{i + 1}</Button>
                      ))}
                    <Button size="small" variant="outlined" disabled={histPage >= totalHistPages - 1}
                      onClick={() => setHistPage((p) => p + 1)}
                      sx={{ minWidth: 32, px: 0.75, fontSize: 11, fontWeight: 700, py: 0.4 }}>›</Button>
                    <Button size="small" variant="outlined" disabled={histPage >= totalHistPages - 1}
                      onClick={() => setHistPage(totalHistPages - 1)}
                      sx={{ minWidth: 32, px: 0.75, fontSize: 11, fontWeight: 700, py: 0.4 }}>»</Button>
                  </Stack>
                </Stack>
              </Box>
            </Box>
            )}

            {/* Fixed footer */}
            <Box sx={{ px: 2.5, py: 1.25, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', gap: 1, flexShrink: 0 }}>
              <Button variant="contained" disableElevation size="small"
                startIcon={<CalendarMonthIcon sx={{ fontSize: 14 }} />}
                onClick={() => router.push('/patient-portal/appointments')}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 2 }}>
                Book Appointment
              </Button>
              <Button variant="outlined" size="small"
                startIcon={<ChatIcon sx={{ fontSize: 14 }} />}
                onClick={() => router.push('/patient-portal/chat')}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 2 }}>
                Message Doctor
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} variant="filled" sx={{ fontWeight: 600 }} onClose={() => setSnack((p) => ({ ...p, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </PatientPortalWorkspaceCard>
  );
}
