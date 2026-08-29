import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useToastStore } from '../../store/toastStore';
import { useActivityStore } from '../../store/activityStore';
import { apiFetch } from '../../services/api';

export interface ProductVariantOption {
  id: string;
  name: string;
  priceDiff?: number;
  inStock?: boolean;
}

export interface ProductVariant {
  id: string;
  type: string;
  label: string;
  options: ProductVariantOption[];
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  subcategory?: string;
  image: string;
  gallery?: string[];
  description?: string;
  price: number;
  mrp?: number;
  rating?: number;
  ratingCount?: string;
  assured?: boolean;
  availability?: string;
  deliveryInfo?: string;
  seller?: {
    name: string;
    rating?: string;
    verified?: boolean;
    location?: string;
  };
  warranty?: string;
  highlights?: string[];
  specifications?: Array<{ label: string; val: string }>;
  variants?: ProductVariant[];
}

export const calculateDiscount = (mrp?: number, price?: number): number => {
  if (!mrp || !price || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};


export default function ProductDetails() {
  const { width } = useWindowDimensions();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const cartItems = useCartStore((state) => state.cartItems);
  const addToCart = useCartStore((state) => state.addToCart);
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const showToast = useToastStore((state) => state.showToast);

  const routeParams = (route.params as any) || {};
  const rawItem = routeParams.item;
  const categoryParam = routeParams.category;

  const [product, setProduct] = useState<Product | null>(() => {
    if (rawItem && (rawItem.name || rawItem.title)) {
      const rawPrice = typeof rawItem.price === 'number'
        ? rawItem.price
        : parseInt(String(rawItem.price || '0').replace(/[^\d]/g, ''), 10) || 0;

      const rawMrp = typeof rawItem.originalPrice === 'number'
        ? rawItem.originalPrice
        : parseInt(String(rawItem.originalPrice || '0').replace(/[^\d]/g, ''), 10) || undefined;

      return {
        id: rawItem.id || `prod_${Date.now()}`,
        name: rawItem.name || rawItem.title,
        brand: rawItem.brand || rawItem.vendor || undefined,
        category: categoryParam || rawItem.category || 'Product',
        image: rawItem.image || rawItem.img || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80',
        gallery: rawItem.gallery || [rawItem.image || rawItem.img].filter(Boolean),
        description: rawItem.desc || rawItem.description || '',
        price: rawPrice,
        mrp: rawMrp && rawMrp > rawPrice ? rawMrp : undefined,
        rating: rawItem.rating ? parseFloat(String(rawItem.rating)) : undefined,
        ratingCount: rawItem.ratingCount ? String(rawItem.ratingCount) : undefined,
        assured: Boolean(rawItem.isAssured || rawItem.assured),
        availability: rawItem.availability || 'In Stock',
        deliveryInfo: rawItem.deliveryInfo || undefined,
        seller: rawItem.seller || (rawItem.vendor ? { name: rawItem.vendor, verified: true } : undefined),
        warranty: rawItem.warranty || undefined,
        highlights: rawItem.highlights || undefined,
        specifications: rawItem.specifications || (rawItem.spec ? [{ label: 'Specification', val: rawItem.spec }] : undefined),
        variants: rawItem.variants || undefined,
      };
    }
    return null;
  });

  const [isLoadingProduct, setIsLoadingProduct] = useState(!product?.description);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch full details from MongoDB Atlas
  useEffect(() => {
    let isCurrent = true;
    const fetchLiveProduct = async () => {
      const pId = rawItem?.id || routeParams.productId;
      if (pId) {
        try {
          const res = await apiFetch(`/products/${pId}`);
          if (isCurrent && res && res.data) {
            setProduct(res.data);
          }
        } catch (err) {
          console.warn('[ProductDetails] Error fetching product from MongoDB:', err);
        } finally {
          if (isCurrent) setIsLoadingProduct(false);
        }
      } else {
        if (isCurrent) setIsLoadingProduct(false);
      }
    };
    fetchLiveProduct();
    return () => { isCurrent = false; };
  }, [rawItem?.id, routeParams.productId]);

  // Record Activity View
  useEffect(() => {
    if (product) {
      useActivityStore.getState().recordProductView({
        id: product.id,
        name: product.name,
        category: product.category,
        image: product.image,
        price: `₹${product.price.toLocaleString('en-IN')}`,
        vendor: product.seller?.name || product.brand,
      });
    }
  }, [product?.id]);

  // State for active image gallery thumb and selected variant options
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariantOptions, setSelectedVariantOptions] = useState<{ [variantId: string]: ProductVariantOption }>({});

  // Initialize default selected variants
  useEffect(() => {
    if (product?.variants) {
      const initialMap: { [variantId: string]: ProductVariantOption } = {};
      product.variants.forEach((v) => {
        if (v.options && v.options.length > 0) {
          initialMap[v.id] = v.options[0];
        }
      });
      setSelectedVariantOptions(initialMap);
    }
  }, [product?.id]);

  // Data Validation & Error Handling
  if (isLoadingProduct) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Icons.Loader color="#F4C400" size={32} />
        <Text style={[styles.errorSubtitle, { marginTop: 12 }]}>Loading product details from database...</Text>
      </View>
    );
  }

  if (!product || !product.name) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Icons.AlertCircle color="#EF4444" size={48} />
        <Text style={styles.errorTitle}>Product Information Unavailable</Text>
        <Text style={styles.errorSubtitle}>
          The requested product details could not be found in the database.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }


  // Compute total price modifications from selected variants
  let extraPrice = 0;
  Object.values(selectedVariantOptions).forEach((opt) => {
    if (opt.priceDiff) extraPrice += opt.priceDiff;
  });

  const unitSellingPrice = Math.max(0, product.price + extraPrice);
  const unitMrp = product.mrp ? product.mrp + extraPrice : undefined;
  const totalPrice = unitSellingPrice * qty;

  const computedDiscountPct = calculateDiscount(unitMrp, unitSellingPrice);

  const gallery = (product.gallery && product.gallery.length > 0)
    ? product.gallery
    : [product.image];

  const isFavorite = wishlistItems.some((i) => i.id === product.id);
  const isInCart = cartItems.some((i) => i.id === product.id);

  // Construct label for variants
  const selectedVariantSummary = Object.values(selectedVariantOptions)
    .map((opt) => opt.name)
    .join(' / ');

  const fullCartItemName = selectedVariantSummary
    ? `${product.name} (${selectedVariantSummary})`
    : product.name;

  const catLower = (product?.category || '').toLowerCase().trim();
  const hasCart = 
    catLower.includes('product') || 
    catLower.includes('elect') || 
    catLower.includes('fash') || 
    catLower.includes('grocer') || 
    catLower.includes('daily') || 
    catLower.includes('food') || 
    catLower.includes('dine');

  // Determine Right button text
  let actionBtnText = 'Buy Now';
  if (catLower.includes('job')) {
    actionBtnText = 'Apply Now';
  } else if (catLower.includes('rental')) {
    actionBtnText = 'Rent Now';
  } else if (catLower.includes('stay') || catLower.includes('hotel') || catLower.includes('resort')) {
    actionBtnText = 'Reserve / Book Stay';
  } else if (catLower.includes('travel') || catLower.includes('flight') || catLower.includes('cab') || catLower.includes('bus')) {
    actionBtnText = 'Book Ticket';
  } else if (catLower.includes('service') || catLower.includes('health') || catLower.includes('appoint') || catLower.includes('repair') || catLower.includes('clean')) {
    actionBtnText = 'Book Service';
  } else if (catLower.includes('food') || catLower.includes('dine') || catLower.includes('restaurant')) {
    actionBtnText = 'Order Now';
  }

  const handleAddToCart = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 800);

    if (isInCart) {
      showToast('Already in your cart', 'View Cart', () =>
        navigation.navigate('CustomerTabs', { screen: 'Cart' })
      );
    } else {
      addToCart({
        id: product!.id,
        name: fullCartItemName,
        price: `₹${unitSellingPrice.toLocaleString('en-IN')}`,
        quantity: qty,
        category: product!.category,
        image: product!.image,
      });
      showToast('Added to cart · View Cart', 'View Cart', () =>
        navigation.navigate('CustomerTabs', { screen: 'Cart' })
      );
    }
  };

  const handleBuyNow = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 800);

    if (hasCart && !isInCart) {
      addToCart({
        id: product!.id,
        name: fullCartItemName,
        price: `₹${unitSellingPrice.toLocaleString('en-IN')}`,
        quantity: qty,
        category: product!.category,
        image: product!.image,
      });
    }

    const isBookingFlow = 
      catLower.includes('stay') || 
      catLower.includes('hotel') || 
      catLower.includes('travel') || 
      catLower.includes('flight') || 
      catLower.includes('cab') || 
      catLower.includes('bus') || 
      catLower.includes('service') || 
      catLower.includes('health') || 
      catLower.includes('appoint') || 
      catLower.includes('job') || 
      catLower.includes('rent');

    if (isBookingFlow) {
      navigation.navigate('BookingConfirmation', {
        bookingId: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
        items: [
          {
            name: fullCartItemName,
            price: `₹${unitSellingPrice.toLocaleString('en-IN')}`,
            category: product!.category,
            image: product!.image,
          },
        ],
        totalAmount: totalPrice,
        paymentMethod: 'UPI / Online',
        type: catLower.includes('stay') ? 'stay' : catLower.includes('travel') ? 'travel' : catLower.includes('food') ? 'food' : 'service',
        date: 'Confirmed',
      });
    } else {
      navigation.navigate('Checkout');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Icons.ChevronLeft color="#172033" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Product Details</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() =>
              toggleWishlist({
                id: product!.id,
                name: product!.name,
                price: `₹${unitSellingPrice.toLocaleString('en-IN')}`,
                category: product!.category,
                image: product!.image,
              })
            }
          >
            <Icons.Heart
              color={isFavorite ? '#EF4444' : '#172033'}
              fill={isFavorite ? '#EF4444' : 'transparent'}
              size={20}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('CustomerTabs', { screen: 'Cart' })}
          >
            <Icons.ShoppingCart color="#172033" size={20} />
            {cartItems.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* Gallery Main Banner */}
        <View style={[styles.imageContainer, { width, height: width * 0.78 }]}>
          <Image
            source={{ uri: gallery[selectedThumb] || product.image }}
            style={styles.mainImg}
          />
          {gallery.length > 1 && (
            <View style={styles.galleryCounter}>
              <Text style={styles.galleryCounterText}>
                {selectedThumb + 1}/{gallery.length}
              </Text>
            </View>
          )}
        </View>

        {/* Gallery Thumbnails */}
        {gallery.length > 1 && (
          <View style={styles.thumbRow}>
            {gallery.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.thumb, selectedThumb === idx && styles.thumbActive]}
                onPress={() => setSelectedThumb(idx)}
              >
                <Image source={{ uri: img }} style={styles.thumbImg} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.content}>
          {/* Brand & Title */}
          {product.brand && (
            <Text style={styles.brandText}>{product.brand.toUpperCase()}</Text>
          )}
          <Text style={styles.title}>{product.name}</Text>

          {/* Rating & Availability Badges */}
          <View style={styles.metaRow}>
            {product.rating ? (
              <View style={styles.ratingBadge}>
                <Icons.Star color="#F59E0B" size={13} fill="#F59E0B" />
                <Text style={styles.ratingText}>
                  {product.rating} {product.ratingCount ? `(${product.ratingCount} reviews)` : ''}
                </Text>
              </View>
            ) : null}

            {/* Assured badge removed */}
          </View>

          {/* Pricing Block */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{unitSellingPrice.toLocaleString('en-IN')}</Text>
            {unitMrp && unitMrp > unitSellingPrice && (
              <Text style={styles.strikePrice}>₹{unitMrp.toLocaleString('en-IN')}</Text>
            )}
            {computedDiscountPct > 0 && (
              <View style={styles.discountTag}>
                <Text style={styles.discountText}>{computedDiscountPct}% OFF</Text>
              </View>
            )}
          </View>

          {/* Delivery Information */}
          <Text style={styles.subtext}>
            {product.deliveryInfo || 'Free delivery available for Connect Members'}
          </Text>

          {/* Product Category Specific Variants */}
          {product.variants && product.variants.length > 0 ? (
            product.variants.map((variant) => (
              <View key={variant.id} style={styles.variantSection}>
                <Text style={styles.sectionHeading}>{variant.label}</Text>
                <View style={styles.variantRow}>
                  {variant.options.map((opt) => {
                    const isSelected = selectedVariantOptions[variant.id]?.id === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[styles.variantCard, isSelected && styles.variantActive]}
                        onPress={() =>
                          setSelectedVariantOptions((prev) => ({ ...prev, [variant.id]: opt }))
                        }
                      >
                        <Text style={[styles.variantText, isSelected && styles.variantTextActive]}>
                          {opt.name}
                        </Text>
                        {opt.priceDiff ? (
                          <Text style={styles.variantDiffText}>
                            {opt.priceDiff > 0 ? `+₹${opt.priceDiff}` : `-₹${Math.abs(opt.priceDiff)}`}
                          </Text>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))
          ) : null}

          {/* Quantity Selector */}
          <View style={styles.qtyContainer}>
            <Text style={styles.qtyLabel}>Quantity:</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty(Math.max(1, qty - 1))}
              >
                <Icons.Minus color="#172033" size={16} />
              </TouchableOpacity>
              <Text style={styles.qtyVal}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(qty + 1)}>
                <Icons.Plus color="#172033" size={16} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          {product.description ? (
            <View style={styles.sectionMargin}>
              <Text style={styles.sectionHeading}>Product Overview</Text>
              <Text style={styles.descText}>{product.description}</Text>
            </View>
          ) : null}

          {/* Key Highlights */}
          <Text style={styles.sectionHeading}>Highlights & Features</Text>
          <View style={styles.card}>
            {product.highlights && product.highlights.length > 0 ? (
              product.highlights.map((hl, i) => (
                <View key={i} style={styles.hlRow}>
                  <View style={styles.dot} />
                  <Text style={styles.hlText}>{hl}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.unavailableText}>Information unavailable</Text>
            )}
          </View>

          {/* Technical Specifications */}
          <Text style={styles.sectionHeading}>Specifications</Text>
          <View style={styles.card}>
            {product.specifications && product.specifications.length > 0 ? (
              product.specifications.map((spec, i) => (
                <View
                  key={i}
                  style={[
                    styles.specRow,
                    i < (product.specifications?.length || 0) - 1 && styles.specDivider,
                  ]}
                >
                  <Text style={styles.specLabel}>{spec.label}</Text>
                  <Text style={styles.specVal}>{spec.val}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.unavailableText}>Information unavailable</Text>
            )}
          </View>

          {/* Seller / Vendor Details */}
          <Text style={styles.sectionHeading}>Seller & Fulfillment</Text>
          <View style={styles.vendorCard}>
            <Icons.Store color="#172033" size={20} />
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>
                {product.seller?.name || product.brand || 'Information unavailable'}
              </Text>
              <Text style={styles.vendorMeta}>
                {product.seller?.rating ? `★ ${product.seller.rating} Rating • ` : ''}
                {product.seller?.verified ? 'Verified Vendor' : 'Authorized Seller'}
              </Text>
            </View>
          </View>

          {/* Warranty & Return Info */}
          <Text style={styles.sectionHeading}>Warranty & Support</Text>
          <View style={styles.vendorCard}>
            <Icons.ShieldCheck color="#16A34A" size={20} />
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>
                {product.warranty || 'Information unavailable'}
              </Text>
              <Text style={styles.vendorMeta}>
                Genuine brand product with full seller warranty coverage.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {hasCart && (
          <TouchableOpacity
            style={[
              styles.cartBtn,
              isInCart && styles.cartBtnInCart
            ]}
            onPress={handleAddToCart}
            disabled={isProcessing}
          >
            {isInCart ? (
              <Icons.Check color="#059669" size={18} strokeWidth={3} />
            ) : (
              <Icons.ShoppingCart color="#172033" size={18} />
            )}
            <Text style={[styles.cartBtnText, isInCart && { color: '#059669', fontWeight: 'bold' }]}>
              {isInCart ? 'In Cart' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.buyBtn,
            { flex: hasCart ? 1.4 : undefined, width: hasCart ? undefined : '100%' },
            isProcessing && { opacity: 0.7 }
          ]}
          onPress={handleBuyNow}
          disabled={isProcessing}
        >
          <Text style={styles.buyBtnText}>
            {actionBtnText} {totalPrice > 0 ? `(₹${totalPrice.toLocaleString('en-IN')})` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#172033',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  imageContainer: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  galleryCounter: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  galleryCounterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  thumbRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  thumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  thumbActive: {
    borderColor: '#F4C400',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#172033',
    lineHeight: 25,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#D97706',
  },
  assuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  assuredText: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  price: {
    fontSize: 23,
    fontWeight: '900',
    color: '#172033',
  },
  strikePrice: {
    fontSize: 14,
    color: '#9AA0A6',
    textDecorationLine: 'line-through',
  },
  discountTag: {
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  subtext: {
    fontSize: 11.5,
    color: '#6B7280',
    marginBottom: 12,
  },
  sectionMargin: {
    marginTop: 10,
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#172033',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
  },
  variantSection: {
    marginBottom: 4,
  },
  variantRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variantActive: {
    borderColor: '#F4C400',
    backgroundColor: 'rgba(244, 196, 0, 0.12)',
  },
  variantText: {
    fontSize: 12,
    color: '#475569',
  },
  variantTextActive: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  variantDiffText: {
    fontSize: 9.5,
    color: '#D97706',
    fontWeight: '600',
    marginTop: 1,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
  },
  qtyLabel: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#172033',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  qtyVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#172033',
  },
  descText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  hlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F4C400',
  },
  hlText: {
    fontSize: 12,
    color: '#1E293B',
    flex: 1,
    lineHeight: 17,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  specDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  specLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  specVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: 'bold',
    flex: 1.2,
    textAlign: 'right',
  },
  unavailableText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#172033',
  },
  vendorMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    gap: 10,
    elevation: 10,
  },
  cartBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cartBtnInCart: {
    backgroundColor: '#D1FAE5',
    borderColor: '#34D399',
  },
  cartBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#172033',
  },
  buyBtn: {
    flex: 1.4,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F4C400',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 12,
  },
  errorSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
  },
  backBtn: {
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
    backgroundColor: '#F4C400',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
});
