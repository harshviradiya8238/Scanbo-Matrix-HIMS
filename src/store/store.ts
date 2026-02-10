import { configureStore } from '@reduxjs/toolkit';
import counterSlice from './slices/counterSlice';
import opdSlice from './slices/opdSlice';
import radiologySlice from './slices/radiologySlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      counter: counterSlice,
      opd: opdSlice,
      radiology: radiologySlice,
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
