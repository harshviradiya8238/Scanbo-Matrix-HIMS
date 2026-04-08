"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageTemplate from "@/src/ui/components/PageTemplate";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import CommonDataGrid, {
  CommonColumn,
} from "@/src/components/table/CommonDataGrid";
import { StatTile } from "@/src/ui/components/molecules";
import { alpha, useTheme } from "@/src/ui/theme";
import { useMrnParam } from "@/src/core/patients/useMrnParam";
import { formatPatientLabel } from "@/src/core/patients/patientDisplay";
import { useUser } from "@/src/core/auth/UserContext";
import { usePermission } from "@/src/core/auth/usePermission";
import { canAccessRoute } from "@/src/core/navigation/route-access";
import {
  Add as AddIcon,
  AddCircle as AddCircleIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Bed as BedIcon,
  Biotech as BiotechIcon,
  Block as BlockIcon,
  Bolt as BoltIcon,
  BugReport as BugReportIcon,
  CalendarMonth as CalendarMonthIcon,
  Campaign as CampaignIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  History as HistoryIcon,
  Hotel as HotelIcon,
  LocalHospital as LocalHospitalIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  PushPin as PushPinIcon,
  ReportProblem as ReportProblemIcon,
  Science as ScienceIcon,
  Search as SearchIcon,
  Send as SendIcon,
  ShowChart as ShowChartIcon,
  WarningAmber as WarningAmberIcon,
  OpenInNew as OpenInNewIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { IconButton, Menu, TablePagination, Tooltip } from "@mui/material";
import CommonTabs, {
  CommonTabItem,
} from "@/src/ui/components/molecules/CommonTabs";
import PatientWorkflowMenu from "./PatientWorkflowMenu";
import DetectTabContent from "./components/DetectTabContent";
import IsolateTabContent from "./components/IsolateTabContent";
import NotifyTabContent from "./components/NotifyTabContent";
import AuditTabContent from "./components/AuditTabContent";
import CloseTabContent from "./components/CloseTabContent";
import CaseDialog from "./components/dialogs/CaseDialog";
import CaseDetailDialog from "./components/dialogs/CaseDetailDialog";
import IsolateDialog from "./components/dialogs/IsolateDialog";
import AuditDialog from "./components/dialogs/AuditDialog";
import CloseCaseDialog from "./components/dialogs/CloseCaseDialog";
import {
  AVAILABLE_ISOLATION_ROOMS,
  AUDIT_CHECKLIST,
  AUDIT_RECORDS,
  CASE_DETAIL_EVENTS,
  CASE_EXTRA,
  CASE_TIMELINES,
  INITIAL_AUDITS,
  INITIAL_CASES,
  INITIAL_ISOLATIONS,
  IPD_PATIENTS,
  PPE_CHECKLIST,
  SEND_TO_OPTIONS,
} from "./utils/infection-control-data";
import {
  FLOW_TAB_IDS,
  IC_STATUS_BY_TAB,
  type AuditRecord,
  type IcStatus,
  type IsolationRoom,
  type IsolationType,
  type IpdStatus,
} from "./utils/infection-control-types";
import { type InfectionCase } from "@/src/mocks/infection-control";
import CustomCardTabs from "@/src/ui/components/molecules/CustomCardTabs";

export default function InfectionControlPage() {
  const router = useRouter();
  const theme = useTheme();
  const mrnParam = useMrnParam();
  const { permissions } = useUser();
  const can = usePermission();
  const canWrite = can("clinical.infection_control.write");
  const canNavigate = React.useCallback(
    (route: string) => canAccessRoute(route, permissions),
    [permissions],
  );
  const [cases, setCases] = React.useState<InfectionCase[]>(INITIAL_CASES);
  const [isolations, setIsolations] =
    React.useState<IsolationRoom[]>(INITIAL_ISOLATIONS);
  const [selectedIsolationRoomId, setSelectedIsolationRoomId] = React.useState<
    string | null
  >("iso-1");

  const [audits, setAudits] = React.useState<AuditRecord[]>(INITIAL_AUDITS);
  const [selectedCaseId, setSelectedCaseId] = React.useState<string>(
    INITIAL_CASES[0]?.id ?? "",
  );
  const [activeTab, setActiveTab] =
    React.useState<(typeof FLOW_TAB_IDS)[number]>("detect");
  const [caseDialogOpen, setCaseDialogOpen] = React.useState(false);
  const [caseDetailOpen, setCaseDetailOpen] = React.useState(false);
  const [isolateDialogOpen, setIsolateDialogOpen] = React.useState(false);
  const [isolateCaseId, setIsolateCaseId] = React.useState<string | null>(null);
  const [auditDialogOpen, setAuditDialogOpen] = React.useState(false);
  const [closeCaseDialogOpen, setCloseCaseDialogOpen] = React.useState(false);
  const [closeCaseId, setCloseCaseId] = React.useState<string | null>(null);
  const [mrnApplied, setMrnApplied] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null,
  );
  const [menuMrn, setMenuMrn] = React.useState<string | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    mrn: string,
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuMrn(mrn);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuMrn(null);
  };

  const menuOpen = Boolean(menuAnchorEl);

  const selectedCase =
    cases.find((item) => item.id === selectedCaseId) ?? cases[0];
  const caseTimeline = CASE_TIMELINES[selectedCase?.id ?? ""] ?? [];
  const closedCases = cases.filter((item) => item.status === "Closed");
  const flowMrn = selectedCase?.mrn ?? mrnParam;
  const pageSubtitle = formatPatientLabel(selectedCase?.patientName, flowMrn);
  const withMrn = React.useCallback(
    (route: string) => (flowMrn ? `${route}?mrn=${flowMrn}` : route),
    [flowMrn],
  );

  React.useEffect(() => {
    if (!mrnParam || mrnApplied) return;
    const match = cases.find((item) => item.mrn === mrnParam);
    if (match) {
      setSelectedCaseId(match.id);
    }
    setMrnApplied(true);
  }, [mrnParam, mrnApplied, cases]);

  const handleResolveCase = (caseId: string) => {
    setCases((prev) =>
      prev.map((item) =>
        item.id === caseId
          ? {
              ...item,
              status: "Closed",
              icStatus: "Closed" as IcStatus,
              lastUpdate: "Just now",
            }
          : item,
      ),
    );
    setSnackbar({
      open: true,
      message: "Case marked as closed.",
      severity: "success",
    });
  };

  const openCloseCaseDialog = (targetCase: InfectionCase) => {
    setCloseCaseId(targetCase.id);
    setCloseCaseDialogOpen(true);
  };

  const handleConfirmCloseCase = (formData: any) => {
    if (!closeCaseId) return;
    if (!formData.closingPhysician) {
      setSnackbar({
        open: true,
        message: "Please enter Closing Physician.",
        severity: "info",
      });
      return;
    }
    if (!formData.confirmCriteria) {
      setSnackbar({
        open: true,
        message: "Please confirm closure criteria.",
        severity: "info",
      });
      return;
    }
    handleResolveCase(closeCaseId);
    setCloseCaseDialogOpen(false);
    setCloseCaseId(null);
    setCaseDetailOpen(false);
  };

  const handleCreateCase = (data: { caseForm: any; autoTriggers: any }) => {
    const { caseForm } = data;
    const sel = caseForm.patientSelect
      ? IPD_PATIENTS.find(
          (p) =>
            p.mrn === caseForm.patientSelect ||
            p.name === caseForm.patientSelect,
        )
      : null;
    const [unit, bed] = sel?.wardBed
      ? sel.wardBed.split(" / ")
      : ["General Ward", "-"];
    const newCase: InfectionCase = {
      id: `ic-${Date.now()}`,
      patientName: sel?.name || caseForm.patientName || "New Patient",
      mrn: sel?.mrn || caseForm.mrn || "MRN-NEW",
      organism:
        caseForm.suspectedPathogen || caseForm.organism || "Unknown organism",
      unit: unit || caseForm.unit || "General Ward",
      bed: bed || caseForm.bed || "-",
      isolationType: (caseForm.isolationType as IsolationType) || "Contact",
      ipdStatus: (caseForm.ipdStatus as IpdStatus) || "Watch",
      icStatus: "Detected",
      status: "Active",
      risk: (caseForm.priority === "Critical"
        ? "High"
        : caseForm.priority === "High"
          ? "High"
          : "Moderate") as InfectionCase["risk"],
      lastUpdate: "Just now",
    };
    setCases((prev) => [newCase, ...prev]);
    setSelectedCaseId(newCase.id);
    setCaseDialogOpen(false);
    setSnackbar({
      open: true,
      message: "New case created.",
      severity: "success",
    });
  };

  const openIsolateDialog = (targetCase: InfectionCase) => {
    setIsolateCaseId(targetCase.id);
    setIsolateDialogOpen(true);
  };

  const handleConfirmIsolation = (formData: any) => {
    if (!isolateCaseId || !formData.roomId) {
      setSnackbar({
        open: true,
        message: "Please select an isolation room.",
        severity: "info",
      });
      return;
    }
    const room = AVAILABLE_ISOLATION_ROOMS.find(
      (r) => r.id === formData.roomId,
    );
    if (room) {
      const isoType =
        formData.isolationType === "Contact Precautions"
          ? "Contact"
          : formData.isolationType === "Droplet Precautions"
            ? "Droplet"
            : formData.isolationType === "Airborne Precautions"
              ? "Airborne"
              : "Contact"; // Standard Precautions → Contact for IC status
      setCases((prev) =>
        prev.map((c) =>
          c.id === isolateCaseId
            ? {
                ...c,
                icStatus: "Isolating" as IcStatus,
                unit: room.unit,
                bed: room.room,
                isolationType: isoType as IsolationType,
              }
            : c,
        ),
      );
      setSnackbar({
        open: true,
        message: "Isolation initiated. Room assigned.",
        severity: "success",
      });
      setActiveTab("isolate");
    }
    setIsolateDialogOpen(false);
    setIsolateCaseId(null);
  };

  const handleLogAudit = (formData: any) => {
    const newAudit: AuditRecord = {
      id: `au-${Date.now()}`,
      ward: formData.wardArea || "General Ward",
      compliance: Number(formData.score) || 90,
      lead: formData.leadAuditor || "Team Lead",
      lastAudit: formData.auditDate || "Just now",
    };
    setAudits((prev) => [newAudit, ...prev]);
    setAuditDialogOpen(false);
    setSnackbar({
      open: true,
      message: "Audit logged successfully.",
      severity: "success",
    });
  };

  const columns = React.useMemo<CommonColumn<InfectionCase>[]>(
    () => [
      {
        field: "patientName",
        headerName: "PATIENT",
        width: 250,
        renderCell: (row) => {
          const initials = row.patientName
            .split(" ")
            .map((p: string) => p[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: "primary.main",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {initials}
              </Avatar>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  component="button"
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    p: 0,
                    textAlign: "left",
                    "&:hover": { color: "primary.main" },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/patients/profile?mrn=${row.mrn}`);
                  }}
                >
                  {row.patientName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.mrn} - {row.unit}
                </Typography>
              </Box>
            </Stack>
          );
        },
      },
      { field: "bed", headerName: "BED" },
      {
        field: "organism",
        headerName: "PATHOGEN",
        renderCell: (row) => (
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor:
                  row.organism === "MRSA" ||
                  row.organism === "VRE" ||
                  row.organism.includes("COVID")
                    ? "error.main"
                    : row.organism === "C. diff"
                      ? "warning.main"
                      : "info.main",
              }}
            />
            <Typography variant="body2">{row.organism}</Typography>
          </Stack>
        ),
      },
      {
        field: "isolationType",
        headerName: "ISOLATION",
        renderCell: (row) => {
          const type = row.isolationType.toUpperCase();
          const color =
            type === "AIRBORNE"
              ? theme.palette.error
              : type === "CONTACT"
                ? theme.palette.warning
                : theme.palette.info;
          return (
            <Chip
              size="small"
              label={type}
              sx={{
                fontWeight: 700,
                fontSize: "0.65rem",
                borderRadius: "10px",
                bgcolor: alpha(color.main, 0.1),
                color: color.dark,
                border: "1px solid",
                borderColor: alpha(color.main, 0.4),
                minWidth: 80,
              }}
            />
          );
        },
      },
      {
        field: "ipdStatus",
        headerName: "IPD STATUS",
        renderCell: (row) => (
          <Chip
            size="small"
            icon={
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor:
                    row.ipdStatus === "Critical"
                      ? "error.main"
                      : row.ipdStatus === "Watch"
                        ? "warning.main"
                        : "success.main",
                }}
              />
            }
            label={row.ipdStatus}
            sx={{
              fontWeight: 700,
              fontSize: "0.75rem",
              borderRadius: "10px",
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              border: "1px solid",
              borderColor: alpha(theme.palette.warning.main, 0.2),
              "& .MuiChip-icon": { ml: 0.5 },
            }}
          />
        ),
      },
      {
        field: "icStatus",
        headerName: "IC STATUS",
        renderCell: (row) => {
          const color =
            row.icStatus === "Isolating"
              ? theme.palette.error
              : row.icStatus === "Notified" || row.icStatus === "Detected"
                ? theme.palette.warning
                : row.icStatus === "In Audit"
                  ? theme.palette.info
                  : theme.palette.success;

          return (
            <Chip
              size="small"
              icon={
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: color.main,
                  }}
                />
              }
              label={row.icStatus}
              sx={{
                fontWeight: 700,
                fontSize: "0.75rem",
                borderRadius: "10px",
                bgcolor: alpha(color.main, 0.05),
                color: color.dark,
                border: "1px solid",
                borderColor: alpha(color.main, 0.25),
                "& .MuiChip-icon": { ml: 0.5 },
              }}
            />
          );
        },
      },
      {
        field: "clinicalLinks",
        headerName: "CLINICAL LINKS",
        align: "center",
        renderCell: (row) => (
          <Tooltip title="Related Clinical Links">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, row.mrn);
              }}
              sx={{
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                },
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.2),
              }}
            >
              <OpenInNewIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        ),
      },
      {
        field: "actions",
        headerName: "ACTION",
        align: "right",
        width: 180,
        renderCell: (row) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCaseId(row.id);
                setCaseDetailOpen(true);
              }}
              sx={{
                px: 2,
                borderRadius: "6px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              View
            </Button>
            {row.icStatus === "Detected" && (
              <Button
                size="small"
                variant="contained"
                disabled={!canWrite}
                onClick={(e) => {
                  e.stopPropagation();
                  openIsolateDialog(row);
                }}
                sx={{
                  px: 2,
                  borderRadius: "6px",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Isolate
              </Button>
            )}
            {row.icStatus === "Isolating" && (
              <Button
                size="small"
                variant="contained"
                disabled={!canWrite}
                onClick={(e) => {
                  e.stopPropagation();
                  setCases((prev) =>
                    prev.map((c) =>
                      c.id === row.id
                        ? {
                            ...c,
                            icStatus: "Notified" as IcStatus,
                          }
                        : c,
                    ),
                  );
                }}
                sx={{
                  px: 2,
                  borderRadius: "6px",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Notify
              </Button>
            )}
            {row.icStatus === "Notified" && (
              <Button
                size="small"
                variant="contained"
                color="secondary"
                disabled={!canWrite}
                onClick={(e) => {
                  e.stopPropagation();
                  setCases((prev) =>
                    prev.map((c) =>
                      c.id === row.id
                        ? {
                            ...c,
                            icStatus: "In Audit" as IcStatus,
                          }
                        : c,
                    ),
                  );
                }}
                sx={{
                  borderRadius: "6px",
                  px: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Audit
              </Button>
            )}
            {row.icStatus === "In Audit" && (
              <Button
                size="small"
                variant="contained"
                color="success"
                disabled={!canWrite}
                onClick={(e) => {
                  e.stopPropagation();
                  openCloseCaseDialog(row);
                }}
                sx={{
                  px: 2,
                  borderRadius: "6px",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Close?
              </Button>
            )}
          </Stack>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, router, handleMenuOpen, canWrite],
  );

  const tabCounts = React.useMemo(() => {
    const counts: Record<(typeof FLOW_TAB_IDS)[number], number> = {
      detect: cases.filter((c) => c.icStatus === "Detected").length,
      isolate: cases.filter((c) => c.icStatus === "Isolating").length,
      notify: cases.filter((c) => c.icStatus === "Notified").length,
      audit: cases.filter((c) => c.icStatus === "In Audit").length,
      close: cases.filter((c) => c.icStatus === "Closed").length,
    };
    return counts;
  }, [cases]);

  const flowTabs: CommonTabItem<(typeof FLOW_TAB_IDS)[number]>[] =
    React.useMemo(
      () => [
        {
          id: "detect",
          label: (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Detect
              </Typography>
              <Box
                sx={{
                  px: 0.8,
                  py: 0.15,
                  borderRadius: "6px",
                  bgcolor:
                    activeTab === "detect"
                      ? alpha("#fff", 0.2)
                      : alpha(theme.palette.primary.main, 0.08),
                  color:
                    activeTab === "detect"
                      ? "inherit"
                      : theme.palette.primary.main,
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  minWidth: 20,
                  textAlign: "center",
                }}
              >
                {tabCounts.detect}
              </Box>
            </Stack>
          ),
          icon: <SearchIcon />,
        },
        {
          id: "isolate",
          label: (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Isolate
              </Typography>
              <Box
                sx={{
                  px: 0.8,
                  py: 0.15,
                  borderRadius: "6px",
                  bgcolor:
                    activeTab === "isolate"
                      ? alpha("#fff", 0.2)
                      : alpha(theme.palette.primary.main, 0.08),
                  color:
                    activeTab === "isolate"
                      ? "inherit"
                      : theme.palette.primary.main,
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  minWidth: 20,
                  textAlign: "center",
                }}
              >
                {tabCounts.isolate}
              </Box>
            </Stack>
          ),
          icon: <HealthAndSafetyIcon />,
        },
        {
          id: "notify",
          label: (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Notify
              </Typography>
              <Box
                sx={{
                  px: 0.8,
                  py: 0.15,
                  borderRadius: "6px",
                  bgcolor:
                    activeTab === "notify"
                      ? alpha("#fff", 0.2)
                      : alpha(theme.palette.primary.main, 0.08),
                  color:
                    activeTab === "notify"
                      ? "inherit"
                      : theme.palette.primary.main,
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  minWidth: 20,
                  textAlign: "center",
                }}
              >
                {tabCounts.notify}
              </Box>
            </Stack>
          ),
          icon: <NotificationsIcon />,
        },
        {
          id: "audit",
          label: (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Audit
              </Typography>
              <Box
                sx={{
                  px: 0.8,
                  py: 0.15,
                  borderRadius: "6px",
                  bgcolor:
                    activeTab === "audit"
                      ? alpha("#fff", 0.2)
                      : alpha(theme.palette.primary.main, 0.08),
                  color:
                    activeTab === "audit"
                      ? "inherit"
                      : theme.palette.primary.main,
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  minWidth: 20,
                  textAlign: "center",
                }}
              >
                {tabCounts.audit}
              </Box>
            </Stack>
          ),
          icon: <AssignmentTurnedInIcon />,
        },
        {
          id: "close",
          label: (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Close
              </Typography>
              <Box
                sx={{
                  px: 0.8,
                  py: 0.15,
                  borderRadius: "6px",
                  bgcolor:
                    activeTab === "close"
                      ? alpha("#fff", 0.2)
                      : alpha(theme.palette.primary.main, 0.08),
                  color:
                    activeTab === "close"
                      ? "inherit"
                      : theme.palette.primary.main,
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  minWidth: 20,
                  textAlign: "center",
                }}
              >
                {tabCounts.close}
              </Box>
            </Stack>
          ),
          icon: <CheckCircleIcon />,
        },
      ],
      [activeTab, theme, tabCounts],
    );

  const casesTableBlock = (
    <CommonDataGrid<InfectionCase>
      rows={cases.filter((c) => c.icStatus === IC_STATUS_BY_TAB[activeTab])}
      columns={columns}
      getRowId={(row) => row.id}
      showSerialNo={true}
      searchPlaceholder="Search patient, MRN, organism..."
      searchFields={["patientName", "mrn", "organism"]}
      toolbarRight={
        <Button
          variant="contained"
          size="small"
          startIcon={<AddCircleIcon />}
          disabled={!canWrite}
          onClick={() => setCaseDialogOpen(true)}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            px: 2,
          }}
        >
          New Case
        </Button>
      }
    />
  );

  const tabItems = [
    {
      label: flowTabs[0].label,
      icon: flowTabs[0].icon,
      child: <DetectTabContent casesTableBlock={casesTableBlock} />,
    },
    {
      label: flowTabs[1].label,
      icon: flowTabs[1].icon,
      child: (
        <IsolateTabContent
          casesTableBlock={casesTableBlock}
          selectedIsolationRoomId={selectedIsolationRoomId}
          isolations={isolations}
          openIsolateDialog={openIsolateDialog}
          canWrite={canWrite}
        />
      ),
    },
    {
      label: flowTabs[2].label,
      icon: flowTabs[2].icon,
      child: <NotifyTabContent canWrite={canWrite} />,
    },
    {
      label: flowTabs[3].label,
      icon: flowTabs[3].icon,
      child: <AuditTabContent casesTableBlock={casesTableBlock} />,
    },
    {
      label: flowTabs[4].label,
      icon: flowTabs[4].icon,
      child: <CloseTabContent casesTableBlock={casesTableBlock} />,
    },
  ];

  return (
    <PageTemplate
      title="Infection Control"
      subtitle={pageSubtitle}
      currentPageTitle="Infection Control"
    >
      <Stack spacing={2}>
        {/* Top Stat Tiles */}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
          }}
        >
          <StatTile
            label="Active Cases"
            value={cases.filter((item) => item.status === "Active").length}
            subtitle="Under investigation"
            icon={<BugReportIcon sx={{ fontSize: 24 }} />}
            tone="primary"
          />
          <StatTile
            label="Isolation Rooms"
            value={
              isolations.filter(
                (room) => room.status === "Active" || room.status === "Review",
              ).length
            }
            subtitle="Currently active"
            icon={<HealthAndSafetyIcon sx={{ fontSize: 24 }} />}
            tone="primary"
          />
          <StatTile
            label="Alerts"
            value={tabCounts.notify}
            subtitle="Need attention"
            icon={<WarningAmberIcon sx={{ fontSize: 24 }} />}
            tone="primary"
          />
          <StatTile
            label="Compliance"
            value="92%"
            subtitle="Last 7 days"
            icon={<CheckCircleIcon sx={{ fontSize: 24 }} />}
            tone="primary"
          />
        </Box>

        {/* Tabs and Flow content */}
        <CustomCardTabs
          items={tabItems}
          // showBackground={true}
          defaultValue={FLOW_TAB_IDS.indexOf(activeTab)}
          sticky={true}
          onChange={(index) => {
            setActiveTab(FLOW_TAB_IDS[index]);
          }}
          // tabsSx={{
          //   mb: 1,
          //   "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
          // }}
        />
      </Stack>

      <CaseDialog
        open={caseDialogOpen}
        onClose={() => setCaseDialogOpen(false)}
        handleCreateCase={handleCreateCase}
        canWrite={canWrite}
      />

      <CaseDetailDialog
        open={caseDetailOpen}
        onClose={() => setCaseDetailOpen(false)}
        selectedCase={selectedCase}
        CASE_EXTRA={CASE_EXTRA}
        CASE_DETAIL_EVENTS={CASE_DETAIL_EVENTS}
        canWrite={canWrite}
        setActiveTab={setActiveTab}
        setAuditDialogOpen={setAuditDialogOpen}
        openCloseCaseDialog={openCloseCaseDialog}
        setCaseDetailOpen={setCaseDetailOpen}
      />

      <IsolateDialog
        open={isolateDialogOpen}
        onClose={() => setIsolateDialogOpen(false)}
        isolateCaseId={isolateCaseId}
        onConfirmIsolation={handleConfirmIsolation}
        cases={cases}
        canWrite={canWrite}
        AVAILABLE_ISOLATION_ROOMS={AVAILABLE_ISOLATION_ROOMS}
        CASE_EXTRA={CASE_EXTRA}
      />

      <AuditDialog
        open={auditDialogOpen}
        onClose={() => setAuditDialogOpen(false)}
        cases={cases}
        onLogAudit={handleLogAudit}
        canWrite={canWrite}
      />

      <CloseCaseDialog
        open={closeCaseDialogOpen}
        onClose={() => setCloseCaseDialogOpen(false)}
        closeCaseId={closeCaseId}
        cases={cases}
        onConfirmCloseCase={handleConfirmCloseCase}
        canWrite={canWrite}
      />

      <PatientWorkflowMenu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        mrn={menuMrn}
        router={router}
        canNavigate={canNavigate}
      />
    </PageTemplate>
  );
}
