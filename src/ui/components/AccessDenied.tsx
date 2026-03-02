'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '@/src/ui/components/PageTemplate';
import { Box, Button, Chip, Stack, Typography } from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import {
  getRoleLabel,
  getRolesForPermissions,
} from '@/src/core/navigation/permissions';
import {
  ErrorOutline as ErrorOutlineIcon,
  Home as HomeIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { UserRole } from '@/src/core/navigation/types';

interface AccessDeniedProps {
  requiredPermissions: string[];
  currentRole: UserRole;
}

export default function AccessDenied({ requiredPermissions, currentRole }: AccessDeniedProps) {
  const router = useRouter();
  const allowedRoles = getRolesForPermissions(requiredPermissions);

  return (
    <PageTemplate title="Access Restricted" currentPageTitle="Access Restricted">
      <Stack spacing={2}>
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ErrorOutlineIcon color="error" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                You do not have permission to access this page
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Your current role does not include the required access for this workflow.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                size="small"
                label={`Current Role: ${getRoleLabel(currentRole)}`}
                color="warning"
                variant="outlined"
              />
              {requiredPermissions.map((perm) => (
                <Chip key={perm} size="small" label={`Requires ${perm}`} variant="outlined" />
              ))}
            </Stack>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Roles with access
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {allowedRoles.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No roles configured for this permission yet.
                  </Typography>
                ) : (
                  allowedRoles.map((role) => (
                    <Chip key={role} size="small" label={getRoleLabel(role)} color="info" variant="outlined" />
                  ))
                )}
              </Stack>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="contained" startIcon={<HomeIcon />} onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button variant="outlined" startIcon={<SecurityIcon />} onClick={() => router.push('/staff/roles')}>
                View Role Management
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </PageTemplate>
  );
}
