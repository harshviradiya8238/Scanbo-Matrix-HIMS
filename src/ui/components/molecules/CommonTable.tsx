'use client';

import * as React from 'react';
import { Search as SearchIcon } from '@mui/icons-material';
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
  TextField,
  Typography,
} from '@/src/ui/components/atoms';
import { alpha } from '@/src/ui/theme';
import type { Theme } from '@/src/ui/theme';

type TableCellAlign = 'inherit' | 'left' | 'center' | 'right' | 'justify';

export interface CommonTableColumn<RowType> {
  id: string;
  label: string;
  align?: TableCellAlign;
  minWidth?: number;
  width?: number | string;
  renderCell: (row: RowType) => React.ReactNode;
}

export interface CommonTableFilterOption {
  label: string;
  value: string;
}

export interface CommonTableFilter<RowType> {
  id: string;
  label: string;
  options: CommonTableFilterOption[];
  getValue: (row: RowType) => string;
  defaultValue?: string;
  allValue?: string;
  minWidth?: number;
}

interface CommonTableProps<RowType> {
  rows: RowType[];
  columns: CommonTableColumn<RowType>[];
  getRowId: (row: RowType) => string;
  emptyMessage?: string;
  searchBy?: (row: RowType) => string;
  searchPlaceholder?: string;
  filters?: CommonTableFilter<RowType>[];
  initialRowsPerPage?: number;
  rowsPerPageOptions?: number[];
}

function resolveFilterDefault<RowType>(filter: CommonTableFilter<RowType>): string {
  if (filter.defaultValue !== undefined) return filter.defaultValue;
  if (filter.allValue !== undefined) return filter.allValue;
  return 'all';
}

const scanboTextFieldSx = {
  '& .MuiInputLabel-root': {
    fontSize: 13,
    fontWeight: 600,
    color: 'text.secondary',
  },
  '& .MuiInputBase-input, & .MuiSelect-select': {
    fontSize: 14,
    fontWeight: 500,
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.5,
    backgroundColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.04),
    '& fieldset': {
      borderColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.2),
    },
    '&:hover fieldset': {
      borderColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.5),
    },
    '&.Mui-focused': {
      backgroundColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.08),
      boxShadow: (theme: Theme) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
    },
  },
};

export default function CommonTable<RowType>({
  rows,
  columns,
  getRowId,
  emptyMessage = 'No records found.',
  searchBy,
  searchPlaceholder = 'Search records...',
  filters = [],
  initialRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25],
}: CommonTableProps<RowType>) {
  const hasSearch = Boolean(searchBy);
  const hasFilters = filters.length > 0;
  const safeRowsPerPageOptions = rowsPerPageOptions.includes(initialRowsPerPage)
    ? rowsPerPageOptions
    : [initialRowsPerPage, ...rowsPerPageOptions].sort((a, b) => a - b);

  const [searchValue, setSearchValue] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    filters.forEach((filter) => {
      initial[filter.id] = resolveFilterDefault(filter);
    });
    return initial;
  });

  React.useEffect(() => {
    setFilterValues((prev) => {
      const next: Record<string, string> = {};
      let changed = false;

      filters.forEach((filter) => {
        const fallbackValue = resolveFilterDefault(filter);
        const resolvedValue = prev[filter.id] ?? fallbackValue;
        next[filter.id] = resolvedValue;
        if (resolvedValue !== prev[filter.id]) {
          changed = true;
        }
      });

      const removedKey = Object.keys(prev).some((key) => !(key in next));
      if (!changed && !removedKey) return prev;
      return next;
    });
  }, [filters]);

  const filteredRows = React.useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return rows.filter((row) => {
      if (query && searchBy) {
        const searchableText = String(searchBy(row) ?? '').toLowerCase();
        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return filters.every((filter) => {
        const selectedValue = filterValues[filter.id] ?? resolveFilterDefault(filter);
        const allValue = filter.allValue ?? 'all';
        if (selectedValue === allValue) return true;
        return filter.getValue(row) === selectedValue;
      });
    });
  }, [rows, searchValue, searchBy, filters, filterValues]);

  React.useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredRows.length / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filteredRows.length, page, rowsPerPage]);

  const paginatedRows = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  return (
    <Stack spacing={1.25}>
      {hasSearch || hasFilters ? (
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', lg: 'flex-start' }}
          sx={{ width: '100%' }}
        >
          {hasSearch ? (
            <TextField
              size="small"
              fullWidth
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
                setPage(0);
              }}
              sx={{
                ...scanboTextFieldSx,
                flex: hasFilters ? 1.1 : 1,
                minWidth: { xs: '100%', lg: hasFilters ? 320 : 0 },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          ) : null}

          {hasFilters ? (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{
                width: '100%',
                flex: hasSearch ? 2 : 1,
                flexWrap: 'wrap',
              }}
            >
              {filters.map((filter) => (
                <TextField
                  key={filter.id}
                  size="small"
                  fullWidth
                  select
                  label={filter.label}
                  value={filterValues[filter.id] ?? resolveFilterDefault(filter)}
                  onChange={(event) => {
                    const value = event.target.value;
                    setFilterValues((prev) => ({ ...prev, [filter.id]: value }));
                    setPage(0);
                  }}
                  sx={{
                    ...scanboTextFieldSx,
                    flex: 1,
                    minWidth: { xs: '100%', sm: filter.minWidth ?? 170 },
                  }}
                >
                  {filter.options.map((option) => (
                    <MenuItem key={`${filter.id}-${option.value}`} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              ))}
            </Stack>
          ) : null}
        </Stack>
      ) : null}

      <TableContainer sx={{ border: 0, borderRadius: 2, boxShadow: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{
                    fontWeight: 700,
                    minWidth: column.minWidth,
                    width: column.width,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) => {
              const rowId = getRowId(row);
              return (
                <TableRow
                  key={rowId}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.03),
                    },
                    '& .MuiTableCell-root': {
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell key={`${rowId}-${column.id}`} align={column.align}>
                      {column.renderCell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}

            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Box>
        <TablePagination
          component="div"
          count={filteredRows.length}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={safeRowsPerPageOptions}
          sx={{
            '& .MuiTablePagination-toolbar': {
              px: 0,
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              m: 0,
            },
          }}
        />
      </Box>
    </Stack>
  );
}
