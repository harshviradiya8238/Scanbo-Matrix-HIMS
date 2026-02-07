import { Radio as MuiRadio, RadioProps } from '@mui/material';

export type { RadioProps };

export default function Radio(props: RadioProps) {
  return <MuiRadio {...props} />;
}
