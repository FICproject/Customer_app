import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, useWindowDimensions, Alert } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/GlassCard';
import * as Icons from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export default function CustomerProfile() {
  const navigation = useNavigation<any>();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const colors = useThemeStore((state) => state.colors);
  const { width } = useWindowDimensions();

  const displayName = currentUser?.name || 'Connect Member';
  const emailAddress = currentUser?.email || 'member@connect.club';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Digital Passport</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Passport Card */}
        <GlassCard style={styles.passportCard}>
          <View style={styles.passportHeader}>
            <View style={styles.badgeContainer}>
              <Image
                source={require('../../assets/images/forge_india_logo.jpg')}
                style={styles.badgeImage}
              />
              <Text style={[styles.badgeLabel, { color: colors.text, opacity: 0.5 }]}>CONNECT MEMBER</Text>
            </View>
            <Text style={[
              styles.tierText,
              {
                color: currentUser?.membership === 'silver' ? '#A9A9A9' :
                       currentUser?.membership === 'diamond' ? '#8B5CF6' : '#F4C400'
              }
            ]}>
              {currentUser?.membership ? `${currentUser.membership.toUpperCase()} TIER` : 'GOLD TIER'}
            </Text>
          </View>

          <View style={styles.passportBody}>
            <View style={[styles.avatarCircle, { borderColor: colors.cardBorder, backgroundColor: colors.background === '#F8FAFC' ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255, 255, 255, 0.02)' }]}>
              <Icons.User 
                color={
                  currentUser?.membership === 'silver' ? '#A9A9A9' :
                  currentUser?.membership === 'diamond' ? '#8B5CF6' : '#F4C400'
                } 
                size={32} 
              />
            </View>
            <View style={styles.userMeta}>
              <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
              <Text style={[styles.userEmail, { color: colors.text, opacity: 0.5 }]}>{emailAddress}</Text>
              <Text style={[
                styles.userId,
                {
                  color: currentUser?.membership === 'silver' ? '#A9A9A9' :
                         currentUser?.membership === 'diamond' ? '#8B5CF6' : '#F4C400'
                }
              ]}>
                ID: CN-{currentUser?.membership ? currentUser.membership.substring(0, 4).toUpperCase() : 'GOLD'}-4820
              </Text>
            </View>
          </View>

          {/* QR Passport Scanner */}
          <View style={[styles.qrRow, { borderTopColor: colors.cardBorder, backgroundColor: colors.background === '#F8FAFC' ? 'rgba(15, 23, 42, 0.05)' : 'rgba(0, 0, 0, 0.25)' }]}>
            <View style={[styles.qrWrapper, { backgroundColor: '#FFFFFF', padding: 6, borderRadius: 8 }]}>
              <QRCode
                value={`CN-${currentUser?.membership ? currentUser.membership.substring(0, 4).toUpperCase() : 'GOLD'}-4820`}
                size={60}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            </View>
            <View style={styles.qrTextCol}>
              <Text style={[styles.qrTitle, { color: colors.text }]}>Fast-Pass QR Check-in</Text>
              <Text style={[styles.qrSub, { color: colors.text, opacity: 0.5 }]}>Present at partner lounges, stays, and checkouts for instant points conversion and validation.</Text>
            </View>
          </View>
        </GlassCard>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <GlassCard style={[styles.statBox, { width: (width - 44) / 3 }]}>
            <Icons.Compass color={colors.primary} size={18} />
            <Text style={[styles.statVal, { color: colors.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.text, opacity: 0.5 }]}>Travel Trips</Text>
          </GlassCard>

          <GlassCard style={[styles.statBox, { width: (width - 44) / 3 }]}>
            <Icons.Activity color={colors.primary} size={18} />
            <Text style={[styles.statVal, { color: colors.text }]}>32</Text>
            <Text style={[styles.statLabel, { color: colors.text, opacity: 0.5 }]}>Food Orders</Text>
          </GlassCard>

          <GlassCard style={[styles.statBox, { width: (width - 44) / 3 }]}>
            <Icons.ShoppingBag color={colors.primary} size={18} />
            <Text style={[styles.statVal, { color: colors.text }]}>84</Text>
            <Text style={[styles.statLabel, { color: colors.text, opacity: 0.5 }]}>Purchases</Text>
          </GlassCard>
        </View>

        {/* Section List */}
        <View style={styles.menuGroup}>
          <Text style={[styles.sectionHeader, { color: colors.text, opacity: 0.4 }]}>PASSPORT MODULES</Text>

          <TouchableOpacity 
            style={[styles.menuItem, { borderColor: colors.cardBorder }]}
            onPress={() => Alert.alert('Identity Verification', 'Identity check status: Verified via Aadhaar card integration.')}
          >
            <View style={styles.menuRow}>
              <Icons.ShieldAlert color={colors.grayLight} size={16} />
              <Text style={[styles.menuText, { color: colors.text }]}>Identity Verification</Text>
            </View>
            <Text style={[styles.menuStatus, { color: colors.primary }]}>Verified</Text>
          </TouchableOpacity>
 
          <TouchableOpacity 
            style={[styles.menuItem, { borderColor: colors.cardBorder }]}
            onPress={() => navigation.navigate('MyAddresses')}
          >
            <View style={styles.menuRow}>
              <Icons.MapPin color={colors.grayLight} size={16} />
              <Text style={[styles.menuText, { color: colors.text }]}>Delivery Addresses</Text>
            </View>
            <Icons.ChevronRight color={colors.grayLight} size={14} />
          </TouchableOpacity>
 
          <TouchableOpacity 
            style={[styles.menuItem, { borderColor: colors.cardBorder }]}
            onPress={() => navigation.navigate('PaymentSettings')}
          >
            <View style={styles.menuRow}>
              <Icons.CreditCard color={colors.grayLight} size={16} />
              <Text style={[styles.menuText, { color: colors.text }]}>Payment Settings</Text>
            </View>
            <Icons.ChevronRight color={colors.grayLight} size={14} />
          </TouchableOpacity>
 
          <TouchableOpacity 
            style={[styles.menuItem, { borderColor: colors.cardBorder }]}
            onPress={() => Alert.alert('Referral Rewards', 'Total Referrals: 5 successful checkouts\nBonus Earnings: ₹2,500\nReferral Code: CN-MEMBER-REF5')}
          >
            <View style={styles.menuRow}>
              <Icons.Award color={colors.grayLight} size={16} />
              <Text style={[styles.menuText, { color: colors.text }]}>Referral Rewards</Text>
            </View>
            <Text style={[styles.menuStatus, { color: colors.primary }]}>₹2,500 Earned</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderColor: colors.cardBorder, borderBottomWidth: 0 }]} onPress={logout}>
            <View style={styles.menuRow}>
              <Icons.LogOut color="#EF4444" size={16} />
              <Text style={[styles.menuText, { color: '#EF4444' }]}>Sign Out</Text>
            </View>
            <Icons.ChevronRight color="#EF4444" size={14} />
          </TouchableOpacity>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  passportCard: {
    padding: 20,
  },
  passportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeImage: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 6,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  tierText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F4C400',
  },
  passportBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#F4C400',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMeta: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userEmail: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 2,
  },
  userId: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F4C400',
    marginTop: 4,
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 12,
    borderRadius: 14,
  },
  qrWrapper: {
    width: 72,
    height: 72,
    backgroundColor: 'rgba(5, 11, 30, 0.8)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrTextCol: {
    flex: 1,
    marginLeft: 14,
  },
  qrTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  qrSub: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.4)',
    lineHeight: 12,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statBox: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  statVal: {
    fontSize: 15,
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
  menuGroup: {
    marginTop: 24,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 13,
    color: '#FFF',
    marginLeft: 12,
    fontWeight: 'semibold',
  },
  menuStatus: {
    fontSize: 11,
    color: '#F4C400',
    fontWeight: 'bold',
  },
});
