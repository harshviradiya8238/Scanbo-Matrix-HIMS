'use client';

import * as React from 'react';
import {
  Box,
  AppBar,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@/src/ui/components/atoms';
import { useTheme } from '@/src/ui/theme';
import { useUser } from '@/src/core/auth/UserContext';
import { getRoleLabel } from '@/src/core/navigation/permissions';
import type { UserRole } from '@/src/core/navigation/types';
import { getOpdRoleFlowProfile, OPD_LOGIN_ROLES } from '@/src/screens/opd/opd-role-flow';

export default function HomePage() {
  const theme = useTheme();
  const { role, setRole } = useUser();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loginRole, setLoginRole] = React.useState<UserRole>('HOSPITAL_ADMIN');

  React.useEffect(() => {
    if (OPD_LOGIN_ROLES.includes(role)) {
      setLoginRole(role);
    }
  }, [role]);

  const handleSignIn = () => {
    setRole(loginRole);
    const landingRoute = getOpdRoleFlowProfile(loginRole).landingRoute;
    window.location.href = landingRoute;
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSignIn();
    }
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={1}
        sx={{
          backgroundColor: theme.palette.primary.light,
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }} color="primary.main">
            Scanbo HIMS
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={2}
            sx={{
              p: 4,
              borderRadius: 2,
            }}
          >
            <Stack spacing={3}>
              <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: 600 }}>
                Sign In
              </Typography>

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                fullWidth
                required
                autoComplete="email"
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                fullWidth
                required
                autoComplete="current-password"
              />

              <TextField
                label="Login Perspective"
                select
                value={loginRole}
                onChange={(event) => setLoginRole(event.target.value as UserRole)}
                fullWidth
                helperText="Use this to preview role-based OPD workflows."
              >
                {OPD_LOGIN_ROLES.map((roleOption) => (
                  <MenuItem key={roleOption} value={roleOption}>
                    {getRoleLabel(roleOption)}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="contained"
                onClick={handleSignIn}
                size="large"
                fullWidth
                sx={{
                  mt: 2,
                }}
              >
                Sign In
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
