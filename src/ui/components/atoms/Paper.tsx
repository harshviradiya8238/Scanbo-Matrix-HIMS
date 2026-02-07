import * as React from 'react';
import { Paper as MuiPaper, PaperProps } from '@mui/material';

const Paper = React.forwardRef<HTMLDivElement, PaperProps>(function Paper(props, ref) {
  return <MuiPaper ref={ref} {...props} />;
});

export type { PaperProps };
export default Paper;
