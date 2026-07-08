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
  withTiming,
  withDelay,
  Easing,
  interpolate,
  FadeInDown,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import * as Icons from 'lucide-react-native';

const { width } = Dimensions.get('window');

const PILLARS = [
  {
    id: 'services',
    icon: 'Briefcase',
    accent: '#f59e0b',
    title: 'Services',
    desc: 'Priority booking across 19 professional categories.',
    tag: '19 Categories',
  },
  {
    id: 'products',
    icon: 'ShoppingBag',
    accent: '#fb923c',
    title: 'Products',
    desc: 'Exclusive pricing on electronics, fashion & lifestyle.',
    tag: '16 Categories',
  },
  {
    id: 'daily-needs',
    icon: 'Truck',
    accent: '#38bdf8',
    title: 'Daily Needs',
    desc: 'Groceries, pharmacy & essentials at zero convenience fees.',
    tag: '12 Categories',
  },
  {
    id: 'food',
    icon: 'Utensils',
    accent: '#34d399',
    title: 'Food',
    desc: '20%+ off at premium restaurants, cafes & cloud kitchens.',
    tag: '16 Categories',
  },
  {
    id: 'stay',
    icon: 'BedDouble',
    accent: '#fbbf24',
    title: 'Stay',
    desc: 'Luxury hotels & resorts with member-only corporate rates.',
    tag: '16 Categories',
  },
  {
    id: 'travel',
    icon: 'Plane',
    accent: '#818cf8',
    title: 'Travel',
    desc: 'Flights, trains, cabs, tours & visa assistance.',
    tag: '19 Categories',
  },
  {
    id: 'jobs',
    icon: 'UserCheck',
    accent: '#c084fc',
    title: 'Jobs',
    desc: '23 career categories spanning IT, healthcare & more.',
    tag: '23 Categories',
  },
];

interface LandingEcosystemProps {
  onCategoryPress?: (category: string) => void;
}

export default function LandingEcosystem({ onCategoryPress }: LandingEcosystemProps) {
  const renderIcon = (iconName: string, color: string) => {
    const IconComp = (Icons as any)[iconName];
    if (!IconComp) return <Icons.HelpCircle color={color} size={22} />;
    return <IconComp color={color} size={22} />;
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.overline}>ONE MEMBERSHIP · SEVEN PILLARS</Text>
        <Text style={styles.title}>
          Our <Text style={styles.titleAccent}>Ecosystem</Text>
        </Text>
        <Text style={styles.subtitle}>
          Explore every pillar — a world of services, products, dining, travel, and careers.
        </Text>
      </View>

      {/* Pillar Grid */}
      <View style={styles.grid}>
        {PILLARS.map((pillar, idx) => (
          <Animated.View
            key={pillar.id}
            entering={FadeInDown.delay(idx * 100).duration(500).springify()}
          >
            <TouchableOpacity
              style={[styles.card, { borderColor: `${pillar.accent}30` }]}
              activeOpacity={0.85}
              onPress={() => onCategoryPress?.(pillar.title)}
            >
              {/* Glow effect */}
              <View
                style={[
                  styles.cardGlow,
                  { backgroundColor: pillar.accent },
                ]}
              />

              {/* Icon */}
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: `${pillar.accent}18`,
                    borderColor: `${pillar.accent}35`,
                  },
                ]}
              >
                {renderIcon(pillar.icon, pillar.accent)}
              </View>

              {/* Content */}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{pillar.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {pillar.desc}
                </Text>
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <Text style={[styles.tagText, { color: pillar.accent }]}>
                  {pillar.tag}
                </Text>
                <Text style={[styles.exploreText, { color: pillar.accent }]}>
                  Explore →
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const CARD_WIDTH = (width - 48 - 12) / 2;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#020B18',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 28,
  },
  overline: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 3,
    color: 'rgba(245, 158, 11, 0.85)',
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  titleAccent: {
    color: '#F4C400',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.45)',
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
    minHeight: 165,
    justifyContent: 'space-between',
  },
  cardGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.12,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.45)',
    lineHeight: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 10,
    marginTop: 10,
  },
  tagText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  exploreText: {
    fontSize: 10,
    fontWeight: '900',
  },
});
