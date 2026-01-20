import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Тип для состояния
interface CounterState {
  value: number;
  status: 'idle' | 'loading' | 'failed';
}

// Начальное состояние
const initialState: CounterState = {
  value: 0,
  status: 'idle',
};

// Создание slice
export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // Простые редьюсеры
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    reset: (state) => {
      state.value = 0;
    },
  },
});

// Экспорт actions
export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;

// Селекторы
export const selectCount = (state: { counter: CounterState }) => state.counter.value;
export const selectStatus = (state: { counter: CounterState }) => state.counter.status;

// Экспорт редьюсера
export default counterSlice.reducer;