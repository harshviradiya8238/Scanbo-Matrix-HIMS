"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Grid,
  Card,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
} from "@/src/ui/components/atoms";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  PlayArrow as UseIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Star as StarIcon,
  CorporateFare as DeptIcon,
  Science as ScienceIcon,
  TrackChanges as ProfileIcon,
  Biotech as TestIcon,
  AccessTime as TatIcon,
  LocalHospital as ContainerIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import PageTemplate from "@/src/ui/components/PageTemplate";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";
import StatTile from "@/src/ui/components/molecules/StatTile";
import CommonTabs from "@/src/ui/components/molecules/CommonTabs";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  border: "#E2E8F0",
  surface: "#F8FAFC",
  surfaceHover: "#F1F5F9",
  white: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",

  // Indigo primary
  primary: "#1172BA",
  primaryLight: "#EEF2FF",
  primaryMid: "#C7D2FE",
  primaryHover: "#1172BA",

  // Department colors — muted, distinct
  deptColors: {
    Biochemistry: { text: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
    Haematology: { text: "#9F1239", bg: "#FFF1F2", border: "#FECDD3" },
    Serology: { text: "#0F766E", bg: "#F0FDFA", border: "#99F6E4" },
    Microbiology: { text: "#5B21B6", bg: "#F5F3FF", border: "#DDD6FE" },
    default: { text: "#1E3A5F", bg: "#EFF6FF", border: "#BFDBFE" },
  } as Record<string, { text: string; bg: string; border: string }>,

  // Usage bar
  usageFill: "#C7D2FE",
  usageBg: "#EEF2FF",

  shadowCard: "0 1px 3px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.03)",
  shadowCardHover: "0 6px 20px rgba(67,56,202,0.1), 0 0 0 1.5px #1172BA",
};

const labelSx = {
  fontSize: "0.62rem",
  fontWeight: 700,
  color: T.textMuted,
  textTransform: "uppercase" as const,
  letterSpacing: "0.07em",
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "9px",
    fontSize: "0.85rem",
    bgcolor: "#FAFAFA",
    "& fieldset": { borderColor: T.border },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset": { borderColor: T.primary, borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: T.primary },
};

// ─── Data ──────────────────────────────────────────────────────────────────────
interface AnalysisProfile {
  id: string;
  name: string;
  department: string;
  analytesCount: number;
  analytesList: string;
  sampleType: string;
  container: string;
  tat: string;
  price: string;
  monthlyUsage: number;
  maxUsage?: number;
}

const DUMMY_PROFILES: AnalysisProfile[] = [
  {
    id: "1",
    name: "Cardiac Markers",
    department: "Biochemistry",
    analytesCount: 6,
    analytesList: "Troponin I, Troponin T, CK-MB, LDH +2 more",
    sampleType: "Blood",
    container: "SST (Yellow)",
    tat: "1h",
    price: "₹2,800",
    monthlyUsage: 23,
    maxUsage: 130,
  },
  {
    id: "2",
    name: "CBC Complete",
    department: "Haematology",
    analytesCount: 18,
    analytesList: "HGB, WBC, RBC, PLT +14 more",
    sampleType: "Blood",
    container: "EDTA (Purple)",
    tat: "2h",
    price: "₹350",
    monthlyUsage: 128,
    maxUsage: 130,
  },
  {
    id: "3",
    name: "Diabetic Monitoring Panel",
    department: "Biochemistry",
    analytesCount: 6,
    analytesList:
      "Fasting Glucose, Post-Prandial Glucose, HbA1c, Fructosamine +2 more",
    sampleType: "Blood",
    container: "Fluoride (Grey)",
    tat: "4h",
    price: "₹1,100",
    monthlyUsage: 48,
    maxUsage: 130,
  },
  {
    id: "4",
    name: "LFT Panel",
    department: "Biochemistry",
    analytesCount: 10,
    analytesList: "Total Bilirubin, Direct Bilirubin, SGOT, SGPT +6 more",
    sampleType: "Blood",
    container: "SST (Yellow)",
    tat: "3h",
    price: "₹700",
    monthlyUsage: 84,
    maxUsage: 130,
  },
  {
    id: "5",
    name: "Lipid Profile",
    department: "Biochemistry",
    analytesCount: 6,
    analytesList: "Total Cholesterol, HDL, LDL, VLDL +2 more",
    sampleType: "Blood",
    container: "SST (Yellow)",
    tat: "4h",
    price: "₹800",
    monthlyUsage: 72,
    maxUsage: 130,
  },
  {
    id: "6",
    name: "RFT Panel",
    department: "Biochemistry",
    analytesCount: 6,
    analytesList: "Urea, Creatinine, eGFR, Uric Acid +2 more",
    sampleType: "Blood",
    container: "SST (Yellow)",
    tat: "3h",
    price: "₹650",
    monthlyUsage: 55,
    maxUsage: 130,
  },
  {
    id: "7",
    name: "Thyroid Profile",
    department: "Serology",
    analytesCount: 4,
    analytesList: "TSH, T3, T4, Free T4 (FT4)",
    sampleType: "Blood",
    container: "SST (Yellow)",
    tat: "4h",
    price: "₹1,200",
    monthlyUsage: 61,
    maxUsage: 130,
  },
  {
    id: "8",
    name: "Urine Routine & Microscopy",
    department: "Microbiology",
    analytesCount: 14,
    analytesList: "Colour, Clarity, pH, Specific Gravity +10 more",
    sampleType: "Urine",
    container: "Universal (White)",
    tat: "1h",
    price: "₹200",
    monthlyUsage: 93,
    maxUsage: 130,
  },
];

// ─── Dept badge ────────────────────────────────────────────────────────────────
function DeptBadge({ dept }: { dept: string }) {
  const c = T.deptColors[dept] ?? T.deptColors.default;
  return (
    <Box
      sx={{
        display: "inline-flex",
        px: 1,
        py: 0.35,
        bgcolor: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: "6px",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.63rem",
          fontWeight: 700,
          color: c.text,
          lineHeight: 1,
        }}
      >
        {dept}
      </Typography>
    </Box>
  );
}

// ─── Usage bar ─────────────────────────────────────────────────────────────────
function UsageBar({ value, max = 130 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        sx={{
          flex: 1,
          height: 4,
          bgcolor: T.usageBg,
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${pct}%`,
            height: "100%",
            bgcolor: T.primary,
            borderRadius: 99,
          }}
        />
      </Box>
      <Typography
        sx={{
          fontSize: "0.65rem",
          fontWeight: 700,
          color: T.textMuted,
          minWidth: 26,
        }}
      >
        {value}×
      </Typography>
    </Stack>
  );
}

// ─── Profile card ──────────────────────────────────────────────────────────────
// ─── Profile card (compact redesign) ─────────────────────────────────────────
function ProfileCard({
  p,
  onUse,
}: {
  p: AnalysisProfile;
  onUse: (p: AnalysisProfile) => void;
}) {
  return (
    <Card
      sx={{
        p: 0,
        borderRadius: "14px",
        border: `1px solid ${T.border}`,
        boxShadow: T.shadowCard,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "box-shadow 0.18s, border-color 0.18s",
        "&:hover": { boxShadow: T.shadowCardHover, borderColor: "#A5B4FC" },
      }}
    >
      {/* ── Header row: icon + name + dept badge ── */}
      <Box sx={{ px: 2, pt: 1.75, pb: 1.25 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
          <Box
            sx={{
              width: 28, height: 28, borderRadius: "7px", flexShrink: 0,
              bgcolor: T.primaryLight, border: `1px solid ${T.primaryMid}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ScienceIcon sx={{ fontSize: 14, color: T.primary }} />
          </Box>
          <Typography
            sx={{ fontSize: "0.82rem", fontWeight: 800, color: T.textPrimary, flex: 1, lineHeight: 1.25 }}
          >
            {p.name}
          </Typography>
          <DeptBadge dept={p.department} />
        </Stack>

        {/* Analytes — single compact line */}
        <Typography
          sx={{ fontSize: "0.72rem", color: T.textMuted, lineHeight: 1.45 }}
          noWrap
          title={p.analytesList}
        >
          <Box component="span" sx={{ fontWeight: 700, color: T.textSecondary }}>
            {p.analytesCount} analytes:&nbsp;
          </Box>
          {p.analytesList}
        </Typography>
      </Box>

      {/* ── Meta: 4 values in a tight 2×2 grid ── */}
      <Box
        sx={{
          mx: 2, mb: 1.25,
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "1px", bgcolor: T.border,
          border: `1px solid ${T.border}`, borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {[
          { label: "Sample",    value: p.sampleType },
          { label: "Container", value: p.container },
          { label: "TAT",       value: p.tat,    color: "#92400E" },
          { label: "Price",     value: p.price,  color: T.primary },
        ].map((item) => (
          <Box key={item.label} sx={{ bgcolor: T.surface, px: 1.25, py: 0.75 }}>
            <Typography sx={{ ...labelSx, mb: 0.2 }}>{item.label}</Typography>
            <Typography
              sx={{
                fontSize: "0.75rem", fontWeight: 700,
                color: item.color ?? T.textPrimary,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
              title={item.value}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Usage bar ── */}
      <Box sx={{ px: 2, mb: 1.25 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.4 }}>
          <Typography sx={labelSx}>Monthly usage</Typography>
          <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: T.textMuted }}>
            {p.monthlyUsage}×
          </Typography>
        </Stack>
        <Box sx={{ height: 3, bgcolor: T.usageBg, borderRadius: 99, overflow: "hidden" }}>
          <Box
            sx={{
              width: `${Math.min(((p.monthlyUsage) / (p.maxUsage ?? 130)) * 100, 100)}%`,
              height: "100%", bgcolor: T.primary, borderRadius: 99,
            }}
          />
        </Box>
      </Box>

      {/* ── Actions ── */}
      <Box
        sx={{
          px: 2, py: 1.25,
          borderTop: `1px solid ${T.border}`,
          bgcolor: T.surface, mt: "auto",
        }}
      >
        <Stack direction="row" spacing={0.75}>
          <Button
            variant="outlined" size="small"
            startIcon={<EditIcon sx={{ fontSize: "12px !important" }} />}
            sx={{
              flex: 1, height: 28, fontSize: "0.68rem", fontWeight: 600,
              borderRadius: "7px", textTransform: "none",
              borderColor: T.border, color: T.textSecondary,
              "&:hover": { bgcolor: T.surfaceHover, borderColor: "#94A3B8" },
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined" size="small"
            startIcon={<ViewIcon sx={{ fontSize: "12px !important" }} />}
            sx={{
              flex: 1, height: 28, fontSize: "0.68rem", fontWeight: 600,
              borderRadius: "7px", textTransform: "none",
              borderColor: T.border, color: T.textSecondary,
              "&:hover": { bgcolor: T.surfaceHover, borderColor: "#94A3B8" },
            }}
          >
            View
          </Button>
          <Button
            variant="contained" size="small"
            startIcon={<UseIcon sx={{ fontSize: "12px !important" }} />}
            onClick={() => onUse(p)}
            sx={{
              flex: 1, height: 28, fontSize: "0.68rem", fontWeight: 700,
              borderRadius: "7px", textTransform: "none",
              bgcolor: T.primary, boxShadow: "none",
              "&:hover": { bgcolor: T.primaryHover, boxShadow: "none" },
            }}
          >
            Use
          </Button>
          <IconButton
            size="small"
            sx={{
              width: 28, height: 28, borderRadius: "7px",
              border: `1px solid ${T.border}`, color: T.textMuted,
              "&:hover": { bgcolor: "#FFF1F2", borderColor: "#FECDD3", color: "#9F1239" },
            }}
          >
            <DeleteIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Stack>
      </Box>
    </Card>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function AnalysisProfilesPage() {
  const theme = useTheme();
  const [activeDept, setActiveDept] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [registerModalOpen, setRegisterModalOpen] = React.useState(false);
  const [selectedProfile, setSelectedProfile] =
    React.useState<AnalysisProfile | null>(null);

  const filteredProfiles = React.useMemo(() => {
    return DUMMY_PROFILES.filter((p) => {
      const matchDept = activeDept === "All" || p.department === activeDept;
      const matchSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [activeDept, searchQuery]);

  const handleUseProfile = (profile: AnalysisProfile) => {
    setSelectedProfile(profile);
    setRegisterModalOpen(true);
  };

  return (
    <PageTemplate
      title="Analysis Profiles"
      subtitle="Define reusable test bundles to speed up sample registration"
    >
      <Stack spacing={1.25}>
        {/* ── Summary Stats ── */}
        <Grid container spacing={2}>
          {[
            {
              label: "Total Profiles",
              value: "8",
              subtitle: "Active bundles",
              tone: "primary" as const,
              icon: <ProfileIcon />,
            },
            {
              label: "Most Used",
              value: "CBC Complete",
              subtitle: "This month",
              tone: "warning" as const,
              icon: <StarIcon />,
            },
            {
              label: "Departments",
              value: "4",
              subtitle: "Covered",
              tone: "info" as const,
              icon: <DeptIcon />,
            },
            {
              label: "Total Tests",
              value: "70",
              subtitle: "Across all profiles",
              tone: "success" as const,
              icon: <TestIcon />,
            },
          ].map((s) => (
            <Grid item xs={12} sm={6} md={3} key={s.label}>
              <StatTile
                label={s.label}
                value={s.value}
                subtitle={s.subtitle}
                tone={s.tone}
                icon={s.icon}
                variant="soft"
              />
            </Grid>
          ))}
        </Grid>

        {/* ── Toolbar ── */}
        {/* <Box
          sx={{
            bgcolor: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: "12px",
            px: 2,
            py: 1.75,
            boxShadow: T.shadowCard,
          }}
        > */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <CommonTabs
              tabs={[
                { id: "All", label: "All" },
                { id: "Haematology", label: "Haematology" },
                { id: "Biochemistry", label: "Biochemistry" },
                { id: "Serology", label: "Serology" },
                { id: "Microbiology", label: "Microbiology" },
              ]}
              value={activeDept}
              onChange={setActiveDept}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: T.primary,
                fontWeight: 700,
                fontSize: "0.82rem",
                textTransform: "none",
                borderRadius: "9px",
                height: 36,
                px: 2.5,
                boxShadow: "none",
                "&:hover": { bgcolor: T.primaryHover, boxShadow: "none" },
              }}
            >
              Create Profile
            </Button>
          </Stack>
        {/* </Box> */}

        {/* ── Profiles grid ── */}
        <Grid container spacing={2}>
          {filteredProfiles.map((p) => (
            <Grid item xs={12} md={6} lg={4} key={p.id}>
              <ProfileCard p={p} onUse={handleUseProfile} />
            </Grid>
          ))}
        </Grid>

        {/* ── Register dialog ── */}
        <Dialog
          open={registerModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "16px",
              border: `1px solid ${T.border}`,
              boxShadow: "0 24px 48px rgba(15,23,42,0.12)",
              overflow: "hidden",
            },
          }}
        >
          {/* Dialog header */}
          <Box
            sx={{
              px: 3,
              py: 2.25,
              bgcolor: T.surface,
              borderBottom: `1px solid ${T.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                sx={{ fontSize: "1rem", fontWeight: 800, color: T.textPrimary }}
              >
                Register New Sample
              </Typography>
              {selectedProfile && (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.75}
                  sx={{ mt: 0.4 }}
                >
                  <Typography sx={{ fontSize: "0.72rem", color: T.textMuted }}>
                    Using profile:
                  </Typography>
                  <DeptBadge dept={selectedProfile.department} />
                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: T.textSecondary,
                    }}
                  >
                    {selectedProfile.name}
                  </Typography>
                </Stack>
              )}
            </Box>
            <IconButton
              size="small"
              onClick={() => setRegisterModalOpen(false)}
              sx={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                border: `1px solid ${T.border}`,
                color: T.textMuted,
                "&:hover": { bgcolor: T.surfaceHover },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <DialogContent sx={{ p: 3, bgcolor: T.white }}>
            <Grid container spacing={2}>
              {/* Section: Patient */}
              <Grid item xs={12}>
                <Typography sx={{ ...labelSx }}>
                  Patient Information
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Patient Name *"
                  placeholder="e.g. Priya Mehta"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Patient UHID"
                  placeholder="UHID-00482"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Age"
                  placeholder="34"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Gender"
                  placeholder="Female"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Ward / OPD"
                  placeholder="OPD"
                />
              </Grid>

              {/* Divider */}
              <Grid item xs={12}>
                <Box sx={{ my: 0.5, borderTop: `1px dashed ${T.border}` }} />
                <Typography sx={{ ...labelSx, mt: 1.5,  }}>
                  Referral & Test Details
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Client *"
                  defaultValue="MediCare Hospital (In-House)"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  placeholder="Dr. A. Sharma"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  label="Analysis Profile"
                  value={selectedProfile?.id || ""}
                  onChange={(e) => {
                    const p = DUMMY_PROFILES.find(
                      (x) => x.id === e.target.value,
                    );
                    if (p) setSelectedProfile(p);
                  }}
                >
                  {DUMMY_PROFILES.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Or type analyses"
                  placeholder="TSH, T3, T4, CBC..."
                />
              </Grid>

              {/* Divider */}
              <Grid item xs={12}>
                <Box sx={{ my: 0.5, borderTop: `1px dashed ${T.border}` }} />
                <Typography sx={{ ...labelSx, mt: 1.5,  }}>
                  Sample & Collection
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Sample Type *"
                  defaultValue={selectedProfile?.sampleType || ""}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Container"
                  defaultValue={selectedProfile?.container || ""}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  label="Priority"
                  defaultValue="Routine"
                >
                  <MenuItem value="Routine">Routine</MenuItem>
                  <MenuItem value="Urgent">Urgent / STAT</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Collection Time"
                  defaultValue="10:30"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <TatIcon sx={{ fontSize: 16, color: T.textMuted }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Batch (optional)"
                  placeholder="— No Batch —"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Clinical Notes"
                  placeholder="Diagnosis, clinical history..."
                />
              </Grid>
            </Grid>
          </DialogContent>

          <Box
            sx={{
              px: 3,
              py: 2,
              borderTop: `1px solid ${T.border}`,
              bgcolor: T.surface,
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.25,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setRegisterModalOpen(false)}
              sx={{
                height: 38,
                px: 2.5,
                fontSize: "0.8rem",
                fontWeight: 600,
                borderRadius: "9px",
                textTransform: "none",
                borderColor: T.border,
                color: T.textSecondary,
                "&:hover": { bgcolor: T.surfaceHover, borderColor: "#94A3B8" },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
              sx={{
                height: 38,
                px: 3,
                fontSize: "0.8rem",
                fontWeight: 700,
                borderRadius: "9px",
                textTransform: "none",
                bgcolor: T.primary,
                boxShadow: `0 4px 12px ${alpha(T.primary, 0.3)}`,
                "&:hover": {
                  bgcolor: T.primaryHover,
                  boxShadow: `0 6px 18px ${alpha(T.primary, 0.35)}`,
                },
              }}
            >
              Register Sample
            </Button>
          </Box>
        </Dialog>
      </Stack>
    </PageTemplate>
  );
}
