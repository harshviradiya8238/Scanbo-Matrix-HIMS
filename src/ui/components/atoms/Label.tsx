import * as React from 'react';
import { FormLabel as MuiFormLabel, FormLabelProps } from '@mui/material';

const Label = React.forwardRef<HTMLLabelElement, FormLabelProps>(function Label(props, ref) {
  return <MuiFormLabel ref={ref} {...props} />;
});

export type { FormLabelProps as LabelProps };
export default Label;
