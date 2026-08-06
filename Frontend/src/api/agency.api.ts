import client from './client';

export interface AgencyProfileResponse {
  agencyId: number;
  name: string;
  phone: string;
  nicNumber: string;
  address: string;
  agencyStatus: 'PENDING_APPROVAL' | 'PENDING_PAYMENT' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  averageRating: number;
  totalRatings: number;
  bankName: string;
  maskedAccountNumber: string;
  accountHolderName: string;
  nicFrontUrl: string;
  nicBackUrl: string;
  createdAt: string;
  activatedAt: string;
}

export interface AgencyEarningsResponse {
  totalExpectedEarnings: number;
  confirmedEarnings: number;
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalPackages: number;
  activePackages: number;
  earningsByMarket: Record<string, number>;
  earningsByMonth: Record<string, number>;
  recentCompletedBookings: {
    bookingId: number;
    farmerName: string;
    vegetableName: string;
    weightKg: number;
    pricePerKg: number;
    totalValue: number;
    marketDestination: string;
    completedAt: string;
  }[];
}

export const agencyApi = {
  // Profile
  getProfile: async (): Promise<AgencyProfileResponse> => {
    const res = await client.get('/agency/profile');
    return res.data;
  },

  updateProfile: async (data: {
    name: string;
    address?: string;
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
  }): Promise<AgencyProfileResponse> => {
    const res = await client.put('/agency/profile', data);
    return res.data;
  },

  // Earnings
  getEarnings: async (): Promise<AgencyEarningsResponse> => {
    const res = await client.get('/agency/earnings');
    return res.data;
  },
};
