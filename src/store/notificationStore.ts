import { create } from 'zustand';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: string;
  category?: 'order' | 'offer' | 'system' | 'membership';
  unread: boolean;
  targetScreen?: string;
  targetParams?: any;
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Order Assigned to Partner',
    body: 'Rider Rajesh Kumar has been assigned to your order #ORD1244.',
    time: '2 mins ago',
    icon: 'Truck',
    category: 'order',
    unread: true,
    targetScreen: 'Orders',
  },
  {
    id: 'notif_2',
    title: 'Exclusive Gold Member Offer',
    body: 'Get flat 20% OFF on all AC servicing & Home repairs this week!',
    time: '1 hour ago',
    icon: 'Sparkles',
    category: 'offer',
    unread: true,
    targetScreen: 'Membership',
  },
  {
    id: 'notif_3',
    title: 'Wallet Top Up Success',
    body: '₹5,000.00 was successfully added to your Connect Wallet.',
    time: 'Yesterday',
    icon: 'CreditCard',
    category: 'system',
    unread: false,
  },
  {
    id: 'notif_4',
    title: 'Welcome to Connect Club',
    body: 'Begin exploring food, stay, travel, and local service benefits with your Gold membership.',
    time: '3 days ago',
    icon: 'Award',
    category: 'membership',
    unread: false,
  },
];

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'time' | 'unread'>) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: INITIAL_NOTIFICATIONS,
  unreadCount: INITIAL_NOTIFICATIONS.filter((n) => n.unread).length,

  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, unread: false } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => n.unread).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, unread: false })),
      unreadCount: 0,
    }));
  },

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },

  addNotification: (item) => {
    const newItem: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}`,
      time: 'Just now',
      unread: true,
    };
    set((state) => ({
      notifications: [newItem, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
