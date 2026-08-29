import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { apiFetch } from '../../services/api';
import { socketService } from '../../services/socket';
import { useAuthStore } from '../../store/authStore';
import MapComponent from '../../components/MapComponent';
import GlassCard from '../../components/GlassCard';
import * as Icons from 'lucide-react-native';

const { height } = Dimensions.get('window');

const VENDOR_LAT = 12.9348;
const VENDOR_LNG = 77.6189;

export default function LiveTracking() {
  const route = useRoute();
  const navigation = useNavigation();
  const orderId = (route.params as any)?.orderId || 'ORD1244';

  const currentUser = useAuthStore((state) => state.currentUser);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [partner, setPartner] = useState<any>(null);

  // Live map coordinates
  const [riderCoords, setRiderCoords] = useState<{ lat: number; lng: number }>({ lat: VENDOR_LAT, lng: VENDOR_LNG });
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [distanceRemaining, setDistanceRemaining] = useState(4.2);
  const [eta, setEta] = useState(15);

  const loadTrackingData = async () => {
    try {
      const res = await apiFetch(`/orders/${orderId}`);
      if (res.status === 'success') {
        const { order: o, timeline: t, partner: p, tracking } = res.data;
        setOrder(o);
        setTimeline(t || []);
        setPartner(p);
        
        if (tracking) {
          setRiderCoords({ lat: Number(tracking.latitude), lng: Number(tracking.longitude) });
        } else if (p) {
          setRiderCoords({ lat: Number(p.current_latitude), lng: Number(p.current_longitude) });
        }

        // Fetch route calculations
        const routeRes = await apiFetch('/maps/route', {
          method: 'POST',
          body: JSON.stringify({
            startLat: tracking ? Number(tracking.latitude) : (p ? Number(p.current_latitude) : VENDOR_LAT),
            startLng: tracking ? Number(tracking.longitude) : (p ? Number(p.current_longitude) : VENDOR_LNG),
            endLat: Number(o.customer_latitude) || (VENDOR_LAT + 0.015),
            endLng: Number(o.customer_longitude) || (VENDOR_LNG + 0.01)
          })
        });

        if (routeRes.status === 'success') {
          setRoutePath(routeRes.data.route);
          setDistanceRemaining(routeRes.data.distance);
          setEta(routeRes.data.duration);
        }
      }
    } catch (err) {
      console.warn('Failed to load tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrackingData();

    // Connect to realtime sockets
    socketService.connect(currentUser?.id || 'cust1', 'customer');
    socketService.joinOrder(orderId);

    const handleLocationUpdate = (data: any) => {
      console.log('[Socket]: Live coordinate received:', data);
      if (data.orderId === orderId) {
        setRiderCoords({ lat: Number(data.latitude), lng: Number(data.longitude) });
        if (data.distance) setDistanceRemaining(data.distance);
        if (data.eta) setEta(data.eta);
      }
    };

    const handleStatusUpdate = () => {
      loadTrackingData();
    };

    // Listen to live coordinate changes from delivery partner
    socketService.on('partner_location_updated', handleLocationUpdate);

    // Listen to milestone updates
    socketService.on('order_status_updated', handleStatusUpdate);

    return () => {
      socketService.leaveOrder(orderId);
      socketService.off('partner_location_updated', handleLocationUpdate);
      socketService.off('order_status_updated', handleStatusUpdate);
    };
  }, [orderId, currentUser?.id]);

  const getStepProgress = () => {
    if (!order) return 0;
    switch (order.status) {
      case 'Order Received': return 0.1;
      case 'Preparing': return 0.3;
      case 'Ready For Pickup': return 0.5;
      case 'Assigned To Delivery Partner':
      case 'Delivery Partner Accepted': return 0.6;
      case 'Picked Up': return 0.7;
      case 'Out For Delivery': return 0.85;
      case 'Near Customer': return 0.95;
      case 'Delivered':
      case 'Completed': return 1;
      default: return 0.1;
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color="#F4C400" size="large" />
        <Text style={styles.loaderText}>Establishing Realtime Link...</Text>
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Live Tracking</Text>
          <Text style={styles.headerSub}>ID: #{order?.order_number}</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadTrackingData}>
          <Icons.RefreshCw color="#F4C400" size={16} />
        </TouchableOpacity>
      </View>

      {/* Map Segment */}
      <View style={styles.mapContainer}>
        <MapComponent
          riderLat={riderCoords.lat}
          riderLng={riderCoords.lng}
          vendorLat={VENDOR_LAT}
          vendorLng={VENDOR_LNG}
          customerLat={Number(order?.customer_latitude) || (VENDOR_LAT + 0.015)}
          customerLng={Number(order?.customer_longitude) || (VENDOR_LNG + 0.01)}
          route={routePath}
          distance={distanceRemaining}
          eta={eta}
          riderName={partner?.name}
          customerName={order?.customer_name}
        />
      </View>

      {/* Info bottom panel */}
      <ScrollView contentContainerStyle={styles.detailsContent} showsVerticalScrollIndicator={false}>
        {/* Status card */}
        <GlassCard style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.cardNoLabel}>CURRENT STATUS</Text>
              <Text style={styles.statusHeadline}>{order?.status}</Text>
            </View>
            <View style={styles.etaBox}>
              <Text style={styles.etaVal}>{eta}</Text>
              <Text style={styles.etaLabel}>MINS ETA</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${getStepProgress() * 100}%` }]} />
          </View>

          {/* Partner box */}
          {partner ? (
            <View style={styles.partnerRow}>
              <View style={styles.partnerAvatar}>
                <Icons.User color="#050B1E" size={20} />
              </View>
              <View style={styles.partnerInfo}>
                <Text style={styles.partnerName}>{partner.name}</Text>
                <Text style={styles.partnerVehicle}>{partner.vehicle_type} ({partner.vehicle_number})</Text>
              </View>
              <TouchableOpacity style={styles.callBtn}>
                <Icons.Phone color="#F4C400" size={16} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.waitingPartner}>
              <Icons.Clock color="rgba(255, 255, 255, 0.3)" size={16} />
              <Text style={styles.waitingText}>Waiting for delivery partner assignment...</Text>
            </View>
          )}
        </GlassCard>

        {/* Milestone history */}
        <View style={styles.timelineContainer}>
          <Text style={styles.sectionHeader}>ORDER JOURNEY LOG</Text>
          {timeline.map((step, idx) => (
            <View key={idx} style={styles.timelineRow}>
              <View style={styles.timelineNodeContainer}>
                <View style={styles.timelineNode} />
                {idx < timeline.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineDetails}>
                <Text style={styles.timelineStatus}>{step.status}</Text>
                <Text style={styles.timelineNotes}>{step.notes}</Text>
                <Text style={styles.timelineTime}>
                  {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  loaderText: {
    marginTop: 16,
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
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
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSub: {
    fontSize: 10,
    color: '#F4C400',
    marginTop: 2,
    fontWeight: 'bold',
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    height: 280,
    margin: 16,
  },
  detailsContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  statusCard: {
    padding: 16,
    backgroundColor: 'rgba(13, 22, 54, 0.4)',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNoLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 1,
  },
  statusHeadline: {
    fontSize: 16,
    fontWeight: 'black',
    color: '#F4C400',
    marginTop: 4,
  },
  etaBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  etaVal: {
    fontSize: 14,
    fontWeight: 'black',
    color: '#FFF',
  },
  etaLabel: {
    fontSize: 7.5,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 'bold',
    marginTop: 2,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 14,
  },
  partnerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4C400',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  partnerName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
  },
  partnerVehicle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 2,
  },
  callBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(244, 196, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingPartner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 10,
    borderRadius: 10,
  },
  waitingText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.45)',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  timelineContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineNodeContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineNode: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F4C400',
    borderWidth: 2,
    borderColor: '#050B1E',
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: -2,
    marginBottom: -18,
  },
  timelineDetails: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  timelineStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  timelineNotes: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 3,
  },
  timelineTime: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.35)',
    marginTop: 6,
  },
});
