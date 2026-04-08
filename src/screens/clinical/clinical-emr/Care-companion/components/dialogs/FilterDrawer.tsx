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
import {
  STATUS_FILTER_OPTIONS,
  PROGRAM_OPTIONS,
} from "../../utils/mockDataUtils";
import type { PatientStatus } from "../../utils/types";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  activeFilters: { status: PatientStatus | "all"; program: string };
  onApplyFilters: (filters: {
    status: PatientStatus | "all";
    program: string;
  }) => void;
  onResetFilters: () => void;
}

export default function FilterDrawer({
  open,
  onClose,
  activeFilters,
  onApplyFilters,
  onResetFilters,
}: FilterDrawerProps) {
  const [statusFilter, setStatusFilter] = React.useState<PatientStatus | "all">(
    activeFilters.status,
  );
  const [programFilter, setProgramFilter] = React.useState<string>(
    activeFilters.program,
  );

  React.useEffect(() => {
    if (open) {
      setStatusFilter(activeFilters.status);
      setProgramFilter(activeFilters.program);
    }
  }, [open, activeFilters]);

  const handleApply = () => {
    onApplyFilters({ status: statusFilter, program: programFilter });
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
  };
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
                setStatusFilter(e.target.value as PatientStatus | "all")
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
                setProgramFilter(e.target.value as string)
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
          <Button variant="contained" fullWidth onClick={handleApply}>
            Apply Filters
          </Button>
          <Button variant="text" fullWidth sx={{ mt: 1 }} onClick={handleReset}>
            Reset All
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
