"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { Alert, Button, Snackbar, Stack } from "@/src/ui/components/atoms";

import CustomCardTabs from "@/src/ui/components/molecules/CustomCardTabs";
import { alpha, useTheme } from "@/src/ui/theme";
import { useUser } from "@/src/core/auth/UserContext";
import { canAccessRoute } from "@/src/core/navigation/route-access";
import ModuleHeaderCard from "@/src/screens/clinical/components/ModuleHeaderCard";
import {
  AccessibilityNew as AccessibilityNewIcon,
  Air as AirIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Bed as BedIcon,
  Bloodtype as BloodtypeIcon,
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  FavoriteBorder as FavoriteBorderIcon,
  MonitorHeart as MonitorHeartIcon,
  PersonAddAlt1 as PersonAddAlt1Icon,
  Close as CloseIcon,
  Search as SearchIcon,
  Science as ScienceIcon,
  Timeline as TimelineIcon,
  ViewList as ViewListIcon,
} from "@mui/icons-material";
import CommonDataGrid, {
  type CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import {
  EmergencyPageId,
  CaseTrackingTabId,
  CaseTrackingSidebarFilter,
  TriageLevel,
  Gender,
  ArrivalMode,
  PatientStatus,
  OrderStatus,
  QueueViewMode,
  BedBoardFilter,
  ToastSeverity,
  ChipColor,
  PatientVitals,
  EmergencyPatient,
  EmergencyBed,
  EmergencyOrder,
  ObservationEntry,
  RegistrationForm,
  TriageForm,
  BedAssignForm,
  BedAssignPriority,
  OrderForm,
  VitalsForm,
  DischargeForm,
  buildDischargeDraft,
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
  getCaseTrackingRows,
  getAssignBedZones,
  getRegistrationMatches,
  getSelectedPatientData,
  createEmergencyHandlers,
} from "./components";
import {
  TRIAGE_META,
  EMERGENCY_PAGES,
  INITIAL_PATIENTS,
  INITIAL_BEDS,
  INITIAL_ORDERS,
  INITIAL_OBSERVATION_LOG,
  DEFAULT_REGISTRATION,
  DEFAULT_TRIAGE,
  BED_ASSIGN_PHYSICIANS,
  BED_ASSIGN_NURSES,
  DEFAULT_ORDER_FORM,
  DEFAULT_VITALS_FORM,
  DEFAULT_DISCHARGE_FORM,
} from "./AsapEmergencyData";
import { DashboardSection } from "./components/sections/DashboardSection";

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

  const [caseTrackingTab, setCaseTrackingTab] =
    React.useState<CaseTrackingTabId>("vitals");
  const [caseTrackingFilter, setCaseTrackingFilter] =
    React.useState<CaseTrackingSidebarFilter>("All");
  const [caseTrackingSearch, setCaseTrackingSearch] = React.useState("");
  const [queueDoctorFilter, setQueueDoctorFilter] = React.useState<
    "ALL" | string
  >("ALL");
  const [bedFilter, setBedFilter] = React.useState<BedBoardFilter>("ALL");
  const [patients, setPatients] =
    React.useState<EmergencyPatient[]>(INITIAL_PATIENTS);
  const [beds, setBeds] = React.useState<EmergencyBed[]>(INITIAL_BEDS);
  const [orders, setOrders] = React.useState<EmergencyOrder[]>(INITIAL_ORDERS);
  const [observationLog, setObservationLog] = React.useState<
    ObservationEntry[]
  >(INITIAL_OBSERVATION_LOG);

  const [selectedPatientId, setSelectedPatientId] = React.useState("");
  const [queueFilter, setQueueFilter] = React.useState<"ALL" | TriageLevel>(
    "ALL",
  );
  const [queueSearch, setQueueSearch] = React.useState("");
  const [queueView, setQueueView] = React.useState<QueueViewMode>("table");
  const [queueStatusFilter, setQueueStatusFilter] = React.useState<
    "ALL" | PatientStatus
  >("ALL");
  const [queueArrivalFilter, setQueueArrivalFilter] = React.useState<
    "ALL" | ArrivalMode
  >("ALL");
  const [assignBedModalOpen, setAssignBedModalOpen] = React.useState(false);
  const [assignBedForm, setAssignBedForm] = React.useState<BedAssignForm>({
    patientId: "",
    bedId: "",
    physician: BED_ASSIGN_PHYSICIANS[0],
    nurse: BED_ASSIGN_NURSES[0],
    priority: "High",
    notes: "",
  });

  const [registrationModalOpen, setRegistrationModalOpen] =
    React.useState(false);
  const [triageModalOpen, setTriageModalOpen] = React.useState(false);
  const [vitalsDialogOpen, setVitalsDialogOpen] = React.useState(false);
  const [dischargePreviewOpen, setDischargePreviewOpen] = React.useState(false);
  const [registrationSearch, setRegistrationSearch] = React.useState("");
  const [registrationForm, setRegistrationForm] =
    React.useState<RegistrationForm>(DEFAULT_REGISTRATION);

  const [triageForm, setTriageForm] =
    React.useState<TriageForm>(DEFAULT_TRIAGE);
  const [vitalsForm, setVitalsForm] =
    React.useState<VitalsForm>(DEFAULT_VITALS_FORM);

  const [orderForm, setOrderForm] =
    React.useState<OrderForm>(DEFAULT_ORDER_FORM);
  const [dischargeForm, setDischargeForm] = React.useState<DischargeForm>(
    DEFAULT_DISCHARGE_FORM,
  );
  const [clinicalNoteDraft, setClinicalNoteDraft] = React.useState("");

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

  React.useEffect(() => {
    if (!selectedPatient) {
      setClinicalNoteDraft("");
      setDischargeForm(DEFAULT_DISCHARGE_FORM);
      setVitalsForm(DEFAULT_VITALS_FORM);
      return;
    }
    setClinicalNoteDraft(selectedPatient.clinicalNotes);
    setDischargeForm(buildDischargeDraft(selectedPatient));
    setVitalsForm({
      patientId: selectedPatient.id,
      heartRate: String(selectedPatient.vitals.heartRate),
      bloodPressure: selectedPatient.vitals.bloodPressure,
      temperature: String(selectedPatient.vitals.temperature),
      respiratoryRate: String(selectedPatient.vitals.respiratoryRate),
      spo2: String(selectedPatient.vitals.spo2),
      painScore: String(selectedPatient.vitals.painScore),
      gcs: String(selectedPatient.vitals.gcs),
      notes: "",
    });
  }, [selectedPatient]);

  React.useEffect(() => {
    setCaseTrackingTab("vitals");
  }, [selectedPatientId]);

  React.useEffect(() => {
    if (!triageForm.patientId) {
      const firstPatient = patients[0];
      if (!firstPatient) return;
      setTriageForm({
        patientId: firstPatient.id,
        heartRate: String(firstPatient.vitals.heartRate),
        bloodPressure: firstPatient.vitals.bloodPressure,
        temperature: String(firstPatient.vitals.temperature),
        respiratoryRate: String(firstPatient.vitals.respiratoryRate),
        spo2: String(firstPatient.vitals.spo2),
        triageLevel: firstPatient.triageLevel,
      });
      return;
    }

    const triagePatient = patients.find(
      (entry) => entry.id === triageForm.patientId,
    );
    if (!triagePatient) return;

    setTriageForm((prev) => ({
      ...prev,
      heartRate: String(triagePatient.vitals.heartRate),
      bloodPressure: triagePatient.vitals.bloodPressure,
      temperature: String(triagePatient.vitals.temperature),
      respiratoryRate: String(triagePatient.vitals.respiratoryRate),
      spo2: String(triagePatient.vitals.spo2),
      triageLevel: triagePatient.triageLevel,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triageForm.patientId]);

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
        if (value) {
          params.set(key, value);
        }
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
    () =>
      getSortedQueueRows(
        patients,
        queueSearch,
        queueFilter,
        queueStatusFilter,
        queueArrivalFilter,
        queueDoctorFilter,
      ),
    [
      patients,
      queueArrivalFilter,
      queueDoctorFilter,
      queueFilter,
      queueSearch,
      queueStatusFilter,
    ],
  );

  const queueKanbanColumns = React.useMemo(
    () =>
      (Object.keys(TRIAGE_META) as TriageLevel[]).map((level) => ({
        level,
        rows: sortedQueueRows.filter(
          (patient) => patient.triageLevel === level,
        ),
      })),
    [sortedQueueRows],
  );

  const caseTrackingRows = React.useMemo(
    () => getCaseTrackingRows(patients, caseTrackingSearch, caseTrackingFilter),
    [caseTrackingFilter, caseTrackingSearch, patients],
  );

  React.useEffect(() => {
    if (caseTrackingRows.length === 0) return;
    if (caseTrackingRows.some((patient) => patient.id === selectedPatientId))
      return;
    setSelectedPatientId(caseTrackingRows[0].id);
  }, [caseTrackingRows, selectedPatientId]);

  const availableBeds = React.useMemo(
    () => beds.filter((bed) => bed.status === "Free"),
    [beds],
  );

  const queueDoctorOptions = React.useMemo(
    () =>
      Array.from(
        new Set(patients.map((patient) => patient.assignedDoctor)),
      ).sort(),
    [patients],
  );
  const assignBedPatient = React.useMemo(
    () =>
      patients.find((patient) => patient.id === assignBedForm.patientId) ??
      null,
    [assignBedForm.patientId, patients],
  );
  const assignBedZones = React.useMemo(() => getAssignBedZones(beds), [beds]);
  const filteredBedRows = React.useMemo(
    () =>
      beds.filter((bed) =>
        bedFilter === "ALL" ? true : bed.status === bedFilter,
      ),
    [bedFilter, beds],
  );
  const registrationMatches = React.useMemo(
    () => getRegistrationMatches(patients, registrationSearch),
    [patients, registrationSearch],
  );

  const { selectedPatientOrders, selectedPatientObservations } = React.useMemo(
    () =>
      getSelectedPatientData(
        selectedPatient?.id,
        patients,
        orders,
        observationLog,
      ),
    [selectedPatient?.id, patients, orders, observationLog],
  );

  const handleRegistrationField = <K extends keyof RegistrationForm>(
    field: K,
    value: RegistrationForm[K],
  ) => {
    setRegistrationForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTriageField = <K extends keyof TriageForm>(
    field: K,
    value: TriageForm[K],
  ) => {
    setTriageForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOrderField = <K extends keyof OrderForm>(
    field: K,
    value: OrderForm[K],
  ) => {
    setOrderForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVitalsField = <K extends keyof VitalsForm>(
    field: K,
    value: VitalsForm[K],
  ) => {
    setVitalsForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDischargeField = <K extends keyof DischargeForm>(
    field: K,
    value: DischargeForm[K],
  ) => {
    setDischargeForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAssignBedField = <K extends keyof BedAssignForm>(
    field: K,
    value: BedAssignForm[K],
  ) => {
    setAssignBedForm((prev) => ({ ...prev, [field]: value }));
  };

  const {
    handleUseExistingPatient,
    openTriageAssessment,
    openVitalsDialog,
    openAssignBedModal,
    handleRegisterPatient,
    handleSaveTriage,
    assignBed,
    handleOpenPatientChart,
    handleConfirmAssignBed,
    handleSetBedFree,
    handleSaveClinicalNote,
    handleApplyOrderTemplate,
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
        selectedPatient,
        assignBedForm,
        setAssignBedForm,
        setAssignBedModalOpen,
        registrationForm,
        setRegistrationForm,
        setRegistrationModalOpen,
        setRegistrationSearch,
        setActivePage,
        triageForm,
        setTriageForm,
        setTriageModalOpen,
        vitalsForm,
        setVitalsForm,
        setVitalsDialogOpen,
        clinicalNoteDraft,
        openRoute,
        notify,
        dischargeForm,
        orderForm,
        setOrderForm,
      }),
    [
      patients,
      beds,
      orders,
      observationLog,
      selectedPatientId,
      selectedPatient,
      assignBedForm,
      registrationForm,
      triageForm,
      vitalsForm,
      clinicalNoteDraft,
      dischargeForm,
      orderForm,
      openRoute,
      notify,
      setActivePage,
      setSelectedPatientId,
    ],
  );

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
          queueFilter={queueFilter}
          setQueueFilter={setQueueFilter}
          sortedQueueRows={sortedQueueRows}
          arrivalColumns={getArrivalColumnsFor("triage")}
          queueView={queueView}
          setQueueView={setQueueView}
          queueDoctorOptions={queueDoctorOptions}
          queueDoctorFilter={queueDoctorFilter}
          setQueueDoctorFilter={setQueueDoctorFilter}
          queueStatusFilter={queueStatusFilter}
          setQueueStatusFilter={setQueueStatusFilter}
          queueArrivalFilter={queueArrivalFilter}
          setQueueArrivalFilter={setQueueArrivalFilter}
          queueSearch={queueSearch}
          setQueueSearch={setQueueSearch}
          queueKanbanColumns={queueKanbanColumns}
          activePage={"triage"}
          openTriageAssessment={openTriageAssessment}
          openAssignBedModal={openAssignBedModal}
          handleOpenPatientChart={handleOpenPatientChart}
          availableBedsLength={availableBeds.length}
          openRegistrationModal={() => setRegistrationModalOpen(true)}
        />
      ) : page.id === "bed-board" ? (
        <BedBoardSection
          bedFilter={bedFilter}
          setBedFilter={setBedFilter}
          filteredBedRows={filteredBedRows}
          patients={patients}
          selectedPatient={selectedPatient}
          handleOpenPatientChart={handleOpenPatientChart}
          handleSetBedFree={handleSetBedFree}
          openAssignBedModal={openAssignBedModal}
          notify={notify}
        />
      ) : (
        <CaseTrackingSection
          selectedPatient={selectedPatient}
          selectedPatientOrders={selectedPatientOrders}
          selectedPatientObservations={selectedPatientObservations}
          observationColumns={observationColumns}
          caseTrackingTab={caseTrackingTab}
          setCaseTrackingTab={setCaseTrackingTab}
          caseTrackingSearch={caseTrackingSearch}
          setCaseTrackingSearch={setCaseTrackingSearch}
          caseTrackingFilter={caseTrackingFilter}
          setCaseTrackingFilter={setCaseTrackingFilter}
          caseTrackingRows={caseTrackingRows}
          selectedPatientId={selectedPatientId}
          handleOpenPatientChart={handleOpenPatientChart}
          openVitalsDialog={openVitalsDialog}
          clinicalNoteDraft={clinicalNoteDraft}
          setClinicalNoteDraft={setClinicalNoteDraft}
          handleSaveClinicalNote={handleSaveClinicalNote}
          handleSaveVitals={handleSaveVitals}
          orderForm={orderForm}
          handleOrderField={handleOrderField}
          handleApplyOrderTemplate={handleApplyOrderTemplate}
          handleAddOrder={handleAddOrder}
          handleOrderStatusChange={handleOrderStatusChange}
          dischargeForm={dischargeForm}
          handleDischargeField={handleDischargeField}
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
          // sticky={false}
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
        handleAssignBedField={handleAssignBedField}
        handleConfirmAssignBed={handleConfirmAssignBed}
      />

      <TriageDialog
        open={triageModalOpen}
        onClose={() => setTriageModalOpen(false)}
        patients={patients}
        triageForm={triageForm}
        handleTriageField={handleTriageField}
        handleSaveTriage={handleSaveTriage}
      />

      <RegistrationDialog
        open={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        registrationSearch={registrationSearch}
        setRegistrationSearch={setRegistrationSearch}
        registrationMatches={registrationMatches}
        handleUseExistingPatient={handleUseExistingPatient}
        registrationForm={registrationForm}
        handleRegistrationField={handleRegistrationField}
        handleRegisterPatient={handleRegisterPatient}
      />

      <VitalsDialog
        open={vitalsDialogOpen}
        onClose={() => setVitalsDialogOpen(false)}
        vitalsForm={vitalsForm}
        patients={patients}
        handleVitalsField={handleVitalsField}
        handleSaveVitals={handleSaveVitals}
      />

      <DischargePreviewDialog
        open={dischargePreviewOpen}
        onClose={() => setDischargePreviewOpen(false)}
        selectedPatient={selectedPatient}
        dischargeForm={dischargeForm}
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
