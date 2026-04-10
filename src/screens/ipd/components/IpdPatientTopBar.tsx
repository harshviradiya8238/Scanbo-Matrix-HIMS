"use client";

import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  CloseRounded as CloseRoundedIcon,
  Search as SearchIcon,
  SupervisedUserCircleRounded as SupervisedUserCircleRoundedIcon,
  BedOutlined as BedOutlinedIcon,
  PersonOutline as PersonOutlineIcon,
  SwapHorizRounded as SwapHorizRoundedIcon,
} from "@mui/icons-material";
import { getPatientByMrn } from "@/src/mocks/global-patients";
import { maskMobileNumber } from "@/src/core/utils/phone";

type FieldTone = "default" | "success" | "warning" | "error" | "info";

export interface IpdPatientTopBarField {
  id: string;
  label: string;
  value: React.ReactNode;
  tone?: FieldTone;
}

export interface IpdPatientOption {
  patientId: string;
  name: string;
  mrn: string;
  ageGender?: string;
  phone?: string;
  ward?: string;
  bed?: string;
  consultant?: string;
  diagnosis?: string;
  status?: string;
  statusTone?: FieldTone;
  insurance?: string;
  totalBill?: number | string;
  dueAmount?: number | string;
  tags?: string[];
}

interface IpdPatientTopBarProps {
  moduleTitle: string;
  sectionLabel?: string;
  pageLabel?: string;
  patient: IpdPatientOption | null;
  fields: IpdPatientTopBarField[];
  patientOptions: IpdPatientOption[];
  onSelectPatient: (patientId: string) => void;
  rightActions?: React.ReactNode;
  stickyTop?: number;
}

export const IPD_PATIENT_TOP_BAR_STICKY_OFFSET = 64;

const SUMMARY_FIELD_ORDER = [
  "ward-bed", "admitted", "los", "consultant", "status", "total-bill", "diagnosis",
] as const;
const SUMMARY_FIELD_LIMIT = 5;

const INR_CURRENCY = new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0,
});

const TONE_CONFIG: Record<FieldTone, {
  color: string;
  bg: string;
  border: string;
  dot: string;
}> = {
  default: { color: "#4B5E8A", bg: "#F0F4FB", border: "#D6E0F7", dot: "#94A3C8" },
  success: { color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0", dot: "#22C55E" },
  warning: { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B" },
  error:   { color: "#B91C1C", bg: "#FFF1F2", border: "#FECDD3", dot: "#F43F5E" },
  info:    { color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", dot: "#3B82F6" },
};

const AVATAR_COLORS = ["#1172BA", "#0F5FA3", "#1565C0", "#0D5C96"];

const getInitials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((c) => c[0]?.toUpperCase() ?? "").join("") || "P";

const getAvatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

function formatAmount(value?: number | string): string {
  if (value === undefined || value === null || value === "") return "--";
  if (typeof value === "number") return INR_CURRENCY.format(value);
  const n = Number(value);
  return Number.isFinite(n) ? INR_CURRENCY.format(n) : String(value);
}

function normalized(value: string) { return value.trim().toLowerCase(); }

function collectTags(option: IpdPatientOption): string[] {
  const tags = new Set<string>();
  if (option.status) tags.add(option.status);
  (option.tags ?? []).forEach((tag) => { if (tag.trim()) tags.add(tag.trim()); });
  return Array.from(tags);
}

function parseAgeGender(ageGender?: string): { age: string; gender: string } {
  const value = String(ageGender ?? "").trim();
  if (!value) return { age: "", gender: "" };
  const slash = value.split("/").map((p) => p.trim()).filter(Boolean);
  if (slash.length >= 2) return { age: slash[0].replace(/\s*yrs?$/i, "").trim(), gender: slash[1] };
  const dot = value.split("·").map((p) => p.trim()).filter(Boolean);
  if (dot.length >= 2) return { age: dot[0].replace(/\s*yrs?$/i, "").trim(), gender: dot[1] };
  return { age: value.replace(/\s*yrs?$/i, "").trim(), gender: "" };
}

// ── Refined Field Pill ────────────────────────────────────────────────────────
function FieldChip({ field }: { field: IpdPatientTopBarField }) {
  const tone = field.tone ?? "default";
  const cfg = TONE_CONFIG[tone];

  return (
    <Box sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.75,
      px: 1.25,
      py: 0.6,
      borderRadius: "10px",
      border: `1px solid ${cfg.border}`,
      bgcolor: cfg.bg,
      minWidth: 0,
      transition: "all 0.15s ease",
      "&:hover": {
        filter: "brightness(0.97)",
        transform: "translateY(-0.5px)",
      },
    }}>
      {/* Tone dot */}
      <Box sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: cfg.dot,
        flexShrink: 0,
      }} />
      <Box>
        <Typography sx={{
          fontSize: "9.5px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: alpha(cfg.color, 0.65),
          lineHeight: 1.2,
        }}>
          {field.label}
        </Typography>
        <Typography sx={{
          fontSize: "12.5px",
          fontWeight: 700,
          color: cfg.color,
          lineHeight: 1.35,
          whiteSpace: "nowrap",
        }}>
          {String(field.value ?? "--")}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Patient Status Badge ──────────────────────────────────────────────────────
function StatusBadge({ status, tone }: { status?: string; tone?: FieldTone }) {
  if (!status) return null;
  const cfg = TONE_CONFIG[tone ?? "default"];
  return (
    <Box sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.5,
      px: 1,
      py: 0.35,
      borderRadius: "6px",
      bgcolor: cfg.bg,
      border: `1px solid ${cfg.border}`,
    }}>
      <Box sx={{
        width: 5,
        height: 5,
        borderRadius: "50%",
        bgcolor: cfg.dot,
      }} />
      <Typography sx={{
        fontSize: "10.5px",
        fontWeight: 700,
        color: cfg.color,
        letterSpacing: "0.03em",
      }}>
        {status}
      </Typography>
    </Box>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function IpdPatientTopBar({
  moduleTitle,
  sectionLabel = "IPD",
  pageLabel,
  patient,
  fields,
  patientOptions,
  onSelectPatient,
  rightActions,
  stickyTop = 0,
}: IpdPatientTopBarProps) {
  const theme = useTheme();
  const PRIMARY = "#1172BA";
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");

  const filterOptions = React.useMemo(() => {
    const tags = new Set<string>();
    patientOptions.forEach((o) => collectTags(o).forEach((t) => tags.add(t)));
    return ["All", ...Array.from(tags)];
  }, [patientOptions]);

  React.useEffect(() => {
    if (!filterOptions.includes(statusFilter)) setStatusFilter("All");
  }, [filterOptions, statusFilter]);

  const patientPhone = React.useMemo(() => {
    if (patient?.phone?.trim()) return maskMobileNumber(patient.phone.trim(), "");
    return maskMobileNumber(getPatientByMrn(patient?.mrn)?.phone, "");
  }, [patient?.mrn, patient?.phone]);

  const demographicItems = React.useMemo(() => {
    const { age, gender } = parseAgeGender(patient?.ageGender);
    const parts: string[] = [];
    if (age) parts.push(`${age} yrs`);
    if (gender) parts.push(gender);
    if (patientPhone) parts.push(patientPhone);
    return parts;
  }, [patient?.ageGender, patientPhone]);

  const summaryFields = React.useMemo(() => {
    const byId = new Map(fields.map((f) => [f.id, f]));
    const selected: IpdPatientTopBarField[] = [];
    SUMMARY_FIELD_ORDER.forEach((id) => {
      if (selected.length >= SUMMARY_FIELD_LIMIT) return;
      const m = byId.get(id);
      if (m) selected.push(m);
    });
    if (selected.length < SUMMARY_FIELD_LIMIT) {
      fields.forEach((f) => {
        if (selected.length >= SUMMARY_FIELD_LIMIT) return;
        if (!selected.some((s) => s.id === f.id)) selected.push(f);
      });
    }
    return selected.slice(0, SUMMARY_FIELD_LIMIT);
  }, [fields]);

  const filteredPatients = React.useMemo(() => {
    const query = normalized(search);
    return patientOptions.filter((o) => {
      if (statusFilter !== "All") {
        const tags = collectTags(o);
        if (!tags.some((t) => normalized(t) === normalized(statusFilter))) return false;
      }
      if (!query) return true;
      const hay = [o.name, o.mrn, o.ward, o.bed, o.consultant, o.diagnosis, o.status, o.insurance].join(" ").toLowerCase();
      return hay.includes(query);
    });
  }, [patientOptions, search, statusFilter]);

  const avatarColor = patient ? getAvatarColor(patient.name) : PRIMARY;

  return (
    <>
      {/* ── Sticky Top Bar ── */}
      <Box sx={{
        position: "sticky",
        top: stickyTop,
        bgcolor: "#FFFFFF",
        borderRadius: '16px',
        border: '1px solid #DDE8F0',
        boxShadow: `0 4px 12px rgba(10,68,114,0.08)`,
        zIndex: 20,
        overflow: 'hidden',
        mb: 0,
      }}>

        <Box sx={{ px: { xs: 2, md: 2.5 }, py: { xs: 1.25, md: 1.25 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            {/* ── Patient Identity ── */}
            <Stack direction="row" spacing={1.75} alignItems="center" sx={{ minWidth: 0, flex: "0 0 auto" }}>
              {/* Avatar */}
              <Box sx={{ position: "relative", flexShrink: 0 }}>
                <Box sx={{
                  width: 46,
                  height: 46,
                  borderRadius: "14px",
                  background: `linear-gradient(145deg, ${avatarColor} 0%, ${alpha(avatarColor, 0.75)} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 0 3px ${alpha(avatarColor, 0.15)}, 0 2px 8px ${alpha(avatarColor, 0.3)}`,
                }}>
                  <Typography sx={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: "#fff",
                    letterSpacing: "-0.02em",
                  }}>
                    {getInitials(patient?.name ?? "P")}
                  </Typography>
                </Box>
                {/* Online dot */}
                <Box sx={{
                  position: "absolute",
                  bottom: -1,
                  right: -1,
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  bgcolor: "#10B981",
                  border: "2px solid #fff",
                  boxShadow: `0 0 0 1px ${alpha("#10B981", 0.3)}`,
                }} />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                {/* Name row */}
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.35 }}>
                  <Typography sx={{
                    fontWeight: 800,
                    fontSize: 15,
                    lineHeight: 1.25,
                    color: "#0F172A",
                    letterSpacing: "-0.02em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 220,
                  }}>
                    {patient?.name ?? "No patient selected"}
                  </Typography>

                  {/* MRN badge */}
                  <Box sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    px: 0.9,
                    py: 0.2,
                    borderRadius: "6px",
                    bgcolor: alpha(PRIMARY, 0.08),
                    border: `1px solid ${alpha(PRIMARY, 0.18)}`,
                  }}>
                    <Typography sx={{
                      fontSize: "10.5px",
                      fontWeight: 700,
                      color: PRIMARY,
                      letterSpacing: "0.03em",
                    }}>
                      {patient?.mrn ?? "--"}
                    </Typography>
                  </Box>
                </Stack>

                {/* Demographics */}
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  {demographicItems.map((item, i) => (
                    <React.Fragment key={`${item}-${i}`}>
                      {i > 0 && (
                        <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#CBD5E1", flexShrink: 0 }} />
                      )}
                      <Typography sx={{ fontSize: "11.5px", color: "#64748B", fontWeight: 500 }}>
                        {item}
                      </Typography>
                    </React.Fragment>
                  ))}
                </Stack>
              </Box>
            </Stack>

            {/* ── Divider (desktop) ── */}
            <Box sx={{
              display: { xs: "none", md: "block" },
              width: "1px",
              height: 36,
              bgcolor: alpha(PRIMARY, 0.1),
              flexShrink: 0,
            }} />

            {/* ── Summary Fields ── */}
            {summaryFields.length > 0 && (
              <Box sx={{
                overflowX: "auto",
                flex: 1,
                "&::-webkit-scrollbar": { height: 3 },
                "&::-webkit-scrollbar-thumb": { borderRadius: 999, bgcolor: alpha(PRIMARY, 0.2) },
              }}>
                <Stack
                  direction="row"
                  spacing={0.875}
                  sx={{ minWidth: "max-content", px: 0.25 }}
                >
                  {summaryFields.map((field) => (
                    <FieldChip key={field.id} field={field} />
                  ))}
                </Stack>
              </Box>
            )}

            {/* ── Right Actions ── */}
            <Stack direction="row" spacing={0.875} alignItems="center" sx={{ flexShrink: 0 }}>
              {rightActions && <Box>{rightActions}</Box>}
              <Button
                size="small"
                variant="contained"
                onClick={() => setDialogOpen(true)}
                disabled={patientOptions.length === 0}
                startIcon={<SwapHorizRoundedIcon sx={{ fontSize: "15px !important" }} />}
                sx={{
                  minWidth: 140,
                  height: 36,
                  fontWeight: 700,
                  fontSize: "12.5px",
                  borderRadius: "10px",
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, #1565C0 100%)`,
                  textTransform: "none",
                  letterSpacing: "0.01em",
                  transition: "all 0.2s ease",
                  "&:active": {
                    transform: "translateY(0)",
                    boxShadow: `0 2px 6px ${alpha(PRIMARY, 0.3)}`,
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#F1F5F9",
                    color: "#94A3B8",
                    boxShadow: "none",
                  },
                }}
              >
                Change Patient
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* ── Patient Select Dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "20px",
            overflow: "hidden",
            border: `1px solid ${alpha(PRIMARY, 0.1)}`,
          },
        }}
      >
        {/* Dialog Header */}
        <DialogTitle sx={{
          px: 3,
          py: 2.25,
          bgcolor: "#FAFBFF",
          borderBottom: `1px solid ${alpha(PRIMARY, 0.1)}`,
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              {/* Icon box */}
              <Box sx={{
                width: 38,
                height: 38,
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${PRIMARY} 0%, #1565C0 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 10px ${alpha(PRIMARY, 0.35)}`,
              }}>
                <SupervisedUserCircleRoundedIcon sx={{ color: "#fff", fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#0F172A", lineHeight: 1.25, letterSpacing: "-0.02em" }}>
                  Select IPD Patient
                </Typography>
                <Typography sx={{ fontSize: "11.5px", color: "#64748B", fontWeight: 500 }}>
                  {patientOptions.length} patients currently admitted
                </Typography>
              </Box>
            </Stack>

            <IconButton
              size="small"
              onClick={() => setDialogOpen(false)}
              sx={{
                width: 32,
                height: 32,
                bgcolor: alpha(PRIMARY, 0.06),
                borderRadius: "9px",
                border: `1px solid ${alpha(PRIMARY, 0.1)}`,
                color: "#64748B",
                "&:hover": {
                  bgcolor: alpha(PRIMARY, 0.12),
                  color: PRIMARY,
                },
                transition: "all 0.15s ease",
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {/* Search + Filter section */}
          <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: `1px solid ${alpha(PRIMARY, 0.08)}` }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, MRN, bed, diagnosis…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 17, color: alpha(PRIMARY, 0.5) }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch("")} sx={{ p: 0.4 }}>
                      <CloseRoundedIcon sx={{ fontSize: 15, color: "#94A3B8" }} />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
                sx: {
                  borderRadius: "11px",
                  bgcolor: "#fff",
                  fontSize: 13,
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: `1.5px solid ${alpha(PRIMARY, 0.15)}`,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    border: `1.5px solid ${alpha(PRIMARY, 0.3)}`,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    border: `1.5px solid ${PRIMARY}`,
                  },
                },
              }}
            />

            {/* Filter pills */}
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
              {filterOptions.map((opt) => {
                const active = statusFilter === opt;
                return (
                  <Box
                    key={opt}
                    onClick={() => setStatusFilter(opt)}
                    sx={{
                      px: 1.25,
                      py: 0.5,
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      transition: "all 0.15s ease",
                      border: "1.5px solid",
                      ...(active ? {
                        bgcolor: PRIMARY,
                        borderColor: PRIMARY,
                        color: "#fff",
                        boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.35)}`,
                      } : {
                        bgcolor: "#fff",
                        borderColor: alpha(PRIMARY, 0.15),
                        color: "#64748B",
                        "&:hover": {
                          borderColor: alpha(PRIMARY, 0.3),
                          color: PRIMARY,
                          bgcolor: alpha(PRIMARY, 0.04),
                        },
                      }),
                    }}
                  >
                    {opt}
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Patient list */}
          <Box sx={{
            maxHeight: "50vh",
            overflowY: "auto",
            p: 2,
            "&::-webkit-scrollbar": { width: 5 },
            "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: 999,
              bgcolor: alpha(PRIMARY, 0.18),
              "&:hover": { bgcolor: alpha(PRIMARY, 0.3) },
            },
          }}>
            <Stack spacing={1.25}>
              {filteredPatients.map((option) => {
                const isCurrent = option.patientId === patient?.patientId;
                const tags = collectTags(option);
                const ac = getAvatarColor(option.name);

                return (
                  <Box
                    key={option.patientId}
                    onClick={() => { onSelectPatient(option.patientId); setDialogOpen(false); }}
                    sx={{
                      p: 2,
                      borderRadius: "14px",
                      border: "1.5px solid",
                      borderColor: isCurrent ? PRIMARY : alpha(PRIMARY, 0.1),
                      bgcolor: isCurrent ? alpha(PRIMARY, 0.04) : "#fff",
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                      boxShadow: isCurrent ? `0 0 0 4px ${alpha(PRIMARY, 0.08)}, 0 2px 12px ${alpha(PRIMARY, 0.1)}` : `0 1px 3px rgba(0,0,0,0.04)`,
                      "&:hover": {
                        borderColor: PRIMARY,
                        bgcolor: alpha(PRIMARY, 0.035),
                        boxShadow: `0 0 0 3px ${alpha(PRIMARY, 0.1)}, 0 4px 16px ${alpha(PRIMARY, 0.1)}`,
                        transform: "translateY(-1px)",
                      },
                      "&:active": {
                        transform: "translateY(0)",
                      },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
                      <Stack direction="row" spacing={1.75} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>

                        {/* Avatar */}
                        <Box sx={{
                          width: 44,
                          height: 44,
                          borderRadius: "13px",
                          background: isCurrent
                            ? `linear-gradient(145deg, ${ac} 0%, ${alpha(ac, 0.75)} 100%)`
                            : alpha(ac, 0.12),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: isCurrent ? `0 3px 8px ${alpha(ac, 0.3)}` : "none",
                          border: `1.5px solid ${isCurrent ? alpha(ac, 0.3) : alpha(ac, 0.15)}`,
                        }}>
                          <Typography sx={{
                            fontWeight: 800,
                            fontSize: 14,
                            color: isCurrent ? "#fff" : ac,
                            letterSpacing: "-0.02em",
                          }}>
                            {getInitials(option.name)}
                          </Typography>
                        </Box>

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          {/* Name + badges row */}
                          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.4 }}>
                            <Typography sx={{
                              fontWeight: 800,
                              fontSize: "13.5px",
                              color: "#0F172A",
                              letterSpacing: "-0.01em",
                              whiteSpace: "nowrap",
                            }}>
                              {option.name}
                            </Typography>

                            {isCurrent && (
                              <Box sx={{
                                px: 0.875,
                                py: 0.2,
                                borderRadius: "6px",
                                bgcolor: alpha(PRIMARY, 0.1),
                                border: `1px solid ${alpha(PRIMARY, 0.2)}`,
                              }}>
                                <Typography sx={{ fontSize: "9.5px", fontWeight: 700, color: PRIMARY }}>
                                  CURRENT
                                </Typography>
                              </Box>
                            )}

                            {option.status && (
                              <StatusBadge status={option.status} tone={option.statusTone} />
                            )}
                          </Stack>

                          {/* Meta info */}
                          <Typography sx={{ fontSize: "11.5px", color: "#64748B", fontWeight: 500, mb: 0.9 }} noWrap>
                            {[option.mrn, option.ageGender, option.consultant].filter(Boolean).join(" · ")}
                          </Typography>

                          {/* Tag row */}
                          <Stack direction="row" spacing={0.625} useFlexGap flexWrap="wrap">
                            {/* Ward/Bed pill */}
                            <Box sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              px: 1,
                              py: 0.3,
                              borderRadius: "7px",
                              bgcolor: alpha(PRIMARY, 0.07),
                              border: `1px solid ${alpha(PRIMARY, 0.15)}`,
                            }}>
                              <BedOutlinedIcon sx={{ fontSize: 11, color: PRIMARY }} />
                              <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: PRIMARY }}>
                                W{option.ward || "--"} · B{option.bed || "--"}
                              </Typography>
                            </Box>

                            {/* Status tags */}
                            {tags.filter(t => t !== option.status).slice(0, 2).map((tag) => (
                              <Box key={`${option.patientId}-${tag}`} sx={{
                                px: 1,
                                py: 0.3,
                                borderRadius: "7px",
                                bgcolor: alpha("#F59E0B", 0.08),
                                border: `1px solid ${alpha("#F59E0B", 0.2)}`,
                              }}>
                                <Typography sx={{ fontSize: "10.5px", fontWeight: 600, color: "#B45309" }}>
                                  {tag}
                                </Typography>
                              </Box>
                            ))}

                            {/* Insurance */}
                            {option.insurance && (
                              <Box sx={{
                                px: 1,
                                py: 0.3,
                                borderRadius: "7px",
                                bgcolor: alpha("#10B981", 0.07),
                                border: `1px solid ${alpha("#10B981", 0.18)}`,
                              }}>
                                <Typography sx={{ fontSize: "10.5px", fontWeight: 600, color: "#0D7A5F" }}>
                                  {option.insurance}
                                </Typography>
                              </Box>
                            )}
                          </Stack>

                          {/* Diagnosis */}
                          {option.diagnosis && (
                            <Typography sx={{ fontSize: "11px", color: "#64748B", mt: 0.75, lineHeight: 1.4 }} noWrap>
                              <Box component="span" sx={{ fontWeight: 700, color: "#475569" }}>Dx: </Box>
                              {option.diagnosis}
                            </Typography>
                          )}
                        </Box>
                      </Stack>

                      {/* Bill Card */}
                      {(option.totalBill !== undefined || option.dueAmount !== undefined) && (
                        <Box sx={{
                          flexShrink: 0,
                          textAlign: "right",
                          px: 1.5,
                          py: 1.25,
                          borderRadius: "12px",
                          bgcolor: alpha(PRIMARY, 0.05),
                          border: `1.5px solid ${alpha(PRIMARY, 0.12)}`,
                          minWidth: 100,
                        }}>
                          <Typography sx={{
                            fontWeight: 900,
                            fontSize: 16,
                            color: PRIMARY,
                            lineHeight: 1.2,
                            letterSpacing: "-0.02em",
                          }}>
                            {formatAmount(option.totalBill)}
                          </Typography>
                          <Typography sx={{ fontSize: "10px", color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mt: 0.25 }}>
                            Total Bill
                          </Typography>
                          {option.dueAmount !== undefined && (
                            <Box sx={{
                              mt: 0.75,
                              px: 0.75,
                              py: 0.3,
                              borderRadius: "6px",
                              bgcolor: alpha("#F43F5E", 0.08),
                              border: `1px solid ${alpha("#F43F5E", 0.2)}`,
                            }}>
                              <Typography sx={{ fontSize: "10.5px", fontWeight: 800, color: "#BE123C" }}>
                                Due: {formatAmount(option.dueAmount)}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Stack>
                  </Box>
                );
              })}

              {/* Empty state */}
              {filteredPatients.length === 0 && (
                <Box sx={{
                  py: 6,
                  textAlign: "center",
                  bgcolor: "#fff",
                  borderRadius: "14px",
                  border: `1.5px dashed ${alpha(PRIMARY, 0.15)}`,
                }}>
                  <Box sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "16px",
                    bgcolor: alpha(PRIMARY, 0.07),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 1.5,
                  }}>
                    <PersonOutlineIcon sx={{ fontSize: 26, color: alpha(PRIMARY, 0.4) }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#475569", mb: 0.5 }}>
                    No patients found
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: "#94A3B8" }}>
                    Try adjusting your search or filter.
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Footer */}
          <Box sx={{
            px: 3,
            py: 1.75,
            bgcolor: "#FAFBFF",
            borderTop: `1px solid ${alpha(PRIMARY, 0.08)}`,
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: "11.5px", color: "#64748B" }}>
                Showing{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "#0F172A" }}>
                  {filteredPatients.length}
                </Box>
                {" "}of{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "#0F172A" }}>
                  {patientOptions.length}
                </Box>
                {" "}patients
              </Typography>

              {(search || statusFilter !== "All") && (
                <Box
                  onClick={() => { setSearch(""); setStatusFilter("All"); }}
                  sx={{
                    fontSize: "11.5px",
                    fontWeight: 700,
                    color: PRIMARY,
                    cursor: "pointer",
                    px: 1.25,
                    py: 0.4,
                    borderRadius: "7px",
                    border: `1px solid ${alpha(PRIMARY, 0.2)}`,
                    bgcolor: alpha(PRIMARY, 0.04),
                    "&:hover": {
                      bgcolor: alpha(PRIMARY, 0.09),
                    },
                    transition: "all 0.15s ease",
                  }}
                >
                  Clear filters
                </Box>
              )}
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
