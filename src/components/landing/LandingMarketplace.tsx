import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
  Pressable,
} from 'react-native';
import * as Icons from 'lucide-react-native';
import GlassCard from '../GlassCard';
import { useThemeStore } from '../../store/themeStore';

const { width } = Dimensions.get('window');

export interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice: string;
  discount: string;
  rating: string;
  image: string;
  description: string;
}

interface LandingMarketplaceProps {
  onProductPress: (product: Product) => void;
  onCategoryPress: (categoryName: string) => void;
  onSearchPress: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  likedItems: string[];
  onToggleLike: (id: string) => void;
}

const CATEGORIES = [
  { name: 'All', icon: 'Grid', color: '#00E676' },
  { name: 'Services', icon: 'Wrench', color: '#FF2E93' },
  { name: 'Products', icon: 'ShoppingBag', color: '#9C27B0' },
  { name: 'Daily Needs', icon: 'Milk', color: '#00BCD4' },
  { name: 'Food', icon: 'Utensils', color: '#39FF14' },
  { name: 'Stay', icon: 'Bed', color: '#FF9100' },
  { name: 'Travel', icon: 'Plane', color: '#F4C400' },
  { name: 'Jobs', icon: 'Briefcase', color: '#E040FB' },
];

export const PRODUCTS = [
  {
    id: '1',
    name: 'Rugged Kickstand Case',
    price: '₹149',
    originalPrice: '₹499',
    discount: '70% OFF',
    rating: '4.5',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&auto=format&fit=crop&q=80',
    description: 'Heavy duty drop protection with built-in adjustable kickstand for hands-free viewing.',
  },
  {
    id: '2',
    name: 'Modern Casual Hoodie',
    price: '₹313',
    originalPrice: '₹999',
    discount: '68% OFF',
    rating: '4.3',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&auto=format&fit=crop&q=80',
    description: 'Soft, premium cotton blend hoodie with front pouch pocket and adjustable drawstring hood.',
  },
  {
    id: '3',
    name: 'Ethnic Kurti & Dress Set',
    price: '₹392',
    originalPrice: '₹1,299',
    discount: '70% OFF',
    rating: '4.7',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&auto=format&fit=crop&q=80',
    description: 'Beautifully embroidered traditional kurti paired with comfortable matching trousers.',
  },
  {
    id: '4',
    name: 'Designer Silk Lehenga',
    price: '₹316',
    originalPrice: '₹999',
    discount: '68% OFF',
    rating: '4.6',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&auto=format&fit=crop&q=80',
    description: 'Elegant designer lehenga featuring intricate gold embroidery and premium silk fabric.',
  },
  {
    id: '5',
    name: "Men's Slim Fit Shirt",
    price: '₹176',
    originalPrice: '₹599',
    discount: '70% OFF',
    rating: '4.2',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&auto=format&fit=crop&q=80',
    description: 'Classic cotton slim-fit button-down shirt. Perfect for smart-casual and formal wear.',
  },
  {
    id: '6',
    name: 'Traditional Saree',
    price: '₹300',
    originalPrice: '₹899',
    discount: '66% OFF',
    rating: '4.4',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=300&auto=format&fit=crop&q=80',
    description: 'Exquisite handwoven traditional saree with gold zari border. Perfect for festive occasions.',
  },
  {
    id: '7',
    name: 'Bluetooth Neckband',
    price: '₹150',
    originalPrice: '₹499',
    discount: '70% OFF',
    rating: '4.1',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80',
    description: 'Ergonomic wireless neckband with up to 20 hours battery life and heavy bass.',
  },
  {
    id: '8',
    name: 'Silver Stud Earrings',
    price: '₹78',
    originalPrice: '₹249',
    discount: '68% OFF',
    rating: '4.5',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&auto=format&fit=crop&q=80',
    description: '925 sterling silver minimalist stud earrings, hypoallergenic and perfect for daily wear.',
  },
  {
    id: 's1',
    name: 'Doctor Consultation (Hospital)',
    price: '₹500',
    originalPrice: '₹1,000',
    discount: '50% OFF',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&auto=format&fit=crop&q=80',
    description: 'Book consultation with expert general physician and cardiologists.',
  },
  {
    id: 's2',
    name: 'Professional Plumber & Electrician',
    price: '₹250',
    originalPrice: '₹500',
    discount: '50% OFF',
    rating: '4.7',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&auto=format&fit=crop&q=80',
    description: 'Verified plumbers and electricians for all household repairs and installations.',
  },
  {
    id: 'd1',
    name: 'Premium Basmati Rice (5kg)',
    price: '₹750',
    originalPrice: '₹999',
    discount: '25% OFF',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=80',
    description: 'Long grain aromatic basmati rice for daily premium dishes.',
  },
  {
    id: 'd2',
    name: 'Organic Fresh Milk (1L)',
    price: '₹78',
    originalPrice: '₹120',
    discount: '35% OFF',
    rating: '4.6',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&auto=format&fit=crop&q=80',
    description: 'Pure organic milk from local dairy farms, pasteurized and healthy.',
  },
  {
    id: 'f1',
    name: 'Gourmet Double Truffle Burger',
    price: '₹420',
    originalPrice: '₹600',
    discount: '30% OFF',
    rating: '4.8',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80',
    description: 'Double cheese truffle oil double meat patty gourmet burger.',
  },
  {
    id: 'f2',
    name: 'Woodfired Margherita Pizza',
    price: '₹350',
    originalPrice: '₹500',
    discount: '30% OFF',
    rating: '4.7',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80',
    description: 'Classic cheese and fresh basil woodfired Italian style pizza.',
  },
  {
    id: 'st1',
    name: 'Royal Heritage Suite Stay',
    price: '₹4,999',
    originalPrice: '₹9,999',
    discount: '50% OFF',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&auto=format&fit=crop&q=80',
    description: 'Luxury suite room stay with pool access and complementary breakfast.',
  },
  {
    id: 'tr1',
    name: 'Premium Airport Lounge Ticket',
    price: '₹800',
    originalPrice: '₹1,500',
    discount: '46% OFF',
    rating: '4.6',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&auto=format&fit=crop&q=80',
    description: 'VIP airport business lounge pass with buffet meals and wifi.',
  },
];

export default function LandingMarketplace({
  onProductPress,
  onCategoryPress,
  onSearchPress,
  searchQuery,
  setSearchQuery,
  likedItems,
  onToggleLike,
}: LandingMarketplaceProps) {
  const colors = useThemeStore((state) => state.colors);
  const themeMode = useThemeStore((state) => state.themeMode);
  const [selectedCat, setSelectedCat] = React.useState<string>('All');

  const filteredProducts = PRODUCTS.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || prod.id.includes(searchQuery);
    if (!matchesSearch) return false;

    if (selectedCat === 'All') return true;
    
    // Check key prefixes to determine category filter matches
    if (selectedCat === 'Services') return prod.id.startsWith('s') && !prod.id.startsWith('st');
    if (selectedCat === 'Daily Needs') return prod.id.startsWith('d');
    if (selectedCat === 'Food') return prod.id.startsWith('f');
    if (selectedCat === 'Stay') return prod.id.startsWith('st');
    if (selectedCat === 'Travel') return prod.id.startsWith('tr');
    if (selectedCat === 'Products') return !['s', 'd', 'f', 'st', 'tr'].some(prefix => prod.id.startsWith(prefix));

    return true;
  });

  const renderIcon = (iconName: string, color: string, size = 20) => {
    const IconComp = (Icons as any)[iconName];
    if (!IconComp) return <Icons.HelpCircle color={color} size={size} />;
    return <IconComp color={color} size={size} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>


      {/* 2. Promo Coupon Banner */}
      <Pressable 
        style={styles.bannerContainer}
        onPress={onSearchPress}
      >
        {({ pressed }) => (
          <GlassCard 
            style={[
              styles.bannerCard, 
              { 
                backgroundColor: colors.background === '#F8FAFC' 
                  ? (pressed ? '#F1F5F9' : '#FFFFFF') 
                  : (pressed ? 'rgba(76, 175, 80, 0.18)' : 'rgba(76, 175, 80, 0.08)'),
                borderColor: colors.background === '#F8FAFC' ? colors.cardBorder : 'rgba(76, 175, 80, 0.2)',
              }
            ]}
          >
            <View style={styles.bannerLeft}>
              <Text style={[styles.bannerBadgeText, { color: colors.background === '#F8FAFC' ? '#1B5E20' : '#4CAF50' }]}>Upto</Text>
              <View style={styles.discountRow}>
                <Text style={[styles.bannerDiscount, { color: colors.text }]}>₹60 OFF</Text>
                <Text style={[styles.bannerSubText, { color: colors.background === '#F8FAFC' ? '#334155' : 'rgba(255, 255, 255, 0.7)', fontSize: 13, fontWeight: 'bold' }]}>on 1st order</Text>
              </View>
            </View>
            <View style={styles.bannerRight}>
              <Icons.Gift color={colors.background === '#F8FAFC' ? '#1B5E20' : '#4CAF50'} size={32} />
            </View>
          </GlassCard>
        )}
      </Pressable>

      {/* 3. Promotional Trust Badges */}
      <View style={styles.badgesRow}>
        <View style={styles.badgeCol}>
          <View style={[styles.badgeIconCircle, { backgroundColor: 'rgba(233, 30, 99, 0.15)' }]}>
            <Icons.RotateCcw color="#E91E63" size={16} />
          </View>
          <View style={styles.badgeTexts}>
            <Text style={[styles.badgeTitle, { color: colors.text }]}>7 Days</Text>
            <Text style={[styles.badgeSub, { color: colors.grayLight }]}>Easy Return</Text>
          </View>
        </View>
        
        <View style={styles.badgeCol}>
          <View style={[styles.badgeIconCircle, { backgroundColor: 'rgba(156, 39, 176, 0.15)' }]}>
            <Icons.Banknote color="#9C27B0" size={16} />
          </View>
          <View style={styles.badgeTexts}>
            <Text style={[styles.badgeTitle, { color: colors.text }]}>Cash on</Text>
            <Text style={[styles.badgeSub, { color: colors.grayLight }]}>Delivery</Text>
          </View>
        </View>

        <View style={styles.badgeCol}>
          <View style={[styles.badgeIconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
            <Icons.Tag color="#4CAF50" size={16} />
          </View>
          <View style={styles.badgeTexts}>
            <Text style={[styles.badgeTitle, { color: colors.text }]}>Lowest</Text>
            <Text style={[styles.badgeSub, { color: colors.grayLight }]}>Price</Text>
          </View>
        </View>
      </View>

      {/* 4. Two-Row Categories Grid */}
      <View style={styles.categoriesSection}>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((cat, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.categoryGridItem} 
              activeOpacity={0.7}
              onPress={() => setSelectedCat(cat.name === 'All' ? 'All' : (selectedCat === cat.name ? 'All' : cat.name))}
            >
              <View style={[
                styles.categoryCircle, 
                { borderColor: cat.color },
                selectedCat === cat.name && { backgroundColor: `${cat.color}20`, borderWidth: 2 }
              ]}>
                {renderIcon(cat.icon, cat.color, 22)}
              </View>
              <Text style={[
                styles.categoryLabel,
                { color: colors.grayLight },
                selectedCat === cat.name && { color: cat.color, fontWeight: 'bold' }
              ]} numberOfLines={1}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 5. Product Grid Header */}
      <View style={styles.gridHeader}>
        <Text style={[styles.gridTitle, { color: colors.text }]}>TRENDING DEALS</Text>
        <TouchableOpacity onPress={onSearchPress}>
          <Text style={[styles.viewAllBtn, { color: colors.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* 6. Product Masonry/Grid Layout */}
      <View style={styles.productGrid}>
        {filteredProducts.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Icons.Search color={colors.grayLight} size={32} />
            <Text style={[styles.noResultsText, { color: colors.grayLight }]}>No products found matching "{searchQuery}"</Text>
          </View>
        ) : (
          filteredProducts.map((prod) => (
            <TouchableOpacity 
              key={prod.id} 
              style={styles.productCard}
              activeOpacity={0.95}
              onPress={() => onProductPress(prod)}
            >
              <GlassCard style={styles.cardGlass}>
                <View style={[styles.imageContainer, { backgroundColor: colors.grayDark }]}>
                  <Image source={{ uri: prod.image }} style={styles.productImage} />
                  <View style={styles.ratingBadge}>
                    <Icons.Star color="#F4C400" size={9} fill="#F4C400" />
                    <Text style={styles.ratingText}> {prod.rating}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.likeBtn} 
                    activeOpacity={0.7}
                    onPress={() => onToggleLike(prod.id)}
                  >
                    <Icons.Heart 
                      color={likedItems.includes(prod.id) ? "#FF2E93" : "#FFF"} 
                      size={12} 
                      fill={likedItems.includes(prod.id) ? "#FF2E93" : "transparent"} 
                    />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>{prod.name}</Text>
                  
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceText, { color: colors.primary }]}>{prod.price}</Text>
                    <Text style={[styles.originalPriceText, { color: colors.grayLight }]}>{prod.originalPrice}</Text>
                  </View>

                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{prod.discount}</Text>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))
        )}
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 80,
    backgroundColor: '#030814',
  },

  bannerContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 20,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.06)',
    borderColor: 'rgba(76, 175, 80, 0.25)',
    borderWidth: 1,
  },
  bannerLeft: {
    flex: 1,
  },
  bannerBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#4CAF50',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
    gap: 6,
  },
  bannerDiscount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  bannerSubText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  bannerRight: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  badgeCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    gap: 8,
  },
  badgeIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTexts: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badgeSub: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 1,
  },
  categoriesSection: {
    marginBottom: 22,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
    rowGap: 16,
    columnGap: 12,
  },
  categoryGridItem: {
    alignItems: 'center',
    width: (width - 32 - 36) / 4,
  },
  categoryCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
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
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1.5,
  },
  viewAllBtn: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 28) / 2,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  cardGlass: {
    padding: 0,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#0D1636',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(5, 11, 30, 0.85)',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  likeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(5, 11, 30, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
    gap: 6,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F4C400',
  },
  originalPriceText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.35)',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    marginTop: 6,
    backgroundColor: 'rgba(233, 30, 99, 0.12)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  noResultsContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  noResultsText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    textAlign: 'center',
  },
});
