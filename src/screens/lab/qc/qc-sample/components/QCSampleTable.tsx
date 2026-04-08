"use client";

import * as React from "react";
import CommonDataGrid from "@/src/components/table/CommonDataGrid";
import { MOCK_QC } from "../data";
import { QC_SAMPLE_COLUMNS } from "../qcSampleColumns";
import type { QCSample } from "../types";

const getQCSampleRowId = (row: QCSample) => row.id;

function QCSampleTableBase() {
  return (
    <CommonDataGrid<QCSample>
      rows={MOCK_QC}
      columns={QC_SAMPLE_COLUMNS}
      getRowId={getQCSampleRowId}
      hideSearch={false}
    />
  );
}

export const QCSampleTable = React.memo(QCSampleTableBase);
