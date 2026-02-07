import * as React from 'react';
import { TextField as MuiTextField, TextFieldProps } from '@mui/material';

const Input = React.forwardRef<HTMLDivElement, TextFieldProps>(function Input(
  { size = 'small', ...props },
  ref
) {
  return <MuiTextField ref={ref} size={size} {...props} />;
});

export type { TextFieldProps as InputProps };
export default Input;
