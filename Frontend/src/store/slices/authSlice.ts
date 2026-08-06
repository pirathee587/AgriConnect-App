import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserState {
  token: string | null;
  role: 'farmer' | 'agency' | 'admin' | null;
  name: string | null;
  userId: number | null;
  farmerId: number | null;
  agencyId: number | null;
  agencyStatus: 'PENDING_APPROVAL' | 'PENDING_PAYMENT' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  token: null,
  role: null,
  name: null,
  userId: null,
  farmerId: null,
  agencyId: null,
  agencyStatus: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action: PayloadAction<{
      token: string;
      role: 'farmer' | 'agency' | 'admin';
      name: string;
      userId: number;
      farmerId?: number;
      agencyId?: number;
      agencyStatus?: 'PENDING_APPROVAL' | 'PENDING_PAYMENT' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
    }>) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.name = action.payload.name;
      state.userId = action.payload.userId;
      state.farmerId = action.payload.farmerId || null;
      state.agencyId = action.payload.agencyId || null;
      state.agencyStatus = action.payload.agencyStatus || null;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    authFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateAgencyStatus: (state, action: PayloadAction<'PENDING_APPROVAL' | 'PENDING_PAYMENT' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED'>) => {
      state.agencyStatus = action.payload;
    },
    clearAuth: (state) => {
      state.token = null;
      state.role = null;
      state.name = null;
      state.userId = null;
      state.farmerId = null;
      state.agencyId = null;
      state.agencyStatus = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { authStart, authSuccess, authFailure, updateAgencyStatus, clearAuth } = authSlice.actions;

// Async actions for bootstrapping and teardown
export const logoutUser = () => async (dispatch: any) => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
    await AsyncStorage.removeItem('name');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('farmerId');
    await AsyncStorage.removeItem('agencyId');
    await AsyncStorage.removeItem('agencyStatus');
    dispatch(clearAuth());
  } catch (e) {
    console.error('Error during logout:', e);
  }
};

export const bootstrapAuth = () => async (dispatch: any) => {
  dispatch(authStart());
  try {
    const token = await AsyncStorage.getItem('token');
    const role = await AsyncStorage.getItem('role') as any;
    const name = await AsyncStorage.getItem('name');
    const userId = await AsyncStorage.getItem('userId');
    const farmerId = await AsyncStorage.getItem('farmerId');
    const agencyId = await AsyncStorage.getItem('agencyId');
    const agencyStatus = await AsyncStorage.getItem('agencyStatus') as any;

    if (token && role && name && userId) {
      dispatch(authSuccess({
        token,
        role,
        name,
        userId: Number(userId),
        farmerId: farmerId ? Number(farmerId) : undefined,
        agencyId: agencyId ? Number(agencyId) : undefined,
        agencyStatus: agencyStatus || undefined,
      }));
    } else {
      dispatch(clearAuth());
    }
  } catch (e) {
    console.error('Failed to bootstrap auth state:', e);
    dispatch(authFailure('Failed to bootstrap login session.'));
  }
};

export const persistAndLogin = (payload: {
  token: string;
  role: 'farmer' | 'agency' | 'admin';
  name: string;
  userId: number;
  farmerId?: number;
  agencyId?: number;
  agencyStatus?: 'PENDING_APPROVAL' | 'PENDING_PAYMENT' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
}) => async (dispatch: any) => {
  try {
    await AsyncStorage.setItem('token', payload.token);
    await AsyncStorage.setItem('role', payload.role);
    await AsyncStorage.setItem('name', payload.name);
    await AsyncStorage.setItem('userId', String(payload.userId));
    if (payload.farmerId) await AsyncStorage.setItem('farmerId', String(payload.farmerId));
    if (payload.agencyId) await AsyncStorage.setItem('agencyId', String(payload.agencyId));
    if (payload.agencyStatus) await AsyncStorage.setItem('agencyStatus', payload.agencyStatus);
    
    dispatch(authSuccess(payload));
  } catch (e) {
    console.error('Failed to save session state:', e);
  }
};

export default authSlice.reducer;
