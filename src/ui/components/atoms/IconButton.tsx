import * as React from 'react';
import { IconButton as MuiIconButton, IconButtonProps } from '@mui/material';

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  props,
  ref
) {
  return <MuiIconButton ref={ref} {...props} />;
});

export type { IconButtonProps };
export default IconButton;
