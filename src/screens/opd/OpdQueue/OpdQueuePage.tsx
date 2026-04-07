"use client";

import * as React from "react";
import { Stack, Alert } from "@mui/material";
import OpdLayout from "@/src/screens/opd/common/components/OpdLayout";
import { useOpdQueueData } from "./hooks/useOpdQueueData";
import { OpdQueueMetrics } from "./components/OpdQueueMetrics";
import { OpdQueueTable } from "./components/OpdQueueTable";
import { OpdQueueFilters } from "./components/OpdQueueFilters";
import { OpdQueueDialogs } from "./components/OpdQueueDialogs";

export default function OpdQueuePage() {
  const data = useOpdQueueData() as any;
  const { opdStatus, opdError } = data;

  if (opdStatus === "loading" && !data.queue.length) {
    return (
      <OpdLayout
        title="OPD Dashboard"
        currentPageTitle="Queue"
        showRoleGuide={false}
      >
        <Stack spacing={2}>
          <Alert severity="info">Loading OPD queue...</Alert>
        </Stack>
      </OpdLayout>
    );
  }

  return (
    <OpdLayout
      title="OPD Dashboard"
      currentPageTitle="Queue"
      showRoleGuide={false}
    >
      <Stack spacing={1.25}>
        {opdStatus === "loading" && (
          <Alert severity="info">
            Loading OPD data from the local JSON server.
          </Alert>
        )}
        {opdStatus === "error" && (
          <Alert severity="warning">
            OPD JSON server not reachable. Showing fallback data.
            {opdError ? ` (${opdError})` : ""}
          </Alert>
        )}
        <OpdQueueMetrics data={data} />
        <OpdQueueTable data={data} />
        <OpdQueueFilters data={data} />
        <OpdQueueDialogs data={data} />
      </Stack>
    </OpdLayout>
  );
}
