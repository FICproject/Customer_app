import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useWindowDimensions, Alert, Animated, Modal, TextInput, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CustomerStackParamList } from '../../navigation/AppNavigator';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/GlassCard';
import { useUIStore } from '../../store/uiStore';
import MembershipCard from '../../components/MembershipCard';
import * as Icons from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SIDEBAR_DATA } from './sidebarData';
import { useOrderStore } from '../../store/orderStore';
import { apiFetch } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import CartModal from '../../components/CartModal';
import { useWishlistStore } from '../../store/wishlistStore';
import WishlistModal from '../../components/WishlistModal';
import { useThemeStore } from '../../store/themeStore';

const { width } = Dimensions.get('window');

type HomeDashboardProp = StackNavigationProp<CustomerStackParamList, 'CustomerTabs'>;

const CATEGORIES = [
  { name: 'All', icon: 'Grid', count: 'Explore All' },
  { name: 'Services', icon: 'Wrench', count: '12 Available' },
  { name: 'Products', icon: 'ShoppingBag', count: '4,500+ Items' },
  { name: 'Daily Needs', icon: 'Milk', count: 'Fresh Groceries' },
  { name: 'Food', icon: 'Utensils', count: '48 Restaurants' },
  { name: 'Stay', icon: 'Bed', count: 'Hotels & Resorts' },
  { name: 'Travel', icon: 'Plane', count: 'Flights & Trains' },
  { name: 'Jobs', icon: 'Briefcase', count: '280 Postings' },
];

const TRENDING_PRODUCTS = [
  { name: 'MacBook Pro M3 Max', price: '₹2,49,990', memberPrice: '₹2,29,990', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&auto=format&fit=crop&q=80' },
  { name: 'Sony WH-1000XM5', price: '₹29,990', memberPrice: '₹24,990', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80' },
  { name: 'iPhone 15 Pro Max', price: '₹1,59,900', memberPrice: '₹1,43,900', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200&auto=format&fit=crop&q=80' },
];

const NEARBY_VENDORS = [
  { name: 'ABC Electronics', rating: '4.8', distance: '1.2 km', image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=200&auto=format&fit=crop&q=80' },
  { name: 'Le Meridian Stay', rating: '4.9', distance: '2.5 km', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80' },
  { name: 'Empire Restaurant', rating: '4.7', distance: '0.8 km', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80' },
];

const ALL_PARTNER_HUBS = [
  {
    name: 'ABC Electronics',
    desc: 'Authorized retailer for smartphones, laptops, and home appliances.',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=200&auto=format&fit=crop&q=80',
    rating: '4.8',
    distance: '1.2 km',
  },
  {
    name: 'Le Meridian Stay',
    desc: '5-star luxury stay with gold-tier membership pricing benefits.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80',
    rating: '4.9',
    distance: '0.8 km',
  },
  {
    name: 'City Apollo Hospital',
    desc: 'Priority consultation, express health checkups, and cardiologists.',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&auto=format&fit=crop&q=80',
    rating: '4.7',
    distance: '2.5 km',
  },
  {
    name: 'IndiGo Travel Desk',
    desc: 'Discounted flight bookings, express lounge pass, and cab services.',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&auto=format&fit=crop&q=80',
    rating: '4.6',
    distance: '4.0 km',
  },
  {
    name: 'Gourmet Food Court',
    desc: 'Handcrafted truffle burgers, woodfired pizzas, and Italian combos.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
    rating: '4.8',
    distance: '1.5 km',
  },
  {
    name: 'Urban Repair Hub',
    desc: 'Verified expert plumbers, electricians, and home maintenance partners.',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&auto=format&fit=crop&q=80',
    rating: '4.7',
    distance: '0.5 km',
  },
  {
    name: 'Organic Daily Needs',
    desc: 'Premium long-grain basmati rice, fresh farm milk, bread, and organic eggs.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&auto=format&fit=crop&q=80',
    rating: '4.9',
    distance: '1.0 km',
  },
  {
    name: 'Elite Fitness Center',
    desc: 'Premium gym facility, certified coaches, and customized diet plans.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&auto=format&fit=crop&q=80',
    rating: '4.8',
    distance: '3.1 km',
  }
];

const ALL_MEMBERSHIP_OFFERS = [
  {
    name: 'MacBook Pro M3 Max',
    price: '₹2,49,990',
    memberPrice: '₹2,29,990',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Sony WH-1000XM5',
    price: '₹29,990',
    memberPrice: '₹24,990',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80'
  },
  {
    name: 'iPhone 15 Pro Max',
    price: '₹1,59,900',
    memberPrice: '₹1,43,900',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Senior Cardiologist Visit',
    price: '₹1,000',
    memberPrice: '₹800',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Premium Basmati Rice (5kg)',
    price: '₹999',
    memberPrice: '₹750',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Truffle Double Burger',
    price: '₹550',
    memberPrice: '₹480',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Grand Resort Suite Stay',
    price: '₹8,500',
    memberPrice: '₹6,500',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80',
  }
];

const HOME_FEED_ITEMS = [
  {
    id: 'prod_iphone14',
    name: 'Apple iPhone 14 (128GB)',
    spec: '6.1" Super Retina XDR Display',
    price: '₹59,900',
    originalPrice: '₹74,900',
    discount: '20% OFF',
    rating: '4.6',
    ratingCount: '2.4k',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200&auto=format&fit=crop&q=80',
    category: 'Product',
    assured: true,
  },
  {
    id: 'prod_boseqc45',
    name: 'Bose QuietComfort 45',
    spec: 'Wireless Noise Cancelling Headphones',
    price: '₹22,990',
    originalPrice: '₹26,990',
    discount: '15% OFF',
    rating: '4.5',
    ratingCount: '1.2k',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
    category: 'Product',
    assured: true,
  },
  {
    id: 'prod_galaxywatch6',
    name: 'Samsung Galaxy Watch 6',
    spec: 'Bluetooth, 44mm, Black',
    price: '₹17,999',
    originalPrice: '₹19,999',
    discount: '10% OFF',
    rating: '4.4',
    ratingCount: '856',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=200&auto=format&fit=crop&q=80',
    category: 'Product',
    assured: true,
  },
  {
    id: 'prod_nikepeg39',
    name: 'Nike Air Zoom Pegasus 39',
    spec: "Men's Running Shoes",
    price: '₹7,499',
    originalPrice: '₹9,999',
    discount: '25% OFF',
    rating: '4.3',
    ratingCount: '642',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80',
    category: 'Product',
    assured: true,
  },
  {
    id: 'service_cardiologist',
    name: 'Senior Cardiologist Visit',
    spec: 'Hospitals Consultation Booking',
    price: '₹800',
    originalPrice: '₹1,000',
    discount: '20% OFF',
    rating: '4.9',
    ratingCount: '152',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&auto=format&fit=crop&q=80',
    category: 'Services',
    assured: true,
  },
  {
    id: 'daily_basmati',
    name: 'Premium Basmati Rice (5kg)',
    spec: 'Daily Essentials & Groceries',
    price: '₹750',
    originalPrice: '₹850',
    discount: '12% OFF',
    rating: '4.8',
    ratingCount: '1.9k',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&auto=format&fit=crop&q=80',
    category: 'Daily Needs',
    assured: true,
  },
  {
    id: 'food_doubleburger',
    name: 'Truffle Double Burger',
    spec: 'Burgers & Fries Gourmet meal',
    price: '₹480',
    originalPrice: '₹550',
    discount: '15% OFF',
    rating: '4.7',
    ratingCount: '890',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
    category: 'Food',
    assured: false,
  },
  {
    id: 'stay_grandresort',
    name: 'Grand Resort Suite Stay',
    spec: '1 Night Luxury Room Booking',
    price: '₹6,500',
    originalPrice: '₹8,500',
    discount: '23% OFF',
    rating: '4.8',
    ratingCount: '120',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80',
    category: 'Stay',
    assured: true,
  }
];

export default function HomeDashboard() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<HomeDashboardProp>();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const insets = useSafeAreaInsets();

  const displayName = currentUser?.name || 'Connect Member';

  // Cart & Feed Hooks
  const [isCartVisible, setIsCartVisible] = useState(false);
  const cartItems = useCartStore((state) => state.cartItems);
  const addToCart = useCartStore((state) => state.addToCart);
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Wishlist Hooks
  const [isWishlistVisible, setIsWishlistVisible] = useState(false);
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  // View All Modals Hooks
  const [isPartnersModalVisible, setIsPartnersModalVisible] = useState(false);
  const [isOffersModalVisible, setIsOffersModalVisible] = useState(false);

  // Theme Hooks
  const themeMode = useThemeStore((state) => state.themeMode);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);
  const colors = useThemeStore((state) => state.colors);
  const isLightActive = (themeMode === 'light') || (themeMode === 'system' && colors.background === '#F8FAFC');
  const activeContentColor = isLightActive ? '#FFFFFF' : '#050B1E';

  // Sidebar Menu State
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const setIsSidebarOpen = useUIStore((state) => state.setIsSidebarOpen);

  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Universal Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handlePlaceOrder = async (name: string, price: string, category: string) => {
    const numPrice = parseInt(price.replace(/[^\d]/g, ''), 10) || 500;
    const isBooking = ['Services', 'Service', 'Stay', 'Travel', 'Food', 'Jobs'].includes(category);
    try {
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          vendor_id: 'v1',
          customer_name: displayName,
          customer_phone: '+91 98888 88888',
          customer_address: 'Koramangala 5th Block, Bangalore',
          customer_latitude: 12.9498,
          customer_longitude: 77.6289,
          product_details: name,
          amount: numPrice,
          order_type: isBooking ? 'booking' : 'order'
        })
      });

      const loadAllOrders = useOrderStore.getState().loadAllOrders;
      await loadAllOrders();
      navigation.navigate('CustomerTabs', { screen: 'Orders' });
    } catch {
      const loadAllOrders = useOrderStore.getState().loadAllOrders;
      await loadAllOrders();
      navigation.navigate('CustomerTabs', { screen: 'Orders' });
    }
  };

  // Generate universal search results
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    const results: Array<{
      categoryKey: string;
      categoryName: string;
      subcategoryName: string;
      itemName: string;
      icon: string;
    }> = [];

    Object.keys(SIDEBAR_DATA).forEach((catKey) => {
      const category = SIDEBAR_DATA[catKey];
      const mappedCategoryName = catKey === 'Product' ? 'Products' : catKey === 'Job' ? 'Jobs' : catKey;
      
      if (category.subcategories) {
        Object.keys(category.subcategories).forEach((subKey) => {
          const subcat = category.subcategories[subKey];
          if (subcat.items) {
            subcat.items.forEach((item: string) => {
              if (
                item.toLowerCase().includes(query) ||
                subKey.toLowerCase().includes(query) ||
                mappedCategoryName.toLowerCase().includes(query)
              ) {
                if (!results.some(r => r.itemName === item)) {
                  results.push({
                    categoryKey: mappedCategoryName,
                    categoryName: mappedCategoryName,
                    subcategoryName: subKey,
                    itemName: item,
                    icon: subcat.icon || 'HelpCircle'
                  });
                }
              }
            });
          }
        });
      }
    });

    return results.slice(0, 25);
  };

  useEffect(() => {
    console.warn("useEffect triggered, isSidebarOpen =", isSidebarOpen);
    if (isSidebarOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => {
        console.warn("Open animation finished");
      });
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: width,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start(() => {
        console.warn("Close animation finished");
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSidebarOpen]);

  const pendingProduct = useAuthStore((state) => state.pendingPurchaseProduct);
  const setPendingProduct = useAuthStore((state) => state.setPendingPurchaseProduct);

  const handlePlacePendingOrder = async (product: any) => {
    const numPrice = parseInt(product.price.replace(/[^\d]/g, ''), 10) || 150;
    
    try {
      const res = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          vendor_id: 'v1',
          customer_name: displayName,
          customer_phone: '+91 98888 88888',
          customer_address: 'Koramangala 5th Block, Bangalore',
          customer_latitude: 12.9498,
          customer_longitude: 77.6289,
          product_details: product.name,
          amount: numPrice
        })
      });

      if (res.status !== 'success') {
        throw new Error(res.message || 'Failed to place order');
      }

      // Load all orders using the order store
      const loadAllOrders = useOrderStore.getState().loadAllOrders;
      await loadAllOrders();
      setPendingProduct(null);
      navigation.navigate('CustomerTabs', { screen: 'Orders' });
    } catch {
      // Offline / dev fallback order simulator
      const loadAllOrders = useOrderStore.getState().loadAllOrders;
      await loadAllOrders();
      setPendingProduct(null);
      navigation.navigate('CustomerTabs', { screen: 'Orders' });
    }
  };

  const handleSearchPress = () => {
    setIsSearchOpen(true);
  };

  const handleMenuPress = () => {
    setIsSidebarOpen(true);
  };

  const renderCategoryIcon = (iconName: string, color = '#F4C400') => {
    const IconComp = (Icons as any)[iconName];
    if (!IconComp) return <Icons.HelpCircle color={color} size={24} />;
    return <IconComp color={color} size={24} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Navbar */}
      <View style={[styles.navbar, { paddingTop: insets.top, height: 56 + insets.top, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.navLeft}>
          <TouchableOpacity style={styles.navIconBtn} activeOpacity={0.7} onPress={handleMenuPress}>
            <Icons.Menu color={colors.text} size={20} />
          </TouchableOpacity>
          <Image
            source={require('../../assets/images/forge_india_logo.jpg')}
            style={styles.navLogo}
          />
          <Text style={[styles.navTitle, { color: colors.text }]}>Connect App</Text>
        </View>
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.navIconBtn} activeOpacity={0.7} onPress={() => setIsWishlistVisible(true)}>
            <Icons.Heart 
              color={wishlistItems.length > 0 ? "#FF2E93" : colors.text} 
              size={20} 
              fill={wishlistItems.length > 0 ? "#FF2E93" : "transparent"} 
            />
            {wishlistItems.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{wishlistItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.navIconBtn} activeOpacity={0.7} onPress={() => setIsCartVisible(true)}>
            <Icons.ShoppingCart color={colors.text} size={20} />
            {totalCartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalCartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.navIconBtn} activeOpacity={0.7} onPress={handleSearchPress}>
            <Icons.Search color={colors.text} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Greeting */}
        <View style={styles.greetingSection}>
          <Text style={[styles.greetingSub, { color: colors.text, opacity: 0.6 }]}>Welcome Back,</Text>
          <Text style={[styles.profileName, { color: colors.text }]}>{displayName} 👋</Text>
        </View>
        {/* Animated Membership Card */}
        <MembershipCard
          name={displayName}
          type={currentUser?.membership || 'gold'}
          number={currentUser?.membership === 'silver' ? 'CN-SILV-4820' : currentUser?.membership === 'diamond' ? 'CN-DIAM-4820' : 'CN-4082-9012'}
          points={currentUser?.membership === 'silver' ? 1500 : currentUser?.membership === 'diamond' ? 8500 : 3450}
          validity="12/29"
        />

        <View style={styles.walletRow}>
          <GlassCard style={[styles.walletCard, { width: (width - 44) / 2 }]}>
            <View style={styles.cardHeaderRow}>
              <Icons.Wallet color={colors.primary} size={16} />
              <Text style={[styles.walletTitle, { color: colors.text, opacity: 0.7 }]}>CONNECT WALLET</Text>
            </View>
            <Text style={[styles.walletBalance, { color: colors.text }]}>₹14,500.00</Text>
            <TouchableOpacity style={styles.addMoneyBtn}>
              <Text style={styles.addMoneyText}>+ Add Funds</Text>
            </TouchableOpacity>
          </GlassCard>

          <GlassCard style={[styles.couponCard, { width: (width - 44) / 2 }]}>
            <View style={styles.cardHeaderRow}>
              <Icons.Ticket color={colors.primary} size={16} />
              <Text style={[styles.walletTitle, { color: colors.text, opacity: 0.7 }]}>ACTIVE VOUCHERS</Text>
            </View>
            <Text style={[styles.couponCount, { color: colors.text }]}>5 Available</Text>
            <Text style={[styles.couponHint, { color: colors.text, opacity: 0.6 }]}>Save up to 40% today</Text>
          </GlassCard>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>EXPLORE CONNECT UNIVERSE</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIES.map((cat, idx) => {
              const colorsList = ['#FF2E93', '#9C27B0', '#00BCD4', '#FF9800', '#38BDF8', '#4CAF50', '#C084FC'];
              const color = colorsList[idx % colorsList.length];
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.categoryItem}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (cat.name === 'All') {
                      navigation.navigate('CustomerTabs', { screen: 'Categories' });
                    } else {
                      navigation.navigate('CategoryDetails', { categoryName: cat.name });
                    }
                  }}
                >
                  <View style={[styles.categoryCircle, { borderColor: color }]}>
                    {renderCategoryIcon(cat.icon, color)}
                  </View>
                  <Text style={[styles.categoryLabel, { color: colors.text }]} numberOfLines={1}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Trending Products */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>MEMBERSHIP OFFERS</Text>
            <TouchableOpacity onPress={() => setIsOffersModalVisible(true)}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {TRENDING_PRODUCTS.map((prod, idx) => (
              <GlassCard key={idx} style={styles.prodCard}>
                <Image source={{ uri: prod.image }} style={styles.prodImg} />
                <Text style={[styles.prodName, { color: colors.text }]} numberOfLines={1}>{prod.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.strikePrice, { color: colors.text, opacity: 0.4 }]}>{prod.price}</Text>
                  <Text style={[styles.memberPrice, { color: colors.primary }]}>{prod.memberPrice}</Text>
                </View>
                <View style={styles.goldBadge}>
                  <Text style={styles.goldBadgeText}>Gold Member Price</Text>
                </View>
              </GlassCard>
            ))}
          </ScrollView>
        </View>

        {/* Nearby / Recommended Vendors */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>RECOMMENDED PARTNER HUBS</Text>
            <TouchableOpacity onPress={() => setIsPartnersModalVisible(true)}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {NEARBY_VENDORS.map((vendor, idx) => (
              <GlassCard key={idx} style={styles.vendorCard}>
                <Image source={{ uri: vendor.image }} style={styles.vendorImg} />
                <View style={styles.vendorInfo}>
                  <Text style={[styles.vendorName, { color: colors.text }]}>{vendor.name}</Text>
                  <View style={styles.vendorMeta}>
                    <View style={styles.metaCol}>
                      <Icons.Star color="#F4C400" size={10} fill="#F4C400" />
                      <Text style={[styles.metaVal, { color: colors.text, opacity: 0.6 }]}> {vendor.rating}</Text>
                    </View>
                    <View style={styles.metaCol}>
                      <Icons.MapPin color={colors.text} size={10} style={{ opacity: 0.6 }} />
                      <Text style={[styles.metaVal, { color: colors.text, opacity: 0.6 }]}> {vendor.distance}</Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            ))}
          </ScrollView>
        </View>

        {/* All Products & Services Mixed Feed Grid (Image 4 Design Style) */}
        <View style={[styles.sectionContainer, { marginBottom: 40 }]}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>ALL PRODUCTS & SERVICES FEED</Text>
          <View style={styles.feedGrid}>
            {HOME_FEED_ITEMS.map((item) => {
              return (
                <GlassCard key={item.id} style={styles.feedCard}>
                  {/* Image wrapper with Heart and Discount badge */}
                  <View style={styles.feedImgWrapper}>
                    <TouchableOpacity 
                      activeOpacity={0.9} 
                      onPress={() => navigation.navigate('ProductDetails', { item, category: item.category })}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <Image source={{ uri: item.image }} style={styles.feedImg} />
                    </TouchableOpacity>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>{item.discount}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.heartBtn} 
                      activeOpacity={0.7}
                      onPress={() => toggleWishlist({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        category: item.category,
                        image: item.image,
                      })}
                    >
                      <Icons.Heart 
                        color={wishlistItems.some(i => i.id === item.id) ? "#FF2E93" : colors.text} 
                        size={14} 
                        fill={wishlistItems.some(i => i.id === item.id) ? "#FF2E93" : "transparent"} 
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Title & specs */}
                  <TouchableOpacity 
                    style={styles.feedDetails} 
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('ProductDetails', { item, category: item.category })}
                  >
                    <Text style={[styles.feedName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                    <Text style={[styles.feedSpec, { color: colors.text, opacity: 0.6 }]} numberOfLines={1}>{item.spec}</Text>

                    {/* Rating & Assured Badge */}
                    <View style={styles.feedRatingRow}>
                      <View style={styles.ratingBox}>
                        <Icons.Star color="#F4C400" size={10} fill="#F4C400" />
                        <Text style={[styles.ratingText, { color: colors.text }]}> {item.rating} ({item.ratingCount})</Text>
                      </View>
                      {item.assured && (
                        <View style={styles.assuredBadge}>
                          <Icons.CheckCircle2 color="#10B981" size={10} />
                          <Text style={styles.assuredText}>Assured</Text>
                        </View>
                      )}
                    </View>

                    {/* Price and Free Delivery info */}
                    <View style={styles.feedPriceRow}>
                      <View>
                        <Text style={styles.feedPrice}>{item.price}</Text>
                        <Text style={[styles.feedStrikePrice, { color: colors.text, opacity: 0.4 }]}>{item.originalPrice}</Text>
                      </View>
                      <Text style={[styles.freeDelText, { color: colors.text, opacity: 0.6 }]}>Free Delivery</Text>
                    </View>
                  </TouchableOpacity>



                  {/* Action buttons matching Image 4 */}
                  <View style={styles.feedActionsRow}>
                    <TouchableOpacity 
                      style={styles.feedSmallCartBtn}
                      onPress={() => {
                        const isAlreadyInCart = cartItems.some(i => i.id === item.id);
                        if (isAlreadyInCart) {
                          Alert.alert('Already in Cart', `"${item.name}" is already in your cart.`);
                        } else {
                          addToCart({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            category: item.category,
                            image: item.image,
                          });
                          Alert.alert('Success', `"${item.name}" added to cart!`);
                        }
                      }}
                    >
                      <Icons.ShoppingCart color={colors.text} size={14} />
                    </TouchableOpacity>
                    
                    {(() => {
                      const isBooking = ['Services', 'Service', 'Stay', 'Travel', 'Food', 'Jobs'].includes(item.category);
                      return (
                        <TouchableOpacity 
                          style={styles.feedAddCartBtn}
                          activeOpacity={0.8}
                          onPress={() => handlePlaceOrder(item.name, item.price, item.category)}
                        >
                          <Text style={styles.feedAddCartText}>
                            {isBooking ? 'Book Now' : 'Buy Now'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })()}
                  </View>
                </GlassCard>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Cart Modal Dialog Sheet */}
      <CartModal 
        visible={isCartVisible}
        onClose={() => setIsCartVisible(false)}
        navigation={navigation}
      />

      {/* Wishlist Modal Dialog Sheet */}
      <WishlistModal 
        visible={isWishlistVisible}
        onClose={() => setIsWishlistVisible(false)}
      />

      {/* Recommended Partners view all modal */}
      <Modal
        visible={isPartnersModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPartnersModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { height: '75%', backgroundColor: colors.background, borderColor: colors.cardBorder, padding: 0 }]}>
            <View style={[styles.modalHeader, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Recommended Partner Hubs</Text>
              <TouchableOpacity onPress={() => setIsPartnersModalVisible(false)} style={styles.modalCloseBtn}>
                <Icons.X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
              {ALL_PARTNER_HUBS.map((partner, idx) => (
                <GlassCard key={idx} style={styles.partnerListCard}>
                  <Image source={{ uri: partner.image }} style={styles.partnerListImg} />
                  <View style={styles.partnerListDetails}>
                    <Text style={[styles.partnerListName, { color: colors.text }]}>{partner.name}</Text>
                    <Text style={[styles.partnerListDesc, { color: colors.text, opacity: 0.5 }]} numberOfLines={2}>{partner.desc}</Text>
                    <View style={styles.partnerListMeta}>
                      <View style={styles.metaCol}>
                        <Icons.Star color="#F4C400" size={10} fill="#F4C400" />
                        <Text style={[styles.metaVal, { color: colors.text, opacity: 0.6 }]}> {partner.rating}</Text>
                      </View>
                      <View style={styles.metaCol}>
                        <Icons.MapPin color={colors.text} size={10} style={{ opacity: 0.5 }} />
                        <Text style={[styles.metaVal, { color: colors.text, opacity: 0.6 }]}> {partner.distance}</Text>
                      </View>
                    </View>
                  </View>
                </GlassCard>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Product Details Premium Modal for Login Booking */}
      <Modal
        visible={pendingProduct !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPendingProduct(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setPendingProduct(null)} 
          />
          {pendingProduct && (
            <GlassCard style={styles.modalCard}>
              {/* Product Image Header with Close Button */}
              <View style={styles.modalImageContainer}>
                <Image source={{ uri: pendingProduct.image || pendingProduct.img }} style={styles.modalImage} />
                <TouchableOpacity 
                  style={styles.modalImgCloseBtn} 
                  onPress={() => setPendingProduct(null)}
                  activeOpacity={0.7}
                >
                  <Icons.X color="#FFFFFF" size={18} />
                </TouchableOpacity>
              </View>

              {/* Product Info */}
              <View style={styles.modalInfoContainer}>
                <Text style={[styles.modalProductName, { color: colors.text }]}>{pendingProduct.name}</Text>
                
                {/* Rating and Discount Row */}
                <View style={styles.modalMetaRow}>
                  <View style={styles.modalRatingBadge}>
                    <Icons.Star color="#F4C400" size={10} fill="#F4C400" />
                    <Text style={styles.modalRatingText}> {pendingProduct.rating || '4.8'}</Text>
                  </View>
                  {(pendingProduct.discount || pendingProduct.memberPrice) && (
                    <View style={styles.modalDiscountBadge}>
                      <Text style={styles.modalDiscountText}>{pendingProduct.discount || '50% OFF'}</Text>
                    </View>
                  )}
                </View>

                {/* Price Container */}
                <View style={styles.modalPriceRow}>
                  <Text style={[styles.modalPriceText, { color: colors.primary }]}>{pendingProduct.price}</Text>
                  {pendingProduct.originalPrice && (
                    <Text style={[styles.modalOriginalPriceText, { color: colors.grayLight }]}>{pendingProduct.originalPrice}</Text>
                  )}
                </View>

                <View style={[styles.modalDivider, { backgroundColor: colors.cardBorder }]} />

                {/* Description */}
                <Text style={[styles.modalSectionTitle, { color: colors.primary }]}>PRODUCT DESCRIPTION</Text>
                <Text style={[styles.modalDescText, { color: colors.text, opacity: 0.7 }]}>
                  {pendingProduct.description || pendingProduct.desc || 'Book consultation with expert general physician and cardiologists.'}
                </Text>

                {/* Action Buttons */}
                <TouchableOpacity 
                  style={[styles.modalActionBtn, { backgroundColor: colors.primary }]}
                  activeOpacity={0.8}
                  onPress={() => {
                    handlePlacePendingOrder(pendingProduct);
                  }}
                >
                  <Text style={[styles.modalActionBtnText, { color: colors.background === '#F8FAFC' ? '#FFFFFF' : '#050B1E' }]}>
                    Book Now
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalSecondaryBtn, { borderColor: colors.primary }]}
                  activeOpacity={0.8}
                  onPress={() => {
                    const isAlreadyInCart = cartItems.some(i => i.id === (pendingProduct.id || 'p-pending'));
                    if (isAlreadyInCart) {
                      Alert.alert('Already in Cart', `"${pendingProduct.name}" is already in your cart.`);
                    } else {
                      addToCart({
                        id: pendingProduct.id || 'p-pending',
                        name: pendingProduct.name,
                        price: pendingProduct.price,
                        category: pendingProduct.category || 'Product',
                        image: pendingProduct.image || pendingProduct.img,
                      });
                      Alert.alert('Success', 'Item added to your cart!');
                    }
                    setPendingProduct(null);
                  }}
                >
                  <Text style={[styles.modalSecondaryBtnText, { color: colors.primary }]}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          )}
        </View>
      </Modal>

      {/* Membership Offers view all modal */}
      <Modal
        visible={isOffersModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOffersModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { height: '75%', backgroundColor: colors.background, borderColor: colors.cardBorder, padding: 0 }]}>
            <View style={[styles.modalHeader, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Exclusive Gold Membership Offers</Text>
              <TouchableOpacity onPress={() => setIsOffersModalVisible(false)} style={styles.modalCloseBtn}>
                <Icons.X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
              {ALL_MEMBERSHIP_OFFERS.map((prod, idx) => (
                <GlassCard key={idx} style={styles.partnerListCard}>
                  <Image source={{ uri: prod.image }} style={styles.partnerListImg} />
                  <View style={styles.partnerListDetails}>
                    <Text style={[styles.partnerListName, { color: colors.text }]}>{prod.name}</Text>
                    <View style={[styles.priceRow, { marginTop: 8 }]}>
                      <Text style={[styles.strikePrice, { fontSize: 13, textDecorationLine: 'line-through', marginRight: 8, color: colors.text, opacity: 0.4 }]}>{prod.price}</Text>
                      <Text style={[styles.memberPrice, { fontSize: 15, color: colors.primary, fontWeight: 'bold' }]}>{prod.memberPrice}</Text>
                    </View>
                    <View style={[styles.goldBadge, { alignSelf: 'flex-start', marginTop: 8 }]}>
                      <Text style={styles.goldBadgeText}>Gold Member Price</Text>
                    </View>
                  </View>
                </GlassCard>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sidebar Drawer Overlay */}
      <Modal
        transparent={true}
        visible={isSidebarOpen}
        animationType="none"
        onRequestClose={() => setIsSidebarOpen(false)}
      >
        <View style={{ flex: 1, position: 'relative' }}>
          {/* Backdrop */}
          <Animated.View 
            style={[
              styles.backdrop, 
              { opacity: fadeAnim }
            ]}
          >
            <TouchableOpacity 
              style={StyleSheet.absoluteFill} 
              activeOpacity={1} 
              onPress={() => setIsSidebarOpen(false)}
            />
          </Animated.View>

          {/* Slide-out Sidebar Panel */}
          <Animated.View 
            style={[
              styles.sidebar, 
              { 
                width: width * 0.82,
                paddingTop: insets.top,
                backgroundColor: colors.background,
                borderLeftColor: colors.cardBorder,
                transform: [{ translateX: slideAnim }] 
              }
            ]}
          >
            {/* Sidebar Header */}
            <View style={[styles.sidebarHeader, { backgroundColor: colors.background, borderBottomColor: colors.cardBorder }]}>
              <View style={styles.sidebarBrandRow}>
                <Image
                  source={require('../../assets/images/forge_india_logo.jpg')}
                  style={styles.sidebarLogo}
                />
                <Text style={[styles.sidebarHeaderTitle, { color: colors.text }]}>Connect Hub</Text>
              </View>
              <TouchableOpacity 
                style={styles.sidebarCloseBtn} 
                onPress={() => setIsSidebarOpen(false)}
                activeOpacity={0.7}
              >
                <Icons.X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            {/* Sidebar Main Content List */}
            <ScrollView 
              style={styles.sidebarScroll} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 16 }}
            >
              {/* My Orders */}
              <TouchableOpacity 
                style={[styles.sidebarMenuCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]} 
                activeOpacity={0.75}
                onPress={() => {
                  setIsSidebarOpen(false);
                  navigation.navigate('CustomerTabs', { screen: 'Orders', params: { activeTab: 'orders' } });
                }}
              >
                <View style={styles.sidebarMenuCardLeft}>
                  <Icons.Package color={colors.primary} size={18} />
                  <Text style={[styles.sidebarMenuCardText, { color: colors.text }]}>My Orders</Text>
                </View>
                <Icons.ChevronRight color={colors.grayLight} size={16} />
              </TouchableOpacity>

              {/* My Bookings */}
              <TouchableOpacity 
                style={[styles.sidebarMenuCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]} 
                activeOpacity={0.75}
                onPress={() => {
                  setIsSidebarOpen(false);
                  navigation.navigate('CustomerTabs', { screen: 'Orders', params: { activeTab: 'bookings' } });
                }}
              >
                <View style={styles.sidebarMenuCardLeft}>
                  <Icons.Calendar color={colors.primary} size={18} />
                  <Text style={[styles.sidebarMenuCardText, { color: colors.text }]}>My Bookings</Text>
                </View>
                <Icons.ChevronRight color={colors.grayLight} size={16} />
              </TouchableOpacity>

              {/* Membership Card */}
              <TouchableOpacity 
                style={[styles.sidebarMenuCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]} 
                activeOpacity={0.75}
                onPress={() => {
                  setIsSidebarOpen(false);
                  navigation.navigate('Membership');
                }}
              >
                <View style={styles.sidebarMenuCardLeft}>
                  <Icons.Award color={colors.primary} size={18} />
                  <Text style={[styles.sidebarMenuCardText, { color: colors.text }]}>Membership Card</Text>
                </View>
                <Icons.ChevronRight color={colors.grayLight} size={16} />
              </TouchableOpacity>

              {/* Profile */}
              <TouchableOpacity 
                style={[styles.sidebarMenuCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]} 
                activeOpacity={0.75}
                onPress={() => {
                  setIsSidebarOpen(false);
                  navigation.navigate('Profile' as any);
                }}
              >
                <View style={styles.sidebarMenuCardLeft}>
                  <Icons.User color={colors.primary} size={18} />
                  <Text style={[styles.sidebarMenuCardText, { color: colors.text }]}>My Profile</Text>
                </View>
                <Icons.ChevronRight color={colors.grayLight} size={16} />
              </TouchableOpacity>

              {/* Divider */}
              <View style={[styles.sidebarCardDivider, { backgroundColor: colors.cardBorder }]} />

              {/* Logout */}
              <TouchableOpacity 
                style={[styles.sidebarMenuCard, styles.sidebarLogoutCard, { backgroundColor: colors.cardBg, borderColor: 'rgba(239, 68, 68, 0.25)' }]} 
                activeOpacity={0.75}
                onPress={() => {
                  setIsSidebarOpen(false);
                  logout();
                }}
              >
                <View style={styles.sidebarMenuCardLeft}>
                  <Icons.LogOut color="#EF4444" size={18} />
                  <Text style={[styles.sidebarMenuCardText, { color: '#EF4444' }]}>Logout</Text>
                </View>
                <Icons.ChevronRight color="rgba(239, 68, 68, 0.4)" size={16} />
              </TouchableOpacity>
            </ScrollView>

            {/* Sidebar Footer (Theme Selection & Wallet Balance) */}
            <View style={[styles.sidebarFooterOnly, { backgroundColor: colors.background, borderTopColor: colors.cardBorder, paddingBottom: insets.bottom + 12 }]}>
              {/* Theme Settings Selection */}
              <View style={[styles.themeSection, { marginTop: 0, paddingHorizontal: 0, marginBottom: 12 }]}>
                <Text style={[styles.themeSectionTitle, { color: colors.grayLight }]}>App Theme</Text>
                <View style={styles.themeOptionsRow}>
                  <TouchableOpacity 
                    style={[
                      styles.themeOptionBtn, 
                      { 
                        backgroundColor: themeMode === 'light' ? colors.primary : colors.cardBg,
                        borderColor: themeMode === 'light' ? colors.primary : colors.cardBorder
                      }
                    ]}
                    onPress={() => setThemeMode('light')}
                  >
                    <Icons.Sun color={themeMode === 'light' ? activeContentColor : colors.text} size={14} />
                    <Text style={[
                      styles.themeOptionText, 
                      { color: themeMode === 'light' ? activeContentColor : colors.text }
                    ]}>Light</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.themeOptionBtn, 
                      { 
                        backgroundColor: themeMode === 'dark' ? colors.primary : colors.cardBg,
                        borderColor: themeMode === 'dark' ? colors.primary : colors.cardBorder
                      }
                    ]}
                    onPress={() => setThemeMode('dark')}
                  >
                    <Icons.Moon color={themeMode === 'dark' ? activeContentColor : colors.text} size={14} />
                    <Text style={[
                      styles.themeOptionText, 
                      { color: themeMode === 'dark' ? activeContentColor : colors.text }
                    ]}>Dark</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.themeOptionBtn, 
                      { 
                        backgroundColor: themeMode === 'system' ? colors.primary : colors.cardBg,
                        borderColor: themeMode === 'system' ? colors.primary : colors.cardBorder
                      }
                    ]}
                    onPress={() => setThemeMode('system')}
                  >
                    <Icons.Monitor color={themeMode === 'system' ? activeContentColor : colors.text} size={14} />
                    <Text style={[
                      styles.themeOptionText, 
                      { color: themeMode === 'system' ? activeContentColor : colors.text }
                    ]}>System</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.footerWalletRow}>
                <Icons.Wallet color={colors.primary} size={14} />
                <Text style={[styles.sidebarUserLabel, { color: colors.text, opacity: 0.6 }]}>Wallet Balance:</Text>
                <Text style={[styles.footerWalletVal, { color: colors.primary }]}>₹14,500.00</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Universal Search Modal */}
      <Modal
        visible={isSearchOpen}
        animationType="fade"
        transparent={false}
        onRequestClose={() => {
          setIsSearchOpen(false);
          setSearchQuery('');
        }}
      >
        <View style={[styles.searchContainer, { paddingTop: insets.top }]}>
          {/* Search Header */}
          <View style={styles.searchHeader}>
            <TouchableOpacity 
              style={styles.searchBackBtn} 
              activeOpacity={0.7} 
              onPress={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
            >
              <Icons.ArrowLeft color="#FFFFFF" size={22} />
            </TouchableOpacity>
            
            <View style={styles.searchInputWrapper}>
              <Icons.Search color="rgba(255, 255, 255, 0.4)" size={18} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInputField}
                placeholder="Search products, services, food..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setSearchQuery('')}
                  style={styles.searchClearBtn}
                >
                  <Icons.X color="rgba(255, 255, 255, 0.6)" size={16} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Search Results / Suggestions */}
          <ScrollView 
            style={styles.searchResultsScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {searchQuery.trim().length === 0 ? (
              // Suggestions / Recent Search UI
              <View style={styles.searchSuggestions}>
                <Text style={styles.searchSectionTitle}>POPULAR SEARCHES</Text>
                <View style={styles.suggestionsGrid}>
                  {['Smartphones', 'Hospitals', 'Electrician', 'Burgers', 'Hotels', 'Flight Booking', 'IT Jobs'].map((term) => (
                    <TouchableOpacity
                      key={term}
                      style={styles.suggestionTag}
                      activeOpacity={0.8}
                      onPress={() => setSearchQuery(term)}
                    >
                      <Text style={styles.suggestionTagText}>{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={[styles.searchSectionTitle, { marginTop: 24 }]}>CATEGORIES</Text>
                <View style={styles.categoriesGrid}>
                  {CATEGORIES.map((cat, idx) => {
                    const colors = ['#FF2E93', '#9C27B0', '#00BCD4', '#FF9800', '#38BDF8', '#4CAF50', '#C084FC'];
                    const color = colors[idx % colors.length];
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.searchCategoryCard, { width: (width - 50) / 2, borderColor: 'rgba(255,255,255,0.06)' }]}
                        activeOpacity={0.8}
                        onPress={() => {
                          setIsSearchOpen(false);
                          navigation.navigate('CategoryDetails', { categoryName: cat.name });
                        }}
                      >
                        <View style={[styles.searchCategoryIconCircle, { backgroundColor: `${color}15` }]}>
                          {renderCategoryIcon(cat.icon, color)}
                        </View>
                        <Text style={styles.searchCategoryCardLabel}>{cat.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : getSearchResults().length > 0 ? (
              // Search Results list
              <View style={styles.searchResultsList}>
                <Text style={styles.searchSectionTitle}>
                  SEARCH RESULTS ({getSearchResults().length})
                </Text>
                {getSearchResults().map((result, idx) => {
                  const IconComp = (Icons as any)[result.icon] || Icons.HelpCircle;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.resultItemRow}
                      activeOpacity={0.7}
                      onPress={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        navigation.navigate('CategoryDetails', {
                          categoryName: result.categoryKey,
                          subCategoryName: result.subcategoryName,
                          selectedItem: result.itemName,
                        });
                      }}
                    >
                      <View style={styles.resultIconWrapper}>
                        <IconComp color="#F4C400" size={18} />
                      </View>
                      <View style={styles.resultTextWrapper}>
                        <Text style={styles.resultItemName}>{result.itemName}</Text>
                        <Text style={styles.resultItemPath}>
                          {result.categoryName} <Text style={{ color: 'rgba(255,255,255,0.2)' }}>❯</Text> {result.subcategoryName}
                        </Text>
                      </View>
                      <Icons.ChevronRight color="rgba(255, 255, 255, 0.3)" size={16} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              // No Results Found UI
              <View style={styles.noResultsContainer}>
                <View style={styles.noResultsIconCircle}>
                  <Icons.Search color="rgba(255, 255, 255, 0.15)" size={48} />
                </View>
                <Text style={styles.noResultsTitle}>No results found</Text>
                <Text style={styles.noResultsSubtitle}>
                  We couldn't find any match for "{searchQuery}". Try adjusting your keywords.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B1E',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#030814',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    zIndex: 100,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F4C400',
  },
  navTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navIconBtn: {
    padding: 6,
  },
  greetingSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 8,
  },
  greetingSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 2,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  walletRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 18,
    justifyContent: 'space-between',
  },
  walletCard: {
    padding: 14,
  },
  couponCard: {
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  walletTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: 'black',
    color: '#FFF',
  },
  couponCount: {
    fontSize: 16,
    fontWeight: 'black',
    color: '#F4C400',
  },
  couponHint: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 6,
  },
  addMoneyBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(244, 196, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addMoneyText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#F4C400',
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F4C400',
    marginTop: -8,
  },
  categoriesScroll: {
    paddingLeft: 4,
    paddingRight: 16,
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
    width: 72,
  },
  categoryCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
  },
  horizontalScroll: {
    paddingLeft: 4,
    paddingRight: 16,
  },
  prodCard: {
    width: 160,
    marginRight: 12,
    padding: 12,
  },
  prodImg: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    backgroundColor: '#0D1636',
  },
  prodName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  strikePrice: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  memberPrice: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  goldBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(244, 196, 0, 0.15)',
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
  },
  goldBadgeText: {
    fontSize: 8,
    fontWeight: 'black',
    color: '#F4C400',
  },
  vendorCard: {
    width: 200,
    marginRight: 12,
    padding: 0,
    overflow: 'hidden',
  },
  vendorImg: {
    width: '100%',
    height: 100,
    backgroundColor: '#0D1636',
  },
  vendorInfo: {
    padding: 10,
  },
  vendorName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
  },
  vendorMeta: {
    flexDirection: 'row',
    marginTop: 6,
  },
  metaCol: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaVal: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 'bold',
  },
  // Sidebar Styling
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    zIndex: 999,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: '#050B1E',
    borderLeftWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 1000,
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#030814',
  },
  sidebarBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sidebarLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F4C400',
  },
  sidebarHeaderTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sidebarCloseBtn: {
    padding: 6,
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarGreeting: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  sidebarUserLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sidebarUserName: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '900',
    marginTop: 2,
  },
  catBlock: {
    marginVertical: 5,
    marginHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  catText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  subcatContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
    paddingLeft: 12,
  },
  subcatBlock: {
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.015)',
  },
  subcatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  subcatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subcatText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
  itemsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingLeft: 20,
    paddingVertical: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    gap: 8,
  },
  itemBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F4C400',
  },
  itemText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11.5,
    fontWeight: '500',
  },
  sidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#030814',
    gap: 12,
  },
  footerWalletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  footerWalletVal: {
    color: '#F4C400',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
  },
  profileBtn: {
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  profileBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutBtnSidebar: {
    borderColor: 'rgba(239, 68, 68, 0.25)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Universal Search Styling
  searchContainer: {
    flex: 1,
    backgroundColor: '#050B1E',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#030814',
    gap: 12,
  },
  searchBackBtn: {
    padding: 6,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInputField: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 0,
  },
  searchClearBtn: {
    padding: 4,
  },
  searchResultsScroll: {
    flex: 1,
  },
  searchSuggestions: {
    padding: 20,
  },
  searchSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  suggestionTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  suggestionTagText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  searchCategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 10,
  },
  searchCategoryIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCategoryCardLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchResultsList: {
    padding: 20,
  },
  resultItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    gap: 12,
  },
  resultIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 196, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTextWrapper: {
    flex: 1,
  },
  resultItemName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultItemPath: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  noResultsIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  noResultsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noResultsSubtitle: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
  // Universal Sidebar Menu Cards
  sidebarMenuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
    marginHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  sidebarMenuCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sidebarMenuCardText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sidebarCardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 12,
    marginHorizontal: 16,
  },
  sidebarLogoutCard: {
    borderColor: 'rgba(239, 68, 68, 0.15)',
    backgroundColor: 'rgba(239, 68, 68, 0.02)',
  },
  sidebarFooterOnly: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#030814',
    alignSelf: 'stretch',
  },
  feedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  feedCard: {
    width: (width - 52) / 2, // 2-columns with padding
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  feedImgWrapper: {
    position: 'relative',
    width: '100%',
    height: 120,
    backgroundColor: '#0D1636',
  },
  feedImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(5, 11, 30, 0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  feedDetails: {
    padding: 10,
  },
  feedName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    minHeight: 32,
  },
  feedSpec: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 9,
    marginTop: 2,
  },
  feedRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  assuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  assuredText: {
    color: '#10B981',
    fontSize: 8,
    fontWeight: 'bold',
  },
  feedPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  feedPrice: {
    color: '#F4C400',
    fontSize: 13,
    fontWeight: '900',
  },
  feedStrikePrice: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 9,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  freeDelText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 8,
    fontWeight: 'bold',
  },
  feedDescBox: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 8,
  },
  feedDescText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    lineHeight: 14,
  },
  feedActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  feedSmallCartBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedAddCartBtn: {
    flex: 1,
    backgroundColor: '#F4C400',
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedAddCartText: {
    color: '#050B1E',
    fontSize: 10,
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF2E93',
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseBtn: {
    padding: 4,
  },
  partnerListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
  },
  partnerListImg: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#0D1636',
  },
  partnerListDetails: {
    flex: 1,
    marginLeft: 14,
  },
  partnerListName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  partnerListDesc: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    marginTop: 4,
    lineHeight: 14,
  },
  partnerListMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 30, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(13, 22, 54, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 0,
    overflow: 'hidden',
  },
  themeSection: {
    alignSelf: 'stretch',
    marginBottom: 10,
  },
  themeSectionTitle: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  themeOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 8,
  },
  themeOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
    borderRadius: 12,
  },
  themeOptionBtnActive: {
    backgroundColor: '#F4C400',
    borderColor: '#F4C400',
  },
  themeOptionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  themeOptionTextActive: {
    color: '#050B1E',
  },
  modalImageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalImgCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(5, 11, 30, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInfoContainer: {
    padding: 20,
  },
  modalProductName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  modalRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 196, 0, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  modalRatingText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F4C400',
  },
  modalDiscountBadge: {
    backgroundColor: 'rgba(233, 30, 99, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  modalDiscountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  modalPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  modalPriceText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F4C400',
  },
  modalOriginalPriceText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    textDecorationLine: 'line-through',
  },
  modalDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 9.5,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1,
    marginBottom: 6,
  },
  modalDescText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActionBtn: {
    backgroundColor: '#E91E63',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  modalActionBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalSecondaryBtn: {
    borderWidth: 1.5,
    borderColor: '#E91E63',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  modalSecondaryBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E91E63',
  },
});
