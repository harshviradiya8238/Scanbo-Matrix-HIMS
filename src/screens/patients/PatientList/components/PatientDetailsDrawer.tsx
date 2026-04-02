"use client";

import * as React from "react";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Stack,
  Typography,
  Chip,
} from "@/src/ui/components/atoms";
import { Close as CloseIcon } from "@mui/icons-material";
import { PatientListData } from "../hooks/usePatientListData";
import { maskPhoneNumber } from "../utils/patient-list-utils";

export function PatientDetailsDrawer({ data }: { data: PatientListData }) {
  const { selectedPatient, setDetailsOpen } = data;

  return (
    <Box sx={{ width: 360, p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">Patient Summary</Typography>
        <IconButton onClick={() => setDetailsOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Stack>
      {selectedPatient ? (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar>
              {selectedPatient.firstName[0]}
              {selectedPatient.lastName[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {selectedPatient.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedPatient.mrn} · {selectedPatient.department}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary">
              Demographics
            </Typography>
            <Typography variant="body2">
              {selectedPatient.age} years · {selectedPatient.gender}
            </Typography>
            <Typography variant="body2">
              {maskPhoneNumber(selectedPatient.phone)}
            </Typography>
            <Typography variant="body2">{selectedPatient.city}</Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Alerts / Allergies
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
              {selectedPatient.alerts.length === 0 &&
                selectedPatient.allergies.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No alerts
                  </Typography>
                )}
              {selectedPatient.alerts.map((alert) => (
                <Chip key={alert} label={alert} color="warning" size="small" />
              ))}
              {selectedPatient.allergies.map((allergy) => (
                <Chip
                  key={allergy}
                  label={allergy}
                  color="error"
                  size="small"
                />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Last Vitals
            </Typography>
            <Typography variant="body2">
              {selectedPatient.lastVitals}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Last Visit Note
            </Typography>
            <Typography variant="body2">
              {selectedPatient.lastVisitNote}
            </Typography>
          </Box>
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Select a patient to view details.
        </Typography>
      )}
    </Box>
  );
}
