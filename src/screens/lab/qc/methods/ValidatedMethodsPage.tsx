"use client";

import * as React from "react";
import { Stack } from "@/src/ui/components/atoms";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { DUMMY_DATA } from "./data";
import { ValidatedMethodDialog } from "./components/ValidatedMethodDialog";
import { ValidatedMethodsHeader } from "./components/ValidatedMethodsHeader";
import { ValidatedMethodsTable } from "./components/ValidatedMethodsTable";
import type { ValidatedMethod } from "./types";

export default function ValidatedMethodsPage() {
  const [data, setData] = React.useState(DUMMY_DATA);
  const [activeTab, setActiveTab] = React.useState("All");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ValidatedMethod | null>(
    null,
  );
  const [formData, setFormData] = React.useState<Partial<ValidatedMethod>>({
    status: "Active",
  });

  const handleOpenModal = React.useCallback((item?: ValidatedMethod) => {
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
      } as ValidatedMethod;
      setData((prev) => [...prev, newItem]);
    }
    setModalOpen(false);
  }, [editingItem, formData]);

  const handleDelete = React.useCallback((id: string) => {
    if (window.confirm("Are you sure you want to delete this method?")) {
      setData((prev) => prev.filter((it) => it.id !== id));
    }
  }, []);

  const filteredData = React.useMemo(() => {
    if (activeTab === "All") return data;
    return data.filter((it) => it.department === activeTab);
  }, [data, activeTab]);

  return (
    <PageTemplate
      title="Validated Methods"
      subtitle="Manage validated analytical methods and standards"
    >
      <Stack spacing={1.25}>
        <ValidatedMethodsHeader onAdd={handleOpenModal} />

        <ValidatedMethodsTable
          data={filteredData}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
        />
      </Stack>

      <ValidatedMethodDialog
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
