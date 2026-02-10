'use client';

import * as React from 'react';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Paper,
} from '@/src/ui/components/atoms';
import EmptyState from '@/src/ui/components/molecules/EmptyState';
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridDensity,
  GridFilterModel,
  GridApi,
  GridPaginationModel,
  GridRowIdGetter,
  GridRowSelectionModel,
  GridSortModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
  GridValidRowModel,
  useGridApiRef,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Print as PrintIcon,
  Replay as ReplayIcon,
  Save as SaveIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';

const DataGridComponent = DataGrid;

export type DataGridQuery = {
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
  quickFilter?: string;
};

export type CommonDataGridState = {
  paginationModel?: GridPaginationModel;
  sortModel?: GridSortModel;
  filterModel?: GridFilterModel;
  columnVisibilityModel?: GridColumnVisibilityModel;
  density?: GridDensity;
  columnOrder?: string[];
  pinnedColumns?: any;
};

type ToolbarConfig = {
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

export type CommonDataGridProps<R extends GridValidRowModel> = {
  tableId: string;
  columns: GridColDef<R>[];
  rows: R[];
  tableHeight?: number | string;
  rowHeight?: number;
  getRowId?: GridRowIdGetter<R>;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  toolbarConfig?: ToolbarConfig;
  initialState?: CommonDataGridState;
  serverMode?: boolean;
  totalRowCount?: number;
  onQueryChange?: (query: DataGridQuery) => void;
  persistKey?: string;
  slots?: any;
  slotProps?: any;
  externalState?: CommonDataGridState | null;
  filterModel?: GridFilterModel;
  onFilterModelChange?: (model: GridFilterModel) => void;
  onRowClick?: (params: any) => void;
  renderBulkActions?: (params: {
    selection: GridRowSelectionModel;
    clearSelection: () => void;
  }) => React.ReactNode;
};

const getStorageKey = (tableId: string, persistKey?: string) =>
  `scanbo:grid:${persistKey ?? tableId}`;

const getViewsKey = (tableId: string, persistKey?: string) =>
  `scanbo:grid:${persistKey ?? tableId}:views`;

const safeParse = <T,>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const sanitizeFilterModel = (model?: GridFilterModel): GridFilterModel => {
  if (!model) return { items: [] };
  const items = model.items ?? [];
  return {
    ...model,
    items: items.length > 1 ? [items[0]] : items,
  };
};

const LoadingOverlay = () => (
  <Box sx={{ p: 3 }}>
    <Stack spacing={1.5}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={32} />
      ))}
    </Stack>
  </Box>
);

const ErrorOverlay = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <EmptyState
    title="Something went wrong"
    description={message}
    actionLabel={onRetry ? 'Retry' : undefined}
    onAction={onRetry}
    icon={<ReplayIcon />}
  />
);

const EmptyOverlay = ({
  title = 'No patients found',
  description = 'Try adjusting filters or add a new patient.',
  ctaLabel,
  onCta,
}: {
  title?: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
}) => (
  <EmptyState
    title={title}
    description={description}
    actionLabel={ctaLabel}
    onAction={onCta}
    icon={<AddIcon />}
  />
);

export default function CommonDataGrid<R extends GridValidRowModel>(
  props: CommonDataGridProps<R>
) {
  const {
    tableId,
    columns,
    rows,
    tableHeight = 640,
    rowHeight,
    getRowId,
    loading,
    error,
    onRetry,
    toolbarConfig,
    initialState,
    serverMode,
    totalRowCount,
    onQueryChange,
    persistKey,
    slots,
    slotProps,
    externalState,
    filterModel: filterModelProp,
    onFilterModelChange,
    onRowClick,
    renderBulkActions,
  } = props;

  const storageKey = React.useMemo(
    () => getStorageKey(tableId, persistKey),
    [tableId, persistKey]
  );
  const viewsKey = React.useMemo(
    () => getViewsKey(tableId, persistKey),
    [tableId, persistKey]
  );

  const apiRef = useGridApiRef();

  const [hydrated, setHydrated] = React.useState(false);
  const emptySelection: GridRowSelectionModel = React.useMemo(
    () => ({ type: 'include', ids: new Set() }),
    []
  );
  const normalizeSelection = React.useCallback((model: any): GridRowSelectionModel => {
    if (model?.ids instanceof Set) return model as GridRowSelectionModel;
    if (Array.isArray(model)) {
      return { type: 'include', ids: new Set(model) };
    }
    return { type: 'include', ids: new Set() };
  }, []);

  const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>(
    emptySelection
  );
  const [savedViews, setSavedViews] = React.useState<
    Array<{ id: string; name: string; state: CommonDataGridState }>
  >([]);
  const [viewsAnchor, setViewsAnchor] = React.useState<null | HTMLElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [viewName, setViewName] = React.useState('');

  const defaultState: CommonDataGridState = {
    paginationModel: { page: 0, pageSize: 25 },
    sortModel: [],
    filterModel: { items: [], quickFilterValues: [] },
    columnVisibilityModel: {},
    density: 'standard',
  };

  const [state, setState] = React.useState<CommonDataGridState>(() => ({
    ...defaultState,
    ...initialState,
  }));

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const persisted = safeParse<CommonDataGridState>(localStorage.getItem(storageKey));
    const persistedViews = safeParse<Array<{ id: string; name: string; state: CommonDataGridState }>>(
      localStorage.getItem(viewsKey)
    );
    if (persisted) {
      setState((prev) => ({ ...prev, ...persisted }));
    }
    if (persistedViews) {
      setSavedViews(persistedViews);
    }
    setHydrated(true);
  }, [storageKey, viewsKey]);

  React.useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [hydrated, state, storageKey]);

  React.useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    localStorage.setItem(viewsKey, JSON.stringify(savedViews));
  }, [hydrated, savedViews, viewsKey]);

  React.useEffect(() => {
    if (!externalState) return;
    setState((prev) => ({ ...prev, ...externalState }));
  }, [externalState]);

  React.useEffect(() => {
    if (!state.columnOrder || state.columnOrder.length === 0) return;
    const api = apiRef.current;
    if (!api) return;
    const setColumnIndex = (api as GridApi & { setColumnIndex?: (field: string, index: number) => void })
      .setColumnIndex;
    if (!setColumnIndex) return;
    state.columnOrder.forEach((field, index) => {
      try {
        setColumnIndex(field, index);
      } catch {
        // ignore invalid fields
      }
    });
  }, [apiRef, state.columnOrder]);

  const resolvedFilterModel = React.useMemo(
    () => sanitizeFilterModel(filterModelProp ?? state.filterModel),
    [filterModelProp, state.filterModel]
  );

  const resolvedPaginationModel = state.paginationModel ?? defaultState.paginationModel!;
  const resolvedSortModel = state.sortModel ?? [];
  const resolvedColumnVisibilityModel = state.columnVisibilityModel ?? {};
  const resolvedDensity = state.density ?? 'standard';

  React.useEffect(() => {
    if (!serverMode || !onQueryChange) return;
    const handle = setTimeout(() => {
      onQueryChange({
        paginationModel: resolvedPaginationModel,
        sortModel: resolvedSortModel,
        filterModel: resolvedFilterModel,
        quickFilter: (resolvedFilterModel.quickFilterValues || []).join(' '),
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [
    serverMode,
    onQueryChange,
    resolvedPaginationModel,
    resolvedSortModel,
    resolvedFilterModel,
  ]);

  const handleSaveView = () => {
    if (!viewName.trim()) return;
    setSavedViews((prev) => [
      ...prev,
      { id: String(Date.now()), name: viewName.trim(), state },
    ]);
    setViewName('');
    setSaveDialogOpen(false);
  };

  const applyView = (viewState: CommonDataGridState) => {
    setState((prev) => ({ ...prev, ...viewState }));
  };

  const clearSelection = () => setRowSelectionModel(emptySelection);

  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ gap: 1, px: 1.5, py: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
        {toolbarConfig?.title && (
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {toolbarConfig.title}
          </Typography>
        )}
        {toolbarConfig?.showQuickFilter !== false && (
          <GridToolbarQuickFilter
            debounceMs={300}
            quickFilterParser={(input) =>
              input
                .split(/\s+/)
                .filter((token) => token.length > 0)
            }
            aria-label="Search table"
          />
        )}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        {toolbarConfig?.showColumns !== false && <GridToolbarColumnsButton />}
        {toolbarConfig?.showFilters !== false && <GridToolbarFilterButton />}
        {toolbarConfig?.showDensity !== false && <GridToolbarDensitySelector />}
        {toolbarConfig?.showExport !== false && (
          <GridToolbarExport
            csvOptions={{ fileName: tableId, utf8WithBom: true }}
            printOptions={{ disableToolbarButton: false }}
          />
        )}
        {toolbarConfig?.showPrint && (
          <IconButton aria-label="Print" onClick={() => window.print()}>
            <PrintIcon fontSize="small" />
          </IconButton>
        )}
        {toolbarConfig?.showSavedViews !== false && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<ViewListIcon />}
            onClick={(event) => setViewsAnchor(event.currentTarget)}
          >
            Saved Views
          </Button>
        )}
      </Stack>
    </GridToolbarContainer>
  );

  return (
    <Paper sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
      {rowSelectionModel?.ids?.size > 0 && (
        <Box
          sx={{
            px: 2,
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
          aria-label="Bulk actions"
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {rowSelectionModel?.ids?.size ?? 0} selected
          </Typography>
          <Box sx={{ flex: 1 }} />
          {renderBulkActions?.({ selection: rowSelectionModel, clearSelection })}
          <IconButton onClick={clearSelection} aria-label="Clear selection">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Box sx={{ height: tableHeight, width: '100%' }}>
        <DataGridComponent
          apiRef={apiRef}
          rows={rows}
          columns={columns}
          rowHeight={rowHeight}
          getRowId={getRowId}
          loading={loading}
          rowCount={serverMode ? totalRowCount ?? rows.length : undefined}
          paginationMode={serverMode ? 'server' : 'client'}
          sortingMode={serverMode ? 'server' : 'client'}
          filterMode={serverMode ? 'server' : 'client'}
          paginationModel={resolvedPaginationModel}
          onPaginationModelChange={(model: GridPaginationModel) =>
            setState((prev) => ({ ...prev, paginationModel: model }))
          }
          sortModel={resolvedSortModel}
          onSortModelChange={(model: GridSortModel) => setState((prev) => ({ ...prev, sortModel: model }))}
          filterModel={resolvedFilterModel}
          onFilterModelChange={(model: GridFilterModel) => {
            const nextModel = sanitizeFilterModel(model);
            if (!filterModelProp) {
              setState((prev) => ({ ...prev, filterModel: nextModel }));
            }
            onFilterModelChange?.(nextModel);
          }}
          columnVisibilityModel={resolvedColumnVisibilityModel}
          onColumnVisibilityModelChange={(model: GridColumnVisibilityModel) =>
            setState((prev) => ({ ...prev, columnVisibilityModel: model }))
          }
          density={resolvedDensity}
          onDensityChange={(newDensity: GridDensity) =>
            setState((prev) => ({ ...prev, density: newDensity }))
          }
          onColumnOrderChange={() => {
            const api = apiRef.current;
            if (!api) return;
            const ordered = api
              .getAllColumns()
              .map((column: any) => column.field)
              .filter(Boolean);
            setState((prev) => ({ ...prev, columnOrder: ordered }));
          }}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(model: GridRowSelectionModel) =>
            setRowSelectionModel(normalizeSelection(model))
          }
          rowSelectionModel={rowSelectionModel}
          onRowClick={onRowClick}
          slots={{
            toolbar: CustomToolbar,
            loadingOverlay: LoadingOverlay,
            noRowsOverlay: () => (
              <EmptyOverlay
                ctaLabel={toolbarConfig?.emptyCtaLabel}
                onCta={toolbarConfig?.onEmptyCtaClick}
              />
            ),
            noResultsOverlay: () => (
              <EmptyOverlay title="No results" description="Try refining your filters." />
            ),
            ...slots,
          }}
          slotProps={slotProps}
          initialState={undefined}
          sx={{
            border: 0,
            '& .MuiDataGrid-row:hover': { cursor: 'pointer' },
          }}
        />
      </Box>

      {error && <ErrorOverlay message={error} onRetry={onRetry} />}

      <Menu
        anchorEl={viewsAnchor}
        open={Boolean(viewsAnchor)}
        onClose={() => setViewsAnchor(null)}
      >
        {savedViews.length === 0 && (
          <MenuItem disabled>No saved views</MenuItem>
        )}
        {savedViews.map((view) => (
          <MenuItem
            key={view.id}
            onClick={() => {
              applyView(view.state);
              setViewsAnchor(null);
            }}
          >
            {view.name}
          </MenuItem>
        ))}
        <MenuItem
          onClick={() => {
            setViewsAnchor(null);
            setSaveDialogOpen(true);
          }}
        >
          <SaveIcon fontSize="small" style={{ marginRight: 8 }} />
          Save current view
        </MenuItem>
      </Menu>

      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save view</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="View name"
            value={viewName}
            onChange={(event) => setViewName(event.target.value)}
            size="small"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveView} startIcon={<SaveIcon />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
