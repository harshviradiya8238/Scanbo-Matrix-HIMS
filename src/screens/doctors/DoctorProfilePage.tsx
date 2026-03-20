"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@/src/ui/components/atoms";
import {
  Card,
  CommonTabs,
  GlobalDoctorSearch,
  StatTile,
} from "@/src/ui/components/molecules";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  Badge as BadgeIcon,
  CalendarMonth as CalendarMonthIcon,
  Description as DescriptionIcon,
  Email as EmailIcon,
  EventNote as EventNoteIcon,
  Favorite as FavoriteIcon,
  FiberManualRecord as FiberManualRecordIcon,
  Language as LanguageIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  MonitorHeart as MonitorHeartIcon,
  People as PeopleIcon,
  Phone as PhoneIcon,
  PriorityHigh as PriorityHighIcon,
  School as SchoolIcon,
  Star as StarIcon,
  VerifiedUser as VerifiedUserIcon,
  Videocam as VideocamIcon,
  WorkHistory as WorkHistoryIcon,
} from "@mui/icons-material";
import { getSoftSurface } from "@/src/core/theme/surfaces";
import {
  OPD_APPOINTMENTS,
  OPD_ENCOUNTERS,
  OpdAppointment,
  OpdEncounterCase,
  AppointmentStatus,
  EncounterStatus,
} from "../opd/opd-mock-data";
import { doctorData, DoctorRow } from "@/src/mocks/doctorServer";

/* ─────────────────── helpers ─────────────────── */

const getDoctorById = (id: string): DoctorRow | undefined =>
  doctorData.find((d) => d.id === id || d.doctorId === id);

const AVATAR_COLORS = [
  "#1172BA",
  "#0B84D0",
  "#2FA77A",
  "#2C8AD3",
  "#7C3AED",
  "#059669",
  "#DC2626",
  "#9333EA",
];
const getAvatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const formatDate = (v?: string | null) =>
  v
    ? new Date(v).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const statusColors: Record<
  string,
  "success" | "warning" | "error" | "info" | "default"
> = {
  Active: "success",
  "On Leave": "warning",
  Inactive: "default",
  Suspended: "error",
  "Pending Verification": "info",
};

/* ─────────────────── sub-components ─────────────────── */

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{
      py: 0.9,
      borderBottom: "1px solid",
      borderColor: "rgba(15,23,42,0.06)",
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{ fontWeight: 600, textAlign: "right", ml: 1 }}
    >
      {value ?? "—"}
    </Typography>
  </Stack>
);

const TabPanel = ({
  value,
  tab,
  children,
}: {
  value: string;
  tab: string;
  children: React.ReactNode;
}) => (value === tab ? <Box sx={{ mt: 0 }}>{children}</Box> : null);

const SectionTitle = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
    <Box sx={{ color: "primary.main" }}>{icon}</Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
      {title}
    </Typography>
  </Stack>
);

const DayPill = ({ day, active }: { day: string; active: boolean }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.45,
        borderRadius: 999,
        fontSize: "0.75rem",
        fontWeight: 700,
        border: "1.5px solid",
        borderColor: active ? "primary.main" : "divider",
        backgroundColor: active
          ? alpha(theme.palette.primary.main, 0.1)
          : "transparent",
        color: active ? "primary.main" : "text.disabled",
      }}
    >
      {day}
    </Box>
  );
};

/* ─────────────────── mock derived data ─────────────────── */

const mockConsultations = [
  {
    id: "C001",
    patient: "Aarav Singh",
    type: "OPD Consultation",
    date: "2026-02-28",
    complaint: "Chest pain follow-up",
    outcome: "Completed",
  },
  {
    id: "C002",
    patient: "Priya Patel",
    type: "Telemedicine",
    date: "2026-02-26",
    complaint: "Hypertension review",
    outcome: "Completed",
  },
  {
    id: "C003",
    patient: "Rahul Verma",
    type: "OPD Consultation",
    date: "2026-02-24",
    complaint: "ECG abnormality",
    outcome: "Referred",
  },
  {
    id: "C004",
    patient: "Sunita Sharma",
    type: "IPD Round",
    date: "2026-02-22",
    complaint: "Post-op cardiac care",
    outcome: "Completed",
  },
  {
    id: "C005",
    patient: "Anil Kumar",
    type: "OPD Consultation",
    date: "2026-02-20",
    complaint: "Breathlessness on exertion",
    outcome: "Completed",
  },
];

const mockDocuments = [
  {
    name: "Medical Council Registration Certificate",
    type: "PDF",
    issued: "2020-06-15",
    status: "Valid",
  },
  {
    name: "MBBS Degree Certificate",
    type: "PDF",
    issued: "2010-05-20",
    status: "Verified",
  },
  {
    name: "MD (Specialty) Degree Certificate",
    type: "PDF",
    issued: "2014-08-10",
    status: "Verified",
  },
  {
    name: "Hospital Employment Contract",
    type: "PDF",
    issued: "2022-01-01",
    status: "Active",
  },
  {
    name: "Aadhaar / ID Proof",
    type: "PDF",
    issued: "2019-03-05",
    status: "Verified",
  },
];

const mockReviews = [
  {
    patient: "Anonymous Patient",
    rating: 5,
    comment: "Excellent diagnosis, very empathetic and thorough.",
    date: "2026-02-10",
  },
  {
    patient: "Anonymous Patient",
    rating: 4,
    comment: "Explained everything clearly, wait time was a bit long.",
    date: "2026-01-28",
  },
  {
    patient: "Anonymous Patient",
    rating: 5,
    comment: "Highly professional. Recommended the right tests.",
    date: "2026-01-15",
  },
  {
    patient: "Anonymous Patient",
    rating: 4,
    comment: "Very knowledgeable and caring doctor.",
    date: "2025-12-20",
  },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SCHEDULE_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

/* ─────────────────── main page ─────────────────── */

export default function DoctorProfilePage() {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorIdParam = searchParams.get("doctorId") ?? "";
  const doctor = getDoctorById(doctorIdParam);

  const cardShadow = "0 12px 24px rgba(15,23,42,0.06)";
  const lightBorder = `1px solid ${alpha(theme.palette.text.primary, 0.05)}`;
  const dividerSx = {
    my: 1.5,
    borderColor: alpha(theme.palette.text.primary, 0.08),
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "schedule", label: "Schedule" },
    { id: "consultations", label: "Consultations" },
    { id: "documents", label: "Documents" },
    { id: "reviews", label: "Reviews" },
    { id: "cases", label: "Patient Cases" },
  ];

  /* ── Patient Cases — seeded mock data per doctor ── */

  // Static pools for generating realistic cases
  const MOCK_PATIENT_NAMES = [
    "Aarav Singh",
    "Priya Sharma",
    "Rahul Verma",
    "Sunita Patel",
    "Karan Mehta",
    "Deepa Iyer",
    "Anil Reddy",
    "Meena Joshi",
    "Vijay Nair",
    "Lakshmi Kumar",
    "Sameer Gupta",
    "Pooja Agarwal",
    "Ravi Malhotra",
    "Anjali Bose",
    "Nikhil Shah",
    "Shreya Rao",
    "Dinesh Pillai",
    "Kavita Sinha",
    "Arjun Tiwari",
    "Rekha Desai",
  ];
  const MOCK_COMPLAINTS = [
    "Chest pain and shortness of breath",
    "Persistent headache and dizziness",
    "Fever with body ache for 3 days",
    "Knee pain and swelling after fall",
    "Abdominal pain and nausea",
    "High blood pressure — routine check",
    "Diabetes medication review",
    "Post-op wound assessment",
    "Sore throat and ear pain",
    "Back pain radiating to left leg",
    "Skin rash with itching",
    "Vision blurring for 2 weeks",
    "Palpitations and anxiety",
    "Joint stiffness — morning onset",
    "Cough with blood-tinged sputum",
  ];
  const MOCK_TRIAGE = [
    "Patient stable, vitals reviewed, awaiting consultation.",
    "Elevated BP noted. ECG ordered on priority.",
    "Fasting sugar high. Endocrinology review pending.",
    "Mild tachycardia. IV access established.",
    "Patient anxious. Reassured and settled in queue.",
    "SpO₂ borderline at 94%, oxygen support initiated.",
    "No acute distress. Scheduled routine follow-up.",
    "Post-operative site inspected; no signs of infection.",
    "Severe pain score 7/10. Analgesia given.",
  ];
  const MOCK_STATUSES: AppointmentStatus[] = [
    "In Consultation",
    "Checked-In",
    "In Triage",
    "Scheduled",
    "Completed",
    "Scheduled",
    "No Show",
    "Checked-In",
    "Completed",
  ];
  const MOCK_VISIT_TYPES: ("New" | "Follow-up" | "Review")[] = [
    "New",
    "Follow-up",
    "Review",
  ];
  const MOCK_PAYERS: ("General" | "Insurance" | "Corporate")[] = [
    "General",
    "Insurance",
    "Corporate",
  ];
  const MOCK_PRIORITIES: ("Routine" | "Urgent")[] = [
    "Routine",
    "Urgent",
    "Routine",
    "Routine",
  ];
  const MOCK_ENC_STATUSES: EncounterStatus[] = [
    "IN_PROGRESS",
    "ARRIVED",
    "IN_QUEUE",
    "BOOKED",
    "COMPLETED",
    "ARRIVED",
    "CANCELLED",
    "ARRIVED",
    "COMPLETED",
  ];

  // Seeded random based on doctor id to ensure stable display per doctor
  const seedStr = doctor?.id ?? "default";
  const seedNum = seedStr
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rng = (() => {
    let s = seedNum % 2147483647 || 17;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  })();

  // Generate 4-8 mock cases for this doctor
  const mockCaseCount = 4 + Math.floor(rng() * 5);
  const today = new Date();
  const formatD = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  type MockCase = {
    id: string;
    patientName: string;
    mrn: string;
    ageGender: string;
    status: AppointmentStatus;
    visitType: "New" | "Follow-up" | "Review";
    payerType: "General" | "Insurance" | "Corporate";
    chiefComplaint: string;
    time: string;
    date: string;
    isUrgent: boolean;
    encounterStatus: EncounterStatus;
    vitals: { bp: string; hr: string; spo2: string; temp: string } | null;
    triageNote: string | null;
    department: string;
  };

  const doctorCases: MockCase[] = Array.from(
    { length: mockCaseCount },
    (_, i) => {
      const nameIdx = Math.floor(rng() * MOCK_PATIENT_NAMES.length);
      const complaintIdx = Math.floor(rng() * MOCK_COMPLAINTS.length);
      const triageIdx = Math.floor(rng() * MOCK_TRIAGE.length);
      const statusIdx = i % MOCK_STATUSES.length;
      const visitIdx = Math.floor(rng() * MOCK_VISIT_TYPES.length);
      const payerIdx = Math.floor(rng() * MOCK_PAYERS.length);
      const priorityIdx = Math.floor(rng() * MOCK_PRIORITIES.length);
      const encStatusIdx = i % MOCK_ENC_STATUSES.length;
      const ageDays = Math.floor(rng() * 10) - 3;
      const date = new Date(today);
      date.setDate(date.getDate() + ageDays);
      const hour = 9 + Math.floor(rng() * 8);
      const min = [0, 15, 30, 45][Math.floor(rng() * 4)];
      const hasVitals = rng() > 0.3;
      const age = 20 + Math.floor(rng() * 55);
      const gender = rng() > 0.5 ? "Male" : "Female";
      const mrnNum = 200000 + Math.floor(rng() * 80000);

      return {
        id: `mc-${seedNum}-${i}`,
        patientName: MOCK_PATIENT_NAMES[nameIdx],
        mrn: `MRN-${mrnNum}`,
        ageGender: `${age} / ${gender}`,
        status: MOCK_STATUSES[statusIdx],
        visitType: MOCK_VISIT_TYPES[visitIdx],
        payerType: MOCK_PAYERS[payerIdx],
        chiefComplaint: MOCK_COMPLAINTS[complaintIdx],
        time: `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
        date: formatD(date),
        isUrgent: MOCK_PRIORITIES[priorityIdx] === "Urgent",
        encounterStatus: MOCK_ENC_STATUSES[encStatusIdx],
        vitals: hasVitals
          ? {
              bp: `${110 + Math.floor(rng() * 50)}/${70 + Math.floor(rng() * 20)}`,
              hr: `${62 + Math.floor(rng() * 45)} bpm`,
              spo2: `${94 + Math.floor(rng() * 6)}%`,
              temp: `${(98 + rng() * 2).toFixed(1)} F`,
            }
          : null,
        triageNote: rng() > 0.35 ? MOCK_TRIAGE[triageIdx] : null,
        department: doctor?.department ?? "General",
      };
    },
  );

  // Merge with real OPD data if any, real data comes first
  const realAppts = OPD_APPOINTMENTS.filter((a) => a.provider === doctor?.name);
  const realEncounters = OPD_ENCOUNTERS.filter(
    (e) => e.doctor === doctor?.name,
  );

  const appointmentStatusColorMap: Record<
    AppointmentStatus,
    "default" | "info" | "warning" | "success" | "error"
  > = {
    Pending: "warning",
    Scheduled: "default",
    "Checked-In": "info",
    "In Triage": "warning",
    "In Consultation": "warning",
    Completed: "success",
    "No Show": "error",
    Cancelled: "error",
  };

  const encounterStatusLabel: Record<EncounterStatus, string> = {
    BOOKED: "Booked",
    ARRIVED: "Arrived",
    IN_QUEUE: "In Queue",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  // Use real data if matched, else use mock cases
  const displayCases =
    realAppts.length > 0
      ? realAppts.map((appt) => {
          const enc = realEncounters.find((e) => e.appointmentId === appt.id);
          return {
            id: appt.id,
            patientName: appt.patientName,
            mrn: appt.mrn,
            ageGender: appt.ageGender,
            status: appt.status,
            visitType: appt.visitType,
            payerType: appt.payerType,
            chiefComplaint: appt.chiefComplaint,
            time: appt.time,
            date: appt.date,
            isUrgent: enc?.queuePriority === "Urgent",
            encounterStatus: enc?.status ?? null,
            vitals: enc ? enc.vitals : null,
            triageNote: enc?.triageNote ?? null,
            department: appt.department,
          };
        })
      : doctorCases;

  const caseKpis = {
    total: displayCases.length,
    active: displayCases.filter((c) =>
      ["In Triage", "In Consultation", "Checked-In"].includes(
        c.status as string,
      ),
    ).length,
    completed: displayCases.filter((c) => c.status === "Completed").length,
    noShow: displayCases.filter((c) => c.status === "No Show").length,
  };
  const [activeTab, setActiveTab] = React.useState("overview");

  const activeDays = doctor?.availableDays?.split(",").filter(Boolean) ?? [];

  /* ── no-doctor state ── */
  if (!doctor) {
    return (
      <PageTemplate title="Doctor Profile" currentPageTitle="Profile">
        <Card
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: "center",
            boxShadow: cardShadow,
          }}
        >
          <MedicalServicesIcon
            sx={{ fontSize: 52, color: "primary.main", mb: 2, opacity: 0.6 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            No Doctor Selected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Search for a doctor below or browse from the Doctor List page.
          </Typography>
          <Box sx={{ maxWidth: 520, mx: "auto", mb: 3 }}>
            <GlobalDoctorSearch placeholder="Search by name, ID, specialization..." />
          </Box>
          <Stack
            direction="row"
            spacing={1.5}
            justifyContent="center"
            flexWrap="wrap"
          >
            <Button
              variant="contained"
              onClick={() => router.push("/doctors/list")}
            >
              Go to Doctor List
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push("/doctors/registration")}
            >
              Register New Doctor
            </Button>
          </Stack>
        </Card>
      </PageTemplate>
    );
  }

  /* ── full profile ── */
  return (
    <PageTemplate title="Doctor Profile" currentPageTitle="Profile">
      <Stack spacing={2.5}>
        {/* ── Hero Header Card ── */}
        <Card
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            overflow: "hidden",
            backgroundColor: softSurface,
            boxShadow: cardShadow,
          }}
        >
          {/* Gradient banner */}
          <Box sx={{}} />
          <Box sx={{}}>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", lg: "center" }}
              justifyContent="space-between"
            >
              {/* Avatar + Info */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: getAvatarColor(doctor.firstName),
                    fontSize: 26,
                    fontWeight: 800,
                    border: "4px solid",
                    borderColor: "background.paper",
                    // mt: -5,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                  }}
                >
                  {doctor.firstName[0]}
                  {doctor.lastName[0]}
                </Avatar>
                <Box sx={{ mt: { xs: 0, sm: -1.5 } }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, lineHeight: 1.2 }}
                  >
                    {doctor.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.25 }}
                  >
                    {doctor.designation} · {doctor.department}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    sx={{ mt: 1 }}
                    useFlexGap
                  >
                    <Chip
                      label={doctor.status}
                      size="small"
                      color={statusColors[doctor.status]}
                      sx={{ fontWeight: 700 }}
                    />
                    <Chip
                      label={doctor.doctorType}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                    <Chip
                      label={doctor.primarySpecialization}
                      size="small"
                      variant="outlined"
                    />
                    {doctor.telemedicine && (
                      <Chip
                        icon={<VideocamIcon sx={{ fontSize: 13 }} />}
                        label="Telemedicine"
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    )}
                    <Chip
                      label={
                        doctor.registrationCountry === "india"
                          ? "🇮🇳 India"
                          : "🌍 International"
                      }
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </Box>
              </Stack>

              {/* Action Buttons */}
              <Stack
                direction={{ xs: "row", sm: "row" }}
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                alignSelf={{ xs: "stretch", lg: "center" }}
              >
                <Button
                  variant="contained"
                  startIcon={<EventNoteIcon />}
                  onClick={() =>
                    router.push(`/appointments/calendar?doctor=${doctor.id}`)
                  }
                >
                  Book Appointment
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    router.push(`/doctors/registration?edit=${doctor.id}`)
                  }
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (typeof window !== "undefined") window.print();
                  }}
                >
                  Print
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Card>

        {/* ── Stat Cards ── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2,1fr)",
              lg: "repeat(4,1fr)",
            },
            gap: 2,
          }}
        >
          <StatTile
            label="Total Patients"
            value={doctor.totalPatients}
            subtitle={`${doctor.yearsOfExperience} yrs experience`}
            icon={<PeopleIcon fontSize="small" />}
            tone="primary"
            sx={{ boxShadow: cardShadow }}
          />
          <StatTile
            label="Today's Appointments"
            value={doctor.todayAppointments}
            subtitle="Scheduled for today"
            icon={<CalendarMonthIcon fontSize="small" />}
            tone="info"
            sx={{ boxShadow: cardShadow }}
          />
          <StatTile
            label="Patient Rating"
            value={`${doctor.rating} / 5`}
            subtitle={`${mockReviews.length} reviews`}
            icon={<StarIcon fontSize="small" />}
            tone="warning"
            sx={{ boxShadow: cardShadow }}
          />
          <StatTile
            label="OPD Fee"
            value={`₹${doctor.consultationFee}`}
            subtitle="Per consultation"
            icon={<MedicalServicesIcon fontSize="small" />}
            tone="success"
            sx={{ boxShadow: cardShadow }}
          />
        </Box>

        {/* ── Two-column layout ── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "360px 1fr" },
            gap: 2,
            alignItems: "start",
          }}
        >
          {/* ── LEFT SIDEBAR ── */}
          <Stack spacing={2}>
            {/* License & Credentials */}
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: cardShadow,
                backgroundColor: "background.paper",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <VerifiedUserIcon fontSize="small" color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  License &amp; Credentials
                </Typography>
              </Stack>
              <Divider sx={dividerSx} />
              {/* License card */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  color: "#fff",
                  mb: 2,
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {doctor.registrationCountry === "india"
                    ? "NMC / SMC Registration"
                    : "Medical License"}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.25 }}>
                  {doctor.licenseNumber}
                </Typography>
                <Grid container spacing={1} sx={{ mt: 0.75 }}>
                  <Grid xs={6}>
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                      Doctor ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {doctor.doctorId}
                    </Typography>
                  </Grid>
                  <Grid xs={6}>
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                      Expiry
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {formatDate(doctor.licenseExpiry)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              <Stack spacing={0}>
                <InfoRow label="Qualification" value={doctor.qualifications} />
                <InfoRow
                  label="Specialization"
                  value={doctor.primarySpecialization}
                />
                <InfoRow label="Designation" value={doctor.designation} />
                <InfoRow
                  label="Experience"
                  value={`${doctor.yearsOfExperience} years`}
                />
                <InfoRow
                  label="Registration"
                  value={
                    doctor.registrationCountry === "india"
                      ? "🇮🇳 India"
                      : "🌍 International"
                  }
                />
              </Stack>
            </Card>

            {/* Contact & Personal */}
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: cardShadow,
                backgroundColor: "background.paper",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneIcon fontSize="small" color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Contact &amp; Personal
                </Typography>
              </Stack>
              <Divider sx={dividerSx} />
              <Stack spacing={0}>
                <InfoRow
                  label="Mobile"
                  value={
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <PhoneIcon
                        sx={{ fontSize: 13, color: "text.secondary" }}
                      />
                      <span>{doctor.mobile}</span>
                    </Stack>
                  }
                />
                <InfoRow
                  label="Email"
                  value={
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <EmailIcon
                        sx={{ fontSize: 13, color: "text.secondary" }}
                      />
                      <span style={{ wordBreak: "break-all" }}>
                        {doctor.email}
                      </span>
                    </Stack>
                  }
                />
                <InfoRow label="Gender" value={doctor.gender} />
                <InfoRow label="Age" value={`${doctor.age} yrs`} />
                <InfoRow
                  label="Languages"
                  value={
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <LanguageIcon
                        sx={{ fontSize: 13, color: "text.secondary" }}
                      />
                      <span>{doctor.languages}</span>
                    </Stack>
                  }
                />
                <InfoRow label="Joined" value={formatDate(doctor.joinedDate)} />
                <InfoRow
                  label="Last Active"
                  value={formatDate(doctor.lastActive)}
                />
              </Stack>
            </Card>

            {/* Availability */}
            <Card
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: cardShadow,
                backgroundColor: "background.paper",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeIcon fontSize="small" color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Availability
                </Typography>
              </Stack>
              <Divider sx={dividerSx} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: "block" }}
              >
                Working Days
              </Typography>
              <Stack
                direction="row"
                spacing={0.75}
                flexWrap="wrap"
                useFlexGap
                sx={{ mb: 2 }}
              >
                {DAYS.map((d) => (
                  <DayPill key={d} day={d} active={activeDays.includes(d)} />
                ))}
              </Stack>
              <Stack spacing={0}>
                <InfoRow
                  label="Telemedicine"
                  value={
                    doctor.telemedicine ? (
                      <Chip label="Available" size="small" color="info" />
                    ) : (
                      <Chip
                        label="Not Available"
                        size="small"
                        variant="outlined"
                      />
                    )
                  }
                />
                <InfoRow
                  label="Today's Slots"
                  value={`${doctor.todayAppointments} booked`}
                />
              </Stack>
            </Card>
          </Stack>

          {/* ── RIGHT TABS ── */}
          <Stack spacing={0}>
            <Card
              elevation={0}
              sx={{
                p: 0,
                borderRadius: 2,
                boxShadow: cardShadow,
                backgroundColor: "background.paper",
              }}
            >
              <Box sx={{ px: 0.5, py: 0.5, borderBottom: lightBorder }}>
                <CommonTabs
                  tabs={tabs}
                  value={activeTab}
                  onChange={setActiveTab}
                  sx={{ px: 0.5, "& .MuiTab-root": { minHeight: 40, px: 2 } }}
                />
              </Box>

              <Box sx={{ p: 2.5 }}>
                {/* ── OVERVIEW TAB ── */}
                <TabPanel value={activeTab} tab="overview">
                  <SectionTitle
                    icon={<MedicalServicesIcon fontSize="small" />}
                    title="Professional Summary"
                  />
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      border: lightBorder,
                      mb: 2.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ lineHeight: 1.8, color: "text.secondary" }}
                    >
                      {doctor.name} is a highly experienced{" "}
                      <strong>{doctor.designation}</strong> specializing in{" "}
                      <strong>{doctor.primarySpecialization}</strong> with over{" "}
                      <strong>{doctor.yearsOfExperience} years</strong> of
                      clinical practice. Currently attached to the{" "}
                      <strong>{doctor.department}</strong> department,{" "}
                      {doctor.gender === "Male" ? "he" : "she"} has managed over{" "}
                      <strong>{doctor.totalPatients.toLocaleString()}</strong>{" "}
                      patients and holds a patient satisfaction rating of{" "}
                      <strong>{doctor.rating}/5</strong>.{" "}
                      {doctor.telemedicine &&
                        "Also available for telemedicine consultations."}
                    </Typography>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2.5 }}>
                    {[
                      {
                        icon: <SchoolIcon fontSize="small" />,
                        label: "Qualification",
                        value: doctor.qualifications,
                      },
                      {
                        icon: <WorkHistoryIcon fontSize="small" />,
                        label: "Experience",
                        value: `${doctor.yearsOfExperience} Years`,
                      },
                      {
                        icon: <AssignmentIcon fontSize="small" />,
                        label: "Department",
                        value: doctor.department,
                      },
                      {
                        icon: <LanguageIcon fontSize="small" />,
                        label: "Languages",
                        value: doctor.languages,
                      },
                    ].map((item) => (
                      <Grid key={item.label} xs={12} sm={6}>
                        <Box
                          sx={{
                            p: 1.75,
                            borderRadius: 1.5,
                            border: lightBorder,
                            display: "flex",
                            gap: 1.25,
                            alignItems: "flex-start",
                            transition:
                              "transform .18s ease, box-shadow .18s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1,
                              display: "grid",
                              placeItems: "center",
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: "primary.main",
                              flexShrink: 0,
                              mt: 0.1,
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, mt: 0.15 }}
                            >
                              {item.value}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider sx={{ mb: 2.5 }} />

                  <SectionTitle
                    icon={<CalendarMonthIcon fontSize="small" />}
                    title="Recent Consultations"
                  />
                  <Stack spacing={1.25}>
                    {mockConsultations.slice(0, 3).map((c) => (
                      <Box
                        key={c.id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "80px 1fr auto",
                          },
                          gap: 1.5,
                          p: 1.75,
                          borderRadius: 2,
                          border: lightBorder,
                          backgroundColor: alpha(
                            theme.palette.text.primary,
                            0.02,
                          ),
                          position: "relative",
                          "&:before": {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: 3,
                            height: "100%",
                            borderTopLeftRadius: 8,
                            borderBottomLeftRadius: 8,
                            backgroundColor: theme.palette.primary.main,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            p: 0.75,
                            borderRadius: 1.5,
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.08,
                            ),
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 800,
                              color: "primary.main",
                              fontSize: 22,
                            }}
                          >
                            {new Date(c.date).getDate()}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "primary.main", fontWeight: 600 }}
                          >
                            {new Date(c.date).toLocaleDateString("en-IN", {
                              month: "short",
                            })}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700 }}
                          >
                            {c.patient}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {c.complaint}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            {c.type}
                          </Typography>
                        </Box>
                        <Chip
                          label={c.outcome}
                          size="small"
                          color={
                            c.outcome === "Completed" ? "success" : "warning"
                          }
                          variant="outlined"
                        />
                      </Box>
                    ))}
                  </Stack>
                </TabPanel>

                {/* ── SCHEDULE TAB ── */}
                <TabPanel value={activeTab} tab="schedule">
                  <SectionTitle
                    icon={<EventNoteIcon fontSize="small" />}
                    title="Weekly Schedule"
                  />
                  <Box sx={{ overflowX: "auto" }}>
                    <Box sx={{ minWidth: 560 }}>
                      {/* Header row */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: `80px repeat(${DAYS.length}, 1fr)`,
                          gap: 0.5,
                          mb: 0.5,
                        }}
                      >
                        <Box />
                        {DAYS.map((d) => (
                          <Box
                            key={d}
                            sx={{
                              py: 0.75,
                              textAlign: "center",
                              borderRadius: 1,
                              backgroundColor: activeDays.includes(d)
                                ? alpha(theme.palette.primary.main, 0.1)
                                : alpha(theme.palette.text.primary, 0.03),
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: activeDays.includes(d)
                                  ? "primary.main"
                                  : "text.disabled",
                              }}
                            >
                              {d}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      {/* Slot rows */}
                      {SCHEDULE_SLOTS.map((slot, si) => (
                        <Box
                          key={slot}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: `80px repeat(${DAYS.length}, 1fr)`,
                            gap: 0.5,
                            mb: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              pr: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 600 }}
                            >
                              {slot}
                            </Typography>
                          </Box>
                          {DAYS.map((d) => {
                            const isActive = activeDays.includes(d);
                            const isBooked = isActive && si % 3 === 0;
                            const isBlocked = isActive && si % 7 === 5;
                            return (
                              <Box
                                key={d}
                                sx={{
                                  height: 32,
                                  borderRadius: 1,
                                  backgroundColor: !isActive
                                    ? alpha(theme.palette.text.primary, 0.03)
                                    : isBlocked
                                      ? alpha(theme.palette.warning.main, 0.15)
                                      : isBooked
                                        ? alpha(theme.palette.primary.main, 0.2)
                                        : alpha(
                                            theme.palette.success.main,
                                            0.1,
                                          ),
                                  border: "1px solid",
                                  borderColor: !isActive
                                    ? "transparent"
                                    : isBlocked
                                      ? alpha(theme.palette.warning.main, 0.3)
                                      : isBooked
                                        ? alpha(theme.palette.primary.main, 0.3)
                                        : alpha(
                                            theme.palette.success.main,
                                            0.25,
                                          ),
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {isActive && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: "0.6rem",
                                      fontWeight: 700,
                                      color: isBlocked
                                        ? "warning.dark"
                                        : isBooked
                                          ? "primary.main"
                                          : "success.main",
                                    }}
                                  >
                                    {isBlocked
                                      ? "Break"
                                      : isBooked
                                        ? "Booked"
                                        : "Open"}
                                  </Typography>
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                      ))}

                      {/* Legend */}
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{ mt: 2 }}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {[
                          {
                            color: alpha(theme.palette.success.main, 0.2),
                            border: alpha(theme.palette.success.main, 0.3),
                            label: "Open",
                          },
                          {
                            color: alpha(theme.palette.primary.main, 0.2),
                            border: alpha(theme.palette.primary.main, 0.3),
                            label: "Booked",
                          },
                          {
                            color: alpha(theme.palette.warning.main, 0.15),
                            border: alpha(theme.palette.warning.main, 0.3),
                            label: "Break",
                          },
                          {
                            color: alpha(theme.palette.text.primary, 0.03),
                            border: "transparent",
                            label: "Off Day",
                          },
                        ].map((l) => (
                          <Stack
                            key={l.label}
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 14,
                                height: 14,
                                borderRadius: 0.5,
                                backgroundColor: l.color,
                                border: `1px solid ${l.border}`,
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {l.label}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                </TabPanel>

                {/* ── CONSULTATIONS TAB ── */}
                <TabPanel value={activeTab} tab="consultations">
                  <SectionTitle
                    icon={<AssignmentIcon fontSize="small" />}
                    title="Consultation History"
                  />
                  <Stack spacing={1.5}>
                    {mockConsultations.map((c) => (
                      <Box
                        key={c.id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "80px 1fr 130px",
                          },
                          gap: 2,
                          p: 2,
                          borderRadius: 2,
                          border: lightBorder,
                          backgroundColor: "background.paper",
                          position: "relative",
                          "&:before": {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: 4,
                            height: "100%",
                            borderTopLeftRadius: 8,
                            borderBottomLeftRadius: 8,
                            backgroundColor:
                              c.outcome === "Completed"
                                ? theme.palette.success.main
                                : theme.palette.warning.main,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1.5,
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.08,
                            ),
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 800,
                              color: "primary.main",
                              fontSize: 26,
                            }}
                          >
                            {new Date(c.date).getDate()}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "primary.main", fontWeight: 700 }}
                          >
                            {new Date(c.date).toLocaleDateString("en-IN", {
                              month: "short",
                              year: "2-digit",
                            })}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700 }}
                          >
                            {c.patient}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.3 }}
                          >
                            {c.complaint}
                          </Typography>
                          <Chip
                            label={c.type}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5, fontSize: "0.68rem" }}
                          />
                        </Box>
                        <Stack
                          alignItems={{ xs: "flex-start", sm: "flex-end" }}
                          justifyContent="center"
                        >
                          <Chip
                            label={c.outcome}
                            size="small"
                            color={
                              c.outcome === "Completed" ? "success" : "warning"
                            }
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            Ref: {c.id}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </TabPanel>

                {/* ── DOCUMENTS TAB ── */}
                <TabPanel value={activeTab} tab="documents">
                  <SectionTitle
                    icon={<DescriptionIcon fontSize="small" />}
                    title="Credentials &amp; Documents"
                  />
                  <TableContainer sx={{ borderRadius: 2, overflow: "hidden" }}>
                    <Table
                      size="small"
                      sx={{
                        "& .MuiTableCell-root": {
                          borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
                        },
                        "& .MuiTableRow-root:last-of-type .MuiTableCell-root": {
                          borderBottom: "none",
                        },
                      }}
                    >
                      <TableHead
                        sx={{
                          "& .MuiTableCell-root": {
                            fontWeight: 700,
                            textTransform: "uppercase",
                            fontSize: "0.75rem",
                            letterSpacing: "0.04em",
                            color: "text.secondary",
                            backgroundColor: alpha(
                              theme.palette.text.primary,
                              0.04,
                            ),
                            borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                          },
                        }}
                      >
                        <TableRow>
                          <TableCell>Document</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Issued / Updated</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockDocuments.map((doc) => (
                          <TableRow
                            key={doc.name}
                            sx={{
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.text.primary,
                                  0.02,
                                ),
                              },
                            }}
                          >
                            <TableCell>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Box
                                  sx={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 1,
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.1,
                                    ),
                                    color: "primary.main",
                                    flexShrink: 0,
                                  }}
                                >
                                  <DescriptionIcon sx={{ fontSize: 16 }} />
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {doc.name}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {doc.type}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(doc.issued)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={doc.status}
                                size="small"
                                color={
                                  doc.status === "Valid" ||
                                  doc.status === "Verified" ||
                                  doc.status === "Active"
                                    ? "success"
                                    : "default"
                                }
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Button size="small" variant="text">
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>

                {/* ── REVIEWS TAB ── */}
                <TabPanel value={activeTab} tab="reviews">
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                  >
                    <SectionTitle
                      icon={<StarIcon fontSize="small" />}
                      title="Patient Reviews"
                    />
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: alpha(
                          theme.palette.warning.main,
                          0.08,
                        ),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.25)}`,
                        textAlign: "center",
                        minWidth: 110,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <StarIcon sx={{ fontSize: 22, color: "#F3C44E" }} />
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            color: "text.primary",
                            lineHeight: 1,
                          }}
                        >
                          {doctor.rating}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {mockReviews.length} reviews
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={1.5}>
                    {mockReviews.map((review, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: lightBorder,
                          backgroundColor: alpha(
                            theme.palette.text.primary,
                            0.02,
                          ),
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          sx={{ mb: 0.75 }}
                        >
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            {Array.from({ length: 5 }).map((_, i) => (
                              <StarIcon
                                key={i}
                                sx={{
                                  fontSize: 15,
                                  color:
                                    i < review.rating
                                      ? "#F3C44E"
                                      : alpha(theme.palette.text.primary, 0.15),
                                }}
                              />
                            ))}
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(review.date)}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", lineHeight: 1.7 }}
                        >
                          "{review.comment}"
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ mt: 0.5, display: "block" }}
                        >
                          — {review.patient}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </TabPanel>

                {/* ── PATIENT CASES TAB ── */}
                <TabPanel value={activeTab} tab="cases">
                  {/* KPI Strip */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr 1fr",
                        sm: "repeat(4, 1fr)",
                      },
                      gap: 1.5,
                      mb: 3,
                    }}
                  >
                    {[
                      {
                        label: "Total Patients",
                        value: caseKpis.total,
                        icon: <PeopleIcon fontSize="small" />,
                        color: theme.palette.primary.main,
                        bg: alpha(theme.palette.primary.main, 0.08),
                      },
                      {
                        label: "Active Now",
                        value: caseKpis.active,
                        icon: (
                          <FiberManualRecordIcon
                            fontSize="small"
                            sx={{ color: theme.palette.warning.main }}
                          />
                        ),
                        color: theme.palette.warning.main,
                        bg: alpha(theme.palette.warning.main, 0.08),
                      },
                      {
                        label: "Completed",
                        value: caseKpis.completed,
                        icon: <LocalHospitalIcon fontSize="small" />,
                        color: theme.palette.success.main,
                        bg: alpha(theme.palette.success.main, 0.08),
                      },
                      {
                        label: "No Show",
                        value: caseKpis.noShow,
                        icon: <PriorityHighIcon fontSize="small" />,
                        color: theme.palette.error.main,
                        bg: alpha(theme.palette.error.main, 0.08),
                      },
                    ].map((kpi) => (
                      <Box
                        key={kpi.label}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: kpi.bg,
                          border: `1px solid ${alpha(kpi.color, 0.18)}`,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          transition:
                            "transform 0.18s ease, box-shadow 0.18s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: `0 6px 20px ${alpha(kpi.color, 0.14)}`,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: kpi.color,
                            color: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          {kpi.icon}
                        </Box>
                        <Box>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 800,
                              color: kpi.color,
                              lineHeight: 1,
                            }}
                          >
                            {kpi.value}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 500 }}
                          >
                            {kpi.label}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Case Cards */}
                  <SectionTitle
                    icon={<FavoriteIcon fontSize="small" />}
                    title="Patient Case List"
                  />

                  <Stack spacing={1.5}>
                    {displayCases.map((c) => {
                      const statusColor =
                        appointmentStatusColorMap[
                          c.status as AppointmentStatus
                        ] ?? "default";
                      return (
                        <Box
                          key={c.id}
                          sx={{
                            borderRadius: 2.5,
                            border: lightBorder,
                            backgroundColor: "background.paper",
                            overflow: "hidden",
                            boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
                            transition:
                              "transform 0.18s ease, box-shadow 0.18s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: "0 8px 28px rgba(15,23,42,0.10)",
                            },
                            position: "relative",
                          }}
                        >
                          {/* Colored left accent bar */}
                          <Box
                            sx={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              width: 4,
                              height: "100%",
                              borderTopLeftRadius: 10,
                              borderBottomLeftRadius: 10,
                              backgroundColor:
                                statusColor === "warning"
                                  ? theme.palette.warning.main
                                  : statusColor === "success"
                                    ? theme.palette.success.main
                                    : statusColor === "error"
                                      ? theme.palette.error.main
                                      : statusColor === "info"
                                        ? theme.palette.info.main
                                        : theme.palette.divider,
                            }}
                          />

                          <Box sx={{ pl: 2.5, pr: 2, pt: 2, pb: 1.5 }}>
                            {/* Header row — patient + status */}
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={2}
                              alignItems={{ xs: "flex-start", sm: "center" }}
                              justifyContent="space-between"
                            >
                              {/* Patient identity */}
                              <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                              >
                                <Avatar
                                  sx={{
                                    width: 44,
                                    height: 44,
                                    fontWeight: 800,
                                    fontSize: 15,
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.15,
                                    ),
                                    color: "primary.main",
                                    border: `2px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                                  }}
                                >
                                  {c.patientName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </Avatar>
                                <Box>
                                  <Stack
                                    direction="row"
                                    spacing={0.75}
                                    alignItems="center"
                                    flexWrap="wrap"
                                    useFlexGap
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ fontWeight: 800 }}
                                    >
                                      {c.patientName}
                                    </Typography>
                                    {c.isUrgent && (
                                      <Chip
                                        label="Urgent"
                                        size="small"
                                        color="error"
                                        icon={
                                          <PriorityHighIcon
                                            sx={{ fontSize: "12px !important" }}
                                          />
                                        }
                                        sx={{
                                          fontWeight: 700,
                                          fontSize: "0.65rem",
                                          height: 18,
                                        }}
                                      />
                                    )}
                                  </Stack>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {c.mrn} · {c.ageGender}
                                  </Typography>
                                </Box>
                              </Stack>

                              {/* Status & time */}
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                                useFlexGap
                              >
                                <Chip
                                  label={c.status}
                                  size="small"
                                  color={statusColor}
                                  sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                                />
                                <Chip
                                  label={c.visitType}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: "0.7rem" }}
                                />
                                <Stack
                                  direction="row"
                                  spacing={0.4}
                                  alignItems="center"
                                >
                                  <AccessTimeIcon
                                    sx={{
                                      fontSize: 13,
                                      color: "text.secondary",
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {c.time} · {c.date}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Stack>

                            {/* Chief complaint */}
                            <Box
                              sx={{
                                mt: 1.5,
                                p: 1.25,
                                borderRadius: 1.5,
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.04,
                                ),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <MedicalServicesIcon
                                sx={{
                                  fontSize: 16,
                                  color: "primary.main",
                                  flexShrink: 0,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  lineHeight: 1.5,
                                }}
                              >
                                <strong>Chief Complaint:</strong>{" "}
                                {c.chiefComplaint}
                              </Typography>
                            </Box>

                            {/* Vitals + triage note */}
                            {c.vitals && (
                              <Box sx={{ mt: 1.5 }}>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  flexWrap="wrap"
                                  useFlexGap
                                  sx={{ mb: 1 }}
                                >
                                  {[
                                    { label: "BP", value: c.vitals.bp },
                                    { label: "HR", value: c.vitals.hr },
                                    { label: "SpO₂", value: c.vitals.spo2 },
                                    { label: "Temp", value: c.vitals.temp },
                                  ].map((vital) => (
                                    <Box
                                      key={vital.label}
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.6,
                                        px: 1,
                                        py: 0.4,
                                        borderRadius: 1,
                                        backgroundColor: alpha(
                                          theme.palette.text.primary,
                                          0.04,
                                        ),
                                        border: lightBorder,
                                      }}
                                    >
                                      <MonitorHeartIcon
                                        sx={{
                                          fontSize: 13,
                                          color: "primary.main",
                                        }}
                                      />
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {vital.label}:
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ fontWeight: 700 }}
                                      >
                                        {vital.value}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Stack>

                                {c.triageNote && (
                                  <Box
                                    sx={{
                                      p: 1.25,
                                      borderRadius: 1.5,
                                      backgroundColor: alpha(
                                        theme.palette.info.main,
                                        0.05,
                                      ),
                                      border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ lineHeight: 1.6 }}
                                    >
                                      <strong
                                        style={{
                                          color: theme.palette.info.main,
                                        }}
                                      >
                                        Triage Note:
                                      </strong>{" "}
                                      {c.triageNote}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            )}

                            {/* Footer */}
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{
                                mt: 1.5,
                                pt: 1.25,
                                borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={0.75}
                                alignItems="center"
                                flexWrap="wrap"
                                useFlexGap
                              >
                                <Chip
                                  label={c.payerType}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: "0.65rem", height: 20 }}
                                />
                                {c.encounterStatus && (
                                  <Chip
                                    label={
                                      encounterStatusLabel[
                                        c.encounterStatus as EncounterStatus
                                      ]
                                    }
                                    size="small"
                                    color={
                                      c.encounterStatus === "IN_PROGRESS"
                                        ? "warning"
                                        : c.encounterStatus === "COMPLETED"
                                          ? "success"
                                          : c.encounterStatus === "CANCELLED"
                                            ? "error"
                                            : "default"
                                    }
                                    variant="outlined"
                                    sx={{ fontSize: "0.65rem", height: 20 }}
                                  />
                                )}
                              </Stack>

                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EventNoteIcon />}
                                onClick={() =>
                                  router.push(
                                    `/encounters/enc-${c.id}?mrn=${c.mrn}`,
                                  )
                                }
                                sx={{ fontSize: "0.72rem" }}
                              >
                                View Encounter
                              </Button>
                            </Stack>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </TabPanel>
              </Box>
            </Card>
          </Stack>
        </Box>
      </Stack>
    </PageTemplate>
  );
}
