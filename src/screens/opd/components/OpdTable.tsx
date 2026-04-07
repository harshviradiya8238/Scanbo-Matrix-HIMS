'use client';

import * as React from 'react';
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@/src/ui/components/atoms';
import { Card } from '@/src/ui/components/molecules';
import { alpha, useTheme } from '@/src/ui/theme';

export interface OpdTableColumn<T> {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => React.ReactNode;
}

interface OpdTableProps<T> {
  columns: OpdTableColumn<T>[];
  rows: T[];
  emptyMessage: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
  rowKey?: (row: T, index: number) => React.Key;
  variant?: 'card' | 'plain';
}

export default function OpdTable<T>({
  columns,
  rows,
  emptyMessage,
  title,
  action,
  rowKey,
  variant = 'card',
}: OpdTableProps<T>) {
  const theme = useTheme();

  const content = (
    <>
      {title || action ? (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Box>
            {typeof title === 'string' ? (
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
            ) : (
              title
            )}
          </Box>
          <Box>{action}</Box>
        </Stack>
      ) : null}

      <Table
        size="small"
        sx={{
          borderCollapse: 'collapse',
          '& .MuiTableCell-root': {
            borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
          },
          '& .MuiTableRow-root:last-of-type .MuiTableCell-root': {
            borderBottom: 'none',
          },
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              '& .MuiTableCell-root': {
                color: 'text.secondary',
                fontWeight: 700,
                borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                backgroundColor: alpha(theme.palette.text.primary, 0.05),
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontSize: '0.8rem',
              },
            }}
          >
            {columns.map((column) => (
              <TableCell key={column.id} align={column.align ?? 'left'}>{column.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow
                key={rowKey ? rowKey(row, index) : index}
                sx={{
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.text.primary, 0.03),
                  },
                }}
              >
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align ?? 'left'}>
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );

  if (variant === 'plain') {
    return <Box>{content}</Box>;
  }

  return (
    <Card elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      {content}
    </Card>
  );
}
