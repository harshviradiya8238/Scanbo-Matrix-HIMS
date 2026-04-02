"use client";

import * as React from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Chip,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@/src/ui/components/atoms";
import { Card } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { ProviderAvailability } from "../../opd-mock-data";
import { getInitials } from "../utils/opd-calendar.utils";

interface CalendarSidebarProps {
  patientName: string | undefined;
  patientMrn: string;
  directDate: string;
  directDepartment: string;
  directProvider: string | null;
  directAvailability: ProviderAvailability | null;
  directProviderOptions: string[];
  departmentOptions: string[];
  availableSlotCount: number;
  onDepartmentChange: (value: string) => void;
  onProviderChange: (value: string | null) => void;
  onDateChange: (value: Dayjs | null) => void;
}

export function CalendarSidebar({
  patientName,
  patientMrn,
  directDate,
  directDepartment,
  directProvider,
  directAvailability,
  directProviderOptions,
  departmentOptions,
  availableSlotCount,
  onDepartmentChange,
  onProviderChange,
  onDateChange,
}: CalendarSidebarProps) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        border: "none",
        backgroundColor: "transparent",
        boxShadow: "none",
        alignSelf: "stretch",
        height: "100%",
      }}
    >
      <Stack spacing={1.5} sx={{ height: "100%" }}>
        {/* Patient Banner */}
        {patientName ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.2,
              py: 1,
              borderRadius: 2,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.2),
              bgcolor: alpha(theme.palette.primary.main, 0.06),
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: "0.8rem",
                bgcolor: alpha(theme.palette.primary.main, 0.18),
                color: theme.palette.primary.main,
                fontWeight: 700,
              }}
            >
              {getInitials(patientName)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, lineHeight: 1.2 }}
              >
                {patientName}
              </Typography>
              {patientMrn ? (
                <Typography variant="caption" color="text.secondary">
                  MRN {patientMrn}
                </Typography>
              ) : null}
            </Box>
          </Box>
        ) : null}

        {patientName ? <Divider /> : null}

        {/* Department Selector */}
        <Stack spacing={1.2}>
          <TextField
            size="small"
            select
            label="Department"
            value={directDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Select department</MenuItem>
            {departmentOptions.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Mini Calendar */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={directDate ? dayjs(directDate) : null}
            onChange={onDateChange}
            showDaysOutsideCurrentMonth
            sx={{
              height: "auto",
              minHeight: 0,
              borderRadius: 0,
              border: "none",
              backgroundColor: "transparent",
              p: 0,
              alignSelf: "stretch",
              width: "100%",
              maxWidth: "100%",
              "& .MuiDateCalendar-viewTransitionContainer": { minHeight: 0 },
              "& .MuiPickersCalendarHeader-root": {
                px: 0,
                mb: 0.5,
                justifyContent: "space-between",
              },
              "& .MuiPickersCalendarHeader-label": {
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              },
              "& .MuiPickersArrowSwitcher-root .MuiIconButton-root": {
                border: "none",
                bgcolor: "transparent",
                width: 26,
                height: 26,
              },
              "& .MuiDayCalendar-header": {
                mx: 0,
                mb: 0.2,
                justifyContent: "space-between",
              },
              "& .MuiDayCalendar-root": { minHeight: 0 },
              "& .MuiDayCalendar-weekContainer": {
                margin: 0,
                justifyContent: "space-between",
              },
              "& .MuiDayCalendar-monthContainer": { minHeight: 0 },
              "& .MuiDayCalendar-slideTransition": { minHeight: 0 },
              "& .MuiDayCalendar-weekDayLabel": {
                width: 24,
                height: 24,
                fontSize: "0.66rem",
                fontWeight: 700,
                color: theme.palette.text.secondary,
              },
              "& .MuiPickersDay-root": {
                width: 26,
                height: 26,
                margin: 0,
                fontSize: "0.72rem",
                borderRadius: 7,
              },
              "& .MuiPickersSlideTransition-root": { minHeight: 132 },
              "& .MuiPickersDay-root.Mui-selected": {
                backgroundColor: "primary.main",
                color: theme.palette.common.white,
              },
              "& .MuiPickersDay-root.MuiPickersDay-today": {
                border: `1px solid ${alpha(theme.palette.primary.main, 0.6)}`,
              },
            }}
          />
        </LocalizationProvider>

        <Divider />

        {/* Doctor + Date Fields */}
        <Stack spacing={1.2}>
          <Autocomplete
            options={directProviderOptions}
            value={directProvider}
            onChange={(_, value) => onProviderChange(value)}
            disabled={!directDepartment}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Doctor"
                placeholder={
                  directDepartment ? "Select doctor" : "Choose department first"
                }
              />
            )}
          />
          <TextField
            size="small"
            label="Appointment Date"
            value={directDate}
            InputProps={{ readOnly: true }}
            fullWidth
          />
        </Stack>

        {/* Availability Box */}
        <Box
          sx={{
            p: 1.2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.2),
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Availability
          </Typography>
          {directProvider ? (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              sx={{ mt: 1 }}
            >
              {directAvailability?.location ? (
                <Chip
                  label={`Unit: ${directAvailability.location}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: alpha(theme.palette.primary.main, 0.35),
                  }}
                />
              ) : null}
              <Chip
                label={`${availableSlotCount} slots available`}
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 700,
                  borderColor:
                    availableSlotCount === 0
                      ? alpha(theme.palette.error.main, 0.5)
                      : availableSlotCount < 4
                        ? alpha(theme.palette.warning.main, 0.6)
                        : alpha(theme.palette.success.main, 0.6),
                  color:
                    availableSlotCount === 0
                      ? theme.palette.error.main
                      : availableSlotCount < 4
                        ? theme.palette.warning.main
                        : theme.palette.success.main,
                }}
              />
            </Stack>
          ) : (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.75, display: "block" }}
            >
              Choose a department and doctor to view available slots.
            </Typography>
          )}
        </Box>

        <Box sx={{ flex: 1 }} />
      </Stack>
    </Card>
  );
}
