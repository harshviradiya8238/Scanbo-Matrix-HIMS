import { Checkbox as MuiCheckbox, CheckboxProps } from '@mui/material';

export type { CheckboxProps };

export default function Checkbox(props: CheckboxProps) {
  return <MuiCheckbox {...props} />;
}
