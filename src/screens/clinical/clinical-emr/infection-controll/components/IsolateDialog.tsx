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
import {
  Block as BlockIcon,
} from "@mui/icons-material";

interface IsolateForm {
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
  setIsolateCaseId: React.Dispatch<React.SetStateAction<string | null>>;
  isolateForm: IsolateForm;
  setIsolateForm: React.Dispatch<React.SetStateAction<IsolateForm>>;
  cases: InfectionCase[];
  handleConfirmIsolation: () => void;
  canWrite: boolean;
  AVAILABLE_ISOLATION_ROOMS: IsolationRoom[];
  CASE_EXTRA: CaseExtra;
}

const IsolateDialog: React.FC<IsolateDialogProps> = ({
  open,
  onClose,
  isolateCaseId,
  setIsolateCaseId,
  isolateForm,
  setIsolateForm,
  cases,
  handleConfirmIsolation,
  canWrite,
  AVAILABLE_ISOLATION_ROOMS,
  CASE_EXTRA,
}) => {
  const theme = useTheme();

  const handleClose = () => {
    onClose();
    setIsolateCaseId(null);
  };

  return (
    <CommonDialog
      open={open}
      onClose={handleClose}
      title="Initiate Isolation"
      subtitle={
        isolateCaseId
          ? (() => {
              const c = cases.find((x) => x.id === isolateCaseId);
              return c
                ? `${c.patientName} · ${c.mrn} · ${c.organism} · ${c.bed}`
                : undefined;
            })()
          : undefined
      }
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
        isolateCaseId
          ? (() => {
              const isolateCase = cases.find((c) => c.id === isolateCaseId);
              if (!isolateCase) return null;
              return (
                <Stack spacing={2} sx={{ mt: 1 }}>
                  {/* Patient card */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      border: "1px solid",
                      borderColor: alpha(theme.palette.primary.main, 0.15),
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: "primary.main",
                          fontWeight: 700,
                          fontSize: "1rem",
                        }}
                      >
                        {isolateCase.patientName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </Avatar>
                      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {isolateCase.patientName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {CASE_EXTRA[isolateCase.id]?.genderAge ?? "—"} ·{" "}
                          {isolateCase.mrn} · {isolateCase.unit} · Bed{" "}
                          {isolateCase.bed}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Pathogen: {isolateCase.organism} Current: Detected —
                          Isolation Pending
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

                  {/* Form fields */}
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
          : null
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
            onClick={handleConfirmIsolation}
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