import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CustomerStackParamList } from '../../navigation/AppNavigator';
import { useOrderStore, Order } from '../../store/orderStore';
import GlassCard from '../../components/GlassCard';
import * as Icons from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';

const { height } = Dimensions.get('window');

type CustomerOrdersProp = StackNavigationProp<CustomerStackParamList, 'CustomerTabs'>;

export default function CustomerOrders() {
  const navigation = useNavigation<CustomerOrdersProp>();
  const isFocused = useIsFocused();
  const route = useRoute<any>();
  const colors = useThemeStore((state) => state.colors);
  
  const allOrders = useOrderStore((state) => state.allOrders);
  const loadAllOrders = useOrderStore((state) => state.loadAllOrders);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'bookings'>('orders');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const renderTimelineStep = (title: string, desc: string, isCompleted: boolean, isLast = false) => {
    return (
      <View style={styles.stepRow}>
        <View style={styles.indicatorCol}>
          <View style={[
            styles.dot,
            isCompleted ? styles.dotCompleted : [styles.dotPending, { backgroundColor: colors.grayDark, borderColor: colors.cardBorder }]
          ]}>
            {isCompleted && <Icons.Check color="#FFFFFF" size={8} strokeWidth={4} />}
          </View>
          {!isLast && (
            <View style={[
              styles.line,
              isCompleted ? styles.lineCompleted : [styles.linePending, { backgroundColor: colors.cardBorder }]
            ]} />
          )}
        </View>
        <View style={styles.stepInfo}>
          <Text style={[
            styles.stepTitle, 
            { color: colors.text, opacity: isCompleted ? 1 : 0.4 }
          ]}>
            {title}
          </Text>
          <Text style={[styles.stepDesc, { color: colors.text, opacity: 0.35 }]}>{desc}</Text>
        </View>
      </View>
    );
  };

  // Load orders when focused
  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      loadAllOrders().finally(() => setLoading(false));
    }
  }, [isFocused]);

  // Sync activeTab with route params if navigated from elsewhere
  useEffect(() => {
    if (route.params?.activeTab) {
      setActiveTab(route.params.activeTab);
    }
  }, [route.params?.activeTab]);

  const isBooking = (productDetails: string) => {
    const details = productDetails.toLowerCase();
    return (
      details.includes('consultation') ||
      details.includes('appointment') ||
      details.includes('service') ||
      details.includes('plumber') ||
      details.includes('electrician') ||
      details.includes('ticket') ||
      details.includes('booking') ||
      details.includes('hotel') ||
      details.includes('stay') ||
      details.includes('flight') ||
      details.includes('doctor') ||
      details.includes('clinic') ||
      details.includes('hospital') ||
      details.includes('class') ||
      details.includes('course') ||
      details.includes('cardiologist') ||
      details.includes('visit') ||
      details.includes('repair') ||
      details.includes('pass')
    );
  };

  const filteredOrders = allOrders.filter((order) => {
    if ((order as any).order_type) {
      return activeTab === 'bookings'
        ? (order as any).order_type === 'booking'
        : (order as any).order_type === 'order';
    }
    const check = isBooking(order.product_details);
    return activeTab === 'bookings' ? check : !check;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
      case 'Completed':
        return '#10B981';
      case 'Out For Delivery':
      case 'Near Customer':
        return '#3B82F6';
      case 'Order Received':
      case 'Preparing':
      case 'Ready For Pickup':
      case 'Assigned To Delivery Partner':
      case 'Delivery Partner Accepted':
        return '#F4C400';
      default:
        return '#FFF';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icons.ArrowLeft color={colors.text} size={18} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {activeTab === 'orders' ? 'My Orders' : 'My Bookings'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => loadAllOrders()}>
          <Icons.RefreshCw color={colors.primary} size={16} />
        </TouchableOpacity>
      </View>

      {/* Tabs Switcher */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <TouchableOpacity 
          style={[
            styles.tabBtn, 
            activeTab === 'orders' && [styles.activeTabBtn, { backgroundColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[
            styles.tabText, 
            { color: colors.text, opacity: activeTab === 'orders' ? 1 : 0.6 },
            activeTab === 'orders' && { color: colors.background === '#F8FAFC' ? '#FFFFFF' : '#050B1E' }
          ]}>
            Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.tabBtn, 
            activeTab === 'bookings' && [styles.activeTabBtn, { backgroundColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('bookings')}
        >
          <Text style={[
            styles.tabText, 
            { color: colors.text, opacity: activeTab === 'bookings' ? 1 : 0.6 },
            activeTab === 'bookings' && { color: colors.background === '#F8FAFC' ? '#FFFFFF' : '#050B1E' }
          ]}>
            Bookings
          </Text>
        </TouchableOpacity>
      </View>

      {loading && filteredOrders.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color="#F4C400" size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icons.Inbox color={colors.text} size={48} style={{ opacity: 0.2 }} />
              <Text style={[styles.emptyText, { color: colors.text, opacity: 0.8 }]}>
                {activeTab === 'orders' ? 'No orders found' : 'No bookings found'}
              </Text>
              <Text style={[styles.emptySub, { color: colors.text, opacity: 0.5 }]}>
                {activeTab === 'orders'
                  ? 'Visit the home feed and order premium items today.'
                  : 'Book expert services, travel, stays, and consultations.'}
              </Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <GlassCard key={order.id} style={styles.orderCard}>
                <TouchableOpacity 
                  activeOpacity={0.9} 
                  onPress={() => setExpandedCardId(expandedCardId === order.id ? null : order.id)}
                >
                  {/* Header Row */}
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={[styles.orderNoLabel, { color: colors.text, opacity: 0.5 }]}>
                        {activeTab === 'orders' ? 'ORDER NUMBER' : 'BOOKING NUMBER'}
                      </Text>
                      <Text style={[styles.orderNo, { color: colors.text }]}>#{order.order_number}</Text>
                    </View>
                    <View style={[styles.statusBadge, { borderColor: getStatusColor(order.status) + '40', backgroundColor: getStatusColor(order.status) + '12' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
                    </View>
                  </View>

                  {/* Details */}
                  <View style={[styles.detailsBox, { 
                    backgroundColor: colors.background === '#F8FAFC' ? 'rgba(15, 23, 42, 0.04)' : 'rgba(0, 0, 0, 0.15)',
                    borderColor: colors.background === '#F8FAFC' ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.05)'
                  }]}>
                    <Text style={[styles.detailLabel, { color: colors.text, opacity: 0.5 }]}>ITEMS / SERVICE</Text>
                    <Text style={[styles.detailVal, { color: colors.text }]}>{order.product_details}</Text>

                    <View style={[styles.divider, { backgroundColor: colors.background === '#F8FAFC' ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.06)' }]} />

                    <View style={styles.metaRow}>
                      <View>
                        <Text style={[styles.detailLabel, { color: colors.text, opacity: 0.5 }]}>AMOUNT Paid</Text>
                        <Text style={[styles.amountText, { color: colors.primary }]}>₹{order.amount.toLocaleString('en-IN')}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.detailLabel, { color: colors.text, opacity: 0.5 }]}>DATE</Text>
                        <Text style={[styles.dateText, { color: colors.text }]}>
                          {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Expandable Status Tracker Details */}
                {expandedCardId === order.id && (
                  <View style={styles.trackerContainer}>
                    <View style={styles.trackerHeader}>
                      <Text style={[styles.trackerTitle, { color: colors.text, opacity: 0.55 }]}>
                        {activeTab === 'orders' ? 'DELIVERY STATUS' : 'SERVICE STATUS'}
                      </Text>
                      <View style={styles.trackerStatusBadge}>
                        <Text style={styles.trackerStatusText}>{order.status}</Text>
                      </View>
                    </View>

                    {/* Step-by-step progress timeline */}
                    <View style={styles.timeline}>
                      {activeTab === 'orders' ? (
                        <>
                          {renderTimelineStep(
                            'Order Placed',
                            'Your order was placed successfully',
                            true
                          )}
                          {renderTimelineStep(
                            'Preparing / Dispatched',
                            'Seller is packaging your items',
                            ['Preparing', 'Ready For Pickup', 'Assigned To Delivery Partner', 'Delivery Partner Accepted', 'Picked Up', 'Out For Delivery', 'Near Customer', 'Delivered', 'Completed'].includes(order.status)
                          )}
                          {renderTimelineStep(
                            'Out For Delivery',
                            'Delivery agent is heading your way',
                            ['Out For Delivery', 'Near Customer', 'Delivered', 'Completed'].includes(order.status)
                          )}
                          {renderTimelineStep(
                            'Delivered',
                            'Package handed over successfully',
                            ['Delivered', 'Completed'].includes(order.status),
                            true
                          )}
                        </>
                      ) : (
                        <>
                          {renderTimelineStep(
                            'Booking Confirmed',
                            'Appointment successfully reserved',
                            true
                          )}
                          {renderTimelineStep(
                            'Agent Assigned',
                            'Professional service partner allocated',
                            ['Preparing', 'Ready For Pickup', 'Assigned To Delivery Partner', 'Delivery Partner Accepted', 'Picked Up', 'Out For Delivery', 'Near Customer', 'Delivered', 'Completed'].includes(order.status)
                          )}
                          {renderTimelineStep(
                            'Service In Progress',
                            'Partner is executing service onsite',
                            ['Out For Delivery', 'Near Customer', 'Delivered', 'Completed'].includes(order.status)
                          )}
                          {renderTimelineStep(
                            'Completed',
                            'Job finished and service marked closed',
                            ['Delivered', 'Completed'].includes(order.status),
                            true
                          )}
                        </>
                      )}
                    </View>
                  </View>
                )}

                {/* Tracking trigger */}
                {['Assigned To Delivery Partner', 'Delivery Partner Accepted', 'Picked Up', 'Out For Delivery', 'Near Customer'].includes(order.status) && (
                  <TouchableOpacity
                    style={styles.trackBtn}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('LiveTracking', { orderId: order.id })}
                  >
                    <Icons.Navigation color="#050B1E" size={14} />
                    <Text style={styles.trackBtnText}>Live Route Tracking Map</Text>
                  </TouchableOpacity>
                )}
              </GlassCard>
            ))
          )}
        </ScrollView>
      )}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabBtn: {
    backgroundColor: '#F4C400',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#050B1E',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.15,
  },
  emptyText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySub: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  orderCard: {
    padding: 16,
    marginTop: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNoLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1,
  },
  orderNo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  detailsBox: {
    marginTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailLabel: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.8,
  },
  detailVal: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 3,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F4C400',
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
    fontWeight: 'bold',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4C400',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 14,
  },
  trackBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#050B1E',
    marginLeft: 6,
  },
  trackerContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  trackerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  trackerTitle: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  trackerStatusBadge: {
    backgroundColor: 'rgba(244, 196, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  trackerStatusText: {
    color: '#F4C400',
    fontSize: 9,
    fontWeight: 'bold',
  },
  timeline: {
    paddingLeft: 8,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dotCompleted: {
    backgroundColor: '#10B981',
  },
  dotPending: {
    backgroundColor: '#0D1636',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  lineCompleted: {
    backgroundColor: '#10B981',
  },
  linePending: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  stepInfo: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 12,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepTitleCompleted: {
    color: '#FFFFFF',
  },
  stepTitlePending: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  stepDesc: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 10,
    marginTop: 2,
  },
});
