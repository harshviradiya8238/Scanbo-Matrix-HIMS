"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  Card,
  IconButton,
  Dialog,
  DialogContent,
  TextField,
  MenuItem,
} from "@/src/ui/components/atoms";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Bloodtype as BloodIcon,
  Science as BioIcon,
  BugReport as MicroIcon,
  Vaccines as SerologyIcon,
  Storefront as HistoIcon,
  Biotech as CytoIcon,
  Memory as MolecIcon,
  Save as SaveIcon,
  AccessTime as TatIcon,
  Person as PersonIcon,
  Build as InstrumentIcon,
  CheckCircle as ActiveIcon,
  Circle as InactiveCircleIcon,
} from "@mui/icons-material";
import PageTemplate from "@/src/ui/components/PageTemplate";
import WorkspaceHeaderCard from "@/src/ui/components/molecules/WorkspaceHeaderCard";

// ─── Design tokens (consistent with the rest of the lab system) ───────────────
const T = {
  border: "#E2E8F0",
  surface: "#F8FAFC",
  surfaceHover: "#F1F5F9",
  white: "#FFFFFF",
  textPrimary: "#1172BA",
  textSecondary: "#475569",
  textMuted: "#94A3B8",

  primary: "#1172BA",
  primaryLight: "#EEF2FF",
  primaryMid: "#C7D2FE",
  primaryHover: "#1172BA",

  // Status
  activeTxt: "#0F766E",
  activeBg: "#F0FDFA",
  activeBdr: "#99F6E4",
  inactiveTxt: "#64748B",
  inactiveBg: "#F1F5F9",
  inactiveBdr: "#CBD5E1",

  shadowCard: "0 1px 3px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.03)",
  shadowCardHover: "0 6px 20px rgba(67,56,202,0.09), 0 0 0 1.5px #1172BA",
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

// ─── Per-department icon + color config ───────────────────────────────────────
// All using refined, desaturated tones — no saturated material colors
const DEPT_CONFIG: Record<
  string,
  { iconBg: string; iconBorder: string; iconColor: string }
> = {
  blood: { iconBg: "#FFF1F2", iconBorder: "#FECDD3", iconColor: "#9F1239" },
  bio: { iconBg: "#EEF2FF", iconBorder: "#C7D2FE", iconColor: "#4338CA" },
  micro: { iconBg: "#F0FDFA", iconBorder: "#99F6E4", iconColor: "#0F766E" },
  serology: { iconBg: "#FDF4FF", iconBorder: "#E9D5FF", iconColor: "#7E22CE" },
  histo: { iconBg: "#FFFBEB", iconBorder: "#FDE68A", iconColor: "#92400E" },
  cyto: { iconBg: "#F0F9FF", iconBorder: "#BAE6FD", iconColor: "#075985" },
  molec: { iconBg: "#F1F5F9", iconBorder: "#CBD5E1", iconColor: "#475569" },
};

const getIconEl = (type: string) => {
  const sx = { fontSize: 17 };
  switch (type) {
    case "blood":
      return <BloodIcon sx={sx} />;
    case "bio":
      return <BioIcon sx={sx} />;
    case "micro":
      return <MicroIcon sx={sx} />;
    case "serology":
      return <SerologyIcon sx={sx} />;
    case "histo":
      return <HistoIcon sx={sx} />;
    case "cyto":
      return <CytoIcon sx={sx} />;
    case "molec":
      return <MolecIcon sx={sx} />;
    default:
      return <BioIcon sx={sx} />;
  }
};

// ─── TAT compliance bar ───────────────────────────────────────────────────────
function TatBar({ value }: { value: number }) {
  const color = value >= 85 ? T.activeTxt : value >= 60 ? "#92400E" : "#9F1239";
  const trackBg =
    value >= 85 ? T.activeBg : value >= 60 ? "#FFFBEB" : "#FFF1F2";
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        sx={{
          flex: 1,
          height: 4,
          bgcolor: trackBg,
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${value}%`,
            height: "100%",
            bgcolor: color,
            borderRadius: 99,
          }}
        />
      </Box>
      <Typography
        sx={{ fontSize: "0.68rem", fontWeight: 700, color, minWidth: 28 }}
      >
        {value}%
      </Typography>
    </Stack>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
interface Department {
  id: string;
  name: string;
  shortCode: string;
  head: string;
  analysts: string;
  instruments: string;
  tatTarget: string;
  testsToday: number;
  tatCompliance: number;
  status: "Active" | "Inactive";
  iconType: string;
}

const DUMMY_DATA: Department[] = [
  {
    id: "1",
    name: "Haematology",
    shortCode: "HAEM",
    head: "Dr. Rajesh Kumar",
    analysts: "M. Joseph, S. Pillai",
    instruments: "Sysmex XN-1000",
    tatTarget: "2 hrs",
    testsToday: 82,
    tatCompliance: 88,
    status: "Active",
    iconType: "blood",
  },
  {
    id: "2",
    name: "Biochemistry",
    shortCode: "BIO",
    head: "Dr. Priya Mehta",
    analysts: "R. Sharma, K. Joseph",
    instruments: "Cobas 6000, D-10",
    tatTarget: "4 hrs",
    testsToday: 115,
    tatCompliance: 74,
    status: "Active",
    iconType: "bio",
  },
  {
    id: "3",
    name: "Microbiology",
    shortCode: "MICRO",
    head: "Dr. A. Nair",
    analysts: "K. Joseph",
    instruments: "BD BACTEC FX",
    tatTarget: "48 hrs",
    testsToday: 18,
    tatCompliance: 35,
    status: "Active",
    iconType: "micro",
  },
  {
    id: "4",
    name: "Serology / Immunology",
    shortCode: "SER",
    head: "Dr. S. Verma",
    analysts: "A. Nair, R. Sharma",
    instruments: "Abbott Architect",
    tatTarget: "6 hrs",
    testsToday: 44,
    tatCompliance: 92,
    status: "Active",
    iconType: "serology",
  },
  {
    id: "5",
    name: "Histopathology",
    shortCode: "HISTO",
    head: "Dr. M. Iyer",
    analysts: "P. Kumar",
    instruments: "Leica Autostainer",
    tatTarget: "72 hrs",
    testsToday: 9,
    tatCompliance: 55,
    status: "Active",
    iconType: "histo",
  },
  {
    id: "6",
    name: "Cytology",
    shortCode: "CYTO",
    head: "Dr. M. Iyer",
    analysts: "P. Kumar, S. Das",
    instruments: "Olympus BX53",
    tatTarget: "48 hrs",
    testsToday: 12,
    tatCompliance: 68,
    status: "Active",
    iconType: "cyto",
  },
  {
    id: "7",
    name: "Molecular Biology",
    shortCode: "MOL",
    head: "Not assigned",
    analysts: "Not assigned",
    instruments: "Pending setup",
    tatTarget: "—",
    testsToday: 0,
    tatCompliance: 0,
    status: "Inactive",
    iconType: "molec",
  },
];

// ─── Department card ──────────────────────────────────────────────────────────
function DeptCard({
  dept,
  onEdit,
}: {
  dept: Department;
  onEdit: (d: Department) => void;
}) {
  const cfg = DEPT_CONFIG[dept.iconType] ?? DEPT_CONFIG.bio;
  const isActive = dept.status === "Active";

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
      {/* Header */}
      <Box sx={{ px: 2, pt: 2, pb: 1.75 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{ flex: 1, mr: 1 }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "9px",
                flexShrink: 0,
                bgcolor: cfg.iconBg,
                border: `1px solid ${cfg.iconBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: cfg.iconColor,
              }}
            >
              {getIconEl(dept.iconType)}
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 800,
                  color: T.textPrimary,
                  lineHeight: 1.25,
                }}
              >
                {dept.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: T.textMuted,
                  fontFamily: "monospace",
                  mt: 0.2,
                }}
              >
                {dept.shortCode}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.75}>
            {/* Status badge */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1,
                py: 0.3,
                bgcolor: isActive ? T.activeBg : T.inactiveBg,
                border: `1px solid ${isActive ? T.activeBdr : T.inactiveBdr}`,
                borderRadius: "6px",
              }}
            >
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  bgcolor: isActive ? T.activeTxt : T.inactiveTxt,
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.63rem",
                  fontWeight: 700,
                  color: isActive ? T.activeTxt : T.inactiveTxt,
                  lineHeight: 1,
                }}
              >
                {dept.status}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => onEdit(dept)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: "7px",
                border: `1px solid ${T.border}`,
                color: T.textMuted,
                "&:hover": {
                  bgcolor: T.primaryLight,
                  borderColor: T.primaryMid,
                  color: T.primary,
                },
              }}
            >
              <EditIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* Info rows */}
      <Box sx={{ px: 2, flex: 1 }}>
        {[
          {
            icon: <PersonIcon sx={{ fontSize: 12 }} />,
            label: "Head",
            value: dept.head,
          },
          {
            icon: <PersonIcon sx={{ fontSize: 12 }} />,
            label: "Analysts",
            value: dept.analysts,
          },
          {
            icon: <InstrumentIcon sx={{ fontSize: 12 }} />,
            label: "Instruments",
            value: dept.instruments,
          },
          {
            icon: <TatIcon sx={{ fontSize: 12 }} />,
            label: "TAT Target",
            value: dept.tatTarget,
            accent: dept.tatTarget !== "—",
          },
        ].map((row, i) => (
          <Stack
            key={i}
            direction="row"
            alignItems="baseline"
            justifyContent="space-between"
            sx={{ py: 0.75, borderBottom: `1px solid ${T.border}` }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ color: T.textMuted, minWidth: 90 }}
            >
              {row.icon}
              <Typography sx={{ ...labelSx }}>{row.label}</Typography>
            </Stack>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                textAlign: "right",
                color: row.accent ? "#92400E" : T.textSecondary,
                maxWidth: 160,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={String(row.value)}
            >
              {row.value}
            </Typography>
          </Stack>
        ))}
      </Box>

      {/* Footer — TAT compliance */}
      <Box
        sx={{
          px: 2,
          py: 1.75,
          bgcolor: T.surface,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        {isActive && dept.tatCompliance > 0 ? (
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 0.75 }}
            >
              <Typography sx={labelSx}>TAT Compliance</Typography>
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: T.textMuted,
                }}
              >
                {dept.testsToday} tests today
              </Typography>
            </Stack>
            <TatBar value={dept.tatCompliance} />
          </Box>
        ) : (
          <Typography
            sx={{
              fontSize: "0.72rem",
              color: T.textMuted,
              fontStyle: "italic",
            }}
          >
            Not yet active — no compliance data
          </Typography>
        )}
      </Box>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LabDepartmentsPage() {
  const [departments, setDepartments] = React.useState(DUMMY_DATA);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingDept, setEditingDept] = React.useState<Department | null>(null);
  const [formData, setFormData] = React.useState<Partial<Department>>({
    status: "Active",
    iconType: "bio",
  });

  const handleOpenModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData(dept);
    } else {
      setEditingDept(null);
      setFormData({ status: "Active", iconType: "bio" });
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editingDept) {
      setDepartments((prev) =>
        prev.map((d) => (d.id === editingDept.id ? { ...d, ...formData } : d)),
      );
    } else {
      setDepartments((prev) => [
        ...prev,
        {
          ...formData,
          id: Math.random().toString(36).substr(2, 9),
          testsToday: 0,
          tatCompliance: 0,
        } as Department,
      ]);
    }
    setModalOpen(false);
  };

  const activeDepts = departments.filter((d) => d.status === "Active").length;

  return (
    <PageTemplate
      title="Laboratory Departments"
      subtitle="Configure and manage diagnostic departments"
    >
      <Stack spacing={2.5}>
        {/* ── Toolbar ── */}
        <WorkspaceHeaderCard>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 , color:T.textPrimary }}>
                             Laboratory Departments
                           </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 15 }} />}
              onClick={() => handleOpenModal()}
              sx={{
                bgcolor: T.primary,
                fontWeight: 700,
                fontSize: "0.8rem",
                textTransform: "none",
                borderRadius: "9px",
                height: 36,
                px: 2.5,
                boxShadow: "none",
                "&:hover": { bgcolor: T.primaryHover, boxShadow: "none" },
              }}
            >
              Add Department
            </Button>
          </Stack>
        </WorkspaceHeaderCard>

        {/* ── Cards ── */}
        <Grid container spacing={2}>
          {departments.map((dept) => (
            <Grid item xs={12} md={6} lg={4} key={dept.id}>
              <DeptCard dept={dept} onEdit={handleOpenModal} />
            </Grid>
          ))}
        </Grid>

        {/* ── Modal ── */}
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          maxWidth="sm"
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
                {editingDept ? "Edit Department" : "Add Department"}
              </Typography>
              <Typography
                sx={{ fontSize: "0.72rem", color: T.textMuted, mt: 0.25 }}
              >
                {editingDept
                  ? `Editing: ${editingDept.name}`
                  : "Configure a new lab department"}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setModalOpen(false)}
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
            <Stack spacing={2}>
              <Typography sx={{ ...labelSx, mb: 0.5 }}>Basic Info</Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Department Name *"
                  placeholder="e.g. Molecular Biology"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <TextField
                  fullWidth
                  label="Short Code"
                  placeholder="e.g. MOL"
                  value={formData.shortCode || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, shortCode: e.target.value })
                  }
                />
              </Stack>

              <Box sx={{ my: 0.25, borderTop: `1px dashed ${T.border}` }} />
              <Typography sx={{ ...labelSx, mb: 0.5 }}>Staff</Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Department Head"
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={formData.head || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, head: e.target.value })
                  }
                />
                <TextField
                  fullWidth
                  label="Analysts / Staff"
                  placeholder="e.g. M. Joseph, S. Pillai"
                  value={formData.analysts || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, analysts: e.target.value })
                  }
                />
              </Stack>

              <Box sx={{ my: 0.25, borderTop: `1px dashed ${T.border}` }} />
              <Typography sx={{ ...labelSx, mb: 0.5 }}>Operations</Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Instruments"
                  placeholder="e.g. Sysmex XN-1000"
                  value={formData.instruments || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, instruments: e.target.value })
                  }                />
                <TextField
                  fullWidth
                  label="TAT Target"
                  placeholder="e.g. 2 hrs"
                  value={formData.tatTarget || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, tatTarget: e.target.value })
                  }                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="TAT Compliance (%)"
                  type="number"
                  placeholder="e.g. 88"
                  value={formData.tatCompliance || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tatCompliance: Number(e.target.value),
                    })
                  }                />
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status || "Active"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "Active" | "Inactive",
                    })
                  }                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Stack>
              <TextField
                select
                fullWidth
                label="Icon Type"
                value={formData.iconType || "bio"}
                onChange={(e) =>
                  setFormData({ ...formData, iconType: e.target.value })
                }
              >
                <MenuItem value="blood">Blood — Haematology</MenuItem>
                <MenuItem value="bio">Science — Biochemistry</MenuItem>
                <MenuItem value="micro">Microbe — Microbiology</MenuItem>
                <MenuItem value="serology">Vaccine — Serology</MenuItem>
                <MenuItem value="histo">Store — Histopathology</MenuItem>
                <MenuItem value="cyto">Biotech — Cytology</MenuItem>
                <MenuItem value="molec">Memory — Molecular Biology</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>

          {/* Dialog footer */}
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
              onClick={() => setModalOpen(false)}
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
              onClick={handleSave}
              sx={{
                height: 38,
                px: 3,
                fontSize: "0.8rem",
                fontWeight: 700,
                borderRadius: "9px",
                textTransform: "none",
                bgcolor: T.primary,
              
              }}
            >
              Save Department
            </Button>
          </Box>
        </Dialog>
      </Stack>
    </PageTemplate>
  );
}
