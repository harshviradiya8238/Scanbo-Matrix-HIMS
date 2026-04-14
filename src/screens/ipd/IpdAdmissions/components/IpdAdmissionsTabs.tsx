"use client";

import * as React from "react";
import {
  Box,
  Stack,
  Tab,
  Tabs,
} from "@/src/ui/components/atoms";
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

      <Box sx={{ flex: 1 }} />
    </Stack>
  );
}
