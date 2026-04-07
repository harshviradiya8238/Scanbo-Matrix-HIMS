"use client";

import * as React from "react";
import { Box } from "@/src/ui/components/atoms";
import {
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import { usePathname } from "next/navigation";
import Sidebar from "./organisms/Sidebar";
import AppHeader from "./organisms/AppHeader";
import Footer from "./Footer";
import { useUser } from "@/src/core/auth/UserContext";
import { useNavigationState } from "@/src/core/navigation/hooks";
import { getMenuItemByRoute } from "@/src/core/navigation/nav-config";
import { useSidebarState } from "@/src/core/navigation/useSidebarState";
import { getRouteAccessInfo } from "@/src/core/navigation/route-access";
import { hasPermission } from "@/src/core/navigation/permissions";
import AccessDenied from "@/src/ui/components/AccessDenied";

interface AppLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_WIDTH_EXPANDED = 230;
const SIDEBAR_WIDTH_COLLAPSED = 82;

export default function AppLayout({ children }: AppLayoutProps) {
  const theme = useTheme();
  const shellBackground = "#EBF2F8";
  const sidebarBackground = "#0A4472";
  const surfaceWhite = "#FFFFFF";
  const surfaceBorder = "#DDE8F0";
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

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `${sidebarColumn} 1fr`,
        gridTemplateRows: "minmax(0, 1fr)",
        gap: { xs: 0.75, md: 1.25 },
        p: { xs: 0.75, md: 1.25 },
        transition: prefersReducedMotion
          ? "none"
          : theme.transitions.create("grid-template-columns", {
              easing: theme.transitions.easing.sharp,
              duration: 220,
            }),
        height: "100vh",
        minHeight: "100vh",
        overflow: "hidden",
        backgroundColor: shellBackground,
        width: "100%",
        margin: 0,
        boxSizing: "border-box",
      }}
    >
      {/* Sidebar */}
      <Box
        component="aside"
      
        sx={{
          display: { xs: "none", md: "flex" },
          position: "sticky",
          top: 0,
          height: "100%",
          overflow: "hidden",
          flexShrink: 0,
          width: sidebarWidth,
          minWidth: sidebarWidth,
          maxWidth: sidebarWidth,
          borderRadius: { md: "22px" },
          boxShadow: `0 16px 28px ${alpha("#0D1B2A", 0.14)}`,
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

      {/* Right column: Header + Body as separate cards */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: 0,
          gap: { xs: 0.75, md: 1.25 },
        }}
      >
        {/* Sticky Header — separate card */}
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: theme.zIndex.appBar,
            width: "100%",
            flexShrink: 0,
            backgroundColor: surfaceWhite,
            borderRadius: { xs: "14px", md: "22px" },
            border: `1px solid ${surfaceBorder}`,
            boxShadow: `0 4px 12px ${alpha("#0D1B2A", 0.06)}`,
            overflow: "hidden",
          }}
        >
          <AppHeader userName="RMD Hospital" />
        </Box>

        {/* Main Content — transparent, each page card floats on blue shell */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "transparent",
          }}
        >
          {hasAccess ? (
            children
          ) : (
            <AccessDenied
              requiredPermissions={accessInfo?.requiredPermissions ?? []}
              currentRole={role}
            />
          )}
        </Box>

        {/* Footer — always at bottom, outside scroll area */}
        <Footer />
      </Box>
    </Box>
  );
}
