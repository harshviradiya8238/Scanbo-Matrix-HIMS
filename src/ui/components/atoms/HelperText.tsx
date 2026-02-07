import * as React from 'react';
import { FormHelperText as MuiFormHelperText, FormHelperTextProps } from '@mui/material';

const HelperText = React.forwardRef<HTMLParagraphElement, FormHelperTextProps>(function HelperText(
  props,
  ref
) {
  return <MuiFormHelperText ref={ref} {...props} />;
});

export type { FormHelperTextProps as HelperTextProps };
export default HelperText;
