import * as React from 'react';
import { Typography as MuiTypography, TypographyProps } from '@mui/material';

const Text = React.forwardRef<HTMLSpanElement, TypographyProps>(function Text(props, ref) {
  return <MuiTypography ref={ref} {...props} />;
});

export type { TypographyProps as TextProps };
export default Text;
