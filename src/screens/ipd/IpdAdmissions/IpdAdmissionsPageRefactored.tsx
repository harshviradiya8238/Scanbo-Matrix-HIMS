"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { Box, Button, Chip, Stack, Typography } from "@/src/ui/components/atoms";
import { useIpdAdmissionsData } from "./hooks/useIpdAdmissionsData";
import { IpdAdmissionsMetrics } from "./components/IpdAdmissionsMetrics";
import { IpdAdmissionsTable } from "./components/IpdAdmissionsTable";
import { IpdAdmissionsDialogs } from "./components/IpdAdmissionsDialogs";
import IpdPatientTopBar from "../components/IpdPatientTopBar";
import CustomCardTabs from "@/src/ui/components/molecules/CustomCardTabs";

export default function IpdAdmissionsPageRefactored() {
  const data = useIpdAdmissionsData();
  const {
    selectedTopBarPatient,
    topBarFields,
    topBarPatientOptions,
    onSelectTopBarPatient,
    handleOpenAdmissionDialog,
    canManageAdmissions,
    historyTab,
    setHistoryTab,
  } = data;

  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  // const header = (
  //   <IpdPatientTopBar
  //     moduleTitle="IPD Admissions"
  //     sectionLabel="IPD"
  //     pageLabel="Admissions"
  //     patient={selectedTopBarPatient}
  //     fields={topBarFields}
  //     patientOptions={topBarPatientOptions}
  //     onSelectPatient={onSelectTopBarPatient}
  //   />
  // );

  if (!isHydrated) return null;

  return (
    <PageTemplate 
    // header={header}
     title="IPD Admissions" fullHeight>
       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1, minHeight: 0 }}>

      <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0 }}>
        <IpdAdmissionsMetrics data={data} />

        <CustomCardTabs
          sx={{ flex: 1, minHeight: 0 }}
          defaultValue={historyTab === "all" ? 0 : 1}
          onChange={(index) => setHistoryTab(index === 0 ? "all" : "queue")}
          header={
            <Button
              variant="contained"
              onClick={() => handleOpenAdmissionDialog()}
              disabled={!canManageAdmissions}
            >
              + New Admission
            </Button>
          }
          items={[
            {
              label: (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                    All IPD Patients
                  </Typography>
                  <Chip
                    size="small"
                    label={data.allPatients.length}
                    sx={{
                      height: 20,
                      minWidth: 24,
                      fontSize: 11,
                      fontWeight: 700,
                      bgcolor: historyTab === "all" ? "primary.main" : "action.selected",
                      color: historyTab === "all" ? "#fff" : "text.secondary",
                    }}
                  />
                </Stack>
              ),
              child: <IpdAdmissionsTable data={data} />,
            },
            {
              label: (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                    Admission Queue
                  </Typography>
                  <Chip
                    size="small"
                    label={data.queueRows.length}
                    sx={{
                      height: 20,
                      minWidth: 24,
                      fontSize: 11,
                      fontWeight: 700,
                      bgcolor: historyTab === "queue" ? "primary.main" : "action.selected",
                      color: historyTab === "queue" ? "#fff" : "text.secondary",
                    }}
                  />
                </Stack>
              ),
              child: <IpdAdmissionsTable data={data} />,
            },
          ]}
        />

        <IpdAdmissionsDialogs data={data} />
      </Stack>
       </Box>
    </PageTemplate>
  );
}
