"use client";

import * as React from "react";
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
} from "@/src/ui/components/atoms";
import { useTheme } from "@/src/ui/theme";
import { useUser } from "@/src/core/auth/UserContext";
import { getRoleLabel } from "@/src/core/navigation/permissions";
import type { UserRole } from "@/src/core/navigation/types";
import { OPD_LOGIN_ROLES } from "@/src/screens/opd/opd-role-flow";
import { useRouter } from "next/navigation";
import { useStaffStore } from "@/src/core/staff/staffStore";

export default function HomePage() {
  const theme = useTheme();
  const { role, setRole } = useUser();
  const { roles } = useStaffStore();
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loginRole, setLoginRole] = React.useState<UserRole>("HOSPITAL_ADMIN");

  const loginRoleOptions = React.useMemo<UserRole[]>(() => {
    const activeRoles = roles
      .filter((roleOption) => roleOption.isActive)
      .map((roleOption) => roleOption.id as UserRole);
    return activeRoles.length > 0 ? activeRoles : OPD_LOGIN_ROLES;
  }, [roles]);

  React.useEffect(() => {
    if (loginRoleOptions.includes(role)) {
      setLoginRole(role);
    }
  }, [role, loginRoleOptions]);

  React.useEffect(() => {
    if (loginRoleOptions.length === 0) return;
    if (!loginRoleOptions.includes(loginRole)) {
      setLoginRole(loginRoleOptions[0]);
    }
  }, [loginRole, loginRoleOptions]);

  const handleSignIn = () => {
    setRole(loginRole);
    router.push("/dashboard");
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
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
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
            color="primary.main"
          >
            Scanbo HIMS
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          backgroundColor: theme.palette.background.default,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
              <Typography
                variant="h4"
                component="h1"
                align="center"
                sx={{ fontWeight: 600 }}
              >
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
                onChange={(event) =>
                  setLoginRole(event.target.value as UserRole)
                }
                fullWidth
                helperText="Use this to choose role-based dashboard access."
              >
                {loginRoleOptions.map((roleOption) => (
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
