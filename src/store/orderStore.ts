import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../services/api';

export type OrderCategory = 'Daily Needs' | 'Food' | 'Products' | 'Services' | 'Stay' | 'Travel' | 'Jobs' | 'Electronics' | 'Fashion' | 'Healthcare';
export type OrderType = 'order' | 'booking';

export interface OrderItemDetail {
  name: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  mrp?: number;
  variant?: string;
  image?: string;
}

export interface Order {
  id: string;
  user_id?: string;
  order_number: string;
  vendor_id: string;
  vendor_name?: string;
  category?: OrderCategory;
  order_type?: OrderType;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_latitude: number;
  customer_longitude: number;
  product_details: string;
  amount: number;
  finalAmount?: number;
  status: string;
  created_at: string;

  // Pricing & Breakdown details
  listing_price?: number;
  original_amount?: number;
  mrp_amount?: number;
  selling_price?: number;
  platform_fee?: number;
  delivery_fee?: number;
  discount?: number;
  coupon_code?: string;
  coupon_discount?: number;
  member_discount?: number;

  // Category-specific extensions
  application_id?: string;
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
  vehicle_number?: string;
  vehicleNumber?: string;
  vehicleRegNo?: string;
  busNumber?: string;
  bus_name?: string;
  bus_type?: string;
  boarding_point?: string;
  dropping_point?: string;
  travelers?: any[];
  seat?: string;
  allocated_seat?: string;
  seat_status?: string;
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
  tax?: number;
  rating?: number;
  review_note?: string;
  tracking_updates?: Array<{
    title?: string;
    status?: string;
    message?: string;
    timestamp?: string | Date;
  }>;

  // Job application specifics
  job_id?: string;
  salary?: string;
  location?: string;
  department?: string;
  work_mode?: string;
  experience?: string;
  resume_name?: string;
  applicant_education?: string;
  applicant_experience?: string;
  applicant_email?: string;
  application_status?: string;
  candidateName?: string;
  candidatePhone?: string;
  candidateEmail?: string;
  candidateEducation?: string;
  candidateExperience?: string;
  candidateResume?: string;
  [key: string]: any;
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
  addLocalOrder: (order: Order) => void;
  loadAllOrders: (force?: boolean) => Promise<void>;
  loadDashboard: (userId: string) => Promise<void>;
  claimOrder: (orderId: string, partnerId: string) => Promise<boolean>;
  respondToAssignment: (asgId: string, partnerId: string, action: 'accept' | 'reject') => Promise<boolean>;
  stepMilestone: (orderId: string, partnerId: string, step: string, otp?: string, photoProof?: string | null) => Promise<{ success: boolean; message?: string }>;
  cancelCustomerOrder: (orderId: string, reason?: string) => Promise<boolean>;
  rateOrder: (orderId: string, rating: number, review?: string) => Promise<boolean>;
  updateOrderStatusLocally: (orderId: string, newStatus: string, extra?: any) => void;
  updateDeliveryDetails: (
    orderId: string,
    details: {
      customer_address?: string;
      address_label?: string;
      customer_name?: string;
      customer_phone?: string;
    }
  ) => Promise<boolean>;
  clearActive: () => void;
}

let _lastOrderFetchTime = 0;
let _isFetchingOrders = false;

export const INITIAL_SEED_ORDERS: Order[] = [
  {
    id: 'ord_dn_1',
    user_id: 'cust_uma',
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
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'ord_food_1',
    user_id: 'cust_uma',
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
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'ord_prod_1',
    user_id: 'cust_uma',
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
    created_at: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'ord_srv_1',
    user_id: 'cust_uma',
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
    created_at: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'ord_stay_1',
    user_id: 'cust_uma',
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
    created_at: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'ord_travel_1',
    user_id: 'cust_uma',
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
    created_at: new Date(Date.now() - 15 * 86400 * 1000).toISOString(),
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'job_app_7703',
    user_id: 'cust_uma',
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
    salary: '₹12–18 LPA',
    location: 'Bangalore, KA',
    department: 'IT & Software Engineering',
    work_mode: 'Hybrid',
    experience: '2–5 yrs',
    resume_name: 'Uma_Resume_2026.pdf',
    applicant_education: 'B.Tech in Computer Science',
    applicant_experience: '3 Years Experience',
    applicant_email: 'uma.dev@example.com',
    application_status: 'Applied',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80',
    items: [{ name: 'Senior Full Stack React Native Developer', quantity: 1, price: 0 }],
    item_count: 1,
    amount: 0,
    status: 'Application Submitted',
    payment_method: 'Free Job Application',
    payment_status: 'Paid',
    delivery_fee: 0,
    created_at: '2026-08-28T10:00:00.000Z',
  },
];

export function normalizeStoredOrderCategory<T extends Partial<Order>>(order: T): T {
  if (!order) return order;
  const currentCat = String(order.category || '').trim();
  if (['Jobs', 'Services', 'Stay', 'Travel', 'Food', 'Daily Needs'].includes(currentCat)) {
    return order;
  }
  const details = (order.product_details || '').toLowerCase();
  const hasDailyNeeds =
    (order.items &&
      order.items.some((it: any) => {
        const n = String(it.name || '').toLowerCase();
        const c = String(it.category || '').toLowerCase();
        return c.includes('daily') || c.includes('grocery') || /\b(milk|lays|curd|bread|eggs?|butter|chips)\b/i.test(n);
      })) ||
    /\b(milk|lays|curd|bread|eggs?|butter|chips)\b/i.test(details);

  if (hasDailyNeeds) {
    return { ...order, category: 'Daily Needs' as OrderCategory };
  }
  return order;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
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

      addLocalOrder: (order: Order) => {
        let uId = 'guest_user';
        try {
          const authModule = require('./authStore');
          const curUser = authModule.useAuthStore.getState().currentUser;
          if (curUser) {
            uId = curUser.isGuest ? 'guest_user' : curUser.id;
          }
        } catch {}
        const scopedOrder = normalizeStoredOrderCategory({ ...order, user_id: order.user_id || uId });

        set((state) => {
          const current = state.allOrders || [];
          const filtered = current.filter(
            (o) => o.id !== scopedOrder.id && o.order_number !== scopedOrder.order_number
          );
          return { allOrders: [scopedOrder, ...filtered] };
        });
      },

      updateOrderStatusLocally: (orderId: string, newStatus: string, extra?: any) => {
        set((state) => {
          const current = state.allOrders || [];
          const updated = current.map((o) => {
            const matches =
              o.id === orderId ||
              o.order_number === orderId ||
              (o as any)._id === orderId ||
              (extra?.order?.order_number && o.order_number === extra.order.order_number) ||
              (extra?.order?.id && o.id === extra.order.id) ||
              (extra?.order?._id && (o as any)._id === extra.order._id);
            if (matches) {
              const currentUpdates = o.tracking_updates || [];
              const newUpdate = extra?.tracking_update || {
                title: extra?.title || `Order ${newStatus}`,
                status: newStatus,
                message: extra?.message || extra?.description || `Status updated to ${newStatus}`,
                timestamp: new Date().toISOString()
              };
              return {
                ...o,
                ...(extra?.order || {}),
                status: newStatus,
                tracking_updates: [...currentUpdates, newUpdate],
              };
            }
            return o;
          });
          return { allOrders: updated };
        });
      },

      updateDeliveryDetails: async (orderId: string, details: any) => {
        // Optimistically update locally for instantaneous response
        set((state) => {
          const current = state.allOrders || [];
          const updated = current.map((o) => {
            const matches = o.id === orderId || o.order_number === orderId || (o as any)._id === orderId;
            if (matches) {
              return {
                ...o,
                ...details,
                customer_address: details.customer_address || o.customer_address,
                customerAddress: details.customer_address || (o as any).customerAddress,
                address_label: details.address_label || (o as any).address_label,
                customer_name: details.customer_name || o.customer_name,
                memberName: details.customer_name || (o as any).memberName,
                customer_phone: details.customer_phone || o.customer_phone,
                customerPhone: details.customer_phone || (o as any).customerPhone,
                phone: details.customer_phone || (o as any).phone,
              };
            }
            return o;
          });
          return { allOrders: updated };
        });

        // Persist to backend API
        try {
          const res = await apiFetch(`/orders/${orderId}/delivery-details`, {
            method: 'PATCH',
            body: JSON.stringify(details),
          });
          return res?.success !== false;
        } catch (e) {
          console.warn('[OrderStore] Failed to update delivery details on backend:', e);
          return false;
        }
      },

      loadAllOrders: async (force = false) => {
        const now = Date.now();
        if (!force && (_isFetchingOrders || (now - _lastOrderFetchTime < 4000 && get().allOrders.length > 0))) {
          return;
        }

        _isFetchingOrders = true;
        try {
          const res = await apiFetch('/orders', { skipCache: true });
          _lastOrderFetchTime = Date.now();
          if (res && res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
            const current = get().allOrders || [];
            const backendIdSet = new Set<string>();
            const backendOrderNumSet = new Set<string>();

            res.data.forEach((o: any) => {
              if (o.id) backendIdSet.add(String(o.id));
              if (o._id) backendIdSet.add(String(o._id));
              if (o.order_number) backendOrderNumSet.add(String(o.order_number));
            });

            const localOnly = current.filter((o: any) => {
              const matchesBackend =
                (o.id && backendIdSet.has(String(o.id))) ||
                (o._id && backendIdSet.has(String(o._id))) ||
                (o.order_number && backendOrderNumSet.has(String(o.order_number)));
              return !matchesBackend;
            });

            set({ allOrders: [...res.data, ...localOnly].map(normalizeStoredOrderCategory) });
          }
        } catch (err) {
          console.warn('Failed to load all orders from API, using offline persistent state:', err);
          if (get().allOrders.length === 0) {
            set({ allOrders: INITIAL_SEED_ORDERS });
          }
        } finally {
          _isFetchingOrders = false;
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
    // 1. Immediate optimistic local state update (0ms UI delay)
    set((state) => ({
      allOrders: state.allOrders.map((o) =>
        o.id === orderId ? { ...o, status: 'Cancelled' } : o
      ),
    }));

    // 2. Background sync to backend
    apiFetch(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || 'Customer requested cancellation' }),
    }).catch((err) => {
      console.warn('Background cancel order notice:', err);
    });

    return true;
  },

  rateOrder: async (orderId, rating, review) => {
    // 1. Immediate optimistic local state update (0ms UI delay)
    set((state) => ({
      allOrders: state.allOrders.map((o) =>
        o.id === orderId ? { ...o, rating, review_note: review } : o
      ),
    }));

    // 2. Background sync to backend
    apiFetch(`/orders/${orderId}/review`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    }).catch((err) => {
      console.warn('Background rate order notice:', err);
    });

    return true;
  },

  clearActive: () => set({ activeOrder: null, activeAssignment: null, incomingAssignment: null }),
}),
    {
      name: 'connect_app_orders_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
