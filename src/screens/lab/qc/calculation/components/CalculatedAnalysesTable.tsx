"use client";

import * as React from "react";
import { Box } from "@/src/ui/components/atoms";
import CommonDataGrid from "@/src/components/table/CommonDataGrid";
import { getCalculatedAnalysisColumns } from "../calculatedAnalysisColumns";
import type { CalculatedAnalysis } from "../types";

interface CalculatedAnalysesTableProps {
  data: CalculatedAnalysis[];
  onEdit: (item: CalculatedAnalysis) => void;
  onDelete: (id: string) => void;
}

const getCalculatedAnalysisRowId = (row: CalculatedAnalysis) => row.id;

function CalculatedAnalysesTableBase({
  data,
  onEdit,
  onDelete,
}: CalculatedAnalysesTableProps) {
  const columns = React.useMemo(
    () => getCalculatedAnalysisColumns({ onEdit, onDelete }),
    [onEdit, onDelete],
  );

  return (
    <CommonDataGrid
      rows={data}
      columns={columns}
      getRowId={getCalculatedAnalysisRowId}
    />
  );
}

export const CalculatedAnalysesTable = React.memo(CalculatedAnalysesTableBase);
