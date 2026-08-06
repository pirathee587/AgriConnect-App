import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import packageReducer from './slices/packageSlice';
import bookingReducer from './slices/bookingSlice';
import driverReducer from './slices/driverSlice';

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    packages: packageReducer,
    bookings: bookingReducer,
    drivers:  driverReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
