import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  message?: string;
  time: string;
  icon?: string;
  category?: 'order' | 'offer' | 'system' | 'membership' | 'Travel' | 'Stay' | 'Services' | 'Products' | 'Jobs' | string;
  unread: boolean;
  targetScreen?: string;
  targetParams?: any;
  actionLabel?: string; // 'View Order' | 'View Booking' | 'View Job' | 'View Offer'
  actionType?: 'order' | 'booking' | 'job' | 'offer' | 'system' | 'view_order' | 'view_booking' | 'view_job' | string;
  orderType?: 'order' | 'booking' | 'job' | string;
  orderId?: string;
  bookingId?: string;
  [key: string]: any;
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Order Placed & Partner Assigned 🚚',
    body: 'Rider Rajesh Kumar has been assigned to your order #ORD1244.',
    time: '2 mins ago',
    icon: 'Truck',
    category: 'order',
    unread: true,
    actionLabel: 'View Order',
    actionType: 'order',
    orderType: 'order',
    targetScreen: 'Orders',
    targetParams: { activeTab: 'my orders' },
  },
  {
    id: 'notif_2',
    title: 'Bus Ticket Booked Successfully! 🚍',
    body: 'Your bus booking #BK-849204 for Bangalore ➔ Chennai is booked. Seat allocation pending from operator.',
    time: '15 mins ago',
    icon: 'Bus',
    category: 'order',
    unread: true,
    actionLabel: 'View Booking',
    actionType: 'booking',
    orderType: 'booking',
    bookingId: 'BK-849204',
    targetScreen: 'Orders',
    targetParams: { activeTab: 'my bookings', category: 'Travel' },
  },
  {
    id: 'notif_3',
    title: 'Job Application Submitted! 💼',
    body: 'Your application for Senior React Native Developer at CloudScale Systems is submitted successfully.',
    time: '45 mins ago',
    icon: 'Briefcase',
    category: 'order',
    unread: true,
    actionLabel: 'View Job',
    actionType: 'job',
    orderType: 'job',
    targetScreen: 'Orders',
    targetParams: { activeTab: 'job applied', category: 'Jobs' },
  },
  {
    id: 'notif_4',
    title: 'Exclusive Gold Member Offer ⭐',
    body: 'Get flat 20% OFF on all AC servicing & Home repairs this week!',
    time: '2 hours ago',
    icon: 'Sparkles',
    category: 'offer',
    unread: false,
    actionLabel: 'View Offer',
    actionType: 'offer',
    targetScreen: 'Membership',
  },
];

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'time' | 'unread' | 'body'> & { body?: string }) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
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
          title: item.title || 'Notification',
          body: item.body || item.message || '',
          icon: item.icon || 'Bell',
          id: `notif_${Date.now()}`,
          time: 'Just now',
          unread: true,
        };
        set((state) => ({
          notifications: [newItem, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },
    }),
    {
      name: 'connect_app_notifications_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
