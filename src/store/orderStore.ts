import { create } from 'zustand';
import { apiFetch } from '../services/api';

export type OrderCategory = 'Daily Needs' | 'Food' | 'Products' | 'Services' | 'Stay' | 'Travel' | 'Jobs' | 'Electronics' | 'Fashion' | 'Healthcare';
export type OrderType = 'order' | 'booking';

export interface OrderItemDetail {
  name: string;
  quantity: number;
  price: number;
  variant?: string;
}

export interface Order {
  id: string;
  order_number: string;
  vendor_id: string;
  vendor_name?: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_latitude: number;
  customer_longitude: number;
  product_details: string;
  amount: number;
  status: string;
  created_at: string;

  // Category-specific extensions
  category?: OrderCategory;
  order_type?: OrderType;
  image?: string;
  brand_or_seller?: string;
  items?: OrderItemDetail[];
  item_count?: number;

  // Service / Healthcare specifics
  provider_name?: string;
  appointment_slot?: string;
  patient_name?: string;
  consultation_type?: string;

  // Travel / Stay specifics
  operator_name?: string;
  route?: string;
  travel_date?: string;
  passenger_count?: number;
  hotel_name?: string;
  check_in?: string;
  check_out?: string;
  guests_count?: string;
  room_type?: string;

  // Payment & Delivery metadata
  payment_method?: string;
  payment_status?: 'Paid' | 'Pending' | 'Refunded';
  expected_delivery?: string;
  delivered_at?: string;
  delivery_fee?: number;
  discount?: number;
  tax?: number;
  rating?: number;
  review_note?: string;
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
  cancelCustomerOrder: (orderId: string, reason?: string) => Promise<boolean>;
  rateOrder: (orderId: string, rating: number, review?: string) => Promise<boolean>;
  clearActive: () => void;
}

export const INITIAL_SEED_ORDERS: Order[] = [
  {
    id: 'ord_dn_1',
    order_number: 'DN-9941',
    vendor_id: 'v_daily_needs',
    vendor_name: 'Organic Harvest Fresh Daily',
    category: 'Daily Needs',
    order_type: 'order',
    customer_name: 'Uma',
    customer_phone: '+91 98888 88888',
    customer_address: 'Flat 402, Indiranagar, Bangalore',
    customer_latitude: 12.9716,
    customer_longitude: 77.6412,
    product_details: 'Organic A2 Whole Milk 1L & Fresh Avocados 500g',
    brand_or_seller: 'Organic Harvest Store',
    items: [
      { name: 'Organic A2 Whole Milk 1L', quantity: 2, price: 90 },
      { name: 'Fresh Hass Avocados 500g', quantity: 1, price: 180 },
    ],
    item_count: 2,
    amount: 360,
    status: 'In Transit',
    payment_method: 'UPI Instant Pay',
    payment_status: 'Paid',
    expected_delivery: 'Arriving in 15 mins (04:15 PM)',
    delivery_fee: 0,
    created_at: '2026-08-28T14:30:00.000Z',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'ord_food_1',
    order_number: 'FD-8832',
    vendor_id: 'v_royal_tandoor',
    vendor_name: 'Royal Tandoori & Biryani House',
    category: 'Food',
    order_type: 'order',
    customer_name: 'Uma',
    customer_phone: '+91 98888 88888',
    customer_address: 'Flat 402, Indiranagar, Bangalore',
    customer_latitude: 12.9716,
    customer_longitude: 77.6412,
    product_details: 'Special Hydrabadi Dum Biryani & Butter Naan',
    brand_or_seller: 'Royal Tandoor Kitchen',
    items: [
      { name: 'Hydrabadi Chicken Dum Biryani', quantity: 1, price: 340 },
      { name: 'Garlic Butter Naan', quantity: 2, price: 60 },
    ],
    item_count: 2,
    amount: 460,
    status: 'Preparing',
    payment_method: 'Connect Wallet',
    payment_status: 'Paid',
    expected_delivery: 'Chef preparing • Delivery in 25 mins',
    delivery_fee: 0,
    created_at: '2026-08-28T13:15:00.000Z',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'ord_prod_1',
    order_number: 'PR-1049',
    vendor_id: 'v_bose_india',
    vendor_name: 'Bose Official Electronics',
    category: 'Products',
    order_type: 'order',
    customer_name: 'Uma',
    customer_phone: '+91 98888 88888',
    customer_address: 'Flat 402, Indiranagar, Bangalore',
    customer_latitude: 12.9716,
    customer_longitude: 77.6412,
    product_details: 'Bose QuietComfort 45 Noise Cancelling Headphones',
    brand_or_seller: 'Bose India Direct',
    items: [
      { name: 'Bose QuietComfort 45 (Triple Black)', quantity: 1, price: 29900 },
    ],
    item_count: 1,
    amount: 29900,
    status: 'Delivered',
    payment_method: 'Credit Card (HDFC Bank)',
    payment_status: 'Paid',
    delivered_at: '27 Aug 2026, 05:40 PM',
    delivery_fee: 0,
    created_at: '2026-08-26T10:00:00.000Z',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'ord_srv_1',
    order_number: 'SRV-4492',
    vendor_id: 'v_urban_care',
    vendor_name: 'UrbanCare Home Repairs',
    category: 'Services',
    order_type: 'booking',
    customer_name: 'Uma',
    customer_phone: '+91 98888 88888',
    customer_address: 'Flat 402, Indiranagar, Bangalore',
    customer_latitude: 12.9716,
    customer_longitude: 77.6412,
    product_details: 'AC Deep Foam Jet Cleaning & Master Servicing',
    brand_or_seller: 'UrbanCare Certified Engineers',
    appointment_slot: 'Tomorrow at 10:30 AM',
    items: [
      { name: 'Split AC Deep Cleaning & Servicing', quantity: 2, price: 699 },
    ],
    item_count: 2,
    amount: 1398,
    status: 'Confirmed',
    payment_method: 'Pay after Service',
    payment_status: 'Pending',
    expected_delivery: 'Technician Assigned: Ramesh Kumar',
    delivery_fee: 0,
    created_at: '2026-08-28T09:00:00.000Z',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'ord_stay_1',
    order_number: 'STY-3021',
    vendor_id: 'v_taj_resorts',
    vendor_name: 'Taj Gateway Resort & Spa',
    category: 'Stay',
    order_type: 'booking',
    customer_name: 'Uma',
    customer_phone: '+91 98888 88888',
    customer_address: 'Flat 402, Indiranagar, Bangalore',
    customer_latitude: 12.9716,
    customer_longitude: 77.6412,
    product_details: 'Luxury Heritage Villa - 2 Nights Stay',
    brand_or_seller: 'Taj Hotels & Resorts',
    hotel_name: 'Taj Gateway Resort Coorg',
    check_in: '12 Sep 2026 (02:00 PM)',
    check_out: '14 Sep 2026 (11:00 AM)',
    guests_count: '2 Adults, 1 Room',
    items: [
      { name: 'Heritage Pool Villa Stay (2 Nights)', quantity: 1, price: 14500 },
    ],
    item_count: 1,
    amount: 14500,
    status: 'Confirmed',
    payment_method: 'UPI Prepaid',
    payment_status: 'Paid',
    delivery_fee: 0,
    created_at: '2026-08-25T11:20:00.000Z',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'ord_travel_1',
    order_number: 'TRV-5510',
    vendor_id: 'v_indigo_airlines',
    vendor_name: 'IndiGo Airlines India',
    category: 'Travel',
    order_type: 'booking',
    customer_name: 'Uma',
    customer_phone: '+91 98888 88888',
    customer_address: 'Flat 402, Indiranagar, Bangalore',
    customer_latitude: 12.9716,
    customer_longitude: 77.6412,
    product_details: 'Bangalore (BLR) ➔ New Delhi (DEL) Flight 6E-504',
    operator_name: 'IndiGo Airlines',
    route: 'BLR ➔ DEL',
    travel_date: '10 Sep 2026 • 07:15 AM',
    items: [
      { name: 'Non-stop Flight Ticket (BLR-DEL)', quantity: 1, price: 4850 },
    ],
    item_count: 1,
    amount: 4850,
    status: 'Confirmed',
    payment_method: 'NetBanking (ICICI)',
    payment_status: 'Paid',
    delivery_fee: 0,
    created_at: '2026-08-20T16:45:00.000Z',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'job_app_7703',
    order_number: 'JOB-AP-7703',
    vendor_id: 'v_techforge',
    vendor_name: 'TechForge Solutions India',
    category: 'Jobs',
    order_type: 'booking',
    customer_name: 'Uma',
    customer_phone: '+91 98888 88888',
    customer_address: 'Flat 402, Indiranagar, Bangalore',
    customer_latitude: 12.9716,
    customer_longitude: 77.6412,
    product_details: 'Senior Full Stack React Native Developer',
    brand_or_seller: 'TechForge Talent Acquisition',
    appointment_slot: 'Technical Round 1: Tomorrow at 03:00 PM',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80',
    items: [{ name: 'Job Application Screening & Tech Interview', quantity: 1, price: 0 }],
    item_count: 1,
    amount: 0,
    status: 'Confirmed',
    payment_method: 'Free Job Application',
    payment_status: 'Paid',
    delivery_fee: 0,
    created_at: '2026-08-28T10:00:00.000Z',
  },
];

export const useOrderStore = create<OrderState>((set, get) => ({
  allOrders: INITIAL_SEED_ORDERS,
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
      if (res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
        set({ allOrders: res.data });
      }
    } catch (err) {
      console.warn('Failed to load all orders from API, using offline seed:', err);
      if (get().allOrders.length === 0) {
        set({ allOrders: INITIAL_SEED_ORDERS });
      }
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
          rating: stats?.rating || 4.9,
        });
      }

      const earnRes = await apiFetch(`/delivery-partners/${userId}/earnings`);
      if (earnRes.status === 'success') {
        set({ earningsLogs: earnRes.data || [] });
      }

      await get().loadAllOrders();
    } catch (err) {
      console.warn('Failed to load rider details:', err);
    }
  },

  claimOrder: async (orderId, partnerId) => {
    try {
      const res = await apiFetch('/delivery-partners/claim-order', {
        method: 'POST',
        body: JSON.stringify({ partnerId, orderId }),
      });
      if (res.status === 'success') {
        await get().loadDashboard(partnerId);
        return true;
      }
    } catch (err) {
      console.warn('Failed to claim order:', err);
    }
    return false;
  },

  respondToAssignment: async (asgId, partnerId, action) => {
    try {
      const res = await apiFetch(`/delivery-partners/assignments/${asgId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      if (res.status === 'success') {
        set({ incomingAssignment: null });
        await get().loadDashboard(partnerId);
        return true;
      }
    } catch (err) {
      console.warn('Failed to respond to assignment:', err);
    }
    return false;
  },

  stepMilestone: async (orderId, partnerId, step, otp, photoProof) => {
    try {
      const res = await apiFetch(`/delivery-partners/deliveries/${orderId}/step`, {
        method: 'POST',
        body: JSON.stringify({ step, partnerId, otp, photoProof }),
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
      console.warn('Failed to step milestone:', err);
      return { success: false, message: err.message || 'Network error' };
    }
  },

  cancelCustomerOrder: async (orderId, reason) => {
    try {
      const res = await apiFetch(`/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason || 'Customer requested cancellation' }),
      });
      if (res.status === 'success') {
        // Optimistic local state update
        set((state) => ({
          allOrders: state.allOrders.map((o) =>
            o.id === orderId ? { ...o, status: 'Cancelled' } : o
          ),
        }));
        return true;
      }
    } catch (err) {
      console.warn('Failed to cancel order:', err);
    }
    return false;
  },

  rateOrder: async (orderId, rating, review) => {
    try {
      const res = await apiFetch(`/orders/${orderId}/review`, {
        method: 'POST',
        body: JSON.stringify({ rating, review }),
      });
      if (res.status === 'success') {
        set((state) => ({
          allOrders: state.allOrders.map((o) =>
            o.id === orderId ? { ...o, rating, review_note: review } : o
          ),
        }));
        return true;
      }
    } catch (err) {
      console.warn('Failed to rate order:', err);
    }
    return false;
  },

  clearActive: () => set({ activeOrder: null, activeAssignment: null, incomingAssignment: null }),
}));
