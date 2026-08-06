import client from './client';

export interface BookingResponse {
  bookingId: number;
  packageId: number;
  marketDestination: string;
  travelDateTime: string;
  pickupWindowStart: string;
  vegetableName: string;
  weightKg: number;
  priceAtBooking: number;
  totalValue: number;
  pickupAddress: string;
  status: 'PENDING_OTP' | 'PENDING_APPROVAL' | 'APPROVED' | 'PICKED_UP' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  agencyName?: string;
  agencyPhone?: string;
  farmerName?: string;
  farmerPhone?: string;
  isRated?: boolean;
  cancelReason?: string;
  createdAt: string;
}

export const bookingApi = {
  // Farmer Booking Methods
  initiateBooking: async (data: {
    packageId: number;
    vegetableName: string;
    weightKg: number;
    pickupAddress: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  }): Promise<string> => {
    const res = await client.post('/farmer/bookings/initiate', data);
    return res.data;
  },

  confirmBooking: async (data: {
    packageId: number;
    vegetableName: string;
    weightKg: number;
    pickupAddress: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    otp: string;
  }): Promise<BookingResponse> => {
    const res = await client.post('/farmer/bookings/confirm', data);
    return res.data;
  },

  getMyBookings: async (): Promise<BookingResponse[]> => {
    const res = await client.get('/farmer/bookings');
    return res.data;
  },

  cancelBooking: async (bookingId: number): Promise<BookingResponse> => {
    const res = await client.post(`/farmer/bookings/${bookingId}/cancel`);
    return res.data;
  },

  // Agency Booking Methods
  getAllBookings: async (): Promise<BookingResponse[]> => {
    const res = await client.get('/agency/bookings');
    return res.data;
  },

  getPendingBookings: async (): Promise<BookingResponse[]> => {
    const res = await client.get('/agency/bookings/pending');
    return res.data;
  },

  getBookingsByPackage: async (packageId: number): Promise<BookingResponse[]> => {
    const res = await client.get(`/agency/bookings/package/${packageId}`);
    return res.data;
  },

  approveBooking: async (bookingId: number): Promise<BookingResponse> => {
    const res = await client.post(`/agency/bookings/${bookingId}/approve`);
    return res.data;
  },

  rejectBooking: async (bookingId: number, reason: string): Promise<BookingResponse> => {
    const res = await client.post(`/agency/bookings/${bookingId}/reject`, { reason });
    return res.data;
  },

  markPickedUp: async (bookingId: number): Promise<BookingResponse> => {
    const res = await client.post(`/agency/bookings/${bookingId}/pickup`);
    return res.data;
  },

  markDelivered: async (bookingId: number): Promise<BookingResponse> => {
    const res = await client.post(`/agency/bookings/${bookingId}/delivered`);
    return res.data;
  },

  markCompleted: async (bookingId: number): Promise<BookingResponse> => {
    const res = await client.post(`/agency/bookings/${bookingId}/complete`);
    return res.data;
  },
};
