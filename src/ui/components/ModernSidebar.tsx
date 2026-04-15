"use client";

import * as React from "react";
import { Box, Drawer, List, Typography } from "@/src/ui/components/atoms";
import { useTheme, useMediaQuery, alpha } from "@mui/material";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isExpanded, toggle } = useSidebarState();
  const { favorites, toggleFavorite, recentItems } = useNavigationState();
  const mainNavRef = React.useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredNavGroups = React.useMemo(() => {
    const filterItems = (items: MenuItem[]): MenuItem[] => {
      if (!isMounted) return items;

      return items.flatMap((item) => {
        const hasPerm =
          !item.requiredPermissions ||
          item.requiredPermissions.length === 0 ||
          item.requiredPermissions.some((perm) =>
            hasPermission(userPermissions, perm),
          );
        if (!hasPerm) return [];

        const hasRole =
          !item.requiredRoles ||
          item.requiredRoles.length === 0 ||
          item.requiredRoles.includes(userRole);
        if (!hasRole) return [];

        const isExcluded =
          item.excludedRoles?.some(
            (r) =>
              String(r).toUpperCase() === String(userRole ?? "").toUpperCase(),
          ) ?? false;
        if (isExcluded) return [];

        if (item.id === "doctors" && userRole === "DOCTOR") {
          return [
            {
              id: "doctors-schedule",
              label: "My Schedule",
              iconName: "CalendarToday",
              route: "/doctors/schedule",
              type: "item" as const,
              requiredPermissions: ["doctors.read"],
              order: 4,
            },
          ];
        }

        const label =
          item.id === "doctors-schedule" && userRole === "DOCTOR"
            ? "My Schedule"
            : item.label;

        if (!item.children || item.children.length === 0) {
          if (label === item.label) return [item];
          return [{ ...item, label }];
        }

        const children = filterItems(item.children);
        if (children.length === 0) return [];

        return [{ ...item, label, children }];
      });
    };

    return NAV_GROUPS.map((group) => ({
      ...group,
      items: filterItems(group.items),
    })).filter((group) => group.items.length > 0);
  }, [isMounted, userPermissions, userRole]);

  const { allowedLeafItemsById, mainMenuLeafIds } = React.useMemo(() => {
    const byId = new Map<string, MenuItem>();
    const mainIds = new Set<string>();

    const collectLeafs = (items: MenuItem[]) => {
      items.forEach((item) => {
        if (item.route) {
          byId.set(item.id, item);
          mainIds.add(item.id);
        }
        if (item.children) collectLeafs(item.children);
      });
    };

    filteredNavGroups.forEach((group) => collectLeafs(group.items));

    return { allowedLeafItemsById: byId, mainMenuLeafIds: mainIds };
  }, [filteredNavGroups]);

  const recentMenuItems = React.useMemo(() => {
    const items: MenuItem[] = [];
    recentItems.forEach((id) => {
      const item = allowedLeafItemsById.get(id);
      if (item) items.push(item);
    });
    return items.slice(0, 5);
  }, [recentItems, allowedLeafItemsById]);

  const uniqueRecentMenuItems = React.useMemo(
    () => recentMenuItems.filter((item) => !mainMenuLeafIds.has(item.id)),
    [recentMenuItems, mainMenuLeafIds],
  );

  const prefetchRoutes = React.useMemo(() => {
    const routes = new Set<string>();
    const collectRoutes = (items: MenuItem[]) => {
      items.forEach((item) => {
        if (item.route) routes.add(item.route);
        if (item.children) collectRoutes(item.children);
      });
    };

    filteredNavGroups.forEach((group) => collectRoutes(group.items));
    uniqueRecentMenuItems.forEach((item) => {
      if (item.route) routes.add(item.route);
    });

    return Array.from(routes);
  }, [filteredNavGroups, uniqueRecentMenuItems]);

  React.useEffect(() => {
    if (!isMounted || prefetchRoutes.length === 0) return;
    if (typeof window === "undefined") return;

    let canceled = false;
    let timeoutHandle: number | null = null;
    let idleHandle: number | null = null;
    let index = 0;
    const CHUNK_SIZE = 8;
    const CHUNK_DELAY_MS = 70;

    const win = window as Window & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions,
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const runChunk = () => {
      if (canceled) return;
      const end = Math.min(index + CHUNK_SIZE, prefetchRoutes.length);
      for (let cursor = index; cursor < end; cursor += 1) {
        router.prefetch(prefetchRoutes[cursor]);
      }
      index = end;
      if (index >= prefetchRoutes.length) return;
      timeoutHandle = window.setTimeout(scheduleChunk, CHUNK_DELAY_MS);
    };

    const scheduleChunk = () => {
      if (canceled) return;
      if (win.requestIdleCallback) {
        idleHandle = win.requestIdleCallback(() => runChunk(), {
          timeout: 1000,
        });
        return;
      }
      timeoutHandle = window.setTimeout(runChunk, CHUNK_DELAY_MS);
    };

    if (win.requestIdleCallback) {
      idleHandle = win.requestIdleCallback(() => runChunk(), {
        timeout: 1200,
      });
    } else {
      timeoutHandle = window.setTimeout(runChunk, 120);
    }

    return () => {
      canceled = true;
      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle);
      }
      if (idleHandle !== null) {
        win.cancelIdleCallback?.(idleHandle);
      }
    };
  }, [isMounted, prefetchRoutes, router]);

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
      {isExpanded && uniqueRecentMenuItems.length > 0 && (
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
            {uniqueRecentMenuItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                userPermissions={userPermissions}
                isExpanded={isExpanded}
                iconMap={iconMap}
                favorites={favorites}
                onFavoriteToggle={toggleFavorite}
              />
            ))}
          </List>
        </>
      )}

      {isExpanded && uniqueRecentMenuItems.length > 0 && (
        <Box
          sx={{
            height: 1,
            backgroundColor: alpha("#FFFFFF", 0.12),
            my: 0.75,
            mx: 1.6,
          }}
        />
      )}

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
        {filteredNavGroups.map((group) => {
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
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    userPermissions={userPermissions}
                    isExpanded={isExpanded}
                    iconMap={iconMap}
                    favorites={favorites}
                    onFavoriteToggle={toggleFavorite}
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
