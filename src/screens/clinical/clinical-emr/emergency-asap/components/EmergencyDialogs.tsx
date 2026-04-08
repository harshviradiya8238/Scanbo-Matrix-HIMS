import * as React from "react";
import {
  Alert,
  Button,
  Chip,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { Card, CommonDialog } from "@/src/ui/components/molecules";
import {
  Bed as BedIcon,
  MonitorHeart as MonitorHeartIcon,
  PersonAddAlt1 as PersonAddAlt1Icon,
} from "@mui/icons-material";
import {
  BED_ASSIGN_FLOW_STEPS,
  DEFAULT_REGISTRATION,
  DEFAULT_TRIAGE,
  DEFAULT_VITALS_FORM,
} from "../AsapEmergencyData";
import { normalizePhone } from "./utils";
import {
  AssignBedModalContent,
  RegistrationModalContent,
  TriageModalContent,
} from "./sections";
import type {
  EmergencyPatient,
  EmergencyBed,
  BedAssignForm,
  RegistrationForm,
  TriageForm,
  VitalsForm,
  DischargeForm,
} from "../types";

export const AssignBedDialog = ({
  open,
  onClose,
  assignBedPatient,
  assignBedForm,
  assignBedZones,
  patients,
  beds,
  handleAssignBedField,
  handleConfirmAssignBed,
}: any) => (
  <CommonDialog
    open={open}
    onClose={onClose}
    title="Assign Bed"
    subtitle="Arrivals & Triage to bed allocation workflow"
    icon={<BedIcon color="primary" fontSize="small" />}
    maxWidth="lg"
    PaperProps={{ sx: { borderRadius: 2.5, overflow: "hidden" } }}
    hideActions
    content={
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={0.65} flexWrap="wrap" useFlexGap>
          {BED_ASSIGN_FLOW_STEPS.map((step, index) => (
            <Chip
              key={step}
              size="small"
              label={`${index + 1}. ${step}`}
              color={
                index < 1 ? "success" : index === 1 ? "primary" : "default"
              }
              variant={index <= 1 ? "filled" : "outlined"}
            />
          ))}
        </Stack>
        <Divider />
        <AssignBedModalContent
          assignBedPatient={assignBedPatient}
          assignBedForm={assignBedForm}
          assignBedZones={assignBedZones}
          patients={patients}
          beds={beds}
          handleAssignBedField={handleAssignBedField}
          handleConfirmAssignBed={handleConfirmAssignBed}
        />
      </Stack>
    }
  />
);

export const TriageDialog = ({
  open,
  onClose,
  patients,
  handleSaveTriage,
}: {
  open: boolean;
  onClose: () => void;
  patients: EmergencyPatient[];
  handleSaveTriage: (form: TriageForm) => void;
}) => {
  const [triageForm, setTriageForm] =
    React.useState<TriageForm>(DEFAULT_TRIAGE);

  React.useEffect(() => {
    if (open) {
      setTriageForm(DEFAULT_TRIAGE);
    }
  }, [open]);

  const handleTriageField = <K extends keyof TriageForm>(
    field: K,
    value: TriageForm[K],
  ) => {
    setTriageForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSave = () => {
    handleSaveTriage(triageForm);
  };

  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      title="Triage Assessment"
      subtitle="Capture vitals and assign acuity level"
      icon={<MonitorHeartIcon color="primary" fontSize="small" />}
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 2.5, overflow: "hidden" } }}
      content={
        <TriageModalContent
          patients={patients}
          triageForm={triageForm}
          handleTriageField={handleTriageField}
        />
      }
      actions={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={onSave}
            startIcon={<MonitorHeartIcon />}
          >
            Save Triage Assessment
          </Button>
        </>
      }
    />
  );
};

export const RegistrationDialog = ({
  open,
  onClose,
  patients,
  handleRegisterPatient,
  handleUseExistingPatient,
}: {
  open: boolean;
  onClose: () => void;
  patients: EmergencyPatient[];
  handleRegisterPatient: (form: RegistrationForm) => void;
  handleUseExistingPatient: (patientId: string) => void;
}) => {
  const [registrationSearch, setRegistrationSearch] = React.useState("");
  const [registrationForm, setRegistrationForm] =
    React.useState<RegistrationForm>(DEFAULT_REGISTRATION);

  React.useEffect(() => {
    if (open) {
      setRegistrationSearch("");
      setRegistrationForm(DEFAULT_REGISTRATION);
    }
  }, [open]);

  const registrationMatches = React.useMemo(() => {
    if (!registrationSearch.trim()) return [];
    const query = registrationSearch.toLowerCase();
    const phone = normalizePhone(registrationSearch);

    return patients.filter(
      (p) =>
        p.mrn?.toLowerCase().includes(query) ||
        (p.phone && normalizePhone(p.phone).includes(phone)),
    );
  }, [registrationSearch, patients]);

  const handleRegistrationField = <K extends keyof RegistrationForm>(
    field: K,
    value: RegistrationForm[K],
  ) => {
    setRegistrationForm((prev) => ({ ...prev, [field]: value }));
  };

  const onRegister = () => {
    handleRegisterPatient(registrationForm);
  };

  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      title="Register Emergency Patient"
      subtitle="Walk-in, EMS, or transfer registration"
      icon={<PersonAddAlt1Icon color="primary" fontSize="small" />}
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 2.5, overflow: "hidden" } }}
      content={
        <RegistrationModalContent
          registrationSearch={registrationSearch}
          setRegistrationSearch={setRegistrationSearch}
          registrationMatches={registrationMatches}
          handleUseExistingPatient={handleUseExistingPatient}
          registrationForm={registrationForm}
          handleRegistrationField={handleRegistrationField}
        />
      }
      actions={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={onRegister}
            startIcon={<PersonAddAlt1Icon />}
          >
            Register & Assign MRN
          </Button>
        </>
      }
    />
  );
};

export const VitalsDialog = ({
  open,
  onClose,
  patients,
  handleSaveVitals,
}: {
  open: boolean;
  onClose: () => void;
  patients: EmergencyPatient[];
  handleSaveVitals: (form: VitalsForm) => void;
}) => {
  const [vitalsForm, setVitalsForm] =
    React.useState<VitalsForm>(DEFAULT_VITALS_FORM);

  React.useEffect(() => {
    if (open) {
      setVitalsForm(DEFAULT_VITALS_FORM);
    }
  }, [open, DEFAULT_VITALS_FORM]);

  const handleVitalsField = <K extends keyof VitalsForm>(
    field: K,
    value: VitalsForm[K],
  ) => {
    setVitalsForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSave = () => {
    handleSaveVitals(vitalsForm);
  };

  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      title="Record Vitals"
      subtitle="Bedside capture for emergency reassessment"
      icon={<MonitorHeartIcon color="primary" fontSize="small" />}
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 2.5, overflow: "hidden" } }}
      content={
        <Stack spacing={1.5}>
          <TextField
            size="small"
            select
            label="Patient"
            value={vitalsForm.patientId}
            onChange={(event) =>
              handleVitalsField("patientId", event.target.value)
            }
            fullWidth
          >
            {patients.map((patient: EmergencyPatient) => (
              <MenuItem key={patient.id} value={patient.id}>
                {patient.id} · {patient.name}
              </MenuItem>
            ))}
          </TextField>
          <Grid container spacing={1}>
            <Grid xs={12} sm={6} md={4}>
              <TextField
                size="small"
                label="Heart Rate"
                value={vitalsForm.heartRate}
                onChange={(event) =>
                  handleVitalsField("heartRate", event.target.value)
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField
                size="small"
                label="Blood Pressure"
                value={vitalsForm.bloodPressure}
                onChange={(event) =>
                  handleVitalsField("bloodPressure", event.target.value)
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField
                size="small"
                label="Temperature"
                value={vitalsForm.temperature}
                onChange={(event) =>
                  handleVitalsField("temperature", event.target.value)
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField
                size="small"
                label="Respiratory Rate"
                value={vitalsForm.respiratoryRate}
                onChange={(event) =>
                  handleVitalsField("respiratoryRate", event.target.value)
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField
                size="small"
                label="SpO2"
                value={vitalsForm.spo2}
                onChange={(event) =>
                  handleVitalsField("spo2", event.target.value)
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6} md={2}>
              <TextField
                size="small"
                label="Pain"
                value={vitalsForm.painScore}
                onChange={(event) =>
                  handleVitalsField("painScore", event.target.value)
                }
                fullWidth
              />
            </Grid>
            <Grid xs={12} sm={6} md={2}>
              <TextField
                size="small"
                label="GCS"
                value={vitalsForm.gcs}
                onChange={(event) =>
                  handleVitalsField("gcs", event.target.value)
                }
                fullWidth
              />
            </Grid>
          </Grid>
          <TextField
            size="small"
            label="Observation Notes"
            value={vitalsForm.notes}
            onChange={(event) => handleVitalsField("notes", event.target.value)}
            multiline
            minRows={3}
            placeholder="Example: Pain reduced after analgesic, patient comfortable on oxygen support."
            fullWidth
          />
        </Stack>
      }
      actions={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={onSave}>
            Save Vitals
          </Button>
        </>
      }
    />
  );
};

export const DischargePreviewDialog = ({
  open,
  onClose,
  selectedPatient,
  dischargeForm,
  canNavigate,
  openRoute,
}: any) => (
  <CommonDialog
    open={open}
    onClose={onClose}
    title="AVS Preview"
    subtitle="Emergency discharge summary preview for patient handoff"
    maxWidth="md"
    PaperProps={{ sx: { borderRadius: 2.5, overflow: "hidden" } }}
    content={
      !selectedPatient ? (
        <Alert severity="info">No patient selected for AVS preview.</Alert>
      ) : (
        <Stack spacing={1.5}>
          <Card
            elevation={0}
            sx={{
              p: 1.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Stack spacing={0.75}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {selectedPatient.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPatient.id} · {selectedPatient.mrn} ·{" "}
                {selectedPatient.age}y / {selectedPatient.gender}
              </Typography>
              <Typography variant="body2">
                <strong>Diagnosis:</strong> {dischargeForm.diagnosis || "--"}
              </Typography>
              <Typography variant="body2">
                <strong>Condition on exit:</strong>{" "}
                {dischargeForm.condition || "--"}
              </Typography>
              <Typography variant="body2">
                <strong>Instructions:</strong>{" "}
                {dischargeForm.instructions || "--"}
              </Typography>
              <Typography variant="body2">
                <strong>Follow-up:</strong> {dischargeForm.followUp || "--"}
              </Typography>
              <Typography variant="body2">
                <strong>Medication advice:</strong>{" "}
                {dischargeForm.medications || "--"}
              </Typography>
              <Typography variant="body2">
                <strong>Destination:</strong>{" "}
                {dischargeForm.destination || "--"}
              </Typography>
            </Stack>
          </Card>
        </Stack>
      )
    }
    actions={
      <>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="outlined"
          onClick={() =>
            selectedPatient
              ? openRoute("/ipd/discharge", {
                  tab: "avs",
                  mrn: selectedPatient.mrn,
                })
              : undefined
          }
          disabled={!selectedPatient || !canNavigate("/ipd/discharge")}
        >
          Open Full AVS Workspace
        </Button>
      </>
    }
  />
);
