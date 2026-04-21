"use client";

import React, { useState } from "react";
import {
  Button,
  MenuItem,
  Stack,
  TextField,
  Box,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";

export type DoseUnit = "mg" | "ml" | "mcg" | "units" | "tablet(s)";
export type FrequencyOption = "OD" | "BD" | "TDS" | "QID" | "SOS" | "HS";
export type RouteOption = "Oral" | "IV" | "IM" | "Topical" | "Sublingual";
export type DurationUnit = "Days" | "Weeks" | "Months";

export interface MedicationForm {
  drugName: string;
  dose: string;
  doseUnit: DoseUnit | "";
  frequency: FrequencyOption | "";
  route: RouteOption | "";
  duration: string;
  durationUnit: DurationUnit;
  instructions: string;
  notes: string;
}

export const FREQUENCY_OPTIONS: { value: FrequencyOption; label: string }[] = [
  { value: "OD", label: "OD – Once daily" },
  { value: "BD", label: "BD – Twice daily" },
  { value: "TDS", label: "TDS – Thrice daily" },
  { value: "QID", label: "QID – Four times daily" },
  { value: "SOS", label: "SOS – As needed" },
  { value: "HS", label: "HS – At bedtime" },
];

export const ROUTE_OPTIONS: RouteOption[] = ["Oral", "IV", "IM", "Topical", "Sublingual"];
export const DOSE_UNITS: DoseUnit[] = ["mg", "ml", "mcg", "units", "tablet(s)"];
export const DURATION_UNITS: DurationUnit[] = ["Days", "Weeks", "Months"];

export const initialMedicationForm: MedicationForm = {
  drugName: "",
  dose: "",
  doseUnit: "",
  frequency: "",
  route: "",
  duration: "",
  durationUnit: "Days",
  instructions: "",
  notes: "",
};

interface CommonMedicationFormProps {
  initialData?: Partial<MedicationForm>;
  onSave?: (medication: MedicationForm) => void;
  onCancel?: () => void;
  showActions?: boolean;
}

export interface CommonMedicationFormHandle {
  submit: () => void;
  reset: () => void;
}

const CommonMedicationForm = React.forwardRef<CommonMedicationFormHandle, CommonMedicationFormProps>((
  {
    initialData,
    onSave,
    onCancel,
    showActions = false,
  },
  ref
) => {
  const [form, setForm] = useState<MedicationForm>({
    ...initialMedicationForm,
    ...initialData
  });
  const [errors, setErrors] = useState<Partial<Record<keyof MedicationForm, string>>>({});

  const handleChange = <K extends keyof MedicationForm>(key: K, value: MedicationForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof MedicationForm, string>> = {};
    if (!form.drugName.trim()) newErrors.drugName = "Drug name is required";
    if (!form.dose.trim()) newErrors.dose = "Dose is required";
    if (!form.frequency) newErrors.frequency = "Frequency is required";
    if (!form.duration.trim()) newErrors.duration = "Duration is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave?.(form);
      setForm(initialMedicationForm);
      setErrors({});
    }
  };

  React.useImperativeHandle(ref, () => ({
    submit: () => {
      handleSave();
    },
    reset: () => {
      setForm(initialMedicationForm);
      setErrors({});
    }
  }));

  return (
    <Stack spacing={2} sx={{mt:2}}>
      <Grid container spacing={2}>
        {/* Drug Name */}
        <Grid item xs={12}>
          <TextField
              fullWidth
              label="Drug name"
              required
              placeholder="Search or type drug name..."
              value={form.drugName}
              onChange={(e) => handleChange("drugName", e.target.value)}
              error={!!errors.drugName}
              helperText={errors.drugName}
          />
        </Grid>

        {/* Dose + Dose Unit */}
        <Grid item xs={12} sm={6}>
          <TextField
              fullWidth
              label="Dose"
              required
              placeholder="e.g. 500"
              value={form.dose}
              onChange={(e) => handleChange("dose", e.target.value)}
              error={!!errors.dose}
              helperText={errors.dose}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
              fullWidth
              select
              label="Dose unit"
              value={form.doseUnit}
              onChange={(e) => handleChange("doseUnit", e.target.value as DoseUnit)}
          >
            <MenuItem value="" disabled>Select unit</MenuItem>
            {DOSE_UNITS.map((u) => (
                <MenuItem key={u} value={u}>{u}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Frequency + Route */}
        <Grid item xs={12} sm={6}>
          <TextField
              fullWidth
              select
              label="Frequency"
              required
              value={form.frequency}
              onChange={(e) => handleChange("frequency", e.target.value as FrequencyOption)}
              error={!!errors.frequency}
              helperText={errors.frequency}
          >
            <MenuItem value="" disabled>Select frequency</MenuItem>
            {FREQUENCY_OPTIONS.map((f) => (
                <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
              fullWidth
              select
              label="Route"
              value={form.route}
              onChange={(e) => handleChange("route", e.target.value as RouteOption)}
          >
            <MenuItem value="" disabled>Select route</MenuItem>
            {ROUTE_OPTIONS.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Duration + Duration Unit */}
        <Grid item xs={12} sm={6}>
          <TextField
              fullWidth
              label="Duration"
              required
              placeholder="e.g. 5"
              value={form.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
              error={!!errors.duration}
              helperText={errors.duration}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
              fullWidth
              select
              label="Duration unit"
              value={form.durationUnit}
              onChange={(e) => handleChange("durationUnit", e.target.value as DurationUnit)}
          >
            {DURATION_UNITS.map((d) => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </TextField>
        </Grid>

       
        {/* Notes */}
        <Grid item xs={12}>
          <TextField
              fullWidth
              multiline
              minRows={2}
              label="Notes / Remarks"
              placeholder="Additional notes..."
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
          />
        </Grid>
      </Grid>

      {showActions && (
          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 1 }}>
            <Button variant="outlined" color="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save Medication
            </Button>
          </Stack>
      )}
    </Stack>
  );
});

export default CommonMedicationForm;

