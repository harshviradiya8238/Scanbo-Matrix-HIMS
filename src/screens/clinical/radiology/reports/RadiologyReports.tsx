"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { Box, Stack, Typography } from "@/src/ui/components/atoms";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { WorkspaceHeaderCard } from "@/src/ui/components/molecules";
import { useAppSelector } from "@/src/store/hooks";

// Internal Components
import ReportsSidebar from "./components/ReportsSidebar";
import ReportDetailView from "./components/ReportDetailView";

export default function RadiologyReports() {
  const router = useRouter();

  // Data Selectors
  const radiologyOrders = useAppSelector((state) => state.radiology.orders);
  const radiologyReading = useAppSelector((state) => state.radiology.reading);

  // Local State
  const [selectedRadiologyOrderId, setSelectedRadiologyOrderId] =
    React.useState("");

  // Derived Data
  const selectedRadiologyOrder = React.useMemo(() => {
    if (!selectedRadiologyOrderId) return null;
    return (
      radiologyOrders.find((row) => row.id === selectedRadiologyOrderId) ?? null
    );
  }, [radiologyOrders, selectedRadiologyOrderId]);

  const selectedReadingCase = React.useMemo(() => {
    if (!selectedRadiologyOrder) return null;
    return (
      radiologyReading.find(
        (row) =>
          row.study.toLowerCase() ===
            selectedRadiologyOrder.study.toLowerCase() ||
          row.modality.toLowerCase() ===
            selectedRadiologyOrder.modality.toLowerCase(),
      ) ?? null
    );
  }, [radiologyReading, selectedRadiologyOrder]);

  // Effects
  React.useEffect(() => {
    if (
      radiologyOrders.length > 0 &&
      !radiologyOrders.find((row) => row.id === selectedRadiologyOrderId)
    ) {
      setSelectedRadiologyOrderId(radiologyOrders[0].id);
    }
  }, [radiologyOrders, selectedRadiologyOrderId]);

  return (
    <PageTemplate title="Radiology Reports">
      <Stack spacing={2}>
        <WorkspaceHeaderCard sx={{ p: 2, borderRadius: 2.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "primary.main" }}
              >
                Radiology Reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View detailed impressions and findings for completed imaging
                studies.
              </Typography>
            </Box>
          </Stack>
        </WorkspaceHeaderCard>

        <Grid container spacing={2}>
          {/* Sidebar / List View */}
          <Grid xs={12} md={5}>
            <ReportsSidebar
              orders={radiologyOrders}
              selectedOrderId={selectedRadiologyOrderId}
              onSelectOrder={setSelectedRadiologyOrderId}
            />
          </Grid>

          {/* Main Content / Detail View */}
          <Grid xs={12} md={7}>
            <ReportDetailView
              order={selectedRadiologyOrder}
              readingCase={selectedReadingCase}
              onOpenWorklist={() => router.push("/radiology/worklist")}
              onViewPacs={() => router.push("/radiology/pacs-viewer")}
            />
          </Grid>
        </Grid>
      </Stack>
    </PageTemplate>
  );
}
