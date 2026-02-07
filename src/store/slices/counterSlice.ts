import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Counter } from '@/src/domain/counter/entities/counter';

/**
 * Redux slice for Counter
 * Maps domain entity to Redux state
 */
interface CounterState {
  value: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CounterState = {
  value: 0,
  isLoading: false,
  error: null,
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    setValue: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // Sync actions that can be called directly
    increment: (state) => {
      state.value += 1;
      state.error = null;
    },
    decrement: (state) => {
      state.value -= 1;
      state.error = null;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
      state.error = null;
    },
    reset: (state) => {
      state.value = 0;
      state.error = null;
    },
  },
});

export const {
  setValue,
  setLoading,
  setError,
  increment,
  decrement,
  incrementByAmount,
  reset,
} = counterSlice.actions;
export default counterSlice.reducer;
