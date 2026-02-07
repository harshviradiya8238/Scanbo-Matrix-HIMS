import * as React from 'react';
import { Select as MuiSelect, SelectProps } from '@mui/material';

const Select = React.forwardRef<HTMLDivElement, SelectProps>(function Select(
  { size = 'small', ...props },
  ref
) {
  return <MuiSelect ref={ref} size={size} {...props} />;
});

export type { SelectProps };
export default Select;
