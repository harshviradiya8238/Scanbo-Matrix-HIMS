import React, { useState } from "react";
import {
  Button,
  MenuItem,
  Stack,
  TextField,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { CommonDialog } from "@/src/ui/components/molecules";

export interface IntraOpMedicationForm {
  drug: string;
  dose: string;
  route: string;
  time: string;
}

interface AddIntraOpMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medication: IntraOpMedicationForm) => void;
}

const ROUTE_OPTIONS = ["IV", "IV Bolus", "IV Push", "IM", "Inhalation", "Epidural"];

const initialForm: IntraOpMedicationForm = {
  drug: "",
  dose: "",
  route: "IV",
  time: new Date().toLocaleTimeString("en-IN", { hour12: false, hour: '2-digit', minute: '2-digit' }),
};

export default function AddIntraOpMedicationModal({
  isOpen,
  onClose,
  onSave,
}: AddIntraOpMedicationModalProps) {
  const [form, setForm] = useState<IntraOpMedicationForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof IntraOpMedicationForm, string>>>({});

  const handleChange = <K extends keyof IntraOpMedicationForm>(key: K, value: IntraOpMedicationForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof IntraOpMedicationForm, string>> = {};
    if (!form.drug.trim()) newErrors.drug = "Drug name is required";
    if (!form.dose.trim()) newErrors.dose = "Dose is required";
    if (!form.time.trim()) newErrors.time = "Time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(form);
      setForm(initialForm);
      onClose();
    }
  };

  return (
    <CommonDialog
      open={isOpen}
      onClose={onClose}
      title="+ Add Intra-Op Medication"
      confirmLabel="Add Medication"
      onConfirm={handleSave}
      fullWidth
      maxWidth="sm"
      contentDividers
    >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Drug Name"
            required
            placeholder="e.g. Propofol, Fentanyl"
            value={form.drug}
            onChange={(e) => handleChange("drug", e.target.value)}
            error={!!errors.drug}
            helperText={errors.drug}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Dose"
                required
                placeholder="e.g. 50 mg, 100 mcg"
                value={form.dose}
                onChange={(e) => handleChange("dose", e.target.value)}
                error={!!errors.dose}
                helperText={errors.dose}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                required
                InputLabelProps={{ shrink: true }}
                value={form.time}
                onChange={(e) => handleChange("time", e.target.value)}
                error={!!errors.time}
                helperText={errors.time}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            select
            label="Route"
            value={form.route}
            onChange={(e) => handleChange("route", e.target.value)}
          >
            {ROUTE_OPTIONS.map((route) => (
              <MenuItem key={route} value={route}>
                {route}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
    </CommonDialog>
  );
}
