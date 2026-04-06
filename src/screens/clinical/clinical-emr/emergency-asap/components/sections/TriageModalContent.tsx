"use client";

import * as React from "react";
import { Box, Chip, Grid, MenuItem, Stack, TextField, Typography } from "@/src/ui/components/atoms";
import { type EmergencyPatient, type TriageForm, type TriageLevel } from "../../types";

interface TriageModalContentProps {
  patients: EmergencyPatient[];
  triageForm: TriageForm;
  handleTriageField: <K extends keyof TriageForm>(field: K, value: TriageForm[K]) => void;
}

export function TriageModalContent({
  patients,
  triageForm,
  handleTriageField,
}: TriageModalContentProps) {
  return (
    <Stack spacing={1.5}>
      <Grid container spacing={1}>
        <Grid xs={12} md={5}>
          <TextField
            size="small"
            select
            label="Patient"
            value={triageForm.patientId}
            onChange={(event) => handleTriageField("patientId", event.target.value)}
            fullWidth
          >
            {patients.map((patient) => (
              <MenuItem key={patient.id} value={patient.id}>
                {patient.id} · {patient.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid xs={12} md={3}>
          <TextField
            size="small"
            label="Heart Rate"
            value={triageForm.heartRate}
            onChange={(event) => handleTriageField("heartRate", event.target.value)}
            fullWidth
          />
        </Grid>
        <Grid xs={12} md={4}>
          <TextField
            size="small"
            label="Blood Pressure"
            value={triageForm.bloodPressure}
            onChange={(event) => handleTriageField("bloodPressure", event.target.value)}
            fullWidth
          />
        </Grid>
      </Grid>

      <Grid container spacing={1}>
        <Grid xs={12} md={4}>
          <TextField
            size="small"
            label="Temperature"
            value={triageForm.temperature}
            onChange={(event) => handleTriageField("temperature", event.target.value)}
            fullWidth
          />
        </Grid>
        <Grid xs={12} md={4}>
          <TextField
            size="small"
            label="Respiratory Rate"
            value={triageForm.respiratoryRate}
            onChange={(event) => handleTriageField("respiratoryRate", event.target.value)}
            fullWidth
          />
        </Grid>
        <Grid xs={12} md={4}>
          <TextField
            size="small"
            label="SpO2"
            value={triageForm.spo2}
            onChange={(event) => handleTriageField("spo2", event.target.value)}
            fullWidth
          />
        </Grid>
      </Grid>

      <Box>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}
        >
          Triage Level
        </Typography>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {(["Critical", "Emergency", "Urgent", "Stable"] as const).map((level) => (
            <Chip
              key={level}
              label={level}
              clickable
              color={triageForm.triageLevel === level ? "primary" : "default"}
              variant={triageForm.triageLevel === level ? "filled" : "outlined"}
              onClick={() => handleTriageField("triageLevel", level as TriageLevel)}
            />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
