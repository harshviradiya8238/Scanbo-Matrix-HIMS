"use client";

import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Avatar,
  Paper,
  Select,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  WhatsApp as WhatsAppIcon,
  Sms as SmsIcon,
  NotificationsNone as NotificationsIcon,
  MailOutline as MailIcon,
  Watch as WatchIcon,
  EventNote as EventNoteIcon,
  Medication as MedicationIcon,
  Thermostat as ThermostatIcon,
  Bloodtype as BloodtypeIcon,
  Favorite as FavoriteIcon,
  EmojiEvents as EmojiEventsIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Folder as FolderIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { maskMobileNumber } from "@/src/core/utils/phone";

interface EnrollPatientDialogProps {
  open: boolean;
  onClose: () => void;
  launchMode?: "enroll" | "create-template";
  customProgramTemplates?: CareProgramTemplate[];
  onCreateProgramTemplate?: (program: CareProgramTemplate) => void;
}

export interface CareProgramTemplate {
  id: string;
  name: string;
  description: string;
  duration: string;
  medications: number;
  checkins: string;
  labs: string;
  accentColor: string;
  category?: string;
}

interface CareProgramOption extends CareProgramTemplate {
  icon: React.ReactNode;
  isWho: boolean;
  isBuilder?: boolean;
}

const STEPS = [
  { label: "Select Patient", short: "Patient" },
  { label: "Care Program", short: "Program" },
  { label: "Personalize", short: "Personalize" },
  { label: "Confirm & Activate", short: "Confirm" },
];

const OPD_RECORDS = [
  {
    id: "OPD-3841",
    name: "Vikram Singh",
    age: 62,
    gender: "Male",
    department: "Cardiology",
    condition: "Post-MI (Heart Attack)",
    date: "Mar 8, 2026",
    initials: "VS",
    color: "#1172BA",
    phone: "+91 87654 32109",
  },
  {
    id: "OPD-3892",
    name: "Anita Joshi",
    age: 45,
    gender: "Female",
    department: "Endocrinology",
    condition: "Type 2 Diabetes",
    date: "Mar 9, 2026",
    initials: "AJ",
    color: "#2FA77A",
    phone: "+91 98765 43210",
  },
  {
    id: "OPD-3701",
    name: "Ravi Gupta",
    age: 55,
    gender: "Male",
    department: "Cardiology",
    condition: "Hypertension Stage 2",
    date: "Mar 7, 2026",
    initials: "RG",
    color: "#F39C12",
    phone: "+91 76543 21098",
  },
  {
    id: "OPD-3950",
    name: "Deepa Nair",
    age: 38,
    gender: "Female",
    department: "Orthopaedics",
    condition: "Post Knee Replacement",
    date: "Mar 10, 2026",
    initials: "DN",
    color: "#9B59B6",
    phone: "+91 65432 10987",
  },
  {
    id: "OPD-3777",
    name: "Suresh Patel",
    age: 70,
    gender: "Male",
    department: "Pulmonology",
    condition: "COPD / Asthma",
    date: "Mar 6, 2026",
    initials: "SP",
    color: "#E74C3C",
    phone: "+91 54321 09876",
  },
];

const BASE_CARE_PROGRAMS: CareProgramOption[] = [
  {
    id: "cardiac",
    name: "Post-Cardiac Care",
    description: "Recovery after heart attack or cardiac surgery.",
    duration: "12 Weeks",
    medications: 3,
    checkins: "Daily",
    labs: "Weekly",
    accentColor: "#E74C3C",
    icon: <FavoriteIcon />,
    isWho: true,
    category: "Cardiology",
  },
  {
    id: "diabetes",
    name: "Diabetes Management",
    description: "Blood glucose, HbA1c tracking, insulin adherence.",
    duration: "6 Months",
    medications: 2,
    checkins: "Daily",
    labs: "Bi-weekly",
    accentColor: "#3498DB",
    icon: <BloodtypeIcon />,
    isWho: true,
    category: "Endocrinology",
  },
  {
    id: "hypertension",
    name: "Hypertension Control",
    description: "BP monitoring, medication adherence, lifestyle.",
    duration: "3 Months",
    medications: 2,
    checkins: "Daily",
    labs: "Weekly",
    accentColor: "#E67E22",
    icon: <ThermostatIcon />,
    isWho: true,
    category: "Internal Medicine",
  },
  {
    id: "ortho",
    name: "Post-Ortho Recovery",
    description: "Post joint replacement rehab, pain management.",
    duration: "8 Weeks",
    medications: 1,
    checkins: "3x/week",
    labs: "Weekly",
    accentColor: "#8E44AD",
    icon: <EmojiEventsIcon />,
    isWho: true,
    category: "Orthopaedics",
  },
  {
    id: "mental",
    name: "Mental Health Follow-up",
    description: "Depression/anxiety management, mood tracking.",
    duration: "3 Months",
    medications: 1,
    checkins: "Weekly",
    labs: "Weekly",
    accentColor: "#9B59B6",
    icon: <NotificationsIcon />,
    isWho: true,
    category: "Psychiatry",
  },
  {
    id: "copd",
    name: "COPD / Asthma Care",
    description: "Respiratory monitoring, inhaler adherence, SpO2.",
    duration: "Ongoing",
    medications: 2,
    checkins: "Daily",
    labs: "Monthly",
    accentColor: "#1ABC9C",
    icon: <NotificationsIcon />,
    isWho: true,
    category: "Pulmonology",
  },
  {
    id: "stroke-rehab",
    name: "Stroke Rehabilitation",
    description: "Neuro recovery milestones, physiotherapy and speech tracking.",
    duration: "6 Months",
    medications: 3,
    checkins: "Daily",
    labs: "Weekly",
    accentColor: "#5B5BD6",
    icon: <Box component="span" sx={{ fontSize: 17 }}>🧠</Box>,
    isWho: true,
    category: "Neurology",
  },
  {
    id: "maternal",
    name: "Maternal & Antenatal Care",
    description: "ANC schedule, warning signs, supplements and fetal monitoring.",
    duration: "9 Months",
    medications: 3,
    checkins: "Weekly",
    labs: "Monthly",
    accentColor: "#E83E8C",
    icon: <Box component="span" sx={{ fontSize: 17 }}>🍼</Box>,
    isWho: true,
    category: "Obstetrics",
  },
  {
    id: "ckd",
    name: "CKD / Renal Care",
    description: "Fluid, BP, creatinine trends and renal diet compliance.",
    duration: "Ongoing",
    medications: 2,
    checkins: "Daily",
    labs: "Monthly",
    accentColor: "#4A90E2",
    icon: <Box component="span" sx={{ fontSize: 17 }}>🧬</Box>,
    isWho: true,
    category: "Nephrology",
  },
  {
    id: "hf-management",
    name: "Heart Failure Management",
    description: "Daily weight alerts, edema symptoms and diuretic adherence.",
    duration: "Ongoing",
    medications: 3,
    checkins: "Daily",
    labs: "Weekly",
    accentColor: "#D35454",
    icon: <Box component="span" sx={{ fontSize: 17 }}>🫀</Box>,
    isWho: true,
    category: "Cardiology",
  },
  {
    id: "hiv-art",
    name: "HIV / ART Adherence",
    description: "ART dose reminders, counseling follow-up and viral load checks.",
    duration: "Ongoing",
    medications: 1,
    checkins: "Daily",
    labs: "Bi-weekly",
    accentColor: "#26A69A",
    icon: <Box component="span" sx={{ fontSize: 17 }}>🦠</Box>,
    isWho: true,
    category: "Infectious Disease",
  },
  {
    id: "tb-dots",
    name: "TB Treatment (DOTS)",
    description: "Directly observed therapy schedule and sputum review support.",
    duration: "6 Months",
    medications: 2,
    checkins: "Daily",
    labs: "Monthly",
    accentColor: "#F4A261",
    icon: <Box component="span" sx={{ fontSize: 17 }}>🩺</Box>,
    isWho: true,
    category: "Pulmonology",
  },
  {
    id: "post-discharge-general",
    name: "Post-Discharge General",
    description: "General post-hospital care with vitals and medication reminders.",
    duration: "4 Weeks",
    medications: 2,
    checkins: "Daily",
    labs: "Weekly",
    accentColor: "#2FA77A",
    icon: <Box component="span" sx={{ fontSize: 17 }}>⭐</Box>,
    isWho: false,
    category: "Custom",
  },
  {
    id: "oncology-custom",
    name: "RMD Custom Oncology",
    description: "Chemo side-effect monitoring, hydration and symptom triage.",
    duration: "Ongoing",
    medications: 4,
    checkins: "Daily",
    labs: "Weekly",
    accentColor: "#8B4513",
    icon: <Box component="span" sx={{ fontSize: 17 }}>🏥</Box>,
    isWho: false,
    category: "Custom",
  },
];

const CREATE_NEW_PLAN_OPTION: CareProgramOption = {
  id: "create-custom-plan",
  name: "Create New Plan",
  description: "Build a custom care program from scratch for this patient.",
  duration: "Custom",
  medications: 0,
  checkins: "Custom",
  labs: "Custom",
  accentColor: "#1172BA",
  icon: <AddIcon />,
  isWho: false,
  category: "Custom",
  isBuilder: true,
};

const DURATIONS = [
  "4 Weeks",
  "6 Weeks",
  "8 Weeks",
  "12 Weeks",
  "3 Months",
  "Ongoing",
];
const CHANNELS = [
  { label: "WhatsApp + SMS", icon: <WhatsAppIcon sx={{ fontSize: 14 }} /> },
  { label: "WhatsApp Only", icon: <WhatsAppIcon sx={{ fontSize: 14 }} /> },
  { label: "SMS Only", icon: <SmsIcon sx={{ fontSize: 14 }} /> },
  {
    label: "App Notification",
    icon: <NotificationsIcon sx={{ fontSize: 14 }} />,
  },
  { label: "Email", icon: <MailIcon sx={{ fontSize: 14 }} /> },
];

export default function EnrollPatientDialog({
  open,
  onClose,
  customProgramTemplates = [],
  onCreateProgramTemplate,
  launchMode = "enroll",
}: EnrollPatientDialogProps) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const [selectedPatient, setSelectedPatient] = React.useState<any>(null);
  const [selectedProgram, setSelectedProgram] =
    React.useState<CareProgramOption | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [programSearchQuery, setProgramSearchQuery] = React.useState("");
  const [programScopeFilter, setProgramScopeFilter] = React.useState<
    "all" | "who" | "custom"
  >("all");
  const [selectedDuration, setSelectedDuration] = React.useState("12 Weeks");
  const [selectedChannel, setSelectedChannel] =
    React.useState("WhatsApp + SMS");
  const [selectedLanguage, setSelectedLanguage] = React.useState("Hindi");
  const [selectedWearable, setSelectedWearable] =
    React.useState("Apple Health");
  const [customPlanName, setCustomPlanName] = React.useState("");
  const [customPlanCategory, setCustomPlanCategory] = React.useState("General");
  const [customPlanDescription, setCustomPlanDescription] = React.useState("");
  const [customPlanColor, setCustomPlanColor] = React.useState("#1172BA");
  const [customCheckins, setCustomCheckins] = React.useState("Daily");
  const [customLabs, setCustomLabs] = React.useState("Weekly");
  const [notes, setNotes] = React.useState("");
  const [medications, setMedications] = React.useState<
    { id: string; value: string }[]
  >([
    { id: "1", value: "Tab. Aspirin 75mg — Once daily" },
    { id: "2", value: "Tab. Atorvastatin 40mg — Night" },
  ]);

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };
  const handleBack = () => {
    if (launchMode === "create-template" && activeStep === 2) {
      onClose();
      return;
    }
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const filteredPatients = OPD_RECORDS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.condition.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const allPrograms = React.useMemo<CareProgramOption[]>(
    () => [
      ...BASE_CARE_PROGRAMS,
      ...customProgramTemplates.map((program) => ({
        ...program,
        icon: <AssignmentIcon />,
        isWho: false,
      })),
    ],
    [customProgramTemplates],
  );

  const visiblePrograms = React.useMemo(() => {
    const query = programSearchQuery.trim().toLowerCase();
    return allPrograms.filter((program) => {
      const searchMatch =
        !query ||
        program.name.toLowerCase().includes(query) ||
        program.description.toLowerCase().includes(query) ||
        (program.category ?? "").toLowerCase().includes(query);
      const filterMatch =
        programScopeFilter === "all" ||
        (programScopeFilter === "who" && program.isWho) ||
        (programScopeFilter === "custom" && !program.isWho);
      return searchMatch && filterMatch;
    });
  }, [allPrograms, programSearchQuery, programScopeFilter]);

  const whoProgramCount = allPrograms.filter((p) => p.isWho).length;
  const customProgramCount = allPrograms.filter((p) => !p.isWho).length;

  const isBuilderProgram = selectedProgram?.isBuilder === true;
  const selectedProgramName = isBuilderProgram
    ? customPlanName.trim() || "Custom Care Plan"
    : selectedProgram?.name;
  const selectedProgramDescription = isBuilderProgram
    ? customPlanDescription.trim() ||
      "Hospital-defined CDSS workflow built for patient-specific follow-up."
    : selectedProgram?.description;
  const selectedProgramColor = isBuilderProgram
    ? customPlanColor
    : selectedProgram?.accentColor ?? theme.palette.primary.main;

  const canProceed =
    activeStep === 0
      ? !!selectedPatient
      : activeStep === 1
        ? !!selectedProgram
        : activeStep === 2
          ? !isBuilderProgram || customPlanName.trim().length > 2
          : true;

  const saveTemplateAndClose = () => {
    if (!customPlanName.trim()) return;
    onCreateProgramTemplate?.({
      id: `custom-template-${Date.now()}`,
      name: customPlanName.trim(),
      description:
        customPlanDescription.trim() ||
        "Custom care program created by hospital admin.",
      duration: selectedDuration,
      medications: medications.filter((m) => m.value.trim()).length,
      checkins: customCheckins,
      labs: customLabs,
      accentColor: customPlanColor,
      category: customPlanCategory,
    });
    onClose();
  };

  const SelectedPatientProfile = ({
    subtitle = "Selected Patient",
  }: {
    subtitle?: string;
  }) => {
    if (!selectedPatient) return null;
    return (
      <Paper
        elevation={0}
        sx={{
          p: 1.25,
          borderRadius: 2.25,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.22),
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar
            sx={{
              bgcolor: selectedPatient.color,
              width: 38,
              height: 38,
              fontWeight: 800,
              fontSize: "0.76rem",
            }}
          >
            {selectedPatient.initials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {selectedPatient.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
              {selectedPatient.id} · {selectedPatient.age} yrs · {selectedPatient.gender}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {selectedPatient.department} · {maskMobileNumber(selectedPatient.phone)}
            </Typography>
            <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600, display: "block", mt: 0.2 }}>
              {subtitle}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    );
  };

  React.useEffect(() => {
    if (!open) return;
    setActiveStep(0);
    setSelectedPatient(null);
    setSearchQuery("");
    setProgramSearchQuery("");
    setSelectedDuration("12 Weeks");
    setSelectedChannel("WhatsApp + SMS");
    setSelectedLanguage("Hindi");
    setSelectedWearable("Apple Health");
    setNotes("");
    setMedications([
      { id: "1", value: "Tab. Aspirin 75mg — Once daily" },
      { id: "2", value: "Tab. Atorvastatin 40mg — Night" },
    ]);
    setCustomPlanName("");
    setCustomPlanCategory("General");
    setCustomPlanDescription("");
    setCustomPlanColor("#1172BA");
    setCustomCheckins("Daily");
    setCustomLabs("Weekly");

    if (launchMode === "create-template") {
      setSelectedProgram(CREATE_NEW_PLAN_OPTION);
      setProgramScopeFilter("custom");
      setActiveStep(2);
    } else {
      setSelectedProgram(null);
      setProgramScopeFilter("all");
    }
  }, [open, launchMode]);

  // ── Step Dot ──────────────────────────────────────────────────────────────
  const StepIcon = ({
    step,
    active,
    completed,
  }: {
    step: number;
    active: boolean;
    completed: boolean;
  }) => (
    <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all 0.3s ease",
        bgcolor: completed
          ? "primary.main"
          : active
            ? alpha(theme.palette.primary.main, 0.1)
            : alpha(theme.palette.text.disabled, 0.08),
        border:
          active && !completed
            ? `2px solid ${theme.palette.primary.main}`
            : "none",
        color: completed
          ? "common.white"
          : active
            ? "primary.main"
            : "text.disabled",
        fontWeight: 800,
        fontSize: "0.78rem",
      }}
    >
      {completed ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : step}
    </Box>
  );

  // ── Section Label ─────────────────────────────────────────────────────────
  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <Typography
      variant="caption"
      sx={{
        fontWeight: 800,
        color: "text.secondary",
        textTransform: "uppercase",
        letterSpacing: "0.8px",
        fontSize: "0.67rem",
        display: "block",
        mb: 1,
      }}
    >
      {children}
    </Typography>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          backgroundImage: "none",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.04)",
          margin: "32px auto",
          // maxWidth: "calc(100vw - 64px)",
        },
      }}
    >
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <DialogTitle sx={{ p: 0 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 3, pt: 2.5, pb: 1.5 }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.2,
                fontSize: "1.05rem",
              }}
            >
              {launchMode === "create-template"
                ? "Create Care Plan"
                : "Enroll New Patient"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              {launchMode === "create-template"
                ? activeStep === 3
                  ? "Review & Save"
                  : "Reusable Template"
                : `Step ${activeStep + 1} of 4 — ${STEPS[activeStep].label}`}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.text.primary, 0.06),
              "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.12) },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* ── Stepper ──────────────────────────────────────────────────────────── */}
        {launchMode !== "create-template" && (
          <Box
            sx={{
              px: 3,
              py: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.025),
              borderTop: "1px solid",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" alignItems="center">
              {STEPS.map((step, index) => (
                <React.Fragment key={step.label}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ flexShrink: 0 }}
                  >
                    <StepIcon
                      step={index + 1}
                      active={activeStep === index}
                      completed={activeStep > index}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: activeStep >= index ? 700 : 500,
                        color:
                          activeStep >= index ? "primary.main" : "text.disabled",
                        display: { xs: "none", sm: "block" },
                        fontSize: "0.74rem",
                      }}
                    >
                      {step.short}
                    </Typography>
                  </Stack>
                  {index < STEPS.length - 1 && (
                    <Box
                      sx={{
                        flex: 1,
                        height: 2,
                        mx: 1.5,
                        borderRadius: 2,
                        bgcolor:
                          activeStep > index
                            ? "primary.main"
                            : alpha(theme.palette.text.disabled, 0.15),
                        transition: "background-color 0.4s ease",
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </Stack>
          </Box>
        )}

        {/* ── Body ─────────────────────────────────────────────────────────────── */}
        <Box sx={{ p: 2, pt: 2.5, boxSizing: "border-box" }}>
          {/* STEP 0 ─ Select Patient */}
          {activeStep === 0 && (
            <Stack spacing={2.5}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <SearchIcon sx={{ color: "primary.main", fontSize: 20 }} />
                Select Patient from OPD Records
              </Typography>

              {selectedPatient && (
                <SelectedPatientProfile subtitle="Selected for enrollment" />
              )}

              <TextField
                placeholder="Search by name, OPD ID, or condition"
                fullWidth
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ pl: 0.75 }}>
                      <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    minHeight: 50,
                    borderRadius: 2.5,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.06),
                    },
                    "&.Mui-focused": {
                      backgroundColor: "background.paper",
                      "& fieldset": {
                        borderColor: "primary.main",
                      },
                    },
                  },
                }}
              />

              <Stack spacing={1}>
                {filteredPatients.map((patient) => {
                  const isSelected = selectedPatient?.id === patient.id;
                  return (
                    <Paper
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        border: "1px solid",
                        borderColor: isSelected
                          ? "primary.main"
                          : "#E5E7EB",
                        bgcolor: isSelected
                          ? "#EBF1FF"
                          : "#FFFFFF",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: isSelected ? "primary.main" : "#D1D5DB",
                          bgcolor: isSelected ? "#EBF1FF" : alpha(theme.palette.text.primary, 0.02),
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar
                          sx={{
                            bgcolor: patient.color,
                            fontWeight: 800,
                            width: 40,
                            height: 40,
                            fontSize: "0.8rem",
                            flexShrink: 0,
                          }}
                        >
                          {patient.initials}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.75}
                            flexWrap="wrap"
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: "text.primary",
                              }}
                            >
                              {patient.name}
                            </Typography>
                            <Chip
                              label={patient.id}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                color: "primary.main",
                                border: "none",
                                "& .MuiChip-label": { px: 0.75 },
                              }}
                            />
                          </Stack>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#4B5563",
                              display: "block",
                              mt: 0.35,
                              fontSize: "0.75rem",
                            }}
                          >
                            {patient.age} yrs, {patient.gender} · {patient.department} 
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#6B7280",
                              display: "block",
                              mt: 0.15,
                              fontSize: "0.7rem",
                            }}
                          >
                         {patient.condition}  {patient.date} 
                            </Typography>
                          </Typography>
                        </Box>
                        {isSelected && (
                          <CheckCircleIcon
                            sx={{
                              color: "primary.main",
                              fontSize: 22,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Stack>
                    </Paper>
                  );
                })}
                {filteredPatients.length === 0 && (
                  <Box
                    sx={{ textAlign: "center", py: 5, color: "text.disabled" }}
                  >
                    <SearchIcon sx={{ fontSize: 36, mb: 1, opacity: 0.35 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      No patients found for "{searchQuery}"
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Stack>
          )}

          {/* STEP 1 ─ Choose Program */}
          {activeStep === 1 && (
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                gap={1}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 800,
                      color: "text.primary",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <AssignmentIcon sx={{ fontSize: 22, color: "#8B4513" }} />
                    Choose Care Program
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    label={`WHO/CDSS ${whoProgramCount}`}
                    sx={{
                      height: 22,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                      border: "1px solid",
                      borderColor: alpha(theme.palette.primary.main, 0.22),
                    }}
                  />
                  <Chip
                    size="small"
                    label={`Custom ${customProgramCount}`}
                    sx={{
                      height: 22,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: "success.dark",
                      border: "1px solid",
                      borderColor: alpha(theme.palette.success.main, 0.22),
                    }}
                  />
                </Stack>
              </Stack>

              {selectedPatient && (
                <SelectedPatientProfile subtitle="Program templates for this patient" />
              )}

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <TextField
                  size="small"
                  placeholder="Search programs..."
                  value={programSearchQuery}
                  onChange={(e) => setProgramSearchQuery(e.target.value)}
                  sx={{ flex: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Stack direction="row" spacing={0.75}>
                  {[
                    { id: "all" as const, label: "All" },
                    { id: "who" as const, label: "WHO only" },
                    { id: "custom" as const, label: "Custom" },
                  ].map((filter) => {
                    const active = programScopeFilter === filter.id;
                    return (
                      <Button
                        key={filter.id}
                        size="small"
                        onClick={() => setProgramScopeFilter(filter.id)}
                        variant={active ? "contained" : "outlined"}
                        sx={{
                          textTransform: "none",
                          borderRadius: 99,
                          minHeight: 30,
                          px: 1.35,
                          fontWeight: 700,
                          fontSize: "0.74rem",
                        }}
                      >
                        {filter.label}
                      </Button>
                    );
                  })}
                </Stack>
              </Stack>

              <Grid container spacing={1.5}>
                {visiblePrograms.map((program) => {
                  const isSelected = selectedProgram?.id === program.id;
                  return (
                    <Grid item xs={12} sm={6} key={program.id}>
                      <Paper
                        onClick={() => setSelectedProgram(program)}
                        elevation={0}
                        sx={{
                          p: 2,
                          height: "100%",
                          borderRadius: 2.5,
                          border: "1px solid",
                          borderColor: isSelected ? "primary.main" : "#E5E7EB",
                          bgcolor: isSelected
                            ? "#EBF1FF"
                            : "#FFFFFF",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: isSelected ? "#EBF1FF" : alpha(theme.palette.primary.main, 0.04),
                          },
                        }}
                      >
                        <Stack spacing={1.25} useFlexGap>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Box
                              sx={{
                                p: 0.9,
                                borderRadius: 2,
                                bgcolor: alpha(program.accentColor, 0.15),
                                color: program.accentColor,
                                display: "flex",
                                "& svg": { fontSize: 20 },
                              }}
                            >
                              {program.icon}
                            </Box>
                            <Chip
                              label={program.isWho ? "WHO/CDSS" : "Custom"}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                bgcolor: program.isWho
                                  ? "primary.main"
                                  : alpha(theme.palette.success.main, 0.14),
                                color: program.isWho
                                  ? "common.white"
                                  : "success.dark",
                                border: "1px solid",
                                borderColor: program.isWho
                                  ? alpha(theme.palette.primary.main, 0.4)
                                  : alpha(theme.palette.success.main, 0.3),
                                "& .MuiChip-label": { px: 0.75 },
                              }}
                            />
                          </Stack>

                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: "text.primary",
                              }}
                            >
                              {program.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ lineHeight: 1.5, display: "block", mt: 0.25 }}
                            >
                              {program.description}
                            </Typography>
                          </Box>

                          <Stack
                            direction="row"
                            flexWrap="wrap"
                            gap={0.5}
                            sx={{ mt: "auto !important" }}
                          >
                            {[
                              {
                                icon: <AccessTimeIcon sx={{ fontSize: 12 }} />,
                                label: program.duration,
                              },
                              {
                                icon: <MedicationIcon sx={{ fontSize: 12 }} />,
                                label: String(program.medications),
                              },
                              {
                                icon: <ScheduleIcon sx={{ fontSize: 12 }} />,
                                label: program.checkins,
                              },
                              {
                                icon: <FolderIcon sx={{ fontSize: 12 }} />,
                                label: program.labs,
                              },
                            ].map((item, i) => (
                              <Chip
                                key={i}
                                size="small"
                                icon={item.icon}
                                label={item.label}
                                sx={{
                                  height: 22,
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  bgcolor: "#F3F4F6",
                                  border: "1px solid",
                                  borderColor: "#E5E7EB",
                                  color: "#4B5563",
                                  "& .MuiChip-icon": {
                                    ml: 0.5,
                                    color: "#6B7280",
                                  },
                                  "& .MuiChip-label": { px: 0.75 },
                                }}
                              />
                            ))}
                          </Stack>
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                })}
                {visiblePrograms.length === 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: "center", py: 5, color: "text.disabled" }}>
                      <SearchIcon sx={{ fontSize: 36, mb: 1, opacity: 0.35 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        No programs found for "{programSearchQuery}"
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Stack>
          )}

          {/* STEP 2 ─ Personalize */}
          {activeStep === 2 && (
            <Stack spacing={launchMode === "create-template" ? 1.75 : 2.5}>
              <Box>
                {launchMode === "create-template" ? (
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 800, color: "text.primary" }}
                  >
                    Template Details
                  </Typography>
                ) : (
                  <>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 800, color: "text.primary" }}
                    >
                      ⚙️ Personalize Plan
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Customizing{" "}
                      <Box component="strong" sx={{ color: "text.primary" }}>
                        {selectedProgramName}
                      </Box>
                    </Typography>
                  </>
                )}
              </Box>

              {launchMode !== "create-template" && selectedPatient && (
                <SelectedPatientProfile subtitle="Personalizing this patient's plan" />
              )}

              {isBuilderProgram && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    border: "1.5px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.22),
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  }}
                >
                  <Stack spacing={1.2}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      Create New Care Plan
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          size="small"
                          label="Plan Name *"
                          placeholder="e.g. Post-surgery thyroid care"
                          value={customPlanName}
                          onChange={(e) => setCustomPlanName(e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          size="small"
                          label="Care Category"
                          value={customPlanCategory}
                          onChange={(e) => setCustomPlanCategory(e.target.value)}
                          fullWidth
                        >
                          {[
                            "General",
                            "Cardiology",
                            "Endocrinology",
                            "Pulmonology",
                            "Orthopaedics",
                            "Oncology",
                            "Post-Discharge",
                          ].map((category) => (
                            <MenuItem key={category} value={category}>
                              {category}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          size="small"
                          label="Plan Description"
                          placeholder="Define care goals, critical tasks and escalation criteria..."
                          value={customPlanDescription}
                          onChange={(e) => setCustomPlanDescription(e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          size="small"
                          label="Check-in Frequency"
                          value={customCheckins}
                          onChange={(e) => setCustomCheckins(e.target.value)}
                          fullWidth
                        >
                          {["Daily", "3x/week", "Weekly", "Bi-weekly", "Monthly"].map((freq) => (
                            <MenuItem key={freq} value={freq}>
                              {freq}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          size="small"
                          label="Lab Review Frequency"
                          value={customLabs}
                          onChange={(e) => setCustomLabs(e.target.value)}
                          fullWidth
                        >
                          {["Weekly", "Bi-weekly", "Monthly", "Quarterly", "As Needed"].map((freq) => (
                            <MenuItem key={freq} value={freq}>
                              {freq}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>

                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", mr: 0.35 }}>
                        Color:
                      </Typography>
                      {["#1172BA", "#2FA77A", "#8E44AD", "#E67E22", "#D35454", "#5B5BD6"].map((color) => {
                        const active = customPlanColor === color;
                        return (
                          <Box
                            key={color}
                            onClick={() => setCustomPlanColor(color)}
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: 1.2,
                              bgcolor: color,
                              border: "2px solid",
                              borderColor: active ? "common.white" : "transparent",
                              outline: active ? `1px solid ${alpha(theme.palette.text.primary, 0.35)}` : "none",
                              cursor: "pointer",
                            }}
                          />
                        );
                      })}
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      Custom plan name required before moving to review.
                    </Typography>
                  </Stack>
                </Paper>
              )}

              {/* Duration */}
              <Box>
                <SectionLabel>📅 Duration</SectionLabel>
                <Stack
                  direction="row"
                  spacing={0.75}
                  flexWrap="wrap"
                  useFlexGap
                >
                  {DURATIONS.map((d) => {
                    const isActive = selectedDuration === d;
                    return (
                      <Chip
                        key={d}
                        icon={
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor: isActive ? "white" : "primary.main",
                            }}
                          />
                        }
                        label={d}
                        onClick={() => setSelectedDuration(d)}
                        sx={{
                          fontWeight: 600,
                          borderRadius: "20px",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          py: 0.75,
                          px: 1.5,
                          bgcolor: isActive
                            ? "primary.main"
                            : alpha(theme.palette.primary.main, 0.06),
                          color: isActive ? "white" : "primary.main",
                          border: isActive
                            ? "none"
                            : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                          "& .MuiChip-icon": { ml: 0.75, mr: -0.25 },
                          // "&:hover": {
                          //   bgcolor: isActive
                          //     ? "primary.main"
                          //     : alpha(theme.palette.primary.main, 0.06),
                          //   color: isActive ? "white" : "primary.main",
                          // },
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>

              {/* Medications */}
              <Box>
                <SectionLabel>💊 Medications</SectionLabel>
                <Stack spacing={0.75}>
                  {medications.map((m) => (
                    <Paper
                      key={m.id}
                      elevation={0}
                      sx={{
                        p: 1,
                        px: 1.5,
                        borderRadius: 2,
                        border: "1.5px solid",
                        borderColor: "divider",
                        bgcolor: alpha(theme.palette.text.primary, 0.02),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <TextField
                        size="small"
                        value={m.value}
                        onChange={(e) =>
                          setMedications((prev) =>
                            prev.map((x) =>
                              x.id === m.id ? { ...x, value: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder="e.g. Tab. Aspirin 75mg — Once daily"
                        fullWidth
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "transparent",
                            "& fieldset": { border: "none" },
                          },
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          setMedications((prev) => prev.filter((x) => x.id !== m.id))
                        }
                        sx={{
                          color: "error.main",
                          flexShrink: 0,
                          "&:hover": {
                            bgcolor: alpha(theme.palette.error.main, 0.08),
                          },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Paper>
                  ))}
                  <Button
                    startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                    size="small"
                    onClick={() =>
                      setMedications((prev) => [
                        ...prev,
                        { id: `med-${Date.now()}`, value: "" },
                      ])
                    }
                    sx={{
                      justifyContent: "center",
                      border: "1.5px dashed",
                      borderColor: alpha(theme.palette.text.primary, 0.2),
                      borderRadius: 2,
                      py: 0.9,
                      textTransform: "none",
                      color: "text.secondary",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      "&:hover": {
                        borderColor: "primary.main",
                        color: "primary.main",
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    Add Medication
                  </Button>
                </Stack>
              </Box>

              {/* Reminder Channel */}
              <Box>
                <SectionLabel>📲 Reminder Channel</SectionLabel>
                <Stack
                  direction="row"
                  spacing={0.75}
                  flexWrap="wrap"
                  useFlexGap
                >
                  {CHANNELS.map((item) => {
                    const isActive = selectedChannel === item.label;
                    return (
                      <Chip
                        key={item.label}
                        icon={React.cloneElement(item.icon, {
                          sx: { fontSize: 16 },
                        })}
                        label={item.label}
                        onClick={() => setSelectedChannel(item.label)}
                        sx={{
                          fontWeight: 600,
                          borderRadius: "20px",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          py: 0.75,
                          px: 1.5,
                          bgcolor: isActive
                            ? "primary.main"
                            : alpha(theme.palette.primary.main, 0.06),
                          color: isActive ? "white" : "primary.main",
                          border: isActive
                            ? "none"
                            : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                          "& .MuiChip-icon": {
                            ml: 0.75,
                            mr: -0.25,
                            color: "inherit",
                          },
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>

              {/* Language + Wearable */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <SectionLabel>🌐 Language</SectionLabel>
                  <Select
                    fullWidth
                    size="small"
                    value={selectedLanguage}
                    onChange={(e) =>
                      setSelectedLanguage(e.target.value as string)
                    }
                    sx={{
                      borderRadius: 2,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      "& fieldset": {
                        borderColor: "divider",
                        borderWidth: "1.5px",
                      },
                      "&:hover fieldset": {
                        borderColor: "primary.main !important",
                      },
                    }}
                  >
                    {["Hindi", "English", "Tamil", "Telugu", "Bengali"].map(
                      (l) => (
                        <MenuItem
                          key={l}
                          value={l}
                          sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                        >
                          {l}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </Grid>
                <Grid item xs={6}>
                  <SectionLabel>⌚ Wearable</SectionLabel>
                  <Select
                    fullWidth
                    size="small"
                    value={selectedWearable}
                    onChange={(e) =>
                      setSelectedWearable(e.target.value as string)
                    }
                    sx={{
                      borderRadius: 2,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      "& fieldset": {
                        borderColor: "divider",
                        borderWidth: "1.5px",
                      },
                      "&:hover fieldset": {
                        borderColor: "primary.main !important",
                      },
                    }}
                  >
                    {[
                      "Apple Health",
                      "Google Fit",
                      "Fitbit",
                      "Samsung Health",
                      "None",
                    ].map((w) => (
                      <MenuItem
                        key={w}
                        value={w}
                        sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                      >
                        {w}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
              </Grid>

              {/* Notes */}
              <Box>
                <SectionLabel>📝 Notes</SectionLabel>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Allergy to penicillin, prefers morning reminders…"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      fontSize: "0.875rem",
                      "& fieldset": {
                        borderColor: "divider",
                        borderWidth: "1.5px",
                      },
                      "&:hover fieldset": { borderColor: "primary.main" },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main",
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              </Box>
            </Stack>
          )}

          {/* STEP 3 ─ Confirm */}
          {activeStep === 3 && (
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, color: "text.primary" }}
                >
                  ✅ Review & Activate
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Confirm all details before activating the care plan.
                </Typography>
              </Box>

              {launchMode !== "create-template" ? (
                <SelectedPatientProfile subtitle="Final patient check before activation" />
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1.5px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.25),
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Template Library
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 700 }}>
                    This plan will be saved as a reusable hospital template.
                  </Typography>
                </Paper>
              )}

              {/* Program summary */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1.5px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    fontSize: "0.65rem",
                    display: "block",
                    mb: 1.25,
                  }}
                >
                  🏥 Program
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      p: 0.9,
                      borderRadius: 2,
                      bgcolor: alpha(selectedProgramColor, 0.12),
                      color: selectedProgramColor,
                      display: "flex",
                      "& svg": { fontSize: 20 },
                    }}
                  >
                    {selectedProgram?.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {selectedProgramName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedDuration} · Check-ins:{" "}
                      {isBuilderProgram ? customCheckins : selectedProgram?.checkins ?? "Custom"}
                    </Typography>
                    {isBuilderProgram && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.2 }}
                      >
                        Category: {customPlanCategory}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Paper>

              {/* Medications summary */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1.5px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    fontSize: "0.65rem",
                    display: "block",
                    mb: 1.25,
                  }}
                >
                  💊 Medications ({medications.length})
                </Typography>
                <Stack spacing={0.75}>
                  {medications.map((m) => (
                    <Typography
                      key={m.id}
                      variant="body2"
                      sx={{
                        color: "text.primary",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                      }}
                    >
                      💊 {m.value}
                    </Typography>
                  ))}
                </Stack>
              </Paper>

              {/* Settings grid */}
              <Grid container spacing={1.25}>
                {[
                  {
                    icon: (
                      <WhatsAppIcon
                        sx={{ fontSize: 16, color: "success.main" }}
                      />
                    ),
                    label: selectedChannel,
                  },
                  {
                    icon: <Box sx={{ fontSize: 15, lineHeight: 1 }}>🌐</Box>,
                    label: selectedLanguage,
                  },
                  {
                    icon: (
                      <WatchIcon sx={{ fontSize: 16, color: "primary.main" }} />
                    ),
                    label: selectedWearable,
                  },
                  {
                    icon: (
                      <EventNoteIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                    ),
                    label: selectedDuration,
                  },
                ].map((item, i) => (
                  <Grid item xs={6} key={i}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.25,
                        borderRadius: 2.5,
                        border: "1.5px solid",
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        bgcolor: alpha(theme.palette.text.primary, 0.02),
                      }}
                    >
                      {item.icon}
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: "text.primary" }}
                      >
                        {item.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* AI insight */}
              <Box
                sx={{
                  p: 1.75,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: "1.5px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.15),
                  display: "flex",
                  gap: 1.25,
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 500,
                    color: "text.primary",
                    lineHeight: 1.6,
                  }}
                >
                  <strong>{launchMode === "create-template" ? "Template" : selectedPatient?.name}</strong> matches{" "}
                  <strong>{selectedProgramName}</strong>. Reminders in{" "}
                  <strong>{selectedLanguage}</strong> via{" "}
                  <strong>{selectedChannel}</strong>.{" "}
                  <strong>{selectedWearable}</strong> will sync for vitals
                  tracking.
                  {selectedProgramDescription
                    ? ` ${selectedProgramDescription}`
                    : ""}
                </Typography>
              </Box>
            </Stack>
          )}
        </Box>
      </DialogContent>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <Divider />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={launchMode === "create-template" ? "flex-end" : "space-between"}
        sx={{ p: 2, px: 3 }}
      >
        {launchMode !== "create-template" && (
          <Button
            onClick={activeStep === 0 ? onClose : handleBack}
            variant="outlined"
            size="small"
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              px: 2.5,
              py: 0.85,
              borderColor: alpha(theme.palette.text.primary, 0.2),
              borderWidth: "1.5px",
              color: "text.secondary",
              "&:hover": {
                borderColor: "text.primary",
                borderWidth: "1.5px",
                bgcolor: "transparent",
                color: "text.primary",
              },
            }}
          >
            {activeStep === 0 ? "Cancel" : "← Back"}
          </Button>
        )}

        <Stack direction="row" alignItems="center" spacing={1.5}>
          {launchMode !== "create-template" && activeStep < 3 && (
            <Typography
              variant="caption"
              sx={{ color: "text.disabled", fontWeight: 500 }}
            >
              {3 - activeStep} step{3 - activeStep !== 1 ? "s" : ""} left
            </Typography>
          )}
          <Button
            onClick={() => {
              if (activeStep === 3) {
                if (launchMode === "create-template") {
                  saveTemplateAndClose();
                } else {
                  onClose();
                }
                return;
              }
              handleNext();
            }}
            variant="contained"
            size="small"
            disabled={!canProceed}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 0.85,
              boxShadow:
                activeStep === 3
                  ? "0 4px 14px rgba(5,150,105,0.3)"
                  : "0 4px 14px rgba(17,114,186,0.25)",
              bgcolor: activeStep === 3 ? "success.main" : "primary.main",
              "&:hover": {
                bgcolor: activeStep === 3 ? "success.dark" : "primary.dark",
                boxShadow: "none",
              },
              "&.Mui-disabled": {
                bgcolor: alpha(theme.palette.primary.main, 0.25),
                color: alpha(theme.palette.common.white, 0.7),
              },
            }}
          >
            {activeStep === 3
              ? launchMode === "create-template"
                ? "Save Template"
                : "✓ Activate Plan"
              : activeStep === 2
                ? launchMode === "create-template"
                  ? "Review Template →"
                  : "Review →"
                : "Next →"}
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
}
