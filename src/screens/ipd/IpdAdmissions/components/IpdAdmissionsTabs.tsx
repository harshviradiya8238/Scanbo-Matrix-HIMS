"use client";

import * as React from "react";
import {
  Box,
  InputAdornment,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
} from "@/src/ui/components/atoms";
import { Search as SearchIcon } from "@mui/icons-material";
import { IpdAdmissionsData } from "../utils/ipd-admissions-types";

interface IpdAdmissionsTabsProps {
  data: IpdAdmissionsData;
}

export function IpdAdmissionsTabs({ data }: IpdAdmissionsTabsProps) {
  const {
    historyTab,
    setHistoryTab,
    allPatients,
    queueRows,
    allSearch,
    setAllSearch,
    allStatusFilter,
    setAllStatusFilter,
    allWardFilter,
    setAllWardFilter,
    queueSearch,
    setQueueSearch,
    queuePriorityFilter,
    setQueuePriorityFilter,
    queueSourceFilter,
    setQueueSourceFilter,
    visibleAllPatients,
    visibleQueueRows,
  } = data;

  const allPatientStatusOptions = [
    { label: "All Status", value: "all" },
    { label: "Admitted", value: "Admitted" },
    { label: "Observation", value: "Observation" },
  ];

  const allPatientWardOptions = [
    { label: "All Wards", value: "all" },
    ...Array.from(new Set(allPatients.map((p) => p.ward)))
      .filter(Boolean)
      .map((w) => ({ label: w, value: w })),
  ];

  const queuePriorityOptions = [
    { label: "All Priority", value: "all" },
    { label: "Routine", value: "Routine" },
    { label: "Urgent", value: "Urgent" },
    { label: "Emergency", value: "Emergency" },
  ];

  const queueSourceOptions = [
    { label: "All Source", value: "all" },
    { label: "OPD", value: "OPD" },
    { label: "ER", value: "ER" },
    { label: "Transfer", value: "Transfer" },
  ];

  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      spacing={1}
      alignItems={{ xs: "stretch", lg: "center" }}
      justifyContent="space-between"
    >
      <Tabs
        value={historyTab}
        onChange={(_, value: "all" | "queue") => setHistoryTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          px: 0.25,
          flexShrink: 0,
          "& .MuiTabs-indicator": {
            display: "none",
          },
          "& .MuiTabs-flexContainer": { gap: 0.5 },
          "& .MuiTab-root": {
            textTransform: "none",
            minHeight: 40,
            px: 2,
            color: "text.secondary",
            fontWeight: 600,
            fontSize: "1rem",
            borderRadius: 1.5,
            transition: "all 0.2s ease",
          },
          "& .MuiTab-root.Mui-selected": {
            color: "common.white",
            backgroundColor: "primary.main",
          },
        }}
      >
        <Tab
          value="all"
          label={`All IPD Patients - Admitted (${allPatients.length})`}
        />
        <Tab
          value="queue"
          label={`Admission Queue - Pending Bed (${queueRows.length})`}
        />
      </Tabs>

      {historyTab === "all" ? (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          sx={{
            flex: 1,
            minWidth: 0,
            justifyContent: { xs: "flex-start", lg: "flex-end" },
          }}
        >
          <TextField
            size="small"
            placeholder="Search all IPD patients..."
            value={allSearch}
            onChange={(event) => setAllSearch(event.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 250 }, maxWidth: 340 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            size="small"
            select
            label="Status"
            value={allStatusFilter}
            onChange={(event) => setAllStatusFilter(event.target.value)}
            sx={{ minWidth: 150 }}
          >
            {allPatientStatusOptions.map((option) => (
              <MenuItem key={`all-status-${option.value}`} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Ward"
            value={allWardFilter}
            onChange={(event) => setAllWardFilter(event.target.value)}
            sx={{ minWidth: 150 }}
          >
            {allPatientWardOptions.map((option) => (
              <MenuItem key={`all-ward-${option.value}`} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      ) : (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          sx={{
            flex: 1,
            minWidth: 0,
            justifyContent: { xs: "flex-start", lg: "flex-end" },
          }}
        >
          <TextField
            size="small"
            placeholder="Search queue by patient, MRN, diagnosis..."
            value={queueSearch}
            onChange={(event) => setQueueSearch(event.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 280 }, maxWidth: 360 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            size="small"
            select
            label="Priority"
            value={queuePriorityFilter}
            onChange={(event) => setQueuePriorityFilter(event.target.value)}
            sx={{ minWidth: 150 }}
          >
            {queuePriorityOptions.map((option) => (
              <MenuItem
                key={`queue-priority-${option.value}`}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Source"
            value={queueSourceFilter}
            onChange={(event) => setQueueSourceFilter(event.target.value)}
            sx={{ minWidth: 150 }}
          >
            {queueSourceOptions.map((option) => (
              <MenuItem
                key={`queue-source-${option.value}`}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      )}
    </Stack>
  );
}
