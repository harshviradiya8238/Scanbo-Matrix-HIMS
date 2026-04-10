"use client";

import * as React from "react";
import {
  Alert,
  Stack,
} from "@/src/ui/components/atoms";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { CalculatedAnalysisDialog } from "./components/CalculatedAnalysisDialog";
import { CalculatedAnalysesHeader } from "./components/CalculatedAnalysesHeader";
import { CalculatedAnalysesTable } from "./components/CalculatedAnalysesTable";
import { DUMMY_DATA } from "./data";
import type { CalculatedAnalysis } from "./types";

export default function CalculatedAnalysesPage() {
  const [data, setData] = React.useState(DUMMY_DATA);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] =
    React.useState<CalculatedAnalysis | null>(null);
  const [formData, setFormData] = React.useState<Partial<CalculatedAnalysis>>({
    status: "Active",
  });

  const handleOpenModal = React.useCallback((item?: CalculatedAnalysis) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ status: "Active" });
    }
    setModalOpen(true);
  }, []);

  const handleCloseModal = React.useCallback(() => setModalOpen(false), []);

  const handleSave = React.useCallback(() => {
    if (editingItem) {
      setData((prev) =>
        prev.map((it) =>
          it.id === editingItem.id ? { ...it, ...formData } : it,
        ),
      );
    } else {
      const newItem = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      } as CalculatedAnalysis;
      setData((prev) => [...prev, newItem]);
    }
    setModalOpen(false);
  }, [editingItem, formData]);

  const handleDelete = React.useCallback((id: string) => {
    if (window.confirm("Are you sure you want to delete this calculation?")) {
      setData((prev) => prev.filter((it) => it.id !== id));
    }
  }, []);

  return (
    <PageTemplate
      title="Calculated Analyses"
      subtitle="Define and manage auto-calculated laboratory tests"
    >
      <Stack spacing={1.25}>
        <Alert
          severity="info"
          sx={{
            fontWeight: 500,
            borderRadius: 1,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          Formulas auto-calculate when dependent analyte results are saved. Use
          analyte keywords in the expression (e.g. Na - Cl - HCO3).
        </Alert>

        <CalculatedAnalysesHeader onAdd={handleOpenModal} />

        <CalculatedAnalysesTable
          data={data}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
        />
      </Stack>

      <CalculatedAnalysisDialog
        open={modalOpen}
        editingItem={editingItem}
        formData={formData}
        onClose={handleCloseModal}
        onSave={handleSave}
        onFormDataChange={setFormData}
      />
    </PageTemplate>
  );
}
