import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../../store/themeStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import * as Icons from 'lucide-react-native';
import GlassCard from '../../components/GlassCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function ProductDetails() {
  const { width } = useWindowDimensions();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const colors = useThemeStore((state) => state.colors);
  
  const cartItems = useCartStore((state) => state.cartItems);
  const addToCart = useCartStore((state) => state.addToCart);
  
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const { item, category } = (route.params as any) || {};

  // All hooks MUST be called before any early returns
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState('128GB');
  const [selectedPackage, setSelectedPackage] = useState('Standard');
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  if (!item) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: '#050B1E', paddingTop: insets.top }]}>
        <Text style={{ color: '#FFF' }}>Product details not available.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#F4C400', marginTop: 10 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Define product values
  const title = item.name || item.title || '';
  const fallbackImg = 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=80';
  const imageUri = item.img || item.image || fallbackImg;
  const rating = item.rating || '4.6';
  const ratingCount = item.ratingCount || '1.2k';
  const desc = item.desc || item.description || `${title} — With an all-day battery life and a durable design, it's built to go the distance. The advanced display delivers stunning visuals while the professional-grade systems let you capture stunning photos in any light. Includes gold membership privileges and priority delivery.`;
  
  // Pricing
  const isService = category === 'Services' || category === 'Travel' || category === 'Job' || title.toLowerCase().includes('service') || title.toLowerCase().includes('cleaning') || title.toLowerCase().includes('consultation') || title.toLowerCase().includes('plumber');
  const basePrice = parseInt((item.memberPrice || item.price || '0').replace(/[^\d]/g, ''), 10) || 499;
  const originalBasePrice = parseInt((item.price || '0').replace(/[^\d]/g, ''), 10) || (basePrice + 200);

  // Helper variables
  const isFavorite = wishlistItems.some(i => i.id === item.id);
  const isInCart = cartItems.some(i => i.id === item.id);

  // Dynamic price adjustment based on selector values
  const getProductPrice = () => {
    let multiplier = 1;
    if (selectedStorage === '256GB') multiplier = 1.15;
    if (selectedStorage === '512GB') multiplier = 1.35;
    return Math.round(basePrice * multiplier);
  };

  const getProductOriginalPrice = () => {
    let multiplier = 1;
    if (selectedStorage === '256GB') multiplier = 1.15;
    if (selectedStorage === '512GB') multiplier = 1.35;
    return Math.round(originalBasePrice * multiplier);
  };

  const getServicePrice = () => {
    if (selectedPackage === 'Deep') return Math.round(basePrice * 2);
    if (selectedPackage === 'Premium') return Math.round(basePrice * 3);
    return basePrice;
  };

  const handleAddToCart = () => {
    if (isInCart) {
      Alert.alert('Already in Cart', `"${title}" is already in your cart.`);
      return;
    }
    
    addToCart({
      id: item.id,
      name: title,
      price: `₹${isService ? getServicePrice() : getProductPrice()}`,
      category: category || 'Product',
      image: imageUri,
    });
    Alert.alert('Success', `"${title}" added to cart!`);
  };

  const handleBuyOrBook = () => {
    const finalPrice = isService ? getServicePrice() : getProductPrice();
    Alert.alert(
      'Confirm Booking',
      `Would you like to complete booking for "${title}" at ₹${finalPrice}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            Alert.alert('Success', 'Your booking request has been submitted!');
            navigation.navigate('CustomerTabs', { screen: 'Orders' });
          }
        }
      ]
    );
  };

  // Pre-compiled list of thumbnail modifiers to show variant visuals
  const productThumbnails = [
    imageUri,
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80',
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header bar */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.background, height: 56 + insets.top }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icons.ChevronLeft color={colors.text} size={22} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{isService ? 'Service Details' : 'Product Details'}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerBtn} 
            onPress={() => toggleWishlist({
              id: item.id,
              name: title,
              price: `₹${isService ? getServicePrice() : getProductPrice()}`,
              category: category,
              image: imageUri,
            })}
          >
            <Icons.Heart 
              color={isFavorite ? '#FF2E93' : colors.text} 
              fill={isFavorite ? '#FF2E93' : 'transparent'} 
              size={20} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('CustomerTabs', { screen: 'Cart' })}>
            <Icons.ShoppingCart color={colors.text} size={20} />
            {cartItems.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Dynamic Layout Branching */}
        {!isService ? (
          /* PRODUCT LAYOUT */
          <View>
            {/* Image Slider */}
            <View style={[styles.imageContainer, { width, height: width * 0.8 }]}>
              <Image source={{ uri: productThumbnails[selectedThumb] || imageUri }} style={styles.mainImage} />
              <View style={styles.slideIndicator}>
                <Text style={styles.slideIndicatorText}>{selectedThumb + 1}/{productThumbnails.length}</Text>
              </View>
            </View>

            {/* Thumbnail selector */}
            <View style={styles.thumbRow}>
              {productThumbnails.map((thumb, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.thumbWrapper, selectedThumb === idx && { borderColor: '#E91E63' }]}
                  onPress={() => setSelectedThumb(idx)}
                >
                  <Image source={{ uri: thumb }} style={styles.thumbImg} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Info Container */}
            <View style={styles.infoBlock}>
              <Text style={[styles.productName, { color: colors.text }]}>{title}</Text>

              {/* Rating Row */}
              <View style={styles.metaRow}>
                <View style={styles.ratingBadge}>
                  <Icons.Star color="#F4C400" size={10} fill="#F4C400" />
                  <Text style={styles.ratingText}> {rating} ({ratingCount} Reviews)</Text>
                </View>
                <View style={styles.assuredBadge}>
                  <Icons.CheckCircle2 color="#10B981" size={10} />
                  <Text style={styles.assuredText}> Assured</Text>
                </View>
              </View>

              {/* Price row */}
              <View style={styles.priceRow}>
                <Text style={styles.priceVal}>₹{getProductPrice().toLocaleString('en-IN')}</Text>
                <Text style={styles.strikeVal}>₹{getProductOriginalPrice().toLocaleString('en-IN')}</Text>
                <View style={styles.discountTag}>
                  <Text style={styles.discountTagText}>
                    {Math.round(((getProductOriginalPrice() - getProductPrice()) / getProductOriginalPrice()) * 100)}% OFF
                  </Text>
                </View>
              </View>
              <Text style={[styles.taxSubtitle, { color: colors.text, opacity: 0.5 }]}>Inclusive of all taxes</Text>

              {/* Delivery info card */}
              <GlassCard style={styles.deliveryCard}>
                <View style={styles.deliveryRow}>
                  <Icons.Truck color="#10B981" size={18} />
                  <View style={styles.deliveryInfo}>
                    <Text style={styles.deliveryTitle}>Free Delivery</Text>
                    <Text style={styles.deliveryDesc}>Delivery by {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                  </View>
                  <Icons.ChevronRight color="rgba(255,255,255,0.3)" size={16} />
                </View>
              </GlassCard>

              {/* Spec selector */}
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Select Storage</Text>
              <View style={styles.storageRow}>
                {['128GB', '256GB', '512GB'].map((opt) => (
                  <TouchableOpacity 
                    key={opt} 
                    style={[styles.storageBtn, selectedStorage === opt && { borderColor: '#E91E63', backgroundColor: 'rgba(233, 30, 99, 0.05)' }]}
                    onPress={() => setSelectedStorage(opt)}
                  >
                    <Text style={[styles.storageText, selectedStorage === opt && { color: '#E91E63' }]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Key highlights */}
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Key Highlights</Text>
              <View style={styles.highlightsContainer}>
                {[
                  'Advanced OLED Display with high brightness',
                  'High efficiency processors for smart task operations',
                  'Professional dual camera setup with optical stabilization',
                  'Secure digital locking systems integration',
                  'Optimized battery control and quick-charge support',
                ].map((hl, idx) => (
                  <View key={idx} style={styles.hlRow}>
                    <View style={styles.hlDot} />
                    <Text style={[styles.hlText, { color: colors.text }]}>{hl}</Text>
                  </View>
                ))}
              </View>

              {/* Description */}
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Description</Text>
              <Text 
                style={[styles.descParagraph, { color: colors.text }]}
                numberOfLines={isDescExpanded ? undefined : 3}
              >
                {desc}
              </Text>
              <TouchableOpacity onPress={() => setIsDescExpanded(!isDescExpanded)} style={styles.readMoreBtn}>
                <Text style={styles.readMoreText}>{isDescExpanded ? 'Read Less ^' : 'Read More v'}</Text>
              </TouchableOpacity>

              {/* Review Breakdown histogram */}
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Reviews Breakdown</Text>
              <View style={styles.reviewsHistogram}>
                <View style={styles.histoHeader}>
                  <Text style={[styles.histoAverage, { color: colors.text }]}>{rating}</Text>
                  <View style={{ flexDirection: 'row', gap: 2, marginTop: 4 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Icons.Star key={s} color="#F4C400" size={12} fill="#F4C400" />
                    ))}
                  </View>
                  <Text style={[styles.histoCount, { color: colors.text, opacity: 0.5 }]}>{ratingCount} reviews</Text>
                </View>

                <View style={styles.histoBars}>
                  {[
                    { stars: 5, pct: 75, count: '1.2k' },
                    { stars: 4, pct: 15, count: '240' },
                    { stars: 3, pct: 6, count: '90' },
                    { stars: 2, pct: 2, count: '30' },
                    { stars: 1, pct: 2, count: '30' },
                  ].map((row) => (
                    <View key={row.stars} style={styles.histoRow}>
                      <Text style={[styles.histoStarLabel, { color: colors.text }]}>{row.stars} ★</Text>
                      <View style={styles.barBackground}>
                        <View style={[styles.barFill, { width: `${row.pct}%` }]} />
                      </View>
                      <Text style={[styles.histoCountLabel, { color: colors.text }]}>{row.count}</Text>
                    </View>
                  ))}
                </View>
              </View>

            </View>
          </View>
        ) : (
          /* SERVICE LAYOUT */
          <View>
            {/* Service Cover image */}
            <View style={[styles.serviceImageContainer, { width, height: width * 0.65 }]}>
              <Image source={{ uri: imageUri }} style={styles.serviceCover} />
              <View style={styles.serviceCategoryBadge}>
                <Text style={styles.serviceCategoryText}>{category || 'Home Services'}</Text>
              </View>
            </View>

            <View style={styles.infoBlock}>
              <Text style={[styles.serviceTitle, { color: colors.text }]}>{title}</Text>

              {/* Rating */}
              <View style={styles.metaRow}>
                <View style={styles.ratingBadge}>
                  <Icons.Star color="#F4C400" size={10} fill="#F4C400" />
                  <Text style={styles.ratingText}> {rating} ({ratingCount} Reviews)</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Icons.CheckCircle2 color="#10B981" size={10} />
                  <Text style={styles.verifiedText}> Verified</Text>
                </View>
              </View>

              {/* Pricing */}
              <Text style={styles.servicePriceLabel}>₹{getServicePrice()} <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>/ Visit</Text></Text>

              {/* Services Highlights icons grid */}
              <View style={styles.highlightsGrid}>
                {[
                  { icon: 'UserCheck', label: 'Trusted Professionals' },
                  { icon: 'ShieldCheck', label: 'Background Verified' },
                  { icon: 'Clock', label: 'On-time Service' },
                  { icon: 'HeartHandshake', label: '100% Satisfaction' },
                ].map((item, idx) => {
                  const HighlightIcon = (Icons as any)[item.icon] || Icons.CheckCircle2;
                  return (
                    <GlassCard key={idx} style={[styles.hlGridCard, { width: (width - 40) / 2 }]}>
                      <View style={styles.gridIconCircle}>
                        <HighlightIcon color="#F4C400" size={16} />
                      </View>
                      <Text style={styles.gridCardText}>{item.label}</Text>
                    </GlassCard>
                  );
                })}
              </View>

              {/* Service Includes */}
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Service Includes</Text>
              <View style={styles.includesContainer}>
                {[
                  'Full standard cleaning / diagnostics checks',
                  'Dusting & sweeping all accessible surfaces',
                  'Floor sweeping, scrubbing, and sanitization mapping',
                  'Garbage disposal and sorting',
                  'Safety inspection checks by certified specialists',
                ].map((inc, idx) => (
                  <View key={idx} style={styles.includeItem}>
                    <Icons.Check color="#10B981" size={14} />
                    <Text style={[styles.includeText, { color: colors.text }]}>{inc}</Text>
                  </View>
                ))}
              </View>

              {/* How it works roadmap */}
              <Text style={[styles.sectionHeading, { color: colors.text }]}>How It Works</Text>
              <View style={styles.roadmapContainer}>
                {[
                  { step: '1', title: 'Book Service', desc: 'Choose your preferred date & time.' },
                  { step: '2', title: 'We Assign Expert', desc: 'We assign a verified professional.' },
                  { step: '3', title: 'Get It Done', desc: 'Sit back and relax. We\'ll handle the rest.' },
                  { step: '4', title: 'Enjoy Clean Home', desc: 'Pay after service completion.' },
                ].map((step, idx) => (
                  <View key={idx} style={styles.roadmapStep}>
                    <View style={styles.stepNumCircle}>
                      <Text style={styles.stepNumText}>{step.step}</Text>
                    </View>
                    <View style={styles.stepInfo}>
                      <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                      <Text style={[styles.stepDesc, { color: colors.text }]}>{step.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Select Package */}
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Select Package</Text>
              <View style={styles.packagesContainer}>
                {[
                  { name: 'Standard', desc: '1 BHK / 1 Bathroom Package', price: basePrice },
                  { name: 'Deep', desc: '2 BHK / 2 Bathroom Premium Package', price: basePrice * 2 },
                  { name: 'Premium', desc: '3+ BHK / 3 Bathroom Ultimate Package', price: basePrice * 3 },
                ].map((pkg) => (
                  <TouchableOpacity 
                    key={pkg.name} 
                    style={[styles.packageCard, selectedPackage === pkg.name && { borderColor: '#E91E63', backgroundColor: 'rgba(233, 30, 99, 0.05)' }]}
                    onPress={() => setSelectedPackage(pkg.name)}
                  >
                    <View style={styles.packageInfo}>
                      <Text style={[styles.packageName, { color: colors.text }]}>{pkg.name} Package</Text>
                      <Text style={styles.packageDesc}>{pkg.desc}</Text>
                    </View>
                    <View style={styles.packageSelector}>
                      <Text style={[styles.packagePrice, selectedPackage === pkg.name && { color: '#E91E63' }]}>₹{pkg.price}</Text>
                      <View style={[styles.radioCircle, selectedPackage === pkg.name && { borderColor: '#E91E63', backgroundColor: '#E91E63' }]}>
                        {selectedPackage === pkg.name && <View style={styles.radioDot} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

            </View>
          </View>
        )}
      </ScrollView>

      {/* Dynamic bottom action bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {!isService ? (
          <>
            <View style={styles.actionsLeft}>
              <TouchableOpacity style={styles.iconActionBtn}>
                <Icons.MessageSquare color={colors.text} size={20} />
                <Text style={[styles.iconActionLabel, { color: colors.text }]}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconActionBtn}>
                <Icons.Share2 color={colors.text} size={20} />
                <Text style={[styles.iconActionLabel, { color: colors.text }]}>Share</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.btnFilled, { backgroundColor: '#E91E63' }]}
              onPress={handleAddToCart}
            >
              <Icons.ShoppingCart color="#FFF" size={16} />
              <Text style={styles.btnFilledText}> Add to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnOutlined, { borderColor: '#E91E63' }]}
              onPress={handleBuyOrBook}
            >
              <Text style={[styles.btnOutlinedText, { color: '#E91E63' }]}>Buy Now</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.servicePriceSummary}>
              <Text style={styles.servicePriceTotal}>₹{getServicePrice()}</Text>
              <TouchableOpacity onPress={() => Alert.alert('Pricing Info', 'Price shown includes materials and standard convenience charges.')}>
                <Text style={styles.priceDetailsLink}>View Price Details</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.btnFilled, { flex: 2, backgroundColor: '#E91E63' }]}
              onPress={handleBuyOrBook}
            >
              <Text style={styles.btnFilledText}>Book Now</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F4C400',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF2E93',
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#0D1636',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  slideIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    backgroundColor: 'rgba(5, 11, 30, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  slideIndicatorText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  thumbRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  thumbWrapper: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoBlock: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 196, 0, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    color: '#F4C400',
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  assuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  assuredText: {
    color: '#10B981',
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 8,
  },
  priceVal: {
    color: '#F4C400',
    fontSize: 22,
    fontWeight: '900',
  },
  strikeVal: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  discountTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountTagText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  taxSubtitle: {
    fontSize: 11,
    marginTop: 4,
    marginBottom: 16,
  },
  deliveryCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deliveryInfo: {
    flex: 1,
    marginLeft: 10,
  },
  deliveryTitle: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: 'bold',
  },
  deliveryDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 18,
    marginBottom: 10,
  },
  storageRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  storageBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  storageText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  highlightsContainer: {
    gap: 8,
    marginBottom: 8,
  },
  hlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hlDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E91E63',
  },
  hlText: {
    fontSize: 11.5,
    lineHeight: 16,
    opacity: 0.85,
  },
  descParagraph: {
    fontSize: 12.5,
    lineHeight: 18,
    opacity: 0.8,
  },
  readMoreBtn: {
    marginTop: 6,
    marginBottom: 10,
  },
  readMoreText: {
    color: '#E91E63',
    fontSize: 11,
    fontWeight: 'bold',
  },
  reviewsHistogram: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  histoHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
  },
  histoAverage: {
    fontSize: 34,
    fontWeight: '900',
  },
  histoCount: {
    fontSize: 9,
    marginTop: 6,
  },
  histoBars: {
    flex: 1,
    gap: 4,
  },
  histoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  histoStarLabel: {
    fontSize: 9,
    width: 20,
    textAlign: 'right',
  },
  barBackground: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#F4C400',
    borderRadius: 3,
  },
  histoCountLabel: {
    fontSize: 9,
    width: 25,
    opacity: 0.5,
  },

  /* SERVICE STYLES */
  serviceImageContainer: {
    position: 'relative',
    backgroundColor: '#0D1636',
  },
  serviceCover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  serviceCategoryBadge: {
    position: 'absolute',
    top: 14,
    left: 16,
    backgroundColor: '#E91E63',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  serviceCategoryText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  servicePriceLabel: {
    color: '#E91E63',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 6,
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 14,
  },
  hlGridCard: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gridIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(244, 196, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCardText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    flex: 1,
    flexWrap: 'wrap',
  },
  includesContainer: {
    gap: 8,
    marginBottom: 8,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  includeText: {
    fontSize: 12,
    opacity: 0.85,
  },
  roadmapContainer: {
    gap: 12,
    marginBottom: 10,
  },
  roadmapStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(233, 30, 99, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: '#E91E63',
    fontSize: 11,
    fontWeight: 'bold',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 12.5,
    fontWeight: 'bold',
  },
  stepDesc: {
    fontSize: 10.5,
    opacity: 0.6,
    marginTop: 1,
  },
  packagesContainer: {
    gap: 8,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 12,
  },
  packageName: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  packageDesc: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    marginTop: 2,
  },
  packageInfo: {
    flex: 1,
  },
  packageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  packagePrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },

  /* BOTTOM BAR */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(5, 11, 30, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionsLeft: {
    flexDirection: 'row',
    gap: 16,
    marginRight: 6,
  },
  iconActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionLabel: {
    fontSize: 8.5,
    marginTop: 4,
    opacity: 0.6,
  },
  btnFilled: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFilledText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  btnOutlined: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlinedText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  servicePriceSummary: {
    flex: 1,
  },
  servicePriceTotal: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  priceDetailsLink: {
    color: '#F4C400',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
    textDecorationLine: 'underline',
  },
});
