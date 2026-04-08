"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { Box, Stack } from "@/src/ui/components/atoms";
import { useTheme } from "@mui/material";
import { useAppSelector } from "@/src/store/hooks";
import { useLabStatusConfig } from "../../lab-status-config";
import { useLabTheme } from "../../lab-theme";

import DashboardKpis from "./components/DashboardKpis";
import DashboardRecentSamples from "./components/DashboardRecentSamples";
import DashboardWorksheets from "./components/DashboardWorksheets";
import DashboardInstruments from "./components/DashboardInstruments";

export default function LabDashboardPage() {
  const theme = useTheme();
  const router = useRouter();
  const lab = useLabTheme(theme);
  const { sampleStatus, instrumentStatus } = useLabStatusConfig();
  const { samples, worksheets, results, instruments, clients, inventory } =
    useAppSelector((state) => state.lims);

  const pendingAnalysis = samples.filter(
    (s) => s.status === "received" || s.status === "assigned",
  ).length;
  const resultsPending = samples.filter((s) => s.status === "analysed").length;
  const publishedToday = samples.filter((s) => s.status === "published").length;
  const activeClients = clients.filter((c) => c.active).length;
  const toVerify = worksheets.filter(
    (w) => w.status === "to_be_verified",
  ).length;
  const lowStock = inventory.filter(
    (item) => item.onHand <= item.reorderLevel,
  ).length;

  return (
    <PageTemplate
      title="Laboratory"
      subtitle={new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      })}
      currentPageTitle="Dashboard"
    >
      <Stack spacing={1.25}>
        <DashboardKpis
          samplesCount={samples.length}
          pendingAnalysis={pendingAnalysis}
          resultsPending={resultsPending}
          publishedToday={publishedToday}
          activeClients={activeClients}
          totalClients={clients.length}
          worksheetsCount={worksheets.length}
          toVerify={toVerify}
          lowStock={lowStock}
        />

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          }}
        >
          <DashboardRecentSamples
            samples={samples}
            sampleStatus={sampleStatus}
            cardSx={lab.cardSx}
            tableContainerSx={lab.tableContainerSx}
            chipSx={lab.chipSx}
            onSampleClick={(id) => router.push(`/lab/samples?id=${id}`)}
          />

          <DashboardWorksheets
            worksheets={worksheets}
            results={results}
            cardSx={lab.cardSx}
            softSurface={lab.softSurface}
            onWorksheetClick={(id) => router.push(`/lab/worksheets?id=${id}`)}
          />
        </Box>

        <DashboardInstruments
          instruments={instruments}
          instrumentStatus={instrumentStatus}
          cardSx={lab.cardSx}
          chipSx={lab.chipSx}
        />
      </Stack>
    </PageTemplate>
  );
}
