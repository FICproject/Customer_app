import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';
import { useAuthStore } from '../../store/authStore';
import { apiFetch } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 32, 380);
const CARD_HEIGHT = 205;

// Hierarchy ranking for membership tiers
const TIER_LEVEL: Record<'silver' | 'gold' | 'diamond', number> = {
  silver: 1,
  gold: 2,
  diamond: 3,
};

export interface TierPlan {
  tier: string;
  type: 'silver' | 'gold' | 'diamond';
  price: string;
  badge: string;
  color: string;
  bgColor: string;
  borderColor: string;
  backBgColor: string;
  backBorderColor: string;
  accentColor: string;
  points: number;
  pointsMultiplier: string;
  delivery: string;
  lounges: string;
  discount: string;
}

export const MEMBERSHIP_PLANS: TierPlan[] = [
  {
    tier: 'Silver Club',
    type: 'silver',
    price: '₹999 / year',
    badge: 'Starter Pass',
    color: '#94A3B8',
    bgColor: '#334155',
    borderColor: '#CBD5E1',
    backBgColor: '#0F172A',
    backBorderColor: '#475569',
    accentColor: '#38BDF8',
    points: 1500,
    pointsMultiplier: '1.5x Connect Points on all orders',
    delivery: 'Free delivery on orders > ₹499',
    lounges: 'Standard Airport Access Pass',
    discount: '10% off Partner Dining & Stays',
  },
  {
    tier: 'Gold Club',
    type: 'gold',
    price: '₹2,499 / year',
    badge: 'Most Popular',
    color: '#F59E0B',
    bgColor: '#78350F',
    borderColor: '#FDE68A',
    backBgColor: '#0B0F19',
    backBorderColor: '#B45309',
    accentColor: '#FBBF24',
    points: 3500,
    pointsMultiplier: '2.5x Connect Points on all orders',
    delivery: 'Unlimited Free Delivery on all orders',
    lounges: '2 Domestic Lounge visits / year',
    discount: '20% off Luxury Stays & Fine Dining',
  },
  {
    tier: 'Diamond Club',
    type: 'diamond',
    price: '₹5,999 / year',
    badge: 'VIP Passport',
    color: '#A855F7',
    bgColor: '#3B0764',
    borderColor: '#C4B5FD',
    backBgColor: '#0D091A',
    backBorderColor: '#6B21A8',
    accentColor: '#C084FC',
    points: 8500,
    pointsMultiplier: '5.0x Connect Points on all orders',
    delivery: 'Priority Instant 10-min Free Delivery',
    lounges: 'Unlimited Global Lounge access',
    discount: '30% off Luxury Stays, Dining & Cabs',
  },
];

// ==========================================
// 3D FLIPPABLE DIGITAL CARD COMPONENT
// ==========================================
interface DigitalMembershipCardProps {
  plan: TierPlan;
  currentMembership: 'silver' | 'gold' | 'diamond';
  displayName: string;
  onUpgrade: (plan: TierPlan) => void;
  updating: boolean;
}

const DigitalMembershipCard: React.FC<DigitalMembershipCardProps> = ({
  plan,
  currentMembership,
  displayName,
  onUpgrade,
  updating,
}) => {
  const isCurrent = currentMembership === plan.type;
  const isLower = TIER_LEVEL[plan.type] < TIER_LEVEL[currentMembership];
  const isHigher = TIER_LEVEL[plan.type] > TIER_LEVEL[currentMembership];

  const animatedValue = useRef(new Animated.Value(0)).current;
  const isFlippedRef = useRef(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const flipCard = () => {
    if (isLower) {
      // Lower tiers are locked and cannot be flipped
      return;
    }

    if (isFlippedRef.current) {
      Animated.spring(animatedValue, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start(() => {
        isFlippedRef.current = false;
        setIsFlipped(false);
      });
    } else {
      Animated.spring(animatedValue, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start(() => {
        isFlippedRef.current = true;
        setIsFlipped(true);
      });
    }
  };

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = animatedValue.interpolate({
    inputRange: [0, 89, 90, 180],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = animatedValue.interpolate({
    inputRange: [0, 89, 90, 180],
    outputRange: [0, 0, 1, 1],
  });

  const memberId = `CN-${plan.type.toUpperCase()}-4820`;

  return (
    <TouchableOpacity
      activeOpacity={isLower ? 0.95 : 0.9}
      onPress={flipCard}
      style={styles.cardTouchWrapper}
    >
      {/* ================= CARD FRONT ================= */}
      <Animated.View
        style={[
          styles.cardFace,
          {
            backgroundColor: plan.bgColor,
            borderColor: plan.borderColor,
            transform: [{ perspective: 1200 }, { rotateY: frontInterpolate }],
            opacity: frontOpacity,
            zIndex: isFlipped ? 0 : 2,
          },
        ]}
        pointerEvents={isFlipped ? 'none' : 'auto'}
      >
        {/* Card SVG Gradient */}
        <View style={StyleSheet.absoluteFill}>
          <Svg width="100%" height="100%">
            <Defs>
              {plan.type === 'silver' ? (
                <LinearGradient id={`gradFront-${plan.type}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#334155" />
                  <Stop offset="45%" stopColor="#64748B" />
                  <Stop offset="80%" stopColor="#475569" />
                  <Stop offset="100%" stopColor="#1E293B" />
                </LinearGradient>
              ) : plan.type === 'diamond' ? (
                <LinearGradient id={`gradFront-${plan.type}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#1E1B4B" />
                  <Stop offset="35%" stopColor="#3B0764" />
                  <Stop offset="70%" stopColor="#581C87" />
                  <Stop offset="100%" stopColor="#0F0C20" />
                </LinearGradient>
              ) : (
                <LinearGradient id={`gradFront-${plan.type}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#92400E" />
                  <Stop offset="35%" stopColor="#D97706" />
                  <Stop offset="70%" stopColor="#B45309" />
                  <Stop offset="100%" stopColor="#78350F" />
                </LinearGradient>
              )}
            </Defs>
            <Rect
              width="100%"
              height="100%"
              rx="20"
              ry="20"
              fill={`url(#gradFront-${plan.type})`}
            />
          </Svg>
        </View>

        {/* Card Front Content */}
        <View style={styles.cardContent}>
          {/* Header Row */}
          <View style={styles.cardHeader}>
            <View style={styles.logoRow}>
              <View style={styles.crestCircle}>
                <Icons.Crown color="#FFFFFF" size={12} />
              </View>
              <Text style={styles.logoText}>Connect Club</Text>
            </View>

            {/* Status Pill */}
            {isCurrent ? (
              <View style={styles.activeStatusPill}>
                <View style={styles.activeDot} />
                <Text style={styles.activeStatusText}>ACTIVE</Text>
              </View>
            ) : isLower ? (
              <View style={styles.lockedStatusPill}>
                <Icons.Lock color="#CBD5E1" size={10} />
                <Text style={styles.lockedStatusText}>LOCKED</Text>
              </View>
            ) : (
              <View style={styles.upgradeStatusPill}>
                <Icons.Sparkles color="#FFFFFF" size={10} />
                <Text style={styles.upgradeStatusText}>UPGRADE AVAILABLE</Text>
              </View>
            )}
          </View>

          {/* Middle Row */}
          <View style={styles.middleRow}>
            <View style={styles.detailsCol}>
              <Text style={styles.cardMetaLabel}>MEMBERSHIP TIER</Text>
              <Text style={styles.tierNameValue}>{plan.tier}</Text>

              <View style={styles.priceRow}>
                <Text style={styles.cardMetaLabel}>ANNUAL FEE: </Text>
                <Text style={styles.cardPriceValue}>{plan.price}</Text>
              </View>

              <Text style={styles.cardMetaLabel}>CARD NUMBER</Text>
              <Text style={styles.cardMetaValue}>{memberId}</Text>
            </View>

            {/* High-Contrast QR Code */}
            <View style={styles.qrWrapper}>
              <View style={styles.qrContainer}>
                <QRCode
                  value={memberId}
                  size={46}
                  color="#0F172A"
                  backgroundColor="#FFFFFF"
                />
              </View>
              {isLower ? (
                <View style={styles.qrLockOverlay}>
                  <Icons.Lock color="#475569" size={18} />
                </View>
              ) : null}
            </View>
          </View>

          {/* Footer Row */}
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardMetaLabel}>MEMBER NAME</Text>
              <Text style={styles.memberNameValue}>{displayName}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardMetaLabel}>VALID THRU</Text>
              <Text style={styles.validityValue}>12/27</Text>
            </View>
          </View>
        </View>

        {/* Lower Tier Lock Overlay */}
        {isLower ? (
          <View style={styles.lowerTierOverlay}>
            <View style={styles.lowerTierBadge}>
              <Icons.Lock color="#E2E8F0" size={12} />
              <Text style={styles.lowerTierBadgeText}>Included in Active Plan</Text>
            </View>
          </View>
        ) : null}
      </Animated.View>

      {/* ================= CARD BACK ================= */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardFaceBack,
          {
            backgroundColor: plan.backBgColor,
            borderColor: plan.backBorderColor,
            transform: [{ perspective: 1200 }, { rotateY: backInterpolate }],
            opacity: backOpacity,
            zIndex: isFlipped ? 2 : 0,
          },
        ]}
        pointerEvents={isFlipped ? 'auto' : 'none'}
      >
        {/* Back SVG Gradient */}
        <View style={StyleSheet.absoluteFill}>
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id={`gradBack-${plan.type}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={plan.backBgColor} />
                <Stop offset="60%" stopColor="#0B0F19" />
                <Stop offset="100%" stopColor="#050810" />
              </LinearGradient>
            </Defs>
            <Rect
              width="100%"
              height="100%"
              rx="20"
              ry="20"
              fill={`url(#gradBack-${plan.type})`}
            />
          </Svg>
        </View>

        {/* Back Content */}
        <View style={styles.cardContent}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.logoRow}>
              <Icons.Sparkles color={plan.accentColor} size={13} />
              <Text style={[styles.logoText, { color: plan.accentColor }]}>
                {plan.tier} Privileges
              </Text>
            </View>
            <View style={[styles.flipBadge, { borderColor: plan.accentColor + '55' }]}>
              <Icons.RotateCcw color={plan.accentColor} size={9} />
              <Text style={[styles.flipBadgeText, { color: plan.accentColor }]}>
                Tap to Flip
              </Text>
            </View>
          </View>

          {/* Benefits Rows */}
          <View style={styles.backBenefitsList}>
            <View style={styles.backBenefitRow}>
              <Icons.Zap color={plan.accentColor} size={11} />
              <Text style={styles.backBenefitText} numberOfLines={1}>
                {plan.pointsMultiplier}
              </Text>
            </View>

            <View style={styles.backBenefitRow}>
              <Icons.Truck color={plan.accentColor} size={11} />
              <Text style={styles.backBenefitText} numberOfLines={1}>
                {plan.delivery}
              </Text>
            </View>

            <View style={styles.backBenefitRow}>
              <Icons.Compass color={plan.accentColor} size={11} />
              <Text style={styles.backBenefitText} numberOfLines={1}>
                {plan.lounges}
              </Text>
            </View>

            <View style={styles.backBenefitRow}>
              <Icons.Tag color={plan.accentColor} size={11} />
              <Text style={styles.backBenefitText} numberOfLines={1}>
                {plan.discount}
              </Text>
            </View>
          </View>

          {/* Action / Upgrade Button on Back */}
          <View style={styles.backActionContainer}>
            {isCurrent ? (
              <View style={styles.activeBadgeBack}>
                <Icons.CheckCircle2 color="#34D399" size={13} />
                <Text style={styles.activeBadgeBackText}>Current Active Membership</Text>
              </View>
            ) : isHigher ? (
              <TouchableOpacity
                style={[styles.upgradeBackBtn, { backgroundColor: plan.color }]}
                activeOpacity={0.85}
                onPress={() => onUpgrade(plan)}
                disabled={updating}
              >
                <Icons.Sparkles color="#FFFFFF" size={12} />
                <Text style={styles.upgradeBackBtnText}>
                  Upgrade to {plan.tier.split(' ')[0]} • {plan.price.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.lockedBadgeBack}>
                <Icons.Lock color="#94A3B8" size={12} />
                <Text style={styles.lockedBadgeBackText}>
                  Lower Tier • Included in Active Plan
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ==========================================
// MAIN SCREEN COMPONENT
// ==========================================
export default function CustomerMembership() {
  const insets = useSafeAreaInsets();
  const currentUser = useAuthStore((state) => state.currentUser);
  const updateMembership = useAuthStore((state) => state.updateMembership);

  const displayName = currentUser?.name || 'Uma';
  const currentMembership = (currentUser?.membership || 'silver') as 'silver' | 'gold' | 'diamond';

  const [updating, setUpdating] = useState(false);
  const [memberOffers, setMemberOffers] = useState<any[]>([]);

  // Load Member Offers from MongoDB Atlas
  useEffect(() => {
    apiFetch('/offers')
      .then((res) => {
        if (res && res.data && Array.isArray(res.data)) {
          setMemberOffers(res.data);
        }
      })
      .catch((err) => {
        console.warn('[CustomerMembership] Error loading offers from MongoDB:', err);
      });
  }, []);

  const handleUpgradePlan = (plan: TierPlan) => {
    if (plan.type === currentMembership) {
      return;
    }

    Alert.alert(
      'Upgrade Membership',
      `Upgrade to ${plan.tier} for ${plan.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Upgrade',
          onPress: async () => {
            setUpdating(true);
            try {
              await updateMembership(plan.type);
              Alert.alert(
                'Membership Upgraded 🎉',
                `Congratulations! Your ${plan.tier} is now active.`
              );
            } catch {
              Alert.alert('Error', 'Unable to upgrade membership. Please try again.');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <Text style={styles.headerTitle}>Connect Membership</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* CARDS SECTION HEADER */}
        <View style={styles.cardsSectionHeader}>
          <Icons.ShieldCheck color="#64748B" size={14} />
          <Text style={styles.sectionTitle}>MEMBERSHIP TIERS</Text>
        </View>

        {/* Tap Prompt Hint */}
        <View style={styles.flipPromptRow}>
          <Icons.RotateCcw color="#64748B" size={11} />
          <Text style={styles.flipPromptText}>
            Tap active or upgradeable card to flip for benefits
          </Text>
        </View>

        {/* VERTICAL CARDS COLUMN */}
        <View style={styles.cardsVerticalList}>
          {MEMBERSHIP_PLANS.map((plan) => (
            <View key={plan.type} style={styles.cardVerticalSlot}>
              <DigitalMembershipCard
                plan={plan}
                currentMembership={currentMembership}
                displayName={displayName}
                onUpgrade={handleUpgradePlan}
                updating={updating}
              />
            </View>
          ))}
        </View>

        {/* MEMBER OFFERS SECTION */}
        <View style={styles.offersSectionHeader}>
          <Icons.Gift color="#64748B" size={14} />
          <Text style={styles.sectionTitle}>MEMBER-ONLY OFFERS</Text>
        </View>

        <View style={styles.offersContainer}>
          {memberOffers.length === 0 ? (
            <Text style={{ color: '#64748B', fontSize: 12, textAlign: 'center', marginVertical: 16 }}>
              Loading member-exclusive offers from database...
            </Text>
          ) : (
            memberOffers.map((offer) => (
              <View key={offer.id} style={styles.offerCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.offerTitle}>{offer.title}</Text>
                  <Text style={styles.offerVendor}>{offer.vendor}</Text>
                  <Text style={styles.offerValidity}>{offer.validity || 'Limited Period Deal'}</Text>
                </View>
                <TouchableOpacity
                  style={styles.codeBtn}
                  activeOpacity={0.8}
                  onPress={() =>
                    Alert.alert(
                      'Promo Code Copied 📋',
                      `Promo code ${offer.code} copied! Applied on your next checkout.`
                    )
                  }
                >
                  <Text style={styles.codeText}>{offer.code}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  scrollContent: {
    paddingVertical: 14,
    paddingBottom: 40,
  },
  cardsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    letterSpacing: 0.6,
  },
  flipPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 16,
    marginBottom: 14,
  },
  flipPromptText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  cardsVerticalList: {
    marginBottom: 20,
  },
  cardVerticalSlot: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTouchWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
  },
  cardFace: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#0F172A',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  cardFaceBack: {
    backgroundColor: '#0B0F19',
  },
  cardContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  crestCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  activeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderColor: '#34D399',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#34D399',
  },
  activeStatusText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#A7F3D0',
    letterSpacing: 0.5,
  },
  lockedStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(100, 116, 139, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  lockedStatusText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#CBD5E1',
    letterSpacing: 0.5,
  },
  upgradeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  upgradeStatusText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  detailsCol: {
    flex: 1,
  },
  cardMetaLabel: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 0.7,
  },
  tierNameValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  cardPriceValue: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardMetaValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  qrWrapper: {
    position: 'relative',
  },
  qrContainer: {
    padding: 3,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  qrLockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  memberNameValue: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 1,
  },
  validityValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 1,
  },
  lowerTierOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 12,
  },
  lowerTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  lowerTierBadgeText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  flipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
  },
  flipBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  backBenefitsList: {
    gap: 4,
    marginVertical: 1,
  },
  backBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backBenefitText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  backActionContainer: {
    marginTop: 3,
  },
  activeBadgeBack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 7,
    paddingVertical: 5,
  },
  activeBadgeBackText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#34D399',
  },
  upgradeBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 7,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  upgradeBackBtnText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  lockedBadgeBack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    borderRadius: 7,
    paddingVertical: 5,
  },
  lockedBadgeBackText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  offersSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  offersContainer: {
    marginHorizontal: 16,
    gap: 10,
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  offerTitle: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  offerVendor: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  offerValidity: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '600',
    marginTop: 2,
  },
  codeBtn: {
    backgroundColor: '#FEFCE8',
    borderWidth: 1,
    borderColor: '#FACC15',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  codeText: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#854D0E',
    letterSpacing: 0.5,
  },
});
