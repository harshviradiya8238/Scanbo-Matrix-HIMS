"use client";

import * as React from "react";
import {
  Box,
  InputAdornment,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Paper,
} from "@/src/ui/components/atoms";
import { SxProps, Theme } from "@/src/ui/theme";
import { Search as SearchIcon } from "@mui/icons-material";
import { DataGridProps } from "@mui/x-data-grid";

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
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function CommonDataGrid<R extends object>({
  columns,
  rows,
  getRowId,
  loading = false,
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
}: CommonDataGridProps<R>) {
  const [internalSearch, setInternalSearch] = React.useState("");
  const search = externalSearchValue ?? internalSearch;
  const setSearch = onSearchChange ?? setInternalSearch;

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(defaultRowsPerPage);

  /* ── client-side search ── */
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const fields = searchFields ?? Object.keys(row);
      return fields.some((field) => {
        const val = (row as Record<string, unknown>)[field];
        if (val == null) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [rows, search, searchFields]);

  const paginated = filtered.slice(
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

  const rowKey = (row: R, index: number) => (getRowId ? getRowId(row) : index);

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
        </Stack>
      )}

      {/* ── Table ── */}
      <TableContainer sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
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
              {columns.map((col) => (
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
                  {col.renderHeader ? col.renderHeader() : col.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  {showSerialNo && (
                    <TableCell sx={{ py: 1.6, px: 2 }}>
                      <Skeleton variant="text" width={20} />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.field} sx={{ py: 1.6, px: 2 }}>
                      <Skeleton variant="rounded" height={28} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (showSerialNo ? 1 : 0)}
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
                  {columns.map((col) => (
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
        count={filtered.length}
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
    </Paper>
  );
}
