"use client";

import * as React from "react";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { Box, Button, Stack } from "@/src/ui/components/atoms";
import { FilterList as FilterListIcon } from "@mui/icons-material";
import EnrollPatientDialog, {
  type CareProgramTemplate,
} from "../../components/EnrollPatientDialog";
import PatientDetailDrawer from "../../components/PatientDetailDrawer";
import { MOCK_PATIENTS } from "./utils/mockDataUtils";
import Header from "./components/Header";
import StatsSection from "./components/StatsSection";
import PatientTable from "./components/PatientTable";
import FilterDrawer from "./components/FilterDrawer";
import ClosePlanDialog from "./components/ClosePlanDialog";
import type { EnrolledPatient, PatientStatus } from "./utils/types";

export default function CareCompanionPage() {
  const [search, setSearch] = React.useState("");
  const [patients, setPatients] =
    React.useState<EnrolledPatient[]>(MOCK_PATIENTS);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = React.useState(false);
  const [customProgramTemplates, setCustomProgramTemplates] = React.useState<
    CareProgramTemplate[]
  >([]);
  const [enrollDialogLaunchMode, setEnrollDialogLaunchMode] = React.useState<
    "enroll" | "create-template"
  >("enroll");
  const [drawerPatient, setDrawerPatient] =
    React.useState<EnrolledPatient | null>(null);
  const [drawerEditMode, setDrawerEditMode] = React.useState(false);
  const [closePlanDialogOpen, setClosePlanDialogOpen] = React.useState(false);
  const [closePlanPatient, setClosePlanPatient] =
    React.useState<EnrolledPatient | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<PatientStatus | "all">(
    "all",
  );
  const [programFilter, setProgramFilter] = React.useState("All Programs");
  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);

  const resetFilters = () => {
    setStatusFilter("all");
    setProgramFilter("All Programs");
  };

  const filteredPatients = React.useMemo(() => {
    let list = patients;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.patientId.toLowerCase().includes(q) ||
          p.program.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all")
      list = list.filter((p) => p.status === statusFilter);
    if (programFilter !== "All Programs")
      list = list.filter((p) => p.program === programFilter);
    return list;
  }, [patients, search, statusFilter, programFilter]);

  const handleAddNewCarePlan = () => {
    setEnrollDialogLaunchMode("create-template");
    setIsEnrollDialogOpen(true);
  };

  const handleEnrollPatient = () => {
    setEnrollDialogLaunchMode("enroll");
    setIsEnrollDialogOpen(true);
  };

  const handleEditPatient = (patient: EnrolledPatient) => {
    setDrawerPatient(patient);
    setDrawerEditMode(true);
  };

  const handleViewPatient = (patient: EnrolledPatient) => {
    setDrawerPatient(patient);
    setDrawerEditMode(false);
  };

  const handleClosePlan = (patient: EnrolledPatient) => {
    setClosePlanPatient(patient);
    setClosePlanDialogOpen(true);
  };

  const handleConfirmClosePlan = (patient: EnrolledPatient) => {
    setPatients((prev) =>
      prev.map((pt) =>
        pt.id === patient.id
          ? { ...pt, status: "closed" as PatientStatus }
          : pt,
      ),
    );
  };

  return (
    <PageTemplate
      title="Care Companion"
      subtitle="Post-Discharge Patient Management"
      currentPageTitle="Care Companion"
    >
      <Stack spacing={2}>
        <Header
          onAddNewCarePlan={handleAddNewCarePlan}
          onEnrollPatient={handleEnrollPatient}
        />

        <StatsSection patients={patients} />

        <Box>
          <PatientTable
            patients={filteredPatients}
            onEditPatient={handleEditPatient}
            onViewPatient={handleViewPatient}
            onClosePlan={handleClosePlan}
            toolbarRight={
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterListIcon />}
                  onClick={() => setFilterDrawerOpen(true)}
                >
                  Filters
                </Button>
                <Button variant="text" size="small" onClick={resetFilters}>
                  Clear
                </Button>
              </Stack>
            }
          />
        </Box>

        <FilterDrawer
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          programFilter={programFilter}
          onProgramFilterChange={setProgramFilter}
          onResetFilters={resetFilters}
        />
      </Stack>

      <EnrollPatientDialog
        open={isEnrollDialogOpen}
        onClose={() => setIsEnrollDialogOpen(false)}
        customProgramTemplates={customProgramTemplates}
        onCreateProgramTemplate={(template) =>
          setCustomProgramTemplates((prev) => [template, ...prev])
        }
        launchMode={enrollDialogLaunchMode}
      />

      <PatientDetailDrawer
        open={!!drawerPatient}
        onClose={() => {
          setDrawerPatient(null);
          setDrawerEditMode(false);
        }}
        patient={drawerPatient}
        editMode={drawerEditMode}
        onClosePlanClick={(p) => handleClosePlan(p as EnrolledPatient)}
      />

      <ClosePlanDialog
        open={closePlanDialogOpen}
        onClose={() => {
          setClosePlanDialogOpen(false);
          setClosePlanPatient(null);
        }}
        patient={closePlanPatient}
        onConfirmClose={handleConfirmClosePlan}
      />
    </PageTemplate>
  );
}
