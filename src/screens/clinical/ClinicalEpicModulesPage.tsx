'use client';

import * as React from 'react';
import Link from 'next/link';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Box, Stack, Typography, TextField, InputAdornment, Chip, Button } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { useTheme } from '@mui/material';
import { getSubtleSurface } from '@/src/core/theme/surfaces';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  OpenInNew as OpenInNewIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import {
  CLINICAL_MODULES,
  ClinicalModuleDefinition,
} from './module-registry';

export default function ClinicalEpicModulesPage() {
  const theme = useTheme();
  const subtleSurface = getSubtleSurface(theme);
  const [query, setQuery] = React.useState('');
  const [audienceFilter, setAudienceFilter] = React.useState<'All' | string>('All');

  const audienceOptions = React.useMemo(() => {
    const set = new Set<string>();
    CLINICAL_MODULES.forEach((moduleDefinition) =>
      moduleDefinition.audience.forEach((audience) => set.add(audience))
    );
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, []);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return CLINICAL_MODULES.filter((moduleDefinition) => {
      const matchesQuery =
        q.length === 0 ||
        [
          moduleDefinition.name,
          moduleDefinition.area,
          moduleDefinition.description,
          moduleDefinition.audience.join(' '),
          moduleDefinition.status,
        ].some((value) => value.toLowerCase().includes(q));
      const matchesAudience =
        audienceFilter === 'All' ||
        moduleDefinition.audience.includes(audienceFilter);
      return matchesQuery && matchesAudience;
    });
  }, [query, audienceFilter]);

  const columns = React.useMemo<GridColDef<ClinicalModuleDefinition>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Module',
        minWidth: 250,
        flex: 1.1,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 140,
        renderCell: (
          params: GridRenderCellParams<
            ClinicalModuleDefinition,
            ClinicalModuleDefinition['status']
          >
        ) => (
          <Chip
            size="small"
            label={params.value}
            color={
              params.value === 'Implemented'
                ? 'success'
                : params.value === 'In Progress'
                ? 'info'
                : 'default'
            }
            variant={params.value === 'Implemented' ? 'filled' : 'outlined'}
          />
        ),
      },
      {
        field: 'area',
        headerName: 'Area',
        width: 200,
      },
      {
        field: 'description',
        headerName: 'What it does',
        flex: 1.8,
        minWidth: 380,
      },
      {
        field: 'audience',
        headerName: 'Users',
        minWidth: 230,
        flex: 1,
        sortable: false,
        filterable: false,
        renderCell: (
          params: GridRenderCellParams<ClinicalModuleDefinition, string[]>
        ) => (
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', py: 0.75 }}>
            {(params.value ?? []).map((audience) => (
              <Chip
                key={audience}
                size="small"
                label={audience}
                variant="outlined"
              />
            ))}
          </Stack>
        ),
      },
      {
        field: 'appRoute',
        headerName: 'Open',
        width: 150,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (
          params: GridRenderCellParams<ClinicalModuleDefinition, string>
        ) => (
          <Button
            size="small"
            variant="contained"
            component={Link}
            href={params.value ?? '/clinical/module-reference'}
            endIcon={<ArrowForwardIcon fontSize="small" />}
          >
            Open
          </Button>
        ),
      },
      {
        field: 'videoUrl',
        headerName: 'Video',
        width: 120,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<ClinicalModuleDefinition, string>) =>
          params.value ? (
            <Button
              size="small"
              variant="outlined"
              component="a"
              href={params.value}
              target="_blank"
              rel="noreferrer"
              endIcon={<OpenInNewIcon fontSize="small" />}
            >
              Watch
            </Button>
          ) : (
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          ),
      },
      {
        field: 'referenceUrl',
        headerName: 'Reference',
        width: 130,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<ClinicalModuleDefinition, string>) =>
          params.value ? (
            <Button
              size="small"
              variant="text"
              component="a"
              href={params.value}
              target="_blank"
              rel="noreferrer"
              endIcon={<OpenInNewIcon fontSize="small" />}
            >
              Site
            </Button>
          ) : (
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          ),
      },
    ],
    []
  );

  return (
    <PageTemplate
      title="Clinical: Module Reference"
      currentPageTitle="Module Reference"
    >
      <Stack spacing={2}>
        <Card
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: subtleSurface,
          }}
        >
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Build modules one by one from this sheet. Use the Open button to move into the
              actual UI for that module.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flex: 1 }}>
                <TextField
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  size="small"
                  placeholder="Search module, area, users, status..."
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  select
                  size="small"
                  label="User"
                  value={audienceFilter}
                  onChange={(event) => setAudienceFilter(event.target.value)}
                  sx={{ minWidth: { xs: '100%', sm: 220 } }}
                  SelectProps={{ native: true }}
                >
                  {audienceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </TextField>
              </Stack>
              <Box>
                <Chip
                  label={`${rows.length} modules`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Stack>
          </Stack>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <Box sx={{ height: 640, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              disableRowSelectionOnClick
              disableColumnMenu
              getRowHeight={() => 'auto'}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 10 } },
              }}
              pageSizeOptions={[10, 25, 50]}
              sx={{
                border: 0,
                '& .MuiDataGrid-cell': {
                  py: 1.25,
                  alignItems: 'flex-start',
                },
                '& .MuiDataGrid-columnHeaders': {
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                },
              }}
            />
          </Box>
        </Card>
      </Stack>
    </PageTemplate>
  );
}
