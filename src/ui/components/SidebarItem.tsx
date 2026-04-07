'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Chip,
  Box,
  useTheme,
  alpha,
  List,
  IconButton,
} from '@mui/material';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
} from '@mui/icons-material';
import { MenuItem } from '@/src/core/navigation/types';
import { resolveNavigationRoute } from '@/src/core/navigation/nav-config';
import { hasPermission } from '@/src/core/navigation/permissions';
import SidebarPopover from './SidebarPopover';

interface SidebarItemProps {
  item: MenuItem;
  userPermissions: string[];
  isExpanded: boolean;
  level?: number;
  iconMap: Record<string, React.ComponentType>;
  favorites?: string[];
  onFavoriteToggle?: (itemId: string) => void;
  onSubmenuHover?: (item: MenuItem, anchorEl: HTMLElement | null) => void;
  hoveredItemId?: string | null;
}

export default function SidebarItem({
  item,
  userPermissions,
  isExpanded,
  level = 0,
  iconMap,
  favorites = [],
  onFavoriteToggle,
  onSubmenuHover,
  hoveredItemId,
}: SidebarItemProps) {
  const theme = useTheme();
  const brandPrimary = theme.palette.primary.main;
  const sidebarNavy = "#0A4472";
  const router = useRouter();
  const pathname = usePathname();
  const activeRoute = React.useMemo(() => resolveNavigationRoute(pathname ?? ''), [pathname]);
  const [isOpen, setIsOpen] = React.useState(false);
  const itemRef = React.useRef<HTMLDivElement>(null);
  const [popoverAnchor, setPopoverAnchor] = React.useState<HTMLElement | null>(null);
  const prefetchedRoutesRef = React.useRef<Set<string>>(new Set());

  const hasAccess = item.requiredPermissions
    ? item.requiredPermissions.some((perm) => hasPermission(userPermissions, perm))
    : true;

  if (!hasAccess) return null;

  const IconComponent = item.iconName ? iconMap[item.iconName] : null;
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.route === activeRoute;
  const hasActiveDescendant = React.useMemo(() => {
    if (!hasChildren || !item.children) return false;
    const checkChild = (child: MenuItem): boolean => {
      if (child.route === activeRoute) return true;
      if (child.children) return child.children.some(checkChild);
      return false;
    };
    return item.children.some(checkChild);
  }, [activeRoute, hasChildren, item.children]);
  const isHighlighted = isActive || hasActiveDescendant;
  const isFavorite = favorites.includes(item.id);
  const isHovered = hoveredItemId === item.id;
  const isCollapsed = !isExpanded;

  // Auto-expand if active route is in children
  React.useEffect(() => {
    if (hasChildren && item.children) {
      const hasActiveChild = item.children.some((child) => {
        if (child.route === activeRoute) return true;
        if (child.children) {
          return child.children.some((subChild) => subChild.route === activeRoute);
        }
        return false;
      });
      if (hasActiveChild) {
        setIsOpen(true);
      }
    }
  }, [activeRoute, hasChildren, item.children]);

  // Close popover when sidebar expands
  React.useEffect(() => {
    if (isExpanded && popoverAnchor) {
      setPopoverAnchor(null);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
    }
  }, [isExpanded, popoverAnchor]);

  // Ensure popover is closed on mount to prevent blocking
  React.useEffect(() => {
    setPopoverAnchor(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const handleClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (hasChildren) {
      if (isExpanded) {
        setIsOpen((prev) => !prev);
      } else {
        // When collapsed, show popover on click
        if (itemRef.current) {
          setPopoverAnchor(itemRef.current);
        }
      }
    } else if (item.route) {
      router.push(item.route);
    }
  };

  const prefetchRoute = React.useCallback(
    (route?: string | null) => {
      if (!route || prefetchedRoutesRef.current.has(route)) return;
      router.prefetch(route);
      prefetchedRoutesRef.current.add(route);
    },
    [router]
  );

  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    prefetchRoute(item.route);
    if (!isExpanded && hasChildren && itemRef.current) {
      // Clear any pending close timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      setPopoverAnchor(itemRef.current);
      onSubmenuHover?.(item, itemRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (!isExpanded && popoverAnchor) {
      // Delay to allow moving to popover
      hoverTimeoutRef.current = setTimeout(() => {
        // Only close if mouse is not over popover
        const popover = document.querySelector('[data-popover]');
        if (!popover?.matches(':hover')) {
          setPopoverAnchor(null);
        }
        hoverTimeoutRef.current = null;
      }, 200);
    }
  };

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(item.id);
  };

  const itemContent = (
    <ListItemButton
      ref={itemRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => prefetchRoute(item.route)}
      onTouchStart={() => prefetchRoute(item.route)}
      selected={isHighlighted}
      sx={{
        pl: isExpanded ? (level > 0 ? 2.35 : 1) : 0,
        pr: isExpanded ? 1 : 0,
        justifyContent: isExpanded ? 'flex-start' : 'center',
        alignItems: 'center',
        minHeight: isExpanded ? 30 : 40,
        width: isExpanded ? '100%' : 40,
        height: isExpanded ? 'auto' : 40,
        mx: isExpanded ? 0.3 : 'auto',
        my: isExpanded ? 0.05 : 0.4,
        p: isExpanded ? '4px 10px' : 0,
        borderRadius: isExpanded ? 2.5 : 2.8,
        border: '1px solid',
        borderColor: isExpanded ? 'transparent' : alpha('#FFFFFF', 0.2),
        backgroundColor: isExpanded ? 'transparent' : alpha('#FFFFFF', 0.06),
        color: isExpanded ? alpha('#FFFFFF', 0.92) : alpha('#FFFFFF', 0.92),
        boxShadow: isExpanded
          ? 'none'
          : 'none',
        position: 'relative',
        overflow: 'visible',
        zIndex: 1,
        '&.Mui-selected': isExpanded
          ? {
              backgroundColor: '#FFFFFF',
              borderColor: alpha('#FFFFFF', 0.95),
              color: sidebarNavy,
              fontWeight: 700,
              boxShadow: `0 8px 16px ${alpha('#000000', 0.18)}`,
              '&:hover': {
                backgroundColor: '#FFFFFF',
              },
              '& .MuiListItemIcon-root': {
                color: brandPrimary,
              },
              '& .MuiListItemText-primary': {
                color: sidebarNavy,
              },
            }
          : {
              backgroundColor: '#FFFFFF',
              borderColor: alpha(brandPrimary, 0.36),
              boxShadow: `0 8px 16px ${alpha('#000000', 0.2)}`,
              color: sidebarNavy,
              '& .MuiListItemIcon-root': {
                color: brandPrimary,
              },
            },
        '&:hover': {
          backgroundColor: isExpanded
            ? alpha('#FFFFFF', 0.12)
            : alpha('#FFFFFF', 0.14),
          borderColor: alpha('#FFFFFF', 0.24),
          boxShadow: isExpanded
            ? 'none'
            : `0 6px 14px ${alpha('#000000', 0.2)}`,
          color: '#FFFFFF',
        },
        '&:focus-visible': {
          outline: `2px solid ${alpha('#FFFFFF', 0.9)}`,
          outlineOffset: '2px',
        },
        transition: theme.transitions.create(['background-color', 'color', 'border-color', 'box-shadow', 'transform'], {
          duration: theme.transitions.duration.short,
        }),
      }}
      aria-label={item.label}
      aria-expanded={hasChildren ? isOpen : undefined}
      aria-current={isActive ? 'page' : undefined}
    >
      {IconComponent && (
        <ListItemIcon
          sx={{
            minWidth: isExpanded ? 30 : 0,
            color: isExpanded ? alpha('#FFFFFF', 0.92) : alpha('#FFFFFF', 0.92),
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            display: 'flex',
            borderRadius: isExpanded ? 1.2 : 1.7,
            bgcolor: 'transparent',
            width: isExpanded ? 30 : '100%',
            height: isExpanded ? 30 : '100%',
            mr: 0,
            '& svg': {
              fontSize: 19,
              display: 'block',
            },
          }}
        >
          <IconComponent />
        </ListItemIcon>
      )}

      {isExpanded && (
        <>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              variant: 'body2',
              fontWeight: isHighlighted ? 700 : 500,
              fontSize: '0.875rem',
            }}
            sx={{ my: 0 }}
          />

          {hasChildren && (
            <Box sx={{ ml: 'auto', pl: 0.75, flexShrink: 0 }}>
              {isOpen ? (
                <RemoveCircleOutlineIcon sx={{ fontSize: 16, color: isHighlighted ? brandPrimary : alpha('#FFFFFF', 0.55), display: 'block' }} />
              ) : (
                <AddCircleOutlineIcon sx={{ fontSize: 16, color: isHighlighted ? brandPrimary : alpha('#FFFFFF', 0.55), display: 'block' }} />
              )}
            </Box>
          )}

          {item.badgeCount !== undefined && item.badgeCount > 0 && (
            <Chip
              label={item.badgeCount}
              size="small"
              color="error"
              sx={{
                ml: 0.75,
                height: 18,
                minWidth: 18,
                fontSize: '0.66rem',
                fontWeight: 600,
              }}
            />
          )}

          {onFavoriteToggle && (
            <IconButton
              size="small"
              onClick={handleFavoriteClick}
              sx={{
                ml: 0.35,
                p: 0.4,
                color: isFavorite ? '#F5A623' : alpha('#FFFFFF', 0.45),
                '&:hover': {
                  color: '#F5A623',
                },
              }}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {/* {isFavorite ? (
                <StarIcon sx={{ fontSize: 18 }} />
              ) : (
                <StarBorderIcon sx={{ fontSize: 18 }} />
              )} */}
            </IconButton>
          )}
        </>
      )}
    </ListItemButton>
  );

  // When collapsed, wrap in tooltip
  if (!isExpanded && !hasChildren) {
    return (
      // <Tooltip title={item.label} placement="right" arrow>
        <ListItem disablePadding>
          {itemContent}
        </ListItem>
      // </Tooltip>
    );
  }

  return (
    <>
      {isExpanded ? (
        <ListItem disablePadding>
          {itemContent}
        </ListItem>
      ) : (
        // <Tooltip title={item.label} placement="right" arrow>
          <ListItem disablePadding>{itemContent}</ListItem>
        // </Tooltip>
      )}

      {/* Popover for collapsed state with submenu */}
      {!isExpanded && hasChildren && popoverAnchor && (
        <SidebarPopover
          anchorEl={popoverAnchor}
          item={item}
          userPermissions={userPermissions}
          onClose={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
            setPopoverAnchor(null);
          }}
          onNavigate={(route) => {
            if (route) {
              router.push(route);
            }
            setPopoverAnchor(null);
          }}
          pathname={activeRoute}
          iconMap={iconMap}
          onMouseEnter={() => {
            // Clear close timeout when mouse enters popover
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            // Close popover when mouse leaves
            hoverTimeoutRef.current = setTimeout(() => {
              setPopoverAnchor(null);
              hoverTimeoutRef.current = null;
            }, 150);
          }}
        />
      )}

      {/* Expanded submenu */}
      {isExpanded && hasChildren && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <Box sx={{
            ml: 2.4,
            pl: 1.2,
            borderLeft: `2px solid ${alpha('#FFFFFF', 0.18)}`,
            mt: 0.25,
            mb: 0.5,
          }}>
          <List component="div" disablePadding>
            {item.children?.map((child) => (
              <SidebarItem
                key={child.id}
                item={child}
                userPermissions={userPermissions}
                isExpanded={isExpanded}
                level={level + 1}
                iconMap={iconMap}
                favorites={favorites}
                onFavoriteToggle={onFavoriteToggle}
                onSubmenuHover={onSubmenuHover}
                hoveredItemId={hoveredItemId}
              />
            ))}
          </List>
          </Box>
        </Collapse>
      )}
    </>
  );
}
