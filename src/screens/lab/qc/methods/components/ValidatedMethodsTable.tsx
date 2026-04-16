"use client";

import * as React from "react";
import { Box } from "@/src/ui/components/atoms";
import CommonDataGrid from "@/src/components/table/CommonDataGrid";
import CommonTabs from "@/src/ui/components/molecules/CommonTabs";
import { METHOD_TABS } from "../data";
import { getValidatedMethodColumns } from "../validatedMethodColumns";
import type { ValidatedMethod } from "../types";

interface ValidatedMethodsTableProps {
  data: ValidatedMethod[];
  activeTab: string;
  onTabChange: (value: string) => void;
  onEdit: (item: ValidatedMethod) => void;
  onDelete: (id: string) => void;
}

const getValidatedMethodRowId = (row: ValidatedMethod) => row.id;

function ValidatedMethodsTableBase({
  data,
  activeTab,
  onTabChange,
  onEdit,
  onDelete,
}: ValidatedMethodsTableProps) {
  const columns = React.useMemo(
    () => getValidatedMethodColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  const toolbarRight = React.useMemo(
    () => (
      <CommonTabs
        tabs={METHOD_TABS}
        value={activeTab}
        onChange={onTabChange}
      />
    ),
    [activeTab, onTabChange],
  );

  return (
    <CommonDataGrid
      rows={data}
      columns={columns}
      getRowId={getValidatedMethodRowId}
      toolbarRight={toolbarRight}
    />
  );
}

export const ValidatedMethodsTable = React.memo(ValidatedMethodsTableBase);
