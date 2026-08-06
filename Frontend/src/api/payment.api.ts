import client from './client';

export interface AgencyPaymentInitiateResponse {
  merchantId: string;
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  agencyName: string;
  agencyPhone: string;
  paymentUrl: string;
}

export interface AgencyPaymentHistoryResponse {
  paymentId: number;
  amount: number;
  currency: string;
  paymentReference: string;
  paymentMethod: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';
  failureReason: string;
  createdAt: string;
}

export const paymentApi = {
  // Agency Methods
  initiateActivationPayment: async (): Promise<AgencyPaymentInitiateResponse> => {
    const res = await client.post('/agency/payment/initiate');
    return res.data;
  },

  getPaymentHistory: async (): Promise<AgencyPaymentHistoryResponse[]> => {
    const res = await client.get('/agency/payment/history');
    return res.data;
  },
};
