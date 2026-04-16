"use client";

import * as React from "react";
import {
  Box,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  Paper,
  Tooltip,
  IconButton,
} from "@/src/ui/components/atoms";
import { Search as SearchIcon, ViewColumn as ViewColumnIcon } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import ColumnManagementDialog from "./ColumnManagementDialog";
import { DataGridProps } from "@mui/x-data-grid";
import {
  AppLoaderOverlay,
  TableSkeletonRows,
  useMinimumLoaderVisibility,
} from "@/src/ui/components/loaders/LoaderPrimitives";

/* ─── Column Definition ──────────────────────────────────────────────────── */

export type CommonColumn<R> = {
  field: string;
  headerName: string;
  width?: number | string;
  flex?: number;
  align?: "left" | "center" | "right";
  renderCell?: (row: R) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  valueGetter?: (row: R) => string | number | null | undefined;
  sortable?: boolean;
};

/* ─── Filter Dropdown ────────────────────────────────────────────────────── */

export type FilterDropdown = {
  id: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

/* ─── Props ──────────────────────────────────────────────────────────────── */

export type CommonDataGridProps<R extends object> = {
  columns: CommonColumn<R>[];
  rows: R[];
  tableHeight?: number | string;
  autoHeight?: boolean;
  rowHeight?: number;
  pageSizeOptions?: number[];
  localeText?: DataGridProps["localeText"];

  /** Returns a stable unique key per row; defaults to array index */
  getRowId?: (row: R) => string | number;
  loading?: boolean;
  loadingVariant?: "skeleton" | "overlay";
  loadingMessage?: string;
  loadingMinDurationMs?: number;
  /** Placeholder text inside the search input */
  searchPlaceholder?: string;
  /**
   * Which row fields to search across.
   * If omitted, all string/number fields on the row are searched.
   */
  searchFields?: string[];
  /** Configurable dropdown filters rendered in the toolbar */
  filterDropdowns?: FilterDropdown[];
  /** Callback fired when a row is clicked */
  onRowClick?: (row: R) => void;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Extra content rendered on the left side (after search) */
  toolbarLeft?: React.ReactNode;
  /** Extra content rendered on the right side of the toolbar */
  toolbarRight?: React.ReactNode;
  /** Whether to show a serial number column */
  showSerialNo?: boolean;
  /** Whether to hide the toolbar (search and filters) */
  hideToolbar?: boolean;
  /** External search value */
  externalSearchValue?: string;
  /** Callback when search changes */
  onSearchChange?: (value: string) => void;
  /** Whether to hide the search input */
  hideSearch?: boolean;
  /** Whether to disable the pointer cursor on rows */
  disableRowPointer?: boolean;
  /** Override styles on the root Paper wrapper */
  paperSx?: Record<string, unknown>;
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function CommonDataGrid<R extends object>({
  columns,
  rows,
  getRowId,
  loading = false,
  loadingVariant = "overlay",
  loadingMessage = "Loading records...",
  loadingMinDurationMs = 500,
  searchPlaceholder = "Search...",
  searchFields,
  filterDropdowns,
  onRowClick,
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your filters.",
  toolbarLeft,
  toolbarRight,
  showSerialNo = false,
  hideToolbar = false,
  externalSearchValue,
  onSearchChange,
  hideSearch = false,
  tableHeight,
  disableRowPointer = false,
  paperSx,
}: CommonDataGridProps<R>) {
  const [internalSearch, setInternalSearch] = React.useState("");
  const search = externalSearchValue ?? internalSearch;
  const setSearch = onSearchChange ?? setInternalSearch;

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(defaultRowsPerPage);
  const [orderBy, setOrderBy] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<"asc" | "desc">("asc");

  /* ── Column Management ── */
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>(() =>
    columns.reduce((acc, col) => ({ ...acc, [col.field]: true }), {})
  );
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    columns.map((col) => col.field)
  );
  const [isColumnPickerOpen, setIsColumnPickerOpen] = React.useState(false);

  // Sync state if columns prop changes significantly
  React.useEffect(() => {
    setColumnOrder(columns.map((col) => col.field));
    setColumnVisibility(columns.reduce((acc, col) => ({ ...acc, [col.field]: true }), {}));
  }, [columns]);

  const visibleColumns = React.useMemo(() => {
    return columnOrder
      .map((field) => columns.find((col) => col.field === field))
      .filter((col): col is CommonColumn<R> => !!col && columnVisibility[col.field] !== false);
  }, [columns, columnOrder, columnVisibility]);

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  /* ── processed rows (search + sort) ── */
  const processedRows = React.useMemo(() => {
    let result = [...rows];

    // Search
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((row) => {
        const fields = searchFields ?? Object.keys(row);
        return fields.some((field) => {
          const val = (row as Record<string, unknown>)[field];
          if (val == null) return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // Sort
    if (orderBy) {
      const col = visibleColumns.find((c) => c.field === orderBy);
      result.sort((a, b) => {
        let valA: any;
        let valB: any;

        if (col?.valueGetter) {
          valA = col.valueGetter(a);
          valB = col.valueGetter(b);
        } else {
          valA = (a as Record<string, any>)[orderBy];
          valB = (b as Record<string, any>)[orderBy];
        }

        if (valA === valB) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;

        // Custom string comparison for better sorting (case-insensitive)
        if (typeof valA === "string" && typeof valB === "string") {
          const compare = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
          return order === "asc" ? compare : -compare;
        }

        const compare = valA < valB ? -1 : 1;
        return order === "asc" ? compare : -compare;
      });
    }

    return result;
  }, [rows, search, searchFields, orderBy, order, columns]);

  const paginated = processedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  React.useEffect(() => {
    setPage(0);
  }, [search, rows]);

  const getCellValue = (row: R, col: CommonColumn<R>): React.ReactNode => {
    if (col.renderCell) return col.renderCell(row);
    if (col.valueGetter) {
      const v = col.valueGetter(row);
      return v != null ? String(v) : "—";
    }
    const v = (row as Record<string, unknown>)[col.field];
    return v != null ? String(v) : "—";
  };

  const handleApplyColumns = (visibility: Record<string, boolean>, order: string[]) => {
    setColumnVisibility(visibility);
    setColumnOrder(order);
    setIsColumnPickerOpen(false);
  };

  const handleResetColumns = () => {
    setColumnVisibility(columns.reduce((acc, col) => ({ ...acc, [col.field]: true }), {}));
    setColumnOrder(columns.map((col) => col.field));
  };

  const rowKey = (row: R, index: number) => (getRowId ? getRowId(row) : index);
  const visibleLoading = useMinimumLoaderVisibility(loading, loadingMinDurationMs);
  const isLoadingSkeleton = visibleLoading && loadingVariant === "skeleton";
  const isLoadingOverlay = visibleLoading && loadingVariant === "overlay";

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: "1px solid #DDE8F0",
        overflow: "hidden",
        boxShadow: "0 10px 28px rgba(10, 77, 104, 0.08)",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        ...paperSx,
      }}
    >
      {/* ── Toolbar ── */}
      {!hideToolbar && (
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          {toolbarLeft}

          {/* Search */}
          {!hideSearch && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: { xs: 1, md: 2 },
                maxWidth: { md: 600 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: "0.875rem",
                  bgcolor: "background.paper",
                },
              }}
            />
          )}

          <Box sx={{ flex: 1 }} />

          {/* Filter dropdowns */}
          {filterDropdowns?.map((fd) => (
            <TextField
              key={fd.id}
              select
              size="small"
              label={fd.placeholder}
              value={fd.value}
              onChange={(e) => fd.onChange(e.target.value as string)}
              sx={{
                minWidth: 130,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: "0.875rem",
                },
              }}
            >
              {fd.options.map((opt) => (
                <MenuItem key={opt} value={opt} sx={{ fontSize: "0.875rem" }}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          ))}

          {toolbarRight}

          <Tooltip title="Column Chooser">
            <IconButton
              size="small"
              onClick={() => setIsColumnPickerOpen(true)}
              sx={{
                bgcolor: alpha("#007FFF", 0.05),
                color: "primary.main",
                borderRadius: 2,
                "&:hover": { bgcolor: alpha("#007FFF", 0.1) },
              }}
            >
              <ViewColumnIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )}

      {/* ── Table ── */}
      <TableContainer sx={{ flex: 1, minHeight: 0, overflow: "auto", position: "relative" }}>
        <AppLoaderOverlay
          open={isLoadingOverlay}
          scope="section"
          message={loadingMessage}
        />
        <Table
          size="small"
          stickyHeader
        >
          {/* Headers */}
          <TableHead>
            <TableRow
              sx={{
                "& .MuiTableCell-head": {
                  backgroundColor: "#f9fafb",
                  borderBottom: "1px solid",
                  borderColor: "rgba(17, 114, 186, 0.07)",
                  py: 1.25,
                  px: 2,
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: "text.secondary",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  lineHeight: 1.4,
                  whiteSpace: "nowrap",
                },
              }}
            >
              {showSerialNo && <TableCell width={60}>Sr. No.</TableCell>}
              {visibleColumns.map((col) => (
                <TableCell
                  key={col.field}
                  align={col.align ?? "left"}
                  sortDirection={orderBy === col.field ? order : false}
                  sx={{
                    ...(col.flex
                      ? { width: "auto" }
                      : col.width
                        ? { width: col.width, minWidth: col.width }
                        : {}),
                    // Add pointer cursor if sortable
                    cursor: col.sortable !== false && col.field !== 'actions' ? "pointer" : "default",
                  }}
                >
                  {col.sortable !== false && col.field !== 'actions' ? (
                    <TableSortLabel
                      active={orderBy === col.field}
                      direction={orderBy === col.field ? order : "asc"}
                      onClick={() => handleSort(col.field)}
                      sx={{
                        "& .MuiTableSortLabel-icon": {
                          fontSize: "12px !important",
                          opacity: "1 !important",
                        },
                      }}
                    >
                      {col.renderHeader ? col.renderHeader() : col.headerName}
                    </TableSortLabel>
                  ) : (
                    col.renderHeader ? col.renderHeader() : col.headerName
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {isLoadingSkeleton ? (
              <TableSkeletonRows
                rowCount={rowsPerPage}
                columnCount={visibleColumns.length}
                showSerialNo={showSerialNo}
              />
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (showSerialNo ? 1 : 0)}
                  align="center"
                  sx={{ py: 6, border: 0 }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}
                  >
                    {emptyTitle}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {emptyDescription}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row, index) => (
                <TableRow
                  key={rowKey(row, index)}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor:
                      onRowClick && !disableRowPointer ? "pointer" : "default",
                    "& .MuiTableCell-body": {
                      py: 1.5,
                      px: 2,
                      borderBottom: "1px solid",
                      borderColor: "rgba(17, 114, 186, 0.07)",
                      verticalAlign: "middle",
                    },
                    "&:last-child .MuiTableCell-body": { borderBottom: 0 },
                    "&:hover": { backgroundColor: "#f8fafc" },
                  }}
                >
                  {showSerialNo && (
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        color: "text.secondary",
                        width: 60,
                      }}
                    >
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                  )}
                  {visibleColumns.map((col) => (
                    <TableCell
                      key={col.field}
                      align={col.align ?? "left"}
                      sx={
                        col.flex
                          ? { width: "auto" }
                          : col.width
                            ? { width: col.width, minWidth: col.width }
                            : {}
                      }
                    >
                      {getCellValue(row, col)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Pagination — always at bottom ── */}
      <TablePagination
        component="div"
        count={processedRows.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={rowsPerPageOptions}
        sx={{
          flexShrink: 0,
          borderTop: "1px solid",
          borderColor: "divider",
          "& .MuiTablePagination-toolbar": { fontSize: "0.8rem" },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            { fontSize: "0.8rem" },
        }}
      />
      <ColumnManagementDialog
        open={isColumnPickerOpen}
        onClose={() => setIsColumnPickerOpen(false)}
        columns={columns}
        columnVisibility={columnVisibility}
        columnOrder={columnOrder}
        onApply={handleApplyColumns}
        onReset={handleResetColumns}
      />
    </Paper>
  );
}
