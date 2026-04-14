import React, { useState } from "react";
import {
  Button,
  MenuItem,
  Stack,
  TextField,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { CommonDialog } from "@/src/ui/components/molecules";

export interface IntraOpEventForm {
  time: string;
  title: string;
  subtitle: string;
  tone: "green" | "blue" | "orange" | "red";
}

interface AddIntraOpEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: IntraOpEventForm) => void;
}

const TONE_OPTIONS: { value: IntraOpEventForm["tone"]; label: string }[] = [
  { value: "green", label: "Success / Induction" },
  { value: "blue", label: "Info / Incision" },
  { value: "orange", label: "Warning / Specimen" },
  { value: "red", label: "Critical / Closure" },
];

const initialForm: IntraOpEventForm = {
  time: new Date().toLocaleTimeString("en-IN", { hour12: false, hour: '2-digit', minute: '2-digit' }),
  title: "",
  subtitle: "",
  tone: "blue",
};

export default function AddIntraOpEventModal({
  isOpen,
  onClose,
  onSave,
}: AddIntraOpEventModalProps) {
  const [form, setForm] = useState<IntraOpEventForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof IntraOpEventForm, string>>>({});

  const handleChange = <K extends keyof IntraOpEventForm>(key: K, value: IntraOpEventForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof IntraOpEventForm, string>> = {};
    if (!form.title.trim()) newErrors.title = "Event title is required";
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
      title="+ Add Intra-Op Event"
      confirmLabel="Add Event"
      onConfirm={handleSave}
      fullWidth
      maxWidth="sm"
      contentDividers
    >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <TextField
                fullWidth
                label="Event Title"
                required
                placeholder="e.g. Incision made, Anesthesia induced"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>
            <Grid item xs={4}>
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
            label="Details / Subtitle"
            placeholder="e.g. Primary surgeon in room"
            value={form.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
          />

          <TextField
            fullWidth
            select
            label="Event Type (Tone)"
            value={form.tone}
            onChange={(e) => handleChange("tone", e.target.value as IntraOpEventForm["tone"])}
          >
            {TONE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
    </CommonDialog>
  );
}
