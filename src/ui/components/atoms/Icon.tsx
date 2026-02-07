import * as React from 'react';
import { SvgIcon as MuiSvgIcon, SvgIconProps } from '@mui/material';

const Icon = React.forwardRef<SVGSVGElement, SvgIconProps>(function Icon(props, ref) {
  return <MuiSvgIcon ref={ref} {...props} />;
});

export type { SvgIconProps as IconProps };
export default Icon;
