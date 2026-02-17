import * as React from 'react';
import { alpha, useTheme } from '@/src/ui/theme';
import type { SxProps, Theme } from '@/src/ui/theme';
import type { ButtonProps, DialogProps } from '@mui/material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@/src/ui/components/atoms';

export interface CommonDialogProps
  extends Omit<DialogProps, 'onClose' | 'children' | 'title' | 'content'> {
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  content?: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: ButtonProps['color'];
  cancelColor?: ButtonProps['color'];
  confirmVariant?: ButtonProps['variant'];
  cancelVariant?: ButtonProps['variant'];
  confirmButtonProps?: Partial<ButtonProps>;
  cancelButtonProps?: Partial<ButtonProps>;
  hideCancel?: boolean;
  hideActions?: boolean;
  loading?: boolean;
  contentDividers?: boolean;
  titleSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  actionsSx?: SxProps<Theme>;
}

const CommonDialog = ({
  open,
  onClose,
  title,
  subtitle,
  description,
  content,
  children,
  icon,
  actions,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'primary',
  cancelColor = 'inherit',
  confirmVariant = 'contained',
  cancelVariant = 'outlined',
  confirmButtonProps,
  cancelButtonProps,
  hideCancel,
  hideActions,
  loading,
  contentDividers = false,
  titleSx,
  contentSx,
  actionsSx,
  maxWidth = 'xs',
  fullWidth = true,
  ...dialogProps
}: CommonDialogProps) => {
  const theme = useTheme();
  const bodyContent = content ?? children;
  const showHeader = Boolean(title || subtitle || icon);
  const isSimpleTitle = typeof title === 'string' || typeof title === 'number';

  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth={fullWidth} maxWidth={maxWidth} {...dialogProps}>
      {showHeader && (
        <DialogTitle sx={{ pb: bodyContent || description ? 1 : 2, ...titleSx }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {icon && (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                }}
              >
                {icon}
              </Box>
            )}
            <Box>
              {title && (
                isSimpleTitle ? (
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {title}
                  </Typography>
                ) : (
                  title
                )
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogTitle>
      )}
      {(description || bodyContent) && (
        <DialogContent dividers={contentDividers} sx={{ pt: showHeader ? 0 : 2, ...contentSx }}>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: bodyContent ? 1.5 : 0 }}>
              {description}
            </Typography>
          )}
          {bodyContent}
        </DialogContent>
      )}
      {!hideActions && (
        <DialogActions sx={{ px: 3, pb: 2, pt: description || bodyContent ? 0 : 1, ...actionsSx }}>
          {actions ?? (
            <>
              {!hideCancel && (
                <Button
                  {...cancelButtonProps}
                  variant={cancelVariant}
                  color={cancelColor}
                  onClick={onClose}
                  disabled={loading}
                >
                  {cancelLabel}
                </Button>
              )}
              {onConfirm && (
                <Button
                  {...confirmButtonProps}
                  variant={confirmVariant}
                  color={confirmColor}
                  onClick={onConfirm}
                  disabled={loading}
                >
                  {confirmLabel}
                </Button>
              )}
            </>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CommonDialog;
