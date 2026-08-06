import client from './client';
import { AssignmentResponse } from '../store/slices/driverSlice';

export interface VegetableInfo {
  id: number;
  vegetableName: string;
  pricePerKg: number;
  maxKg: number;
  remainingKg: number;
  priceUpdatedAt: string;
}

export interface PackageResponse {
  packageId: number;
  marketDestination: string;
  travelDateTime: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  vehicleType: string;
  vehicleNumber: string;
  totalCapacityKg: number;
  remainingCapacityKg: number;
  status: 'OPEN' | 'FULL' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  totalBookings?: number;
  confirmedBookings?: number;
  agencyName: string;
  agencyPhone: string;
  agencyRating?: number;
  agencyTotalRatings?: number;
  vegetables: VegetableInfo[];
}

export const packageApi = {
  // Agency Methods
  createPackage: async (data: {
    marketDestination: string;
    travelDateTime: string; // ISO datetime in future
    pickupWindowStart?: string;
    pickupWindowEnd?: string;
    vehicleType?: string;
    vehicleNumber?: string;
    totalCapacityKg: number;
    vegetables: {
      vegetableName: string;
      pricePerKg: number;
      maxKg: number;
    }[];
  }): Promise<PackageResponse> => {
    const res = await client.post('/agency/packages', data);
    return res.data;
  },

  getMyPackages: async (): Promise<PackageResponse[]> => {
    const res = await client.get('/agency/packages');
    return res.data;
  },

  getPackageById: async (packageId: number): Promise<PackageResponse> => {
    const res = await client.get(`/agency/packages/${packageId}`);
    return res.data;
  },

  updateVegetablePrice: async (data: {
    packageVegetableId: number;
    newPricePerKg: number;
  }): Promise<string> => {
    const res = await client.patch('/agency/packages/price', data);
    return res.data;
  },

  updatePackageStatus: async (
    packageId: number,
    status: 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'
  ): Promise<PackageResponse> => {
    const res = await client.patch(`/agency/packages/${packageId}/status`, { status });
    return res.data;
  },

  cancelPackage: async (packageId: number): Promise<string> => {
    const res = await client.delete(`/agency/packages/${packageId}`);
    return res.data;
  },

  // Farmer Methods
  getAvailablePackages: async (): Promise<PackageResponse[]> => {
    const res = await client.get('/farmer/packages/available');
    return res.data;
  },

  getPackagesByMarket: async (market: string): Promise<PackageResponse[]> => {
    const res = await client.get(`/farmer/packages/market/${encodeURIComponent(market)}`);
    return res.data;
  },

  getPackageDetail: async (packageId: number): Promise<PackageResponse> => {
    const res = await client.get(`/farmer/packages/${packageId}`);
    return res.data;
  },

  // ── Assignment Methods (Agency) ───────────────────────────

  assignToPackage: async (
    packageId: number,
    data: { vehicleId: number; driverId?: number }
  ): Promise<AssignmentResponse> => {
    const res = await client.post(`/agency/packages/${packageId}/assign`, data);
    return res.data;
  },

  getAssignment: async (packageId: number): Promise<AssignmentResponse> => {
    const res = await client.get(`/agency/packages/${packageId}/assign`);
    return res.data;
  },

  swapDriver: async (
    packageId: number,
    driverId: number
  ): Promise<AssignmentResponse> => {
    const res = await client.put(`/agency/packages/${packageId}/assign`, { driverId });
    return res.data;
  },

  /**
   * Remove driver from package.
   * force=true is required when the package is IN_TRANSIT.
   * Frontend must show a two-step warning Alert before passing force=true.
   * Blocked entirely (400) for DELIVERED/COMPLETED packages.
   */
  removeDriver: async (
    packageId: number,
    force: boolean = false
  ): Promise<AssignmentResponse> => {
    const res = await client.delete(
      `/agency/packages/${packageId}/assign/driver${force ? '?force=true' : ''}`
    );
    return res.data;
  },
};
