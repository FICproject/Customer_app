import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useOrderStore } from '../../store/orderStore';
import GlassCard from '../../components/GlassCard';
import * as Icons from 'lucide-react-native';

const { height } = Dimensions.get('window');

export default function DeliveryEarnings() {
  const earningsLogs = useOrderStore((state) => state.earningsLogs);
  const todayEarnings = useOrderStore((state) => state.todayEarnings);

  // Summarize stats
  const totalIncentives = earningsLogs.reduce((acc, curr) => acc + Number(curr.incentive || 0), 0);
  const totalBonuses = earningsLogs.reduce((acc, curr) => acc + Number(curr.bonus || 0), 0);
  const totalPayout = earningsLogs.reduce((acc, curr) => acc + Number(curr.per_delivery_earning || 0), 0) + todayEarnings;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings Summary</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Wallet Hud */}
        <GlassCard style={styles.walletHud}>
          <Text style={styles.hudLabel}>TOTAL BALANCE OUTSTANDING</Text>
          <Text style={styles.walletBalance}>₹{totalPayout.toFixed(2)}</Text>
          <View style={styles.payoutMeta}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Base Pay</Text>
              <Text style={styles.metaVal}>₹{(totalPayout - totalIncentives - totalBonuses).toFixed(0)}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Incentives</Text>
              <Text style={styles.metaVal}>₹{totalIncentives.toFixed(0)}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Bonus</Text>
              <Text style={styles.metaVal}>₹{totalBonuses.toFixed(0)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.cashoutBtn}>
            <Text style={styles.cashoutBtnText}>Cashout to Bank Account</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* List of earnings logs */}
        <View style={styles.logsGroup}>
          <Text style={styles.sectionHeader}>PAYMENT LEDGER</Text>
          {earningsLogs.length === 0 ? (
            <Text style={styles.emptyText}>No completed earnings records found for today.</Text>
          ) : (
            earningsLogs.map((log, idx) => (
              <GlassCard key={idx} style={styles.logCard}>
                <View style={styles.logRow}>
                  <View style={styles.iconCircle}>
                    <Icons.Check color="#10B981" size={16} />
                  </View>
                  <View style={styles.logInfo}>
                    <Text style={styles.logTitle}>Delivery Payout: #{log.order_id}</Text>
                    <Text style={styles.logDate}>{log.date}</Text>
                  </View>
                  <View style={styles.logPayout}>
                    <Text style={styles.payoutAmt}>+ ₹{Number(log.per_delivery_earning).toFixed(0)}</Text>
                    {Number(log.incentive) > 0 && (
                      <Text style={styles.incentiveAmt}>+ ₹{Number(log.incentive).toFixed(0)} inc</Text>
                    )}
                  </View>
                </View>
              </GlassCard>
            ))
          )}
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
  walletHud: {
    backgroundColor: 'rgba(13, 22, 54, 0.5)',
    padding: 20,
    alignItems: 'center',
  },
  hudLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.5,
  },
  walletBalance: {
    fontSize: 26,
    fontWeight: 'black',
    color: '#F4C400',
    marginTop: 10,
  },
  payoutMeta: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingTop: 14,
  },
  metaCol: {
    alignItems: 'center',
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 'bold',
  },
  metaVal: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: 2,
  },
  cashoutBtn: {
    width: '100%',
    backgroundColor: '#F4C400',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  cashoutBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#050B1E',
  },
  logsGroup: {
    marginTop: 24,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 20,
  },
  logCard: {
    marginBottom: 10,
    padding: 12,
    backgroundColor: 'rgba(13, 22, 54, 0.4)',
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logInfo: {
    flex: 1,
    marginLeft: 12,
  },
  logTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  logDate: {
    fontSize: 9.5,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  logPayout: {
    alignItems: 'flex-end',
  },
  payoutAmt: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#10B981',
  },
  incentiveAmt: {
    fontSize: 8.5,
    color: '#F4C400',
    fontWeight: 'bold',
    marginTop: 2,
  },
});
