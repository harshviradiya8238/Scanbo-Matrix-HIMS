"use client";

import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  GridInitialState,
  GridRowParams,
  GridValidRowModel,
} from "@mui/x-data-grid";
import { Box, Button, Stack, TextField, Typography } from "@/src/ui/components/atoms";

export type ToolbarConfig = {
  title?: string;
  showQuickFilter?: boolean;
  showColumns?: boolean;
  showFilters?: boolean;
  showDensity?: boolean;
  showExport?: boolean;
  showPrint?: boolean;
  showSavedViews?: boolean;
  emptyCtaLabel?: string;
  onEmptyCtaClick?: () => void;
};

export type CommonDataGridProps<R extends GridValidRowModel = GridValidRowModel> = {
  tableId?: string;
  persistKey?: string;
  rows: readonly R[];
  columns: readonly GridColDef<R>[];
  tableHeight?: number | string;
  autoHeight?: boolean;
  rowHeight?: number;
  pageSizeOptions?: number[];
  initialState?: (GridInitialState & {
    paginationModel?: { page: number; pageSize: number };
  }) | undefined;
  onRowClick?: (params: GridRowParams<R>) => void;
  checkboxSelection?: boolean;
  toolbarConfig?: ToolbarConfig;
  slotProps?: any;
  disableRowSelectionOnClick?: boolean;
  getRowId?: (row: R) => string | number;
};

export type CommonDataGridState = {
  paginationModel?: { page: number; pageSize: number };
};

export type DataGridQuery = {
  paginationModel?: { page: number; pageSize: number };
};

type DataTableProps<R extends GridValidRowModel = GridValidRowModel> =
  CommonDataGridProps<R>;

export default function DataTable<R extends GridValidRowModel = GridValidRowModel>({
  tableHeight = 420,
  autoHeight = false,
  rowHeight = 52,
  pageSizeOptions = [10, 25, 50],
  checkboxSelection = false,
  disableRowSelectionOnClick = true,
  toolbarConfig,
  initialState,
  rows,
  columns,
  ...props
}: DataTableProps<R>) {
  const [quickFilterValue, setQuickFilterValue] = React.useState("");

  const normalizedInitialState = React.useMemo(() => {
    if (!initialState) return undefined;

    const withLegacyPagination = initialState.paginationModel
      ? {
          ...initialState,
          pagination: {
            ...(initialState.pagination ?? {}),
            paginationModel: initialState.paginationModel,
          },
        }
      : initialState;

    return withLegacyPagination as GridInitialState;
  }, [initialState]);

  const filterModel = React.useMemo<GridFilterModel | undefined>(() => {
    if (!toolbarConfig?.showQuickFilter) return undefined;
    const value = quickFilterValue.trim();
    if (!value) return undefined;
    return { items: [], quickFilterValues: [value] };
  }, [quickFilterValue, toolbarConfig?.showQuickFilter]);

  return (
    <Box sx={{ width: "100%", height: autoHeight ? "auto" : tableHeight }}>
      {toolbarConfig ? (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          sx={{ p: 1 }}
        >
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            {toolbarConfig.title ? (
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {toolbarConfig.title}
              </Typography>
            ) : null}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {toolbarConfig.showQuickFilter ? (
              <TextField
                size="small"
                placeholder="Search..."
                value={quickFilterValue}
                onChange={(event) => setQuickFilterValue(event.target.value)}
                sx={{ minWidth: { xs: "100%", sm: 240 } }}
              />
            ) : null}
            {toolbarConfig.emptyCtaLabel ? (
              <Button
                size="small"
                variant="contained"
                onClick={toolbarConfig.onEmptyCtaClick}
              >
                {toolbarConfig.emptyCtaLabel}
              </Button>
            ) : null}
          </Stack>
        </Stack>
      ) : null}
      <DataGrid<R>
        {...props}
        rows={rows}
        columns={columns}
        initialState={normalizedInitialState}
        filterModel={filterModel}
        autoHeight={autoHeight}
        rowHeight={rowHeight}
        pageSizeOptions={pageSizeOptions}
        checkboxSelection={checkboxSelection}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
      />
    </Box>
  );
}
