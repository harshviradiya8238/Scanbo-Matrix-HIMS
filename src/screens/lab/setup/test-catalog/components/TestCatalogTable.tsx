"use client";

import * as React from "react";
import CommonDataGrid from "@/src/components/table/CommonDataGrid";
import { TEST_CATALOG_COLUMNS } from "../testCatalogColumns";
import type { AnalysisService } from "../types";

interface TestCatalogTableProps {
  rows: AnalysisService[];
}

const getAnalysisServiceRowId = (row: AnalysisService) => row.id;

function TestCatalogTableBase({ rows }: TestCatalogTableProps) {
  return (
    <CommonDataGrid<AnalysisService>
      rows={rows}
      columns={TEST_CATALOG_COLUMNS}
      getRowId={getAnalysisServiceRowId}
      hideSearch={false}
      searchPlaceholder="Search analysis services..."
    />
  );
}

export const TestCatalogTable = React.memo(TestCatalogTableBase);
