import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useToastStore } from '../../store/toastStore';

export default function WishlistScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  const addToCart = useCartStore((state) => state.addToCart);
  const showToast = useToastStore((state) => state.showToast);

  const handleAddOrBook = (item: any) => {
    const catLower = (item.category || '').toLowerCase().trim();
    const hasCart = 
      catLower.includes('product') || 
      catLower.includes('elect') || 
      catLower.includes('fash') || 
      catLower.includes('grocer') || 
      catLower.includes('daily') || 
      catLower.includes('food') || 
      catLower.includes('dine');

    if (hasCart) {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        image: item.image,
      });
      showToast('Added to cart · View Cart', 'View Cart', () =>
        navigation.navigate('CustomerTabs', { screen: 'Cart' })
      );
    } else {
      navigation.navigate('ProductDetails', {
        item,
        category: item.category,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icons.ArrowLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{wishlistItems.length}</Text>
        </View>
      </View>

      {wishlistItems.length === 0 ? (
        /* Empty State */
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Icons.Heart color="#94A3B8" size={36} />
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Save items that you like and want to buy later by tapping the heart icon.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CustomerTabs', { screen: 'Categories' })}
          >
            <Text style={styles.exploreBtnText}>Explore Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Wishlist Grid / List */
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {wishlistItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('ProductDetails', {
                  item,
                  category: item.category || 'Electronics',
                })
              }
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, styles.placeholderImage]}>
                  <Icons.Package color="#94A3B8" size={24} />
                </View>
              )}

              <View style={styles.detailsCol}>
                <Text style={styles.categoryTag}>{item.category || 'Product'}</Text>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>

              <View style={styles.actionCol}>
                <TouchableOpacity
                  style={styles.removeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => removeFromWishlist(item.id)}
                >
                  <Icons.Trash2 color="#EF4444" size={18} />
                </TouchableOpacity>

                {(() => {
                  const catLower = (item.category || '').toLowerCase().trim();
                  const hasCart = 
                    catLower.includes('product') || 
                    catLower.includes('elect') || 
                    catLower.includes('fash') || 
                    catLower.includes('grocer') || 
                    catLower.includes('daily') || 
                    catLower.includes('food') || 
                    catLower.includes('dine');
                  
                  return (
                    <TouchableOpacity
                      style={styles.addCartBtn}
                      activeOpacity={0.8}
                      onPress={() => handleAddOrBook(item)}
                    >
                      {hasCart ? (
                        <>
                          <Icons.ShoppingBag color="#0F172A" size={14} />
                          <Text style={styles.addCartBtnText}>Add</Text>
                        </>
                      ) : (
                        <>
                          <Icons.Calendar color="#0F172A" size={14} />
                          <Text style={styles.addCartBtnText}>Book</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  );
                })()}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  countBadge: {
    backgroundColor: '#FEFCE8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#854D0E',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: '#F4C400',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  exploreBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  actionCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 64,
  },
  removeBtn: {
    padding: 4,
  },
  addCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4C400',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  addCartBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
});
