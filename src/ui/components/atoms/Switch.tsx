import { Switch as MuiSwitch, SwitchProps } from '@mui/material';

export type { SwitchProps };

export default function Switch(props: SwitchProps) {
  return <MuiSwitch {...props} />;
}
