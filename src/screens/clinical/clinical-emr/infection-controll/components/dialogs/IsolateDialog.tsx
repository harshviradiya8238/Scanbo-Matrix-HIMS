import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { CommonDialog } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import { Block as BlockIcon } from "@mui/icons-material";

interface IsolateForm {
  selectedPatientId: string;
  roomId: string;
  isolationType: string;
  gloves: boolean;
  gown: boolean;
  surgicalMask: boolean;
  n95: boolean;
  faceShield: boolean;
  notes: string;
}

interface InfectionCase {
  id: string;
  patientName: string;
  mrn: string;
  organism: string;
  bed: string;
  isolationType: string;
  unit: string;
}

interface IsolationRoom {
  id: string;
  room: string;
  type: string;
  status: string;
}

interface CaseExtra {
  [key: string]: {
    genderAge?: string;
  };
}

interface IsolateDialogProps {
  open: boolean;
  onClose: () => void;
  isolateCaseId: string | null;
  onConfirmIsolation: (data: IsolateForm) => void;
  canWrite: boolean;
  AVAILABLE_ISOLATION_ROOMS: IsolationRoom[];
  CASE_EXTRA: CaseExtra;
  cases: InfectionCase[];
}

const IsolateDialog: React.FC<IsolateDialogProps> = ({
  open,
  onClose,
  isolateCaseId,
  onConfirmIsolation,
  canWrite,
  AVAILABLE_ISOLATION_ROOMS,
  CASE_EXTRA,
  cases,
}) => {
  const theme = useTheme();

  const [isolateForm, setIsolateForm] = React.useState<IsolateForm>({
    selectedPatientId: "",
    roomId: "",
    isolationType: "Droplet Precautions",
    gloves: true,
    gown: true,
    surgicalMask: true,
    n95: false,
    faceShield: false,
    notes: "",
  });

  // Helper: build form defaults from a case object
  const buildFormFromCase = (targetCase: InfectionCase) => ({
    selectedPatientId: targetCase.id,
    roomId: "",
    isolationType:
      targetCase.isolationType === "Contact"
        ? "Contact Precautions"
        : targetCase.isolationType === "Droplet"
          ? "Droplet Precautions"
          : targetCase.isolationType === "Airborne"
            ? "Airborne Precautions"
            : "Standard Precautions",
    gloves: true,
    gown: true,
    surgicalMask:
      targetCase.isolationType === "Droplet" ||
      targetCase.isolationType === "Airborne",
    n95: targetCase.isolationType === "Airborne",
    faceShield: false,
    notes: "",
  });

  React.useEffect(() => {
    if (open) {
      const preselected = isolateCaseId
        ? cases.find((c) => c.id === isolateCaseId)
        : cases[0]; // fallback to first detected case
      if (preselected) {
        setIsolateForm(buildFormFromCase(preselected));
      } else {
        setIsolateForm({
          selectedPatientId: "",
          roomId: "",
          isolationType: "Contact Precautions",
          gloves: true,
          gown: true,
          surgicalMask: false,
          n95: false,
          faceShield: false,
          notes: "",
        });
      }
    }
  }, [open, isolateCaseId, cases]);

  // When patient changes, re-derive isolation type defaults
  const handlePatientChange = (patientId: string) => {
    const targetCase = cases.find((c) => c.id === patientId);
    if (targetCase) {
      setIsolateForm(buildFormFromCase(targetCase));
    } else {
      setIsolateForm((prev) => ({ ...prev, selectedPatientId: patientId }));
    }
  };

  const resolvedCase = cases.find((c) => c.id === isolateForm.selectedPatientId);

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirmIsolation(isolateForm);
  };

  return (
    <CommonDialog
      open={open}
      onClose={handleClose}
      title="Initiate Isolation"
      subtitle={resolvedCase ? `${resolvedCase.patientName} · ${resolvedCase.mrn} · ${resolvedCase.organism}` : "Select a patient to proceed"}
      icon={
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.error.main, 0.12),
            color: "error.main",
          }}
        >
          <BlockIcon sx={{ fontSize: 22 }} />
        </Box>
      }
      maxWidth="sm"
      fullWidth
      content={
        (() => {
          const isolateCase = resolvedCase;
          return (
            <Stack spacing={2} sx={{ mt: 1 }}>

              {/* ── Patient Preview Card ─────────────────── */}
              {isolateCase && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.15),
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: "primary.main",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        flexShrink: 0,
                      }}
                    >
                      {isolateCase.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </Avatar>
                    <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {isolateCase.patientName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {CASE_EXTRA[isolateCase.id]?.genderAge ?? "—"} · {isolateCase.mrn} · {isolateCase.unit} · Bed {isolateCase.bed}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Pathogen: <strong>{isolateCase.organism}</strong> · Isolation Pending
                      </Typography>
                    </Stack>
                    <Chip
                      size="small"
                      label={isolateCase.isolationType}
                      sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        bgcolor: alpha(theme.palette.info.main, 0.12),
                        borderColor: alpha(theme.palette.info.main, 0.4),
                      }}
                      variant="outlined"
                    />
                  </Stack>
                </Box>
              )}

                  {/* Form fields */}

                     {/* ── Patient Selection ─────────────────────── */}
              <TextField
                select
                label="Select Patient *"
                value={isolateForm.selectedPatientId}
                onChange={(e) => handlePatientChange(e.target.value)}
                size="small"
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              >
                <MenuItem value="">— Select Patient —</MenuItem>
                {cases.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Stack spacing={0}>
                      <span style={{ fontWeight: 700 }}>{c.patientName}</span>
                      <span style={{ fontSize: "0.75rem", color: "#888" }}>
                        {c.mrn} · {c.organism} · Bed {c.bed}
                      </span>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>
                  <TextField
                    select
                    label="Assign Isolation Room *"
                    value={isolateForm.roomId}
                    onChange={(e) =>
                      setIsolateForm((prev) => ({
                        ...prev,
                        roomId: e.target.value,
                      }))
                    }
                    size="small"
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                  >
                    <MenuItem value="">— Select Room —</MenuItem>
                    {AVAILABLE_ISOLATION_ROOMS.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.room} · {r.type} ({r.status})
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Isolation Type"
                    value={isolateForm.isolationType}
                    onChange={(e) =>
                      setIsolateForm((prev) => ({
                        ...prev,
                        isolationType: e.target.value,
                      }))
                    }
                    size="small"
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                  >
                    <MenuItem value="Contact Precautions">
                      Contact Precautions
                    </MenuItem>
                    <MenuItem value="Droplet Precautions">
                      Droplet Precautions
                    </MenuItem>
                    <MenuItem value="Airborne Precautions">
                      Airborne Precautions
                    </MenuItem>
                    <MenuItem value="Standard Precautions">
                      Standard Precautions
                    </MenuItem>
                  </TextField>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: "text.secondary",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      PPE Requirements
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isolateForm.gloves}
                            onChange={(e) =>
                              setIsolateForm((prev) => ({
                                ...prev,
                                gloves: e.target.checked,
                              }))
                            }
                            size="small"
                          />
                        }
                        label="Gloves"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isolateForm.gown}
                            onChange={(e) =>
                              setIsolateForm((prev) => ({
                                ...prev,
                                gown: e.target.checked,
                              }))
                            }
                            size="small"
                          />
                        }
                        label="Gown"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isolateForm.surgicalMask}
                            onChange={(e) =>
                              setIsolateForm((prev) => ({
                                ...prev,
                                surgicalMask: e.target.checked,
                              }))
                            }
                            size="small"
                          />
                        }
                        label="Surgical Mask"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isolateForm.n95}
                            onChange={(e) =>
                              setIsolateForm((prev) => ({
                                ...prev,
                                n95: e.target.checked,
                              }))
                            }
                            size="small"
                          />
                        }
                        label="N95"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isolateForm.faceShield}
                            onChange={(e) =>
                              setIsolateForm((prev) => ({
                                ...prev,
                                faceShield: e.target.checked,
                              }))
                            }
                            size="small"
                          />
                        }
                        label="Face Shield"
                      />
                    </Stack>
                  </Box>

                  <TextField
                    label="Notes"
                    value={isolateForm.notes}
                    onChange={(e) =>
                      setIsolateForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Special instructions, transfer notes..."
                    size="small"
                    fullWidth
                    multiline
                    rows={3}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                  />
            </Stack>
          );
        })()
      }
      actions={
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ justifyContent: "flex-end" }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleClose}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!canWrite}
            onClick={handleConfirm}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Confirm Isolation
          </Button>
        </Stack>
      }
    />
  );
};

export default IsolateDialog;
