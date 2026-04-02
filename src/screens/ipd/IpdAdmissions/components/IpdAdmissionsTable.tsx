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

interface IpdAdmissionsTableProps {
  data: IpdAdmissionsData;
}

export function IpdAdmissionsTable({ data }: IpdAdmissionsTableProps) {
  const {
    historyTab,
    visibleAllPatients,
    visibleQueueRows,
    handleOpenAdmissionDialog,
    canManageAdmissions,
    handleOpenBedBoard,
    canOpenBedBoard,
  } = data;

  const allPatientColumns: CommonTableColumn<PatientRow>[] = [
    {
      id: "mrn",
      label: "MRN",
      minWidth: 140,
      renderCell: (patient) => patient.mrn,
    },
    {
      id: "patientName",
      label: "Patient Name",
      minWidth: 170,
      renderCell: (patient) => (
        <Typography sx={{ fontWeight: 600 }}>{patient.patientName}</Typography>
      ),
    },
    {
      id: "entryType",
      label: "Entry",
      minWidth: 130,
      renderCell: (patient) => (
        <Chip
          size="small"
          label={patient.entryType}
          color={patient.entryType === "Created Now" ? "info" : "default"}
          variant={patient.entryType === "Created Now" ? "filled" : "outlined"}
        />
      ),
    },
    {
      id: "ageGender",
      label: "Age / Gender",
      minWidth: 130,
      renderCell: (patient) => patient.ageGender,
    },
    {
      id: "admissionDate",
      label: "Admission Date & Time",
      minWidth: 190,
      renderCell: (patient) => patient.admissionDate,
    },
    {
      id: "ward",
      label: "Ward",
      minWidth: 180,
      renderCell: (patient) => patient.ward,
    },
    {
      id: "consultant",
      label: "Consultant",
      minWidth: 180,
      renderCell: (patient) => patient.consultant,
    },
    {
      id: "status",
      label: "Status",
      minWidth: 120,
      renderCell: (patient) => (
        <Chip
          size="small"
          label={patient.status}
          color={patient.status === "Admitted" ? "success" : "warning"}
        />
      ),
    },
    {
      id: "open",
      label: "Action",
      align: "right",
      minWidth: 160,
      renderCell: (patient) => (
        <Button
          size="small"
          variant="outlined"
          disabled={!canOpenBedBoard}
          onClick={() => handleOpenBedBoard(patient)}
        >
          {patient.bed ? "Bed / Ward" : "Allocate Bed"}
        </Button>
      ),
    },
  ];

  const queueColumns: CommonTableColumn<AdmissionQueueRow>[] = [
    {
      id: "mrn",
      label: "MRN",
      minWidth: 140,
      renderCell: (row) => row.mrn,
    },
    {
      id: "patientName",
      label: "Patient Name",
      minWidth: 170,
      renderCell: (row) => (
        <Typography sx={{ fontWeight: 600 }}>{row.patientName}</Typography>
      ),
    },
    {
      id: "stage",
      label: "Stage",
      minWidth: 150,
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
      id: "source",
      label: "Source",
      minWidth: 120,
      renderCell: (row) => row.source,
    },
    {
      id: "priority",
      label: "Priority",
      minWidth: 120,
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
      id: "preferredWard",
      label: "Ward Selection",
      minWidth: 180,
      renderCell: (row) => row.preferredWard,
    },
    {
      id: "consultant",
      label: "Consultant",
      minWidth: 180,
      renderCell: (row) => row.consultant || "--",
    },
    {
      id: "open",
      label: "Action",
      align: "right",
      minWidth: 180,
      renderCell: (row) => {
        return (
          <Button
            size="small"
            variant="outlined"
            disabled={!canManageAdmissions}
            onClick={() => handleOpenBedBoard(row)}
          >
            Allocate Bed
          </Button>
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
      />
    );
  }

  return (
    <CommonTable<AdmissionQueueRow>
      rows={visibleQueueRows}
      columns={queueColumns}
      getRowId={(row) => row.id}
      emptyMessage="No patients pending bed allocation."
    />
  );
}
