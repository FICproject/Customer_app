import { create } from 'zustand';
import { apiFetch } from '../services/api';

export interface Order {
  id: string;
  order_number: string;
  vendor_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_latitude: number;
  customer_longitude: number;
  product_details: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  order_id: string;
  delivery_partner_id: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';
  assigned_at: string;
}

interface OrderState {
  allOrders: Order[];
  activeAssignment: Assignment | null;
  activeOrder: Order | null;
  incomingAssignment: any | null;
  incomingTimer: number;
  earningsLogs: any[];
  todayCompleted: number;
  todayEarnings: number;
  rating: number;
  
  setIncomingAssignment: (asg: any | null) => void;
  decrementIncomingTimer: () => void;
  loadAllOrders: () => Promise<void>;
  loadDashboard: (userId: string) => Promise<void>;
  claimOrder: (orderId: string, partnerId: string) => Promise<boolean>;
  respondToAssignment: (asgId: string, partnerId: string, action: 'accept' | 'reject') => Promise<boolean>;
  stepMilestone: (orderId: string, partnerId: string, step: string, otp?: string, photoProof?: string | null) => Promise<{ success: boolean; message?: string }>;
  clearActive: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  allOrders: [],
  activeAssignment: null,
  activeOrder: null,
  incomingAssignment: null,
  incomingTimer: 30,
  earningsLogs: [],
  todayCompleted: 0,
  todayEarnings: 0,
  rating: 4.9,

  setIncomingAssignment: (asg) => set({ incomingAssignment: asg, incomingTimer: 30 }),
  decrementIncomingTimer: () => set((state) => ({ incomingTimer: Math.max(0, state.incomingTimer - 1) })),
  
  loadAllOrders: async () => {
    try {
      const res = await apiFetch('/orders');
      if (res.status === 'success') {
        set({ allOrders: res.data || [] });
      }
    } catch (err) {
      console.error('Failed to load all orders:', err);
    }
  },

  loadDashboard: async (userId) => {
    try {
      const res = await apiFetch(`/delivery-partners/${userId}/dashboard`);
      if (res.status === 'success') {
        const { stats, activeAssignment, activeOrder } = res.data;
        set({
          activeAssignment: activeAssignment || null,
          activeOrder: activeOrder || null,
          todayCompleted: stats?.todayCompleted || 0,
          todayEarnings: stats?.todayEarnings || 0,
          rating: stats?.rating || 4.9
        });
      }
      
      const earnRes = await apiFetch(`/delivery-partners/${userId}/earnings`);
      if (earnRes.status === 'success') {
        set({ earningsLogs: earnRes.data || [] });
      }
      
      await get().loadAllOrders();
    } catch (err) {
      console.error('Failed to load rider details:', err);
    }
  },

  claimOrder: async (orderId, partnerId) => {
    try {
      const res = await apiFetch('/delivery-partners/claim-order', {
        method: 'POST',
        body: JSON.stringify({ partnerId, orderId })
      });
      if (res.status === 'success') {
        await get().loadDashboard(partnerId);
        return true;
      }
    } catch (err) {
      console.error('Failed to claim order:', err);
    }
    return false;
  },

  respondToAssignment: async (asgId, partnerId, action) => {
    try {
      const res = await apiFetch(`/delivery-partners/assignments/${asgId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      if (res.status === 'success') {
        set({ incomingAssignment: null });
        await get().loadDashboard(partnerId);
        return true;
      }
    } catch (err) {
      console.error('Failed to respond to assignment:', err);
    }
    return false;
  },

  stepMilestone: async (orderId, partnerId, step, otp, photoProof) => {
    try {
      const res = await apiFetch(`/delivery-partners/deliveries/${orderId}/step`, {
        method: 'POST',
        body: JSON.stringify({ step, partnerId, otp, photoProof })
      });
      
      if (res.status === 'success') {
        if (step === 'complete') {
          set({ activeOrder: null, activeAssignment: null });
          await get().loadDashboard(partnerId);
        } else {
          await get().loadDashboard(partnerId);
        }
        return { success: true };
      } else {
        return { success: false, message: res.message || 'Milestone update failed' };
      }
    } catch (err: any) {
      console.error('Failed to step milestone:', err);
      return { success: false, message: err.message || 'Network error' };
    }
  },

  clearActive: () => set({ activeOrder: null, activeAssignment: null, incomingAssignment: null })
}));
