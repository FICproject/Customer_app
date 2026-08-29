import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Icons from 'lucide-react-native';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useActivityStore } from '../store/activityStore';
import { useToastStore } from '../store/toastStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

export interface ProductItem {
  id: string;
  name: string;
  spec?: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  rating?: string;
  ratingCount?: string;
  image: string;
  category: string;
  assured?: boolean;
}

interface ProductCardProps {
  item: ProductItem;
  onPress: () => void;
  onPlaceOrder?: (name: string, price: string, category: string) => void;
}

export default function ProductCard({ item, onPress, onPlaceOrder }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const navigation = useNavigation<any>();
  const cartItems = useCartStore((state) => state.cartItems);
  const addToCart = useCartStore((state) => state.addToCart);
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const showToast = useToastStore((state) => state.showToast);

  const handleCardPress = () => {
    useActivityStore.getState().recordProductView({
      id: item.id,
      name: item.name,
      category: item.category,
      image: item.image,
      price: item.price,
    });
    onPress();
  };

  const isWishlisted = wishlistItems.some((i) => i.id === item.id);
  const isBooking = ['services', 'service', 'stay', 'travel', 'food', 'jobs'].includes(
    (item.category || '').toLowerCase().trim()
  );

  let computedDiscount: string | undefined = undefined;
  if (item.originalPrice && item.price) {
    const numPrice = parseInt(String(item.price).replace(/[^\d]/g, ''), 10);
    const numOrig = parseInt(String(item.originalPrice).replace(/[^\d]/g, ''), 10);
    if (numOrig > numPrice) {
      const pct = Math.round(((numOrig - numPrice) / numOrig) * 100);
      if (pct > 0) computedDiscount = `${pct}% OFF`;
    }
  } else if (item.discount) {
    computedDiscount = item.discount;
  }

  const [isProcessing, setIsProcessing] = useState(false);

  const catLower = (item.category || '').toLowerCase().trim();
  const actionType = (item as any).actionType || '';
  const isInCart = cartItems.some((i) => i.id === item.id);

  // Check if this category supports cart
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
  if (actionType === 'APPLY' || catLower.includes('job')) {
    actionBtnText = 'Apply Now';
  } else if (actionType === 'RENT' || catLower.includes('rental')) {
    actionBtnText = 'Rent Now';
  } else if (actionType === 'BOOK_STAY' || catLower.includes('stay') || catLower.includes('hotel') || catLower.includes('resort')) {
    actionBtnText = 'Reserve';
  } else if (actionType === 'BOOK_TICKET' || catLower.includes('travel') || catLower.includes('flight') || catLower.includes('cab') || catLower.includes('bus')) {
    actionBtnText = 'Book Ticket';
  } else if (actionType === 'BOOK_SERVICE' || catLower.includes('service') || catLower.includes('health') || catLower.includes('appoint') || catLower.includes('repair') || catLower.includes('clean')) {
    actionBtnText = 'Book Service';
  } else if (catLower.includes('food') || catLower.includes('dine') || catLower.includes('restaurant')) {
    actionBtnText = 'Order Now';
  }

  const handleAddToCart = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 800);

    const isAlreadyInCart = cartItems.some((i) => i.id === item.id);
    if (isAlreadyInCart) {
      showToast('Already in your cart', 'View Cart', () => navigation.navigate('CustomerTabs', { screen: 'Cart' }));
    } else {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        image: item.image,
      });
      showToast('Added to cart · View Cart', 'View Cart', () => navigation.navigate('CustomerTabs', { screen: 'Cart' }));
    }
  };

  const handleBuyOrBook = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 800);

    if (hasCart && !isInCart) {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        image: item.image,
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
      catLower.includes('rent') ||
      actionType === 'BOOK_STAY' ||
      actionType === 'BOOK_TICKET' ||
      actionType === 'BOOK_SERVICE' ||
      actionType === 'APPLY' ||
      actionType === 'RENT';

    if (isBookingFlow) {
      const cleanPrice = parseInt((item.price || '499').replace(/[^\d]/g, ''), 10) || 499;
      const typeStr = 
        catLower.includes('stay') ? 'stay' : 
        catLower.includes('travel') ? 'travel' : 
        catLower.includes('food') ? 'food' : 'service';
      
      navigation.navigate('BookingConfirmation', {
        bookingId: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
        items: [{ name: item.name, price: item.price, category: item.category, image: item.image }],
        totalAmount: cleanPrice,
        paymentMethod: 'UPI / Online',
        type: typeStr,
        date: 'Confirmed',
      });
    } else {
      navigation.navigate('Checkout', { item });
    }
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=80';

  return (
    <View style={styles.card}>
      {/* Product Image Section */}
      <View style={styles.imgContainer}>
        <TouchableOpacity activeOpacity={0.9} onPress={handleCardPress} style={styles.imgTouch}>
          <Image
            source={{ uri: imgError ? fallbackImage : item.image }}
            style={styles.img}
            onError={() => setImgError(true)}
          />
        </TouchableOpacity>

        {/* Discount Badge */}
        {computedDiscount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{computedDiscount}</Text>
          </View>
        ) : null}

        {/* Wishlist Heart Chip */}
        <TouchableOpacity
          style={styles.wishlistChip}
          activeOpacity={0.8}
          onPress={() =>
            toggleWishlist({
              id: item.id,
              name: item.name,
              price: item.price,
              category: item.category,
              image: item.image,
            })
          }
        >
          <Icons.Heart
            color={isWishlisted ? '#EF4444' : '#374151'}
            size={15}
            fill={isWishlisted ? '#EF4444' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Details Container */}
      <TouchableOpacity activeOpacity={0.9} onPress={handleCardPress} style={styles.details}>
        <Text style={styles.title} numberOfLines={2}>
          {item.name}
        </Text>

        <Text style={styles.subtitle} numberOfLines={1}>
          {item.spec || `${item.category} • Certified Provider`}
        </Text>

        {/* Rating & Assured Badge Row */}
        <View style={styles.ratingRow}>
          <Icons.Star color="#F59E0B" size={12} fill="#F59E0B" />
          <Text style={styles.ratingText}>
            {item.rating || '4.5'} ({item.ratingCount || '320'})
          </Text>
        </View>

        {/* Price Block & Delivery Row */}
        <View style={styles.priceRow}>
          <View style={styles.priceCol}>
            <Text style={styles.price}>{item.price}</Text>
            {item.originalPrice ? (
              <Text style={styles.strikePrice}>{item.originalPrice}</Text>
            ) : null}
          </View>
          <Text style={styles.deliveryText}>Free Delivery</Text>
        </View>
      </TouchableOpacity>

      {/* Bottom Action Row */}
      <View style={styles.actionRow}>
        {hasCart && (
          <TouchableOpacity
            style={[
              styles.cartBtn,
              isInCart && styles.cartBtnInCart
            ]}
            activeOpacity={0.8}
            onPress={handleAddToCart}
            disabled={isProcessing}
          >
            {isInCart ? (
              <Icons.Check color="#059669" size={16} strokeWidth={3} />
            ) : (
              <Icons.ShoppingCart color="#374151" size={16} />
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.buyBtn,
            { flex: hasCart ? 1 : undefined, width: hasCart ? undefined : '100%' },
            isProcessing && { opacity: 0.7 }
          ]}
          activeOpacity={0.85}
          onPress={handleBuyOrBook}
          disabled={isProcessing}
        >
          <Text style={styles.buyBtnText}>{actionBtnText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1EAD8',
    padding: 12,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,

  },
  imgContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  imgTouch: {
    width: '100%',
    height: '100%',
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#16A34A',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: 'bold',
  },
  wishlistChip: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  details: {
    marginTop: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#172033',
    lineHeight: 17,
    height: 34,
  },
  subtitle: {
    fontSize: 10.5,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 10.5,
    color: '#374151',
    fontWeight: '500',
  },
  assuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 'auto',
  },
  assuredText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#059669',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceCol: {
    flexDirection: 'column',
  },
  price: {
    fontSize: 15,
    fontWeight: '900',
    color: '#172033',
  },
  strikePrice: {
    fontSize: 10,
    color: '#9AA0A6',
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  deliveryText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1EAD8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBtnInCart: {
    backgroundColor: '#D1FAE5',
    borderColor: '#34D399',
  },
  buyBtn: {
    flex: 1,
    height: 34,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buyBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
