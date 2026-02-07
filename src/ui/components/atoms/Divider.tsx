import { Divider as MuiDivider, DividerProps } from '@mui/material';

export type { DividerProps };

export default function Divider(props: DividerProps) {
  return <MuiDivider {...props} />;
}
