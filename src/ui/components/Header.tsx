"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
} from "@/src/ui/components/atoms";
import Text from "@/src/ui/components/atoms/Text";
import GlobalPatientSearch from "@/src/ui/components/molecules/GlobalPatientSearch";
import AvatarWithName from "@/src/ui/components/molecules/AvatarWithName";
import { useTheme, alpha, Breadcrumbs, Typography } from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  PersonAdd as PersonAddIcon,
  Event as EventIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ReceiptLong as ReceiptLongIcon,
  BarChart as BarChartIcon,
  Apps as AppsIcon,
  Menu as MenuIcon,
  Queue as QueueIcon,
  NavigateNext as NavNextIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import {
  getMenuItemByRoute,
  getBreadcrumbPath,
} from "@/src/core/navigation/nav-config";
import MobileMenuButton from "./MobileMenuButton";
import { useSidebarState } from "@/src/core/navigation/useSidebarState";
import { useUser } from "@/src/core/auth/UserContext";
import { getRoleLabel } from "@/src/core/navigation/permissions";
import { UserRole } from "@/src/core/navigation/types";
import { useStaffStore } from "@/src/core/staff/staffStore";
import { PATIENT } from "@/src/screens/patient-portal/patient-portal-mock-data";
import { getOpdRoleFlowProfile } from "@/src/screens/opd/opd-role-flow";
import * as MuiIcons from "@mui/icons-material";

interface HeaderProps {
  userName?: string;
  userAvatar?: string;
}

const ROOT_PATHS = ["/dashboard", "/frontdesk/dashboard", "/"];

function NavIcon({
  name,
  fontSize = 13,
}: {
  name?: string;
  fontSize?: number;
}) {
  if (!name) return null;
  const IconComp = (MuiIcons as any)[name] ?? null;
  if (!IconComp) return null;
  return <IconComp sx={{ fontSize }} />;
}

export default function Header({
  userName = "John Doe",
  userAvatar,
}: HeaderProps) {
  const theme = useTheme();
  const brandPrimary = "#1172BA";
  const surfaceBorder = "#DDE8F0";
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { role, setRole } = useUser();
  const { roles } = useStaffStore();
  const roleFlow = React.useMemo(() => getOpdRoleFlowProfile(role), [role]);
  const [userMenuAnchor, setUserMenuAnchor] =
    React.useState<null | HTMLElement>(null);
  const [quickMenuAnchor, setQuickMenuAnchor] =
    React.useState<null | HTMLElement>(null);
  const { toggle: toggleSidebar, isExpanded } = useSidebarState();

  // Get current page title from route
  const currentItem = React.useMemo(
    () => getMenuItemByRoute(pathname),
    [pathname],
  );
  const pageTitle = currentItem?.label || "Dashboard";
  const isRootPage = ROOT_PATHS.includes(pathname);
  const breadcrumbs = React.useMemo(() => {
    const navPath = getBreadcrumbPath(pathname);
    if (navPath.length > 0) {
      return [
        { label: "Dashboard", route: "/dashboard", iconName: "Home" },
        ...navPath.map((b) => ({
          label: b.label,
          route: b.route ?? "",
          iconName: b.iconName,
        })),
      ];
    }
    const segments = pathname.split("/").filter(Boolean);
    return [
      { label: "Dashboard", route: "/dashboard", iconName: "Home" },
      ...segments.map((seg, i) => ({
        label: seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        route: "/" + segments.slice(0, i + 1).join("/"),
        iconName: undefined as string | undefined,
      })),
    ];
  }, [pathname]);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleQuickMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setQuickMenuAnchor(event.currentTarget);
  };

  const handleQuickMenuClose = () => {
    setQuickMenuAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    router.push("/");
  };

  const handleRoleSelect = (nextRole: UserRole) => {
    setRole(nextRole);
    handleUserMenuClose();

    // Logic to redirect based on portal
    if (nextRole === "PATIENT_PORTAL") {
      router.push("/patient-portal/home");
    } else {
      router.push("/dashboard");
    }
  };

  const handleNavigate = (route: string) => {
    handleQuickMenuClose();
    router.push(route);
  };

  const quickActions = React.useMemo(() => {
    const actions: Array<{
      label: string;
      icon: React.ReactNode;
      route: string;
      color: string;
    }> = [];

    if (roleFlow.capabilities.canManageCalendar) {
      actions.push({
        label: "New Patient",
        icon: <PersonAddIcon fontSize="small" />,
        route: "/patients/registration",
        color: theme.palette.primary.main,
      });
      actions.push({
        label: "Schedule Visit",
        icon: <EventIcon fontSize="small" />,
        route: "/appointments/calendar",
        color: theme.palette.success.main,
      });
    }

    if (roleFlow.capabilities.canStartConsult) {
      actions.push({
        label: "Open Queue",
        icon: <QueueIcon fontSize="small" />,
        route: "/appointments/queue",
        color: theme.palette.info.main,
      });
    }

    return actions;
  }, [
    roleFlow.capabilities.canManageCalendar,
    roleFlow.capabilities.canStartConsult,
    theme.palette,
  ]);

  const quickLinks = [
    {
      label: "Dashboard",
      route: "/dashboard",
      color: theme.palette.primary.main,
      icon: <DashboardIcon fontSize="small" />,
    },
    {
      label: "Patient List",
      route: "/patients/list",
      color: theme.palette.primary.main,
      icon: <PeopleIcon fontSize="small" />,
    },
    {
      label: "Appointments",
      route: "/appointments/calendar",
      color: theme.palette.primary.main,
      icon: <EventIcon fontSize="small" />,
    },
    {
      label: "Billing",
      route: "/billing/invoices",
      color: theme.palette.primary.main,
      icon: <ReceiptLongIcon fontSize="small" />,
    },
    {
      label: "Reports",
      route: "/reports/analytics",
      color: theme.palette.primary.main,
      icon: <BarChartIcon fontSize="small" />,
    },
  ];

  const switchRoleIds: UserRole[] = [
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "DOCTOR",
    "NURSE",
    "RECEPTION",
    "CARE_COORDINATOR",
    "INFECTION_CONTROL",
    // "LAB_TECH",
    "LAB_MANAGER",
    // "PATHOLOGIST",
    "RADIOLOGY_TECH",
    "PHARMACIST",
    "BILLING",
    "INVENTORY",
    "PATIENT_PORTAL",
    "AUDITOR",
  ];
  const switchRoleIdSet = React.useMemo(
    () => new Set(switchRoleIds),
    [switchRoleIds],
  );
  const switchRoles = React.useMemo(
    () =>
      roles.filter((roleOption) =>
        switchRoleIdSet.has(roleOption.id as UserRole),
      ),
    [roles, switchRoleIdSet],
  );

  const tileSx = (accentColor: string) => ({
    width: 36,
    height: 36,
    borderRadius: 2.5,
    backgroundColor: "#FFFFFF",
    border: `1px solid ${surfaceBorder}`,
    "& .MuiSvgIcon-root": {
      color: alpha(theme.palette.text.primary, 0.65),
    },
    "&:hover": {
      backgroundColor: "#F5F8FB",
      borderColor: alpha(accentColor, 0.28),
      "& .MuiSvgIcon-root": {
        color: accentColor,
      },
    },
  });

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "#FFFFFF",
        border: `1px solid ${surfaceBorder}`,
        borderRadius: { xs: "14px", md: "22px" },
        boxShadow: `0 12px 24px ${alpha("#0D1B2A", 0.07)}`,
        overflow: "hidden",
        zIndex: theme.zIndex.drawer + 1,
        width: "100%",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 58, md: 60 },
          px: { xs: 1.1, sm: 1.5, md: 2.2 },
          display: "grid",
          gridTemplateColumns: {
            xs: "auto 1fr auto",
            md: "auto minmax(0, 1fr) auto",
          },
          columnGap: { xs: 0.55, md: 0.9 },
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Left */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            minWidth: 0,
            justifyContent: "flex-start",
          }}
        >
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <MobileMenuButton onClick={toggleSidebar} />
          </Box>
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <Tooltip title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}>
              <IconButton
                size="small"
                onClick={toggleSidebar}
                sx={tileSx(theme.palette.primary.main)}
                aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
              >
                <MenuIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              minWidth: 0,
              gap: 0.55,
            }}
          >
            {!isRootPage && breadcrumbs.length > 1 && (
              <IconButton
                size="small"
                onClick={() => router.back()}
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 2,
                  color: theme.palette.text.secondary,
                  bgcolor: "#F5F8FB",
                  border: `1px solid ${surfaceBorder}`,
                  "&:hover": {
                    bgcolor: "#ECF4FB",
                    borderColor: alpha(brandPrimary, 0.28),
                    color: brandPrimary,
                  },
                }}
                aria-label="Go back"
              >
                <ArrowBackIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
            {!isRootPage && breadcrumbs.length > 1 ? (
              <Breadcrumbs
                separator={
                  <NavNextIcon
                    sx={{ fontSize: 13, color: theme.palette.text.disabled }}
                  />
                }
                sx={{
                  minWidth: 0,
                  "& .MuiBreadcrumbs-ol": {
                    flexWrap: "nowrap",
                    alignItems: "center",
                  },
                }}
              >
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  const color = isLast
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary;
                  return (
                    <Box
                      key={crumb.route || idx}
                      onClick={
                        !isLast && crumb.route
                          ? () => router.push(crumb.route)
                          : undefined
                      }
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.45,
                        minWidth: 0,
                        cursor: isLast ? "default" : "pointer",
                        color,
                        "&:hover": !isLast
                          ? { color: theme.palette.primary.main }
                          : {},
                        transition: "color 0.15s",
                      }}
                    >
                      {crumb.iconName && (
                        <NavIcon name={crumb.iconName} fontSize={12} />
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.78rem",
                          fontWeight: isLast ? 700 : 500,
                          color: "inherit",
                          whiteSpace: "nowrap",
                          lineHeight: 1,
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          maxWidth: 180,
                        }}
                      >
                        {crumb.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Breadcrumbs>
            ) : (
              <Text
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  fontSize: "1rem",
                  whiteSpace: "nowrap",
                }}
              >
                {pageTitle}
              </Text>
            )}
          </Box>
          <Text
            variant="h6"
            component="div"
            sx={{
              display: { xs: "block", md: "none" },
              fontWeight: 700,
              color: theme.palette.text.primary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "1rem",
            }}
          >
            {pageTitle}
          </Text>
        </Box>

        {/* Center — hide patient search for patient portal role */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            minWidth: 0,
            justifyContent: { xs: "end", md: "center" },
            justifySelf: { xs: "stretch", md: "stretch" },
          }}
        >
          {role !== "PATIENT_PORTAL" && (
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                width: "clamp(240px, 33vw, 320px)",
                minWidth: 0,
              }}
            >
              <GlobalPatientSearch fullWidth size="compact" />
            </Box>
          )}
        </Box>

        {/* Right */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.55 }}>
          <Box
            sx={{
              display: { xs: "none", sm: "grid" },
              alignItems: "center",
              gridAutoFlow: "column",
              gap: 0.55,
            }}
          >
            <Tooltip title="Quick Links">
              <IconButton
                size="small"
                onClick={handleQuickMenuOpen}
                aria-label="Quick links"
                sx={tileSx(theme.palette.primary.main)}
              >
                <AppsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {quickActions.map((action) => (
              <Tooltip key={action.label} title={action.label}>
                <IconButton
                  size="small"
                  onClick={() => handleNavigate(action.route)}
                  sx={tileSx(action.color)}
                  aria-label={action.label}
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))}
            <Tooltip title="Notifications">
              <IconButton
                size="small"
                sx={tileSx(brandPrimary)}
                aria-label="Notifications"
              >
                <Badge
                  badgeContent={3}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      color: theme.palette.common.white,
                    },
                  }}
                >
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>

          <Box
            onClick={handleUserMenuOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.55,
              px: 0.65,
              py: 0.25,
              borderRadius: 2.5,
              border: `1px solid ${surfaceBorder}`,
              backgroundColor: "#F5F8FB",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#ECF4FB",
                borderColor: alpha(brandPrimary, 0.28),
              },
              transition: theme.transitions.create(["background-color", "border-color"], {
                duration: theme.transitions.duration.short,
              }),
            }}
            aria-label="User menu"
          >
            <AvatarWithName
              name={role === "PATIENT_PORTAL" ? PATIENT.name : userName}
              subtitle={
                role === "PATIENT_PORTAL"
                  ? `PID: ${PATIENT.pid}`
                  : getRoleLabel(role).toLowerCase()
              }
              avatarSrc={userAvatar}
              size={28}
              avatarProps={{
                sx: {
                  bgcolor:
                    role === "PATIENT_PORTAL"
                      ? PATIENT.avatarColor
                      : brandPrimary,
                },
              }}
              detailsSx={{
                display: { xs: "none", sm: "flex" },
                flexDirection: "column",
                alignItems: "flex-start",
              }}
              nameProps={{
                sx: {
                  color: theme.palette.text.primary,
                  maxWidth: 120,
                  fontSize: "0.84rem",
                },
              }}
              subtitleProps={{
                sx: {
                  fontSize: "0.61rem",
                  color: theme.palette.text.secondary,
                },
              }}
              trailing={
                <ExpandMoreIcon
                  sx={{
                    fontSize: 14,
                    color: theme.palette.text.secondary,
                    display: { xs: "none", sm: "block" },
                  }}
                />
              }
            />
          </Box>
        </Box>

        {/* User Menu Dropdown */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              boxShadow: theme.shadows[8],
              border: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleUserMenuClose();
              router.push(
                role === "PATIENT_PORTAL"
                  ? "/patient-portal/profile"
                  : "/profile",
              );
            }}
            sx={{ gap: 1.25 }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
              }}
            >
              <PersonIcon sx={{ fontSize: 18 }} />
            </Box>
            <Text sx={{ fontWeight: 600 }}>Profile</Text>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleUserMenuClose();
              router.push(
                role === "PATIENT_PORTAL"
                  ? "/patient-portal/settings"
                  : "/settings",
              );
            }}
            sx={{ gap: 1.25 }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                backgroundColor: alpha(theme.palette.info.main, 0.12),
                color: theme.palette.info.main,
              }}
            >
              <SettingsIcon sx={{ fontSize: 18 }} />
            </Box>
            <Text sx={{ fontWeight: 600 }}>Settings</Text>
          </MenuItem>
          <Divider />
          <Box sx={{ px: 1.5, py: 1 }}>
            <Text
              variant="caption"
              sx={{ fontWeight: 600, color: theme.palette.text.secondary }}
            >
              Switch Role
            </Text>
          </Box>
          {switchRoles.map((roleOption) => (
            <MenuItem
              key={roleOption.id}
              onClick={() => handleRoleSelect(roleOption.id as UserRole)}
              selected={roleOption.id === role}
              sx={{ gap: 1.25 }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1.5,
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                }}
              >
                <PersonIcon sx={{ fontSize: 18 }} />
              </Box>
              <Text sx={{ fontWeight: 600 }}>
                {getRoleLabel(roleOption.id as UserRole)}
              </Text>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ gap: 1.25 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                backgroundColor: alpha(theme.palette.error.main, 0.12),
                color: theme.palette.error.main,
              }}
            >
              <LogoutIcon sx={{ fontSize: 18 }} />
            </Box>
            <Text sx={{ fontWeight: 600 }}>Logout</Text>
          </MenuItem>
        </Menu>

        {/* Quick Links Menu */}
        <Menu
          anchorEl={quickMenuAnchor}
          open={Boolean(quickMenuAnchor)}
          onClose={handleQuickMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 220,
              borderRadius: 2,
              boxShadow: theme.shadows[8],
              border: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {quickLinks.map((link) => (
            <MenuItem
              key={link.label}
              onClick={() => handleNavigate(link.route)}
              sx={{ gap: 1.25 }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: alpha(link.color, 0.14),
                  color: link.color,
                }}
              >
                {link.icon}
              </Box>
              <Text>{link.label}</Text>
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
