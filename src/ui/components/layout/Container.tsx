import * as React from 'react';
import { Container as MuiContainer, ContainerProps } from '@mui/material';

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(function Container(
  props,
  ref
) {
  return <MuiContainer ref={ref} {...props} />;
});

export type { ContainerProps };
export default Container;
