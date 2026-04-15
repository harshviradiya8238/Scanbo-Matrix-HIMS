"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { Button, Stack } from "@/src/ui/components/atoms";
import { SectionLoader } from "@/src/ui/components/loaders";
import { useIpdAdmissionsData } from "./hooks/useIpdAdmissionsData";
import { IpdAdmissionsMetrics } from "./components/IpdAdmissionsMetrics";
import { IpdAdmissionsTabs } from "./components/IpdAdmissionsTabs";
import { IpdAdmissionsTable } from "./components/IpdAdmissionsTable";
import { IpdAdmissionsDialogs } from "./components/IpdAdmissionsDialogs";
import { IpdSectionCard, ipdFormStylesSx } from "../components/ipd-ui";

export default function IpdAdmissionsPageRefactored() {
  const data = useIpdAdmissionsData();
  const {
    handleOpenAdmissionDialog,
    canManageAdmissions,
  } = data;

  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <PageTemplate title="IPD Admissions">
        <SectionLoader message="Loading admissions..." minHeight={320} />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="IPD Admissions">
      <Stack spacing={1.25}>
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
