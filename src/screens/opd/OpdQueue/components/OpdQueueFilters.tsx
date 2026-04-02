"use client";

import * as React from "react";
import {
  Box,
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
import { Close as CloseIcon } from "@mui/icons-material";
import { SelectChangeEvent } from "@mui/material";
import { OpdQueueData } from "../utils/opd-queue-types";

interface OpdQueueFiltersProps {
  data: OpdQueueData;
}

export function OpdQueueFilters({ data }: OpdQueueFiltersProps) {
  const {
    filterDrawerOpen,
    setFilterDrawerOpen,
    stageFilter,
    setStageFilter,
    priorityFilter,
    setPriorityFilter,
    departmentFilter,
    setDepartmentFilter,
    queue,
  } = data;

  const departments = React.useMemo(
    () => [
      "All Departments",
      ...Array.from(new Set(queue.map((item) => item.department))),
    ],
    [queue],
  );

  return (
    <Drawer
      anchor="right"
      open={filterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
    >
      <Box sx={{ width: 360, p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Queue Filters
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Narrow down the OPD queue
            </Typography>
          </Box>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          {/* Stage Filter */}
          <FormControl fullWidth size="small">
            <InputLabel>Stage</InputLabel>
            <Select
              label="Stage"
              value={stageFilter}
              onChange={(e: SelectChangeEvent<unknown>) =>
                setStageFilter(e.target.value as string)
              }
            >
              {["All Stage", "Waiting", "In Progress"].map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Priority Filter */}
          <FormControl fullWidth size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              label="Priority"
              value={priorityFilter}
              onChange={(e: SelectChangeEvent<unknown>) =>
                setPriorityFilter(e.target.value as string)
              }
            >
              {["All Priorities", "Routine", "Urgent"].map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Department Filter */}
          <FormControl fullWidth size="small">
            <InputLabel>Department</InputLabel>
            <Select
              label="Department"
              value={departmentFilter}
              onChange={(e: SelectChangeEvent<unknown>) =>
                setDepartmentFilter(e.target.value as string)
              }
            >
              {departments.map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>
    </Drawer>
  );
}
