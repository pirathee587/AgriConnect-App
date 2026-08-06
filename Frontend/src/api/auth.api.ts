import client from './client';

// ─── Response Types ──────────────────────────────────────────
export interface FarmerAuthResponse {
  token: string;
  name: string;
  userId: number;
  farmerId: number;
  role: string;
  message: string;
}

export interface AgencyAuthResponse {
  token: string;
  name: string;
  userId: number;
  agencyId: number;
  role: string;
  agencyStatus: 'PENDING_APPROVAL' | 'PENDING_PAYMENT' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  message: string;
}

export interface AdminAuthResponse {
  token: string;
  name: string;
  userId: number;
  role: string;
  message: string;
}

export interface FileData {
  uri: string;
  name: string;
  type: string;
}

// ─── Auth API ────────────────────────────────────────────────
export const authApi = {
  // Farmer Auth
  farmerRegister: async (data: {
    name: string;
    phone: string;
    password: string;
    email: string;
    district?: string;
    address?: string;
  }): Promise<string> => {
    const res = await client.post('/farmer/auth/register', data);
    return res.data;
  },

  farmerLogin: async (data: {
    phone: string;
    password: string;
  }): Promise<FarmerAuthResponse> => {
    const res = await client.post('/farmer/auth/login', data);
    return res.data;
  },

  farmerVerifyOtp: async (data: {
    phone: string;
    otp: string;
    purpose: string;
  }): Promise<string> => {
    const res = await client.post('/farmer/auth/verify-otp', data);
    return res.data;
  },

  farmerResendOtp: async (phone: string): Promise<string> => {
    const res = await client.post(`/farmer/auth/resend-otp?phone=${encodeURIComponent(phone)}`);
    return res.data;
  },

  // Agency Auth
  agencyRegister: async (data: {
    name: string;
    phone: string;
    password: string;
    email?: string;
    nicNumber: string;
    address: string;
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    nicFront?: FileData;
    nicBack?: FileData;
  }): Promise<string> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phone', data.phone);
    formData.append('password', data.password);
    if (data.email) formData.append('email', data.email);
    formData.append('nicNumber', data.nicNumber);
    formData.append('address', data.address);
    if (data.bankName) formData.append('bankName', data.bankName);
    if (data.accountNumber) formData.append('accountNumber', data.accountNumber);
    if (data.accountHolderName) formData.append('accountHolderName', data.accountHolderName);
    
    if (data.nicFront) {
      // React Native FormData file append format
      formData.append('nicFront', data.nicFront as any);
    }
    if (data.nicBack) {
      formData.append('nicBack', data.nicBack as any);
    }

    const res = await client.post('/agency/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  agencyLogin: async (data: {
    phone: string;
    password: string;
  }): Promise<AgencyAuthResponse> => {
    const res = await client.post('/agency/auth/login', data);
    return res.data;
  },

  agencyVerifyOtp: async (data: {
    phone: string;
    otp: string;
    purpose: string;
  }): Promise<string> => {
    const res = await client.post('/agency/auth/verify-otp', data);
    return res.data;
  },

  agencyResendOtp: async (phone: string): Promise<string> => {
    const res = await client.post(`/agency/auth/resend-otp?phone=${encodeURIComponent(phone)}`);
    return res.data;
  },

  // Admin Auth
  adminLogin: async (data: {
    phone: string;
    password: string;
  }): Promise<AdminAuthResponse> => {
    const res = await client.post('/admin/auth/login', data);
    return res.data;
  },

  adminRegister: async (data: {
    name: string;
    phone: string;
    password: string;
    email: string;
  }): Promise<string> => {
    const res = await client.post('/admin/auth/register', data);
    return res.data;
  },
};
