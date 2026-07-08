import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, Line, G, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import * as Icons from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface LandingHeroProps {
  onJoinPress: () => void;
  onExplorePress: () => void;
}

// Stats data
const STATS = [
  { icon: 'Star', value: '10M+', label: 'Happy Members' },
  { icon: 'Globe', value: '50+', label: 'Countries' },
  { icon: 'Gift', value: '5000+', label: 'Partner Brands' },
  { icon: 'Tag', value: '70%', label: 'Member Savings' },
  { icon: 'Headphones', value: '24/7', label: 'Support' },
];

export default function LandingHero({ onJoinPress, onExplorePress }: LandingHeroProps) {
  // Typewriter effect
  const phrases = ['Everywhere You Go.', 'Get Everything in One Place.'];
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const currentPhrase = phrases[phraseIndex];
      const currentText = isDeleting
        ? currentPhrase.substring(0, charIndex - 1)
        : currentPhrase.substring(0, charIndex + 1);

      setTypedText(currentText);

      if (isDeleting) {
        charIndex--;
      } else {
        charIndex++;
      }

      let delta = isDeleting ? 40 : 100;

      if (!isDeleting && currentText === currentPhrase) {
        delta = 2500;
        isDeleting = true;
      } else if (isDeleting && currentText === '') {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        charIndex = 0;
        delta = 500;
      }

      timer = setTimeout(tick, delta);
    };

    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, []);

  // Animations
  const constellationRotate = useSharedValue(0);
  const earthRotate = useSharedValue(0);
  const subtitleOpacity = useSharedValue(1);
  const headlineOpacity = useSharedValue(1);
  const buttonsOpacity = useSharedValue(1);
  const statsOpacity = useSharedValue(1);
  const cursorOpacity = useSharedValue(0);
  const glowPulse = useSharedValue(0);

  useEffect(() => {
    // Reset to 0 to trigger staggered transition on mount
    subtitleOpacity.value = 0;
    headlineOpacity.value = 0;
    buttonsOpacity.value = 0;
    statsOpacity.value = 0;

    // Constellation rotation
    constellationRotate.value = withRepeat(
      withTiming(360, { duration: 80000, easing: Easing.linear }),
      -1,
      false,
    );

    // Earth slow drift drift
    earthRotate.value = withRepeat(
      withTiming(1, { duration: 20000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    // Cursor blink
    cursorOpacity.value = withRepeat(
      withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    // Glow pulse
    glowPulse.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    // Content stagger
    subtitleOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    headlineOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    buttonsOpacity.value = withDelay(1000, withTiming(1, { duration: 800 }));
    statsOpacity.value = withDelay(1400, withTiming(1, { duration: 800 }));
  }, []);

  const constellationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${constellationRotate.value}deg` }],
  }));

  const earthStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(earthRotate.value, [0, 1], [-0.8, 0.8])}deg` },
      { scale: 1.05 }
    ],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: interpolate(subtitleOpacity.value, [0, 1], [20, 0]) }],
  }));

  const headlineStyle = useAnimatedStyle(() => ({
    opacity: headlineOpacity.value,
    transform: [{ translateY: interpolate(headlineOpacity.value, [0, 1], [30, 0]) }],
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: interpolate(buttonsOpacity.value, [0, 1], [20, 0]) }],
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: interpolate(statsOpacity.value, [0, 1], [15, 0]) }],
  }));

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.15, 0.35]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [1, 1.15]) }],
  }));

  const renderStatIcon = (iconName: string) => {
    const IconComp = (Icons as any)[iconName];
    if (!IconComp) return <Icons.HelpCircle color="#F4C400" size={14} />;
    return <IconComp color="#F4C400" size={14} />;
  };

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <Animated.View style={[styles.bgGlow, glowStyle]} />

      {/* Constellation Background */}
      <Animated.View style={[styles.constellation, constellationStyle]}>
        <Svg width="260" height="260" viewBox="0 0 100 100">
          <G stroke="rgba(244, 196, 0, 0.10)" strokeWidth="0.35" fill="none">
            <Circle cx="50" cy="50" r="42" strokeDasharray="2, 5" />
            <Circle cx="50" cy="50" r="30" />
            <Circle cx="50" cy="50" r="18" strokeDasharray="3, 2" />
            <Circle cx="50" cy="50" r="8" strokeDasharray="1, 2" />
            <Line x1="8" y1="50" x2="92" y2="50" />
            <Line x1="50" y1="8" x2="50" y2="92" />
            <Line x1="20" y1="20" x2="80" y2="80" />
            <Line x1="20" y1="80" x2="80" y2="20" />
          </G>
          <G fill="#F4C400">
            <Circle cx="50" cy="8" r="1.5" />
            <Circle cx="50" cy="92" r="1.5" />
            <Circle cx="8" cy="50" r="1.5" />
            <Circle cx="92" cy="50" r="1.5" />
            <Circle cx="20" cy="20" r="1" />
            <Circle cx="80" cy="80" r="1" />
            <Circle cx="80" cy="20" r="1.2" />
            <Circle cx="20" cy="80" r="1.2" />
            <Circle cx="50" cy="50" r="2" opacity={0.5} />
            <Circle cx="35" cy="35" r="0.7" opacity={0.6} />
            <Circle cx="65" cy="65" r="0.7" opacity={0.6} />
          </G>
        </Svg>
      </Animated.View>

      {/* Curved Earth Horizon Background */}
      <Animated.Image
        source={require('../../assets/images/earth_curve.jpg')}
        style={[styles.earthImage, earthStyle]}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.contentWrapper}>
        {/* Subtitle */}
        <Animated.View style={subtitleStyle}>
          <Text style={styles.subtitle}>ONE MEMBERSHIP. UNLIMITED BENEFITS.</Text>
        </Animated.View>

        {/* Headline */}
        <Animated.View style={[styles.headlineContainer, headlineStyle]}>
          <Text style={styles.headline}>Everything Connected.</Text>
          <View style={styles.typedRow}>
            <Text style={styles.typedText}>{typedText}</Text>
            <Animated.View style={[styles.cursor, cursorStyle]} />
          </View>
        </Animated.View>

        {/* Description */}
        <Animated.View style={headlineStyle}>
          <Text style={styles.description}>
            Explore a world of services, products, travel, jobs and more. All powered by one global membership.
          </Text>
        </Animated.View>

        {/* CTA Buttons */}
        <Animated.View style={[styles.buttonRow, buttonsStyle]}>
          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={onJoinPress}>
            <Text style={styles.primaryBtnText}>Login</Text>
            <Icons.ArrowRight color="#050B1E" size={13} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8} onPress={onExplorePress}>
            <View style={styles.playCircle}>
              <Icons.Play color="rgba(255,255,255,0.7)" size={10} fill="rgba(255,255,255,0.7)" />
            </View>
            <Text style={styles.secondaryBtnText}>Explore</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: height * 0.44,
    backgroundColor: '#030814',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    overflow: 'hidden',
  },
  bgGlow: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(30, 27, 75, 0.35)',
  },
  constellation: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    zIndex: 1,
  },
  earthImage: {
    position: 'absolute',
    top: -width * 0.45,
    width: width * 1.5,
    height: width * 1.5,
    left: -width * 0.25,
    opacity: 0.85,
    zIndex: 2,
  },
  contentWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
    paddingTop: 10,
  },
  subtitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F4C400',
    letterSpacing: 2.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  headlineContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  headline: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
  },
  typedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    minHeight: 28,
  },
  typedText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F4C400',
    textAlign: 'center',
  },
  cursor: {
    width: 2,
    height: 20,
    backgroundColor: '#F4C400',
    marginLeft: 3,
    borderRadius: 1,
  },
  description: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
    fontWeight: '500',
    paddingHorizontal: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4C400',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#F4C400',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#050B1E',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  playCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 1,
  },
  secondaryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
  },
});
