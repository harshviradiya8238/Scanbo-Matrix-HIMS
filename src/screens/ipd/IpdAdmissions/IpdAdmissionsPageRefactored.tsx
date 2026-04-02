"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { Button, Stack } from "@/src/ui/components/atoms";
import { useIpdAdmissionsData } from "./hooks/useIpdAdmissionsData";
import { IpdAdmissionsMetrics } from "./components/IpdAdmissionsMetrics";
import { IpdAdmissionsTabs } from "./components/IpdAdmissionsTabs";
import { IpdAdmissionsTable } from "./components/IpdAdmissionsTable";
import { IpdAdmissionsDialogs } from "./components/IpdAdmissionsDialogs";
import IpdPatientTopBar from "../components/IpdPatientTopBar";
import { IpdSectionCard, ipdFormStylesSx } from "../components/ipd-ui";

export default function IpdAdmissionsPageRefactored() {
  const data = useIpdAdmissionsData();
  const {
    selectedTopBarPatient,
    topBarFields,
    topBarPatientOptions,
    onSelectTopBarPatient,
    handleOpenAdmissionDialog,
    canManageAdmissions,
  } = data;

  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const header = (
    <IpdPatientTopBar
      moduleTitle="IPD Admissions"
      sectionLabel="IPD"
      pageLabel="Admissions"
      patient={selectedTopBarPatient}
      fields={topBarFields}
      patientOptions={topBarPatientOptions}
      onSelectPatient={onSelectTopBarPatient}
    />
  );

  if (!isHydrated) return null;

  return (
    <PageTemplate header={header} title="IPD Admissions">
      <Stack spacing={3}>
        <IpdAdmissionsMetrics data={data} />

        <IpdSectionCard
          title="Admission Records"
          action={
            <Button
              variant="contained"
              onClick={() => handleOpenAdmissionDialog()}
              disabled={!canManageAdmissions}
            >
              + New Admission
            </Button>
          }
          bodySx={ipdFormStylesSx}
        >
          <Stack spacing={2}>
            <IpdAdmissionsTabs data={data} />
            <IpdAdmissionsTable data={data} />
          </Stack>
        </IpdSectionCard>

        <IpdAdmissionsDialogs data={data} />
      </Stack>
    </PageTemplate>
  );
}
