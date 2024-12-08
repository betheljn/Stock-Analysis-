import { configureStore } from '@reduxjs/toolkit';
import stockReducer from '../feautures/stocks/stockSlice';

export const store = configureStore({
  reducer: {
    stocks: stockReducer,
  },
});
