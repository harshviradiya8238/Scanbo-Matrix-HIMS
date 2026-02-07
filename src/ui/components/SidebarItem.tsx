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
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { MenuItem } from '@/src/core/navigation/types';
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
  const router = useRouter();
  const pathname = usePathname();
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
  const isActive = item.route === pathname;
  const hasActiveDescendant = React.useMemo(() => {
    if (!hasChildren || !item.children) return false;
    const checkChild = (child: MenuItem): boolean => {
      if (child.route === pathname) return true;
      if (child.children) return child.children.some(checkChild);
      return false;
    };
    return item.children.some(checkChild);
  }, [hasChildren, item.children, pathname]);
  const isHighlighted = isActive || hasActiveDescendant;
  const isFavorite = favorites.includes(item.id);
  const isHovered = hoveredItemId === item.id;

  // Auto-expand if active route is in children
  React.useEffect(() => {
    if (hasChildren && item.children) {
      const hasActiveChild = item.children.some((child) => {
        if (child.route === pathname) return true;
        if (child.children) {
          return child.children.some((subChild) => subChild.route === pathname);
        }
        return false;
      });
      if (hasActiveChild) {
        setIsOpen(true);
      }
    }
  }, [pathname, hasChildren, item.children]);

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
        pl: isExpanded ? (level > 0 ? 3.25 : 1.25) : 0,
        pr: isExpanded ? 1.25 : 0,
        justifyContent: isExpanded ? 'flex-start' : 'center',
        alignItems: 'center',
        minHeight: 42,
        borderRadius: 2.2,
        border: '1px solid',
        borderColor: 'transparent',
        mb: 0.25,
        position: 'relative',
        overflow: 'visible',
        zIndex: 1,
        '&.Mui-selected': {
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)} 0%, ${alpha(
            theme.palette.info.main,
            0.14
          )} 100%)`,
          borderColor: alpha(theme.palette.primary.main, 0.24),
          color: theme.palette.primary.main ,
          fontWeight: 600,
          '&:hover': {
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.22)} 0%, ${alpha(
              theme.palette.info.main,
              0.18
            )} 100%)`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            left: isExpanded ? 0 : -6,
            top: '50%',
            transform: 'translateY(-50%)',
            width: isExpanded ? 4 : 3,
            height: '60%',
            backgroundColor: theme.palette.primary.main,
            borderRadius: '0 2px 2px 0',
          },
          '& .MuiListItemIcon-root': {
            color: theme.palette.primary.main,
          },
        },
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, isExpanded ? 0.07 : 0.1),
          borderColor: alpha(theme.palette.primary.main, 0.24),
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
        },
        transition: theme.transitions.create(['background-color', 'color'], {
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
            minWidth: isExpanded ? 40 : 36,
            color: theme.palette.primary.main,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            display: 'flex',
            borderRadius: 1.4,
            bgcolor: 'transparent',
            width: isExpanded ? 'auto' : 36,
            height: isExpanded ? 'auto' : 36,
            mr: 0,
            '& svg': {
              fontSize: isExpanded ? 23 : 22,
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
              fontWeight: isHighlighted ? 600 : 500,
              fontSize: '0.935rem',
            }}
            sx={{ my: 0 }}
          />

          {hasChildren && (
            <Box sx={{ ml: 1 }}>
              {isOpen ? (
                <ExpandLess sx={{ fontSize: 20, color: theme.palette.primary.main }} />
              ) : (
                <ExpandMore sx={{ fontSize: 20, color: theme.palette.primary.main }} />
              )}
            </Box>
          )}

          {item.badgeCount !== undefined && item.badgeCount > 0 && (
            <Chip
              label={item.badgeCount}
              size="small"
              color="error"
              sx={{
                ml: 1,
                height: 20,
                minWidth: 20,
                fontSize: '0.7rem',
                fontWeight: 600,
              }}
            />
          )}

          {onFavoriteToggle && (
            <IconButton
              size="small"
              onClick={handleFavoriteClick}
              sx={{
                ml: 0.5,
                p: 0.5,
                color: isFavorite ? theme.palette.warning.main : theme.palette.text.disabled,
                '&:hover': {
                  color: theme.palette.warning.main,
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
          pathname={pathname ?? ''}
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
          <List component="div" disablePadding sx={{ pl: 1.5, pt: 0.5 }}>
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
        </Collapse>
      )}
    </>
  );
}
