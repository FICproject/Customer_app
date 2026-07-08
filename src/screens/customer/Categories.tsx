import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, useWindowDimensions, Image, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Icons from 'lucide-react-native';
import { SIDEBAR_DATA } from './sidebarData';
import GlassCard from '../../components/GlassCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '../../store/cartStore';
import CartModal from '../../components/CartModal';
import { useThemeStore } from '../../store/themeStore';



// Category icons for top bar slider
const TOP_SLIDER_CATEGORIES = [
  { name: 'All', icon: 'Grid', key: 'All' },
  { name: 'Products', icon: 'ShoppingBag', key: 'Product' },
  { name: 'Services', icon: 'Wrench', key: 'Services' },
  { name: 'Daily Needs', icon: 'Milk', key: 'Daily Needs' },
  { name: 'Food', icon: 'Utensils', key: 'Food' },
  { name: 'Stay', icon: 'Bed', key: 'Stay' },
  { name: 'Travel', icon: 'Plane', key: 'Travel' },
  { name: 'Jobs', icon: 'Briefcase', key: 'Job' },
];

// Map subcategory names ("second category") to illustrations for a visual grid
const SUBCAT_IMAGES: Record<string, string> = {
  // Products
  Electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=60',
  'IT & Office': 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=150&auto=format&fit=crop&q=60',
  'Home Appliances': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150&auto=format&fit=crop&q=60',
  Furniture: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=150&auto=format&fit=crop&q=60',
  Fashion: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=150&auto=format&fit=crop&q=60',
  Beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=150&auto=format&fit=crop&q=60',
  'Baby Care': 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=150&auto=format&fit=crop&q=60',
  'Sports & Fitness': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&auto=format&fit=crop&q=60',
  Books: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=150&auto=format&fit=crop&q=60',
  Gaming: 'https://images.unsplash.com/photo-1385846882-47137b678fae?w=150&auto=format&fit=crop&q=60',
  Automobile: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=150&auto=format&fit=crop&q=60',
  'Home & Kitchen': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150&auto=format&fit=crop&q=60',
  // Services
  Healthcare: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=150&auto=format&fit=crop&q=60',
  Education: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=150&auto=format&fit=crop&q=60',
  Employment: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=150&auto=format&fit=crop&q=60',
  'Home Services': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&auto=format&fit=crop&q=60',
  // Daily Needs
  Grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=60',
  'Fruits & Vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150&auto=format&fit=crop&q=60',
  Dairy: 'https://images.unsplash.com/photo-1528750901443-e98fdc48a49a?w=150&auto=format&fit=crop&q=60',
  // Food
  Restaurants: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=60',
  'Fast Food': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=60',
  Cafes: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&auto=format&fit=crop&q=60',
  // Stay
  Hotels: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&auto=format&fit=crop&q=60',
  Resorts: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=150&auto=format&fit=crop&q=60',
  // Travel
  'Flight Booking': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=150&auto=format&fit=crop&q=60',
};

// Map individual leaf items ("last category") to premium illustrations for the details list grid
const ITEM_IMAGES: Record<string, string> = {
  // Electronics
  Smartphones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&auto=format&fit=crop&q=60',
  Tablets: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=150&auto=format&fit=crop&q=60',
  Laptops: 'https://images.unsplash.com/photo-1496181130204-7552cc15545a?w=150&auto=format&fit=crop&q=60',
  'Desktop Computers': 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=150&auto=format&fit=crop&q=60',
  'Smart Watches': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=150&auto=format&fit=crop&q=60',
  Headphones: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=150&auto=format&fit=crop&q=60',
  Earbuds: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=150&auto=format&fit=crop&q=60',
  Speakers: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=150&auto=format&fit=crop&q=60',
  Cameras: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=150&auto=format&fit=crop&q=60',
  Printers: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=150&auto=format&fit=crop&q=60',
  
  // Healthcare
  Hospitals: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop&q=60',
  Clinics: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150&auto=format&fit=crop&q=60',
  'Diagnostic Centers': 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?w=150&auto=format&fit=crop&q=60',
  Pharmacies: 'https://images.unsplash.com/photo-1607619056574-7b8f304b3b3a?w=150&auto=format&fit=crop&q=60',
  
  // Home Services
  Electrician: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&auto=format&fit=crop&q=60',
  Plumber: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=150&auto=format&fit=crop&q=60',
  Carpenter: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=150&auto=format&fit=crop&q=60',
  
  // Food
  Burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=60',
  Pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&auto=format&fit=crop&q=60',
  Sandwiches: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=150&auto=format&fit=crop&q=60',
};

// Fallback image url
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=150&auto=format&fit=crop&q=60';

export default function Categories() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const colors = useThemeStore((state) => state.colors);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [filterSortOrder, setFilterSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Cart Store State
  const [isCartVisible, setIsCartVisible] = useState(false);
  const cartItems = useCartStore((state) => state.cartItems);
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Helper to map Sidebar keys to user-facing category route name
  const getMappedCategoryRoute = (key: string) => {
    if (key === 'Product') return 'Products';
    if (key === 'Job') return 'Jobs';
    return key;
  };

  // Find parent main category key containing a specific subcategory
  const findParentCategoryKey = (subcatName: string): string => {
    let found = 'Product';
    Object.keys(SIDEBAR_DATA).forEach((catKey) => {
      if (SIDEBAR_DATA[catKey].subcategories && SIDEBAR_DATA[catKey].subcategories[subcatName]) {
        found = catKey;
      }
    });
    return found;
  };

  // Sidebar items list (displays the "second category" subcategories dynamically)
  const getLeftSidebarItems = () => {
    const items = [{ name: 'All Categories', key: 'All' }];
    
    if (selectedMainCategory === 'All') {
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
      const catData = SIDEBAR_DATA[selectedMainCategory];
      if (catData && catData.subcategories) {
        Object.keys(catData.subcategories).forEach((subName) => {
          items.push({ name: subName, key: subName });
        });
      }
    }
    
    return items;
  };

  // Compile items/categories for the right panel based on sidebar selection & search query
  const getRightPanelItems = () => {
    const query = searchQuery.toLowerCase().trim();

    if (selectedSubcategory === 'All') {
      // Show subcategories in the grid (Second Category)
      const list: Array<{
        type: 'subcategory';
        categoryKey: string;
        categoryName: string;
        name: string;
        count: string;
        image: string;
      }> = [];

      Object.keys(SIDEBAR_DATA).forEach((catKey) => {
        if (selectedMainCategory !== 'All' && catKey !== selectedMainCategory) return;

        const catData = SIDEBAR_DATA[catKey];
        const categoryName = getMappedCategoryRoute(catKey);

        if (catData.subcategories) {
          const subNames = Object.keys(catData.subcategories);
          // Show all subcategories under the main categories
          const subsToShow = subNames;

          subsToShow.forEach((subName) => {
            const subData = catData.subcategories[subName];
            if (
              !query ||
              subName.toLowerCase().includes(query) ||
              categoryName.toLowerCase().includes(query)
            ) {
              const imgUri = SUBCAT_IMAGES[subName] || DEFAULT_IMAGE;
              list.push({
                type: 'subcategory',
                categoryKey: catKey,
                categoryName,
                name: subName,
                count: `${(subData.items?.length || 0) * 150 + 200}+ Items`,
                image: imgUri,
              });
            }
          });
        }
      });

      if (filterSortOrder === 'asc') {
        list.sort((a, b) => a.name.localeCompare(b.name));
      } else if (filterSortOrder === 'desc') {
        list.sort((a, b) => b.name.localeCompare(a.name));
      }
      return list;
    } else {
      // Show individual items (the "last category" leaf items) inside the selected subcategory
      const list: Array<{
        type: 'item';
        categoryKey: string;
        categoryName: string;
        subcategoryName: string;
        name: string;
        count: string;
        image: string;
      }> = [];

      const parentKey = selectedMainCategory === 'All' ? findParentCategoryKey(selectedSubcategory) : selectedMainCategory;
      const catData = SIDEBAR_DATA[parentKey];
      const categoryName = getMappedCategoryRoute(parentKey);

      if (catData && catData.subcategories && catData.subcategories[selectedSubcategory]) {
        const subData = catData.subcategories[selectedSubcategory];
        if (subData.items) {
          subData.items.forEach((item: string) => {
            if (!query || item.toLowerCase().includes(query)) {
              const imgUri = ITEM_IMAGES[item] || DEFAULT_IMAGE;
              list.push({
                type: 'item',
                categoryKey: parentKey,
                categoryName,
                subcategoryName: selectedSubcategory,
                name: item,
                count: 'View Listings ❯',
                image: imgUri,
              });
            }
          });
        }
      }

      if (filterSortOrder === 'asc') {
        list.sort((a, b) => a.name.localeCompare(b.name));
      } else if (filterSortOrder === 'desc') {
        list.sort((a, b) => b.name.localeCompare(a.name));
      }
      return list;
    }
  };

  const handleTopCategoryPress = (key: string) => {
    setSelectedMainCategory(key);
    setSelectedSubcategory('All');
  };

  const renderTopIcon = (iconName: string, color = '#FFFFFF') => {
    const IconComp = (Icons as any)[iconName] || Icons.HelpCircle;
    return <IconComp color={color} size={18} />;
  };

  const handleCardPress = (card: any) => {
    if (card.type === 'subcategory') {
      setSelectedSubcategory(card.name);
    } else {
      navigation.navigate('CategoryDetails', {
        categoryName: card.categoryName,
        subCategoryName: card.subcategoryName,
        selectedItem: card.name,
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Location & Title Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity style={styles.locationSelector} activeOpacity={0.7} onPress={() => navigation.navigate('LocationSelection')}>
          <Icons.MapPin color={colors.primary} size={14} />
          <Text style={[styles.locationText, { color: colors.text }]}>Bangalore</Text>
          <Icons.ChevronDown color={colors.text} size={12} style={{ opacity: 0.6 }} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>Categories</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} onPress={() => setIsCartVisible(true)}>
            <Icons.ShoppingCart color={colors.text} size={18} />
            {totalCartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalCartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Notifications')}>
            <Icons.Bell color={colors.text} size={18} />
            <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input & Filter Bar */}
      <View style={styles.searchBarRow}>
        <View style={[styles.searchInputWrapper, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Icons.Search color={colors.text} size={16} style={{ opacity: 0.4 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for products, services, food..."
            placeholderTextColor={colors.background === '#F8FAFC' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.4)'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Icons.Mic color={colors.text} size={16} style={{ opacity: 0.4 }} />
        </View>
        <TouchableOpacity 
          style={[styles.filterBtn, { 
            backgroundColor: colors.background === '#F8FAFC' ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.06)',
            borderColor: colors.background === '#F8FAFC' ? 'rgba(15, 23, 42, 0.1)' : 'rgba(255, 255, 255, 0.08)'
          }]} 
          activeOpacity={0.8} 
          onPress={() => setIsFilterModalOpen(true)}
        >
          <Icons.Sliders color={colors.text} size={14} style={{ marginRight: 4 }} />
          <Text style={[styles.filterBtnText, { color: colors.text }]}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Top Capsule Horizontal Slider */}
      <View style={styles.topSliderWrapper}>
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
                <View style={[styles.topIconCircle, isActive && styles.topIconCircleActive]}>
                  {renderTopIcon(item.icon, isActive ? '#050B1E' : colors.primary)}
                </View>
                <Text style={[styles.topLabel, { color: colors.text }, isActive && styles.topLabelActive]}>{item.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Categories Section (Left Sidebar + Right Grid) */}
      <View style={styles.mainLayout}>
        {/* Left Sidebar Menu (Second Category Selection) */}
        <View style={[styles.leftSidebar, { backgroundColor: colors.background, borderRightColor: colors.cardBorder }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
            {getLeftSidebarItems().map((item) => {
              const isActive = selectedSubcategory === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.leftSidebarItem, isActive && styles.leftSidebarItemActive]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedSubcategory(item.key)}
                >
                  {isActive && <View style={[styles.activeSidebarIndicator, { backgroundColor: colors.primary }]} />}
                  <Text style={[styles.leftSidebarText, { color: colors.text }, isActive && styles.leftSidebarTextActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right Grid Section (Showing Second Category Subcat Grid or Last Category Item Grid) */}
        <View style={styles.rightContent}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12, paddingBottom: 60 }}>
            <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>
              {selectedSubcategory === 'All' ? 'Top Categories' : selectedSubcategory}
            </Text>
            
            <View style={styles.subcatGrid}>
              {getRightPanelItems().map((card, idx) => {
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.subcatCard, { width: (width - 132 - 10) / 2, backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
                    activeOpacity={0.8}
                    onPress={() => handleCardPress(card)}
                  >
                    <Image source={{ uri: card.image }} style={styles.subcatCardImage} />
                    <View style={styles.subcatCardDetails}>
                      <Text style={[styles.subcatCardTitle, { color: colors.text }]} numberOfLines={1}>{card.name}</Text>
                      <Text style={styles.subcatCardCount}>
                        {card.count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Request Unlisted Item Banner */}
            <GlassCard style={styles.requestBanner}>
              <View style={styles.requestBannerLeft}>
                <View style={styles.requestIconCircle}>
                  <Icons.Gift color={colors.primary} size={16} />
                </View>
                <View>
                  <Text style={[styles.requestTitle, { color: colors.text }]}>Can't find what you need?</Text>
                  <Text style={[styles.requestSub, { color: colors.text, opacity: 0.6 }]}>Let us help you find the best.</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.requestBtn} activeOpacity={0.8} onPress={() => Alert.alert('Request Now', 'Submit details for personalized service.')}>
                <Text style={styles.requestBtnText}>Request Now</Text>
              </TouchableOpacity>
            </GlassCard>
          </ScrollView>
        </View>
      </View>

      {/* Cart Modal Dialog Sheet */}
      <CartModal 
        visible={isCartVisible}
        onClose={() => setIsCartVisible(false)}
        navigation={navigation}
      />

      {/* Filter Bottom Sheet / Modal */}
      <Modal
        visible={isFilterModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <GlassCard style={[styles.modalCard, { backgroundColor: colors.background === '#F8FAFC' ? '#FFFFFF' : '#0B1530', borderColor: colors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setIsFilterModalOpen(false)} style={styles.modalCloseBtn}>
                <Icons.X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={[styles.modalSectionTitle, { color: colors.primary }]}>SORT ALPHABETICALLY</Text>
              
              <TouchableOpacity 
                style={[styles.filterOption, { borderColor: colors.cardBorder }, filterSortOrder === 'asc' && { backgroundColor: 'rgba(244, 196, 0, 0.1)' }]}
                onPress={() => {
                  setFilterSortOrder('asc');
                  setIsFilterModalOpen(false);
                }}
              >
                <Icons.SortAsc color={filterSortOrder === 'asc' ? colors.primary : colors.text} size={18} />
                <Text style={[styles.filterOptionText, { color: colors.text }, filterSortOrder === 'asc' && { color: colors.primary, fontWeight: 'bold' }]}>
                  Alphabetical: A to Z
                </Text>
                {filterSortOrder === 'asc' && <Icons.Check color={colors.primary} size={16} />}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.filterOption, { borderColor: colors.cardBorder }, filterSortOrder === 'desc' && { backgroundColor: 'rgba(244, 196, 0, 0.1)' }]}
                onPress={() => {
                  setFilterSortOrder('desc');
                  setIsFilterModalOpen(false);
                }}
              >
                <Icons.SortDesc color={filterSortOrder === 'desc' ? colors.primary : colors.text} size={18} />
                <Text style={[styles.filterOptionText, { color: colors.text }, filterSortOrder === 'desc' && { color: colors.primary, fontWeight: 'bold' }]}>
                  Alphabetical: Z to A
                </Text>
                {filterSortOrder === 'desc' && <Icons.Check color={colors.primary} size={16} />}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.filterOption, { borderColor: colors.cardBorder }, filterSortOrder === 'none' && { backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}
                onPress={() => {
                  setFilterSortOrder('none');
                  setIsFilterModalOpen(false);
                }}
              >
                <Icons.XCircle color={colors.text} size={18} />
                <Text style={[styles.filterOptionText, { color: colors.text }]}>
                  Reset / Clear Sort
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerBtn: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
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
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 38,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    marginHorizontal: 8,
    paddingVertical: 0,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 38,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  topSliderWrapper: {
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    paddingBottom: 10,
  },
  topSliderContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  topSliderBtn: {
    alignItems: 'center',
    width: 62,
  },
  topIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(244, 196, 0, 0.2)',
    marginBottom: 6,
  },
  topIconCircleActive: {
    backgroundColor: '#F4C400',
    borderColor: '#F4C400',
  },
  topLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'center',
  },
  topLabelActive: {
    color: '#F4C400',
    fontWeight: 'bold',
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  leftSidebar: {
    width: 100,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  leftSidebarItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
  },
  leftSidebarItemActive: {
    backgroundColor: 'rgba(244, 196, 0, 0.04)',
  },
  activeSidebarIndicator: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    backgroundColor: '#F4C400',
    borderRadius: 2,
  },
  leftSidebarText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    fontWeight: '700',
  },
  leftSidebarTextActive: {
    color: '#F4C400',
    fontWeight: '900',
  },
  rightContent: {
    flex: 1,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  subcatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  subcatCard: {
    backgroundColor: 'rgba(13, 22, 54, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  subcatCardImage: {
    width: '100%',
    height: 75,
    backgroundColor: '#0D1636',
  },
  subcatCardDetails: {
    padding: 8,
  },
  subcatCardTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  subcatCardCount: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 9,
    marginTop: 2,
    fontWeight: '600',
  },
  requestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    padding: 12,
    borderColor: 'rgba(244, 196, 0, 0.1)',
  },
  requestBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(244, 196, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  requestSub: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 9,
    marginTop: 1,
  },
  requestBtn: {
    backgroundColor: '#F4C400',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  requestBtnText: {
    color: '#050B1E',
    fontSize: 9,
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 30, 0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    gap: 12,
  },
  modalSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  filterOptionText: {
    flex: 1,
    fontSize: 13,
  },
});
