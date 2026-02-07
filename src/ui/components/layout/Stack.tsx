import * as React from 'react';
import { Stack as MuiStack, StackProps } from '@mui/material';

const Stack = React.forwardRef<HTMLDivElement, StackProps>(function Stack(
  { spacing = 2, ...props },
  ref
) {
  return <MuiStack ref={ref} spacing={spacing} {...props} />;
});

export type { StackProps };
export default Stack;
