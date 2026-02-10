import * as React from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { loadOpdData } from './slices/opdSlice';

export const useOpdData = () => {
  const dispatch = useAppDispatch();
  const opd = useAppSelector((state) => state.opd);

  React.useEffect(() => {
    if (opd.status === 'idle') {
      dispatch(loadOpdData());
    }
  }, [dispatch, opd.status]);

  return opd;
};
