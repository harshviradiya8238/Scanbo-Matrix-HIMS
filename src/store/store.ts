import { configureStore } from '@reduxjs/toolkit';
import counterSlice from './slices/counterSlice';
import opdSlice from './slices/opdSlice';
import radiologySlice from './slices/radiologySlice';
import labSlice from './slices/labSlice';
import limsSlice from './slices/limsSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      counter: counterSlice,
      opd: opdSlice,
      radiology: radiologySlice,
      lab: labSlice,
      lims: limsSlice,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types for serialization checks
          ignoredActions: ['persist/PERSIST'],
        },
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
