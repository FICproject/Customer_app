import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import * as Icons from 'lucide-react-native';
import { useCartStore } from '../../store/cartStore';
import { useToastStore } from '../../store/toastStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function CustomerCart() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const cartItems = useCartStore((state) => state.cartItems);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const showToast = useToastStore((state) => state.showToast);

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const rawPrice = item.price;
      const numericPrice = typeof rawPrice === 'number'
        ? rawPrice
        : (parseInt(String(rawPrice || '0').replace(/[^\d]/g, ''), 10) || 0);
      return acc + (numericPrice * item.quantity);
    }, 0);
  };


  const handleDecrement = (id: string, currentQty: number) => {
    if (currentQty <= 1) {
      removeFromCart(id);
      showToast('Item removed from cart');
    } else {
      updateQuantity(id, currentQty - 1);
    }
  };

  const handleRemove = (id: string) => {
    removeFromCart(id);
    showToast('Item removed from cart');
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F7F8FA' }]}>
      {/* Header */}
      <View style={[styles.navbar, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <View style={styles.headerTitleRow}>
          <Icons.ShoppingCart color="#172033" size={22} />
          <Text style={styles.headerTitle}>My Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</Text>
        </View>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Icons.ShoppingBag color="#9CA3AF" size={48} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Explore our Connect products, daily needs, food, stays, and services to add items.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.exploreBtnText}>Start Shopping Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartCard}>
                <Image source={{ uri: item.image }} style={styles.itemImg} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>

                  <View style={styles.qtyRow}>
                    <View style={styles.qtyControls}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => handleDecrement(item.id, item.quantity)}>
                        <Icons.Minus color="#172033" size={14} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Icons.Plus color="#172033" size={14} />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id)}>
                      <Icons.Trash2 color="#EF4444" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Checkout Footer */}
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalVal}>₹{calculateTotal().toLocaleString('en-IN')}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.85} onPress={() => navigation.navigate('Checkout')}>
              <Text style={styles.checkoutBtnText}>Proceed to Checkout →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#172033' },
  clearBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  clearBtnText: { color: '#EF4444', fontSize: 12, fontWeight: 'bold' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#172033', marginBottom: 8 },
  emptySubtitle: { fontSize: 12.5, color: '#6B7280', textAlign: 'center', lineHeight: 18, marginBottom: 24 },
  exploreBtn: { backgroundColor: '#F4C400', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24 },
  exploreBtnText: { color: '#0F172A', fontSize: 13, fontWeight: 'bold' },
  itemList: { flex: 1, padding: 16 },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  itemImg: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#F3F4F6' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 13, fontWeight: 'bold', color: '#172033' },
  itemCategory: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '900', color: '#172033', marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 13, fontWeight: 'bold', color: '#172033' },
  removeBtn: { padding: 4 },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalLabel: { fontSize: 13, color: '#6B7280' },
  totalVal: { fontSize: 20, fontWeight: '900', color: '#172033' },
  checkoutBtn: { backgroundColor: '#F4C400', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  checkoutBtnText: { color: '#0F172A', fontSize: 13, fontWeight: 'bold' },
});
