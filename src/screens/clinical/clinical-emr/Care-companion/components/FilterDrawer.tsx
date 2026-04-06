import * as React from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import { SelectChangeEvent } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { STATUS_FILTER_OPTIONS, PROGRAM_OPTIONS } from "../utils/mockDataUtils";
import type { PatientStatus } from "../utils/types";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  statusFilter: PatientStatus | "all";
  onStatusFilterChange: (value: PatientStatus | "all") => void;
  programFilter: string;
  onProgramFilterChange: (value: string) => void;
  onResetFilters: () => void;
}

export default function FilterDrawer({
  open,
  onClose,
  statusFilter,
  onStatusFilterChange,
  programFilter,
  onProgramFilterChange,
  onResetFilters,
}: FilterDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 360, p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Care Filters
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Narrow down enrolled patients
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e: SelectChangeEvent<unknown>) =>
                onStatusFilterChange(e.target.value as PatientStatus | "all")
              }
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Program</InputLabel>
            <Select
              label="Program"
              value={programFilter}
              onChange={(e: SelectChangeEvent<unknown>) =>
                onProgramFilterChange(e.target.value as string)
              }
            >
              {PROGRAM_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Box sx={{ mt: 4 }}>
          <Button variant="contained" fullWidth onClick={onClose}>
            Apply Filters
          </Button>
          <Button
            variant="text"
            fullWidth
            sx={{ mt: 1 }}
            onClick={onResetFilters}
          >
            Reset All
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
