import client from './client';
import {
  DriverResponse,
  VehicleResponse,
  AssignmentResponse,
  NicStatus,
  VehicleType,
  VehicleStatus,
} from '../store/slices/driverSlice';

// ─────────────────────────────────────────────────────────────
// Request types
// ─────────────────────────────────────────────────────────────

export interface AddDriverRequest {
  fullName:      string;
  phone:         string;
  email?:        string;          // Optional — SMS-only drivers supported
  licenceNumber: string;
  licenceClass:  string;
  nicStatus:     NicStatus;
}

export interface UpdateDriverRequest {
  fullName?:      string;
  phone?:         string;
  email?:         string;
  licenceNumber?: string;
  licenceClass?:  string;
  nicStatus?:     NicStatus;
  status?:        'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface AddVehicleRequest {
  vehicleType: VehicleType;
  plateNumber: string;
  capacityKg:  number;
}

export interface UpdateVehicleRequest {
  vehicleType?:        VehicleType;
  capacityKg?:         number;
  availabilityStatus?: 'AVAILABLE' | 'UNDER_MAINTENANCE'; // ASSIGNED is not allowed manually
}

// ─────────────────────────────────────────────────────────────
// Driver API
// Note: Agency is auto-bound from JWT token server-side.
// No agencyId param needed in any of these calls.
// ─────────────────────────────────────────────────────────────

export const driverApi = {

  // ── Driver CRUD ──────────────────────────────────────────

  registerDriver: async (data: AddDriverRequest): Promise<DriverResponse> => {
    const res = await client.post('/agency/drivers', data);
    return res.data;
  },

  listDrivers: async (): Promise<DriverResponse[]> => {
    const res = await client.get('/agency/drivers');
    return res.data;
  },

  getDriver: async (driverId: number): Promise<DriverResponse> => {
    const res = await client.get(`/agency/drivers/${driverId}`);
    return res.data;
  },

  updateDriver: async (driverId: number, data: UpdateDriverRequest): Promise<DriverResponse> => {
    const res = await client.put(`/agency/drivers/${driverId}`, data);
    return res.data;
  },

  deactivateDriver: async (driverId: number): Promise<string> => {
    const res = await client.delete(`/agency/drivers/${driverId}`);
    return res.data;
  },

  sendNicReminder: async (driverId: number): Promise<string> => {
    const res = await client.post(`/agency/drivers/${driverId}/notify-nic`);
    return res.data;
  },

  // ── Vehicle CRUD ─────────────────────────────────────────

  addVehicle: async (data: AddVehicleRequest): Promise<VehicleResponse> => {
    const res = await client.post('/agency/vehicles', data);
    return res.data;
  },

  listVehicles: async (): Promise<VehicleResponse[]> => {
    const res = await client.get('/agency/vehicles');
    return res.data;
  },

  getVehicle: async (vehicleId: number): Promise<VehicleResponse> => {
    const res = await client.get(`/agency/vehicles/${vehicleId}`);
    return res.data;
  },

  updateVehicle: async (vehicleId: number, data: UpdateVehicleRequest): Promise<VehicleResponse> => {
    const res = await client.put(`/agency/vehicles/${vehicleId}`, data);
    return res.data;
  },

  removeVehicle: async (vehicleId: number): Promise<string> => {
    const res = await client.delete(`/agency/vehicles/${vehicleId}`);
    return res.data;
  },

  // ── Admin ────────────────────────────────────────────────

  adminGetAllDrivers: async (): Promise<DriverResponse[]> => {
    const res = await client.get('/admin/drivers');
    return res.data;
  },

  adminGetAllVehicles: async (): Promise<VehicleResponse[]> => {
    const res = await client.get('/admin/vehicles');
    return res.data;
  },

  adminSuspendDriver: async (driverId: number): Promise<DriverResponse> => {
    const res = await client.patch(`/admin/drivers/${driverId}/suspend`);
    return res.data;
  },

  adminGetDriverStats: async (): Promise<{ totalDrivers: number; totalVehicles: number }> => {
    const res = await client.get('/admin/driver-stats');
    return res.data;
  },
};
