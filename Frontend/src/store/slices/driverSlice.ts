import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type NicStatus    = 'NIC_PROVIDED' | 'NIC_NOT_PROVIDED';

export interface DriverResponse {
  driverId:       number;
  agencyId:       number;
  agencyName:     string;
  fullName:       string;
  phone:          string;
  email:          string | null;
  licenceNumber:  string;
  licenceClass:   string;
  nicStatus:      NicStatus;
  nicStatusLabel: string;
  status:         DriverStatus;
  createdAt:      string;
  updatedAt:      string;
}

export type VehicleStatus = 'AVAILABLE' | 'ASSIGNED' | 'UNDER_MAINTENANCE';
export type VehicleType   = 'LORRY' | 'TRUCK' | 'MINI_TRUCK' | 'VAN' | 'PICKUP';

export interface VehicleResponse {
  vehicleId:          number;
  agencyId:           number;
  agencyName:         string;
  vehicleType:        VehicleType;
  vehicleTypeLabel:   string;
  plateNumber:        string;
  capacityKg:         number;
  availabilityStatus: VehicleStatus;
  availabilityLabel:  string;
  createdAt:          string;
  updatedAt:          string;
}

export interface AssignmentResponse {
  packageId:        number;
  vehicleId:        number | null;
  vehicleType:      VehicleType | null;
  vehicleTypeLabel: string | null;
  plateNumber:      string | null;
  capacityKg:       number | null;
  vehicleStatus:    VehicleStatus | null;
  driverId:         number | null;
  driverName:       string | null;
  driverPhone:      string | null;
  nicStatus:        NicStatus | null;
  nicStatusLabel:   string | null;
  assignedAt:       string;
}

// ─────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────

interface DriverState {
  drivers:        DriverResponse[];
  vehicles:       VehicleResponse[];
  loadingDrivers: boolean;
  loadingVehicles: boolean;
  error:          string | null;
}

const initialState: DriverState = {
  drivers:         [],
  vehicles:        [],
  loadingDrivers:  false,
  loadingVehicles: false,
  error:           null,
};

// ─────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────

const driverSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    // Loading states
    driverLoadStart:  (state) => { state.loadingDrivers  = true; state.error = null; },
    vehicleLoadStart: (state) => { state.loadingVehicles = true; state.error = null; },
    driverLoadFail:   (state, action: PayloadAction<string>) => {
      state.loadingDrivers = false; state.error = action.payload;
    },
    vehicleLoadFail:  (state, action: PayloadAction<string>) => {
      state.loadingVehicles = false; state.error = action.payload;
    },

    // Driver actions
    fetchDriversSuccess: (state, action: PayloadAction<DriverResponse[]>) => {
      state.drivers        = action.payload;
      state.loadingDrivers = false;
    },
    addDriverSuccess: (state, action: PayloadAction<DriverResponse>) => {
      state.drivers.unshift(action.payload);
      state.loadingDrivers = false;
    },
    updateDriverSuccess: (state, action: PayloadAction<DriverResponse>) => {
      const idx = state.drivers.findIndex(d => d.driverId === action.payload.driverId);
      if (idx !== -1) state.drivers[idx] = action.payload;
      state.loadingDrivers = false;
    },
    removeDriverSuccess: (state, action: PayloadAction<number>) => {
      state.drivers = state.drivers.filter(d => d.driverId !== action.payload);
      state.loadingDrivers = false;
    },

    // Vehicle actions
    fetchVehiclesSuccess: (state, action: PayloadAction<VehicleResponse[]>) => {
      state.vehicles        = action.payload;
      state.loadingVehicles = false;
    },
    addVehicleSuccess: (state, action: PayloadAction<VehicleResponse>) => {
      state.vehicles.unshift(action.payload);
      state.loadingVehicles = false;
    },
    updateVehicleSuccess: (state, action: PayloadAction<VehicleResponse>) => {
      const idx = state.vehicles.findIndex(v => v.vehicleId === action.payload.vehicleId);
      if (idx !== -1) state.vehicles[idx] = action.payload;
      state.loadingVehicles = false;
    },
    removeVehicleSuccess: (state, action: PayloadAction<number>) => {
      state.vehicles = state.vehicles.filter(v => v.vehicleId !== action.payload);
      state.loadingVehicles = false;
    },
  },
});

export const {
  driverLoadStart, vehicleLoadStart, driverLoadFail, vehicleLoadFail,
  fetchDriversSuccess, addDriverSuccess, updateDriverSuccess, removeDriverSuccess,
  fetchVehiclesSuccess, addVehicleSuccess, updateVehicleSuccess, removeVehicleSuccess,
} = driverSlice.actions;

export default driverSlice.reducer;
