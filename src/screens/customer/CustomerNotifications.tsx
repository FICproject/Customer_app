import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import GlassCard from '../../components/GlassCard';
import * as Icons from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';

const { height } = Dimensions.get('window');

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Order Assigned to Partner',
    body: 'Rider Rajesh Kumar has been assigned to your order #ORD1244.',
    time: '2 mins ago',
    icon: 'Truck',
    unread: true
  },
  {
    id: 2,
    title: 'Wallet Top Up Success',
    body: '₹5,000.00 was successfully added to your Connect Wallet.',
    time: '1 hour ago',
    icon: 'CreditCard',
    unread: false
  },
  {
    id: 3,
    title: 'Lounge Pass Validated',
    body: 'Your domestic lounge pass has been validated at Kempegowda Airport T2.',
    time: 'Yesterday',
    icon: 'Award',
    unread: false
  },
  {
    id: 4,
    title: 'Welcome to Connect Club',
    body: 'Begin exploring food, stay, travel, and local service benefits with your Gold membership.',
    time: '3 days ago',
    icon: 'Sparkles',
    unread: false
  }
];

export default function CustomerNotifications() {
  const colors = useThemeStore((state) => state.colors);
  const [notifications, setNotifications] = React.useState(NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const renderIcon = (iconName: string) => {
    const IconComp = (Icons as any)[iconName];
    if (!IconComp) return <Icons.Bell color={colors.primary} size={16} />;
    return <IconComp color={colors.primary} size={16} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderColor: colors.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={[styles.markReadText, { color: colors.primary }]}>Mark All Read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {notifications.map((notif) => (
          <TouchableOpacity 
            key={notif.id} 
            activeOpacity={0.9}
            onPress={() => {
              setNotifications(notifications.map(n => n.id === notif.id ? { ...n, unread: false } : n));
            }}
          >
            <GlassCard
              style={[styles.notifCard]}
              borderColor={notif.unread ? (colors.primary + '40') : colors.cardBorder}
            >
              <View style={styles.notifRow}>
                <View style={[styles.iconWrapper, { backgroundColor: notif.unread ? (colors.primary + '1A') : colors.cardBg }]}>
                  {renderIcon(notif.icon)}
                </View>
                <View style={styles.detailsCol}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>{notif.title}</Text>
                    {notif.unread && <View style={[styles.unreadIndicator, { backgroundColor: colors.primary }]} />}
                  </View>
                  <Text style={[styles.notifBody, { color: colors.text, opacity: 0.5 }]} numberOfLines={2}>{notif.body}</Text>
                  <Text style={[styles.notifTime, { color: colors.text, opacity: 0.35 }]}>{notif.time}</Text>
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}
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
    paddingTop: height * 0.05,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  markReadText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  notifCard: {
    marginBottom: 12,
    padding: 14,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCol: {
    flex: 1,
    marginLeft: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
  },
  unreadIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 8,
  },
  notifBody: {
    fontSize: 11.5,
    marginTop: 4,
    lineHeight: 15,
  },
  notifTime: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 6,
  },
});
