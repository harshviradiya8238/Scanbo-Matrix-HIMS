import * as React from 'react';
import { Link as MuiLink, LinkProps } from '@mui/material';

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  return <MuiLink ref={ref} {...props} />;
});

export type { LinkProps };
export default Link;
