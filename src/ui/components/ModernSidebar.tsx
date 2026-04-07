"use client";

import * as React from "react";
import { Box, Drawer, List, Typography } from "@/src/ui/components/atoms";
import { useTheme, useMediaQuery, alpha } from "@mui/material";
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
  CalendarMonth,
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
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  FolderShared as FolderSharedIcon,
  CreditCard as CreditCardIcon,
  Chat as ChatIcon,
  EventNote,
  FamilyRestroom as FamilyRestroomIcon,
  Share as ShareIcon,
  Pending as PendingIcon,
  MenuBook as MenuBookIcon,
  TrackChanges as TrackChangesIcon,
  AccountBalance,
  DashboardOutlined,
  AccountBalanceWalletOutlined,
  AssignmentReturnOutlined,
  Shield,
  Vaccines,
  VolunteerActivism,
  BurstMode,
  ListAlt,
  Analytics,
  ContentCut as ContentCutIcon,
  Calculate as CalculateIcon,
  Build as BuildIcon,
  FactCheck,
  Publish,
} from "@mui/icons-material";
import { NAV_GROUPS } from "@/src/core/navigation/nav-config";
import { MenuItem, UserRole } from "@/src/core/navigation/types";
import { hasPermission } from "@/src/core/navigation/permissions";
import { useSidebarState } from "@/src/core/navigation/useSidebarState";
import { useNavigationState } from "@/src/core/navigation/hooks";
import SidebarItem from "./SidebarItem";

const DRAWER_WIDTH = 230;

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
  CalendarMonth,
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
  Home: HomeIcon,
  AccountCircle: AccountCircleIcon,
  FolderShared: FolderSharedIcon,
  CreditCard: CreditCardIcon,
  Chat: ChatIcon,
  EventNote,
  FamilyRestroom: FamilyRestroomIcon,
  Share: ShareIcon,
  Pending: PendingIcon,
  MenuBook: MenuBookIcon,
  TrackChanges: TrackChangesIcon,
  AccountBalance,
  DashboardOutlined,
  AccountBalanceWalletOutlined,
  AssignmentReturnOutlined,
  Shield,
  Vaccines,
  VolunteerActivism,
  PACS: BurstMode,
  ListAlt: ListAlt,
  Analytics: Analytics,
  Calculate: CalculateIcon,
  Build: BuildIcon,
  FactCheck: FactCheck,
  Publish: Publish,
  ContentCut: ContentCutIcon,
};

interface ModernSidebarProps {
  userPermissions: string[];
  userRole: UserRole;
}

export default function ModernSidebar({
  userPermissions,
  userRole,
}: ModernSidebarProps) {
  const theme = useTheme();
  const sidebarNavy = "#0A4472";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isExpanded, toggle } = useSidebarState();
  const { favorites, toggleFavorite, recentItems } = useNavigationState();
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);
  const mainNavRef = React.useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter menu items by permissions and roles
  const filterItems = (items: MenuItem[]): MenuItem[] => {
    if (!isMounted) return items; // Return raw items during SSR to match server
    return items
      .filter((item) => {
        // Check permissions
        const hasPerm =
          !item.requiredPermissions ||
          item.requiredPermissions.length === 0 ||
          item.requiredPermissions.some((perm) =>
            hasPermission(userPermissions, perm),
          );

        if (!hasPerm) return false;

        // Check roles
        const hasRole =
          !item.requiredRoles ||
          item.requiredRoles.length === 0 ||
          item.requiredRoles.includes(userRole);

        if (!hasRole) return false;

        // Hide for excluded roles (e.g. doctor should not see Admission/Bed/Discharge menus)
        const isExcluded =
          item.excludedRoles?.some(
            (r) =>
              String(r).toUpperCase() === String(userRole ?? "").toUpperCase(),
          ) ?? false;
        if (isExcluded) return false;

        return true;
      })
      .map((item) => {
        if (item.id === "doctors" && userRole === "DOCTOR") {
          return {
            id: "doctors-schedule",
            label: "My Schedule",
            iconName: "CalendarToday",
            route: "/doctors/schedule",
            type: "item" as const,
            requiredPermissions: ["doctors.read"],
            order: 4,
          };
        }
        const label =
          item.id === "doctors-schedule" && userRole === "DOCTOR"
            ? "My Schedule"
            : item.label;
        if (item.children) {
          const filteredChildren = filterItems(item.children);
          return { ...item, label, children: filteredChildren };
        }
        return { ...item, label };
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

  // Get recent menu items - only show leaf items (items with routes) that the user is allowed to see.
  const recentMenuItems = React.useMemo(() => {
    // 1. First, compute all allowed leaf items based on the robust filterItems function
    const allowedLeafItems = new Map<string, MenuItem>();
    const collectAllowedLeafs = (items: MenuItem[]) => {
      items.forEach((item) => {
        if (item.route) allowedLeafItems.set(item.id, item);
        if (item.children) collectAllowedLeafs(item.children);
      });
    };
    NAV_GROUPS.forEach((group) => {
      collectAllowedLeafs(filterItems(group.items));
    });

    // 2. Pick only those from the recentItems list
    const items: MenuItem[] = [];
    recentItems.forEach((id) => {
      const allowedItem = allowedLeafItems.get(id);
      if (allowedItem) {
        items.push(allowedItem);
      }
    });
    return items.slice(0, 5);
  }, [recentItems, userPermissions, userRole]);

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
       
      }}
    >
      {/* Header with Logo and Toggle */}
      <Box
        sx={{
          px: isExpanded ? 1.25 : 0.75,
          py: 0.35,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          borderBottom: `1px solid ${alpha("#FFFFFF", 0.14)}`,
          minHeight: { xs: 80, md: 95 },
          height: { xs: 80, md: 95 },
          backgroundColor: "transparent",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            px: isExpanded ? 1.75 : 1.1,
            py: 0.9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // width:"100%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
          }}
        >
          <Box
            component="img"
            src={"/scanbo.svg"}
            alt="Scanbo logo"
            sx={{
              height: isExpanded ? 65 : 55,
              width: "auto",
              objectFit: "contain",
              objectPosition: "center",
              display: "block",
            }}
          />
        </Box>
        {!isMobile && null}
      </Box>

      {/* Recent Items - Only show if not already visible in main menu */}
      {isExpanded &&
        recentMenuItems.length > 0 &&
        (() => {
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
            (item) => !allMainMenuIds.has(item.id),
          );

          if (uniqueRecentItems.length === 0) return null;

          return (
            <>
              <Box sx={{ px: 1.5, pb: 0.75 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: alpha("#FFFFFF", 0.46),
                    textTransform: "uppercase",
                    fontSize: "0.66rem",
                    letterSpacing: "0.42px",
                  }}
                >
                  Recent
                </Typography>
              </Box>
              <List dense sx={{ px: 0.6, pb: 0.5 }}>
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

      {isExpanded &&
        (() => {
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
            (item) => !allMainMenuIds.has(item.id),
          );
          return uniqueRecentItems.length > 0 ? (
            <Box
              sx={{
                height: 1,
                backgroundColor: alpha("#FFFFFF", 0.12),
                my: 0.75,
                mx: 1.6,
              }}
            />
          ) : null;
        })()}

      {/* Main Navigation Groups */}
      <Box
        ref={mainNavRef}
        className="sidebar-nav-scroll"
        sx={{
          flexGrow: 1,
          overflow: "auto",
          px: isExpanded ? 0.2 : 0.35,
          py: isExpanded ? 0.75 : 1.1,
          display: "flex",
          flexDirection: "column",
          alignItems: isExpanded ? "stretch" : "center",
        }}
      >
        {NAV_GROUPS.map((group) => {
          const filteredItems = filterItems(group.items);
          if (filteredItems.length === 0) return null;

          return (
            <Box key={group.id} sx={{ mb: isExpanded ? 1.35 : 0.95 }}>
              {isExpanded && !!group.label && (
                <Typography
                  variant="caption"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    fontWeight: 600,
                    color: alpha("#FFFFFF", 0.42),
                    textTransform: "uppercase",
                    fontSize: "0.66rem",
                    letterSpacing: "0.42px",
                    display: "block",
                  }}
                >
                  {group.label}
                </Typography>
              )}
              <List
                dense
                disablePadding
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isExpanded ? "stretch" : "center",
                  gap: isExpanded ? 0 : 0.5,
                  width: "100%",
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
        <Box sx={{ pt: 0.6, pb: 1.1, display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              px: 1.15,
              py: 0.4,
              borderRadius: 999,
              backgroundColor: alpha("#FFFFFF", 0.14),
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.68rem",
              letterSpacing: "0.34px",
              border: `1px solid ${alpha("#FFFFFF", 0.2)}`,
              boxShadow: "none",
            }}
          >
            PRO
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
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            backgroundColor: "transparent",
            padding: 8,
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
        width: "100%",
        height: "100%",
        // backgroundColor: "#0A4472",
       backgroundColor: "#105489"
      }}
    >
      {drawerContent}
    </Box>
  );
}
