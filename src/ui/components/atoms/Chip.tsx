import { Chip as MuiChip, ChipProps } from '@mui/material';

export type { ChipProps };

export default function Chip(props: ChipProps) {
  const { variant, ...rest } = props;
  return <MuiChip variant="outlined" {...rest} />;
}
