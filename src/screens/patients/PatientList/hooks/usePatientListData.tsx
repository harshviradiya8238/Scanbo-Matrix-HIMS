"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/core/auth/UserContext";
import { patientData, PatientRow } from "@/src/mocks/patientServer";

export type PatientListData = ReturnType<typeof usePatientListData>;

export function usePatientListData() {
  const router = useRouter();
  const { role } = useUser();
  const isDoctor = role === "DOCTOR" || role === "ADMIN";

  const [filteredRows, setFilteredRows] =
    React.useState<PatientRow[]>(patientData);
  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] =
    React.useState<PatientRow | null>(null);
  const [snackbar, setSnackbar] = React.useState<string | null>(null);
  const [actionMenu, setActionMenu] = React.useState<{
    anchor: HTMLElement;
    row: PatientRow;
  } | null>(null);
  const [confirmAction, setConfirmAction] = React.useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const [columnsDialogOpen, setColumnsDialogOpen] = React.useState(false);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);
  const [columnVisModel, setColumnVisModel] = React.useState<
    Record<string, boolean>
  >({});

  const [filters, setFilters] = React.useState({
    status: "All",
    gender: "All",
    ageRange: [0, 100],
    regDateFrom: "",
    regDateTo: "",
    lastVisitFrom: "",
    lastVisitTo: "",
    department: "All",
    doctor: "All",
    tags: [] as string[],
  });

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    row: PatientRow,
  ) => {
    setActionMenu({ anchor: event.currentTarget, row });
  };

  const handleMenuClose = () => {
    setActionMenu(null);
  };

  const handleMenuNavigate = (path: string) => {
    if (actionMenu) {
      router.push(`${path}?mrn=${actionMenu.row.mrn}`);
    }
    handleMenuClose();
  };

  const resetFilters = () => {
    setFilters({
      status: "All",
      gender: "All",
      ageRange: [0, 100],
      regDateFrom: "",
      regDateTo: "",
      lastVisitFrom: "",
      lastVisitTo: "",
      department: "All",
      doctor: "All",
      tags: [],
    });
    setFilteredRows(patientData);
  };

  const toggleColumn = (field: string) => {
    setColumnVisModel((prev) => ({
      ...prev,
      [field]: prev[field] === false,
    }));
  };

  const applyColumnVisModel = (
    model: Record<string, boolean>,
    order: string[],
  ) => {
    setColumnVisModel(model);
    setColumnOrder(order);
  };

  return {
    isDoctor,
    router,
    filteredRows,
    filterDrawerOpen,
    setFilterDrawerOpen,
    detailsOpen,
    setDetailsOpen,
    selectedPatient,
    setSelectedPatient,
    snackbar,
    setSnackbar,
    actionMenu,
    handleMenuClose,
    handleMenuNavigate,
    confirmAction,
    setConfirmAction,
    handleMenuOpen,
    columnsDialogOpen,
    setColumnsDialogOpen,
    draggedIndex,
    setDraggedIndex,
    columnOrder,
    setColumnOrder,
    columnVisModel,
    setColumnVisModel,
    toggleColumn,
    applyColumnVisModel,
    filters,
    setFilters,
    resetFilters,
  };
}
