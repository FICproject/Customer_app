import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Image,
  Modal,
  Alert,
  Share,
} from 'react-native';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CustomerStackParamList } from '../../navigation/AppNavigator';
import { useOrderStore, Order } from '../../store/orderStore';
import { useThemeStore } from '../../store/themeStore';
import * as Icons from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

type CustomerOrdersProp = StackNavigationProp<CustomerStackParamList, 'CustomerTabs'>;

export const CATEGORIES = [
  'All',
  'Daily Needs',
  'Food',
  'Products',
  'Services',
  'Stay',
  'Travel',
  'Jobs',
] as const;

export type CategoryFilterType = (typeof CATEGORIES)[number];
export type StatusFilterType = 'all' | 'active' | 'completed' | 'bookings' | 'cancelled';

export default function CustomerOrders() {
  const navigation = useNavigation<CustomerOrdersProp>();
  const isFocused = useIsFocused();
  const route = useRoute<any>();
  const { colors, themeMode } = useThemeStore();
  const isLight =
    colors.background === '#FFFDF5' ||
    colors.background === '#FFFFFF' ||
    colors.background === '#F8FAFC' ||
    colors.background === '#FFF8E8' ||
    themeMode === 'light';

  const allOrders = useOrderStore((state) => state.allOrders);
  const loadAllOrders = useOrderStore((state) => state.loadAllOrders);
  const cancelCustomerOrder = useOrderStore((state) => state.cancelCustomerOrder);
  const rateOrder = useOrderStore((state) => state.rateOrder);

  // Search & Filter State
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Primary Category Filter
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterType>('All');

  // 2. Secondary Status Filter
  const [activeStatusTab, setActiveStatusTab] = useState<StatusFilterType>('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Modals & Action State
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Found a better price');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Fetch orders in background on focus without blocking UI
  useEffect(() => {
    if (isFocused) {
      loadAllOrders().catch((e) => console.log('Silent load orders err:', e));
    }
  }, [isFocused, loadAllOrders]);

  // Sync route params if navigated from elsewhere
  useEffect(() => {
    if (route.params?.activeTab) {
      if (route.params.activeTab === 'bookings') {
        setActiveStatusTab('bookings');
      } else {
        setActiveStatusTab('all');
      }
    }
    if (route.params?.category) {
      const match = CATEGORIES.find(
        (c) => c.toLowerCase() === (route.params.category || '').toLowerCase()
      );
      if (match) setSelectedCategory(match);
    }
  }, [route.params?.activeTab, route.params?.category]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await loadAllOrders();
    setRefreshing(false);
  };

  // Status Check Helpers
  const isActiveStatus = (status: string) => {
    const s = (status || '').toLowerCase();
    return (
      s.includes('order received') ||
      s.includes('placed') ||
      s.includes('preparing') ||
      s.includes('processing') ||
      s.includes('ready') ||
      s.includes('assigned') ||
      s.includes('accepted') ||
      s.includes('picked up') ||
      s.includes('out for delivery') ||
      s.includes('near customer') ||
      s.includes('in transit') ||
      s.includes('confirmed') ||
      s.includes('in progress')
    );
  };

  const isCompletedStatus = (status: string) => {
    const s = (status || '').toLowerCase();
    return s.includes('delivered') || s.includes('completed');
  };

  const isCancelledStatus = (status: string) => {
    return (status || '').toLowerCase().includes('cancel');
  };

  // Status Badge Colors & Info
  const getStatusMeta = (status: string) => {
    if (isCompletedStatus(status)) {
      return {
        label: (status || 'COMPLETED').toUpperCase(),
        color: '#10B981',
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.25)',
      };
    }
    if (isCancelledStatus(status)) {
      return {
        label: 'CANCELLED',
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.25)',
      };
    }
    if (
      status.toLowerCase().includes('out for delivery') ||
      status.toLowerCase().includes('in transit')
    ) {
      return {
        label: 'OUT FOR DELIVERY',
        color: '#3B82F6',
        bg: 'rgba(59, 130, 246, 0.12)',
        border: 'rgba(59, 130, 246, 0.25)',
      };
    }
    if (status.toLowerCase().includes('confirmed')) {
      return {
        label: 'CONFIRMED',
        color: '#06B6D4',
        bg: 'rgba(6, 182, 212, 0.12)',
        border: 'rgba(6, 182, 212, 0.25)',
      };
    }
    return {
      label: (status || 'ORDER RECEIVED').toUpperCase(),
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.25)',
    };
  };

  // Category Tag Meta
  const getCategoryMeta = (order: Order) => {
    const cat = order.category || 'Products';
    switch (cat) {
      case 'Daily Needs':
        return { label: 'DAILY NEEDS', color: '#10B981', icon: Icons.ShoppingBasket };
      case 'Food':
        return { label: 'FOOD & DINING', color: '#F97316', icon: Icons.UtensilsCrossed };
      case 'Products':
      case 'Electronics':
      case 'Fashion':
        return { label: 'PRODUCTS', color: '#3B82F6', icon: Icons.Package };
      case 'Services':
        return { label: 'SERVICE BOOKING', color: '#8B5CF6', icon: Icons.Wrench };
      case 'Stay':
        return { label: 'STAY BOOKING', color: '#0EA5E9', icon: Icons.Hotel };
      case 'Travel':
        return { label: 'TRAVEL BOOKING', color: '#EC4899', icon: Icons.Plane };
      case 'Jobs':
        return { label: 'JOB APPLICATION', color: '#059669', icon: Icons.Briefcase };
      default:
        return { label: 'PRODUCTS', color: '#F59E0B', icon: Icons.Package };
    }
  };

  // Compute Accurate Counts per Category across all stored orders
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allOrders.length };
    CATEGORIES.forEach((cat) => {
      if (cat !== 'All') {
        counts[cat] = allOrders.filter((o) => {
          if (cat === 'Products') {
            return (
              o.category === 'Products' ||
              o.category === 'Electronics' ||
              o.category === 'Fashion' ||
              !o.category
            );
          }
          return (o.category || '').toLowerCase() === cat.toLowerCase();
        }).length;
      }
    });
    return counts;
  }, [allOrders]);

  // Compute status counts for the filter modal based on current category
  const statusCounts = useMemo(() => {
    let base = allOrders;
    if (selectedCategory !== 'All') {
      base = base.filter((o) => {
        if (selectedCategory === 'Products') {
          return (
            o.category === 'Products' ||
            o.category === 'Electronics' ||
            o.category === 'Fashion' ||
            !o.category
          );
        }
        return (o.category || '').toLowerCase() === selectedCategory.toLowerCase();
      });
    }
    const all = base.length;
    const active = base.filter((o) => isActiveStatus(o.status)).length;
    const completed = base.filter((o) => isCompletedStatus(o.status)).length;
    const cancelled = base.filter((o) => isCancelledStatus(o.status)).length;
    return { all, active, completed, cancelled };
  }, [allOrders, selectedCategory]);

  // Handle Instant Category Switch
  const handleSelectCategory = (cat: CategoryFilterType) => {
    setSelectedCategory(cat);
    // Reset status filter to all on category switch to ensure user immediately sees all available orders
    setActiveStatusTab('all');
  };

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return allOrders
      .filter((order) => {
        // 1. Primary Category Filter
        if (selectedCategory !== 'All') {
          if (selectedCategory === 'Products') {
            const isProd =
              order.category === 'Products' ||
              order.category === 'Electronics' ||
              order.category === 'Fashion' ||
              !order.category;
            if (!isProd) return false;
          } else if (
            (order.category || '').toLowerCase() !== selectedCategory.toLowerCase()
          ) {
            return false;
          }
        }

        // 2. Secondary Status Filter
        if (activeStatusTab === 'active' && !isActiveStatus(order.status)) return false;
        if (activeStatusTab === 'completed' && !isCompletedStatus(order.status)) return false;
        if (activeStatusTab === 'cancelled' && !isCancelledStatus(order.status)) return false;
        if (activeStatusTab === 'bookings') {
          const isBkg =
            order.order_type === 'booking' ||
            ['Services', 'Travel', 'Stay', 'Jobs'].includes(order.category || '');
          if (!isBkg) return false;
        }

        // 3. Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = (order.product_details || '').toLowerCase().includes(q);
          const matchesNum = (order.order_number || '').toLowerCase().includes(q);
          const matchesVendor = (order.vendor_name || '').toLowerCase().includes(q);
          const matchesSeller = (order.brand_or_seller || '').toLowerCase().includes(q);
          const matchesProvider = (order.provider_name || '').toLowerCase().includes(q);
          const matchesOperator = (order.operator_name || '').toLowerCase().includes(q);
          const matchesHotel = (order.hotel_name || '').toLowerCase().includes(q);

          if (
            !matchesName &&
            !matchesNum &&
            !matchesVendor &&
            !matchesSeller &&
            !matchesProvider &&
            !matchesOperator &&
            !matchesHotel
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const aActive = isActiveStatus(a.status) ? 1 : 0;
        const bActive = isActiveStatus(b.status) ? 1 : 0;
        if (aActive !== bActive) return bActive - aActive;
        return new Date(b.created_at || Date.now()).getTime() - new Date(a.created_at || Date.now()).getTime();
      });
  }, [allOrders, selectedCategory, activeStatusTab, searchQuery]);

  // Subtitle Record Count Formatter
  const renderRecordCountSubtitle = () => {
    const totalInCat = categoryCounts[selectedCategory] || 0;
    if (activeStatusTab === 'all' && !searchQuery.trim()) {
      if (selectedCategory === 'All') {
        return `${totalInCat} ${totalInCat === 1 ? 'total order' : 'total orders'}`;
      }
      return `${totalInCat} ${totalInCat === 1 ? selectedCategory + ' order' : selectedCategory + ' orders'}`;
    }

    // Filtered State
    const statusLabel =
      activeStatusTab === 'active'
        ? 'Active'
        : activeStatusTab === 'completed'
        ? 'Completed'
        : activeStatusTab === 'bookings'
        ? 'Bookings'
        : activeStatusTab === 'cancelled'
        ? 'Cancelled'
        : '';

    if (totalInCat === 0) {
      return `0 ${selectedCategory !== 'All' ? selectedCategory : ''} orders`;
    }

    return `${filteredOrders.length} of ${totalInCat} ${selectedCategory !== 'All' ? selectedCategory : ''} orders ${statusLabel ? `(${statusLabel})` : ''}`.trim();
  };

  // Group by Date sections
  const groupedOrders = useMemo(() => {
    const groups: { [key: string]: Order[] } = {};
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    filteredOrders.forEach((order) => {
      const orderDate = new Date(order.created_at || Date.now());
      const orderDateStr = orderDate.toDateString();

      let groupKey = 'Older Orders';
      if (orderDateStr === todayStr) {
        groupKey = 'Today';
      } else if (orderDateStr === yesterdayStr) {
        groupKey = 'Yesterday';
      } else if (now.getTime() - orderDate.getTime() < 30 * 24 * 3600 * 1000) {
        groupKey = orderDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(order);
    });

    return Object.entries(groups).map(([title, items]) => ({ title, items }));
  }, [filteredOrders]);

  // Handle Cancel Order
  const executeCancel = async () => {
    if (!selectedOrderForCancel || isProcessingAction) return;
    const orderId = selectedOrderForCancel.id;
    setIsProcessingAction(true);
    setSelectedOrderForCancel(null);

    const success = await cancelCustomerOrder(orderId, cancelReason);
    setIsProcessingAction(false);
    if (success) {
      showToast('Order cancelled successfully. Refund initiated if prepaid.');
      if (selectedOrderForDetails?.id === orderId) {
        setSelectedOrderForDetails({ ...selectedOrderForDetails, status: 'Cancelled' });
      }
    } else {
      Alert.alert('Notice', 'Order cancelled and updated.');
    }
  };

  // Handle Rating Submission
  const executeReview = async () => {
    if (!selectedOrderForReview || isProcessingAction) return;
    const orderId = selectedOrderForReview.id;
    setIsProcessingAction(true);
    setSelectedOrderForReview(null);

    const success = await rateOrder(orderId, reviewRating, reviewText);
    setIsProcessingAction(false);
    if (success) {
      showToast('Thank you! Your review has been submitted.');
      if (selectedOrderForDetails?.id === orderId) {
        setSelectedOrderForDetails({
          ...selectedOrderForDetails,
          rating: reviewRating,
          review_note: reviewText,
        });
      }
      setReviewText('');
    }
  };

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const shareInvoice = async (order: Order) => {
    try {
      await Share.share({
        message: `Connect Order Invoice #${order.order_number}\nCategory: ${order.category || 'Products'}\nDetails: ${order.product_details}\nTotal: ₹${order.amount.toLocaleString('en-IN')}\nStatus: ${order.status}`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  // Route Explore Button to Specific Category
  const handleExploreCategory = (cat: CategoryFilterType) => {
    if (cat === 'All') {
      navigation.navigate('CustomerTabs', { screen: 'Categories' });
    } else {
      const targetCat = cat === 'Products' ? 'Product' : cat;
      navigation.navigate('CategoryDetails', { categoryName: targetCat });
    }
  };

  // Render Dynamic Empty State Description & Explore Action
  const renderEmptyState = () => {
    const isFilteredByStatus =
      activeStatusTab !== 'all' && (categoryCounts[selectedCategory] || 0) > 0;

    if (searchQuery.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconCircle,
              {
                backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
                borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
              },
            ]}
          >
            <Icons.SearchX color="#F5B800" size={32} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No search results</Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)' },
            ]}
          >
            No orders or bookings match "{searchQuery}".
          </Text>
          <TouchableOpacity
            style={styles.emptyActionBtn}
            onPress={() => setSearchQuery('')}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyActionBtnText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isFilteredByStatus) {
      const statusName =
        activeStatusTab === 'active'
          ? 'active'
          : activeStatusTab === 'completed'
          ? 'delivered / completed'
          : activeStatusTab === 'bookings'
          ? 'booking'
          : 'cancelled';

      return (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconCircle,
              {
                backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
                borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
              },
            ]}
          >
            <Icons.FilterX color="#F5B800" size={32} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No {statusName} {selectedCategory !== 'All' ? selectedCategory : ''} orders
          </Text>
          <Text
            style={[
              styles.emptySubtitle,
              { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)' },
            ]}
          >
            You have {categoryCounts[selectedCategory]} {selectedCategory} order(s) under other
            status filters.
          </Text>
          <TouchableOpacity
            style={styles.emptyActionBtn}
            onPress={() => setActiveStatusTab('all')}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyActionBtnText}>
              View All {selectedCategory !== 'All' ? selectedCategory : ''} Orders
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Truly 0 Orders in Category
    const getEmptyCategoryMeta = () => {
      switch (selectedCategory) {
        case 'Daily Needs':
          return {
            icon: Icons.ShoppingBasket,
            title: 'No Daily Needs orders found',
            desc: 'Order fresh milk, groceries, fruits and daily essentials delivered in minutes.',
            btn: 'Explore Daily Needs',
          };
        case 'Food':
          return {
            icon: Icons.UtensilsCrossed,
            title: 'No Food orders found',
            desc: 'Explore top-rated restaurants, gourmet meals, and dishes delivered to your door.',
            btn: 'Explore Food & Dining',
          };
        case 'Products':
          return {
            icon: Icons.Package,
            title: 'No Products orders found',
            desc: 'Shop electronics, fashion, lifestyle, and home goods with superfast delivery.',
            btn: 'Explore Products',
          };
        case 'Services':
          return {
            icon: Icons.Wrench,
            title: 'No Service bookings found',
            desc: 'Book certified technicians for AC servicing, home deep cleaning, and repairs.',
            btn: 'Explore Services',
          };
        case 'Stay':
          return {
            icon: Icons.Hotel,
            title: 'No Stay bookings found',
            desc: 'Discover luxury resorts, boutique villas, and hotels with Connect member benefits.',
            btn: 'Explore Stays & Resorts',
          };
        case 'Travel':
          return {
            icon: Icons.Plane,
            title: 'No Travel bookings found',
            desc: 'Book flights, trains, and cabs with instant confirmation and transparent fares.',
            btn: 'Explore Travel & Flights',
          };
        case 'Jobs':
          return {
            icon: Icons.Briefcase,
            title: 'No Job applications found',
            desc: 'Discover verified job openings, apply in one tap, and track recruiter screenings.',
            btn: 'Explore Jobs & Careers',
          };
        default:
          return {
            icon: Icons.PackageX,
            title: 'No orders found',
            desc: 'Browse our full marketplace of products, daily essentials, and services.',
            btn: 'Explore Marketplace',
          };
      }
    };

    const emptyMeta = getEmptyCategoryMeta();
    const IconComp = emptyMeta.icon;

    return (
      <View style={styles.emptyContainer}>
        <View
          style={[
            styles.emptyIconCircle,
            {
              backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
              borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
            },
          ]}
        >
          <IconComp color="#F5B800" size={34} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>{emptyMeta.title}</Text>
        <Text
          style={[
            styles.emptySubtitle,
            { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)' },
          ]}
        >
          {emptyMeta.desc}
        </Text>

        <TouchableOpacity
          style={styles.emptyActionBtn}
          onPress={() => handleExploreCategory(selectedCategory)}
          activeOpacity={0.85}
        >
          <Icons.ShoppingBag color="#0F172A" size={15} />
          <Text style={styles.emptyActionBtnText}>{emptyMeta.btn}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render Order Card Component
  const renderOrderCard = (order: Order) => {
    const categoryMeta = getCategoryMeta(order);
    const CategoryIcon = categoryMeta.icon;
    const statusMeta = getStatusMeta(order.status);
    const isCancelled = isCancelledStatus(order.status);
    const isCompleted = isCompletedStatus(order.status);
    const isActive = isActiveStatus(order.status);

    return (
      <View
        key={order.id}
        style={[
          styles.orderCard,
          {
            backgroundColor: isLight ? '#FFFFFF' : 'rgba(13, 22, 54, 0.65)',
            borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
            opacity: isCancelled ? 0.75 : 1,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedOrderForDetails(order)}
          style={styles.cardTouchable}
        >
          {/* Card Top Row: Category Tag + Order ID + Status Pill */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: categoryMeta.color + '15',
                    borderColor: categoryMeta.color + '30',
                  },
                ]}
              >
                <CategoryIcon color={categoryMeta.color} size={11} />
                <Text style={[styles.categoryPillText, { color: categoryMeta.color }]}>
                  {categoryMeta.label}
                </Text>
              </View>
              <Text
                style={[
                  styles.orderNumberText,
                  { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)' },
                ]}
              >
                #{order.order_number}
              </Text>
            </View>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: statusMeta.bg, borderColor: statusMeta.border },
              ]}
            >
              <Text style={[styles.statusPillText, { color: statusMeta.color }]}>
                {statusMeta.label}
              </Text>
            </View>
          </View>

          {/* Card Main Body */}
          <View style={styles.cardBodyRow}>
            <View style={styles.thumbnailWrapper}>
              <Image
                source={{
                  uri:
                    order.image ||
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
                }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.cardDetailsCol}>
              {/* Primary Title */}
              <Text style={[styles.cardTitleText, { color: colors.text }]} numberOfLines={2}>
                {order.vendor_name || order.product_details}
              </Text>

              {/* Category-Specific Secondary Info */}
              {order.category === 'Daily Needs' && (
                <Text
                  style={[
                    styles.cardSubText,
                    { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)' },
                  ]}
                  numberOfLines={1}
                >
                  {order.product_details}
                </Text>
              )}

              {order.category === 'Food' && (
                <Text
                  style={[
                    styles.cardSubText,
                    { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)' },
                  ]}
                  numberOfLines={1}
                >
                  {order.product_details}
                </Text>
              )}

              {(order.category === 'Products' ||
                order.category === 'Electronics' ||
                order.category === 'Fashion' ||
                !order.category) && (
                <Text
                  style={[
                    styles.cardSubText,
                    { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)' },
                  ]}
                  numberOfLines={1}
                >
                  {order.brand_or_seller
                    ? `Seller: ${order.brand_or_seller}`
                    : `Qty: ${order.item_count || 1}`}
                </Text>
              )}

              {order.category === 'Services' && (
                <View style={styles.inlineInfoRow}>
                  <Icons.Clock color="#D97706" size={11} style={{ marginRight: 4 }} />
                  <Text style={[styles.cardHighlightText, { color: '#D97706' }]}>
                    {order.appointment_slot || 'Tomorrow, 10:30 AM'}
                  </Text>
                </View>
              )}

              {order.category === 'Stay' && (
                <View style={styles.inlineInfoRow}>
                  <Icons.Calendar color="#0EA5E9" size={11} style={{ marginRight: 4 }} />
                  <Text
                    style={[
                      styles.cardSubText,
                      { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)' },
                    ]}
                  >
                    {order.check_in
                      ? `${order.check_in.split(',')[0]} • ${order.guests_count || '2 Guests'}`
                      : order.product_details}
                  </Text>
                </View>
              )}

              {order.category === 'Travel' && (
                <View style={styles.inlineInfoRow}>
                  <Icons.Plane color="#EC4899" size={11} style={{ marginRight: 4 }} />
                  <Text style={[styles.cardHighlightText, { color: '#EC4899' }]}>
                    {order.route || order.travel_date || 'Flight 6E-512 BLR ➔ DEL'}
                  </Text>
                </View>
              )}

              {order.category === 'Jobs' && (
                <View style={styles.inlineInfoRow}>
                  <Icons.Briefcase color="#059669" size={11} style={{ marginRight: 4 }} />
                  <Text style={[styles.cardHighlightText, { color: '#059669' }]}>
                    {order.appointment_slot || 'Screening Scheduled'}
                  </Text>
                </View>
              )}

              {/* Price & Date Row */}
              <View style={styles.cardFooterRow}>
                <Text
                  style={[
                    styles.cardPriceText,
                    { color: isLight ? '#0F172A' : '#F5B800' },
                  ]}
                >
                  {order.amount > 0 ? `₹${order.amount.toLocaleString('en-IN')}` : 'Free'}
                </Text>
                <View style={styles.dateChevronRow}>
                  <Text
                    style={[
                      styles.cardDateText,
                      { color: isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.5)' },
                    ]}
                  >
                    {new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                  <Icons.ChevronRight
                    color={isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.5)'}
                    size={14}
                    style={{ marginLeft: 2 }}
                  />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Action Footer */}
        <View
          style={[
            styles.cardActionFooter,
            { borderTopColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.08)' },
          ]}
        >
          {isActive ? (
            <TouchableOpacity
              style={styles.actionPrimaryBtn}
              onPress={() => navigation.navigate('LiveTracking', { orderId: order.id })}
              activeOpacity={0.85}
            >
              <Icons.Navigation color="#0F172A" size={13} />
              <Text style={styles.actionPrimaryBtnText}>Track Live</Text>
            </TouchableOpacity>
          ) : isCompleted ? (

            <TouchableOpacity
              style={styles.actionSecondaryBtn}
              onPress={() => setSelectedOrderForReview(order)}
              activeOpacity={0.85}
            >
              <Icons.Star color={isLight ? '#D97706' : '#F5B800'} size={13} />
              <Text
                style={[
                  styles.actionSecondaryBtnText,
                  { color: isLight ? '#0F172A' : '#FFFFFF' },
                ]}
              >
                {order.rating ? `Rated ${order.rating}★` : 'Rate Order'}
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.actionDetailsBtn}
            onPress={() => setSelectedOrderForDetails(order)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.actionDetailsBtnText,
                { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.7)' },
              ]}
            >
              View Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Toast Notification Banner */}
      {actionSuccessMsg && (
        <View style={styles.toastBanner}>
          <Icons.CheckCircle2 color="#0F172A" size={15} />
          <Text style={styles.toastText}>{actionSuccessMsg}</Text>
        </View>
      )}

      {/* Main Header (#FFF1C7 / Warm Branded) */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isLight ? '#FFF1C7' : colors.background,
            borderBottomColor: isLight ? 'rgba(242, 183, 5, 0.25)' : colors.cardBorder,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icons.ArrowLeft color={colors.text} size={20} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
            <Text
              style={[
                styles.headerSubtitle,
                { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)' },
              ]}
            >
              {renderRecordCountSubtitle()}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[
              styles.headerActionBtn,
              isSearchVisible && { backgroundColor: 'rgba(245, 184, 0, 0.25)' },
            ]}
            onPress={() => setIsSearchVisible(!isSearchVisible)}
            activeOpacity={0.65}
          >
            <Icons.Search color={isSearchVisible ? '#F5B800' : colors.text} size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.headerActionBtn,
              (isFilterModalOpen || activeStatusTab !== 'all') && { backgroundColor: 'rgba(245, 184, 0, 0.25)' },
            ]}
            onPress={() => setIsFilterModalOpen(true)}
            activeOpacity={0.65}
          >
            <Icons.Sliders color={activeStatusTab !== 'all' ? '#F5B800' : colors.text} size={18} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Bar */}
      {isSearchVisible && (
        <View
          style={[
            styles.searchBarContainer,
            {
              backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
              borderColor: isLight ? '#FCD34D' : colors.cardBorder,
            },
          ]}
        >
          <Icons.Search
            color={isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.5)'}
            size={16}
            style={{ marginLeft: 12 }}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search orders, items, or booking ID..."
            placeholderTextColor={isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.5)'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
              <Icons.X color={isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.5)'} size={16} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ========================================================================= */}
      {/* 1. PRIMARY HORIZONTAL CATEGORY SELECTOR                                  */}
      {/* ========================================================================= */}
      <View
        style={[
          styles.categorySelectorWrapper,
          {
            backgroundColor: isLight ? '#FFFDF5' : colors.background,
            borderBottomColor: isLight ? '#F1EAD8' : colors.cardBorder,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            const count = categoryCounts[cat] || 0;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryTabBtn,
                  {
                    backgroundColor: isSelected
                      ? '#F5B800'
                      : isLight
                      ? '#FFFFFF'
                      : 'rgba(255, 255, 255, 0.06)',
                    borderColor: isSelected
                      ? '#F5B800'
                      : isLight
                      ? '#F1EAD8'
                      : colors.cardBorder,
                  },
                ]}
                onPress={() => handleSelectCategory(cat)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    { color: isSelected ? '#0F172A' : colors.text },
                    isSelected && { fontWeight: '800' },
                  ]}
                >
                  {cat}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.categoryCountBadge,
                      {
                        backgroundColor: isSelected
                          ? 'rgba(15, 23, 42, 0.15)'
                          : isLight
                          ? '#FEF3C7'
                          : 'rgba(255, 255, 255, 0.12)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryCountText,
                        {
                          color: isSelected
                            ? '#0F172A'
                            : isLight
                            ? '#92400E'
                            : '#F5B800',
                        },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ========================================================================= */}
      {/* 2. SECONDARY STATUS FILTER ROW                                            */}
      {/* ========================================================================= */}
      <View style={styles.statusFilterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusFilterScroll}
        >
          {(
            [
              { key: 'all', label: 'All Status' },
              { key: 'active', label: 'Active' },
              { key: 'completed', label: 'Delivered / Completed' },
              { key: 'bookings', label: 'Bookings' },
              { key: 'cancelled', label: 'Cancelled' },
            ] as { key: StatusFilterType; label: string }[]
          ).map((tab) => {
            const isSelected = activeStatusTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: isSelected
                      ? '#FEF3C7'
                      : isLight
                      ? '#FFFFFF'
                      : 'rgba(255, 255, 255, 0.04)',
                    borderColor: isSelected
                      ? '#F5B800'
                      : isLight
                      ? '#F1EAD8'
                      : colors.cardBorder,
                  },
                ]}
                onPress={() => setActiveStatusTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    {
                      color: isSelected
                        ? '#92400E'
                        : isLight
                        ? '#64748B'
                        : 'rgba(255, 255, 255, 0.6)',
                    },
                    isSelected && { fontWeight: '800' },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ========================================================================= */}
      {/* ORDER LIST CONTENT                                                        */}
      {/* ========================================================================= */}
      {filteredOrders.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyScroll} showsVerticalScrollIndicator={false}>
          {renderEmptyState()}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.ordersScroll} showsVerticalScrollIndicator={false}>
          {groupedOrders.map((group) => (
            <View key={group.title} style={styles.groupSection}>
              {/* Group Date Header */}
              <View style={styles.groupHeaderRow}>
                <Text
                  style={[
                    styles.groupHeaderTitle,
                    { color: isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.5)' },
                  ]}
                >
                  {group.title.toUpperCase()}
                </Text>
                <View
                  style={[
                    styles.groupHeaderDivider,
                    { backgroundColor: isLight ? '#F1EAD8' : colors.cardBorder },
                  ]}
                />
              </View>

              {/* Group Orders */}
              {group.items.map((order) => renderOrderCard(order))}
            </View>
          ))}
        </ScrollView>
      )}

      {/* ========================================================================= */}
      {/* FULL ORDER / BOOKING DETAILS MODAL                                        */}
      {/* ========================================================================= */}
      <Modal
        visible={!!selectedOrderForDetails}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedOrderForDetails(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: isLight ? '#FFFDF5' : '#0B1530',
                borderColor: isLight ? '#FDE68A' : colors.cardBorder,
                maxHeight: height * 0.9,
              },
            ]}
          >
            {selectedOrderForDetails && (
              selectedOrderForDetails.category === 'Jobs' ||
              (selectedOrderForDetails.order_number || '').includes('JOB') ? (
                <>
                  {/* Job Application Sheet Header */}
                  <View
                    style={[
                      styles.modalHeader,
                      { borderBottomColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.08)' },
                    ]}
                  >
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                          Application Details
                        </Text>
                        <View
                          style={[
                            styles.categoryPill,
                            {
                              backgroundColor: 'rgba(14, 165, 233, 0.15)',
                              borderColor: 'rgba(14, 165, 233, 0.3)',
                            },
                          ]}
                        >
                          <Text style={[styles.categoryPillText, { color: '#0EA5E9' }]}>
                            JOB APPLICATION
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.orderNumberText,
                          { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)', marginTop: 2 },
                        ]}
                      >
                        #{selectedOrderForDetails.order_number}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setSelectedOrderForDetails(null)}
                      style={styles.modalCloseBtn}
                    >
                      <Icons.X color={colors.text} size={18} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 18 }}>
                    {/* Status Banner */}
                    <View
                      style={[
                        styles.detailsStatusBanner,
                        {
                          backgroundColor: 'rgba(14, 165, 233, 0.12)',
                          borderColor: 'rgba(14, 165, 233, 0.3)',
                        },
                      ]}
                    >
                      <Text style={[styles.detailsStatusText, { color: '#0EA5E9' }]}>
                        {selectedOrderForDetails.appointment_slot
                          ? 'INTERVIEW SCHEDULED'
                          : 'APPLICATION SUBMITTED'}
                      </Text>
                      <Text
                        style={[
                          styles.detailsDeliveryEta,
                          { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.7)' },
                        ]}
                      >
                        Applied on 28 Aug 2026
                      </Text>
                    </View>

                    {/* Job Overview Information */}
                    <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 14 }]}>
                      JOB INFORMATION
                    </Text>
                    <View
                      style={[
                        styles.sectionCard,
                        {
                          backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
                          borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
                          padding: 14,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '900', color: colors.text }}>
                        {selectedOrderForDetails.product_details ||
                          'Senior Full Stack React Native Developer'}
                      </Text>
                      <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#0EA5E9', marginTop: 2 }}>
                        {selectedOrderForDetails.vendor_name || 'TechForge Solutions India'}
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                        <Text style={{ fontSize: 11.5, color: isLight ? '#475569' : '#CBD5E1' }}>
                          Dept: IT & Engineering
                        </Text>
                        <Text style={{ fontSize: 11.5, color: isLight ? '#475569' : '#CBD5E1' }}>
                          • Location: Bangalore
                        </Text>
                        <Text style={{ fontSize: 11.5, color: '#059669', fontWeight: '700' }}>
                          • Salary: ₹12–18 LPA
                        </Text>
                      </View>
                    </View>

                    {/* Application Timeline */}
                    <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>
                      APPLICATION TIMELINE
                    </Text>
                    <View
                      style={[
                        styles.sectionCard,
                        {
                          backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
                          borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
                          padding: 14,
                        },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ alignItems: 'center' }}>
                          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#F5B800', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Check color="#0F172A" size={11} />
                          </View>
                          <Text style={{ fontSize: 9.5, fontWeight: '800', color: colors.text, marginTop: 4 }}>Applied</Text>
                        </View>
                        <View style={{ flex: 1, height: 2, backgroundColor: '#F5B800', marginBottom: 14 }} />
                        <View style={{ alignItems: 'center' }}>
                          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#F5B800', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Check color="#0F172A" size={11} />
                          </View>
                          <Text style={{ fontSize: 9.5, fontWeight: '800', color: colors.text, marginTop: 4 }}>Reviewed</Text>
                        </View>
                        <View style={{ flex: 1, height: 2, backgroundColor: '#F5B800', marginBottom: 14 }} />
                        <View style={{ alignItems: 'center' }}>
                          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#F5B800', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Check color="#0F172A" size={11} />
                          </View>
                          <Text style={{ fontSize: 9.5, fontWeight: '800', color: colors.text, marginTop: 4 }}>Shortlisted</Text>
                        </View>
                        <View style={{ flex: 1, height: 2, backgroundColor: selectedOrderForDetails.appointment_slot ? '#F5B800' : '#CBD5E1', marginBottom: 14 }} />
                        <View style={{ alignItems: 'center' }}>
                          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: selectedOrderForDetails.appointment_slot ? '#F5B800' : '#E2E8F0', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Video color={selectedOrderForDetails.appointment_slot ? '#0F172A' : '#94A3B8'} size={11} />
                          </View>
                          <Text style={{ fontSize: 9.5, fontWeight: '800', color: colors.text, marginTop: 4 }}>Interview</Text>
                        </View>
                      </View>
                    </View>

                    {/* Interview Details if Scheduled */}
                    {selectedOrderForDetails.appointment_slot && (
                      <>
                        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>
                          INTERVIEW SCHEDULED
                        </Text>
                        <View style={[styles.sectionCard, { backgroundColor: '#FFFDF5', borderColor: '#FDE68A', padding: 14 }]}>
                          <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}>
                            {selectedOrderForDetails.appointment_slot}
                          </Text>
                          <Text style={{ fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
                            Format: Google Meet Online Video Technical Round
                          </Text>
                          <Text style={{ fontSize: 11.5, color: '#0284C7', fontWeight: '700', marginTop: 4 }}>
                            Meeting Link: https://meet.google.com/techforge-interview-7703
                          </Text>
                          <Text style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>
                            Recruiter Contact: Ananya Sharma • Lead Tech Recruiter (+91 98765 43210)
                          </Text>
                        </View>
                      </>
                    )}

                    {/* Company Profile Card */}
                    <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>
                      COMPANY PROFILE
                    </Text>
                    <View style={[styles.sectionCard, { backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)', borderColor: isLight ? '#F1EAD8' : colors.cardBorder, padding: 14 }]}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
                        {selectedOrderForDetails.vendor_name || 'TechForge Solutions India'}
                      </Text>
                      <Text style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                        IT & Digital Engineering Studio • Headquarters: Bangalore
                      </Text>
                    </View>

                    {/* Application Action Buttons */}
                    <View style={styles.modalActionButtonsRow}>
                      <TouchableOpacity
                        style={[styles.invoiceShareBtn, { backgroundColor: '#F5B800' }]}
                        onPress={() => {
                          const item = selectedOrderForDetails;
                          setSelectedOrderForDetails(null);
                          navigation.navigate('JobDetails', {
                            job: {
                              id: item.id || 'job_app_7703',
                              title: item.product_details || 'Senior Full Stack React Native Developer',
                              company: item.vendor_name || 'TechForge Solutions India',
                              salary: '₹12–18 LPA',
                              logo: item.image,
                              workMode: 'Hybrid',
                              experience: '2–5 yrs',
                              skills: ['React Native', 'TypeScript', 'Node.js'],
                            },
                          });
                        }}
                      >
                        <Icons.ExternalLink color="#0F172A" size={14} />
                        <Text style={[styles.invoiceShareBtnText, { color: '#0F172A', fontWeight: '800' }]}>
                          View Job Listing
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.cancelOrderBtn,
                          { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.3)' },
                        ]}
                        onPress={() => {
                          const o = selectedOrderForDetails;
                          setSelectedOrderForDetails(null);
                          setSelectedOrderForCancel(o);
                        }}
                      >
                        <Text style={[styles.cancelOrderBtnText, { color: '#EF4444' }]}>
                          Withdraw Application
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </>
              ) : (
                <>
                  {/* Standard E-Commerce Order Sheet Header */}
                  <View
                    style={[
                      styles.modalHeader,
                      { borderBottomColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.08)' },
                    ]}
                  >
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Order Details</Text>
                        <View
                          style={[
                            styles.categoryPill,
                            {
                              backgroundColor: getCategoryMeta(selectedOrderForDetails).color + '15',
                              borderColor: getCategoryMeta(selectedOrderForDetails).color + '30',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryPillText,
                              { color: getCategoryMeta(selectedOrderForDetails).color },
                            ]}
                          >
                            {getCategoryMeta(selectedOrderForDetails).label}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.orderNumberText,
                          { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)', marginTop: 2 },
                        ]}
                      >
                        #{selectedOrderForDetails.order_number}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setSelectedOrderForDetails(null)}
                      style={styles.modalCloseBtn}
                    >
                      <Icons.X color={colors.text} size={18} />
                    </TouchableOpacity>
                  </View>

                  {/* Details Sheet Content */}
                  <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 18 }}>
                    {/* Status Banner */}
                    <View
                      style={[
                        styles.detailsStatusBanner,
                        {
                          backgroundColor: getStatusMeta(selectedOrderForDetails.status).bg,
                          borderColor: getStatusMeta(selectedOrderForDetails.status).border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.detailsStatusText,
                          { color: getStatusMeta(selectedOrderForDetails.status).color },
                        ]}
                      >
                        {selectedOrderForDetails.status.toUpperCase()}
                      </Text>
                      {selectedOrderForDetails.expected_delivery && (
                        <Text
                          style={[
                            styles.detailsDeliveryEta,
                            { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.7)' },
                          ]}
                        >
                          {selectedOrderForDetails.expected_delivery}
                        </Text>
                      )}
                    </View>

                    {/* Items List */}
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>ITEMS ORDERED</Text>
                    <View
                      style={[
                        styles.sectionCard,
                        {
                          backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
                          borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
                        },
                      ]}
                    >
                      {selectedOrderForDetails.items && selectedOrderForDetails.items.length > 0 ? (
                        selectedOrderForDetails.items.map((it, idx) => (
                          <View
                            key={idx}
                            style={[
                              styles.itemDetailRow,
                              idx > 0 && {
                                borderTopWidth: 1,
                                borderTopColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.06)',
                              },
                            ]}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.itemNameText, { color: colors.text }]}>
                                {it.name}
                              </Text>
                              {it.variant && (
                                <Text
                                  style={[
                                    styles.itemVariantText,
                                    { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)' },
                                  ]}
                                >
                                  {it.variant}
                                </Text>
                              )}
                            </View>
                            <Text
                              style={[
                                styles.itemQtyPriceText,
                                { color: isLight ? '#0F172A' : '#F5B800' },
                              ]}
                            >
                              {it.quantity} × ₹{it.price.toLocaleString('en-IN')}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text style={[styles.itemNameText, { color: colors.text }]}>
                          {selectedOrderForDetails.product_details}
                        </Text>
                      )}
                    </View>

                    {/* Payment Breakdown */}
                    <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>
                      PAYMENT SUMMARY
                    </Text>
                    <View
                      style={[
                        styles.sectionCard,
                        {
                          backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
                          borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
                        },
                      ]}
                    >
                      <View style={styles.breakdownRow}>
                        <Text
                          style={[
                            styles.breakdownLabel,
                            { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)' },
                          ]}
                        >
                          Item Total
                        </Text>
                        <Text style={[styles.breakdownValue, { color: colors.text }]}>
                          ₹{selectedOrderForDetails.amount.toLocaleString('en-IN')}
                        </Text>
                      </View>
                      <View style={styles.breakdownRow}>
                        <Text
                          style={[
                            styles.breakdownLabel,
                            { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)' },
                          ]}
                        >
                          Delivery Fee
                        </Text>
                        <Text style={[styles.breakdownValue, { color: '#10B981' }]}>FREE</Text>
                      </View>
                      <View
                        style={[
                          styles.breakdownRow,
                          {
                            borderTopWidth: 1,
                            borderTopColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.06)',
                            paddingTop: 8,
                            marginTop: 6,
                          },
                        ]}
                      >
                        <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
                        <Text
                          style={[
                            styles.totalValue,
                            { color: isLight ? '#0F172A' : '#F5B800' },
                          ]}
                        >
                          ₹{selectedOrderForDetails.amount.toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>

                    {/* Actions Inside Modal */}
                    <View style={styles.modalActionButtonsRow}>
                      <TouchableOpacity
                        style={styles.invoiceShareBtn}
                        onPress={() => shareInvoice(selectedOrderForDetails)}
                      >
                        <Icons.Share2 color="#0F172A" size={14} />
                        <Text style={styles.invoiceShareBtnText}>Share Invoice</Text>
                      </TouchableOpacity>

                      {isActiveStatus(selectedOrderForDetails.status) && (
                        <TouchableOpacity
                          style={styles.cancelOrderBtn}
                          onPress={() => {
                            const o = selectedOrderForDetails;
                            setSelectedOrderForDetails(null);
                            setSelectedOrderForCancel(o);
                          }}
                        >
                          <Text style={styles.cancelOrderBtnText}>Cancel Order</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </ScrollView>
                </>
              )
            )}
          </View>
        </View>
      </Modal>

      {/* Cancel Order Confirmation Modal */}
      <Modal
        visible={!!selectedOrderForCancel}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedOrderForCancel(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.cancelCard,
              {
                backgroundColor: isLight ? '#FFFDF5' : '#0B1530',
                borderColor: isLight ? '#FDE68A' : colors.cardBorder,
              },
            ]}
          >
            <Icons.AlertTriangle color="#EF4444" size={36} style={{ alignSelf: 'center', marginBottom: 10 }} />
            <Text style={[styles.cancelModalTitle, { color: colors.text }]}>Cancel Order?</Text>
            <Text
              style={[
                styles.cancelModalSubtitle,
                { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)' },
              ]}
            >
              Are you sure you want to cancel order #{selectedOrderForCancel?.order_number}?
            </Text>

            <View style={styles.cancelButtonsRow}>
              <TouchableOpacity
                style={styles.cancelDismissBtn}
                onPress={() => setSelectedOrderForCancel(null)}
              >
                <Text style={[styles.cancelDismissBtnText, { color: colors.text }]}>No, Keep It</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelConfirmBtn} onPress={executeCancel}>
                <Text style={styles.cancelConfirmBtnText}>Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rate Order Modal */}
      <Modal
        visible={!!selectedOrderForReview}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedOrderForReview(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.cancelCard,
              {
                backgroundColor: isLight ? '#FFFDF5' : '#0B1530',
                borderColor: isLight ? '#FDE68A' : colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.cancelModalTitle, { color: colors.text }]}>Rate Your Experience</Text>
            <View style={styles.starsRatingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Icons.Star
                    color={star <= reviewRating ? '#F5B800' : isLight ? '#CBD5E1' : '#475569'}
                    fill={star <= reviewRating ? '#F5B800' : 'transparent'}
                    size={28}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[
                styles.reviewTextInput,
                {
                  backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
                  borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
                  color: colors.text,
                },
              ]}
              placeholder="Leave a short note about this order..."
              placeholderTextColor={isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.5)'}
              value={reviewText}
              onChangeText={setReviewText}
              multiline
            />
            <View style={styles.cancelButtonsRow}>
              <TouchableOpacity
                style={styles.cancelDismissBtn}
                onPress={() => setSelectedOrderForReview(null)}
              >
                <Text style={[styles.cancelDismissBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitReviewBtn} onPress={executeReview}>
                <Text style={styles.submitReviewBtnText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Order Status Filter Bottom Sheet Modal */}
      <Modal visible={isFilterModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.cardBg,
                borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
                paddingBottom: 24,
              },
            ]}
          >
            {/* Drag Handle */}
            <View
              style={{
                width: 38,
                height: 4,
                borderRadius: 2,
                backgroundColor: isLight ? '#CBD5E1' : 'rgba(255, 255, 255, 0.2)',
                alignSelf: 'center',
                marginTop: 10,
                marginBottom: 4,
              }}
            />

            {/* Header */}
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.08)' },
              ]}
            >
              <View>
                <Text style={[styles.modalTitle, { color: colors.text, fontSize: 17 }]}>
                  Filter Orders
                </Text>
                <Text style={{ fontSize: 11.5, color: '#64748B', fontWeight: '600', marginTop: 2 }}>
                  {activeStatusTab !== 'all'
                    ? `Status: ${activeStatusTab.toUpperCase()}`
                    : 'Showing all status orders'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsFilterModalOpen(false)}
                activeOpacity={0.7}
              >
                <Icons.X color={colors.text} size={18} />
              </TouchableOpacity>
            </View>

            {/* Filter Options */}
            <View style={{ paddingHorizontal: 18, paddingTop: 12, gap: 10 }}>
              {[
                {
                  key: 'all' as StatusFilterType,
                  label: 'All Orders',
                  count: statusCounts.all,
                  desc: 'View every order across all statuses',
                },
                {
                  key: 'active' as StatusFilterType,
                  label: 'Active Orders',
                  count: statusCounts.active,
                  desc: 'In-transit, preparing, confirmed and live deliveries',
                },
                {
                  key: 'completed' as StatusFilterType,
                  label: 'Completed Orders',
                  count: statusCounts.completed,
                  desc: 'Delivered and successfully completed orders',
                },
                {
                  key: 'cancelled' as StatusFilterType,
                  label: 'Cancelled Orders',
                  count: statusCounts.cancelled,
                  desc: 'Cancelled orders and refund records',
                },
              ].map((opt) => {
                const isSelected = activeStatusTab === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: isSelected
                        ? '#F5B800'
                        : isLight
                        ? '#E2E8F0'
                        : 'rgba(255, 255, 255, 0.08)',
                      backgroundColor: isSelected
                        ? isLight
                          ? '#FFFBEB'
                          : 'rgba(245, 184, 0, 0.12)'
                        : isLight
                        ? '#FFFFFF'
                        : 'rgba(255, 255, 255, 0.03)',
                    }}
                    activeOpacity={0.8}
                    onPress={() => {
                      setActiveStatusTab(opt.key);
                      setIsFilterModalOpen(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: isSelected ? '900' : '700',
                            color: isSelected ? '#0F172A' : colors.text,
                          }}
                        >
                          {opt.label}
                        </Text>
                        <View
                          style={{
                            backgroundColor: isSelected
                              ? '#F5B800'
                              : isLight
                              ? '#F1F5F9'
                              : 'rgba(255, 255, 255, 0.08)',
                            paddingHorizontal: 7,
                            paddingVertical: 2,
                            borderRadius: 10,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '800',
                              color: isSelected ? '#0F172A' : isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)',
                            }}
                          >
                            {opt.count}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={{
                          fontSize: 11,
                          color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)',
                          marginTop: 2,
                        }}
                      >
                        {opt.desc}
                      </Text>
                    </View>

                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: isSelected ? '#F5B800' : '#94A3B8',
                        backgroundColor: isSelected ? '#F5B800' : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 10,
                      }}
                    >
                      {isSelected && <Icons.Check color="#0F172A" size={13} strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Bottom Actions */}
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
                paddingHorizontal: 18,
                marginTop: 14,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)',
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.8}
                onPress={() => {
                  setActiveStatusTab('all');
                  setIsFilterModalOpen(false);
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 2,
                  backgroundColor: '#F5B800',
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.85}
                onPress={() => setIsFilterModalOpen(false)}
              >
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#0F172A' }}>
                  Apply Filter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toastBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 999,
    backgroundColor: '#F5B800',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  toastText: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '700',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Math.max(height * 0.05, 38),
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '500',
  },
  categorySelectorWrapper: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6.5,
    borderRadius: 16,
    borderWidth: 1,
    gap: 5,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryCountBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  categoryCountText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusFilterWrapper: {
    paddingVertical: 8,
  },
  statusFilterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ordersScroll: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  groupSection: {
    marginBottom: 14,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  groupHeaderTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  groupHeaderDivider: {
    flex: 1,
    height: 1,
  },
  orderCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTouchable: {
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  orderNumberText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  cardBodyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  cardDetailsCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitleText: {
    fontSize: 13.5,
    fontWeight: '800',
    lineHeight: 18,
  },
  cardSubText: {
    fontSize: 11.5,
    marginTop: 2,
  },
  inlineInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  cardHighlightText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 6,
  },
  cardPriceText: {
    fontSize: 14,
    fontWeight: '900',
  },
  dateChevronRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDateText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  cardActionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  actionPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5B800',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionPrimaryBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionSecondaryBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionDetailsBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  actionDetailsBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5B800',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 4,
  },
  emptyActionBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 30, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsStatusBanner: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsStatusText: {
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  detailsDeliveryEta: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  itemDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemNameText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  itemVariantText: {
    fontSize: 10.5,
    marginTop: 1,
  },
  itemQtyPriceText: {
    fontSize: 12,
    fontWeight: '800',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  breakdownLabel: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  modalActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    marginBottom: 20,
  },
  invoiceShareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F5B800',
    paddingVertical: 11,
    borderRadius: 10,
  },
  invoiceShareBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  cancelOrderBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 11,
    borderRadius: 10,
  },
  cancelOrderBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#EF4444',
  },
  cancelCard: {
    marginHorizontal: 20,
    marginBottom: height * 0.25,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  cancelModalTitle: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  cancelModalSubtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    marginBottom: 16,
  },
  cancelButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelDismissBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelDismissBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  cancelConfirmBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelConfirmBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  starsRatingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 14,
  },
  reviewTextInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    height: 70,
    fontSize: 12,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  submitReviewBtn: {
    flex: 1,
    backgroundColor: '#F5B800',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitReviewBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
});
