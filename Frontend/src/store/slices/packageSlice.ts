import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PackageResponse } from '../../api/package.api';

export interface PackageState {
  availablePackages: PackageResponse[];
  myPackages: PackageResponse[];
  activePackage: PackageResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: PackageState = {
  availablePackages: [],
  myPackages: [],
  activePackage: null,
  loading: false,
  error: null,
};

const packageSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    packageStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAvailableSuccess: (state, action: PayloadAction<PackageResponse[]>) => {
      state.availablePackages = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchMyPackagesSuccess: (state, action: PayloadAction<PackageResponse[]>) => {
      state.myPackages = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchDetailSuccess: (state, action: PayloadAction<PackageResponse>) => {
      state.activePackage = action.payload;
      state.loading = false;
      state.error = null;
    },
    packageFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createSuccess: (state, action: PayloadAction<PackageResponse>) => {
      state.myPackages.unshift(action.payload);
      state.loading = false;
      state.error = null;
    },
    updatePriceSuccess: (state, action: PayloadAction<{ packageVegetableId: number; newPrice: number }>) => {
      if (state.activePackage) {
        state.activePackage.vegetables = state.activePackage.vegetables.map(veg =>
          veg.id === action.payload.packageVegetableId
            ? { ...veg, pricePerKg: action.payload.newPrice, priceUpdatedAt: new Date().toISOString() }
            : veg
        );
      }
      state.myPackages = state.myPackages.map(pkg => {
        if (pkg.packageId === state.activePackage?.packageId) {
          return {
            ...pkg,
            vegetables: pkg.vegetables.map(veg =>
              veg.id === action.payload.packageVegetableId
                ? { ...veg, pricePerKg: action.payload.newPrice, priceUpdatedAt: new Date().toISOString() }
                : veg
            ),
          };
        }
        return pkg;
      });
      state.loading = false;
    },
    cancelPackageSuccessRedux: (state, action: PayloadAction<number>) => {
      state.myPackages = state.myPackages.map(pkg =>
        pkg.packageId === action.payload ? { ...pkg, status: 'CANCELLED' } : pkg
      );
      if (state.activePackage?.packageId === action.payload) {
        state.activePackage.status = 'CANCELLED';
      }
      state.loading = false;
    },
  },
});

export const {
  packageStart,
  fetchAvailableSuccess,
  fetchMyPackagesSuccess,
  fetchDetailSuccess,
  packageFailure,
  createSuccess,
  updatePriceSuccess,
  cancelPackageSuccessRedux,
} = packageSlice.actions;

export default packageSlice.reducer;
