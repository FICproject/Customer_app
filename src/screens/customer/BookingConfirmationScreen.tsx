import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';

export default function BookingConfirmationScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute();

  const { bookingId, items, totalAmount, paymentMethod, type, date, slot } = (route.params as any) || {};

  const orderTypeLabel = type === 'stay' ? 'Reservation' : type === 'service' ? 'Service Booking' : type === 'travel' ? 'Ticket Booking' : 'Order';

  return (
    <View style={[styles.container, { backgroundColor: '#F7F8FA' }]}>
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <Text style={styles.headerTitle}>{orderTypeLabel} Confirmation</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Success Icon & Badge */}
        <View style={styles.successBanner}>
          <View style={styles.checkCircle}>
            <Icons.Check color="#FFFFFF" size={28} />
          </View>
          <Text style={styles.successTitle}>{orderTypeLabel} Confirmed!</Text>

          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>Booking ID: {bookingId || 'BK-849204'}</Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Booking Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Confirmed</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailVal}>{date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} {slot ? `• ${slot}` : ''}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailVal}>{paymentMethod || 'UPI / Online'}</Text>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>Total Amount Paid</Text>
            <Text style={styles.totalPrice}>₹{(totalAmount || 499).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Summary items */}
        {items && items.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Item Summary</Text>
            {items.map((it: any, idx: number) => (
              <View key={idx} style={styles.itemRow}>
                {it.image && <Image source={{ uri: it.image }} style={styles.itemImg} />}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.itemName}>{it.name || it.title}</Text>
                  <Text style={styles.itemMeta}>{it.category || 'Confirmed'}</Text>
                </View>
                <Text style={styles.itemPrice}>{it.price}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Instructions card */}
        <View style={styles.infoBox}>
          <Icons.Info color="#2563EB" size={18} />
          <Text style={styles.infoText}>
            A confirmation receipt and OTP have been sent to your registered mobile number and email address.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={styles.ordersBtn}
          onPress={() => navigation.navigate('CustomerTabs', { screen: 'Orders' })}
        >
          <Text style={styles.ordersBtnText}>View My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('CustomerTabs', { screen: 'Home' })}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#172033' },
  successBanner: { alignItems: 'center', marginVertical: 16 },
  checkCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  successTitle: { fontSize: 20, fontWeight: 'bold', color: '#172033' },
  idBadge: { backgroundColor: 'rgba(244, 196, 0, 0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  idBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#172033' },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, marginBottom: 14 },
  sectionHeading: { fontSize: 12, fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  detailLabel: { fontSize: 12.5, color: '#6B7280' },
  detailVal: { fontSize: 12.5, fontWeight: 'bold', color: '#172033' },
  statusBadge: { backgroundColor: 'rgba(22, 163, 74, 0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { color: '#16A34A', fontSize: 11, fontWeight: 'bold' },
  totalPrice: { fontSize: 16, fontWeight: '900', color: '#172033' },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  itemImg: { width: 38, height: 38, borderRadius: 6, backgroundColor: '#F3F4F6' },
  itemName: { fontSize: 13, fontWeight: 'bold', color: '#172033' },
  itemMeta: { fontSize: 11, color: '#6B7280' },
  itemPrice: { fontSize: 13, fontWeight: 'bold', color: '#172033' },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(37, 99, 235, 0.06)', borderWidth: 1, borderColor: 'rgba(37, 99, 235, 0.15)', borderRadius: 12, padding: 12 },
  infoText: { flex: 1, fontSize: 11.5, color: '#1E40AF', lineHeight: 16 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', gap: 10, elevation: 10 },
  ordersBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  ordersBtnText: { fontSize: 12.5, fontWeight: 'bold', color: '#172033' },
  homeBtn: { flex: 1, height: 44, borderRadius: 10, backgroundColor: '#F4C400', alignItems: 'center', justifyContent: 'center' },
  homeBtnText: { fontSize: 12.5, fontWeight: 'bold', color: '#0F172A' },
});
