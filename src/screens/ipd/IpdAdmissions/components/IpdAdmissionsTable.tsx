"use client";

import * as React from "react";
import { Box, Button, Chip, Typography } from "@/src/ui/components/atoms";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import {
  AdmissionQueueRow,
  IpdAdmissionsData,
  PatientRow,
} from "../utils/ipd-admissions-types";
import { getActiveInfectionCaseByMrn } from "@/src/mocks/infection-control";

interface IpdAdmissionsTableProps {
  data: IpdAdmissionsData;
}

export function IpdAdmissionsTable({ data }: IpdAdmissionsTableProps) {
  const {
    historyTab,
    visibleAllPatients,
    visibleQueueRows,
    canManageAdmissions,
    handleOpenBedBoard,
    handleOpenInfectionCase,
    canOpenBedBoard,
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
    allPatients,
  } = data;

  const allPatientColumns: CommonColumn<PatientRow>[] = [
    {
      field: "mrn",
      headerName: "MRN",
      width: 140,
      renderCell: (patient) => patient.mrn,
    },
    {
      field: "patientName",
      headerName: "Patient Name",
      width: 170,
      renderCell: (patient) => (
        <Typography sx={{ fontWeight: 600 }}>{patient.patientName}</Typography>
      ),
    },
    {
      field: "entryType",
      headerName: "Entry",
      width: 130,
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
      field: "ageGender",
      headerName: "Age / Gender",
      width: 130,
      renderCell: (patient) => patient.ageGender,
    },
    {
      field: "admissionDate",
      headerName: "Admission Date & Time",
      // width: 190,
      renderCell: (patient) => patient.admissionDate,
    },
    {
      field: "ward",
      headerName: "Ward",
      // width: 180,
      renderCell: (patient) => patient.ward,
    },
    {
      field: "consultant",
      headerName: "Consultant",
      // width: 180,
      renderCell: (patient) => patient.consultant,
    },
    {
      field: "status",
      headerName: "Status",
      // width: 120,
      renderCell: (patient) => (
        <Chip
          size="small"
          label={patient.status}
          color={patient.status === "Admitted" ? "success" : "warning"}
        />
      ),
    },
    {
      field: "infection",
      headerName: "Infection",
      // width: 170,
      renderCell: (patient) => {
        const infectionCase = getActiveInfectionCaseByMrn(patient.mrn);
        if (!infectionCase) return "--";
        return (
          <Chip
            size="small"
            color="error"
            label={`${infectionCase.organism} · ${infectionCase.icStatus}`}
          />
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      align: "center",
      width: 260,
      renderCell: (patient) => (
        <>
          {getActiveInfectionCaseByMrn(patient.mrn) ? (
            <Button
              size="small"
              variant="text"
              color="error"
              onClick={() => handleOpenInfectionCase(patient)}
            >
              Infection
            </Button>
          ) : null}
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

  const queueColumns: CommonColumn<AdmissionQueueRow>[] = [
    {
      field: "mrn",
      headerName: "MRN",
      width: 140,
      renderCell: (row) => row.mrn,
    },
    {
      field: "patientName",
      headerName: "Patient Name",
      width: 170,
      renderCell: (row) => (
        <Typography sx={{ fontWeight: 600 }}>{row.patientName}</Typography>
      ),
    },
    {
      field: "stage",
      headerName: "Stage",
      width: 150,
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
      field: "source",
      headerName: "Source",
      width: 120,
      renderCell: (row) => row.source,
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 120,
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
      field: "infection",
      headerName: "Infection",
      width: 170,
      renderCell: (row) => {
        const infectionCase = getActiveInfectionCaseByMrn(row.mrn);
        if (!infectionCase) return "--";
        return (
          <Chip
            size="small"
            color="error"
            label={`${infectionCase.organism} · ${infectionCase.icStatus}`}
          />
        );
      },
    },
    {
      field: "preferredWard",
      headerName: "Ward Selection",
      width: 180,
      renderCell: (row) => row.preferredWard,
    },
    {
      field: "consultant",
      headerName: "Consultant",
      // width: 180,
      renderCell: (row) => row.consultant || "--",
    },
    {
      field: "action",
      headerName: "Action",
      align: "center",
      // widthz: 260,
      renderCell: (row) => {
        return (
          <>
            {getActiveInfectionCaseByMrn(row.mrn) ? (
              <Button
                size="small"
                variant="text"
                color="error"
                onClick={() => handleOpenInfectionCase(row)}
              >
                Infection
              </Button>
            ) : null}
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
        <CommonDataGrid<PatientRow>
          rows={visibleAllPatients}
          columns={allPatientColumns as any}
          getRowId={(row: any) => row.id}
          emptyTitle="No IPD patients found."
          searchPlaceholder="Search all IPD patients..."
          externalSearchValue={allSearch}
          onSearchChange={setAllSearch}
          tableHeight="100%"
          showSerialNo={true}
          filterDropdowns={[
            {
              id: "status-filter",
              placeholder: "Status",
              value: allStatusFilter,
              options: ["all", "Admitted", "Observation"],
              onChange: setAllStatusFilter,
            },
            {
              id: "ward-filter",
              placeholder: "Ward",
              value: allWardFilter,
              options: [
                "all",
                ...Array.from(new Set(allPatients.map((p) => p.ward))).filter(
                  Boolean
                ),
              ] as string[],
              onChange: setAllWardFilter,
            },
          ]}
        />
    );
  }

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <CommonDataGrid<AdmissionQueueRow>
        rows={visibleQueueRows}
        columns={queueColumns as any}
        getRowId={(row: any) => row.id}
        emptyTitle="No patients pending bed allocation."
        searchPlaceholder="Search queue..."
        externalSearchValue={queueSearch}
        onSearchChange={setQueueSearch}
        tableHeight="100%"
        showSerialNo={true}
        filterDropdowns={[
          {
            id: "priority-filter",
            placeholder: "Priority",
            value: queuePriorityFilter,
            options: ["all", "Routine", "Urgent", "Emergency"],
            onChange: setQueuePriorityFilter,
          },
          {
            id: "source-filter",
            placeholder: "Source",
            value: queueSourceFilter,
            options: ["all", "OPD", "ER", "Transfer"],
            onChange: setQueueSourceFilter,
          },
        ]}
      />
    </Box>
  );
}
