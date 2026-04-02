"use client";

import * as React from "react";
import { usePatientListData } from "./hooks/usePatientListData";
import {
  getPatientListColumns,
  ActionMenuItems,
} from "./components/PatientDataTable";
import { FilterDrawer } from "./components/FilterDrawer";
import { PatientDetailsDrawer } from "./components/PatientDetailsDrawer";
import { ColumnVisibilityDialog } from "./components/ColumnVisibilityDialog";
import {
  Box,
  Button,
  Chip,
  Drawer,
  Menu,
  Snackbar,
  Alert,
  Stack,
  Typography,
} from "@/src/ui/components/atoms";
import {
  Card,
  CommonDialog,
  StatTile,
  WorkspaceHeaderCard,
} from "@/src/ui/components/molecules";
import {
  Add as AddIcon,
  AssignmentLate as AssignmentLateIcon,
  FilterList as FilterListIcon,
  Hotel as HotelIcon,
  PeopleAlt as PeopleAltIcon,
  PersonAddAlt as PersonAddAltIcon,
} from "@mui/icons-material";
import CommonDataGrid from "@/src/components/table/CommonDataGrid";
import { alpha, useTheme } from "@/src/ui/theme";
import { patientMetrics, PatientRow } from "@/src/mocks/patientServer";

export default function PatientListPage() {
  const theme = useTheme();
  const data = usePatientListData();
  const {
    isDoctor,
    router,
    filteredRows,
    filterDrawerOpen,
    setFilterDrawerOpen,
    detailsOpen,
    setDetailsOpen,
    setSelectedPatient,
    snackbar,
    setSnackbar,
    actionMenu,
    handleMenuClose,
    handleMenuNavigate,
    confirmAction,
    setConfirmAction,
    handleMenuOpen,
    columnOrder,
    setColumnOrder,
    setColumnVisModel,
    resetFilters,
  } = data;

  const columns = React.useMemo(
    () => getPatientListColumns(theme, handleMenuOpen),
    [theme, handleMenuOpen],
  );

  React.useEffect(() => {
    try {
      const key = "scanbo:grid:patient-list-v2";
      const persisted =
        typeof window !== "undefined" ? localStorage.getItem(key) : null;
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (parsed?.columnVisibilityModel) {
          setColumnVisModel(parsed.columnVisibilityModel);
        }
        if (parsed?.columnOrder) {
          setColumnOrder(parsed.columnOrder);
        }
        if (parsed?.columnVisibilityModel || parsed?.columnOrder) return;
      }
    } catch {
      // ignore
    }

    if (columnOrder.length === 0) {
      const defaultOrder = columns.map((column) => column.field);
      setColumnOrder(defaultOrder);
      setColumnVisModel(
        defaultOrder.reduce(
          (acc, field) => ({ ...acc, [field]: true }),
          {} as Record<string, boolean>,
        ),
      );
    }
  }, [columns]);

  const statCards = [
    {
      label: "Total Patients",
      value: patientMetrics.total,
      tone: "primary",
      Icon: PeopleAltIcon,
    },
    {
      label: "Today Registrations",
      value: patientMetrics.todayRegistrations,
      tone: "success",
      Icon: PersonAddAltIcon,
    },
    {
      label: "Pending Bills",
      value: patientMetrics.pendingBills,
      tone: "warning",
      Icon: AssignmentLateIcon,
    },
    {
      label: "Admitted",
      value: patientMetrics.admitted,
      tone: "primary",
      Icon: HotelIcon,
    },
  ] as const;

  return (
    <Box sx={{ px: 3, py: 3 }}>
      <WorkspaceHeaderCard sx={{ mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 0.8, sm: 1.25 }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              sx={{ mb: 0.6 }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Patients
              </Typography>
              {!isDoctor && (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip size="small" color="primary" label="Patient Registry" />
                  <Chip
                    size="small"
                    color="info"
                    variant="outlined"
                    label="OPD + IPD Linked"
                  />
                </Stack>
              )}
            </Stack>
            {!isDoctor && (
              <Typography variant="body2" color="text.secondary">
                Manage patient demographics, visits, admissions, and billing
                status in one place.
              </Typography>
            )}
          </Box>
          <Stack
            direction="row"
            spacing={1.25}
            flexWrap="wrap"
            alignItems="center"
          >
            {!isDoctor && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push("/patients/registration")}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow:
                    "0 4px 12px " + alpha(theme.palette.primary.main, 0.25),
                }}
              >
                Register Patient
              </Button>
            )}
          </Stack>
        </Stack>
      </WorkspaceHeaderCard>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          mt: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        {statCards.map((stat) => (
          <StatTile
            key={stat.label}
            label={stat.label}
            value={stat.value}
            tone={stat.tone}
            icon={<stat.Icon sx={{ fontSize: 28 }} />}
          />
        ))}
      </Box>

      <Card sx={{ mt: 2 }}>
        <CommonDataGrid<PatientRow>
          columns={columns}
          rows={filteredRows}
          getRowId={(row) => row.mrn}
          searchPlaceholder="Search..."
          searchFields={["mrn", "name", "phone", "city", "department"]}
          showSerialNo={true}
          disableRowPointer={true}
          onRowClick={(row) => {
            if (isDoctor) {
              setSelectedPatient(row);
              setDetailsOpen(true);
            }
          }}
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

        <ColumnVisibilityDialog data={data} columns={columns} />
      </Card>

      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <FilterDrawer data={data} />
      </Drawer>

      <Drawer
        anchor="right"
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      >
        <PatientDetailsDrawer data={data} />
      </Drawer>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="info" onClose={() => setSnackbar(null)}>
          {snackbar}
        </Alert>
      </Snackbar>

      <CommonDialog
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.title}
        description={confirmAction?.description}
        confirmLabel="Confirm"
        confirmColor="error"
        onConfirm={() => {
          confirmAction?.onConfirm();
          setConfirmAction(null);
        }}
      />

      <Menu
        anchorEl={actionMenu?.anchor}
        open={Boolean(actionMenu)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            width: 220,
            mt: 0.5,
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            borderRadius: 2.5,
            "& .MuiMenuItem-root": {
              py: 1.2,
              px: 2,
              gap: 1.5,
              fontSize: "0.875rem",
              fontWeight: 500,
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                color: "primary.main",
                "& .MuiListItemIcon-root": { color: "primary.main" },
              },
            },
          },
        }}
      >
        <ActionMenuItems data={data} handleMenuNavigate={handleMenuNavigate} />
      </Menu>
    </Box>
  );
}
