import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/GlassCard';
import * as Icons from 'lucide-react-native';

const { height } = Dimensions.get('window');

export default function DeliveryProfile() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);

  const displayName = currentUser?.name || 'Ravi Kumar';
  const emailAddress = currentUser?.email || 'ravi@connect.delivery';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rider Profile</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Icons.LogOut color="#EF4444" size={16} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Icons.Truck color="#F4C400" size={26} />
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.nameText}>{displayName}</Text>
              <Text style={styles.emailText}>{emailAddress}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>VERIFIED PARTNER</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Vehicle details */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>VEHICLE INFORMATION</Text>
          <GlassCard style={styles.detailsCard}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>VEHICLE TYPE</Text>
              <Text style={styles.detailVal}>Electric Bike</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>LICENSE PLATE NUMBER</Text>
              <Text style={styles.detailVal}>KA-01-EF-5678</Text>
            </View>
          </GlassCard>
        </View>

        {/* Verification Credentials */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>CRITICAL DOCUMENTS</Text>
          <GlassCard style={styles.detailsCard}>
            <View style={styles.detailItem}>
              <View style={styles.docRow}>
                <Text style={styles.detailLabel}>DRIVING LICENSE</Text>
                <Icons.CheckCircle color="#10B981" size={12} />
              </View>
              <Text style={styles.detailVal}>KA1234567890</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailItem}>
              <View style={styles.docRow}>
                <Text style={styles.detailLabel}>AADHAAR NUMBER</Text>
                <Icons.CheckCircle color="#10B981" size={12} />
              </View>
              <Text style={styles.detailVal}>1234 5678 9012</Text>
            </View>
          </GlassCard>
        </View>

        {/* Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>CONTACT DETAILS</Text>
          <GlassCard style={styles.detailsCard}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>EMERGENCY CONTACT</Text>
              <Text style={styles.detailVal}>+91 91919 19191</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>BASE OPERATIONS HUB</Text>
              <Text style={styles.detailVal}>Sector 15, Koramangala Hub</Text>
            </View>
          </GlassCard>
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
  logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    padding: 18,
    backgroundColor: 'rgba(13, 22, 54, 0.5)',
    marginBottom: 20,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#F4C400',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  metaCol: {
    marginLeft: 14,
    flex: 1,
  },
  nameText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  emailText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    marginTop: 6,
  },
  statusText: {
    fontSize: 7.5,
    fontWeight: 'black',
    color: '#10B981',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 9.5,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  detailsCard: {
    backgroundColor: 'rgba(13, 22, 54, 0.4)',
    padding: 14,
  },
  detailItem: {
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.8,
  },
  detailVal: {
    fontSize: 12.5,
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 10,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
