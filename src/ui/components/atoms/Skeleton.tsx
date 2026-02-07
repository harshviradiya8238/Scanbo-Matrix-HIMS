import { Skeleton as MuiSkeleton, SkeletonProps } from '@mui/material';

export type { SkeletonProps };

export default function Skeleton(props: SkeletonProps) {
  return <MuiSkeleton {...props} />;
}
