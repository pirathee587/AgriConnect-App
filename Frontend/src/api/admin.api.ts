import client from './client';

// ─── Response Types ──────────────────────────────────────────
export interface AdminUserResponse {
  userId: number;
  name: string;
  phone: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  district?: string;
  address?: string;
  agencyStatus?: string;
  averageRating?: number;
}

export interface AdminUserListResponse {
  totalUsers: number;
  totalFarmers: number;
  totalAgencies: number;
  totalAdmins: number;
  activeUsers: number;
  inactiveUsers: number;
  users: AdminUserResponse[];
}

export interface AgencyVerificationResponse {
  agencyId: number;
  userId: number;
  name: string;
  phone: string;
  nicNumber: string;
  address: string;
  agencyStatus: 'PENDING_APPROVAL' | 'PENDING_PAYMENT' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  nicFrontUrl: string;
  nicBackUrl: string;
  averageRating: number;
  totalRatings: number;
  bankName: string;
  maskedAccountNumber: string;
  accountHolderName: string;
  createdAt: string;
  approvedAt: string;
  activatedAt: string;
}

export interface AdminBookingResponse {
  bookingId: number;
  packageId: number;
  farmerId: number;
  agencyId: number;
  farmerName: string;
  farmerPhone: string;
  agencyName: string;
  agencyPhone: string;
  marketDestination: string;
  travelDateTime: string;
  vegetableName: string;
  weightKg: number;
  priceAtBooking: number;
  totalValue: number;
  pickupAddress: string;
  status: string;
  cancelReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBookingListResponse {
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingOtpBookings: number;
  agencyApprovedBookings: number;
  pickedUpBookings: number;
  deliveredBookings: number;
  totalValueAllBookings: number;
  totalValueCompleted: number;
  bookingsByMarket: Record<string, number>;
  bookings: AdminBookingResponse[];
}

export interface AdminPackageResponse {
  packageId: number;
  agencyId: number;
  marketDestination: string;
  travelDateTime: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  vehicleType: string;
  vehicleNumber: string;
  totalCapacityKg: number;
  remainingCapacityKg: number;
  bookedPercentage: number;
  status: string;
  totalBookings: number;
  completedBookings: number;
  agencyName: string;
  agencyPhone: string;
  vegetables: {
    id: number;
    vegetableName: string;
    pricePerKg: number;
    maxKg: number;
    remainingKg: number;
    priceUpdatedAt: string;
  }[];
  createdAt: string;
}

export interface AdminPackageListResponse {
  totalPackages: number;
  openPackages: number;
  fullPackages: number;
  inTransitPackages: number;
  deliveredPackages: number;
  cancelledPackages: number;
  packagesByMarket: Record<string, number>;
  packages: AdminPackageResponse[];
}

export interface RevenueOverviewResponse {
  totalRevenue: number;
  pendingRevenue: number;
  totalPayments: number;
  successPayments: number;
  failedPayments: number;
  pendingPayments: number;
  cancelledPayments: number;
  totalAgencies: number;
  activeAgencies: number;
  pendingApprovalAgencies: number;
  pendingPaymentAgencies: number;
  suspendedAgencies: number;
  totalBookings: number;
  completedBookings: number;
  totalBookingValue: number;
  completedBookingValue: number;
  totalDrivers?: number;
  totalVehicles?: number;
  monthlyRevenue: {
    yearMonth: string;
    revenue: number;
    paymentCount: number;
  }[];
  agencyRevenue: {
    agencyId: number;
    agencyName: string;
    agencyPhone: string;
    agencyStatus: string;
    amountPaid: number;
    totalBookings: number;
    completedBookings: number;
    totalBookingValue: number;
    activatedAt: string;
  }[];
}

export interface PaymentEntryResponse {
  paymentId: number;
  agencyId: number;
  agencyName: string;
  agencyPhone: string;
  amount: number;
  currency: string;
  paymentReference: string;
  paymentMethod: string;
  status: string;
  failureReason: string;
  createdAt: string;
}

export const adminApi = {
  // User Management
  getAllUsers: async (): Promise<AdminUserListResponse> => {
    const res = await client.get('/admin/users');
    return res.data;
  },

  getUsersByRole: async (role: 'FARMER' | 'AGENCY' | 'ADMIN'): Promise<AdminUserResponse[]> => {
    const res = await client.get(`/admin/users/role/${role}`);
    return res.data;
  },

  getUserById: async (userId: number): Promise<AdminUserResponse> => {
    const res = await client.get(`/admin/users/${userId}`);
    return res.data;
  },

  getUserByPhone: async (phone: string): Promise<AdminUserResponse> => {
    const res = await client.get(`/admin/users/phone/${encodeURIComponent(phone)}`);
    return res.data;
  },

  deactivateUser: async (userId: number): Promise<AdminUserResponse> => {
    const res = await client.post(`/admin/users/${userId}/deactivate`);
    return res.data;
  },

  activateUser: async (userId: number): Promise<AdminUserResponse> => {
    const res = await client.post(`/admin/users/${userId}/activate`);
    return res.data;
  },

  // Agency Verification
  getAllAgencies: async (): Promise<AgencyVerificationResponse[]> => {
    const res = await client.get('/admin/agencies');
    return res.data;
  },

  getPendingAgencies: async (): Promise<AgencyVerificationResponse[]> => {
    const res = await client.get('/admin/agencies/pending');
    return res.data;
  },

  getAgenciesByStatus: async (
    status: 'PENDING_APPROVAL' | 'PENDING_PAYMENT' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED'
  ): Promise<AgencyVerificationResponse[]> => {
    const res = await client.get(`/admin/agencies/status/${status}`);
    return res.data;
  },

  getAgencyById: async (agencyId: number): Promise<AgencyVerificationResponse> => {
    const res = await client.get(`/admin/agencies/${agencyId}`);
    return res.data;
  },

  approveAgency: async (agencyId: number): Promise<AgencyVerificationResponse> => {
    const res = await client.post(`/admin/agencies/${agencyId}/approve`);
    return res.data;
  },

  rejectAgency: async (agencyId: number, reason: string): Promise<AgencyVerificationResponse> => {
    const res = await client.post(`/admin/agencies/${agencyId}/reject`, { reason });
    return res.data;
  },

  suspendAgency: async (agencyId: number): Promise<AgencyVerificationResponse> => {
    const res = await client.post(`/admin/agencies/${agencyId}/suspend`);
    return res.data;
  },

  reactivateAgency: async (agencyId: number): Promise<AgencyVerificationResponse> => {
    const res = await client.post(`/admin/agencies/${agencyId}/reactivate`);
    return res.data;
  },

  activateAgencyAfterPayment: async (agencyId: number): Promise<AgencyVerificationResponse> => {
    const res = await client.post(`/admin/agencies/${agencyId}/activate-payment`);
    return res.data;
  },

  // Booking Management
  getAllBookings: async (): Promise<AdminBookingListResponse> => {
    const res = await client.get('/admin/bookings');
    return res.data;
  },

  getBookingsByStatus: async (status: string): Promise<AdminBookingResponse[]> => {
    const res = await client.get(`/admin/bookings/status/${status}`);
    return res.data;
  },

  getBookingsByFarmer: async (farmerId: number): Promise<AdminBookingResponse[]> => {
    const res = await client.get(`/admin/bookings/farmer/${farmerId}`);
    return res.data;
  },

  getBookingsByAgency: async (agencyId: number): Promise<AdminBookingResponse[]> => {
    const res = await client.get(`/admin/bookings/agency/${agencyId}`);
    return res.data;
  },

  getBookingsByPackage: async (packageId: number): Promise<AdminBookingResponse[]> => {
    const res = await client.get(`/admin/bookings/package/${packageId}`);
    return res.data;
  },

  getBookingById: async (bookingId: number): Promise<AdminBookingResponse> => {
    const res = await client.get(`/admin/bookings/${bookingId}`);
    return res.data;
  },

  // Package Management
  getAllPackages: async (): Promise<AdminPackageListResponse> => {
    const res = await client.get('/admin/packages');
    return res.data;
  },

  getPackagesByStatus: async (status: string): Promise<AdminPackageResponse[]> => {
    const res = await client.get(`/admin/packages/status/${status}`);
    return res.data;
  },

  getPackagesByMarket: async (market: string): Promise<AdminPackageResponse[]> => {
    const res = await client.get(`/admin/packages/market/${encodeURIComponent(market)}`);
    return res.data;
  },

  getPackagesByAgency: async (agencyId: number): Promise<AdminPackageResponse[]> => {
    const res = await client.get(`/admin/packages/agency/${agencyId}`);
    return res.data;
  },

  getPackageById: async (packageId: number): Promise<AdminPackageResponse> => {
    const res = await client.get(`/admin/packages/${packageId}`);
    return res.data;
  },

  cancelPackage: async (packageId: number): Promise<AdminPackageResponse> => {
    const res = await client.post(`/admin/packages/${packageId}/cancel`);
    return res.data;
  },

  // Revenue / Payments
  getRevenueOverview: async (): Promise<RevenueOverviewResponse> => {
    const res = await client.get('/admin/revenue/overview');
    return res.data;
  },

  getAllPayments: async (): Promise<PaymentEntryResponse[]> => {
    const res = await client.get('/admin/revenue/payments');
    return res.data;
  },

  getPaymentsByStatus: async (status: string): Promise<PaymentEntryResponse[]> => {
    const res = await client.get(`/admin/revenue/payments/status/${status}`);
    return res.data;
  },

  getPaymentsByAgency: async (agencyId: number): Promise<PaymentEntryResponse[]> => {
    const res = await client.get(`/admin/revenue/payments/agency/${agencyId}`);
    return res.data;
  },
};
