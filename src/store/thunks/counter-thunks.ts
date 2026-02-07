import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../store';
import { CounterService } from '@/src/application/counter/counter-service';
import { InMemoryCounterRepository } from '@/src/domain/counter/repositories/counter-repository';
import { setValue, setLoading, setError } from '../slices/counterSlice';

/**
 * Create counter service instance
 * In production, this would come from dependency injection
 */
const counterService = new CounterService(new InMemoryCounterRepository());

/**
 * Async thunks that use application services
 * These bridge Redux and the application layer
 */
export const fetchCounter = createAsyncThunk<
  // Return type
  Awaited<ReturnType<typeof counterService.getCounter>>,
  // Argument type
  void,
  // ThunkAPI config
  { dispatch: AppDispatch; state: RootState }
>('counter/fetch', async (_, { dispatch }) => {
  try {
    dispatch(setLoading(true));
    const counter = await counterService.getCounter();
    dispatch(setValue(counter.value));
    return counter;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch counter';
    dispatch(setError(message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
});

export const incrementCounter = createAsyncThunk<
  Awaited<ReturnType<typeof counterService.increment>>,
  void,
  { dispatch: AppDispatch; state: RootState }
>('counter/increment', async (_, { dispatch }) => {
  try {
    dispatch(setLoading(true));
    const counter = await counterService.increment();
    dispatch(setValue(counter.value));
    return counter;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to increment';
    dispatch(setError(message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
});

export const decrementCounter = createAsyncThunk<
  Awaited<ReturnType<typeof counterService.decrement>>,
  void,
  { dispatch: AppDispatch; state: RootState }
>('counter/decrement', async (_, { dispatch }) => {
  try {
    dispatch(setLoading(true));
    const counter = await counterService.decrement();
    dispatch(setValue(counter.value));
    return counter;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to decrement';
    dispatch(setError(message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
});

export const addToCounter = createAsyncThunk<
  Awaited<ReturnType<typeof counterService.add>>,
  number,
  { dispatch: AppDispatch; state: RootState }
>('counter/add', async (amount, { dispatch }) => {
  try {
    dispatch(setLoading(true));
    const counter = await counterService.add(amount);
    dispatch(setValue(counter.value));
    return counter;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add';
    dispatch(setError(message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
});

export const resetCounter = createAsyncThunk<
  Awaited<ReturnType<typeof counterService.reset>>,
  number | undefined,
  { dispatch: AppDispatch; state: RootState }
>('counter/reset', async (initialValue = 0, { dispatch }) => {
  try {
    dispatch(setLoading(true));
    const counter = await counterService.reset(initialValue);
    dispatch(setValue(counter.value));
    return counter;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reset';
    dispatch(setError(message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
});

