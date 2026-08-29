import { create } from 'zustand';
import { apiFetch } from '../services/api';

export interface BannerItem {
  id: string;
  categoryTag: string;
  iconName: string;
  badgeText: string;
  title: string;
  subtitle: string;
  points: string[];
  buttonText: string;
  targetCategory: string;
  image: string;
  bgColor: string;
  vendorId?: string;
  vendorName?: string;
}

interface BannerStore {
  banners: BannerItem[];
  isLoading: boolean;
  loadBanners: () => Promise<void>;
  addVendorBanner: (newBannerData: Omit<BannerItem, 'id'>) => Promise<BannerItem>;
  removeBanner: (bannerId: string) => Promise<void>;
}

export const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: 'b_ac_service',
    categoryTag: 'NEARBY SERVICES',
    iconName: 'Wrench',
    badgeText: 'HOT DEAL',
    title: 'Express AC & Home Servicing',
    subtitle: 'Certified Technicians • Doorstep in 30 Mins',
    points: ['Deep Jet Cleaning', '30-Day Guarantee', 'Transparent Pricing'],
    buttonText: 'Book Now',
    targetCategory: 'Services',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
    bgColor: '#FFF1C7',
  },
  {
    id: 'b_grocery_saver',
    categoryTag: 'LOCAL OFFERS',
    iconName: 'ShoppingBag',
    badgeText: 'FLAT 40% OFF',
    title: 'Fresh Mart Super Saver Superstore',
    subtitle: 'Organic Veggies, Farm Fresh Milk & Daily Essentials',
    points: ['Express 15-Min Delivery', 'Zero Delivery Fee', 'Farm Fresh Quality'],
    buttonText: 'Shop Now',
    targetCategory: 'Daily Needs',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
    bgColor: '#E0F2FE',
  },
  {
    id: 'b_tech_electronics',
    categoryTag: 'ELECTRONICS FEST',
    iconName: 'Zap',
    badgeText: 'UP TO 50% OFF',
    title: 'Premium Audio & Smart Electronics',
    subtitle: 'Bose, Sony, Apple & Samsung Official Store Deals',
    points: ['Brand Warranty', 'Instant Cashbacks', 'No Cost EMI'],
    buttonText: 'Explore Tech',
    targetCategory: 'Products',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    bgColor: '#FEF3C7',
  },
  {
    id: 'b_gourmet_dining',
    categoryTag: 'GOURMET FOOD',
    iconName: 'Utensils',
    badgeText: 'BUY 1 GET 1',
    title: 'Royal Tandoori & Biryani Delights',
    subtitle: 'Authentic Dum Biryanis & Kebabs from Top Chefs',
    points: ['Hygienic Packaging', 'Hot Delivery', 'Member Rewards'],
    buttonText: 'Order Food',
    targetCategory: 'Food',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    bgColor: '#FFEDD5',
  },
  {
    id: 'b_luxury_resorts',
    categoryTag: 'GETAWAY DESTINATIONS',
    iconName: 'Bed',
    badgeText: 'SPECIAL OFFERS',
    title: 'Heritage Stay & Resort Getaways',
    subtitle: 'Coorg, Chikmagalur & Ooty Premium Stays',
    points: ['Free Breakfast', 'Pool Access', 'Instant Cancellation'],
    buttonText: 'Reserve Stay',
    targetCategory: 'Stay',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
    bgColor: '#F3E8FF',
  },
];

export const useBannerStore = create<BannerStore>((set) => ({
  banners: DEFAULT_BANNERS,
  isLoading: false,

  loadBanners: async () => {
    set({ isLoading: true });
    try {
      const res = await apiFetch('/banners');
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        set({ banners: res.data, isLoading: false });
      } else {
        set({ banners: DEFAULT_BANNERS, isLoading: false });
      }
    } catch (err) {
      console.warn('[BannerStore] Failed to load banners from MongoDB, using defaults:', err);
      set({ banners: DEFAULT_BANNERS, isLoading: false });
    }
  },

  addVendorBanner: async (newBannerData) => {
    const newBanner: BannerItem = {
      ...newBannerData,
      id: `banner_${Date.now()}`,
    };
    try {
      const res = await apiFetch('/banners', {
        method: 'POST',
        body: JSON.stringify(newBanner),
      });
      if (res && res.data) {
        set((state) => ({
          banners: [res.data, ...state.banners],
        }));
        return res.data;
      }
    } catch (err) {
      console.warn('[BannerStore] Error adding banner to MongoDB:', err);
    }
    set((state) => ({
      banners: [newBanner, ...state.banners],
    }));
    return newBanner;
  },

  removeBanner: async (bannerId) => {
    try {
      await apiFetch(`/banners/${bannerId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('[BannerStore] Error removing banner from MongoDB:', err);
    }
    set((state) => ({
      banners: state.banners.filter((b) => b.id !== bannerId),
    }));
  },
}));
