import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useDerivedValue,
  useAnimatedStyle,
  interpolate,
  withTiming,
  FadeInDown,
  SharedValue,
} from 'react-native-reanimated';
import * as Icons from 'lucide-react-native';

const { width, height: screenHeight } = Dimensions.get('window');

const STEPS = [
  {
    step: '01',
    icon: 'FileText',
    title: 'Apply Online',
    desc: 'Submit your profile and business details on our portal in under 5 minutes.',
    accent: '#F4C400',
  },
  {
    step: '02',
    icon: 'ShieldCheck',
    title: 'Credentials Review',
    desc: 'Our compliance team reviews and validates your onboarding details in 24 hours.',
    accent: '#38BDF8',
  },
  {
    step: '03',
    icon: 'LayoutDashboard',
    title: 'Unlock Dashboard',
    desc: 'Receive your secure access keys, digital assets, and premium welcome kits.',
    accent: '#34D399',
  },
  {
    step: '04',
    icon: 'Tv',
    title: 'Onboarding Session',
    desc: 'Schedule a quick 1-on-1 walkthrough with a success manager to maximize your revenue.',
    accent: '#C084FC',
  },
  {
    step: '05',
    icon: 'Coins',
    title: 'Start Earning',
    desc: 'Connect with premium global members and start collecting automated commission payouts.',
    accent: '#F97316',
  },
];

interface LandingHowItWorksProps {
  scrollY: SharedValue<number>;
}

export default function LandingHowItWorks({ scrollY }: LandingHowItWorksProps) {
  const [layoutY, setLayoutY] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [cardYPositions, setCardYPositions] = useState<number[]>([0, 120, 240, 360, 480]);

  const handleContainerLayout = (event: any) => {
    const { y, height } = event.nativeEvent.layout;
    setLayoutY(y);
    setLayoutHeight(height);
  };

  const handleCardLayout = (idx: number, event: any) => {
    const { y } = event.nativeEvent.layout;
    setCardYPositions((prev) => {
      const next = [...prev];
      next[idx] = y;
      return next;
    });
  };

  // Derived scroll progress within this component
  const bikeProgress = useDerivedValue(() => {
    if (layoutHeight === 0) return 0;
    const startScroll = layoutY - screenHeight * 0.45;
    const endScroll = layoutY + layoutHeight - screenHeight * 0.75;
    const progress = (scrollY.value - startScroll) / (endScroll - startScroll || 1);
    return Math.min(Math.max(progress, 0), 1);
  });

  const bikeY = useDerivedValue(() => {
    const startY = (cardYPositions[0] || 0) + 28;
    const endY = (cardYPositions[cardYPositions.length - 1] || 480) + 28;
    return interpolate(bikeProgress.value, [0, 1], [startY, endY]);
  });

  const bikeStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: bikeY.value - 18 },
        { scale: withTiming(bikeProgress.value > 0 && bikeProgress.value < 1 ? 1.15 : 1, { duration: 150 }) }
      ],
    };
  });

  return (
    <View style={styles.container} onLayout={handleContainerLayout}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.overline}>SIMPLE PROCESS</Text>
        <Text style={styles.title}>How It Works</Text>
        <Text style={styles.subtitle}>Get started in 5 easy steps</Text>
      </View>

      {/* Steps */}
      <View style={styles.stepsContainer}>
        {/* Dynamic Glowing Timeline Background Line */}
        <View style={styles.timelineBackgroundLine} />

        {/* Moving Delivery Bike Badge */}
        <Animated.View style={[styles.bikeBadge, bikeStyle]}>
          <Icons.Bike color="#050B1E" size={16} />
        </Animated.View>

        {STEPS.map((step, idx) => (
          <StepCard
            key={step.step}
            step={step}
            idx={idx}
            scrollY={scrollY}
            layoutY={layoutY}
            bikeProgress={bikeProgress}
            cardYPositions={cardYPositions}
            onLayout={(event) => handleCardLayout(idx, event)}
            isLast={idx === STEPS.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

interface StepCardProps {
  step: typeof STEPS[0];
  idx: number;
  scrollY: SharedValue<number>;
  layoutY: number;
  bikeProgress: SharedValue<number>;
  cardYPositions: number[];
  onLayout: (event: any) => void;
  isLast: boolean;
}

function StepCard({ step, idx, scrollY, layoutY, bikeProgress, cardYPositions, onLayout, isLast }: StepCardProps) {
  const renderIcon = (iconName: string, color: string) => {
    const IconComp = (Icons as any)[iconName];
    if (!IconComp) return <Icons.HelpCircle color={color} size={22} />;
    return <IconComp color={color} size={22} />;
  };

  const isRevealed = useDerivedValue(() => {
    if (idx === 0) return true;
    if (layoutY === 0) return false;

    // Reveal when the card top enters the viewport from the bottom (e.g. within 85% of screen height)
    const cardTop = (cardYPositions[idx] || (idx * 120)) + layoutY;
    const revealThreshold = cardTop - screenHeight * 0.85;
    return scrollY.value >= revealThreshold;
  });

  const isActive = useDerivedValue(() => {
    const totalSteps = cardYPositions.length;
    if (totalSteps <= 1) return idx === 0;

    const startY = (cardYPositions[0] || 0) + 28;
    const endY = (cardYPositions[totalSteps - 1] || 480) + 28;
    const currentY = (cardYPositions[idx] || 0) + 28;

    const stepThreshold = (currentY - startY) / (endY - startY || 1);
    return bikeProgress.value >= stepThreshold;
  });

  const cardStyle = useAnimatedStyle(() => {
    const revealed = isRevealed.value;
    return {
      opacity: withTiming(revealed ? 1 : 0, { duration: 400 }),
      transform: [
        { translateY: withTiming(revealed ? 0 : 35, { duration: 400 }) }
      ],
    };
  });

  const circleStyle = useAnimatedStyle(() => {
    const active = isActive.value;
    return {
      backgroundColor: active ? step.accent : 'rgba(255, 255, 255, 0.03)',
      borderColor: active ? step.accent : 'rgba(255, 255, 255, 0.12)',
      transform: [{ scale: withTiming(active ? 1.15 : 1, { duration: 250 }) }],
    };
  });

  const circleTextStyle = useAnimatedStyle(() => {
    const active = isActive.value;
    return {
      color: active ? '#050B1E' : 'rgba(255, 255, 255, 0.3)',
      fontWeight: active ? '900' : '800',
    };
  });

  const bodyStyle = useAnimatedStyle(() => {
    const active = isActive.value;
    return {
      borderColor: active ? `${step.accent}55` : 'rgba(255, 255, 255, 0.06)',
      backgroundColor: active ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.5)',
      transform: [{ translateX: withTiming(active ? 4 : 0, { duration: 250 }) }],
      shadowColor: step.accent,
      shadowOpacity: active ? 0.25 : 0,
      shadowRadius: active ? 12 : 0,
    };
  });

  const titleStyle = useAnimatedStyle(() => {
    const active = isActive.value;
    return {
      color: active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
    };
  });

  const descStyle = useAnimatedStyle(() => {
    const active = isActive.value;
    return {
      color: active ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)',
    };
  });

  return (
    <Animated.View
      style={[styles.stepCard, cardStyle]}
      onLayout={onLayout}
    >
      {/* Step Circle Badge */}
      <Animated.View style={[styles.stepCircle, circleStyle]}>
        <Animated.Text style={[styles.stepNumber, circleTextStyle]}>{step.step}</Animated.Text>
      </Animated.View>

      {/* Card Body */}
      <Animated.View style={[styles.stepBody, bodyStyle]}>
        <View style={[styles.iconBox, { backgroundColor: `${step.accent}15`, borderColor: `${step.accent}30` }]}>
          {renderIcon(step.icon, step.accent)}
        </View>
        <View style={styles.stepContent}>
          <Animated.Text style={[styles.stepTitle, titleStyle]}>{step.title}</Animated.Text>
          <Animated.Text style={[styles.stepDesc, descStyle]}>{step.desc}</Animated.Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#020B18',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  overline: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    color: '#F4C400',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  stepsContainer: {
    position: 'relative',
  },
  timelineBackgroundLine: {
    position: 'absolute',
    left: 19,
    top: 28,
    bottom: 28,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  bikeBadge: {
    position: 'absolute',
    left: 20 - 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4C400',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    shadowColor: '#F4C400',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    zIndex: 5,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 8,
    zIndex: 20,
  },
  stepNumber: {
    fontSize: 13,
  },
  stepBody: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
});
