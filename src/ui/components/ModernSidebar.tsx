'use client';

import * as React from 'react';
import { Box, Drawer, List, Typography } from '@/src/ui/components/atoms';
import { useTheme, useMediaQuery, alpha } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Event as EventIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalInformation as MedicalInformationIcon,
  ShoppingCart as ShoppingCartIcon,
  Biotech as BiotechIcon,
  LocalPharmacy as LocalPharmacyIcon,
  ReceiptLong as ReceiptLongIcon,
  Inventory2 as Inventory2Icon,
  Groups as GroupsIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIconMui,
  Help as HelpIcon,
  PersonAdd,
  List as ListIcon,
  Person,
  Description,
  CalendarToday,
  Queue,
  MedicalServices,
  HowToReg,
  Hotel,
  AccessTime,
  ExitToApp,
  Assignment,
  MonitorHeart,
  Note,
  Receipt,
  Medication,
  Science,
  Healing,
  Inbox,
  Payment,
  Security,
  MoneyOff,
  Category,
  Business,
  AdminPanelSettings,
  Schedule,
  BarChart,
  CorporateFare,
  Storage,
  History,
  Link,
  Undo,
  ShoppingBag,
  Inventory,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { NAV_GROUPS } from '@/src/core/navigation/nav-config';
import { MenuItem } from '@/src/core/navigation/types';
import { hasPermission } from '@/src/core/navigation/permissions';
import { useSidebarState } from '@/src/core/navigation/useSidebarState';
import { useNavigationState } from '@/src/core/navigation/hooks';
import SidebarItem from './SidebarItem';

const DRAWER_WIDTH = 260;

const iconMap: Record<string, React.ComponentType> = {
  Dashboard: DashboardIcon,
  People: PeopleIcon,
  Event: EventIcon,
  LocalHospital: LocalHospitalIcon,
  MedicalInformation: MedicalInformationIcon,
  ShoppingCart: ShoppingCartIcon,
  Biotech: BiotechIcon,
  LocalPharmacy: LocalPharmacyIcon,
  ReceiptLong: ReceiptLongIcon,
  Inventory2: Inventory2Icon,
  Groups: GroupsIcon,
  Assessment: AssessmentIcon,
  Settings: SettingsIconMui,
  Help: HelpIcon,
  PersonAdd,
  List: ListIcon,
  Person,
  Description,
  CalendarToday,
  Queue,
  MedicalServices,
  HowToReg,
  Hotel,
  AccessTime,
  ExitToApp,
  Assignment,
  MonitorHeart,
  Note,
  Receipt,
  Medication,
  Science,
  Healing,
  Inbox,
  Payment,
  Security,
  MoneyOff,
  Category,
  Timeline: TimelineIcon,
  Business,
  AdminPanelSettings,
  Schedule,
  BarChart,
  CorporateFare,
  Database: Storage,
  History,
  Link,
  Undo,
  ShoppingBag,
  Inventory,
  Radiology: Science,
};

interface ModernSidebarProps {
  userPermissions: string[];
}

export default function ModernSidebar({ userPermissions }: ModernSidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isExpanded, toggle } = useSidebarState();
  const { favorites, toggleFavorite, recentItems } = useNavigationState();
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);
  const mainNavRef = React.useRef<HTMLDivElement | null>(null);

  // Filter menu items by permissions
  const filterItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => {
        if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
          return true;
        }
        const hasAccess = item.requiredPermissions.some((perm) =>
          hasPermission(userPermissions, perm)
        );
        return hasAccess;
      })
      .map((item) => {
        if (item.children) {
          const filteredChildren = filterItems(item.children);
          return { ...item, children: filteredChildren };
        }
        return item;
      })
      .filter((item) => {
        if (item.children) {
          return item.children.length > 0;
        }
        return true;
      });
  };

  // Note: Prefetching is handled on user intent (hover/focus) inside SidebarItem/Popover.

  const handleSubmenuHover = (item: MenuItem, anchorEl: HTMLElement | null) => {
    setHoveredItemId(item.id);
  };

  // Get recent menu items - only show leaf items (items with routes, not parent groups)
  const recentMenuItems = React.useMemo(() => {
    const items: MenuItem[] = [];
    const findItem = (groups: typeof NAV_GROUPS, id: string): MenuItem | null => {
      for (const group of groups) {
        for (const item of group.items) {
          if (item.id === id) return item;
          if (item.children) {
            const found = findItemInChildren(item.children, id);
            if (found) return found;
          }
        }
      }
      return null;
    };
    const findItemInChildren = (children: MenuItem[], id: string): MenuItem | null => {
      for (const child of children) {
        if (child.id === id) return child;
        if (child.children) {
          const found = findItemInChildren(child.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    recentItems.forEach((id) => {
      const item = findItem(NAV_GROUPS, id);
      // Only include items that have a route (leaf items, not parent groups)
      if (item && item.route) {
        if (item.requiredPermissions) {
          const hasAccess = item.requiredPermissions.some((perm) =>
            hasPermission(userPermissions, perm)
          );
          if (hasAccess) items.push(item);
        } else {
          items.push(item);
        }
      }
    });
    return items.slice(0, 5);
  }, [recentItems, userPermissions]);

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
        zIndex: theme.zIndex.drawer,
      }}
    >
      {/* Header with Logo and Toggle */}
      <Box
        sx={{
          px: isExpanded ? 1.5 : 1,
          py: isExpanded ? 0 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderBottom: isExpanded ? `1px solid ${theme.palette.divider}` : 'none',
          minHeight: { xs: 80, md: isExpanded ? 88 : 96 },
          height: { xs: 80, md: isExpanded ? 88 : 96 },
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box
          component="img"
          src={'/scanbo.svg' }
          alt="Scanbo logo"
          sx={{
            height: isExpanded ? 60 : 54,
            width: 'auto',
            objectFit: 'contain',
            objectPosition: 'center',
            display: 'block',
            filter: 'drop-shadow(0 2px 6px rgba(17,114,186,0.12))',
          }}
        />
        {!isMobile && null}
      </Box>

      {/* Recent Items - Only show if not already visible in main menu */}
      {isExpanded && recentMenuItems.length > 0 && (() => {
        // Filter out items that are already visible in main menu
        const allMainMenuIds = new Set<string>();
        NAV_GROUPS.forEach((group) => {
          const collectIds = (items: MenuItem[]) => {
            items.forEach((item) => {
              if (item.route) allMainMenuIds.add(item.id);
              if (item.children) collectIds(item.children);
            });
          };
          collectIds(filterItems(group.items));
        });
        
        const uniqueRecentItems = recentMenuItems.filter(
          (item) => !allMainMenuIds.has(item.id)
        );
        
        if (uniqueRecentItems.length === 0) return null;
        
        return (
          <>
            <Box sx={{ px: 2, pb: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  letterSpacing: '0.5px',
                }}
              >
                Recent
              </Typography>
            </Box>
            <List dense sx={{ px: 1, pb: 1 }}>
              {uniqueRecentItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  userPermissions={userPermissions}
                  isExpanded={isExpanded}
                  iconMap={iconMap}
                  favorites={favorites}
                  onFavoriteToggle={toggleFavorite}
                  onSubmenuHover={handleSubmenuHover}
                  hoveredItemId={hoveredItemId}
                />
              ))}
            </List>
          </>
        );
      })()}

      {isExpanded && (() => {
        // Check if we have unique recent items to show
        const allMainMenuIds = new Set<string>();
        NAV_GROUPS.forEach((group) => {
          const collectIds = (items: MenuItem[]) => {
            items.forEach((item) => {
              if (item.route) allMainMenuIds.add(item.id);
              if (item.children) collectIds(item.children);
            });
          };
          collectIds(filterItems(group.items));
        });
        const uniqueRecentItems = recentMenuItems.filter(
          (item) => !allMainMenuIds.has(item.id)
        );
        return uniqueRecentItems.length > 0 ? (
          <Box
            sx={{
              height: 1,
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              my: 1,
              mx: 2,
            }}
          />
        ) : null;
      })()}

      {/* Main Navigation Groups */}
      <Box
        ref={mainNavRef}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          px: isExpanded ? 0.1 : 0.5,
          py: isExpanded ? 1 : 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: isExpanded ? 'stretch' : 'center',
        }}
      >
        {NAV_GROUPS.map((group) => {
          const filteredItems = filterItems(group.items);
          if (filteredItems.length === 0) return null;

          return (
            <Box key={group.id} sx={{ mb: isExpanded ? 2 : 1 }}>
              {isExpanded && (
                <Typography
                  variant="caption"
                  sx={{
                    px: 2,
                    py: 0.75,
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    letterSpacing: '0.5px',
                    display: 'block',
                  }}
                >
                  {group.label}
                </Typography>
              )}
              <List
                dense
                disablePadding
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isExpanded ? 'stretch' : 'center',
                  gap: isExpanded ? 0 : 1.1,
                  width: '100%',
                }}
              >
                {filteredItems.map((item) => (
                  <SidebarItem
                    key={item.id}
                  item={item}
                  userPermissions={userPermissions}
                  isExpanded={isExpanded}
                  iconMap={iconMap}
                  favorites={favorites}
                  onFavoriteToggle={toggleFavorite}
                  onSubmenuHover={handleSubmenuHover}
                  hoveredItemId={hoveredItemId}
                />
                ))}
              </List>
            </Box>
          );
        })}
      </Box>

      {!isExpanded && (
        <Box sx={{ pt: 1, pb: 2, display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              px: 1.4,
              py: 0.6,
              borderRadius: 999,
              backgroundColor: alpha(theme.palette.warning.main, 0.2),
              color: theme.palette.warning.dark,
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.4px',
              boxShadow: '0 6px 12px rgba(246, 177, 0, 0.2)',
            }}
          >
            Pro
          </Box>
        </Box>
      )}
    </Box>
  );

  React.useEffect(() => {
    if (!mainNavRef.current) return;
    // Reset scroll when role/permissions change to avoid large empty gaps.
    mainNavRef.current.scrollTop = 0;
  }, [userPermissions, isExpanded]);

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={isExpanded}
        onClose={toggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Desktop: Use Box instead of Drawer to avoid absolute positioning issues
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        overflowX: 'hidden',
        borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {drawerContent}
    </Box>
  );
}
