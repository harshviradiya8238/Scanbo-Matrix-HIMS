"use client";

import * as React from "react";
import { Alert, Box, Button, Snackbar, Stack } from "@/src/ui/components/atoms";
import { Card, PatientGlobalHeader } from "@/src/ui/components/molecules";
import Grid from "@/src/ui/components/layout/AlignedGrid";
import { alpha, useTheme } from "@/src/ui/theme";
import { useMrnParam } from "@/src/core/patients/useMrnParam";
import { useOpdData } from "@/src/store/opdHooks";
import OpdLayout from "../common/components/OpdLayout";
import OpdTabs from "../common/components/OpdTabs";
import ConsultationWorkspaceHeader from "../common/components/ConsultationWorkspaceHeader";
import {
  OpdVisitPageProps,
  VISIT_TABS,
  VisitTab,
  formatElapsed,
  getPatientAge,
  getPatientGender,
  toDisplayStatusLabel,
  sanitizeAllergies,
} from "./utils/opd-visit.utils";
import { useOpdVisitData } from "./hooks/useOpdVisitData";
import { VitalsTab } from "./tabs/VitalsTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { AllergiesTab } from "./tabs/AllergiesTab";
import { DiagnosisTab } from "./tabs/DiagnosisTab";
import { OrdersTab } from "./tabs/OrdersTab";
import { PrescriptionsTab } from "./tabs/PrescriptionsTab";
import { NotesTab } from "./tabs/NotesTab";
import { OpdVisitDialogs } from "./components/OpdVisitDialogs";

export default function OpdVisitPage({ encounterId }: OpdVisitPageProps) {
  const theme = useTheme();
  const mrnParam = useMrnParam();
  const { status: opdStatus, error: opdError } = useOpdData();
  const data = useOpdVisitData({ encounterId });

  const {
    encounter,
    activeTab,
    setActiveTab,
    elapsedSeconds,
    snackbar,
    setSnackbar,
    capabilities,
    roleProfile,
  } = data;

  if (!encounter) {
    return (
      <OpdLayout
        title="Encounter"
        currentPageTitle="Encounter"
        subtitle={mrnParam ? `MRN ${mrnParam}` : undefined}
      >
        <Alert severity="warning">
          No encounter found. Start from Queue and select a patient.
        </Alert>
      </OpdLayout>
    );
  }

  const allergyList = encounter.allergies.filter(
    (item: string) => item && item.toLowerCase() !== "no known allergies",
  );

  const workspaceDateLabel = (() => {
    const current = new Date();
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    return `Date ${year}-${month}-${day}`;
  })();

  return (
    <OpdLayout
      title="Consultation Workspace"
      currentPageTitle="Consultation"
      fullHeight
    >
      {opdStatus === "loading" ? (
        <Alert severity="info">
          Loading OPD data from the local JSON server.
        </Alert>
      ) : null}
      {opdStatus === "error" ? (
        <Alert severity="warning">
          OPD JSON server not reachable. Showing fallback data.
          {opdError ? ` (${opdError})` : ""}
        </Alert>
      ) : null}

      <ConsultationWorkspaceHeader
        status={encounter.status}
        elapsedLabel={formatElapsed(elapsedSeconds)}
        dateLabel={workspaceDateLabel}
        onAmbientConsult={data.handleOpenAmbientInteraction}
        onExit={data.handleExitVisit}
        onComplete={data.handleCompleteVisit}
        onStart={data.handleStartVisit}
        canAmbientConsult={capabilities.canDocumentConsultation}
        canStart={capabilities.canStartConsult}
        canComplete={capabilities.canCompleteVisit}
      />

      <Grid
        container
        spacing={2}
        sx={{
          flex: 1,
          minHeight: 0,
          height: "100%",
          overflow: "hidden",
          alignItems: "stretch",
        }}
      >
        <Grid item xs={12} lg={3} sx={{ minHeight: 0 }}>
          <PatientGlobalHeader
            variant="opd"
            patientName={encounter.patientName}
            mrn={encounter.mrn}
            ageGender={encounter.ageGender}
            primaryContext={`Chief complaint: ${encounter.chiefComplaint || "--"}`}
            providerLabel="Doctor"
            providerName={encounter.doctor}
            summaryItems={[
              { label: "Age", value: getPatientAge(encounter.ageGender) },
              { label: "Gender", value: getPatientGender(encounter.ageGender) },
              { label: "Department", value: encounter.department || "--" },
              {
                label: "Check-in Time",
                value: encounter.appointmentTime || "--",
              },
            ]}
            statusChips={[
              {
                label: `Status: ${toDisplayStatusLabel(encounter.status)}`,
                color:
                  encounter.status === "COMPLETED"
                    ? "success"
                    : encounter.status === "CANCELLED"
                      ? "default"
                      : "info",
                variant: "outlined",
              },
              {
                label: `Priority: ${encounter.queuePriority}`,
                color: encounter.queuePriority === "Urgent" ? "error" : "info",
                variant: "outlined",
              },
              ...(allergyList.length === 0
                ? [
                    {
                      label: "No known allergies",
                      color: "success" as const,
                      variant: "outlined" as const,
                    },
                  ]
                : allergyList.slice(0, 2).map((allergy: string) => ({
                    label: `Allergy: ${allergy}`,
                    color: "error" as const,
                    variant: "outlined" as const,
                  }))),
              ...(allergyList.length > 2
                ? [
                    {
                      label: `+${allergyList.length - 2} more allergies`,
                      color: "error" as const,
                      variant: "outlined" as const,
                    },
                  ]
                : []),
            ]}
          >
            <Stack spacing={0.8} sx={{ pt: 0.4 }}>
              <Button
                variant="contained"
                color="secondary"
                disabled={!capabilities.canTransferToIpd}
                onClick={data.handleOpenTransferToIpd}
              >
                Move Patient to IPD
              </Button>
            </Stack>
          </PatientGlobalHeader>
        </Grid>

        <Grid
          item
          xs={12}
          lg={9}
          sx={{
            display: "flex",
            overflow: "hidden",
          }}
        >
          <Card
            elevation={0}
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              height: "70vh",
              p: 0,
              borderRadius: 2,
              boxShadow: "0 12px 24px rgba(15, 23, 42, 0.06)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 0.75,
                py: 0.75,
                bgcolor: "background.paper",
                borderBottom: "1px solid",
                borderColor: alpha(theme.palette.text.primary, 0.06),
              }}
            >
              <OpdTabs
                tabs={VISIT_TABS}
                value={activeTab}
                onChange={(value) => setActiveTab(value as VisitTab)}
              />
            </Box>

            <Stack
              spacing={1.5}
              sx={{
                p: 2,
                flex: 1,
                minHeight: 0,
                height: 0,
                overflowY: "auto",
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <Box
                sx={{
                  height: "calc(100vh - 220px)",
                  overflowY: "auto",
                  pr: 0.5,
                  scrollBehavior: "smooth",
                  "&::-webkit-scrollbar": { width: "6px" },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#c1c1c1",
                    borderRadius: "10px",
                  },
                }}
              >
                {activeTab === "vitals" && <VitalsTab data={data} />}
                {activeTab === "history" && <HistoryTab data={data} />}
                {activeTab === "allergies" && <AllergiesTab data={data} />}
                {activeTab === "diagnosis" && <DiagnosisTab data={data} />}
                {activeTab === "orders" && <OrdersTab data={data} />}
                {activeTab === "prescriptions" && (
                  <PrescriptionsTab data={data} />
                )}
                {activeTab === "notes" && <NotesTab data={data} />}
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <OpdVisitDialogs data={data} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3200}
        onClose={() => setSnackbar((prev: any) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev: any) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </OpdLayout>
  );
}
