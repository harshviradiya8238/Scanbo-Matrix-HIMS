import React from 'react';
import {
  Alert,
  Button,
  Card,
  Stack,
  Typography,
} from '@mui/material';
import WorkflowSectionCard from '@/src/screens/clinical/components/WorkflowSectionCard';
import { EmergencyPatient, ObservationEntry } from '../../types';

interface ObservationPanelProps {
  selectedPatient: EmergencyPatient | undefined;
  observationRows: ObservationEntry[];
  onRecordVitals: () => void;
}

export function ObservationTimelinePanel({
  selectedPatient,
  observationRows,
  onRecordVitals,
}: ObservationPanelProps) {
  const rows = selectedPatient
    ? observationRows.filter((entry) => entry.patientId === selectedPatient.id)
    : [];

  return (
    <WorkflowSectionCard
      title="Observation Screen"
      subtitle="Timeline view for emergency vitals monitoring"
      action={
        <Button
          size="small"
          variant="contained"
          onClick={onRecordVitals}
          disabled={!selectedPatient}
        >
          Record Vitals
        </Button>
      }
    >
      {!selectedPatient ? (
        <Alert severity="info">
          Select a patient to review the observation timeline.
        </Alert>
      ) : rows.length === 0 ? (
        <Alert severity="info">
          No observation entries yet for this patient.
        </Alert>
      ) : (
        <Stack spacing={1}>
          {rows.map((entry) => (
            <Card
              key={entry.id}
              elevation={0}
              sx={{
                p: 1,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {entry.recordedAt}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  HR {entry.heartRate} bpm · BP {entry.bloodPressure} · Temp{" "}
                  {entry.temperature}°C · RR {entry.respiratoryRate}/min · SpO2{" "}
                  {entry.spo2}% · Pain {entry.painScore}/10 · GCS {entry.gcs}
                </Typography>
                <Typography variant="body2">{entry.note}</Typography>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </WorkflowSectionCard>
  );
}