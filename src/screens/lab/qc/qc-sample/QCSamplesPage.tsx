"use client";

import * as React from "react";
import { Stack } from "@/src/ui/components/atoms";
import PageTemplate from "@/src/ui/components/PageTemplate";
import { QCSampleDialog } from "./components/dialogs/QCSampleDialog";
import { QCSamplesHeader } from "./components/QCSamplesHeader";
import { QCSampleTable } from "./components/QCSampleTable";
import { QCTrendChart } from "./components/QCTrendChart";
import type { QCSampleView } from "./types";

export default function QCSamplesPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [activeView, setActiveView] = React.useState<QCSampleView>("list");

  const handleOpenModal = React.useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = React.useCallback(() => setIsModalOpen(false), []);
  const handleShowList = React.useCallback(() => setActiveView("list"), []);
  const handleShowVisual = React.useCallback(() => setActiveView("visual"), []);

  return (
    <PageTemplate title="Quality Control Console" currentPageTitle="QC Samples">
      <Stack spacing={1.25}>
        <QCSamplesHeader
          activeView={activeView}
          onShowList={handleShowList}
          onShowVisual={handleShowVisual}
          onAddSample={handleOpenModal}
        />

        {activeView === "list" ? <QCSampleTable /> : <QCTrendChart />}
      </Stack>

      <QCSampleDialog open={isModalOpen} onClose={handleCloseModal} />
    </PageTemplate>
  );
}
