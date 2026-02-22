import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import reportReducer from '../features/reportSlice'; // <--- 1. Import ini

export const store = configureStore({
  reducer: {
    auth: authReducer,
    report: reportReducer // <--- 2. Tambahkan ini
  },
});