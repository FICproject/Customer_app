import { create } from 'zustand';
import { apiFetch } from '../services/api';

export interface UserAddress {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'delivery' | 'vendor';
  membership?: 'silver' | 'gold' | 'diamond';
  status?: string;
  availability?: boolean;
  phone?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  avatar?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  address?: UserAddress;
}

interface AuthState {
  currentUser: User | null;
  pendingPurchaseProduct: any | null;
  isOnboarded: boolean;
  setOnboarded: (val: boolean) => void;
  setPendingPurchaseProduct: (product: any | null) => void;
  login: (email: string, role: User['role'], callback?: (user: User) => void) => void;
  logout: () => void;
  register: (formData: { name: string; email: string; businessName?: string }, role: User['role'], callback?: (user: User) => void) => void;
  updateUserStatus: (status: string, availability?: boolean) => void;
  updateMembership: (tier: 'silver' | 'gold' | 'diamond') => void;
  fetchProfile: () => Promise<User | null>;
  updateProfile: (fields: Partial<User>) => Promise<User | null>;
}

const DEFAULT_USER: User = {
  id: 'cust_uma',
  name: 'Uma',
  email: 'uma@connectapp.com',
  role: 'customer',
  membership: 'gold',
};

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: DEFAULT_USER,
  pendingPurchaseProduct: null,
  isOnboarded: true,

  setOnboarded: (val) => set({ isOnboarded: val }),
  setPendingPurchaseProduct: (product) => set({ pendingPurchaseProduct: product }),
  login: (email, role, callback) => {
    let displayName = email.split('@')[0];
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    
    const user: User = {
      id: role === 'vendor' ? 'v1' : role === 'delivery' ? 'dp1' : `cust_${displayName.toLowerCase()}`,
      name: role === 'vendor' ? 'Ravi Sharma' : displayName || 'Connect Member',
      email: email,
      role: role,
      membership: role === 'customer' ? 'gold' : undefined,
      status: role === 'delivery' ? 'Offline' : undefined,
      availability: role === 'delivery' ? false : undefined
    };
    
    set({ currentUser: user, isOnboarded: true });
    if (callback) callback(user);
  },
  logout: () => set({ currentUser: null }),
  register: (formData, role, callback) => {
    let displayName = formData.name;
    if (role === 'vendor') {
      displayName = formData.businessName || 'Elite Vendor';
    }

    const user: User = {
      id: role === 'vendor' ? 'v1' : role === 'delivery' ? 'dp1' : `cust_${formData.name.toLowerCase().replace(/\s+/g, '')}`,
      name: displayName || 'Connect Member',
      email: formData.email,
      role: role,
      membership: role === 'customer' ? 'gold' : undefined,
      status: role === 'delivery' ? 'Offline' : undefined,
      availability: role === 'delivery' ? false : undefined
    };
    
    set({ currentUser: user, isOnboarded: true });
    if (callback) callback(user);
  },
  updateUserStatus: (status, availability) => set((state) => {
    if (!state.currentUser) return state;
    return {
      currentUser: {
        ...state.currentUser,
        status,
        availability: availability !== undefined ? availability : (status === 'Available')
      }
    };
  }),
  updateMembership: async (tier: 'silver' | 'gold' | 'diamond') => {
    const state = useAuthStore.getState();
    const uId = state.currentUser?.id || 'cust_uma';
    set({
      currentUser: state.currentUser ? { ...state.currentUser, membership: tier } : null,
    });
    try {
      const response = await apiFetch('/customer/profile', {
        method: 'PATCH',
        body: { membership: tier, id: uId },
      });
      if (response && response.status === 'success' && response.data) {
        set({ currentUser: { ...state.currentUser, ...response.data } });
      }
    } catch (err) {
      console.warn('Error persisting membership update:', err);
    }
  },
  fetchProfile: async () => {
    const state = useAuthStore.getState();
    const uId = state.currentUser?.id || 'cust_uma';
    try {
      const response = await apiFetch(`/customer/profile?userId=${encodeURIComponent(uId)}`, {
        method: 'GET',
      });
      if (response && response.status === 'success' && response.data) {
        set({ currentUser: { ...state.currentUser, ...response.data } });
        return response.data;
      }
    } catch (err) {
      console.warn('Error fetching profile:', err);
    }
    return null;
  },
  updateProfile: async (fields) => {
    const state = useAuthStore.getState();
    const uId = state.currentUser?.id || 'cust_uma';
    try {
      const response = await apiFetch('/customer/profile', {
        method: 'PATCH',
        body: { ...fields, id: uId }
      });
      if (response && response.status === 'success' && response.data) {
        set({ currentUser: { ...state.currentUser, ...response.data } });
        return response.data;
      }
    } catch (err) {
      console.warn('Error updating profile:', err);
    }
    return null;
  }
}));
