"use client";

import * as React from "react";
import { Button, Chip, Typography } from "@/src/ui/components/atoms";
import CommonTable, {
  CommonTableColumn,
} from "@/src/ui/components/molecules/CommonTable";
import {
  AdmissionQueueRow,
  IpdAdmissionsData,
  PatientRow,
} from "../utils/ipd-admissions-types";
import { getActiveInfectionCaseByMrn } from "@/src/mocks/infection-control";
import { useInitialContentLoading } from "@/src/ui/components/loaders/LoaderPrimitives";

interface IpdAdmissionsTableProps {
  data: IpdAdmissionsData;
}

export function IpdAdmissionsTable({ data }: IpdAdmissionsTableProps) {
  const initialTableLoading = useInitialContentLoading(550);
  const {
    historyTab,
    visibleAllPatients,
    visibleQueueRows,
    canManageAdmissions,
    handleOpenBedBoard,
    handleOpenInfectionCase,
    canOpenBedBoard,
  } = data;

  const allPatientColumns: CommonTableColumn<PatientRow>[] = [
    {
      id: "mrn",
      label: "MRN",
      minWidth: 130,
      renderCell: (patient) => patient.mrn,
    },
    {
      id: "patientName",
      label: "Patient Name",
      minWidth: 160,
      renderCell: (patient) => (
        <Typography sx={{ fontWeight: 600 }}>{patient.patientName}</Typography>
      ),
    },
    {
      id: "ageGender",
      label: "Age / Gender",
      minWidth: 120,
      renderCell: (patient) => patient.ageGender,
    },
    {
      id: "admissionDate",
      label: "Admission Date & Time",
      minWidth: 170,
      renderCell: (patient) => patient.admissionDate,
    },
    {
      id: "ward",
      label: "Ward",
      minWidth: 160,
      renderCell: (patient) => patient.ward,
    },
    {
      id: "consultant",
      label: "Consultant",
      minWidth: 160,
      renderCell: (patient) => patient.consultant,
    },
    {
      id: "status",
      label: "Status",
      minWidth: 110,
      renderCell: (patient) => (
        <Chip
          size="small"
          label={patient.status}
          color={patient.status === "Admitted" ? "success" : "warning"}
        />
      ),
    },
    {
      id: "infection",
      label: "Infection",
      minWidth: 160,
      renderCell: (patient) => {
        const infectionCase = getActiveInfectionCaseByMrn(patient.mrn);
        if (!infectionCase) return "--";
        return (
          <Chip
            size="small"
            color="error"
            label={`${infectionCase.organism} · ${infectionCase.icStatus}`}
            onClick={() => handleOpenInfectionCase(patient)}
          />
        );
      },
    },
    {
      id: "open",
      label: "Action",
      align: "right",
      minWidth: 150,
      renderCell: (patient) => (
        <>
          <Button
            size="small"
            variant="outlined"
            disabled={!canOpenBedBoard}
            onClick={() => handleOpenBedBoard(patient)}
          >
            {patient.bed ? "Bed / Ward" : "Allocate Bed"}
          </Button>
        </>
      ),
    },
  ];

  const queueColumns: CommonTableColumn<AdmissionQueueRow>[] = [
    {
      id: "mrn",
      label: "MRN",
      minWidth: 130,
      renderCell: (row) => row.mrn,
    },
    {
      id: "patientName",
      label: "Patient Name",
      minWidth: 160,
      renderCell: (row) => (
        <Typography sx={{ fontWeight: 600 }}>{row.patientName}</Typography>
      ),
    },
    {
      id: "stage",
      label: "Stage",
      minWidth: 140,
      renderCell: (row) => (
        <Chip
          size="small"
          label={row.stage}
          color={row.stage === "Bed Pending" ? "warning" : "default"}
          variant={row.stage === "Bed Pending" ? "filled" : "outlined"}
        />
      ),
    },
    {
      id: "priority",
      label: "Priority",
      minWidth: 110,
      renderCell: (row) => (
        <Chip
          size="small"
          label={row.priority}
          color={
            row.priority === "Emergency"
              ? "error"
              : row.priority === "Urgent"
                ? "warning"
                : "success"
          }
          variant="outlined"
        />
      ),
    },
    {
      id: "infection",
      label: "Infection",
      minWidth: 160,
      renderCell: (row) => {
        const infectionCase = getActiveInfectionCaseByMrn(row.mrn);
        if (!infectionCase) return "--";
        return (
          <Chip
            size="small"
            color="error"
            label={`${infectionCase.organism} · ${infectionCase.icStatus}`}
            onClick={() => handleOpenInfectionCase(row)}
          />
        );
      },
    },
    {
      id: "preferredWard",
      label: "Ward Selection",
      minWidth: 160,
      renderCell: (row) => row.preferredWard,
    },
    {
      id: "consultant",
      label: "Consultant",
      minWidth: 160,
      renderCell: (row) => row.consultant || "--",
    },
    {
      id: "open",
      label: "Action",
      align: "right",
      minWidth: 150,
      renderCell: (row) => {
        return (
          <>
            <Button
              size="small"
              variant="outlined"
              disabled={!canManageAdmissions}
              onClick={() => handleOpenBedBoard(row)}
            >
              Allocate Bed
            </Button>
          </>
        );
      },
    },
  ];

  if (historyTab === "all") {
    return (
      <CommonTable<PatientRow>
        rows={visibleAllPatients}
        columns={allPatientColumns}
        getRowId={(row) => row.id}
        emptyMessage="No IPD patients found."
        tableMinHeight={420}
        loading={initialTableLoading}
        loadingMessage="Loading admissions..."
      />
    );
  }

  return (
    <CommonTable<AdmissionQueueRow>
      rows={visibleQueueRows}
      columns={queueColumns}
      getRowId={(row) => row.id}
      emptyMessage="No patients pending bed allocation."
      tableMinHeight={420}
      loading={initialTableLoading}
      loadingMessage="Loading queue..."
    />
  );
}
