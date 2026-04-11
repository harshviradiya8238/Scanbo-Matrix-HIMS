"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { Alert, Button, Snackbar, Stack } from "@/src/ui/components/atoms";

import CustomCardTabs from "@/src/ui/components/molecules/CustomCardTabs";
import { useTheme } from "@/src/ui/theme";
import { useUser } from "@/src/core/auth/UserContext";
import { canAccessRoute } from "@/src/core/navigation/route-access";
import ModuleHeaderCard from "@/src/screens/clinical/components/ModuleHeaderCard";
import { PersonAddAlt1 as PersonAddAlt1Icon } from "@mui/icons-material";
import {
  EmergencyPageId,
  TriageLevel,
  ToastSeverity,
  EmergencyPatient,
  EmergencyBed,
  EmergencyOrder,
  ObservationEntry,
  QueueSection,
  BedBoardSection,
  CaseTrackingSection,
  getArrivalColumns,
  getObservationColumns,
  AssignBedDialog,
  TriageDialog,
  RegistrationDialog,
  VitalsDialog,
  DischargePreviewDialog,
  calculateDashboardMetrics,
  calculateBedOccupancy,
  getSortedQueueRows,
  getAssignBedZones,
  createEmergencyHandlers,
} from "./components";
import {
  TRIAGE_META,
  EMERGENCY_PAGES,
  INITIAL_PATIENTS,
  INITIAL_BEDS,
  INITIAL_ORDERS,
  INITIAL_OBSERVATION_LOG,
  BED_ASSIGN_PHYSICIANS,
  BED_ASSIGN_NURSES,
} from "./AsapEmergencyData";
import { DashboardSection } from "./components/sections/DashboardSection";
import { buildDischargeDraft } from "./components/utils";

const AsapEmergencyPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const { permissions } = useUser();

  const searchParams = useSearchParams();
  const activePage =
    (searchParams.get("tab") as EmergencyPageId) || "dashboard";

  const setActivePage = React.useCallback(
    (page: EmergencyPageId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", page);
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const [patients, setPatients] =
    React.useState<EmergencyPatient[]>(INITIAL_PATIENTS);
  const [beds, setBeds] = React.useState<EmergencyBed[]>(INITIAL_BEDS);
  const [orders, setOrders] = React.useState<EmergencyOrder[]>(INITIAL_ORDERS);
  const [observationLog, setObservationLog] = React.useState<
    ObservationEntry[]
  >(INITIAL_OBSERVATION_LOG);

  const [selectedPatientId, setSelectedPatientId] = React.useState("");

  const [registrationModalOpen, setRegistrationModalOpen] =
    React.useState(false);
  const [registrationSearch, setRegistrationSearch] = React.useState("");
  const [triageModalOpen, setTriageModalOpen] = React.useState(false);
  const [vitalsDialogOpen, setVitalsDialogOpen] = React.useState(false);
  const [dischargePreviewOpen, setDischargePreviewOpen] = React.useState(false);
  const [assignBedModalOpen, setAssignBedModalOpen] = React.useState(false);

  const [assignBedForm, setAssignBedForm] = React.useState({
    patientId: "",
    bedId: "",
    physician: BED_ASSIGN_PHYSICIANS[0],
    nurse: BED_ASSIGN_NURSES[0],
    priority: "High" as const,
    notes: "",
  });

  const [toast, setToast] = React.useState<{
    open: boolean;
    message: string;
    severity: ToastSeverity;
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const notify = React.useCallback(
    (message: string, severity: ToastSeverity = "info") => {
      setToast({ open: true, message, severity });
    },
    [],
  );

  const selectedPatient = React.useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  );

  React.useEffect(() => {
    if (patients.length === 0) {
      setSelectedPatientId("");
      return;
    }
    if (
      selectedPatientId &&
      !patients.some((patient) => patient.id === selectedPatientId)
    ) {
      setSelectedPatientId("");
    }
  }, [patients, selectedPatientId]);

  const canNavigate = React.useCallback(
    (route: string) => canAccessRoute(route, permissions),
    [permissions],
  );

  const openRoute = React.useCallback(
    (route: string, query?: Record<string, string>) => {
      if (!canNavigate(route)) {
        notify("You do not have permission to open this module.", "warning");
        return;
      }
      const params = new URLSearchParams();
      Object.entries(query ?? {}).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const queryString = params.toString();
      router.push(queryString ? `${route}?${queryString}` : route);
    },
    [canNavigate, notify, router],
  );

  const dashboardMetrics = React.useMemo(
    () => calculateDashboardMetrics(patients, beds),
    [patients, beds],
  );
  const bedOccupancy = React.useMemo(() => calculateBedOccupancy(beds), [beds]);

  const sortedQueueRows = React.useMemo(
    () => getSortedQueueRows(patients, "", "ALL", "ALL", "ALL", "ALL"),
    [patients],
  );

  const availableBeds = React.useMemo(
    () => beds.filter((bed) => bed.status === "Free"),
    [beds],
  );
  const assignBedPatient = React.useMemo(
    () =>
      patients.find((patient) => patient.id === assignBedForm.patientId) ??
      null,
    [assignBedForm.patientId, patients],
  );
  const assignBedZones = React.useMemo(() => getAssignBedZones(beds), [beds]);

  const {
    handleUseExistingPatient,
    openTriageAssessment,
    openVitalsDialog,
    handleRegisterPatient,
    handleSaveTriage,
    handleOpenPatientChart,
    handleConfirmAssignBed: handleConfirmAssignBedWithForm,
    handleSetBedFree,
    handleSaveClinicalNote,
    handleAddOrder,
    handleOrderStatusChange,
    handleSaveVitals,
    handleDisposition,
  } = React.useMemo(
    () =>
      createEmergencyHandlers({
        patients,
        setPatients,
        beds,
        setBeds,
        orders,
        setOrders,
        observationLog,
        setObservationLog,
        selectedPatientId,
        setSelectedPatientId,
        setAssignBedModalOpen,
        setRegistrationModalOpen,
        setRegistrationSearch,
        setActivePage,
        setTriageModalOpen,
        setVitalsDialogOpen,
        openRoute,
        notify,
      }),
    [
      patients,
      beds,
      orders,
      observationLog,
      selectedPatientId,
      openRoute,
      notify,
      setActivePage,
      setSelectedPatientId,
    ],
  );

  const openAssignBedModal = React.useCallback(
    (patientId: string, preferredBedId?: string) => {
      setSelectedPatientId(patientId);
      setAssignBedForm((prev) => ({
        ...prev,
        patientId,
        bedId: preferredBedId ?? "",
        notes: "",
      }));
      setAssignBedModalOpen(true);
    },
    [setSelectedPatientId],
  );

  const handleConfirmAssignBed = React.useCallback(() => {
    handleConfirmAssignBedWithForm(assignBedForm);
  }, [assignBedForm, handleConfirmAssignBedWithForm]);

  const getArrivalColumnsFor = React.useCallback(
    (context: "dashboard" | "triage" | string) => {
      return getArrivalColumns(
        theme,
        availableBeds.length,
        openAssignBedModal,
        openTriageAssessment,
        handleOpenPatientChart,
        setActivePage,
        setSelectedPatientId,
        context,
      );
    },
    [
      availableBeds.length,
      handleOpenPatientChart,
      openAssignBedModal,
      openTriageAssessment,
      setActivePage,
      theme,
      setSelectedPatientId,
    ],
  );

  const observationColumns = React.useMemo(() => getObservationColumns(), []);

  const subtitle = selectedPatient
    ? `${selectedPatient.name} · ${selectedPatient.id} · ${selectedPatient.mrn}`
    : "No active emergency patient selected";

  const tabItems = EMERGENCY_PAGES.map((page) => ({
    label: page.label,
    icon: page.icon,
    child:
      page.id === "dashboard" ? (
        <DashboardSection
          dashboardMetrics={dashboardMetrics}
          bedOccupancy={bedOccupancy}
          bedsLength={beds.length}
          sortedQueueRows={sortedQueueRows}
          arrivalColumns={getArrivalColumnsFor("dashboard")}
          availableBedsLength={availableBeds.length}
          setRegistrationModalOpen={setRegistrationModalOpen}
          setActivePage={setActivePage}
          openTriageAssessment={openTriageAssessment}
          openAssignBedModal={openAssignBedModal}
          handleOpenPatientChart={handleOpenPatientChart}
          activePage={"dashboard"}
        />
      ) : page.id === "triage" ? (
        <QueueSection
          patients={patients}
          arrivalColumns={getArrivalColumnsFor("triage")}
          activePage={"triage"}
          openTriageAssessment={openTriageAssessment}
          openAssignBedModal={openAssignBedModal}
          handleOpenPatientChart={handleOpenPatientChart}
          availableBedsLength={availableBeds.length}
          openRegistrationModal={() => setRegistrationModalOpen(true)}
        />
      ) : page.id === "bed-board" ? (
        <BedBoardSection
          beds={beds}
          patients={patients}
          selectedPatient={selectedPatient}
          handleSetBedFree={handleSetBedFree}
          openAssignBedModal={openAssignBedModal}
          handleOpenPatientChart={handleOpenPatientChart}
          notify={notify}
        />
      ) : (
        <CaseTrackingSection
          selectedPatient={selectedPatient}
          patients={patients}
          orders={orders}
          observationLog={observationLog}
          observationColumns={observationColumns}
          selectedPatientId={selectedPatientId}
          handleOpenPatientChart={handleOpenPatientChart}
          openVitalsDialog={openVitalsDialog}
          handleSaveClinicalNote={handleSaveClinicalNote}
          handleSaveVitals={handleSaveVitals}
          handleAddOrder={handleAddOrder}
          handleOrderStatusChange={handleOrderStatusChange}
          handleDisposition={handleDisposition}
          dashboardAvgWaitMinutes={dashboardMetrics.avgWaitMinutes}
          setActivePage={setActivePage}
          openRegistrationModal={() => setRegistrationModalOpen(true)}
        />
      ),
  }));

  return (
    <PageTemplate
      title="ASAP Emergency"
      subtitle={subtitle}
      currentPageTitle="Emergency"
      fullHeight={activePage === "chart"}
    >
      <Stack
        spacing={1.25}
        sx={{
          minHeight: activePage === "chart" ? "100%" : "auto",
          overflowY: activePage === "chart" ? "auto" : "visible",
        }}
      >
        <ModuleHeaderCard
          title="Emergency "
          description=""
          actions={
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                variant="contained"
                startIcon={<PersonAddAlt1Icon />}
                onClick={() => setRegistrationModalOpen(true)}
              >
                New Arrival
              </Button>
            </Stack>
          }
        />

        <CustomCardTabs
          scrollable={false}
          items={tabItems}
          defaultValue={Math.max(
            EMERGENCY_PAGES.findIndex((p) => p.id === activePage),
            0,
          )}
          onChange={(index) => setActivePage(EMERGENCY_PAGES[index].id)}
          showBackground
          tabsSx={{ borderRadius: 2, p: 1 }}
        />
      </Stack>

      <AssignBedDialog
        open={assignBedModalOpen}
        onClose={() => setAssignBedModalOpen(false)}
        assignBedPatient={assignBedPatient}
        assignBedForm={assignBedForm}
        assignBedZones={assignBedZones}
        patients={patients}
        beds={beds}
        handleAssignBedField={(field: string, value: any) =>
          setAssignBedForm((prev) => ({ ...prev, [field]: value }))
        }
        handleConfirmAssignBed={handleConfirmAssignBed}
      />

      <TriageDialog
        open={triageModalOpen}
        onClose={() => setTriageModalOpen(false)}
        patients={patients}
        handleSaveTriage={handleSaveTriage}
      />

      <RegistrationDialog
        open={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        patients={patients}
        handleRegisterPatient={handleRegisterPatient}
        handleUseExistingPatient={handleUseExistingPatient}
      />

      <VitalsDialog
        open={vitalsDialogOpen}
        onClose={() => setVitalsDialogOpen(false)}
        patients={patients}
        handleSaveVitals={handleSaveVitals}
      />

      <DischargePreviewDialog
        open={dischargePreviewOpen}
        onClose={() => setDischargePreviewOpen(false)}
        selectedPatient={selectedPatient}
        dischargeForm={buildDischargeDraft(selectedPatient || patients[0])}
        canNavigate={canNavigate}
        openRoute={openRoute}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={2800}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </PageTemplate>
  );
};

export default AsapEmergencyPage;
