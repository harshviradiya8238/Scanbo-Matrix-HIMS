'use client';

import * as React from 'react';
import Grid2, { Grid2Props } from '@mui/material/Unstable_Grid2';

export type AlignedGridProps = Omit<Grid2Props, 'item'> & {
  item?: boolean;
};

const AlignedGrid = React.forwardRef<HTMLDivElement, AlignedGridProps>(function AlignedGrid(
  { item: _item, ...props },
  ref
) {
  return <Grid2 ref={ref} {...props} />;
});

export default AlignedGrid;
