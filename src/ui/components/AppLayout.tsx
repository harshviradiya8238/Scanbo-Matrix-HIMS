'use client';

import * as React from 'react';
import { Box } from '@/src/ui/components/atoms';
import { useTheme, useMediaQuery } from '@mui/material';
import { usePathname } from 'next/navigation';
import Sidebar from './organisms/Sidebar';
import AppHeader from './organisms/AppHeader';
import Footer from './Footer';
import { useUser } from '@/src/core/auth/UserContext';
import { useNavigationState } from '@/src/core/navigation/hooks';
import { getMenuItemByRoute } from '@/src/core/navigation/nav-config';
import { useSidebarState } from '@/src/core/navigation/useSidebarState';
import { getRouteAccessInfo } from '@/src/core/navigation/route-access';
import { hasPermission } from '@/src/core/navigation/permissions';
import AccessDenied from '@/src/ui/components/AccessDenied';

interface AppLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_WIDTH_EXPANDED = 260;
const SIDEBAR_WIDTH_COLLAPSED = 96;

export default function AppLayout({ children }: AppLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { permissions, role } = useUser();
  const { addRecentItem } = useNavigationState();
  const { isExpanded } = useSidebarState();
  const pathname = usePathname() ?? '';

  // Add current route to recent items
  React.useEffect(() => {
    const currentItem = getMenuItemByRoute(pathname);
    if (currentItem) {
      addRecentItem(currentItem.id);
    }
  }, [pathname, addRecentItem]);

  // Don't show sidebar on login page
  const isLoginPage = pathname === '/';

  if (isLoginPage) {
    return <>{children}</>;
  }

  // Don't block rendering - show layout immediately
  // The sidebar will handle its own mounting state

  const sidebarWidth = isExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;
  const sidebarColumn = isMobile ? '0px' : `${sidebarWidth}px`;
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  const accessInfo = React.useMemo(() => getRouteAccessInfo(pathname), [pathname]);
  const hasAccess = React.useMemo(() => {
    if (!accessInfo || accessInfo.requiredPermissions.length === 0) return true;
    return accessInfo.requiredPermissions.some((perm) => hasPermission(permissions, perm));
  }, [accessInfo, permissions]);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `${sidebarColumn} 1fr`,
        gridTemplateRows: 'minmax(0, 1fr)',
        transition: prefersReducedMotion
          ? 'none'
          : theme.transitions.create('grid-template-columns', {
              easing: theme.transitions.easing.sharp,
              duration: 220,
            }),
        height: '100vh',
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.default,
        width: '100%',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Sidebar */}
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          flexShrink: 0,
          width: sidebarWidth,
          minWidth: sidebarWidth,
          maxWidth: sidebarWidth,
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          zIndex: theme.zIndex.drawer,
          transition: prefersReducedMotion
            ? 'none'
            : theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: 220,
              }),
        }}
      >
        <Sidebar userPermissions={permissions} />
      </Box>

      {/* Main Content Area (Header + Body) */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: 0,
        }}
      >
        {/* Header */}
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: theme.zIndex.appBar,
            width: '100%',
            flexShrink: 0,
          }}
        >
          <AppHeader userName="RMD Hospital" />
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundColor: theme.palette.background.default,
            width: '100%',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ flex: '1 0 auto' }}>
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
