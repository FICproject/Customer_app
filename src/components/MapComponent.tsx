import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Svg, { Circle, Line, Path, Rect, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Try loading native react-native-maps
let NativeMapView: any = null;
let NativeMarker: any = null;
let NativePolyline: any = null;

try {
  const Maps = require('react-native-maps');
  NativeMapView = Maps.default || Maps;
  NativeMarker = Maps.Marker;
  NativePolyline = Maps.Polyline;
} catch (e) {
  console.log('[MapComponent]: Operating in custom Simulated Vector Map mode.');
}

interface MapComponentProps {
  riderLat: number;
  riderLng: number;
  vendorLat: number;
  vendorLng: number;
  customerLat: number;
  customerLng: number;
  route: [number, number][];
  distance: number;
  eta: number;
  riderName?: string;
  customerName?: string;
}

export default function MapComponent({
  riderLat,
  riderLng,
  vendorLat,
  vendorLng,
  customerLat,
  customerLng,
  route,
  distance,
  eta,
  riderName = 'Rider',
  customerName = 'Customer'
}: MapComponentProps) {

  // Reanimated values for simulated pulse rings on pins
  const pulse = useSharedValue(0.4);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - pulse.value,
      transform: [{ scale: pulse.value * 2.2 }],
    };
  });

  // If react-native-maps is available, render Google Maps
  if (NativeMapView && NativeMarker) {
    const initialRegion = {
      latitude: (vendorLat + customerLat) / 2 || 12.9348,
      longitude: (vendorLng + customerLng) / 2 || 77.6189,
      latitudeDelta: Math.abs(vendorLat - customerLat) * 2 || 0.05,
      longitudeDelta: Math.abs(vendorLng - customerLng) * 2 || 0.05,
    };

    const nativeCoordsRoute = route.map(coord => ({
      latitude: coord[0],
      longitude: coord[1]
    }));

    return (
      <View style={styles.mapWrapper}>
        <NativeMapView
          style={StyleSheet.absoluteFill}
          initialRegion={initialRegion}
          customMapStyle={darkMapStyle}
        >
          {/* Vendor Marker */}
          <NativeMarker coordinate={{ latitude: vendorLat, longitude: vendorLng }} title="Vendor (ABC Electronics)">
            <View style={[styles.markerPin, { backgroundColor: '#8B5CF6' }]}>
              <Text style={styles.markerEmoji}>🏪</Text>
            </View>
          </NativeMarker>

          {/* Customer Marker */}
          <NativeMarker coordinate={{ latitude: customerLat, longitude: customerLng }} title={`Deliver to ${customerName}`}>
            <View style={[styles.markerPin, { backgroundColor: '#10B981' }]}>
              <Text style={styles.markerEmoji}>🏠</Text>
            </View>
          </NativeMarker>

          {/* Rider Marker */}
          <NativeMarker coordinate={{ latitude: riderLat, longitude: riderLng }} title={`${riderName} (Rider)`}>
            <View style={[styles.markerPin, { backgroundColor: '#F4C400' }]}>
              <Text style={styles.markerEmoji}>🚲</Text>
            </View>
          </NativeMarker>

          {/* Route path */}
          {nativeCoordsRoute.length > 0 && (
            <NativePolyline
              coordinates={nativeCoordsRoute}
              strokeColor="#3B82F6"
              strokeWidth={4}
              lineDashPattern={[6, 6]}
            />
          )}
        </NativeMapView>
      </View>
    );
  }

  // --- VECTOR SIMULATED MAP FALLBACK ---
  // Map coordinates to pixel spaces on a 300x300 canvas
  const getCanvasCoords = (lat: number, lng: number) => {
    // Bangalore bounding box coordinates for linear interpolation
    const minLat = 12.9100;
    const maxLat = 12.9600;
    const minLng = 77.6000;
    const maxLng = 77.6500;

    const x = ((lng - minLng) / (maxLng - minLng)) * 260 + 20;
    const y = 300 - (((lat - minLat) / (maxLat - minLat)) * 260 + 20); // invert Y for screen space

    return { x, y };
  };

  const vCoord = getCanvasCoords(vendorLat, vendorLng);
  const cCoord = getCanvasCoords(customerLat, customerLng);
  const rCoord = getCanvasCoords(riderLat, riderLng);

  // Translate route arrays to SVG Polyline points
  const svgRoutePoints = route
    .map(c => {
      const p = getCanvasCoords(c[0], c[1]);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  return (
    <View style={styles.simContainer}>
      {/* Space Theme Star Grid */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 300 300">
          <Rect width="300" height="300" fill="#050B1E" />
          
          {/* Cyber Constellation Background Grid */}
          <G stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1">
            <Line x1="50" y1="0" x2="50" y2="300" />
            <Line x1="100" y1="0" x2="100" y2="300" />
            <Line x1="150" y1="0" x2="150" y2="300" />
            <Line x1="200" y1="0" x2="200" y2="300" />
            <Line x1="250" y1="0" x2="250" y2="300" />
            <Line x1="0" y1="50" x2="300" y2="50" />
            <Line x1="0" y1="100" x2="300" y2="100" />
            <Line x1="0" y1="150" x2="300" y2="150" />
            <Line x1="0" y1="200" x2="300" y2="200" />
            <Line x1="0" y1="250" x2="300" y2="250" />
          </G>

          {/* Dotted Route Constellation Path */}
          {svgRoutePoints ? (
            <Path
              d={`M ${svgRoutePoints}`}
              stroke="#3B82F6"
              strokeWidth="3.5"
              strokeDasharray="5,6"
              fill="none"
            />
          ) : (
            <Line
              x1={vCoord.x} y1={vCoord.y}
              x2={cCoord.x} y2={cCoord.y}
              stroke="#3B82F6"
              strokeWidth="3.5"
              strokeDasharray="5,6"
            />
          )}

          {/* Vendor Node */}
          <Circle cx={vCoord.x} cy={vCoord.y} r="16" fill="rgba(139, 92, 246, 0.15)" stroke="#8B5CF6" strokeWidth="1.5" />
          
          {/* Customer Node */}
          <Circle cx={cCoord.x} cy={cCoord.y} r="16" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="1.5" />
        </Svg>
      </View>

      {/* Simulated Pulsating Glows and Pins */}
      {/* Vendor */}
      <View style={[styles.simPin, { left: vCoord.x - 14, top: vCoord.y - 14, backgroundColor: '#8B5CF6' }]}>
        <Text style={styles.simEmoji}>🏪</Text>
      </View>

      {/* Customer */}
      <View style={[styles.simPin, { left: cCoord.x - 14, top: cCoord.y - 14, backgroundColor: '#10B981' }]}>
        <Text style={styles.simEmoji}>🏠</Text>
      </View>

      {/* Rider with Pulse Rings */}
      <View style={{ position: 'absolute', left: rCoord.x - 16, top: rCoord.y - 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={[styles.pulseRing, animatedPulseStyle]} />
        <View style={[styles.simPin, { position: 'relative', left: 0, top: 0, backgroundColor: '#F4C400' }]}>
          <Text style={styles.simEmoji}>🚲</Text>
        </View>
      </View>

      {/* Dashboard Metrics Overlay */}
      <View style={styles.metricsBox}>
        <Text style={styles.metricsTitle}>GPS Live Constellation Map</Text>
        <View style={styles.metricsRow}>
          <View>
            <Text style={styles.metricsLabel}>Distance</Text>
            <Text style={styles.metricsVal}>{distance.toFixed(2)} KM</Text>
          </View>
          <View style={styles.verticalBorder} />
          <View>
            <Text style={styles.metricsLabel}>ETA</Text>
            <Text style={styles.metricsVal}>{eta} MINS</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  markerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#050B1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  markerEmoji: {
    fontSize: 14,
  },
  simContainer: {
    flex: 1,
    backgroundColor: '#050B1E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    position: 'relative',
    height: 300,
  },
  simPin: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#050B1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  simEmoji: {
    fontSize: 13,
  },
  pulseRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(244, 196, 0, 0.35)',
    borderWidth: 1,
    borderColor: '#F4C400',
  },
  metricsBox: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(5, 11, 30, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 10,
  },
  metricsTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#F4C400',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricsLabel: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  metricsVal: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'black',
    textAlign: 'center',
    marginTop: 2,
  },
  verticalBorder: {
    height: 20,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});

// Custom dark mode theme configurations for Google Maps API
const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#1e2735" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1e2735" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f282d" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
  { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
  { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
  { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];
