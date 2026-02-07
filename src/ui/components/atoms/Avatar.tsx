import { Avatar as MuiAvatar, AvatarProps } from '@mui/material';

export type { AvatarProps };

export default function Avatar(props: AvatarProps) {
  return <MuiAvatar {...props} />;
}
