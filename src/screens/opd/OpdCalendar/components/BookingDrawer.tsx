"use client";

import * as React from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { alpha, useTheme } from "@/src/ui/theme";
import {
  ChevronRight as ChevronRightIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { GLOBAL_PATIENTS, GlobalPatient } from "@/src/mocks/global-patients";
import { OpdAppointment, VisitType } from "../../opd-mock-data";
import {
  BookingForm,
  BookingErrors,
  SlotCheckResult,
} from "../types/opd-calendar.types";

interface BookingDrawerProps {
  open: boolean;
  booking: BookingForm;
  errors: BookingErrors;
  editingAppointment: OpdAppointment | null;
  slotLocked: boolean;
  slotCheck: SlotCheckResult;
  providers: string[];
  canManageCalendar: boolean;
  selectedPatientOption: GlobalPatient | null;
  patientSummary: {
    name: string;
    mrn: string;
    ageGender: string;
    phone: string;
    department: string;
  };
  onClose: () => void;
  onSelectPatient: (patient: GlobalPatient | null) => void;
  onRegisterPatient: () => void;
  onUpdateField: <K extends keyof BookingForm>(
    field: K,
    value: BookingForm[K],
  ) => void;
  onCreateBooking: (sendToQueue: boolean) => void;
  onUpdateBooking: () => void;
}

export function BookingDrawer({
  open,
  booking,
  errors,
  editingAppointment,
  slotLocked,
  slotCheck,
  providers,
  canManageCalendar,
  selectedPatientOption,
  patientSummary,
  onClose,
  onSelectPatient,
  onRegisterPatient,
  onUpdateField,
  onCreateBooking,
  onUpdateBooking,
}: BookingDrawerProps) {
  const theme = useTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 520, md: 600 },
          p: 2,
        },
      }}
    >
      <Stack spacing={1.3}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {editingAppointment ? "Reschedule Appointment" : "Create Booking"}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Patient Search */}
        <Autocomplete
          options={GLOBAL_PATIENTS}
          value={selectedPatientOption}
          onChange={(_, value) => onSelectPatient(value)}
          getOptionLabel={(option) => `${option.name} (${option.mrn})`}
          disabled={Boolean(editingAppointment)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Patient"
              placeholder="Search by MRN or name"
            />
          )}
        />

        {/* Register Patient */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="caption" color="text.secondary">
            Can&apos;t find patient in search?
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PersonAddIcon />}
            disabled={Boolean(editingAppointment) || !canManageCalendar}
            onClick={onRegisterPatient}
          >
            Register Patient
          </Button>
        </Stack>

        {/* Patient Details Box */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.2),
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: "0.08em" }}
          >
            Patient Details
          </Typography>
          <Grid container spacing={1} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                MRN
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {patientSummary.mrn || "—"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {patientSummary.name || "—"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Age / Gender
              </Typography>
              <Typography variant="body2">
                {patientSummary.ageGender || "—"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body2">
                {patientSummary.phone || "—"}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Department
              </Typography>
              <Typography variant="body2">
                {patientSummary.department || "—"}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Date & Time */}
        <Grid container spacing={1.2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={booking.date}
              onChange={(e) => onUpdateField("date", e.target.value)}
              disabled={slotLocked && !editingAppointment}
              error={
                Boolean(errors.date) && !(slotLocked && !editingAppointment)
              }
              helperText={
                slotLocked && !editingAppointment
                  ? "Choose another slot from the calendar to change."
                  : errors.date
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Time"
              type="time"
              value={booking.time}
              onChange={(e) => onUpdateField("time", e.target.value)}
              disabled={slotLocked && !editingAppointment}
              error={
                Boolean(errors.time) && !(slotLocked && !editingAppointment)
              }
              helperText={
                slotLocked && !editingAppointment
                  ? "Pick a different slot to change time."
                  : errors.time
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        {/* Slot Status */}
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            Slot status
          </Typography>
          <Chip
            label={slotCheck.status}
            size="small"
            color={slotCheck.tone}
            variant="outlined"
            sx={{ textTransform: "capitalize" }}
          />
          {slotCheck.message ? (
            <Typography variant="caption" color="text.secondary">
              {slotCheck.message}
            </Typography>
          ) : null}
        </Stack>

        {/* Provider */}
        <TextField
          select
          label="Provider"
          value={booking.provider}
          onChange={(e) => onUpdateField("provider", e.target.value)}
          disabled={slotLocked && !editingAppointment}
          error={
            Boolean(errors.provider) && !(slotLocked && !editingAppointment)
          }
          helperText={
            slotLocked && !editingAppointment
              ? "Provider is locked to the selected slot."
              : errors.provider
          }
        >
          {providers.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </TextField>

        {/* Department */}
        <TextField
          label="Department"
          value={booking.department}
          disabled
          error={Boolean(errors.department)}
          helperText={errors.department}
        />

        {/* Patient Name */}
        <TextField
          label="Patient Name"
          value={booking.patientName}
          disabled
          error={Boolean(errors.patientName)}
          helperText={errors.patientName}
        />

        {/* MRN + Age/Gender */}
        <Grid container spacing={1.2}>
          <Grid item xs={12} sm={6}>
            <TextField label="MRN" value={booking.mrn} disabled fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Age / Gender"
              value={booking.ageGender}
              onChange={(e) => onUpdateField("ageGender", e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>

        {/* Phone */}
        <TextField
          label="Phone"
          value={booking.phone}
          onChange={(e) => onUpdateField("phone", e.target.value)}
          error={Boolean(errors.phone)}
          helperText={errors.phone}
        />

        {/* Visit Type + Payer */}
        <Grid container spacing={1.2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Visit Type"
              value={booking.visitType}
              onChange={(e) =>
                onUpdateField("visitType", e.target.value as VisitType)
              }
            >
              {["New", "Follow-up", "Review"].map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Payer"
              value={booking.payerType}
              onChange={(e) =>
                onUpdateField(
                  "payerType",
                  e.target.value as "General" | "Insurance" | "Corporate",
                )
              }
            >
              {["General", "Insurance", "Corporate"].map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* Chief Complaint */}
        <TextField
          label="Chief Complaint"
          multiline
          minRows={2}
          value={booking.chiefComplaint}
          onChange={(e) => onUpdateField("chiefComplaint", e.target.value)}
          error={Boolean(errors.chiefComplaint)}
          helperText={errors.chiefComplaint}
        />

        {/* Action Buttons */}
        {editingAppointment ? (
          <Stack direction="row" spacing={1.2}>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!canManageCalendar}
              onClick={onUpdateBooking}
            >
              Save Changes
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1.2}>
            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              disabled={!canManageCalendar}
              onClick={() => onCreateBooking(false)}
            >
              Create Booking
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<GroupIcon />}
              disabled={!canManageCalendar}
              onClick={() => onCreateBooking(true)}
            >
              Create + Check-In
            </Button>
          </Stack>
        )}
      </Stack>
    </Drawer>
  );
}
