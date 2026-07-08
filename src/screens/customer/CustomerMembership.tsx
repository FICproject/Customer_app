import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import GlassCard from '../../components/GlassCard';
import * as Icons from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import MembershipCard from '../../components/MembershipCard';

const { height } = Dimensions.get('window');

const PLANS = [
  {
    tier: 'Silver Club',
    price: '₹999 / year',
    pointsMultiplier: '1.5x points',
    delivery: 'Free delivery > ₹499',
    lounges: 'No lounge access',
    color: '#A9A9A9',
    badge: 'Standard Access'
  },
  {
    tier: 'Gold Club',
    price: '₹2,499 / year',
    pointsMultiplier: '2.5x points',
    delivery: 'Free delivery on all orders',
    lounges: '2 Domestic Lounge visits / year',
    color: '#F4C400',
    badge: 'Most Popular'
  },
  {
    tier: 'Diamond Club',
    price: '₹5,999 / year',
    pointsMultiplier: '5.0x points',
    delivery: 'Priority Free delivery (Instant)',
    lounges: 'Unlimited Global Lounge access',
    color: '#8B5CF6',
    badge: 'Luxury Passport'
  }
];

interface PlanItem {
  tier: string;
  price: string;
  pointsMultiplier: string;
  delivery: string;
  lounges: string;
  color: string;
  badge: string;
}

interface MembershipPlanCardProps {
  plan: PlanItem;
  colors: any;
  displayName: string;
  currentMembership: 'silver' | 'gold' | 'diamond';
  updateMembership: (tier: 'silver' | 'gold' | 'diamond') => void;
}

function MembershipPlanCard({ plan, colors, displayName, currentMembership, updateMembership }: MembershipPlanCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const planType = plan.tier.toLowerCase().includes('silver') ? 'silver' : plan.tier.toLowerCase().includes('gold') ? 'gold' : 'diamond';
  const isCurrentPlan = currentMembership === planType;

  const handleFlip = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const opacityFront = flipAnim.interpolate({
    inputRange: [0, 89, 90, 180],
    outputRange: [1, 1, 0, 0],
  });

  const opacityBack = flipAnim.interpolate({
    inputRange: [0, 89, 90, 180],
    outputRange: [0, 0, 1, 1],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    opacity: opacityFront,
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    opacity: opacityBack,
  };

  const pointerEventsFront = isFlipped ? 'none' : 'auto';
  const pointerEventsBack = isFlipped ? 'auto' : 'none';

  const getRank = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t === 'silver') return 1;
    if (t === 'gold') return 2;
    if (t === 'diamond') return 3;
    return 0;
  };

  const currentRank = getRank(currentMembership);
  const targetRank = getRank(planType);

  let btnText = 'Acquire Membership';
  let btnDisabled = false;
  let btnBgColor = plan.color;
  let btnTextColor = '#FFF';

  if (isCurrentPlan) {
    btnText = 'Active Plan';
    btnDisabled = true;
    btnBgColor = '#10B981';
    btnTextColor = '#FFF';
  } else if (targetRank < currentRank) {
    btnText = 'Downgrade Unavailable';
    btnDisabled = true;
    btnBgColor = 'rgba(255, 255, 255, 0.05)';
    btnTextColor = 'rgba(255, 255, 255, 0.3)';
  } else if (currentRank > 0 && targetRank > currentRank) {
    btnText = `Upgrade to ${plan.tier.replace(' Club', '')}`;
    btnDisabled = false;
    btnBgColor = plan.color;
    btnTextColor = (plan.tier.includes('Silver')) ? '#FFF' : '#050B1E';
  } else {
    btnText = 'Acquire Membership';
    btnDisabled = false;
    btnBgColor = plan.color;
    btnTextColor = (plan.tier.includes('Silver')) ? '#FFF' : '#050B1E';
  }

  return (
    <View style={styles.cardContainer}>
      {/* Front Side */}
      <Animated.View
        style={[
          styles.animatedCard,
          frontAnimatedStyle,
          { backfaceVisibility: 'hidden', zIndex: isFlipped ? 0 : 1 },
        ]}
        pointerEvents={pointerEventsFront}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={handleFlip}
          style={{ width: '100%' }}
        >
          <GlassCard
            style={styles.planCard}
            borderColor={isCurrentPlan ? '#10B981' : plan.tier.includes('Gold') ? 'rgba(244, 196, 0, 0.4)' : colors.cardBorder}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.tierName, { color: plan.color }]}>{plan.tier}</Text>
                <Text style={[styles.priceText, { color: colors.text }]}>{plan.price}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: plan.color + '22', borderColor: plan.color + '40' }]}>
                <Text style={[styles.badgeText, { color: plan.color }]}>{plan.badge}</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

            {/* Benefits list */}
            <View style={styles.benefitsBox}>
              <View style={styles.benefitRow}>
                <Icons.CheckCircle color={plan.color} size={14} />
                <Text style={[styles.benefitText, { color: colors.text, opacity: 0.75 }]}>{plan.pointsMultiplier} on check-ins</Text>
              </View>
              <View style={styles.benefitRow}>
                <Icons.CheckCircle color={plan.color} size={14} />
                <Text style={[styles.benefitText, { color: colors.text, opacity: 0.75 }]}>{plan.delivery}</Text>
              </View>
              <View style={styles.benefitRow}>
                <Icons.CheckCircle color={plan.color} size={14} />
                <Text style={[styles.benefitText, { color: colors.text, opacity: 0.75 }]}>{plan.lounges}</Text>
              </View>
              <View style={styles.benefitRow}>
                <Icons.CheckCircle color={plan.color} size={14} />
                <Text style={[styles.benefitText, { color: colors.text, opacity: 0.75 }]}>Up to 20% discount on Stay & Dining</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.chooseBtn, { backgroundColor: btnBgColor }]} 
              activeOpacity={0.8}
              disabled={btnDisabled}
              onPress={() => updateMembership(planType)}
            >
              <Text style={[styles.chooseBtnText, { color: btnTextColor }]}>
                {btnText}
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>

      {/* Back Side */}
      <Animated.View
        style={[
          styles.animatedCard,
          styles.cardBack,
          backAnimatedStyle,
          {
            backfaceVisibility: 'hidden',
            zIndex: isFlipped ? 1 : 0,
            justifyContent: 'center',
          },
        ]}
        pointerEvents={pointerEventsBack}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={handleFlip}
          style={{ width: '100%' }}
        >
          <MembershipCard
            name={displayName}
            type={planType}
            number={`CN-${plan.tier.substring(0, 4).toUpperCase()}-4820`}
            points={plan.tier.includes('Silver') ? 1500 : plan.tier.includes('Gold') ? 3500 : 8500}
            validity="12/27"
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function CustomerMembership() {
  const colors = useThemeStore((state) => state.colors);
  const currentUser = useAuthStore((state) => state.currentUser);
  const updateMembership = useAuthStore((state) => state.updateMembership);
  const displayName = currentUser?.name || 'Connect Member';
  const currentMembership = currentUser?.membership || 'gold';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderColor: colors.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Membership Plans</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introBox}>
          <Text style={[styles.title, { color: colors.text }]}>Unlock Unlimited Privileges</Text>
          <Text style={[styles.subtitle, { color: colors.text, opacity: 0.5 }]}>Choose a membership plan to elevate your shopping, stays, travel, and services access with exclusive luxury rewards.</Text>
          <Text style={styles.hintText}>💡 Tap a card to flip and view digital membership card</Text>
        </View>

        {/* Plans */}
        {PLANS.map((plan, idx) => (
          <MembershipPlanCard 
            key={idx} 
            plan={plan} 
            colors={colors} 
            displayName={displayName} 
            currentMembership={currentMembership}
            updateMembership={updateMembership}
          />
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  introBox: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  hintText: {
    fontSize: 11,
    color: '#F4C400',
    marginTop: 8,
    fontWeight: '600',
  },
  cardContainer: {
    marginBottom: 20,
    width: '100%',
    position: 'relative',
  },
  animatedCard: {
    width: '100%',
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planCard: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tierName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  benefitsBox: {
    marginBottom: 18,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 12,
    marginLeft: 10,
    fontWeight: '600',
  },
  chooseBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chooseBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
