import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BookingResponse } from '../../api/booking.api';

export interface BookingState {
  myBookings: BookingResponse[];
  agencyBookings: BookingResponse[];
  pendingBookings: BookingResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  myBookings: [],
  agencyBookings: [],
  pendingBookings: [],
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    bookingStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMyBookingsSuccess: (state, action: PayloadAction<BookingResponse[]>) => {
      state.myBookings = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchAgencyBookingsSuccess: (state, action: PayloadAction<BookingResponse[]>) => {
      state.agencyBookings = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchPendingBookingsSuccess: (state, action: PayloadAction<BookingResponse[]>) => {
      state.pendingBookings = action.payload;
      state.loading = false;
      state.error = null;
    },
    bookingFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    confirmBookingSuccessRedux: (state, action: PayloadAction<BookingResponse>) => {
      state.myBookings.unshift(action.payload);
      state.loading = false;
    },
    updateBookingStatusSuccess: (state, action: PayloadAction<{ bookingId: number; status: BookingResponse['status'] }>) => {
      state.agencyBookings = state.agencyBookings.map(b =>
        b.bookingId === action.payload.bookingId ? { ...b, status: action.payload.status } : b
      );
      state.pendingBookings = state.pendingBookings.filter(b => b.bookingId !== action.payload.bookingId);
      state.myBookings = state.myBookings.map(b =>
        b.bookingId === action.payload.bookingId ? { ...b, status: action.payload.status } : b
      );
      state.loading = false;
    },
  },
});

export const {
  bookingStart,
  fetchMyBookingsSuccess,
  fetchAgencyBookingsSuccess,
  fetchPendingBookingsSuccess,
  bookingFailure,
  confirmBookingSuccessRedux,
  updateBookingStatusSuccess,
} = bookingSlice.actions;

export default bookingSlice.reducer;
