import client from './client';

export interface FarmerProfileResponse {
  farmerId: number;
  name: string;
  phone: string;
  district: string;
  address: string;
  bankName: string;
  maskedAccountNumber: string;
  accountHolderName: string;
  isVerified: boolean;
  profilePicture?: string;
}

export interface RatingResponse {
  ratingId: number;
  bookingId: number;
  agencyName: string;
  marketDestination: string;
  stars: number;
  comment: string;
  createdAt: string;
}

export interface BankDetailResponse {
  bankDetailId: number;
  bankName: string;
  maskedAccountNumber: string;
  accountHolderName: string;
  updatedAt: string;
}

export const farmerApi = {
  // Profile
  getProfile: async (): Promise<FarmerProfileResponse> => {
    const res = await client.get('/farmer/profile');
    return res.data;
  },

  updateProfile: async (data: {
    name: string;
    district?: string;
    address?: string;
  }): Promise<FarmerProfileResponse> => {
    const res = await client.put('/farmer/profile', data);
    return res.data;
  },

  uploadProfilePicture: async (fileData: { uri: string; name: string; type: string }): Promise<FarmerProfileResponse> => {
    const formData = new FormData();
    formData.append('file', fileData as any);
    const res = await client.post('/farmer/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<string> => {
    const res = await client.post('/farmer/profile/password', data);
    return res.data;
  },

  // Bank Details
  getBankDetail: async (): Promise<BankDetailResponse> => {
    const res = await client.get('/farmer/bank-details');
    return res.data;
  },

  saveOrUpdateBankDetail: async (data: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  }): Promise<BankDetailResponse> => {
    const res = await client.post('/farmer/bank-details', data);
    return res.data;
  },

  deleteBankDetail: async (): Promise<string> => {
    const res = await client.delete('/farmer/bank-details');
    return res.data;
  },

  // Ratings
  submitRating: async (data: {
    bookingId: number;
    stars: number; // 1–5
    comment?: string;
  }): Promise<RatingResponse> => {
    const res = await client.post('/farmer/ratings', data);
    return res.data;
  },

  getMyRatings: async (): Promise<RatingResponse[]> => {
    const res = await client.get('/farmer/ratings');
    return res.data;
  },
};
