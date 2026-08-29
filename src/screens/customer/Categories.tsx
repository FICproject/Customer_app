import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  Image,
  Modal,
  Animated,
  PermissionsAndroid,
  Platform,
  Alert,
  Linking,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import { SIDEBAR_DATA } from './sidebarData';
import { useCartStore } from '../../store/cartStore';
import CartModal from '../../components/CartModal';
import { useThemeStore } from '../../store/themeStore';
import { useLocationStore } from '../../store/locationStore';
import { useNotificationStore } from '../../store/notificationStore';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Top horizontal category pills
const TOP_SLIDER_CATEGORIES = [
  { name: 'All', icon: 'LayoutGrid', key: 'All' },
  { name: 'Products', icon: 'ShoppingBag', key: 'Product' },
  { name: 'Services', icon: 'Wrench', key: 'Services' },
  { name: 'Daily Needs', icon: 'Milk', key: 'Daily Needs' },
  { name: 'Food', icon: 'Utensils', key: 'Food' },
  { name: 'Stay', icon: 'Bed', key: 'Stay' },
  { name: 'Travel', icon: 'Plane', key: 'Travel' },
  { name: 'Jobs', icon: 'Briefcase', key: 'Job' },
];

// Curated high-resolution illustrations for every subcategory
const SUBCAT_IMAGES: Record<string, string> = {
  // Products
  Electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=70',
  'IT & Office': 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=200&auto=format&fit=crop&q=70',
  'Home Appliances': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&auto=format&fit=crop&q=70',
  Furniture: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200&auto=format&fit=crop&q=70',
  Fashion: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&auto=format&fit=crop&q=70',
  Beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&auto=format&fit=crop&q=70',
  'Baby Care': 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=200&auto=format&fit=crop&q=70',
  'Sports & Fitness': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=70',
  Books: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&auto=format&fit=crop&q=70',
  Gaming: 'https://images.unsplash.com/photo-1385846882-47137b678fae?w=200&auto=format&fit=crop&q=70',
  'Home & Kitchen': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&auto=format&fit=crop&q=70',

  // Services
  Healthcare: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&auto=format&fit=crop&q=70',
  Education: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=200&auto=format&fit=crop&q=70',
  Employment: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&auto=format&fit=crop&q=70',
  Financial: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&auto=format&fit=crop&q=70',
  Insurance: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=200&auto=format&fit=crop&q=70',
  'Home Services': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&auto=format&fit=crop&q=70',
  Legal: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&auto=format&fit=crop&q=70',
  Digital: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=70',
  Business: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=70',
  Automobile: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&auto=format&fit=crop&q=70',
  Telecom: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=200&auto=format&fit=crop&q=70',
  Utilities: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=200&auto=format&fit=crop&q=70',
  Family: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200&auto=format&fit=crop&q=70',
  Fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&auto=format&fit=crop&q=70',
  Events: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=200&auto=format&fit=crop&q=70',
  Hospitality: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=70',
  Travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&auto=format&fit=crop&q=70',
  'Real Estate': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&auto=format&fit=crop&q=70',
  Security: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=200&auto=format&fit=crop&q=70',

  // Daily Needs
  Grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=70',
  'Fruits & Vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=70',
  Dairy: 'https://images.unsplash.com/photo-1528750901443-e98fdc48a49a?w=200&auto=format&fit=crop&q=70',
  Bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=70',
  Beverages: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&auto=format&fit=crop&q=70',

  // Food
  Restaurants: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=70',
  'Fast Food': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=70',
  Cafes: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=70',
  Desserts: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&auto=format&fit=crop&q=70',

  // Stay
  Hotels: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=70',
  Resorts: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&auto=format&fit=crop&q=70',
  Homestays: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=200&auto=format&fit=crop&q=70',

  // Travel (Bus Only)
  'Bus Booking': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&auto=format&fit=crop&q=70',
  'AC Sleeper': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&auto=format&fit=crop&q=70',
  'Volvo Multi-Axle': 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=200&auto=format&fit=crop&q=70',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=70';

// Filter state definition
interface FilterConfig {
  categoryType: string;
  sortBy: string;
  priceRange: string;
  rating: string;
  availability: string[];
  distance: string;
  offers: string[];
  foodVeg?: string;
  stayProperty?: string;
  jobMode?: string;
}

const DEFAULT_FILTERS: FilterConfig = {
  categoryType: 'All',
  sortBy: 'recommended',
  priceRange: 'all',
  rating: 'all',
  availability: [],
  distance: 'all',
  offers: [],
  foodVeg: 'all',
  stayProperty: 'all',
  jobMode: 'all',
};

export default function Categories() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors, themeMode } = useThemeStore();
  const getDisplayLocation = useLocationStore((state) => state.getDisplayLocation);

  const isLight = colors.background === '#FFFDF5' || colors.background === '#FFFFFF' || colors.background === '#F8FAFC' || colors.background === '#FFF8E8' || themeMode === 'light';

  // Navigation and Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');

  // Applied Filters State & Draft Filter State
  const [filters, setFilters] = useState<FilterConfig>(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState<FilterConfig>(DEFAULT_FILTERS);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Accordion expansion state in Filter Modal
  const [expandedSection, setExpandedSection] = useState<string | null>('sort');

  // Voice Search States
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const voiceTimeoutRef = useRef<any>(null);

  const wave1 = useRef(new Animated.Value(6)).current;
  const wave2 = useRef(new Animated.Value(14)).current;
  const wave3 = useRef(new Animated.Value(10)).current;
  const wave4 = useRef(new Animated.Value(18)).current;

  // Cart & Notification Store
  const [isCartVisible, setIsCartVisible] = useState(false);
  const cartItems = useCartStore((state) => state.cartItems);
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const unreadNotifCount = useNotificationStore((state) => state.unreadCount);

  // Helper to toggle accordion sections smoothly
  const toggleAccordion = (sectionKey: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection((prev) => (prev === sectionKey ? null : sectionKey));
  };

  // Helper to calculate total active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categoryType !== 'All') count++;
    if (filters.sortBy !== 'recommended') count++;
    if (filters.priceRange !== 'all') count++;
    if (filters.rating !== 'all') count++;
    if (filters.availability.length > 0) count += filters.availability.length;
    if (filters.distance !== 'all') count++;
    if (filters.offers.length > 0) count += filters.offers.length;
    if (filters.foodVeg && filters.foodVeg !== 'all') count++;
    if (filters.stayProperty && filters.stayProperty !== 'all') count++;
    if (filters.jobMode && filters.jobMode !== 'all') count++;
    return count;
  }, [filters]);

  // Voice waveform animation
  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;
    if (isVoiceListening) {
      animLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(wave1, { toValue: 18, duration: 260, useNativeDriver: false }),
            Animated.timing(wave1, { toValue: 6, duration: 260, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(wave2, { toValue: 8, duration: 220, useNativeDriver: false }),
            Animated.timing(wave2, { toValue: 22, duration: 220, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(wave3, { toValue: 20, duration: 280, useNativeDriver: false }),
            Animated.timing(wave3, { toValue: 6, duration: 280, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(wave4, { toValue: 8, duration: 200, useNativeDriver: false }),
            Animated.timing(wave4, { toValue: 18, duration: 200, useNativeDriver: false }),
          ]),
        ])
      );
      animLoop.start();
    } else {
      wave1.setValue(6);
      wave2.setValue(14);
      wave3.setValue(10);
      wave4.setValue(18);
    }
    return () => {
      if (animLoop) animLoop.stop();
    };
  }, [isVoiceListening, wave1, wave2, wave3, wave4]);

  const stopVoiceListening = () => {
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = null;
    }
    setIsVoiceListening(false);
  };

  const handleMicPress = async () => {
    if (isVoiceListening) {
      stopVoiceListening();
      return;
    }

    try {
      setVoiceError(null);
      let isGranted = true;

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'Connect Mobile needs microphone access for voice search.',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
          }
        );
        isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      }

      if (isGranted) {
        setIsVoiceListening(true);
        voiceTimeoutRef.current = setTimeout(() => {
          const simulatedTerms = ['Healthcare', 'Electrician', 'Electronics', 'Fast Food', 'Hotels', 'Grocery'];
          const randomTerm = simulatedTerms[Math.floor(Math.random() * simulatedTerms.length)];
          setSearchQuery(randomTerm);
          setIsVoiceListening(false);
        }, 2600);
      } else {
        Alert.alert(
          'Microphone Permission Required',
          'Please enable microphone access in device settings to use voice search.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch {
      setVoiceError("Couldn't hear that. Try again.");
      setIsVoiceListening(false);
    }
  };

  // Helper to map Sidebar keys to user-facing category route name
  const getMappedCategoryRoute = (key: string) => {
    if (key === 'Product') return 'Products';
    if (key === 'Job') return 'Jobs';
    return key;
  };

  // Sidebar items list (displays subcategories dynamically)
  const getLeftSidebarItems = () => {
    const items = [{ name: 'All Categories', key: 'All' }];
    const targetMainCat = filters.categoryType !== 'All' ? filters.categoryType : selectedMainCategory;

    if (targetMainCat === 'All') {
      Object.keys(SIDEBAR_DATA).forEach((catKey) => {
        const catData = SIDEBAR_DATA[catKey];
        if (catData && catData.subcategories) {
          Object.keys(catData.subcategories).forEach((subName) => {
            const displayName = subName === 'IT' ? 'IT Jobs' : subName;
            if (!items.some((x) => x.key === subName)) {
              items.push({ name: displayName, key: subName });
            }
          });
        }
      });
    } else {
      const catData = SIDEBAR_DATA[targetMainCat];
      if (catData && catData.subcategories) {
        Object.keys(catData.subcategories).forEach((subName) => {
          items.push({ name: subName, key: subName });
        });
      }
    }
    return items;
  };

  // Compile items for the right grid based on searchQuery, category selection, and active filters
  const getFilteredItems = (filterState: FilterConfig) => {
    const query = searchQuery.toLowerCase().trim();
    const targetMainCat = filterState.categoryType !== 'All' ? filterState.categoryType : selectedMainCategory;

    const list: Array<{
      type: 'subcategory';
      categoryKey: string;
      categoryName: string;
      name: string;
      count: string;
      image: string;
      rating: number;
      priceNum: number;
      distanceKm: number;
      isInstant: boolean;
      isOrganic?: boolean;
    }> = [];

    Object.keys(SIDEBAR_DATA).forEach((catKey) => {
      if (targetMainCat !== 'All' && catKey !== targetMainCat) return;

      const catData = SIDEBAR_DATA[catKey];
      const categoryName = getMappedCategoryRoute(catKey);

      if (catData.subcategories) {
        Object.keys(catData.subcategories).forEach((subName, sIdx) => {
          if (selectedSubcategory !== 'All' && subName !== selectedSubcategory) return;

          const subData = catData.subcategories[subName];
          const matchesQuery =
            !query ||
            subName.toLowerCase().includes(query) ||
            categoryName.toLowerCase().includes(query) ||
            (subData.items && subData.items.some((it: string) => it.toLowerCase().includes(query)));

          if (matchesQuery) {
            const imgUri = SUBCAT_IMAGES[subName] || DEFAULT_IMAGE;
            const rating = 4.0 + (sIdx % 10) * 0.1;
            const priceNum = 200 + (sIdx % 12) * 250;
            const distanceKm = 0.5 + (sIdx % 8) * 0.8;
            const isInstant = sIdx % 2 === 0;

            // Rating Filter
            if (filterState.rating === '4.5' && rating < 4.5) return;
            if (filterState.rating === '4.0' && rating < 4.0) return;
            if (filterState.rating === '3.0' && rating < 3.0) return;

            // Price Filter
            if (filterState.priceRange === 'under_500' && priceNum >= 500) return;
            if (filterState.priceRange === '500_2000' && (priceNum < 500 || priceNum > 2000)) return;
            if (filterState.priceRange === '2000_10000' && (priceNum < 2000 || priceNum > 10000)) return;
            if (filterState.priceRange === 'above_10000' && priceNum < 10000) return;

            // Distance Filter
            if (filterState.distance === '1km' && distanceKm > 1.0) return;
            if (filterState.distance === '3km' && distanceKm > 3.0) return;
            if (filterState.distance === '5km' && distanceKm > 5.0) return;
            if (filterState.distance === '10km' && distanceKm > 10.0) return;

            // Availability
            if (filterState.availability.includes('instant_booking') && !isInstant) return;

            list.push({
              type: 'subcategory',
              categoryKey: catKey,
              categoryName,
              name: subName,
              count: `${(subData.items?.length || 0) * 120 + 80}+ Options`,
              image: imgUri,
              rating,
              priceNum,
              distanceKm,
              isInstant,
            });
          }
        });
      }
    });

    // Sorting Logic
    if (filterState.sortBy === 'asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filterState.sortBy === 'desc') {
      list.sort((a, b) => b.name.localeCompare(a.name));
    } else if (filterState.sortBy === 'rating_desc') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (filterState.sortBy === 'price_asc') {
      list.sort((a, b) => a.priceNum - b.priceNum);
    } else if (filterState.sortBy === 'price_desc') {
      list.sort((a, b) => b.priceNum - a.priceNum);
    } else if (filterState.sortBy === 'distance') {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (filterState.sortBy === 'popularity') {
      list.reverse();
    }

    return list;
  };

  const rightItems = useMemo(() => getFilteredItems(filters), [filters, searchQuery, selectedMainCategory, selectedSubcategory]);
  const draftResultCount = useMemo(() => getFilteredItems(draftFilters).length, [draftFilters, searchQuery, selectedMainCategory, selectedSubcategory]);

  const handleOpenFilterModal = () => {
    setDraftFilters({ ...filters });
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    setFilters({ ...draftFilters });
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setIsFilterModalOpen(false);
  };

  const handleRemoveFilterChip = (filterKey: keyof FilterConfig, value?: any) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (filterKey === 'availability') {
      setFilters((prev) => ({
        ...prev,
        availability: prev.availability.filter((x) => x !== value),
      }));
    } else if (filterKey === 'offers') {
      setFilters((prev) => ({
        ...prev,
        offers: prev.offers.filter((x) => x !== value),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [filterKey]: DEFAULT_FILTERS[filterKey],
      }));
    }
  };

  const handleTopCategoryPress = (key: string) => {
    setSelectedMainCategory(key);
    setSelectedSubcategory('All');
    setFilters((prev) => ({ ...prev, categoryType: key }));
  };

  const renderTopIcon = (iconName: string, color = '#0F172A') => {
    const IconComp = (Icons as any)[iconName] || Icons.HelpCircle;
    return <IconComp color={color} size={18} />;
  };

  const handleCardPress = (card: any) => {
    navigation.navigate('CategoryDetails', {
      categoryName: card.categoryName,
      subCategoryName: card.name,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Warm Pastel Yellow Header (#FFF3D6 / #FFF1C7) */}
      <View
        style={[
          styles.headerWrapper,
          {
            paddingTop: Math.max(insets.top, 20) + 4,
            backgroundColor: isLight ? '#FFF1C7' : colors.background,
            borderBottomColor: isLight ? 'rgba(242, 183, 5, 0.25)' : colors.cardBorder,
          },
        ]}
      >
        {/* Row 1: Location | CATEGORIES | Cart & Notification */}
        <View style={styles.topHeaderRow}>
          {/* Location Selector */}
          <TouchableOpacity
            style={[
              styles.locationSelector,
              {
                backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
                borderColor: isLight ? '#FDE68A' : colors.cardBorder,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('LocationSelection')}
          >
            <Icons.MapPin color="#F5B800" size={13} />
            <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>
              {getDisplayLocation()}
            </Text>
            <Icons.ChevronDown color={isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)'} size={12} />
          </TouchableOpacity>

          {/* Screen Title */}
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            CATEGORIES
          </Text>

          {/* Action Icons */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              activeOpacity={0.7}
              onPress={() => setIsCartVisible(true)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Icons.ShoppingCart color={colors.text} size={20} />
              {totalCartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{totalCartCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerBtn}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Notifications')}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Icons.Bell color={colors.text} size={20} />
              {unreadNotifCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadNotifCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 2: Search Bar + Filter Button */}
        <View style={styles.searchAndFilterRow}>
          {/* Search Field */}
          <View
            style={[
              styles.searchInputWrapper,
              {
                backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.07)',
                borderColor: isVoiceListening ? '#F5B800' : isLight ? '#FCD34D' : colors.cardBorder,
              },
            ]}
          >
            {isVoiceListening ? (
              <View style={styles.inlineListeningRow}>
                <View style={styles.waveformContainer}>
                  <Animated.View style={[styles.waveBar, { height: wave1 }]} />
                  <Animated.View style={[styles.waveBar, { height: wave2 }]} />
                  <Animated.View style={[styles.waveBar, { height: wave3 }]} />
                  <Animated.View style={[styles.waveBar, { height: wave4 }]} />
                </View>
                <Text style={styles.listeningText}>Listening...</Text>
                <TouchableOpacity onPress={stopVoiceListening} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Icons.X color="#F5B800" size={18} />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Icons.Search color="#F5B800" size={18} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search categories, services..."
                  placeholderTextColor={isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    style={{ marginRight: 6 }}
                  >
                    <Icons.X color={isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.5)'} size={16} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleMicPress}
                  style={styles.micBtn}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icons.Mic color={colors.text} size={18} />
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            style={[
              styles.filterBtn,
              {
                backgroundColor: activeFilterCount > 0
                  ? (isLight ? '#FEF9E7' : 'rgba(245, 184, 0, 0.15)')
                  : (isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.07)'),
                borderColor: activeFilterCount > 0 ? '#F5B800' : isLight ? '#FCD34D' : colors.cardBorder,
              },
            ]}
            activeOpacity={0.8}
            onPress={handleOpenFilterModal}
          >
            <Icons.SlidersHorizontal color={activeFilterCount > 0 ? '#F5B800' : colors.text} size={15} />
            <Text
              style={[
                styles.filterBtnText,
                { color: activeFilterCount > 0 ? '#D97706' : colors.text },
              ]}
            >
              Filter
            </Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterCountBadge}>
                <Text style={styles.filterCountText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filter Chips Strip */}
        {activeFilterCount > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeChipsContainer}
          >
            {filters.categoryType !== 'All' && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterChipText}>{filters.categoryType}</Text>
                <TouchableOpacity onPress={() => handleRemoveFilterChip('categoryType')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Icons.X color="#0F172A" size={12} />
                </TouchableOpacity>
              </View>
            )}

            {filters.sortBy !== 'recommended' && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterChipText}>Sort: {filters.sortBy.replace('_', ' ')}</Text>
                <TouchableOpacity onPress={() => handleRemoveFilterChip('sortBy')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Icons.X color="#0F172A" size={12} />
                </TouchableOpacity>
              </View>
            )}

            {filters.rating !== 'all' && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterChipText}>{filters.rating}+ ★ Rating</Text>
                <TouchableOpacity onPress={() => handleRemoveFilterChip('rating')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Icons.X color="#0F172A" size={12} />
                </TouchableOpacity>
              </View>
            )}

            {filters.priceRange !== 'all' && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterChipText}>{filters.priceRange.replace('_', ' ')}</Text>
                <TouchableOpacity onPress={() => handleRemoveFilterChip('priceRange')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Icons.X color="#0F172A" size={12} />
                </TouchableOpacity>
              </View>
            )}

            {filters.distance !== 'all' && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterChipText}>Within {filters.distance}</Text>
                <TouchableOpacity onPress={() => handleRemoveFilterChip('distance')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Icons.X color="#0F172A" size={12} />
                </TouchableOpacity>
              </View>
            )}

            {filters.availability.map((avail) => (
              <View key={avail} style={styles.activeFilterChip}>
                <Text style={styles.activeFilterChipText}>{avail.replace('_', ' ')}</Text>
                <TouchableOpacity onPress={() => handleRemoveFilterChip('availability', avail)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Icons.X color="#0F172A" size={12} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.clearAllChip} onPress={() => setFilters(DEFAULT_FILTERS)}>
              <Text style={styles.clearAllChipText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Error Banner if Voice Fails */}
        {voiceError && (
          <View style={styles.voiceErrorBanner}>
            <Icons.AlertCircle color="#F5B800" size={14} />
            <Text style={styles.voiceErrorText}>{voiceError}</Text>
            <TouchableOpacity onPress={handleMicPress} style={styles.voiceRetryBtn}>
              <Text style={styles.voiceRetryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Top Category Horizontal Capsule Slider */}
      <View
        style={[
          styles.topSliderWrapper,
          {
            backgroundColor: colors.background,
            borderBottomColor: isLight ? '#F1EAD8' : colors.cardBorder,
          },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topSliderContent}>
          {TOP_SLIDER_CATEGORIES.map((item) => {
            const isActive = selectedMainCategory === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={styles.topSliderBtn}
                activeOpacity={0.85}
                onPress={() => handleTopCategoryPress(item.key)}
              >
                <View
                  style={[
                    styles.topIconCircle,
                    {
                      backgroundColor: isActive ? '#F5B800' : isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
                      borderColor: isActive ? '#F5B800' : isLight ? '#F1EAD8' : colors.cardBorder,
                    },
                  ]}
                >
                  {renderTopIcon(item.icon, isActive ? '#0F172A' : isLight ? '#0F172A' : '#FFFFFF')}
                </View>
                <Text
                  style={[
                    styles.topLabel,
                    { color: isActive ? '#D97706' : colors.text },
                    isActive && styles.topLabelActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Two-Pane Category Content (Left Sidebar + Right Grid) */}
      <View style={styles.mainLayout}>
        {/* Left Sidebar Menu */}
        <View
          style={[
            styles.leftSidebar,
            {
              backgroundColor: isLight ? '#FFFDF5' : '#030814',
              borderRightColor: isLight ? '#F1EAD8' : colors.cardBorder,
            },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
            {getLeftSidebarItems().map((item) => {
              const isActive = selectedSubcategory === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.leftSidebarItem,
                    isActive && {
                      backgroundColor: isLight ? '#FEF9E7' : 'rgba(245, 184, 0, 0.1)',
                    },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedSubcategory(item.key)}
                >
                  {isActive && <View style={[styles.activeSidebarIndicator, { backgroundColor: '#F5B800' }]} />}
                  <Text
                    style={[
                      styles.leftSidebarText,
                      { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)' },
                      isActive && { color: '#0F172A', fontWeight: '800' },
                      !isLight && isActive && { color: '#F5B800', fontWeight: '800' },
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right Content Grid */}
        <View style={[styles.rightContent, { backgroundColor: colors.background }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingVertical: 12,
              paddingBottom: Math.max(insets.bottom, 20) + 60,
            }}
          >
            {/* Active Subheading */}
            <View style={styles.rightHeaderRow}>
              <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>
                {selectedSubcategory === 'All' ? 'TOP CATEGORIES' : selectedSubcategory.toUpperCase()}
              </Text>
              <Text style={[styles.resultCountText, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.45)' }]}>
                {rightItems.length} {rightItems.length === 1 ? 'category' : 'categories'}
              </Text>
            </View>

            {/* Grid of Cards */}
            {rightItems.length > 0 ? (
              <View style={styles.subcatGrid}>
                {rightItems.map((card, idx) => (
                  <TouchableOpacity
                    key={`${card.categoryKey}_${card.name}_${idx}`}
                    style={[
                      styles.subcatCard,
                      {
                        width: (width - 110 - 36) / 2,
                        backgroundColor: isLight ? '#FFFFFF' : 'rgba(13, 22, 54, 0.65)',
                        borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
                      },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => handleCardPress(card)}
                  >
                    <Image source={{ uri: card.image }} style={styles.subcatCardImage} resizeMode="cover" />
                    <View style={styles.subcatCardDetails}>
                      <Text style={[styles.subcatCardTitle, { color: colors.text }]} numberOfLines={1}>
                        {card.name}
                      </Text>
                      <View style={styles.cardMetaRow}>
                        <Text style={[styles.subcatCardCount, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.45)' }]}>
                          {card.count}
                        </Text>
                        <View style={styles.ratingBadgeMini}>
                          <Icons.Star color="#F5B800" size={9} fill="#F5B800" />
                          <Text style={styles.ratingBadgeText}>{card.rating.toFixed(1)}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyGrid}>
                <Icons.SearchX color={isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.35)'} size={36} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No categories match your filters</Text>
                <Text style={[styles.emptySub, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)' }]}>
                  Try adjusting or resetting your filter criteria.
                </Text>
                <TouchableOpacity style={styles.emptyResetBtn} onPress={() => setFilters(DEFAULT_FILTERS)}>
                  <Text style={styles.emptyResetBtnText}>Reset All Filters</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Cart Modal Dialog Sheet */}
      <CartModal visible={isCartVisible} onClose={() => setIsCartVisible(false)} navigation={navigation} />

      {/* Real Marketplace Filter Bottom Sheet Modal */}
      <Modal
        visible={isFilterModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isLight ? '#FFFDF5' : '#0B1530',
                borderColor: isLight ? '#FDE68A' : colors.cardBorder,
              },
            ]}
          >
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.08)' }]}>
              <View>
                <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Marketplace Filters</Text>
                <Text style={[styles.modalHeaderSub, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)' }]}>
                  Refine categories, services & pricing
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsFilterModalOpen(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icons.X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Accordion 1: SORT BY */}
              <View style={[styles.accordionSection, { borderBottomColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.06)' }]}>
                <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleAccordion('sort')}>
                  <View style={styles.accordionTitleRow}>
                    <Icons.ArrowUpDown color="#F5B800" size={16} />
                    <Text style={[styles.accordionTitle, { color: colors.text }]}>Sort By</Text>
                  </View>
                  <View style={styles.accordionRightRow}>
                    <Text style={styles.accordionPreviewText}>
                      {draftFilters.sortBy.replace('_', ' ')}
                    </Text>
                    {expandedSection === 'sort' ? (
                      <Icons.ChevronUp color={colors.text} size={16} />
                    ) : (
                      <Icons.ChevronDown color={colors.text} size={16} />
                    )}
                  </View>
                </TouchableOpacity>

                {expandedSection === 'sort' && (
                  <View style={styles.accordionContent}>
                    {[
                      { key: 'recommended', label: 'Recommended' },
                      { key: 'popularity', label: 'Popularity' },
                      { key: 'rating_desc', label: 'Rating: High to Low' },
                      { key: 'price_asc', label: 'Price: Low to High' },
                      { key: 'price_desc', label: 'Price: High to Low' },
                      { key: 'distance', label: 'Distance: Near to Far' },
                      { key: 'asc', label: 'Alphabetical: A → Z' },
                    ].map((opt) => {
                      const isSelected = draftFilters.sortBy === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          style={[styles.radioItem, isSelected && styles.radioItemSelected]}
                          onPress={() => setDraftFilters((prev) => ({ ...prev, sortBy: opt.key }))}
                        >
                          <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                            {isSelected && <View style={styles.radioDot} />}
                          </View>
                          <Text style={[styles.radioText, { color: isSelected ? '#D97706' : colors.text }, isSelected && { fontWeight: '700' }]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Accordion 2: CATEGORY TYPE */}
              <View style={[styles.accordionSection, { borderBottomColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.06)' }]}>
                <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleAccordion('category')}>
                  <View style={styles.accordionTitleRow}>
                    <Icons.LayoutGrid color="#F5B800" size={16} />
                    <Text style={[styles.accordionTitle, { color: colors.text }]}>Category Type</Text>
                  </View>
                  <View style={styles.accordionRightRow}>
                    <Text style={styles.accordionPreviewText}>{draftFilters.categoryType}</Text>
                    {expandedSection === 'category' ? (
                      <Icons.ChevronUp color={colors.text} size={16} />
                    ) : (
                      <Icons.ChevronDown color={colors.text} size={16} />
                    )}
                  </View>
                </TouchableOpacity>

                {expandedSection === 'category' && (
                  <View style={styles.accordionContent}>
                    <View style={styles.filterPillsRow}>
                      {['All', 'Product', 'Services', 'Daily Needs', 'Food', 'Stay', 'Travel', 'Job'].map((typeKey) => {
                        const isSelected = draftFilters.categoryType === typeKey;
                        const label = typeKey === 'Product' ? 'Products' : typeKey === 'Job' ? 'Jobs' : typeKey;
                        return (
                          <TouchableOpacity
                            key={typeKey}
                            style={[
                              styles.filterPill,
                              {
                                backgroundColor: isSelected ? '#F5B800' : isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
                                borderColor: isSelected ? '#F5B800' : isLight ? '#F1EAD8' : colors.cardBorder,
                              },
                            ]}
                            onPress={() => setDraftFilters((prev) => ({ ...prev, categoryType: typeKey }))}
                          >
                            <Text style={[styles.filterPillText, { color: isSelected ? '#0F172A' : colors.text }]}>
                              {label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>

              {/* Accordion 3: PRICE RANGE */}
              <View style={[styles.accordionSection, { borderBottomColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.06)' }]}>
                <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleAccordion('price')}>
                  <View style={styles.accordionTitleRow}>
                    <Icons.BadgeIndianRupee color="#F5B800" size={16} />
                    <Text style={[styles.accordionTitle, { color: colors.text }]}>Price Range</Text>
                  </View>
                  <View style={styles.accordionRightRow}>
                    <Text style={styles.accordionPreviewText}>{draftFilters.priceRange.replace('_', ' ')}</Text>
                    {expandedSection === 'price' ? (
                      <Icons.ChevronUp color={colors.text} size={16} />
                    ) : (
                      <Icons.ChevronDown color={colors.text} size={16} />
                    )}
                  </View>
                </TouchableOpacity>

                {expandedSection === 'price' && (
                  <View style={styles.accordionContent}>
                    <View style={styles.filterPillsRow}>
                      {[
                        { key: 'all', label: 'All Prices' },
                        { key: 'under_500', label: 'Under ₹500' },
                        { key: '500_2000', label: '₹500 - ₹2,000' },
                        { key: '2000_10000', label: '₹2,000 - ₹10,000' },
                        { key: 'above_10000', label: '₹10,000+' },
                      ].map((pr) => {
                        const isSelected = draftFilters.priceRange === pr.key;
                        return (
                          <TouchableOpacity
                            key={pr.key}
                            style={[
                              styles.filterPill,
                              {
                                backgroundColor: isSelected ? '#F5B800' : isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
                                borderColor: isSelected ? '#F5B800' : isLight ? '#F1EAD8' : colors.cardBorder,
                              },
                            ]}
                            onPress={() => setDraftFilters((prev) => ({ ...prev, priceRange: pr.key }))}
                          >
                            <Text style={[styles.filterPillText, { color: isSelected ? '#0F172A' : colors.text }]}>
                              {pr.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>

              {/* Accordion 4: CUSTOMER RATING */}
              <View style={[styles.accordionSection, { borderBottomColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.06)' }]}>
                <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleAccordion('rating')}>
                  <View style={styles.accordionTitleRow}>
                    <Icons.Star color="#F5B800" size={16} />
                    <Text style={[styles.accordionTitle, { color: colors.text }]}>Customer Rating</Text>
                  </View>
                  <View style={styles.accordionRightRow}>
                    <Text style={styles.accordionPreviewText}>{draftFilters.rating === 'all' ? 'Any' : `${draftFilters.rating}+ ★`}</Text>
                    {expandedSection === 'rating' ? (
                      <Icons.ChevronUp color={colors.text} size={16} />
                    ) : (
                      <Icons.ChevronDown color={colors.text} size={16} />
                    )}
                  </View>
                </TouchableOpacity>

                {expandedSection === 'rating' && (
                  <View style={styles.accordionContent}>
                    <View style={styles.filterPillsRow}>
                      {[
                        { key: 'all', label: 'Any Rating' },
                        { key: '4.5', label: '4.5+ ★ (Top Rated)' },
                        { key: '4.0', label: '4.0+ ★ (Very Good)' },
                        { key: '3.0', label: '3.0+ ★ (Good)' },
                      ].map((rt) => {
                        const isSelected = draftFilters.rating === rt.key;
                        return (
                          <TouchableOpacity
                            key={rt.key}
                            style={[
                              styles.filterPill,
                              {
                                backgroundColor: isSelected ? '#F5B800' : isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
                                borderColor: isSelected ? '#F5B800' : isLight ? '#F1EAD8' : colors.cardBorder,
                              },
                            ]}
                            onPress={() => setDraftFilters((prev) => ({ ...prev, rating: rt.key }))}
                          >
                            <Text style={[styles.filterPillText, { color: isSelected ? '#0F172A' : colors.text }]}>
                              {rt.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>

              {/* Accordion 5: AVAILABILITY & SPEED */}
              <View style={[styles.accordionSection, { borderBottomColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.06)' }]}>
                <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleAccordion('avail')}>
                  <View style={styles.accordionTitleRow}>
                    <Icons.Zap color="#F5B800" size={16} />
                    <Text style={[styles.accordionTitle, { color: colors.text }]}>Availability & Delivery</Text>
                  </View>
                  <View style={styles.accordionRightRow}>
                    <Text style={styles.accordionPreviewText}>
                      {draftFilters.availability.length > 0 ? `${draftFilters.availability.length} selected` : 'All'}
                    </Text>
                    {expandedSection === 'avail' ? (
                      <Icons.ChevronUp color={colors.text} size={16} />
                    ) : (
                      <Icons.ChevronDown color={colors.text} size={16} />
                    )}
                  </View>
                </TouchableOpacity>

                {expandedSection === 'avail' && (
                  <View style={styles.accordionContent}>
                    {[
                      { key: 'available_now', label: 'Available Now / Open' },
                      { key: 'in_stock', label: 'In Stock' },
                      { key: 'instant_booking', label: 'Instant Booking' },
                      { key: 'fast_delivery', label: 'Express Delivery (<30 mins)' },
                      { key: 'pickup_available', label: 'Store Pickup Available' },
                    ].map((av) => {
                      const isChecked = draftFilters.availability.includes(av.key);
                      return (
                        <TouchableOpacity
                          key={av.key}
                          style={styles.checkboxItem}
                          onPress={() => {
                            setDraftFilters((prev) => ({
                              ...prev,
                              availability: isChecked
                                ? prev.availability.filter((x) => x !== av.key)
                                : [...prev.availability, av.key],
                            }));
                          }}
                        >
                          <View style={[styles.checkboxBox, isChecked && styles.checkboxBoxActive]}>
                            {isChecked && <Icons.Check color="#0F172A" size={12} />}
                          </View>
                          <Text style={[styles.checkboxText, { color: colors.text }]}>{av.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Accordion 6: DISTANCE */}
              <View style={[styles.accordionSection, { borderBottomColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.06)' }]}>
                <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleAccordion('distance')}>
                  <View style={styles.accordionTitleRow}>
                    <Icons.Navigation color="#F5B800" size={16} />
                    <Text style={[styles.accordionTitle, { color: colors.text }]}>Distance / Proximity</Text>
                  </View>
                  <View style={styles.accordionRightRow}>
                    <Text style={styles.accordionPreviewText}>{draftFilters.distance === 'all' ? 'Any' : draftFilters.distance}</Text>
                    {expandedSection === 'distance' ? (
                      <Icons.ChevronUp color={colors.text} size={16} />
                    ) : (
                      <Icons.ChevronDown color={colors.text} size={16} />
                    )}
                  </View>
                </TouchableOpacity>

                {expandedSection === 'distance' && (
                  <View style={styles.accordionContent}>
                    <View style={styles.filterPillsRow}>
                      {[
                        { key: 'all', label: 'Any Distance' },
                        { key: '1km', label: 'Within 1 km' },
                        { key: '3km', label: 'Within 3 km' },
                        { key: '5km', label: 'Within 5 km' },
                        { key: '10km', label: 'Within 10 km' },
                      ].map((dist) => {
                        const isSelected = draftFilters.distance === dist.key;
                        return (
                          <TouchableOpacity
                            key={dist.key}
                            style={[
                              styles.filterPill,
                              {
                                backgroundColor: isSelected ? '#F5B800' : isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
                                borderColor: isSelected ? '#F5B800' : isLight ? '#F1EAD8' : colors.cardBorder,
                              },
                            ]}
                            onPress={() => setDraftFilters((prev) => ({ ...prev, distance: dist.key }))}
                          >
                            <Text style={[styles.filterPillText, { color: isSelected ? '#0F172A' : colors.text }]}>
                              {dist.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Sticky Modal Footer */}
            <View style={[styles.modalFooterRow, { borderTopColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.08)' }]}>
              <TouchableOpacity style={[styles.resetBtn, { borderColor: isLight ? '#CBD5E1' : colors.cardBorder }]} onPress={handleResetFilters}>
                <Text style={[styles.resetBtnText, { color: colors.text }]}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyFilters}>
                <Text style={styles.applyBtnText}>
                  Apply Filters • {draftResultCount} {draftResultCount === 1 ? 'Result' : 'Results'}
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
  headerWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    maxWidth: 135,
    height: 32,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    minWidth: 13,
    height: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  searchAndFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 6,
    height: 42,
    borderWidth: 1.2,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '500',
    paddingVertical: 0,
  },
  micBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineListeningRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 24,
    paddingLeft: 2,
    paddingRight: 6,
  },
  waveBar: {
    width: 3.5,
    backgroundColor: '#F5B800',
    borderRadius: 2,
  },
  listeningText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#F5B800',
    letterSpacing: 0.3,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1.2,
    gap: 6,
    position: 'relative',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterCountBadge: {
    backgroundColor: '#F5B800',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountText: {
    color: '#0F172A',
    fontSize: 9,
    fontWeight: 'bold',
  },
  activeChipsContainer: {
    paddingTop: 8,
    gap: 6,
    alignItems: 'center',
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF9E7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeFilterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'capitalize',
  },
  clearAllChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearAllChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  voiceErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 184, 0, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 6,
    gap: 6,
  },
  voiceErrorText: {
    flex: 1,
    fontSize: 11.5,
    color: '#F5B800',
    fontWeight: '600',
  },
  voiceRetryBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#F5B800',
    borderRadius: 4,
  },
  voiceRetryBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  topSliderWrapper: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  topSliderContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  topSliderBtn: {
    alignItems: 'center',
    width: 64,
  },
  topIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  topLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  topLabelActive: {
    fontWeight: '800',
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  leftSidebar: {
    width: 100,
    borderRightWidth: 1,
  },
  leftSidebarItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  activeSidebarIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3.5,
    borderRadius: 2,
  },
  leftSidebarText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  rightContent: {
    flex: 1,
  },
  rightHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resultCountText: {
    fontSize: 11,
    fontWeight: '500',
  },
  subcatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  subcatCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1.5,
  },
  subcatCardImage: {
    width: '100%',
    height: 80,
    backgroundColor: '#E2E8F0',
  },
  subcatCardDetails: {
    padding: 8,
  },
  subcatCardTitle: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  subcatCardCount: {
    fontSize: 9.5,
    fontWeight: '500',
  },
  ratingBadgeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(245, 184, 0, 0.15)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  ratingBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyGrid: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 11.5,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyResetBtn: {
    backgroundColor: '#F5B800',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyResetBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 30, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingTop: 18,
    paddingBottom: 28,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  modalHeaderSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  accordionSection: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accordionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  accordionRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accordionPreviewText: {
    fontSize: 11.5,
    color: '#D97706',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  accordionContent: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  radioItemSelected: {
    backgroundColor: 'rgba(245, 184, 0, 0.08)',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#F5B800',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#F5B800',
  },
  radioText: {
    fontSize: 13,
    fontWeight: '500',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxActive: {
    backgroundColor: '#F5B800',
    borderColor: '#F5B800',
  },
  checkboxText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  modalFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  resetBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  applyBtn: {
    flex: 2,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F5B800',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
});
