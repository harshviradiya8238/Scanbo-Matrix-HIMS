"use client";

import * as React from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  Stack,
  TextField,
  Typography,
  Autocomplete,
} from "@/src/ui/components/atoms";
import { Close as CloseIcon } from "@mui/icons-material";
import { PatientListData } from "../hooks/usePatientListData";
import { tagOptions } from "../utils/patient-list-utils";

export function FilterDrawer({ data }: { data: PatientListData }) {
  const { filters, setFilters, setFilterDrawerOpen } = data;

  return (
    <Box sx={{ width: 360, p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={() => setFilterDrawerOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Stack>

      <Stack spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={filters.status}
            onChange={(event: SelectChangeEvent<unknown>) =>
              setFilters((prev) => ({
                ...prev,
                status: event.target.value as string,
              }))
            }
          >
            {[
              "All",
              "Active",
              "Inactive",
              "Admitted",
              "Discharged",
              "Billing Hold",
            ].map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Gender</InputLabel>
          <Select
            label="Gender"
            value={filters.gender}
            onChange={(event: SelectChangeEvent<unknown>) =>
              setFilters((prev) => ({
                ...prev,
                gender: event.target.value as string,
              }))
            }
          >
            {["All", "Male", "Female", "Other"].map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Age range
          </Typography>
          <Slider
            value={filters.ageRange}
            onChange={(_, value) =>
              setFilters((prev) => ({
                ...prev,
                ageRange: value as number[],
              }))
            }
            valueLabelDisplay="auto"
            min={0}
            max={100}
          />
        </Box>

        <Stack direction="row" spacing={1.5}>
          <TextField
            label="Registration from"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={filters.regDateFrom}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                regDateFrom: event.target.value,
              }))
            }
            fullWidth
          />
          <TextField
            label="To"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={filters.regDateTo}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                regDateTo: event.target.value,
              }))
            }
            fullWidth
          />
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <TextField
            label="Last visit from"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={filters.lastVisitFrom}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                lastVisitFrom: event.target.value,
              }))
            }
            fullWidth
          />
          <TextField
            label="To"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={filters.lastVisitTo}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                lastVisitTo: event.target.value,
              }))
            }
            fullWidth
          />
        </Stack>

        <FormControl fullWidth size="small">
          <InputLabel>Department</InputLabel>
          <Select
            label="Department"
            value={filters.department}
            onChange={(event: SelectChangeEvent<unknown>) =>
              setFilters((prev) => ({
                ...prev,
                department: event.target.value as string,
              }))
            }
          >
            {[
              "All",
              "Cardiology",
              "Neurology",
              "Orthopedics",
              "Pediatrics",
              "Oncology",
              "Dermatology",
            ].map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Doctor</InputLabel>
          <Select
            label="Doctor"
            value={filters.doctor}
            onChange={(event: SelectChangeEvent<unknown>) =>
              setFilters((prev) => ({
                ...prev,
                doctor: event.target.value as string,
              }))
            }
          >
            {[
              "All",
              "Dr. Rao",
              "Dr. Chen",
              "Dr. Kim",
              "Dr. Martinez",
              "Dr. Singh",
              "Dr. Patel",
            ].map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Autocomplete
          multiple
          options={tagOptions}
          value={filters.tags}
          onChange={(_, value) =>
            setFilters((prev) => ({ ...prev, tags: value }))
          }
          renderInput={(params) => (
            <TextField {...params} label="Tags" size="small" />
          )}
        />

        <Button variant="contained" onClick={() => setFilterDrawerOpen(false)}>
          Apply filters
        </Button>
      </Stack>
    </Box>
  );
}
