"use client";

import * as React from "react";
import { Stack } from "@/src/ui/components/atoms";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { DepartmentDialog } from "./components/DepartmentDialog";
import { LabDepartmentsTable } from "./components/LabDepartmentsTable";
import { LabDepartmentsHeader } from "./components/LabDepartmentsHeader";
import { DUMMY_DATA } from "./data";
import type { Department } from "./types";

export default function LabDepartmentsPage() {
  const [departments, setDepartments] = React.useState(DUMMY_DATA);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingDept, setEditingDept] = React.useState<Department | null>(null);
  const [formData, setFormData] = React.useState<Partial<Department>>({
    status: "Active",
    iconType: "bio",
  });

  const handleOpenModal = React.useCallback((dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData(dept);
    } else {
      setEditingDept(null);
      setFormData({ status: "Active", iconType: "bio" });
    }
    setModalOpen(true);
  }, []);

  const handleCloseModal = React.useCallback(() => setModalOpen(false), []);

  const handleSave = React.useCallback(() => {
    if (editingDept) {
      setDepartments((prev) =>
        prev.map((d) => (d.id === editingDept.id ? { ...d, ...formData } : d)),
      );
    } else {
      setDepartments((prev) => [
        ...prev,
        {
          ...formData,
          id: Math.random().toString(36).substr(2, 9),
          testsToday: 0,
          tatCompliance: 0,
        } as Department,
      ]);
    }
    setModalOpen(false);
  }, [editingDept, formData]);

  return (
    <PageTemplate
      title="Laboratory Departments"
      subtitle="Configure and manage diagnostic departments"
      fullHeight
    >
      <Stack
        spacing={1.25}
        sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
      >
        <LabDepartmentsHeader onAdd={handleOpenModal} />

        <LabDepartmentsTable departments={departments} onEdit={handleOpenModal} />

        <DepartmentDialog
          open={modalOpen}
          editingDept={editingDept}
          formData={formData}
          onClose={handleCloseModal}
          onSave={handleSave}
          onFormDataChange={setFormData}
        />
      </Stack>
    </PageTemplate>
  );
}
