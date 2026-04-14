"use client";

import * as React from "react";
import { alpha } from "@/src/ui/theme";
import {
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import {
  type EmergencyPatient,
  type RegistrationForm,
  type Gender,
  type ArrivalMode,
} from "../../types";
import {
  TRIAGE_BUTTON_COLOR,
  TRIAGE_LEVEL_LABELS,
  TRIAGE_LEVEL_ORDER,
} from "../../AsapEmergencyData";
import { maskMobileNumber } from "@/src/core/utils/phone";

interface RegistrationModalContentProps {
  registrationSearch: string;
  setRegistrationSearch: (value: string) => void;
  registrationMatches: EmergencyPatient[];
  handleUseExistingPatient: (patientId: string) => void;
  registrationForm: RegistrationForm;
  handleRegistrationField: <K extends keyof RegistrationForm>(
    field: K,
    value: RegistrationForm[K]
  ) => void;
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
    <Grid container spacing={2}>

      {/* ── Existing Patient Check ── */}
      <Grid item xs={12}>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}
        >
          Existing Patient Check
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1}>
          <TextField
            size="small"
            label="MRN or Phone"
            value={registrationSearch}
            onChange={(e) => setRegistrationSearch(e.target.value)}
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
                      {patient.id} · {patient.mrn} · {maskMobileNumber(patient.phone)}
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
      </Grid>

      {/* ── Patient Demographics ── */}
      <Grid item xs={12}>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}
        >
          Patient Demographics
        </Typography>
        <Divider />
      </Grid>

      {/* Name */}
      <Grid item xs={12} md={6}>
        <TextField
          size="small"
          label="Patient Name *"
          value={registrationForm.name}
          onChange={(e) => handleRegistrationField("name", e.target.value)}
          fullWidth
        />
      </Grid>

      {/* Age */}
      <Grid item xs={12} md={2}>
        <TextField
          size="small"
          label="Age *"
          value={registrationForm.age}
          onChange={(e) => handleRegistrationField("age", e.target.value)}
          fullWidth
        />
      </Grid>

      {/* Gender */}
      <Grid item xs={12} md={4}>
        <TextField
          size="small"
          select
          label="Gender"
          value={registrationForm.gender}
          onChange={(e) =>
            handleRegistrationField("gender", e.target.value as Gender)
          }
          fullWidth
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </TextField>
      </Grid>

      {/* Phone */}
      <Grid item xs={12} md={6}>
        <TextField
          size="small"
          label="Phone *"
          value={registrationForm.phone}
          onChange={(e) => handleRegistrationField("phone", e.target.value)}
          fullWidth
        />
      </Grid>

      {/* Brought By */}
      <Grid item xs={12} md={6}>
        <TextField
          size="small"
          label="Brought By"
          value={registrationForm.broughtBy}
          onChange={(e) => handleRegistrationField("broughtBy", e.target.value)}
          fullWidth
        />
      </Grid>

      {/* ── Emergency Details ── */}
      <Grid item xs={12}>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}
        >
          Emergency Details
        </Typography>
        <Divider  />
      </Grid>

      {/* Chief Complaint */}
      <Grid item xs={12} md={8}>
        <TextField
          size="small"
          label="Chief Complaint *"
          value={registrationForm.chiefComplaint}
          onChange={(e) =>
            handleRegistrationField("chiefComplaint", e.target.value)
          }
          multiline
          minRows={2}
          fullWidth
        />
      </Grid>

      {/* Mode of Arrival */}
      <Grid item xs={12} md={4}>
        <TextField
          size="small"
          select
          label="Mode of Arrival"
          value={registrationForm.arrivalMode}
          onChange={(e) =>
            handleRegistrationField("arrivalMode", e.target.value as ArrivalMode)
          }
          fullWidth
        >
          <MenuItem value="Ambulance">Ambulance</MenuItem>
          <MenuItem value="Walk-in">Walk-in</MenuItem>
          <MenuItem value="Referral">Referral</MenuItem>
          <MenuItem value="Police">Police</MenuItem>
        </TextField>
      </Grid>

      {/* ── Triage Level Assignment ── */}
      <Grid item xs={12}>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}
        >
          Triage Level Assignment
        </Typography>
        <Divider  />
      </Grid>

      {TRIAGE_LEVEL_ORDER.map((level) => {
        const selected = registrationForm.triageLevel === level;
        const detail = TRIAGE_LEVEL_LABELS[level];

        return (
          <Grid item key={level} xs={12} sm={6} md={4} lg={2.4}>
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
          </Grid>
        );
      })}

    </Grid>
  );
}