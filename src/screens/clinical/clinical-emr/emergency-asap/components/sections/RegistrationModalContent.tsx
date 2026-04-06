"use client";

import * as React from "react";
import { alpha } from "@/src/ui/theme";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { type EmergencyPatient, type RegistrationForm, type Gender, type ArrivalMode } from "../../types";
import {
  DEFAULT_REGISTRATION,
  TRIAGE_BUTTON_COLOR,
  TRIAGE_LEVEL_LABELS,
  TRIAGE_LEVEL_ORDER,
} from "../../AsapEmergencyData";

interface RegistrationModalContentProps {
  registrationSearch: string;
  setRegistrationSearch: (value: string) => void;
  registrationMatches: EmergencyPatient[];
  handleUseExistingPatient: (patientId: string) => void;
  registrationForm: RegistrationForm;
  handleRegistrationField: <K extends keyof RegistrationForm>(field: K, value: RegistrationForm[K]) => void;
}

export function RegistrationModalContent({
  registrationSearch,
  setRegistrationSearch,
  registrationMatches,
  handleUseExistingPatient,
  registrationForm,
  handleRegistrationField,
}: RegistrationModalContentProps) {
  return (
    <Stack spacing={2.25}>
      <Box>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}
        >
          Existing Patient Check
        </Typography>
        <Divider sx={{ mb: 1.25 }} />

        <Stack spacing={1}>
          <TextField
            size="small"
            label="MRN or Phone"
            value={registrationSearch}
            onChange={(event) => setRegistrationSearch(event.target.value)}
            placeholder="Search existing patient before new registration"
            fullWidth
          />

          {!registrationSearch.trim() ? (
            <Typography variant="caption" color="text.secondary">
              Search by MRN or phone to reuse an existing chart.
            </Typography>
          ) : registrationMatches.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No existing match found.
            </Typography>
          ) : (
            <Stack
              spacing={0.75}
              sx={{
                maxHeight: 180,
                overflowY: "auto",
                p: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
                bgcolor: alpha("info.light", 0.04),
              }}
            >
              {registrationMatches.map((patient) => (
                <Stack
                  key={patient.id}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={0.75}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  sx={{
                    p: 0.85,
                    borderRadius: 1.25,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {patient.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {patient.id} · {patient.mrn} · {patient.phone}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleUseExistingPatient(patient.id)}
                  >
                    Open Existing Chart
                  </Button>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </Box>

      <Box>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}
        >
          Patient Demographics
        </Typography>
        <Divider sx={{ mb: 1.25 }} />

        <Grid container spacing={1}>
          <Grid xs={12} md={6}>
            <TextField
              size="small"
              label="Patient Name *"
              value={registrationForm.name}
              onChange={(event) => handleRegistrationField("name", event.target.value)}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={2}>
            <TextField
              size="small"
              label="Age *"
              value={registrationForm.age}
              onChange={(event) => handleRegistrationField("age", event.target.value)}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={4}>
            <TextField
              size="small"
              select
              label="Gender"
              value={registrationForm.gender}
              onChange={(event) => handleRegistrationField("gender", event.target.value as Gender)}
              fullWidth
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              size="small"
              label="Phone *"
              value={registrationForm.phone}
              onChange={(event) => handleRegistrationField("phone", event.target.value)}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TextField
              size="small"
              label="Brought By"
              value={registrationForm.broughtBy}
              onChange={(event) => handleRegistrationField("broughtBy", event.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}
        >
          Emergency Details
        </Typography>
        <Divider sx={{ mb: 1.25 }} />

        <Grid container spacing={1}>
          <Grid xs={12} md={8}>
            <TextField
              size="small"
              label="Chief Complaint *"
              value={registrationForm.chiefComplaint}
              onChange={(event) => handleRegistrationField("chiefComplaint", event.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
          </Grid>
          <Grid xs={12} md={4}>
            <TextField
              size="small"
              select
              label="Mode of Arrival"
              value={registrationForm.arrivalMode}
              onChange={(event) => handleRegistrationField("arrivalMode", event.target.value as ArrivalMode)}
              fullWidth
            >
              <MenuItem value="Ambulance">Ambulance</MenuItem>
              <MenuItem value="Walk-in">Walk-in</MenuItem>
              <MenuItem value="Referral">Referral</MenuItem>
              <MenuItem value="Police">Police</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}
        >
          Triage Level Assignment
        </Typography>
        <Divider sx={{ mb: 1.25 }} />

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {TRIAGE_LEVEL_ORDER.map((level) => {
            const selected = registrationForm.triageLevel === level;
            const detail = TRIAGE_LEVEL_LABELS[level];

            return (
              <Box
                key={level}
                sx={{
                  flex: {
                    xs: "1 1 100%",
                    sm: "1 1 calc(50% - 6px)",
                    lg: "1 1 calc(20% - 6px)",
                  },
                }}
              >
                <Button
                  fullWidth
                  variant={selected ? "contained" : "outlined"}
                  color={TRIAGE_BUTTON_COLOR[level]}
                  onClick={() => handleRegistrationField("triageLevel", level)}
                  sx={{ py: 1, px: 0.5, borderRadius: 1.5, textTransform: "none" }}
                >
                  <Stack spacing={0.1} alignItems="center">
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {detail.level}
                    </Typography>
                    <Typography variant="caption">{detail.note}</Typography>
                  </Stack>
                </Button>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Stack>
  );
}
