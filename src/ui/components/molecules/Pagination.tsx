import { Pagination as MuiPagination, PaginationProps } from '@mui/material';

export type { PaginationProps };

export default function Pagination({ size = 'small', ...props }: PaginationProps) {
  return <MuiPagination size={size} {...props} />;
}
