"use client";

import * as React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  Chip,
  Divider,
  Grid,
  LinearProgress,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  VerifiedUser as VerifiedUserIcon,
  LocalHospital as LocalHospitalIcon,
  AccountBalance as AccountBalanceIcon,
  Favorite as FavoriteIcon,
  AssignmentInd as AssignmentIndIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  ArrowBack as ArrowBackIcon,
  MonetizationOn as MonetizationOnIcon,
  VolunteerActivism as VolunteerActivismIcon,
  Business as BusinessIcon,
  EmojiEvents as TrophyIcon,
  AccessTime as ClockIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import PatientPortalWorkspaceCard from "./components/PatientPortalWorkspaceCard";
import ModuleHeaderCard from "../clinical/components/ModuleHeaderCard";

// ─── Design Tokens ──────────────────────────────────────────────────────────────
const T = {
  // Neutrals
  white: "#FFFFFF",
  bg: "#F8FAFC",
  surfaceElevated: "#FFFFFF",
  border: "#E2E8F0",
  borderMid: "#CBD5E1",

  // Brand — Scanbo Blue
  brand: "#1172BA",
  brandDark: "#0A5E9D",
  brandLight: "#EAF4FF",
  brandMid: "#BDDBF3",

  // Semantic
  successBg: "#F0FDF4",
  successText: "#15803D",
  successBorder: "#BBF7D0",
  warningBg: "#FFFBEB",
  warningText: "#B45309",
  warningBorder: "#FDE68A",
  errorText: "#BE123C",

  // Text
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  // Step colors
  stepDone: "#1172BA",
  stepActive: "#1172BA",
  stepPending: "#E2E8F0",

  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    full: "9999px",
  },
};

// ─── Styled Components ───────────────────────────────────────────────────────




const SurfaceCard = styled(Box)({
  background: T.surfaceElevated,
  borderRadius: T.radius.lg,
  border: `1px solid ${T.border}`,
  overflow: "hidden",
});

const SectionHeader = styled(Box)<{ accent?: boolean }>(({ accent }) => ({
  padding: "14px 20px",
  borderBottom: `1px solid ${T.border}`,
  background: accent
    ? `linear-gradient(90deg, ${T.brandLight} 0%, ${alpha(T.brandLight, 0.4)} 100%)`
    : T.bg,
  display: "flex",
  alignItems: "center",
  gap: 8,
}));

const SectionLabel = styled(Typography)({
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: T.textMuted,
  marginBottom: 12,
});

const ReviewRow = styled(Box)({
  display: "flex",
  flexDirection: "column" as const,
  gap: 2,
});

const ReviewLabel = styled(Typography)({
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: T.textMuted,
});

const ReviewValue = styled(Typography)({
  fontSize: 14,
  fontWeight: 600,
  color: T.textPrimary,
});

// ─── Stepper ─────────────────────────────────────────────────────────────────

const CustomConnector = styled(StepConnector)({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 18,
    left: "calc(-50% + 22px)",
    right: "calc(50% + 22px)",
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: T.stepPending,
    borderTopWidth: 2,
    borderRadius: 2,
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    borderColor: T.brand,
    background: `linear-gradient(90deg, ${T.brand} 0%, ${T.brandMid} 100%)`,
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    borderColor: T.brand,
  },
});

const StepBubble = styled("div")<{
  state: "completed" | "active" | "pending";
}>(({ state }) => ({
  width: 36,
  height: 36,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 700,
  fontFamily: "'DM Sans', sans-serif",
  transition: "all 0.25s ease",
  ...(state === "completed" && {
    background: T.brand,
    color: "#fff",
    boxShadow: `0 2px 8px ${alpha(T.brand, 0.35)}`,
  }),
  ...(state === "active" && {
    background: T.brandLight,
    color: T.brand,
    border: `2px solid ${T.brand}`,
    boxShadow: `0 0 0 5px ${alpha(T.brand, 0.1)}`,
  }),
  ...(state === "pending" && {
    background: T.bg,
    color: T.textMuted,
    border: `2px solid ${T.stepPending}`,
  }),
}));

function CustomStepIcon({
  active,
  completed,
  icon,
}: {
  active?: boolean;
  completed?: boolean;
  icon: React.ReactNode;
}) {
  const state = completed ? "completed" : active ? "active" : "pending";
  return (
    <StepBubble state={state}>
      {completed ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : icon}
    </StepBubble>
  );
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = [
  "Eligibility",
  "Application",
  "Documents",
  "Review",
  "Status",
];

const INCOME_OPTIONS = ["Below ₹50,000", "₹50,000 – ₹1 Lakh", "Above ₹1 Lakh"];
const CATEGORY_OPTIONS = ["APL", "BPL", "EWS"];
const BINARY_OPTIONS = ["Yes", "No"];

const SCHEME_META: Record<string, { icon: React.ReactNode; color: string }> = {
  "PM-JAY / Ayushman Bharat": {
    icon: <VerifiedUserIcon sx={{ fontSize: 15 }} />,
    color: T.brand,
  },
  "Hospital Charity Fund": {
    icon: <FavoriteIcon sx={{ fontSize: 15 }} />,
    color: "#E44D6B",
  },
  "NGO Support": {
    icon: <VolunteerActivismIcon sx={{ fontSize: 15 }} />,
    color: "#7C3AED",
  },
  "Government Subsidy": {
    icon: <AccountBalanceIcon sx={{ fontSize: 15 }} />,
    color: "#059669",
  },
  "Insurance Facilitation": {
    icon: <LocalHospitalIcon sx={{ fontSize: 15 }} />,
    color: "#D97706",
  },
};

function getEligibleSchemes(
  income: string,
  category: string,
  hasAyushman: string,
  hasInsurance: string
) {
  const schemes: { name: string; note: string }[] = [];
  if (hasAyushman === "Yes")
    schemes.push({ name: "PM-JAY / Ayushman Bharat", note: "Up to ₹5 Lakh coverage" });
  if (category === "BPL" || category === "EWS")
    schemes.push({ name: "Government Subsidy", note: "Eligible for state aid" });
  if (income === "Below ₹50,000")
    schemes.push({ name: "Hospital Charity Fund", note: "Up to 80% discount possible" });
  if (hasInsurance === "Yes")
    schemes.push({ name: "Insurance Facilitation", note: "Claim assistance available" });
  schemes.push({ name: "NGO Support", note: "Subject to availability" });
  return schemes;
}

// ─── Shared Nav Buttons ───────────────────────────────────────────────────────

function NavButtons({
  onBack,
  onNext,
  nextLabel,
  showBack = true,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  showBack?: boolean;
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 1, pb: 4 }}>
      {showBack && (
        <Button
          onClick={onBack}
          startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: "none",
            color: T.textSecondary,
            fontWeight: 600,
            fontSize: 14,
            px: 2,
            borderRadius: T.radius.md,
            "&:hover": { background: T.border },
          }}
        >
          Back
        </Button>
      )}
      <Button
        variant="contained"
        onClick={onNext}
        endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
        sx={{
          textTransform: "none",
          fontWeight: 700,
          fontSize: 14,
          px: 3.5,
          py: 1.2,
          borderRadius: T.radius.md,
          background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandDark} 100%)`,
          boxShadow: `0 4px 14px ${alpha(T.brand, 0.3)}`,
          "&:hover": {
            background: `linear-gradient(135deg, ${T.brandDark} 0%, #092E80 100%)`,
            boxShadow: `0 6px 20px ${alpha(T.brand, 0.4)}`,
          },
        }}
      >
        {nextLabel}
      </Button>
    </Box>
  );
}

// ─── Step 0 — Eligibility ────────────────────────────────────────────────────

function StepEligibility({
  patientId, setPatientId,
  patientName, setPatientName,
  income, setIncome,
  category, setCategory,
  hasAyushman, setHasAyushman,
  hasInsurance, setHasInsurance,
  isCalculated, setIsCalculated,
  eligibleSchemes,
  onNext,
}: any) {
  return (
    <Stack spacing={2.5}>
      {/* Banner */}
      <Box
        sx={{
          p: 2,
          borderRadius: T.radius.md,
          display: "flex",
          gap: 1.5,
          alignItems: "flex-start",
          background: T.brandLight,
          border: `1px solid ${T.brandMid}`,
        }}
      >
        <InfoIcon sx={{ color: T.brand, fontSize: 18, mt: 0.1, flexShrink: 0 }} />
        <Typography sx={{ fontSize: 13, color: T.brandDark, lineHeight: 1.6 }}>
          Financial assistance is available for patients facing economic hardship — including{" "}
          <strong>Ayushman Bharat, Charity Fund, Government Subsidy, Insurance Support</strong> and NGO Aid.
        </Typography>
      </Box>

      {/* Eligibility Form */}
      <SurfaceCard>
        <SectionHeader accent>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "6px",
              background: T.brand,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>1</Typography>
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: T.brandDark, flex: 1 }}>
            Eligibility Checker
          </Typography>
          <Chip
            label="Required"
            size="small"
            sx={{ fontSize: 11, fontWeight: 700, bgcolor: T.brandMid, color: T.brandDark, height: 22 }}
          />
        </SectionHeader>

        <Box sx={{ p: "20px 24px" }}>
            <Box>

          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="Patient ID" value={patientId}
                onChange={(e) => setPatientId(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="Full Name" value={patientName}
                onChange={(e) => setPatientName(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth size="small" label="Monthly Family Income (₹)" value={income}
                onChange={(e) => setIncome(e.target.value)}>
                {INCOME_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth size="small" label="Category" value={category}
                onChange={(e) => setCategory(e.target.value)}>
                {CATEGORY_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth size="small" label="Ayushman Bharat / PM-JAY Card?"
                value={hasAyushman} onChange={(e) => setHasAyushman(e.target.value)}>
                {BINARY_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth size="small" label="Health Insurance?"
                value={hasInsurance} onChange={(e) => setHasInsurance(e.target.value)}>
                {BINARY_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
            </Box>
<Box sx={{display:"flex",justifyContent:"flex-end"}}>

          <Button
            variant="contained"
            onClick={() => setIsCalculated(true)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 14,
              px: 3,
              py: 1.1,
              borderRadius: T.radius.md,
              background: `linear-gradient(135deg, ${T.brand} 0%, ${T.brandDark} 100%)`,
              boxShadow: `0 4px 12px ${alpha(T.brand, 0.25)}`,
            }}
          >
            Check Eligibility
          </Button>
</Box>
    
        </Box>
      </SurfaceCard>

      {/* Results */}
      {isCalculated && (
        <SurfaceCard sx={{ border: `1.5px solid ${T.brandMid}` }}>
          <SectionHeader>
            <CheckCircleIcon sx={{ color: T.brand, fontSize: 18 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, flex: 1 }}>
              Eligibility Result
            </Typography>
            <Chip
              label={`${eligibleSchemes.length} schemes found`}
              size="small"
              sx={{ fontSize: 11, fontWeight: 700, bgcolor: T.brand, color: "#fff", height: 22 }}
            />
          </SectionHeader>

          <Box sx={{ p: "16px 20px" }}>
            <Typography sx={{ fontSize: 12.5, color: T.textSecondary, mb: 2 }}>
              Based on the provided information, you are eligible for:
            </Typography>
            <Stack spacing={1.5}>
              {eligibleSchemes.map((scheme: any) => {
                const meta = SCHEME_META[scheme.name] ?? { icon: <CheckCircleIcon sx={{ fontSize: 15 }} />, color: T.brand };
                return (
                  <Box
                    key={scheme.name}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: "10px 14px",
                      borderRadius: T.radius.md,
                      background: T.bg,
                      border: `1px solid ${T.border}`,
                      transition: "all 0.15s ease",
                      "&:hover": { borderColor: T.brandMid, background: T.brandLight },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "8px",
                        background: alpha(meta.color, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: meta.color,
                        flexShrink: 0,
                      }}
                    >
                      {meta.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>
                        {scheme.name}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: T.textSecondary }}>
                        {scheme.note}
                      </Typography>
                    </Box>
                    <Chip
                      label="Eligible"
                      size="small"
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        bgcolor: T.brandLight,
                        color: T.brand,
                        height: 22,
                        border: `1px solid ${T.brandMid}`,
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </SurfaceCard>
      )}

      {isCalculated && (
        <NavButtons showBack={false} onNext={onNext} nextLabel="Continue to Application" />
      )}
    </Stack>
  );
}

// ─── Step 1 — Application Form ───────────────────────────────────────────────

function StepApplication({
  patientName, setPatientName,
  patientId, setPatientId,
  mobile, setMobile,
  department, setDepartment,
  billNo, setBillNo,
  billAmount, setBillAmount,
  admissionType, setAdmissionType,
  assistanceType, setAssistanceType,
  schemeName, setSchemeName,
  requestedAmount, setRequestedAmount,
  priority, setPriority,
  reason, setReason,
  onBack, onNext,
}: any) {
  const remaining = billAmount - requestedAmount;
  const pct = billAmount > 0 ? Math.round((requestedAmount / billAmount) * 100) : 0;

  return (
    <Stack spacing={2.5}>
      <SurfaceCard>
        <SectionHeader accent>
          <Box sx={{ width: 24, height: 24, borderRadius: "6px", background: T.brand, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>2</Typography>
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: T.brandDark }}>
            Patient & Bill Details
          </Typography>
        </SectionHeader>

        <Box sx={{ p: "20px 24px" }}>
          {/* Patient Info */}
          <SectionLabel>Patient Information</SectionLabel>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Patient Name *" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Patient ID *" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Mobile Number *" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth size="small" label="Department / Ward" value={department} onChange={(e) => setDepartment(e.target.value)}>
                <MenuItem value="Oncology">Oncology</MenuItem>
                <MenuItem value="Cardiology">Cardiology</MenuItem>
                <MenuItem value="Neurology">Neurology</MenuItem>
                <MenuItem value="Orthopaedics">Orthopaedics</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          {/* Bill Info */}
          <SectionLabel>Bill Information</SectionLabel>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="Bill Reference No. *" value={billNo} onChange={(e) => setBillNo(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" type="number" label="Total Bill Amount (₹) *" value={billAmount}
                onChange={(e) => setBillAmount(Number(e.target.value))} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth size="small" label="Admission Type" value={admissionType} onChange={(e) => setAdmissionType(e.target.value)}>
                <MenuItem value="IPD">IPD — In-Patient</MenuItem>
                <MenuItem value="OPD">OPD — Out-Patient</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          {/* Assistance Request */}
          <SectionLabel>Assistance Request</SectionLabel>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth size="small" label="Type of Assistance *" value={assistanceType}
                onChange={(e) => setAssistanceType(e.target.value)}>
                {[
                  { value: "Government Scheme", icon: <AccountBalanceIcon sx={{ fontSize: 16, color: T.brand }} /> },
                  { value: "Charity Fund", icon: <BusinessIcon sx={{ fontSize: 16, color: T.brand }} /> },
                  { value: "Discount Request", icon: <MonetizationOnIcon sx={{ fontSize: 16, color: T.brand }} /> },
                  { value: "NGO Support", icon: <VolunteerActivismIcon sx={{ fontSize: 16, color: T.brand }} /> },
                  { value: "Insurance Claim", icon: <DescriptionIcon sx={{ fontSize: 16, color: T.brand }} /> },
                ].map(({ value, icon }) => (
                  <MenuItem key={value} value={value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {icon}
                      <span style={{ fontSize: 13 }}>{value}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {assistanceType === "Government Scheme" && (
              <Grid item xs={12} sm={6}>
                <TextField select fullWidth size="small" label="Select Scheme" value={schemeName} onChange={(e) => setSchemeName(e.target.value)}>
                  <MenuItem value="Ayushman Bharat (PM-JAY)">Ayushman Bharat (PM-JAY)</MenuItem>
                  <MenuItem value="State Health Scheme">State Health Scheme</MenuItem>
                </TextField>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" type="number" label="Requested Assistance Amount (₹) *"
                value={requestedAmount} onChange={(e) => setRequestedAmount(Number(e.target.value))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth size="small" label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <MenuItem value="High">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#EF4444" }} />
                    <span>High</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="Normal">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#3B82F6" }} />
                    <span>Normal</span>
                  </Stack>
                </MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Reason for Request *"
                value={reason} onChange={(e) => setReason(e.target.value)} />
            </Grid>
          </Grid>

          {/* Bill Summary Card */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${T.brandLight} 0%, ${alpha(T.brandMid, 0.3)} 100%)`,
              border: `1px solid ${T.brandMid}`,
              borderRadius: T.radius.md,
              p: "16px 20px",
            }}
          >
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 13, color: T.textSecondary }}>Total Bill</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>₹{billAmount.toLocaleString()}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 13, color: T.textSecondary }}>Assistance Requested</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#EF4444" }}>
                − ₹{requestedAmount.toLocaleString()}
              </Typography>
            </Stack>

            {/* Progress bar */}
            <Box sx={{ mb: 1.5 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(pct, 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: T.brandMid,
                  "& .MuiLinearProgress-bar": {
                    background: `linear-gradient(90deg, ${T.brand} 0%, #5893FF 100%)`,
                    borderRadius: 3,
                  },
                }}
              />
              <Typography sx={{ fontSize: 11, color: T.textSecondary, mt: 0.5 }}>
                {pct}% covered by assistance
              </Typography>
            </Box>

            <Divider sx={{ borderColor: T.brandMid, mb: 1.5 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>You Would Pay</Typography>
              <Typography sx={{ fontSize: 22, fontWeight: 900, color: T.brand, letterSpacing: "-0.5px" }}>
                ₹{remaining.toLocaleString()}
              </Typography>
            </Stack>
          </Box>
        </Box>
      </SurfaceCard>

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Upload Documents" />
    </Stack>
  );
}

// ─── Step 2 — Documents ──────────────────────────────────────────────────────

function StepDocuments({ onBack, onNext }: any) {
  const docs = [
    { label: "Aadhar Card / ID Proof", required: true, uploaded: "aadhar_rahul.pdf", size: "320 KB" },
    { label: "Ayushman / Govt. Scheme Card", required: false, uploaded: null },
    { label: "Income Certificate / BPL Card", required: false, uploaded: null },
  ];

  return (
    <Stack spacing={2.5}>
      <SurfaceCard>
        <SectionHeader accent>
          <Box sx={{ width: 24, height: 24, borderRadius: "6px", background: T.brand, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>3</Typography>
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: T.brandDark }}>Upload Documents</Typography>
        </SectionHeader>

        <Box sx={{ p: "20px 24px" }}>
          <Box sx={{ p: "10px 14px", borderRadius: T.radius.md, bgcolor: T.warningBg, border: `1px solid ${T.warningBorder}`, display: "flex", gap: 1.5, mb: 3 }}>
            <InfoIcon sx={{ color: T.warningText, fontSize: 17, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12.5, color: T.warningText }}>
              Upload clear, readable copies. Accepted: PDF, JPG, PNG. Max 5 MB per file.
            </Typography>
          </Box>

          <Stack spacing={2.5}>
            {docs.map((doc) => (
              <Box key={doc.label}>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: T.textPrimary }}>
                    {doc.label}
                  </Typography>
                  {doc.required && (
                    <Typography sx={{ fontSize: 12, color: "#EF4444", fontWeight: 700 }}>*</Typography>
                  )}
                </Stack>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: "10px 14px",
                    border: `1.5px dashed ${T.borderMid}`,
                    borderRadius: T.radius.md,
                    bgcolor: T.bg,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    "&:hover": { borderColor: T.brand, bgcolor: T.brandLight },
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      textTransform: "none",
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: T.radius.sm,
                      borderColor: T.borderMid,
                      color: T.textSecondary,
                      "&:hover": { borderColor: T.brand, color: T.brand },
                    }}
                  >
                    Browse…
                  </Button>
                  <Typography sx={{ fontSize: 12.5, color: T.textMuted }}>
                    {doc.uploaded ? doc.uploaded : "No file chosen"}
                  </Typography>
                </Box>

                {doc.uploaded && (
                  <Box
                    sx={{
                      mt: 1,
                      p: "8px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: T.successBg,
                      border: `1px solid ${T.successBorder}`,
                      borderRadius: T.radius.sm,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <DescriptionIcon sx={{ fontSize: 15, color: T.successText }} />
                      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: T.successText }}>
                        {doc.uploaded}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography sx={{ fontSize: 11, color: T.textMuted }}>{doc.size}</Typography>
                      <Chip
                        label="Uploaded"
                        size="small"
                        sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: T.successBg, color: T.successText, border: `1px solid ${T.successBorder}` }}
                      />
                    </Stack>
                  </Box>
                )}
              </Box>
            ))}

            {/* Drag-drop zone */}
            <Box>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: T.textPrimary, mb: 1 }}>
                Medical Reports / Discharge Summary{" "}
                <Typography component="span" sx={{ fontSize: 12, color: T.textMuted, fontWeight: 400 }}>
                  (optional)
                </Typography>
              </Typography>
              <Box
                sx={{
                  height: 110,
                  border: `1.5px dashed ${alpha(T.brand, 0.35)}`,
                  borderRadius: T.radius.md,
                  bgcolor: T.brandLight,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  gap: 0.5,
                  transition: "all 0.15s ease",
                  "&:hover": { bgcolor: alpha(T.brandMid, 0.35), borderColor: T.brand },
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 28, color: T.brand, opacity: 0.7 }} />
                <Typography sx={{ fontSize: 13, color: T.brand, fontWeight: 600 }}>
                  Click to upload or drag files here
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: T.textMuted }}>PDF, JPG, PNG — up to 5 MB</Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </SurfaceCard>

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Review Application" />
    </Stack>
  );
}

// ─── Step 3 — Review & Submit ────────────────────────────────────────────────

const FLOW_STEPS = [
  { label: "Submitted", sub: "By you", icon: <SendIcon sx={{ fontSize: 14 }} />, done: true },
  { label: "Doctor / HOD Review", sub: "Oncology — 24 hrs", icon: <AssignmentIndIcon sx={{ fontSize: 14 }} />, done: false },
  { label: "Finance Review", sub: "Finance Dept.", icon: <AccountBalanceIcon sx={{ fontSize: 14 }} />, done: false },
  { label: "Final Approval", sub: "Admin / Finance Head", icon: <VerifiedUserIcon sx={{ fontSize: 14 }} />, done: false },
];

function StepReview({
  patientName, patientId, mobile, department,
  billNo, billAmount, assistanceType, schemeName,
  requestedAmount, reason, onBack, onNext,
}: any) {
  return (
    <Stack spacing={2.5}>
      <SurfaceCard>
        <SectionHeader accent>
          <Box sx={{ width: 24, height: 24, borderRadius: "6px", background: T.brand, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>4</Typography>
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: T.brandDark }}>Review & Submit</Typography>
        </SectionHeader>

        <Box sx={{ p: "20px 24px" }}>
          {/* Summary Grid */}
          <SectionLabel>Application Summary</SectionLabel>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {[
              { l: "Name", v: patientName },
              { l: "Patient ID", v: patientId },
              { l: "Department", v: department },
              { l: "Mobile", v: mobile },
              { l: "Bill No.", v: billNo },
              { l: "Bill Amount", v: `₹${billAmount.toLocaleString()}` },
            ].map(({ l, v }) => (
              <Grid item xs={6} sm={4} key={l}>
                <ReviewRow>
                  <ReviewLabel>{l}</ReviewLabel>
                  <ReviewValue>{v}</ReviewValue>
                </ReviewRow>
              </Grid>
            ))}
          </Grid>

          {/* Assistance Block */}
          <Box
            sx={{
              p: "14px 18px",
              borderRadius: T.radius.md,
              background: T.brandLight,
              border: `1px solid ${T.brandMid}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
              mb: 3,
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 11, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>
                Assistance Type
              </Typography>
              <Chip
                label={assistanceType}
                size="small"
                sx={{ bgcolor: T.brand, color: "#fff", fontWeight: 700, fontSize: 12, height: 24 }}
              />
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: 11, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>
                Scheme
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: T.brandDark }}>{schemeName}</Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: 11, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>
                Assistance
              </Typography>
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#EF4444" }}>
                − ₹{requestedAmount.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: 11, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.5 }}>
                You Pay
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 900, color: T.brand, letterSpacing: "-0.5px" }}>
                ₹{(billAmount - requestedAmount).toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {/* Reason */}
          <SectionLabel>Reason</SectionLabel>
          <Box
            sx={{
              p: "12px 16px",
              bgcolor: T.bg,
              border: `1px solid ${T.border}`,
              borderRadius: T.radius.md,
              mb: 3,
            }}
          >
            <Typography sx={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.7, fontStyle: "italic" }}>
              "{reason}"
            </Typography>
          </Box>

          {/* Documents */}
          <SectionLabel>Uploaded Documents</SectionLabel>
          <Stack spacing={1} sx={{ mb: 3 }}>
            {["aadhar_rahul.pdf", "ayushman_card.jpg", "income_cert.pdf"].map((f) => (
              <Box
                key={f}
                sx={{
                  p: "8px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  bgcolor: T.bg,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radius.sm,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <DescriptionIcon sx={{ fontSize: 15, color: T.brand }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{f}</Typography>
                </Stack>
                <Typography sx={{ fontSize: 11, color: T.successText, fontWeight: 700 }}>✓ Ready</Typography>
              </Box>
            ))}
          </Stack>

          {/* Approval Flow */}
          <SectionLabel>Approval Flow</SectionLabel>
          <Stack spacing={0}>
            {FLOW_STEPS.map((step, i) => (
              <Box key={step.label} sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: step.done ? T.brand : T.bg,
                      border: `1.5px solid ${step.done ? T.brand : T.border}`,
                      color: step.done ? "#fff" : T.textMuted,
                      flexShrink: 0,
                    }}
                  >
                    {step.icon}
                  </Box>
                  {i < FLOW_STEPS.length - 1 && (
                    <Box sx={{ width: 1.5, flex: 1, minHeight: 20, bgcolor: T.border, my: 0.5 }} />
                  )}
                </Box>
                <Box sx={{ pb: i < FLOW_STEPS.length - 1 ? 2 : 0, pt: 0.5 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{step.label}</Typography>
                  <Typography sx={{ fontSize: 12, color: T.textMuted }}>{step.sub}</Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </SurfaceCard>

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Submit Application" />
    </Stack>
  );
}

// ─── Step 4 — Status Tracker ─────────────────────────────────────────────────

const TRACKER = [
  { label: "Submitted", date: "15 Mar 2025", state: "done" },
  { label: "Doctor Review", sub: "In Progress", state: "active" },
  { label: "Finance Review", sub: "Pending", state: "pending" },
  { label: "Final Approval", sub: "Pending", state: "pending" },
  { label: "Discount Applied", sub: "Pending", state: "pending" },
];

function StepStatus({
  patientId,
  patientName,
  billAmount,
  requestedAmount,
}: any) {
  return (
    <Stack spacing={2.5}>
      {/* Success Banner */}
      <SurfaceCard
        sx={{
          borderTop: `3px solid ${T.brand}`,
          p: "28px 24px",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
                width: 56,
                height: 56,
            borderRadius: "50%",
            background: T.brandLight,
            border: `2px solid ${T.brandMid}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <TrophyIcon sx={{ fontSize: 26, color: T.brand }} />
        </Box>
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, letterSpacing: "-0.5px", mb: 0.5 }}>
          Application Submitted!
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: T.textSecondary, mb: 2.5 }}>
          Track your financial assistance request in real time below.
        </Typography>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            p: "10px 18px",
            bgcolor: T.successBg,
            border: `1px solid ${T.successBorder}`,
            borderRadius: T.radius.full,
          }}
        >
          <CheckCircleIcon sx={{ color: T.successText, fontSize: 16 }} />
          <Typography sx={{ fontSize: 13, color: T.successText, fontWeight: 600 }}>
            FAR-009 submitted · SMS updates sent to +91 9876543210
          </Typography>
        </Box>
      </SurfaceCard>

      {/* Metric Cards */}
      <Grid container spacing={1.5}>
        {[
          { label: "Request ID", value: "FAR-009", color: T.textPrimary },
          { label: "Bill Amount", value: `₹${billAmount.toLocaleString()}`, color: T.textPrimary },
          { label: "Assistance", value: `₹${requestedAmount.toLocaleString()}`, color: "#EF4444" },
          { label: "You Pay", value: `₹${(billAmount - requestedAmount).toLocaleString()}`, color: T.brand },
        ].map((m) => (
          <Grid item xs={6} sm={3} key={m.label}>
            <Box
              sx={{
                p: "14px 16px",
                background: T.surfaceElevated,
                border: `1px solid ${T.border}`,
                borderRadius: T.radius.md,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: 10.5, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.5 }}>
                {m.label}
              </Typography>
              <Typography sx={{ fontSize: 17, fontWeight: 800, color: m.color }}>
                {m.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Tracker */}
      <SurfaceCard>
        <SectionHeader>
          <ClockIcon sx={{ fontSize: 17, color: T.brand }} />
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, flex: 1 }}>
            Live Application Tracker
          </Typography>
          <Chip
            label="Under Review"
            size="small"
            sx={{ fontSize: 11, fontWeight: 700, bgcolor: T.warningBg, color: T.warningText, border: `1px solid ${T.warningBorder}`, height: 24 }}
          />
        </SectionHeader>

        <Box sx={{ p: "24px 28px" }}>
          {/* Progress Track */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "space-between",
              mb: 4,
            }}
          >
            {/* connector line */}
            <Box
              sx={{
                position: "absolute",
                top: 17,
                left: "10%",
                right: "10%",
                height: 2,
                bgcolor: T.border,
                zIndex: 0,
              }}
            />

            {TRACKER.map((step) => (
              <Stack key={step.label} alignItems="center" spacing={1} sx={{ minWidth: 60, zIndex: 1 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor:
                      step.state === "done"
                        ? T.brand
                        : step.state === "active"
                        ? "#F59E0B"
                        : T.surfaceElevated,
                    border: `2px solid ${
                      step.state === "done"
                        ? T.brand
                        : step.state === "active"
                        ? "#F59E0B"
                        : T.border
                    }`,
                    color: step.state === "pending" ? T.textMuted : "#fff",
                    boxShadow:
                      step.state === "active"
                        ? "0 0 0 5px rgba(245,158,11,0.15)"
                        : "none",
                  }}
                >
                  {step.state === "done" ? (
                    <CheckCircleIcon sx={{ fontSize: 16 }} />
                  ) : step.state === "active" ? (
                    <AssignmentIndIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: T.borderMid }} />
                  )}
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: T.textPrimary, lineHeight: 1.3 }}>
                    {step.label}
                  </Typography>
                  <Typography sx={{ fontSize: 10.5, color: T.textMuted }}>
                    {step.date || step.sub}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Box>

          <Box
            sx={{
              p: "10px 14px",
              bgcolor: T.brandLight,
              border: `1px solid ${T.brandMid}`,
              borderRadius: T.radius.md,
              display: "flex",
              gap: 1.5,
              alignItems: "flex-start",
            }}
          >
            <InfoIcon sx={{ fontSize: 16, color: T.brand, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12.5, color: T.brandDark }}>
              Check status anytime using Patient ID <strong>{patientId}</strong> or Request ID <strong>FAR-009</strong>.
              Expected response within 2–3 working days.
            </Typography>
          </Box>
        </Box>
      </SurfaceCard>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pb: 4 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: T.radius.md,
            borderColor: T.borderMid,
            color: T.textSecondary,
          }}
        >
          Apply Another
        </Button>
      </Box>
    </Stack>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinancialAssistancePage() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [isCalculated, setIsCalculated] = React.useState(false);

  const [patientId, setPatientId] = React.useState("P-20241101");
  const [patientName, setPatientName] = React.useState("Rahul Sharma");
  const [mobile, setMobile] = React.useState("+91 9876543210");
  const [department, setDepartment] = React.useState("Oncology");
  const [billNo, setBillNo] = React.useState("INV-2024-0381");
  const [billAmount, setBillAmount] = React.useState(85000);
  const [admissionType, setAdmissionType] = React.useState("IPD");
  const [assistanceType, setAssistanceType] = React.useState("Government Scheme");
  const [schemeName, setSchemeName] = React.useState("Ayushman Bharat (PM-JAY)");
  const [requestedAmount, setRequestedAmount] = React.useState(60000);
  const [priority, setPriority] = React.useState("High");
  const [reason, setReason] = React.useState(
    "Patient is suffering from Stage 3 cancer. Family income is below ₹20,000/month. Unable to afford full treatment cost. Requesting financial assistance under PM-JAY scheme."
  );
  const [income, setIncome] = React.useState("Above ₹1 Lakh");
  const [category, setCategory] = React.useState("APL");
  const [hasAyushman, setHasAyushman] = React.useState("No");
  const [hasInsurance, setHasInsurance] = React.useState("Yes");

  const eligibleSchemes = React.useMemo(
    () => getEligibleSchemes(income, category, hasAyushman, hasInsurance),
    [income, category, hasAyushman, hasInsurance]
  );

  const next = () => setActiveStep((p) => p + 1);
  const back = () => setActiveStep((p) => p - 1);

  const stepProps = {
    patientId, setPatientId,
    patientName, setPatientName,
    mobile, setMobile,
    department, setDepartment,
    billNo, setBillNo,
    billAmount, setBillAmount,
    admissionType, setAdmissionType,
    assistanceType, setAssistanceType,
    schemeName, setSchemeName,
    requestedAmount, setRequestedAmount,
    priority, setPriority,
    reason, setReason,
    income, setIncome,
    category, setCategory,
    hasAyushman, setHasAyushman,
    hasInsurance, setHasInsurance,
    isCalculated, setIsCalculated,
    eligibleSchemes,
    onBack: back,
    onNext: next,
  };

  return (
    // <PatientPortalWorkspaceCard current="financial-assistance" hidePatientBar={false}>
      <Stack spacing={2.5}>
        <ModuleHeaderCard
          title="Financial Assistance"
          actions={
            <Chip
              label={`Step ${activeStep + 1} of ${STEPS.length}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: 13, borderRadius: T.radius.sm, bgcolor: T.brandLight, height: 32 }}
            />
          }
        />

        <Stack spacing={2.5}>
          {/* Stepper Card */}
          <SurfaceCard sx={{ p: "20px 24px" }}>
            <Stepper activeStep={activeStep} alternativeLabel connector={<CustomConnector />}>
              {STEPS.map((label, idx) => (
                <Step key={label}>
                  <StepLabel
                    StepIconComponent={(props) => (
                      <CustomStepIcon {...props} icon={idx + 1} />
                    )}
                  >
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        fontWeight: activeStep === idx ? 700 : 500,
                        color: activeStep === idx ? T.brand : activeStep > idx ? T.brandDark : T.textMuted,
                        mt: 0.5,
                        transition: "color 0.2s ease",
                      }}
                    >
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </SurfaceCard>

          {/* Step Content */}
          {activeStep === 0 && <StepEligibility {...stepProps} />}
          {activeStep === 1 && <StepApplication {...stepProps} />}
          {activeStep === 2 && <StepDocuments {...stepProps} />}
          {activeStep === 3 && <StepReview {...stepProps} />}
          {activeStep === 4 && <StepStatus {...stepProps} />}
        </Stack>
      </Stack>
  );
}