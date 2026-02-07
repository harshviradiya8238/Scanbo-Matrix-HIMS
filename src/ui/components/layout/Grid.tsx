import * as React from 'react';
import AlignedGrid, { AlignedGridProps } from './AlignedGrid';

const Grid = React.forwardRef<HTMLDivElement, AlignedGridProps>(function Grid(props, ref) {
  return <AlignedGrid ref={ref} {...props} />;
});

export type { AlignedGridProps as GridProps };
export default Grid;
