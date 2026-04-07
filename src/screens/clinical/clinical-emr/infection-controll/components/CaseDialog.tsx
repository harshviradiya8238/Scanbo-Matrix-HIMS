import * as React from "react";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { CommonDialog } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  Add as AddIcon,
  Bed as BedIcon,
  Biotech as BiotechIcon,
  Bolt as BoltIcon,
  CalendarMonth as CalendarMonthIcon,
  LocalHospital as LocalHospitalIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { IPD_PATIENTS } from "../utils/infection-control-data";

interface CaseForm {
  patientSelect: string | null;
  wardBed: string;
  suspectedPathogen: string;
  isolationLevel: string;
  detectionSource: string;
  priority: string;
  reportingPhysician: string;
  dateDetected: string;
  clinicalNotes: string;
  patientName: string;
  mrn: string;
  organism: string;
  unit: string;
  bed: string;
  isolationType: string;
  ipdStatus: string;
  risk: string;
}

interface AutoTriggers {
  assignIsolation: boolean;
  notifyHod: boolean;
  outbreakFlag: boolean;
  notifyIpc: boolean;
  scheduleAudit: boolean;
}

interface IPDPatient {
  name: string;
  mrn: string;
  wardBed: string;
}

interface CaseDialogProps {
  open: boolean;
  onClose: () => void;
  caseForm: CaseForm;
  setCaseForm: React.Dispatch<React.SetStateAction<CaseForm>>;
  autoTriggers: AutoTriggers;
  setAutoTriggers: React.Dispatch<React.SetStateAction<AutoTriggers>>;
  handleCreateCase: () => void;
  canWrite: boolean;
}

const CaseDialog: React.FC<CaseDialogProps> = ({
  open,
  onClose,
  caseForm,
  setCaseForm,
  autoTriggers,
  setAutoTriggers,
  handleCreateCase,
  canWrite,
  
}) => {
  const theme = useTheme();

  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      title="New Infection Case"
      subtitle="Link patient from IPD and start infection control workflow"
      icon={
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: theme.palette.primary.main,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}`,
          }}
        >
          <AddIcon sx={{ fontSize: 22, color: "#fff" }} />
        </Box>
      }
      maxWidth="md"
      content={
        <Box sx={{ mt: 1 }}>
          {/* ── SECTION 1: Patient ── */}
          <Box
            sx={{
              p: 2.5,
              mb: 2,
              borderRadius: 2,
              border: "1.5px solid",
              borderColor: alpha(theme.palette.primary.main, 0.14),
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2 }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PersonIcon sx={{ fontSize: 14, color: "primary.main" }} />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Patient — Select from IPD
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={7}>
                <Autocomplete
                  options={IPD_PATIENTS}
                  getOptionLabel={(opt) =>
                    typeof opt === "string" ? opt : `${opt.name} (${opt.mrn})`
                  }
                  value={
                    IPD_PATIENTS.find(
                      (p) => p.mrn === caseForm.patientSelect,
                    ) ?? null
                  }
                  onChange={(_, val) => {
                    const p = val as (typeof IPD_PATIENTS)[0] | null;
                    setCaseForm((prev) => ({
                      ...prev,
                      patientSelect: p?.mrn ?? null,
                      wardBed: p?.wardBed ?? "",
                      patientName: p?.name ?? "",
                      mrn: p?.mrn ?? "",
                    }));
                  }}
                  componentsProps={{
                    popper: {
                      sx: { zIndex: 1600 },
                    },
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Stack>
                        <Typography variant="body2" fontWeight={600}>
                          {option.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.mrn} · {option.wardBed}
                        </Typography>
                      </Stack>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Patient (MRN / Name) *"
                      placeholder="— Select IPD Patient —"
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1.5,
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "primary.main",
                          },
                        },
                      }}
                    />
                  )}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Ward / Bed"
                  value={caseForm.wardBed}
                  placeholder="Auto-filled from IPD"
                  size="small"
                  disabled
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BedIcon
                          sx={{ fontSize: 16, color: "text.disabled" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                    "& .MuiInputBase-input": {
                      bgcolor: alpha(theme.palette.grey[500], 0.05),
                      fontWeight: caseForm.wardBed ? 600 : 400,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* ── SECTION 2: Infection Details ── */}
          <Box
            sx={{
              p: 2.5,
              mb: 2,
              borderRadius: 2,
              border: "1.5px solid",
              borderColor: alpha(theme.palette.primary.main, 0.14),
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2 }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BiotechIcon sx={{ fontSize: 14, color: "error.main" }} />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Infection Details
              </Typography>
            </Stack>

            <Grid container spacing={2} sx={{ width: "100%" }}>
              {/* Row 1: 4 dropdowns */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  label="Suspected Pathogen *"
                  value={caseForm.suspectedPathogen}
                  onChange={(e) =>
                    setCaseForm((prev) => ({
                      ...prev,
                      suspectedPathogen: e.target.value,
                    }))
                  }
                  size="small"
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                >
                  <MenuItem value="">— Select —</MenuItem>
                  {["MRSA", "VRE", "C.diff", "COVID-19", "ESBL", "Other"].map(
                    (p) => (
                      <MenuItem key={p} value={p}>
                        {p}
                      </MenuItem>
                    ),
                  )}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  label="Isolation Level *"
                  value={caseForm.isolationLevel}
                  onChange={(e) =>
                    setCaseForm((prev) => ({
                      ...prev,
                      isolationLevel: e.target.value,
                    }))
                  }
                  size="small"
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                >
                  {[
                    { value: "Standard", color: "#16a34a" },
                    { value: "Contact", color: "#d97706" },
                    { value: "Droplet", color: "#2563eb" },
                    { value: "Airborne", color: "#dc2626" },
                  ].map(({ value, color }) => (
                    <MenuItem key={value} value={value}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: color,
                            flexShrink: 0,
                          }}
                        />
                        <span>{value}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  label="Detection Source"
                  value={caseForm.detectionSource}
                  onChange={(e) =>
                    setCaseForm((prev) => ({
                      ...prev,
                      detectionSource: e.target.value,
                    }))
                  }
                  size="small"
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                >
                  <MenuItem value="Lab Auto-Flag (LIS)">
                    Lab Auto-Flag (LIS)
                  </MenuItem>
                  <MenuItem value="Physician Report">
                    Physician Report
                  </MenuItem>
                  <MenuItem value="Nursing Flag">Nursing Flag</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  label="Priority"
                  value={caseForm.priority}
                  onChange={(e) =>
                    setCaseForm((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  size="small"
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                  SelectProps={{
                    renderValue: (val) => (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor:
                              val === "Critical"
                                ? "error.main"
                                : val === "High"
                                  ? "warning.main"
                                  : "success.main",
                          }}
                        />
                        <span>{val as string}</span>
                      </Stack>
                    ),
                  }}
                >
                  {[
                    { label: "Critical", color: "error.main" },
                    { label: "High", color: "warning.main" },
                    { label: "Routine", color: "success.main" },
                  ].map(({ label, color }) => (
                    <MenuItem key={label} value={label}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: color,
                          }}
                        />
                        <span>{label}</span>
                      </Stack>
                      </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Row 2: Physician + Date */}
              <Grid item xs={12} md={8} lg={4}>
                <TextField
                  label="Reporting Physician"
                  value={caseForm.reportingPhysician}
                  onChange={(e) =>
                    setCaseForm((prev) => ({
                      ...prev,
                      reportingPhysician: e.target.value,
                    }))
                  }
                  placeholder="Name / Employee ID"
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalHospitalIcon
                          sx={{ fontSize: 16, color: "text.disabled" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} md={4} lg={4}>
                <TextField
                  label="Date Detected"
                  value={caseForm.dateDetected}
                  onChange={(e) =>
                    setCaseForm((prev) => ({
                      ...prev,
                      dateDetected: e.target.value,
                    }))
                  }
                  placeholder="dd / mm / yyyy"
                  size="small"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <CalendarMonthIcon
                          sx={{ fontSize: 18, color: "text.disabled" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>

              {/* Row 3: Clinical Notes */}
              <Grid item xs={12} md={12} lg={12} xl={12}>
                <TextField
                  label="Clinical Notes"
                  value={caseForm.clinicalNotes}
                  onChange={(e) =>
                    setCaseForm((prev) => ({
                      ...prev,
                      clinicalNotes: e.target.value,
                    }))
                  }
                  placeholder="Symptoms, lab findings, observations..."
                  multiline
                  rows={3}
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      alignItems: "flex-start",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* ── SECTION 3: Auto-Trigger Actions ── */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: "1.5px solid",
              borderColor: alpha(theme.palette.primary.main, 0.2),
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2 }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BoltIcon sx={{ fontSize: 14, color: "primary.main" }} />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Auto-Trigger Actions
              </Typography>
                <Chip
                  label={`${Object.values(autoTriggers).filter(Boolean).length} active`}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 11,
                    fontWeight: 600,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: "primary.main",
                    ml: "auto !important",
                  }}
                  variant="outlined"
                />
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  {[
                    {
                      key: "assignIsolation",
                      label: "Assign Isolation Room",
                    },
                    { key: "notifyHod", label: "Notify HOD" },
                    { key: "outbreakFlag", label: "Outbreak Flag" },
                  ].map(({ key, label }) => (
                    <FormControlLabel
                      key={key}
                      control={
                        <Checkbox
                          checked={
                            autoTriggers[key as keyof typeof autoTriggers]
                          }
                          onChange={(_, v) =>
                            setAutoTriggers((p) => ({ ...p, [key]: v }))
                          }
                          size="small"
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {label}
                        </Typography>
                      }
                      sx={{ py: 0.25, m: 0 }}
                    />
                  ))}
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  {[
                    { key: "notifyIpc", label: "Notify IPC Officer" },
                    { key: "scheduleAudit", label: "Schedule Audit" },
                  ].map(({ key, label }) => (
                    <FormControlLabel
                      key={key}
                      control={
                        <Checkbox
                          checked={
                            autoTriggers[key as keyof typeof autoTriggers]
                          }
                          onChange={(_, v) =>
                            setAutoTriggers((p) => ({ ...p, [key]: v }))
                          }
                          size="small"
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {label}
                        </Typography>
                      }
                      sx={{ py: 0.25, m: 0 }}
                    />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Box>
      }
      actions={
        <Stack direction="row" spacing={1.5} alignItems="center" width="100%">
          <Box sx={{ flex: 1 }} />
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 1.5,
              px: 2.5,
              borderColor: alpha(theme.palette.primary.main, 0.4),
              color: "primary.main",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.06),
              },
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!canWrite}
            onClick={handleCreateCase}
            startIcon={<AddIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 1.5,
              px: 3,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              "&:hover": {
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
              "&.Mui-disabled": {
                bgcolor: alpha(theme.palette.grey[500], 0.12),
                boxShadow: "none",
              },
            }}
          >
            Create Case & Start Workflow
          </Button>
        </Stack>
      }
    />
  );
};

export default CaseDialog;