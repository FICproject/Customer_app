import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DeliveryStackParamList } from '../../navigation/AppNavigator';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore, Order } from '../../store/orderStore';
import { socketService } from '../../services/socket';
import { apiFetch, generateMockRoute } from '../../services/api';
import GlassCard from '../../components/GlassCard';
import * as Icons from 'lucide-react-native';

const { height, width } = Dimensions.get('window');

type DeliveryDashboardProp = StackNavigationProp<DeliveryStackParamList, 'DeliveryTabs'>;

const VENDOR_LAT = 12.9348;
const VENDOR_LNG = 77.6189;

export default function DeliveryDashboard() {
  const navigation = useNavigation<DeliveryDashboardProp>();
  const isFocused = useIsFocused();

  const currentUser = useAuthStore((state) => state.currentUser);
  const updateUserStatus = useAuthStore((state) => state.updateUserStatus);

  const activeAssignment = useOrderStore((state) => state.activeAssignment);
  const activeOrder = useOrderStore((state) => state.activeOrder);
  const incomingAssignment = useOrderStore((state) => state.incomingAssignment);
  const incomingTimer = useOrderStore((state) => state.incomingTimer);
  const todayCompleted = useOrderStore((state) => state.todayCompleted);
  const todayEarnings = useOrderStore((state) => state.todayEarnings);
  const rating = useOrderStore((state) => state.rating);

  const loadDashboard = useOrderStore((state) => state.loadDashboard);
  const setIncomingAssignment = useOrderStore((state) => state.setIncomingAssignment);
  const decrementIncomingTimer = useOrderStore((state) => state.decrementIncomingTimer);
  const respondToAssignment = useOrderStore((state) => state.respondToAssignment);
  const stepMilestone = useOrderStore((state) => state.stepMilestone);

  const [loading, setLoading] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [photoProof, setPhotoProof] = useState<string | null>(null);
  const [simIndex, setSimIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // SOS state
  const [sosTriggered, setSosTriggered] = useState(false);

  const simInterval = useRef<any>(null);

  // Sync dashboard
  useEffect(() => {
    if (isFocused && currentUser) {
      setLoading(true);
      loadDashboard(currentUser.id).finally(() => setLoading(false));
    }
  }, [isFocused]);

  // Handle incoming timer
  useEffect(() => {
    if (incomingAssignment) {
      const interval = setInterval(() => {
        if (incomingTimer > 0) {
          decrementIncomingTimer();
        } else {
          handleReject();
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [incomingAssignment, incomingTimer]);

  // Connect socket and listen for assignments
  useEffect(() => {
    if (currentUser) {
      socketService.connect(currentUser.id, 'delivery');
      
      const handleOrderAssigned = (data: any) => {
        console.log('[Socket]: New order auto-allocated:', data);
        setIncomingAssignment(data);
      };

      socketService.on('order_assigned', handleOrderAssigned);
      
      return () => {
        socketService.off('order_assigned', handleOrderAssigned);
        socketService.disconnect();
        if (simInterval.current) clearInterval(simInterval.current);
      };
    }
  }, [currentUser]);

  const handleStatusToggle = async () => {
    if (!currentUser) return;
    const nextStatus = currentUser.status === 'Offline' ? 'Available' : 'Offline';
    try {
      const res = await apiFetch(`/delivery-partners/${currentUser.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus, availability: nextStatus === 'Available' })
      });
      if (res.status === 'success') {
        updateUserStatus(res.data.status, res.data.availability);
      }
    } catch (e) {
      // Fallback update
      updateUserStatus(nextStatus, nextStatus === 'Available');
    }
  };

  const handleAccept = async () => {
    if (!incomingAssignment || !currentUser) return;
    const ok = await respondToAssignment(incomingAssignment.id || incomingAssignment.assignmentId, currentUser.id, 'accept');
    if (ok) {
      Alert.alert('Assignment Accepted', 'Navigate to vendor shop to pick up items.');
    }
  };

  const handleReject = async () => {
    if (!incomingAssignment || !currentUser) return;
    await respondToAssignment(incomingAssignment.id || incomingAssignment.assignmentId, currentUser.id, 'reject');
  };

  // Milestone flow trigger
  const handleNextStep = async (step: string) => {
    if (!activeOrder || !currentUser) return;

    if (step === 'complete') {
      if (!otpInput) {
        Alert.alert('OTP Required', 'Please input the customer OTP to verify delivery.');
        return;
      }
      if (!photoProof) {
        Alert.alert('Proof Required', 'Please take a photo proof to complete delivery.');
        return;
      }
    }

    setLoading(true);
    const res = await stepMilestone(activeOrder.id, currentUser.id, step, otpInput, photoProof);
    setLoading(false);

    if (res.success) {
      if (step === 'complete') {
        setOtpInput('');
        setPhotoProof(null);
        setIsSimulating(false);
        if (simInterval.current) clearInterval(simInterval.current);
        Alert.alert('Delivery Completed', 'Earnings added to wallet!');
      } else if (step === 'start') {
        // Start GPS tracking simulation
        startGpsSimulation();
      }
    } else {
      Alert.alert('Verification Failed', res.message || 'Incorrect OTP code.');
    }
  };

  // Simulate rider movement from vendor to customer
  const startGpsSimulation = () => {
    if (!activeOrder || !currentUser || isSimulating) return;

    setIsSimulating(true);
    setSimIndex(0);

    const cLat = Number(activeOrder.customer_latitude) || (VENDOR_LAT + 0.015);
    const cLng = Number(activeOrder.customer_longitude) || (VENDOR_LNG + 0.01);
    
    // Generate route steps
    const route = generateMockRoute(VENDOR_LAT, VENDOR_LNG, cLat, cLng, 12);
    socketService.joinOrder(activeOrder.id);

    let currentStep = 0;
    simInterval.current = setInterval(async () => {
      currentStep++;
      if (currentStep >= route.length) {
        clearInterval(simInterval.current);
        setIsSimulating(false);
        // Arrived at customer
        handleNextStep('near_customer');
        return;
      }

      setSimIndex(currentStep);
      const coords = route[currentStep];
      const distance = 4.2 * (1 - currentStep / route.length);
      const eta = Math.ceil(15 * (1 - currentStep / route.length));

      // Emit live coordinate updates to customer
      socketService.sendLocation(
        currentUser.id,
        activeOrder.id,
        coords[0],
        coords[1],
        28, // speed
        88, // battery
        `Street Point ${currentStep}`
      );
    }, 4500); // simulation tick every 4.5 seconds
  };

  const handleTakePhotoSim = () => {
    setLoading(true);
    setTimeout(() => {
      setPhotoProof('https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300&auto=format&fit=crop&q=80');
      setLoading(false);
      Alert.alert('Photo Captured', 'Delivery proof attached.');
    }, 1000);
  };

  const triggerSos = () => {
    setSosTriggered(true);
    socketService.triggerLocalEvent('sos_triggered', { partnerId: currentUser?.id });
    setTimeout(() => {
      setSosTriggered(false);
      Alert.alert('SOS Triggered', 'Emergency services and logistics desk have been contacted.');
    }, 2000);
  };

  const isOnline = currentUser?.status !== 'Offline';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Rider Dashboard</Text>
          <Text style={styles.headerSub}>DEL-10023</Text>
        </View>

        {/* Online Toggle Switch */}
        <TouchableOpacity
          style={[styles.statusToggleBtn, isOnline ? styles.onlineBtn : styles.offlineBtn]}
          onPress={handleStatusToggle}
        >
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : 'rgba(255,255,255,0.3)' }]} />
          <Text style={styles.statusToggleText}>{isOnline ? 'Online' : 'Offline'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Earnings Dashboard */}
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCard}>
            <Icons.Package color="#3B82F6" size={18} />
            <Text style={styles.statVal}>{todayCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Icons.DollarSign color="#10B981" size={18} />
            <Text style={styles.statVal}>₹{todayEarnings}</Text>
            <Text style={styles.statLabel}>Today's Pay</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Icons.Star color="#F4C400" size={18} fill="#F4C400" />
            <Text style={styles.statVal}>{rating}</Text>
            <Text style={styles.statLabel}>Rider Score</Text>
          </GlassCard>
        </View>

        {/* Active Order / Milestone control */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeader}>ACTIVE ASSIGNMENT</Text>
          {activeOrder ? (
            <GlassCard style={styles.activeOrderCard}>
              <View style={styles.orderCardHeader}>
                <Text style={styles.activeOrderNo}>#{activeOrder.order_number}</Text>
                <View style={styles.activeStatusBadge}>
                  <Text style={styles.activeStatusText}>{activeOrder.status}</Text>
                </View>
              </View>

              {/* Vendor & Customer Address Blocks */}
              <View style={styles.addressList}>
                <View style={styles.addressItem}>
                  <View style={[styles.markerBullet, { backgroundColor: '#8B5CF6' }]}>
                    <Text style={styles.bulletEmoji}>🏪</Text>
                  </View>
                  <View style={styles.addressTextCol}>
                    <Text style={styles.addressLabel}>PICKUP VENDOR</Text>
                    <Text style={styles.addressTitle}>ABC Electronics Hub</Text>
                    <Text style={styles.addressSub}>MG Road, Bengaluru</Text>
                  </View>
                </View>

                <View style={styles.addressLine} />

                <View style={styles.addressItem}>
                  <View style={[styles.markerBullet, { backgroundColor: '#10B981' }]}>
                    <Text style={styles.bulletEmoji}>🏠</Text>
                  </View>
                  <View style={styles.addressTextCol}>
                    <Text style={styles.addressLabel}>DELIVERY DROP</Text>
                    <Text style={styles.addressTitle}>{activeOrder.customer_name}</Text>
                    <Text style={styles.addressSub}>{activeOrder.customer_address}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Action Switch buttons based on status */}
              {activeOrder.status === 'Delivery Partner Accepted' && (
                <TouchableOpacity
                  style={styles.milestoneBtn}
                  activeOpacity={0.8}
                  onPress={() => handleNextStep('pickup')}
                >
                  <Text style={styles.milestoneBtnText}>Confirm Order Picked Up</Text>
                </TouchableOpacity>
              )}

              {activeOrder.status === 'Picked Up' && (
                <TouchableOpacity
                  style={[styles.milestoneBtn, { backgroundColor: '#3B82F6' }]}
                  activeOpacity={0.8}
                  onPress={() => handleNextStep('start')}
                >
                  <Icons.Navigation color="#FFF" size={14} style={{ marginRight: 6 }} />
                  <Text style={[styles.milestoneBtnText, { color: '#FFF' }]}>Start Route / Enable GPS</Text>
                </TouchableOpacity>
              )}

              {activeOrder.status === 'Out For Delivery' && (
                <View style={styles.gpsSimActive}>
                  <ActivityIndicator color="#F4C400" size="small" />
                  <Text style={styles.gpsSimActiveText}>Simulating street travel... (Step {simIndex}/12)</Text>
                </View>
              )}

              {['Delivery Partner Accepted', 'Picked Up', 'Out For Delivery', 'Near Customer'].includes(activeOrder.status) && (
                <View style={styles.completionFlow}>
                  <Text style={styles.inputLabel}>VERIFICATION OTP</Text>
                  <View style={styles.otpRow}>
                    <TextInput
                      style={styles.otpInput}
                      placeholder="Enter 4-digit code"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      keyboardType="number-pad"
                      maxLength={4}
                      value={otpInput}
                      onChangeText={setOtpInput}
                    />
                    <TouchableOpacity
                      style={styles.photoBtn}
                      onPress={handleTakePhotoSim}
                    >
                      <Icons.Camera color={photoProof ? '#10B981' : '#F4C400'} size={18} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deliverBtn}
                      onPress={() => handleNextStep('complete')}
                    >
                      <Text style={styles.deliverBtnText}>Deliver</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* View map tracking details */}
              <TouchableOpacity
                style={styles.mapLinkBtn}
                onPress={() => navigation.navigate('DeliveryMap', { orderId: activeOrder.id })}
              >
                <Icons.Map color="#F4C400" size={14} />
                <Text style={styles.mapLinkText}>Open Navigation Map</Text>
              </TouchableOpacity>
            </GlassCard>
          ) : (
            <GlassCard style={styles.emptyOrderCard}>
              <Icons.Truck color="rgba(255, 255, 255, 0.2)" size={38} />
              <Text style={styles.emptyOrderText}>No active delivery</Text>
              <Text style={styles.emptyOrderSub}>
                {isOnline ? 'Keep status "Online" and wait for incoming assignments.' : 'Go Online to start receiving assignments.'}
              </Text>
            </GlassCard>
          )}
        </View>

        {/* SOS Panel */}
        <TouchableOpacity
          style={styles.sosButton}
          activeOpacity={0.8}
          onPress={triggerSos}
          disabled={sosTriggered}
        >
          <Icons.ShieldAlert color="#FFF" size={20} />
          <Text style={styles.sosText}>{sosTriggered ? 'Triggering SOS Alert...' : 'TRIGGER EMERGENCY SOS'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* INCOMING ASSIGNMENT MODAL POPUP */}
      <Modal
        visible={incomingAssignment !== null}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalBg}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalHeader}>NEW INCOMING ASSIGNMENT</Text>
            
            <View style={styles.timerRingContainer}>
              <Text style={styles.timerText}>{incomingTimer}s</Text>
            </View>

            <View style={styles.modalDetails}>
              <View style={styles.modalDetailRow}>
                <Icons.MapPin color="rgba(255,255,255,0.4)" size={14} />
                <Text style={styles.modalDetailVal}>ABC Electronics ➔ Koramangala</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Icons.DollarSign color="#10B981" size={14} />
                <Text style={[styles.modalDetailVal, { color: '#10B981', fontWeight: 'bold' }]}>
                  Payout: ₹65.00 (+ ₹10.00 Incentive)
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
                <Text style={styles.rejectText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.05,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSub: {
    fontSize: 10,
    color: '#F4C400',
    marginTop: 2,
    fontWeight: 'bold',
  },
  statusToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  onlineBtn: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  offlineBtn: {
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusToggleText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 44) / 3,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(13, 22, 54, 0.4)',
  },
  statVal: {
    fontSize: 16,
    fontWeight: 'black',
    color: '#FFF',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: 'bold',
    marginTop: 2,
  },
  cardSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  activeOrderCard: {
    backgroundColor: 'rgba(13, 22, 54, 0.5)',
    padding: 16,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeOrderNo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  activeStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(244, 196, 0, 0.12)',
    borderRadius: 6,
  },
  activeStatusText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#F4C400',
    textTransform: 'uppercase',
  },
  addressList: {
    marginTop: 18,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markerBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletEmoji: {
    fontSize: 12,
  },
  addressTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  addressLabel: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.8,
  },
  addressTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 2,
  },
  addressSub: {
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 1,
  },
  addressLine: {
    width: 1.5,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 13,
    marginVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 14,
  },
  milestoneBtn: {
    backgroundColor: '#F4C400',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  milestoneBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#050B1E',
  },
  gpsSimActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 196, 0, 0.12)',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(244, 196, 0, 0.2)',
  },
  gpsSimActiveText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F4C400',
    marginLeft: 8,
  },
  completionFlow: {
    marginTop: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  otpInput: {
    flex: 1,
    backgroundColor: '#030714',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    color: '#FFF',
    paddingHorizontal: 10,
    height: 40,
    fontSize: 12,
  },
  photoBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  deliverBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliverBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  mapLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  mapLinkText: {
    fontSize: 11,
    color: '#F4C400',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  emptyOrderCard: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: 'rgba(13, 22, 54, 0.4)',
  },
  emptyOrderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 14,
  },
  emptyOrderSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 6,
    lineHeight: 16,
  },
  sosButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  sosText: {
    fontSize: 12,
    fontWeight: 'black',
    color: '#FFF',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 30, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    padding: 24,
    backgroundColor: '#0D1636',
    borderColor: '#F4C400',
    borderWidth: 1.5,
  },
  modalHeader: {
    fontSize: 13,
    fontWeight: '900',
    color: '#F4C400',
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  timerRingContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#F4C400',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 20,
    backgroundColor: 'rgba(244, 196, 0, 0.05)',
  },
  timerText: {
    fontSize: 22,
    fontWeight: 'black',
    color: '#FFF',
  },
  modalDetails: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  modalDetailVal: {
    fontSize: 12,
    color: '#FFF',
    marginLeft: 8,
    fontWeight: 'semibold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  rejectText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.7)',
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#F4C400',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  acceptText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#050B1E',
  },
});
