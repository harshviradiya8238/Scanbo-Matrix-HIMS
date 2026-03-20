"use client";

import * as React from "react";
import { Box, Stack } from "@/src/ui/components/atoms";
import {
  useTheme,
  useMediaQuery,
  alpha,
  Breadcrumbs,
  IconButton,
  Typography,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./organisms/Sidebar";
import AppHeader from "./organisms/AppHeader";
import Footer from "./Footer";
import { useUser } from "@/src/core/auth/UserContext";
import { useNavigationState } from "@/src/core/navigation/hooks";
import {
  getMenuItemByRoute,
  getBreadcrumbPath,
} from "@/src/core/navigation/nav-config";
import { useSidebarState } from "@/src/core/navigation/useSidebarState";
import { getRouteAccessInfo } from "@/src/core/navigation/route-access";
import { hasPermission } from "@/src/core/navigation/permissions";
import AccessDenied from "@/src/ui/components/AccessDenied";
import {
  NavigateNext as NavNextIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import * as MuiIcons from "@mui/icons-material";

// Resolve MUI icon by name string
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

interface AppLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_WIDTH_EXPANDED = 260;
const SIDEBAR_WIDTH_COLLAPSED = 96;

const ROOT_PATHS = ["/dashboard", "/frontdesk/dashboard", "/"];

export default function AppLayout({ children }: AppLayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { permissions, role } = useUser();
  const { addRecentItem } = useNavigationState();
  const { isExpanded } = useSidebarState();
  const pathname = usePathname() ?? "";

  // Add current route to recent items
  React.useEffect(() => {
    const currentItem = getMenuItemByRoute(pathname);
    if (currentItem) {
      addRecentItem(currentItem.id);
    }
  }, [pathname, addRecentItem]);

  // Don't show sidebar on login page
  const isLoginPage = pathname === "/";

  if (isLoginPage) {
    return <>{children}</>;
  }

  const sidebarWidth = isExpanded
    ? SIDEBAR_WIDTH_EXPANDED
    : SIDEBAR_WIDTH_COLLAPSED;
  const sidebarColumn = isMobile ? "0px" : `${sidebarWidth}px`;
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    }
  }, []);

  const accessInfo = React.useMemo(
    () => getRouteAccessInfo(pathname),
    [pathname],
  );
  const hasAccess = React.useMemo(() => {
    if (!accessInfo || accessInfo.requiredPermissions.length === 0) return true;
    const isExcluded =
      accessInfo.excludedRoles?.some(
        (r) => String(r).toUpperCase() === String(role ?? "").toUpperCase(),
      ) ?? false;
    if (isExcluded) return false;
    return accessInfo.requiredPermissions.some((perm) =>
      hasPermission(permissions, perm),
    );
  }, [accessInfo, permissions, role]);

  // Build breadcrumbs
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
    // URL segment fallback
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

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `${sidebarColumn} 1fr`,
        gridTemplateRows: "minmax(0, 1fr)",
        transition: prefersReducedMotion
          ? "none"
          : theme.transitions.create("grid-template-columns", {
              easing: theme.transitions.easing.sharp,
              duration: 220,
            }),
        height: "100vh",
        minHeight: "100vh",
        overflow: "hidden",
        backgroundColor: theme.palette.background.default,
        width: "100%",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Sidebar */}
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "flex" },
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          flexShrink: 0,
          width: sidebarWidth,
          minWidth: sidebarWidth,
          maxWidth: sidebarWidth,
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          zIndex: theme.zIndex.drawer,
          transition: prefersReducedMotion
            ? "none"
            : theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: 220,
              }),
        }}
      >
        <Sidebar userPermissions={permissions} userRole={role} />
      </Box>

      {/* Main Content Area (Header + Body) */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: 0,
        }}
      >
        {/* Sticky Header */}
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: theme.zIndex.appBar,
            width: "100%",
            flexShrink: 0,
          }}
        >
          <AppHeader userName="RMD Hospital" />

          {/* Breadcrumb Bar — shown directly under the header */}
          {!isRootPage && breadcrumbs.length > 1 && (
            <Box
              sx={{
                px: { xs: 2, sm: 3 },
                py: 0.75,
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {/* Back button */}
              <IconButton
                size="small"
                onClick={() => router.back()}
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: 1.5,
                  color: theme.palette.text.secondary,
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.14),
                    color: theme.palette.primary.main,
                  },
                  mr: 0.5,
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 14 }} />
              </IconButton>

              {/* Breadcrumbs */}
              <Breadcrumbs
                separator={
                  <NavNextIcon
                    sx={{ fontSize: 13, color: theme.palette.text.disabled }}
                  />
                }
                sx={{ "& .MuiBreadcrumbs-ol": { flexWrap: "nowrap" } }}
              >
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  const color = isLast
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary;
                  return (
                    <Box
                      key={crumb.route || idx}
                      onClick={
                        !isLast ? () => router.push(crumb.route) : undefined
                      }
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        cursor: isLast ? "default" : "pointer",
                        color,
                        "&:hover": !isLast
                          ? { color: theme.palette.primary.main }
                          : {},
                        transition: "color 0.15s",
                      }}
                    >
                      {crumb.iconName && (
                        <NavIcon name={crumb.iconName} fontSize={13} />
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.72rem",
                          fontWeight: isLast ? 700 : 500,
                          color: "inherit",
                          whiteSpace: "nowrap",
                          lineHeight: 1,
                        }}
                      >
                        {crumb.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Breadcrumbs>
            </Box>
          )}
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            backgroundColor: theme.palette.background.default,
            width: "100%",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ flex: "1 0 auto" }}>
            {hasAccess ? (
              children
            ) : (
              <AccessDenied
                requiredPermissions={accessInfo?.requiredPermissions ?? []}
                currentRole={role}
              />
            )}
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
}
