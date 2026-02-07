'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
} from '@/src/ui/components/atoms';
import Text from '@/src/ui/components/atoms/Text';
import GlobalPatientSearch from '@/src/ui/components/molecules/GlobalPatientSearch';
import AvatarWithName from '@/src/ui/components/molecules/AvatarWithName';
import { useTheme, alpha } from '@mui/material';
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
} from '@mui/icons-material';
import Breadcrumbs from './Breadcrumbs';
import { getMenuItemByRoute } from '@/src/core/navigation/nav-config';
import MobileMenuButton from './MobileMenuButton';
import { useSidebarState } from '@/src/core/navigation/useSidebarState';

interface HeaderProps {
  userName?: string;
  userRole?: string;
  userAvatar?: string;
}

export default function Header({ userName = 'John Doe', userRole = 'DOCTOR', userAvatar }: HeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const [userMenuAnchor, setUserMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [quickMenuAnchor, setQuickMenuAnchor] = React.useState<null | HTMLElement>(null);
  const { toggle: toggleSidebar, isExpanded } = useSidebarState();

  // Get current page title from route
  const currentItem = React.useMemo(() => getMenuItemByRoute(pathname), [pathname]);
  const pageTitle = currentItem?.label || 'Dashboard';

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
    router.push('/');
  };

  const handleNavigate = (route: string) => {
    handleQuickMenuClose();
    router.push(route);
  };

  const quickActions = [
    {
      label: 'New Patient',
      icon: <PersonAddIcon fontSize="small" />,
      route: '/patients/registration',
      color: theme.palette.primary.main,
    },
    {
      label: 'Schedule Visit',
      icon: <EventIcon fontSize="small" />,
      route: '/appointments/calendar',
      color: theme.palette.success.main,
    },
  ];

  const quickLinks = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      color: theme.palette.primary.main,
      icon: <DashboardIcon fontSize="small" />,
    },
    {
      label: 'Patient List',
      route: '/patients/list',
      color:  theme.palette.primary.main,
      icon: <PeopleIcon fontSize="small" />,
    },
    {
      label: 'Appointments',
      route: '/appointments/calendar',
      color:  theme.palette.primary.main,
      icon: <EventIcon fontSize="small" />,
    },
    {
      label: 'Billing',
      route: '/billing/invoices',
      color:  theme.palette.primary.main,
      icon: <ReceiptLongIcon fontSize="small" />,
    },
    {
      label: 'Reports',
      route: '/reports/analytics',
      color:  theme.palette.primary.main,
      icon: <BarChartIcon fontSize="small" />,
    },
  ];

  const tileSx = (color: string) => ({
    width: 38,
    height: 38,
    borderRadius: 2.5,
    backgroundColor: alpha(color, 0.12),
    color,
    border: `1px solid ${alpha(color, 0.22)}`,
    '&:hover': {
      backgroundColor: alpha(color, 0.18),
    },
  });

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 8px 18px rgba(15, 23, 42, 0.06)',
        zIndex: theme.zIndex.drawer + 1,
        width: '100%',
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 80, md: 88 },
          px: { xs: 2, sm: 3 },
          display: 'grid',
          gridTemplateColumns: {
            xs: 'auto 1fr auto',
            md: 'auto 1fr auto',
          },
          columnGap: { xs: 1, md: 2 },
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* Left */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <MobileMenuButton onClick={toggleSidebar} />
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Tooltip title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}>
              <IconButton
                size="small"
                onClick={toggleSidebar}
                sx={tileSx(theme.palette.primary.main)}
                aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                <MenuIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, minWidth: 0 }}>
            <Breadcrumbs currentPageTitle={pageTitle} />
          </Box>
          <Text
            variant="h6"
            component="div"
            sx={{
              display: { xs: 'block', md: 'none' },
              fontWeight: 600,
              color: theme.palette.text.primary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {pageTitle}
          </Text>
        </Box>

        {/* Center */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 0,
            justifyContent: 'center',
            justifySelf: { xs: 'stretch', md: 'stretch' },
          }}
        >
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              width: '100%',
              minWidth: 0,
            }}
          >
            <GlobalPatientSearch fullWidth />
          </Box>
        </Box>

        {/* Right */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: { xs: 'none', sm: 'grid' },
              alignItems: 'center',
              gridAutoFlow: 'column',
              gap: 1.5,
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
                  sx={tileSx(theme.palette.primary.main)}
                  aria-label={action.label}
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))}
            <Tooltip title="Notifications">
              <IconButton size="small"  sx={tileSx(theme.palette.primary.main)}aria-label="Notifications">
                <Badge
                  badgeContent={3}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
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
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1,
              py: 0.5,
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              transition: theme.transitions.create('background-color', {
                duration: theme.transitions.duration.short,
              }),
            }}
            aria-label="User menu"
          >
            <AvatarWithName
              name={userName}
              subtitle={userRole.replace('_', ' ').toLowerCase()}
              avatarSrc={userAvatar}
              avatarProps={{
                sx: {
                  bgcolor: theme.palette.primary.main,
                },
              }}
              detailsSx={{
                display: { xs: 'none', sm: 'flex' },
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
              nameProps={{ sx: { color: theme.palette.text.primary, maxWidth: 120 } }}
              subtitleProps={{ sx: { fontSize: '0.8rem' } }}
              trailing={
                <ExpandMoreIcon
                  sx={{
                    fontSize: 20,
                    color: theme.palette.text.secondary,
                    display: { xs: 'none', sm: 'block' },
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
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
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
        <MenuItem onClick={handleUserMenuClose} sx={{ gap: 1.25 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
            }}
          >
            <PersonIcon sx={{ fontSize: 18 }} />
          </Box>
          <Text sx={{ fontWeight: 600 }}>Profile</Text>
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose} sx={{ gap: 1.25 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              backgroundColor: alpha(theme.palette.info.main, 0.12),
              color: theme.palette.info.main,
            }}
          >
            <SettingsIcon sx={{ fontSize: 18 }} />
          </Box>
          <Text sx={{ fontWeight: 600 }}>Settings</Text>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ gap: 1.25 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
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
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
