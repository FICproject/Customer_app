import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useOrderStore } from '../../store/orderStore';
import { apiFetch } from '../../services/api';
import MapComponent from '../../components/MapComponent';
import GlassCard from '../../components/GlassCard';
import * as Icons from 'lucide-react-native';

const { height } = Dimensions.get('window');

const VENDOR_LAT = 12.9348;
const VENDOR_LNG = 77.6189;

export default function DeliveryMap() {
  const route = useRoute();
  const navigation = useNavigation();
  const orderId = (route.params as any)?.orderId || 'active';

  const activeOrder = useOrderStore((state) => state.activeOrder);
  const activeAssignment = useOrderStore((state) => state.activeAssignment);

  const [loading, setLoading] = useState(true);
  const [riderCoords, setRiderCoords] = useState({ lat: VENDOR_LAT, lng: VENDOR_LNG });
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [distanceRemaining, setDistanceRemaining] = useState(4.2);
  const [eta, setEta] = useState(15);

  const loadRouteDetails = async () => {
    if (!activeOrder) {
      setLoading(false);
      return;
    }

    try {
      setRiderCoords({
        lat: VENDOR_LAT,
        lng: VENDOR_LNG
      });

      const res = await apiFetch('/maps/route', {
        method: 'POST',
        body: JSON.stringify({
          startLat: VENDOR_LAT,
          startLng: VENDOR_LNG,
          endLat: Number(activeOrder.customer_latitude) || (VENDOR_LAT + 0.015),
          endLng: Number(activeOrder.customer_longitude) || (VENDOR_LNG + 0.01)
        })
      });

      if (res.status === 'success') {
        setRoutePath(res.data.route);
        setDistanceRemaining(res.data.distance);
        setEta(res.data.duration);
      }
    } catch (e) {
      console.warn('Failed to calculate routing map:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRouteDetails();
  }, [activeOrder]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color="#F4C400" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icons.ChevronLeft color="#FFF" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Navigation</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Map View */}
      {activeOrder ? (
        <View style={{ flex: 1 }}>
          <MapComponent
            riderLat={riderCoords.lat}
            riderLng={riderCoords.lng}
            vendorLat={VENDOR_LAT}
            vendorLng={VENDOR_LNG}
            customerLat={Number(activeOrder.customer_latitude) || (VENDOR_LAT + 0.015)}
            customerLng={Number(activeOrder.customer_longitude) || (VENDOR_LNG + 0.01)}
            route={routePath}
            distance={distanceRemaining}
            eta={eta}
            customerName={activeOrder.customer_name}
          />

          {/* Quick HUD Card overlay */}
          <GlassCard style={styles.hudCard}>
            <View style={styles.hudHeader}>
              <Text style={styles.hudTitle}>Navigation HUD</Text>
              <Text style={styles.hudStatus}>{activeOrder.status}</Text>
            </View>
            <Text style={styles.hudAddress} numberOfLines={1}>{activeOrder.customer_address}</Text>
            <View style={styles.hudMetrics}>
              <View style={styles.metricItem}>
                <Icons.Milestone color="#F4C400" size={14} />
                <Text style={styles.metricText}>{distanceRemaining.toFixed(1)} km left</Text>
              </View>
              <View style={styles.metricItem}>
                <Icons.Clock color="#F4C400" size={14} />
                <Text style={styles.metricText}>{eta} mins</Text>
              </View>
            </View>
          </GlassCard>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Icons.Navigation color="rgba(255,255,255,0.2)" size={48} />
          <Text style={styles.emptyText}>No Active Delivery Route</Text>
          <Text style={styles.emptySub}>Please accept an order on your dashboard first.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B1E',
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#050B1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.05,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  hudCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(5, 11, 30, 0.85)',
    padding: 16,
  },
  hudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hudTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
  },
  hudStatus: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F4C400',
    textTransform: 'uppercase',
  },
  hudAddress: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 6,
  },
  hudMetrics: {
    flexDirection: 'row',
    marginTop: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metricText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 6,
  },
});
