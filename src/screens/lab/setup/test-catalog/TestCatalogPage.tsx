"use client";

import * as React from "react";
import { Stack } from "@/src/ui/components/atoms";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { TestCatalogCategoryTabs } from "./components/TestCatalogCategoryTabs";
import { TestCatalogDialog } from "./components/TestCatalogDialog";
import { TestCatalogHeader } from "./components/TestCatalogHeader";
import { TestCatalogTable } from "./components/TestCatalogTable";
import { MOCK_SERVICES } from "./data";

export default function TestCatalogPage() {
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleOpenModal = React.useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = React.useCallback(() => setIsModalOpen(false), []);

  const filteredServices = React.useMemo(
    () =>
      MOCK_SERVICES.filter(
        (s) => activeCategory === "All" || s.category === activeCategory,
      ),
    [activeCategory],
  );

  return (
    <PageTemplate
      title="Analysis Service Catalog"
      currentPageTitle="Test Catalog"
    >
      <Stack spacing={1.25}>
        <TestCatalogHeader onAdd={handleOpenModal} />

        <TestCatalogCategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <TestCatalogTable rows={filteredServices} />
      </Stack>

      <TestCatalogDialog open={isModalOpen} onClose={handleCloseModal} />
    </PageTemplate>
  );
}
