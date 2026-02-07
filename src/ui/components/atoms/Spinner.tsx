import { CircularProgress, CircularProgressProps } from '@mui/material';

export type { CircularProgressProps as SpinnerProps };

export default function Spinner({ size = 24, ...props }: CircularProgressProps) {
  return <CircularProgress size={size} {...props} />;
}
