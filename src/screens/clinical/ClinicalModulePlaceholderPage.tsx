'use client';

import Link from 'next/link';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { ClinicalModuleDefinition } from './module-registry';
import { Box, Button, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import Grid from '@/src/ui/components/layout/AlignedGrid';
import { useTheme } from '@/src/ui/theme';
import { getSoftSurface } from '@/src/core/theme/surfaces';
import { getRoleLabel, getRolesForPermissions } from '@/src/core/navigation/permissions';
import {
  ArrowBack as ArrowBackIcon,
  BuildCircle as BuildCircleIcon,
  OpenInNew as OpenInNewIcon,
  TaskAlt as TaskAltIcon,
} from '@mui/icons-material';

export default function ClinicalModulePlaceholderPage({
  moduleDefinition,
}: {
  moduleDefinition: ClinicalModuleDefinition;
}) {
  const theme = useTheme();
  const softSurface = getSoftSurface(theme);
  const allowedRoles = getRolesForPermissions(moduleDefinition.requiredPermissions ?? ['clinical.read']);
  return (
    <PageTemplate title={moduleDefinition.name} currentPageTitle="Epic Module">
      <Stack spacing={2}>
        <Card
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: softSurface,
          }}
        >
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip size="small" label={moduleDefinition.category} color="primary" />
              <Chip size="small" label={moduleDefinition.area} variant="outlined" />
              <Chip
                size="small"
                label={moduleDefinition.status}
                color={moduleDefinition.status === 'In Progress' ? 'info' : 'default'}
                variant={moduleDefinition.status === 'In Progress' ? 'filled' : 'outlined'}
              />
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {moduleDefinition.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {moduleDefinition.description}
            </Typography>
          </Stack>
        </Card>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Planned Implementation Scope
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BuildCircleIcon color="info" fontSize="small" />
                    <Typography variant="body2">Design core workflow screens</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BuildCircleIcon color="info" fontSize="small" />
                    <Typography variant="body2">Connect forms and actions with backend APIs</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BuildCircleIcon color="info" fontSize="small" />
                    <Typography variant="body2">Add role-wise permission controls</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TaskAltIcon color="success" fontSize="small" />
                    <Typography variant="body2">Module route is already live and usable</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Stack spacing={1.25}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Actions
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  href="/clinical/encounters"
                  startIcon={<ArrowBackIcon />}
                >
                  Back to Clinical EMR
                </Button>
                <Button
                  variant="outlined"
                  component="a"
                  href={moduleDefinition.videoUrl ?? '/clinical/encounters'}
                  target={moduleDefinition.videoUrl ? '_blank' : undefined}
                  rel={moduleDefinition.videoUrl ? 'noreferrer' : undefined}
                  endIcon={<OpenInNewIcon />}
                  disabled={!moduleDefinition.videoUrl}
                >
                  Open Video
                </Button>
                <Button
                  variant="outlined"
                  component="a"
                  href={moduleDefinition.referenceUrl ?? '/clinical/encounters'}
                  target={moduleDefinition.referenceUrl ? '_blank' : undefined}
                  rel={moduleDefinition.referenceUrl ? 'noreferrer' : undefined}
                  endIcon={<OpenInNewIcon />}
                  disabled={!moduleDefinition.referenceUrl}
                >
                  Open Reference
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Role Access (Planned)
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {allowedRoles.map((role) => (
                <Chip key={role} size="small" label={getRoleLabel(role)} variant="outlined" />
              ))}
            </Stack>
          </Stack>
        </Card>

        <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            This module page is wired and ready. Next step is converting this placeholder into the full production workflow.
          </Typography>
        </Card>
      </Stack>
    </PageTemplate>
  );
}
