import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';
import { useNotificationStore } from '../../store/notificationStore';
import GlassCard from '../../components/GlassCard';

export default function CustomerNotifications() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const colors = useThemeStore((state) => state.colors);
  const themeMode = useThemeStore((state) => state.themeMode);
  const isLight = themeMode === 'light' || colors.background !== '#050B1E';

  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const clearAll = useNotificationStore((state) => state.clearAll);

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'order' | 'offer'>('all');

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'unread') return item.unread;
    if (activeTab === 'order') return item.category === 'order';
    if (activeTab === 'offer') return item.category === 'offer';
    return true;
  });

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notification alerts?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => clearAll() },
      ]
    );
  };

  const handleCardPress = (notif: any) => {
    if (notif.unread) {
      markAsRead(notif.id);
    }
    if (notif.targetScreen) {
      if (notif.targetScreen === 'Orders') {
        navigation.navigate('CustomerTabs', { screen: 'Orders' });
      } else if (notif.targetScreen === 'Membership') {
        navigation.navigate('CustomerTabs', { screen: 'Membership' });
      } else {
        navigation.navigate(notif.targetScreen, notif.targetParams);
      }
    }
  };

  const renderIcon = (iconName: string) => {
    const IconComp = (Icons as any)[iconName];
    if (!IconComp) return <Icons.Bell color="#F5B800" size={18} />;
    return <IconComp color="#F5B800" size={18} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Navigation Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: isLight ? '#FFF1C7' : colors.background,
            borderBottomColor: isLight ? 'rgba(242, 183, 5, 0.25)' : colors.cardBorder,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icons.ArrowLeft color={colors.text} size={20} />
        </TouchableOpacity>

        <View style={styles.titleGroup}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} New</Text>
            </View>
          )}
        </View>

        <View style={styles.headerRightActions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} activeOpacity={0.7} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>Read All</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7} style={styles.clearBtn}>
              <Icons.Trash2 color="#EF4444" size={16} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter Tabs */}
      {notifications.length > 0 && (
        <View style={[styles.filterBar, { borderBottomColor: isLight ? '#F1EAD8' : colors.cardBorder }]}>
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'order', label: 'Orders' },
            { id: 'offer', label: 'Offers' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.filterTab,
                  isActive && styles.filterTabActive,
                  isActive && { backgroundColor: isLight ? '#F5B800' : 'rgba(245, 184, 0, 0.15)' },
                ]}
                onPress={() => setActiveTab(tab.id as any)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: isLight ? (isActive ? '#0F172A' : '#64748B') : isActive ? '#F5B800' : 'rgba(255,255,255,0.6)' },
                    isActive && { fontWeight: 'bold' },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Notifications List Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              activeOpacity={0.88}
              onPress={() => handleCardPress(notif)}
              style={styles.cardContainer}
            >
              <GlassCard
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: notif.unread
                      ? isLight ? '#FFFDF5' : 'rgba(245, 184, 0, 0.08)'
                      : isLight ? '#FFFFFF' : 'rgba(13, 22, 54, 0.6)',
                    borderColor: notif.unread
                      ? '#F5B800'
                      : isLight ? '#F1EAD8' : colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.notifRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: notif.unread
                          ? 'rgba(245, 184, 0, 0.18)'
                          : isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.06)',
                      },
                    ]}
                  >
                    {renderIcon(notif.icon)}
                  </View>

                  <View style={styles.detailsCol}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>
                        {notif.title}
                      </Text>
                      {notif.unread && <View style={styles.unreadDot} />}
                    </View>
                    <Text
                      style={[
                        styles.notifBody,
                        { color: isLight ? '#475569' : 'rgba(255, 255, 255, 0.7)' },
                      ]}
                      numberOfLines={2}
                    >
                      {notif.body}
                    </Text>
                    <View style={styles.timeRow}>
                      <Icons.Clock color={isLight ? '#94A3B8' : 'rgba(255,255,255,0.4)'} size={11} />
                      <Text style={[styles.notifTime, { color: isLight ? '#94A3B8' : 'rgba(255,255,255,0.4)' }]}>
                        {notif.time}
                      </Text>
                    </View>
                  </View>

                  <Icons.ChevronRight color={isLight ? '#CBD5E1' : 'rgba(255,255,255,0.3)'} size={16} />
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: isLight ? '#FFF1C7' : 'rgba(245, 184, 0, 0.1)' }]}>
              <Icons.BellOff color="#F5B800" size={36} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notifications</Text>
            <Text style={[styles.emptySubtitle, { color: isLight ? '#64748B' : 'rgba(255,255,255,0.5)' }]}>
              You're all caught up! Order updates, booking confirmations, and promo alerts will appear here.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  unreadBadge: {
    backgroundColor: '#F5B800',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    backgroundColor: '#F5B800',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  clearBtn: {
    padding: 6,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  filterTabActive: {},
  filterTabText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  cardContainer: {
    marginBottom: 10,
  },
  notifCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  notifTitle: {
    fontSize: 13.5,
    fontWeight: 'bold',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginLeft: 6,
  },
  notifBody: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notifTime: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
  },
});
