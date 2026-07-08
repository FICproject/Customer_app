import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import * as Icons from 'lucide-react-native';
import Svg, { Circle, G } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface LandingCTAProps {
  onJoinPress: () => void;
}

export default function LandingCTA({ onJoinPress }: LandingCTAProps) {
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.3, 0.7]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.08]) }],
  }));

  return (
    <View style={styles.container}>
      {/* Background decoration */}
      <Animated.View style={[styles.bgGlow, glowStyle]} />

      {/* Decorative rings */}
      <View style={styles.ringsContainer}>
        <Svg width={200} height={200} viewBox="0 0 100 100">
          <G stroke="rgba(244, 196, 0, 0.08)" fill="none">
            <Circle cx="50" cy="50" r="48" strokeWidth="0.5" strokeDasharray="3, 4" />
            <Circle cx="50" cy="50" r="35" strokeWidth="0.4" strokeDasharray="2, 3" />
            <Circle cx="50" cy="50" r="22" strokeWidth="0.3" />
          </G>
        </Svg>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Icons.Rocket color="#F4C400" size={28} />
        </View>

        <Text style={styles.title}>Ready to Connect?</Text>
        <Text style={styles.subtitle}>
          Join millions of members and unlock a world of exclusive benefits, discounts, and premium services.
        </Text>

        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={onJoinPress}
        >
          <Text style={styles.ctaText}>Join Membership Now</Text>
          <Icons.ArrowRight color="#050B1E" size={16} />
        </TouchableOpacity>

        <Text style={styles.guarantee}>
          ✦ 30-Day Money-Back Guarantee · Cancel Anytime
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#030814',
    paddingVertical: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  bgGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(244, 196, 0, 0.06)',
    top: '15%',
  },
  ringsContainer: {
    position: 'absolute',
    opacity: 0.5,
    top: 20,
    right: -40,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(244, 196, 0, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(244, 196, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#F4C400',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4C400',
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 30,
    gap: 10,
    width: '90%',
    shadowColor: '#F4C400',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 10,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#050B1E',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  guarantee: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 18,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
