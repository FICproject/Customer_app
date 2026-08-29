import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import { useCartStore } from '../../store/cartStore';
import { useOrderStore } from '../../store/orderStore';
import { useToastStore } from '../../store/toastStore';

export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const showToast = useToastStore((state) => state.showToast);

  const cartItems = useCartStore((state) => state.cartItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const loadAllOrders = useOrderStore((state) => state.loadAllOrders);

  const directItem = (route.params as any)?.item;

  const checkoutItems = directItem ? [
    {
      id: directItem.id || 'direct_item',
      name: directItem.name || directItem.title,
      price: directItem.price,
      quantity: 1,
      category: directItem.category || 'Product',
      image: directItem.image || directItem.img,
    }
  ] : cartItems;

  const [selectedAddress, setSelectedAddress] = useState('Home — Koramangala 5th Block, Bangalore');
  const [selectedPayment, setSelectedPayment] = useState('UPI');

  const subtotal = checkoutItems.reduce((acc, i) => {
    const rawPrice = i.price;
    const p = typeof rawPrice === 'number'
      ? rawPrice
      : (parseInt(String(rawPrice || '0').replace(/[^\d]/g, ''), 10) || 500);
    return acc + (p * (i.quantity || 1));
  }, 0);


  const deliveryFee = subtotal > 1000 ? 0 : 40;
  const discount = Math.round(subtotal * 0.05);
  const totalAmount = Math.max(0, subtotal - discount + deliveryFee);

  const handlePlaceOrder = async () => {
    try {
      await loadAllOrders();
      if (!directItem) {
        clearCart();
      }
      showToast('Order Placed Successfully! 🎉');
      navigation.navigate('BookingConfirmation', {
        bookingId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        items: checkoutItems,
        totalAmount,
        paymentMethod: selectedPayment,
        address: selectedAddress,
        type: 'product',
      });
    } catch {
      if (!directItem) clearCart();
      navigation.navigate('BookingConfirmation', {
        bookingId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        items: checkoutItems,
        totalAmount,
        paymentMethod: selectedPayment,
        address: selectedAddress,
        type: 'product',
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#F7F8FA' }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icons.ChevronLeft color="#172033" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 110, padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Delivery Address Card */}
        <Text style={styles.sectionHeading}>Delivery Address</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.iconCircle}>
              <Icons.MapPin color="#172033" size={16} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Deliver to</Text>
              <Text style={styles.cardSub}>{selectedAddress}</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert('Address', 'Address selection modal')}>
              <Text style={styles.changeBtn}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Items Summary */}
        <Text style={styles.sectionHeading}>Order Items ({checkoutItems.length})</Text>
        <View style={styles.card}>
          {checkoutItems.map((item, idx) => (
            <View key={item.id || idx} style={[styles.itemRow, idx === checkoutItems.length - 1 && { borderBottomWidth: 0 }]}>
              <Image source={{ uri: item.image }} style={styles.itemImg} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity || 1} • {item.category}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Method Selection */}
        <Text style={styles.sectionHeading}>Payment Method</Text>
        <View style={styles.card}>
          {[
            { id: 'UPI', label: 'Google Pay / PhonePe / BHIM UPI', icon: 'Smartphone' },
            { id: 'CARD', label: 'Credit / Debit Card', icon: 'CreditCard' },
            { id: 'NETBANKING', label: 'Net Banking', icon: 'Building' },
            { id: 'COD', label: 'Cash on Delivery', icon: 'Banknote' },
          ].map((pm) => {
            const IconComp = (Icons as any)[pm.icon] || Icons.CreditCard;
            return (
              <TouchableOpacity
                key={pm.id}
                style={[styles.pmRow, selectedPayment === pm.id && styles.pmActive]}
                onPress={() => setSelectedPayment(pm.id)}
              >
                <IconComp color={selectedPayment === pm.id ? '#172033' : '#6B7280'} size={18} />
                <Text style={[styles.pmText, selectedPayment === pm.id && styles.pmTextActive]}>{pm.label}</Text>
                <View style={[styles.radio, selectedPayment === pm.id && styles.radioActive]}>
                  {selectedPayment === pm.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bill Summary */}
        <Text style={styles.sectionHeading}>Price Summary</Text>
        <View style={styles.card}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Subtotal</Text>
            <Text style={styles.billVal}>₹{subtotal.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Member Discount</Text>
            <Text style={[styles.billVal, { color: '#16A34A' }]}>-₹{discount.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billVal}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</Text>
          </View>
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalVal}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.priceSummary}>
          <Text style={styles.bottomTotalLabel}>Total Amount</Text>
          <Text style={styles.bottomTotalVal}>₹{totalAmount.toLocaleString('en-IN')}</Text>
        </View>
        <TouchableOpacity style={styles.placeOrderBtn} activeOpacity={0.85} onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderText}>Place Order →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#172033' },
  sectionHeading: { fontSize: 13, fontWeight: 'bold', color: '#172033', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 14, marginBottom: 8 },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 12, marginBottom: 4 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 11, color: '#6B7280' },
  cardSub: { fontSize: 12.5, fontWeight: 'bold', color: '#172033', marginTop: 1 },
  changeBtn: { fontSize: 12, fontWeight: 'bold', color: '#D97706' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  itemImg: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#F3F4F6' },
  itemName: { fontSize: 13, fontWeight: 'bold', color: '#172033' },
  itemQty: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  itemPrice: { fontSize: 13, fontWeight: 'bold', color: '#172033', marginTop: 2 },
  pmRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 10, gap: 10, marginBottom: 2 },
  pmActive: { backgroundColor: 'rgba(244, 196, 0, 0.08)' },
  pmText: { flex: 1, fontSize: 12.5, color: '#6B7280' },
  pmTextActive: { color: '#172033', fontWeight: 'bold' },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: '#F4C400', backgroundColor: '#F4C400' },
  radioDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0F172A' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  billLabel: { fontSize: 12.5, color: '#6B7280' },
  billVal: { fontSize: 12.5, fontWeight: 'bold', color: '#172033' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8, marginTop: 4 },
  totalLabel: { fontSize: 14, fontWeight: 'bold', color: '#172033' },
  totalVal: { fontSize: 18, fontWeight: '900', color: '#172033' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 10
  },
  priceSummary: { flex: 1 },
  bottomTotalLabel: { fontSize: 10, color: '#6B7280' },
  bottomTotalVal: { fontSize: 18, fontWeight: '900', color: '#172033' },
  placeOrderBtn: { backgroundColor: '#F4C400', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  placeOrderText: { color: '#0F172A', fontSize: 13, fontWeight: 'bold' },
});
