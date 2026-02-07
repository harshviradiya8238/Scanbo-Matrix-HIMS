import { Badge as MuiBadge, BadgeProps } from '@mui/material';

export type { BadgeProps };

export default function Badge(props: BadgeProps) {
  return <MuiBadge {...props} />;
}
