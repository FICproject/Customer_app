import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'delivery' | 'vendor';
  membership?: 'silver' | 'gold' | 'diamond';
  status?: string;
  availability?: boolean;
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
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  pendingPurchaseProduct: null,
  isOnboarded: false,
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
  updateMembership: (tier) => set((state) => {
    if (!state.currentUser) return state;
    return {
      currentUser: {
        ...state.currentUser,
        membership: tier
      }
    };
  })
}));
