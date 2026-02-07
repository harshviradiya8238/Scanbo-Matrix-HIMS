'use client';

import * as React from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
} from '@/src/ui/components/atoms';
import { alpha, useTheme } from '@mui/material';
import { MenuItem } from '@/src/core/navigation/types';
import { hasPermission } from '@/src/core/navigation/permissions';

interface SidebarPopoverProps {
  anchorEl: HTMLElement | null;
  item: MenuItem;
  userPermissions: string[];
  onClose: () => void;
  onNavigate: (route: string) => void;
  pathname: string;
  iconMap: Record<string, React.ComponentType>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function SidebarPopover({
  anchorEl,
  item,
  userPermissions,
  onClose,
  onNavigate,
  pathname,
  iconMap,
  onMouseEnter,
  onMouseLeave,
}: SidebarPopoverProps) {
  const router = useRouter();
  const theme = useTheme();
  const open = Boolean(anchorEl);
  const prefetchedRoutesRef = React.useRef<Set<string>>(new Set());

  const prefetchRoute = React.useCallback(
    (route?: string | null) => {
      if (!route || prefetchedRoutesRef.current.has(route)) return;
      router.prefetch(route);
      prefetchedRoutesRef.current.add(route);
    },
    [router]
  );

  if (!item.children || item.children.length === 0 || !anchorEl || !open) {
    return null;
  }

  const filteredChildren = item.children.filter((child) => {
    if (!child.requiredPermissions || child.requiredPermissions.length === 0) {
      return true;
    }
    return child.requiredPermissions.some((perm) => hasPermission(userPermissions, perm));
  });

  if (filteredChildren.length === 0) {
    return null;
  }

  // Close popover when clicking outside
  React.useEffect(() => {
    if (!anchorEl || typeof window === 'undefined') return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const popover = document.querySelector('[data-popover]');
      if (
        popover &&
        anchorEl &&
        !popover.contains(target) &&
        !anchorEl.contains(target) &&
        !anchorEl.isSameNode(target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [anchorEl, onClose]);

  const handleItemClick = (route?: string) => {
    if (route) {
      onNavigate(route);
      onClose();
    }
  };

  // Calculate position - use portal-like positioning
  const rect = anchorEl.getBoundingClientRect();
  const popoverStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${rect.right + 8}px`,
    top: `${rect.top}px`,
    zIndex: theme.zIndex.modal - 1, // Below modals but above drawer
    minWidth: 200,
    maxHeight: '80vh',
    overflowY: 'auto',
    pointerEvents: 'auto',
  };

  return (
    <Paper
      data-popover
      elevation={8}
      onClick={(e) => e.stopPropagation()}
      sx={{
        ...popoverStyle,
        borderRadius: 2,
        boxShadow: theme.shadows[8],
        border: `1px solid ${theme.palette.divider}`,
        pointerEvents: 'auto',
      }}
      onMouseEnter={() => {
        onMouseEnter?.();
      }}
      onMouseLeave={() => {
        onMouseLeave?.();
      }}
    >
      <Box sx={{ p: 1 }}>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 1,
            fontWeight: 600,
            color: theme.palette.text.secondary,
            textTransform: 'uppercase',
            display: 'block',
          }}
        >
          {item.label}
        </Typography>
        <List dense disablePadding>
          {filteredChildren.map((child) => {
            const IconComponent = child.iconName ? iconMap[child.iconName] : null;
            const isActive = child.route === pathname;
            const hasSubmenu = child.children && child.children.length > 0;

            if (hasSubmenu) {
              // For nested submenus, show them inline for now
              return (
                <React.Fragment key={child.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={child.route ? (NextLink as any) : 'div'}
                      href={child.route || undefined}
                      onClick={() => child.route && handleItemClick(child.route)}
                      onMouseEnter={() => prefetchRoute(child.route)}
                      onFocus={() => prefetchRoute(child.route)}
                      onTouchStart={() => prefetchRoute(child.route)}
                      selected={isActive}
                      sx={{
                        borderRadius: 1,
                        '&.Mui-selected': {
                          backgroundColor: theme.palette.primary.light,
                          color: theme.palette.primary.main,
                          '& .MuiListItemIcon-root': {
                            color: theme.palette.primary.main,
                          },
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.12),
                          },
                        },
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.12),
                          '& .MuiListItemIcon-root': {
                            color: theme.palette.primary.main,
                          },
                        },
                      }}
                    >
                      {IconComponent && (
                        <ListItemIcon
                          sx={{
                            minWidth: 36,
                            color: theme.palette.primary.main,
                            '& svg': { fontSize: 20 },
                          }}
                        >
                          <IconComponent />
                        </ListItemIcon>
                      )}
                      <ListItemText
                        primary={child.label}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: isActive ? 600 : 400,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                  {child.children?.map((subChild) => {
                    const SubIconComponent = subChild.iconName ? iconMap[subChild.iconName] : null;
                    const isSubActive = subChild.route === pathname;
                    return (
                      <ListItem key={subChild.id} disablePadding sx={{ pl: 4 }}>
                        <ListItemButton
                          component={subChild.route ? (NextLink as any) : 'div'}
                          href={subChild.route || undefined}
                          onClick={() => subChild.route && handleItemClick(subChild.route)}
                          onMouseEnter={() => prefetchRoute(subChild.route)}
                          onFocus={() => prefetchRoute(subChild.route)}
                          onTouchStart={() => prefetchRoute(subChild.route)}
                          selected={isSubActive}
                          sx={{
                            borderRadius: 1,
                            '&.Mui-selected': {
                              backgroundColor: theme.palette.primary.light,
                              color: theme.palette.primary.main,
                              '& .MuiListItemIcon-root': {
                                color: theme.palette.primary.main,
                              },
                            },
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.12),
                              '& .MuiListItemIcon-root': {
                                color: theme.palette.primary.main,
                              },
                            },
                          }}
                        >
                          {SubIconComponent && (
                            <ListItemIcon
                              sx={{
                                minWidth: 36,
                                color: theme.palette.primary.main,
                                '& svg': { fontSize: 20 },
                              }}
                            >
                              <SubIconComponent />
                            </ListItemIcon>
                          )}
                          <ListItemText
                            primary={subChild.label}
                            primaryTypographyProps={{
                              variant: 'body2',
                              fontSize: '0.875rem',
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </React.Fragment>
              );
            }

            return (
              <ListItem key={child.id} disablePadding>
                <ListItemButton
                  component={child.route ? (NextLink as any) : 'div'}
                  href={child.route || undefined}
                  onClick={() => child.route && handleItemClick(child.route)}
                  onMouseEnter={() => prefetchRoute(child.route)}
                  onFocus={() => prefetchRoute(child.route)}
                  onTouchStart={() => prefetchRoute(child.route)}
                  selected={isActive}
                  sx={{
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.primary.main,
                      },
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      },
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.primary.main,
                      },
                    },
                  }}
                >
                  {IconComponent && (
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: theme.palette.primary.main,
                        '& svg': { fontSize: 20 },
                      }}
                    >
                      <IconComponent />
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={child.label}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Paper>
  );
}
