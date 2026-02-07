import * as React from 'react';
import { Box, Stack } from '@/src/ui/components/atoms';
import Avatar, { AvatarProps } from '@/src/ui/components/atoms/Avatar';
import Text from '@/src/ui/components/atoms/Text';
import { SxProps, Theme } from '@mui/material';

interface AvatarWithNameProps {
  name: string;
  subtitle?: string;
  avatarSrc?: string;
  size?: number;
  avatarProps?: AvatarProps;
  trailing?: React.ReactNode;
  stackSx?: SxProps<Theme>;
  detailsSx?: SxProps<Theme>;
  nameProps?: React.ComponentProps<typeof Text>;
  subtitleProps?: React.ComponentProps<typeof Text>;
}

export default function AvatarWithName({
  name,
  subtitle,
  avatarSrc,
  size = 36,
  avatarProps,
  trailing,
  stackSx,
  detailsSx,
  nameProps,
  subtitleProps,
}: AvatarWithNameProps) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={stackSx}>
      <Avatar
        src={avatarSrc}
        {...avatarProps}
        sx={{
          width: size,
          height: size,
          fontSize: size * 0.4,
          fontWeight: 600,
          ...(avatarProps?.sx ?? {}),
        }}
      >
        {name.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0, ...detailsSx }}>
        <Text
          variant="body1"
          sx={{
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          {...nameProps}
        >
          {name}
        </Text>
        {subtitle ? (
          <Text
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: 'capitalize' }}
            {...subtitleProps}
          >
            {subtitle}
          </Text>
        ) : null}
      </Box>
      {trailing ? <Box sx={{ ml: 0.5 }}>{trailing}</Box> : null}
    </Stack>
  );
}
