import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  PermissionsAndroid,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/themeStore';
import { useLocationStore, INDIAN_STATES_AND_CITIES, StateCityData } from '../store/locationStore';
import * as Icons from 'lucide-react-native';

export default function LocationSelection() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, themeMode } = useThemeStore();
  const { selectedState, selectedCity, setLocation } = useLocationStore();

  const isLight = colors.background === '#FFFDF5' || colors.background === '#FFFFFF' || colors.background === '#F8FAFC' || themeMode === 'light';

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedState, setExpandedState] = useState<string | null>(selectedState || 'Karnataka');
  const [loadingGPS, setLoadingGPS] = useState(false);

  // Filtered states and cities based on search
  const filteredStates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return INDIAN_STATES_AND_CITIES;

    return INDIAN_STATES_AND_CITIES.map((item: StateCityData) => {
      const stateMatch = item.state.toLowerCase().includes(query);
      const matchingCities = item.cities.filter((c: string) => c.toLowerCase().includes(query));

      if (stateMatch) {
        return item;
      }
      if (matchingCities.length > 0) {
        return {
          ...item,
          cities: matchingCities,
        };
      }
      return null;
    }).filter(Boolean) as StateCityData[];
  }, [searchQuery]);

  const handleSelectCity = (stateName: string, cityName: string) => {
    setLocation(stateName, cityName, false);
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('CustomerTabs', { screen: 'Home' });
    }
  };

  const toggleState = (stateName: string) => {
    setExpandedState(prev => (prev === stateName ? null : stateName));
  };

  const handleUseGPS = async () => {
    try {
      setLoadingGPS(true);
      let isPermissionGranted = true;

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message: 'Connect Mobile needs access to your location to fetch local delivery & partner services.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        isPermissionGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      }

      if (isPermissionGranted) {
        try {
          const response = await fetch('https://ip-api.com/json');
          const data = await response.json();
          setLoadingGPS(false);

          if (data && data.status === 'success') {
            const detectedCity = data.city || 'Bengaluru';
            const detectedRegion = data.regionName || 'Karnataka';

            setLocation(detectedRegion, detectedCity, true);
            Alert.alert(
              'Location Detected',
              `Current Location: ${detectedCity}, ${detectedRegion}`,
              [
                {
                  text: 'Confirm & Proceed',
                  onPress: () => {
                    if (navigation.canGoBack()) {
                      navigation.goBack();
                    } else {
                      navigation.navigate('CustomerTabs', { screen: 'Home' });
                    }
                  },
                },
              ]
            );
          } else {
            // Fallback default
            setLocation('Karnataka', 'Bengaluru', true);
            if (navigation.canGoBack()) navigation.goBack();
          }
        } catch {
          setLoadingGPS(false);
          setLocation('Karnataka', 'Bengaluru', true);
          if (navigation.canGoBack()) navigation.goBack();
        }
      } else {
        setLoadingGPS(false);
        Alert.alert(
          'Permission Denied',
          'Please select your state and city manually from the list below.'
        );
      }
    } catch {
      setLoadingGPS(false);
      setLocation('Karnataka', 'Bengaluru', true);
      if (navigation.canGoBack()) navigation.goBack();
    }
  };

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('CustomerTabs', { screen: 'Home' });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 16) + 8,
            borderBottomColor: isLight ? 'rgba(245, 184, 0, 0.15)' : colors.cardBorder,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={handleClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icons.ArrowLeft color={colors.text} size={22} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>SELECT LOCATION</Text>

        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={handleClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icons.X color={colors.text} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Prominent Search Field */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
              borderColor: isLight ? '#FDE68A' : colors.cardBorder,
            },
          ]}
        >
          <Icons.Search color={isLight ? '#F5B800' : '#F4C400'} size={20} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search state, UT, or city/district..."
            placeholderTextColor={isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.45)'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icons.X color={isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.6)'} size={18} />
            </TouchableOpacity>
          )}
        </View>

        {/* GPS Quick Action Button */}
        <TouchableOpacity
          style={[
            styles.gpsCard,
            {
              backgroundColor: isLight ? '#FEF9E7' : 'rgba(244, 196, 0, 0.08)',
              borderColor: isLight ? '#FDE68A' : 'rgba(244, 196, 0, 0.25)',
            },
          ]}
          activeOpacity={0.8}
          onPress={handleUseGPS}
          disabled={loadingGPS}
        >
          <View style={[styles.gpsIconCircle, { backgroundColor: isLight ? 'rgba(245, 184, 0, 0.15)' : 'rgba(244, 196, 0, 0.15)' }]}>
            {loadingGPS ? (
              <ActivityIndicator size="small" color="#F5B800" />
            ) : (
              <Icons.Navigation color="#F5B800" size={18} />
            )}
          </View>
          <View style={styles.gpsTextCol}>
            <Text style={[styles.gpsTitle, { color: colors.text }]}>Use Current Location</Text>
            <Text style={[styles.gpsSub, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)' }]}>
              Detect your location automatically using GPS
            </Text>
          </View>
          <Icons.ChevronRight color={isLight ? '#64748B' : 'rgba(255, 255, 255, 0.4)'} size={18} />
        </TouchableOpacity>

        {/* State / UT List Title */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)' }]}>
            {searchQuery ? `MATCHING REGIONS (${filteredStates.length})` : 'ALL STATES & UNION TERRITORIES'}
          </Text>
        </View>

        {/* Expandable State / UT Rows */}
        {filteredStates.map((item) => {
          const isExpanded = expandedState === item.state || (searchQuery.trim().length > 0 && filteredStates.length <= 4);
          const isSelectedState = selectedState === item.state;

          return (
            <View
              key={item.state}
              style={[
                styles.stateCard,
                {
                  backgroundColor: isLight ? '#FFFFFF' : 'rgba(13, 22, 54, 0.65)',
                  borderColor: isSelectedState
                    ? '#F5B800'
                    : isExpanded
                    ? (isLight ? '#FDE68A' : 'rgba(244, 196, 0, 0.4)')
                    : (isLight ? '#F1EAD8' : colors.cardBorder),
                },
              ]}
            >
              {/* State Row Header */}
              <TouchableOpacity
                style={styles.stateRow}
                activeOpacity={0.75}
                onPress={() => toggleState(item.state)}
              >
                <View
                  style={[
                    styles.stateIconCircle,
                    {
                      backgroundColor: isSelectedState
                        ? 'rgba(245, 184, 0, 0.15)'
                        : isLight
                        ? '#FEF9E7'
                        : 'rgba(255, 255, 255, 0.05)',
                    },
                  ]}
                >
                  <Icons.MapPin
                    color={isSelectedState ? '#F5B800' : isLight ? '#0F172A' : '#FFFFFF'}
                    size={18}
                  />
                </View>

                <View style={styles.stateTextCol}>
                  <Text
                    style={[
                      styles.stateNameText,
                      {
                        color: isSelectedState ? '#F5B800' : colors.text,
                        fontWeight: isSelectedState ? '700' : '600',
                      },
                    ]}
                  >
                    {item.state}
                    {item.isUT ? ' (UT)' : ''}
                  </Text>
                  <Text style={[styles.stateCityCount, { color: isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.4)' }]}>
                    {item.cities.length} {item.cities.length === 1 ? 'district' : 'districts / cities'}
                  </Text>
                </View>

                {isExpanded ? (
                  <Icons.ChevronUp color={isLight ? '#0F172A' : '#FFFFFF'} size={18} />
                ) : (
                  <Icons.ChevronDown color={isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)'} size={18} />
                )}
              </TouchableOpacity>

              {/* Expanded Cities / Districts Accordion */}
              {isExpanded && (
                <View
                  style={[
                    styles.citiesContainer,
                    { borderTopColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.06)' },
                  ]}
                >
                  {item.cities.map((cityName) => {
                    const isSelected = selectedState === item.state && selectedCity === cityName;

                    return (
                      <TouchableOpacity
                        key={cityName}
                        style={[
                          styles.cityItem,
                          {
                            backgroundColor: isSelected
                              ? (isLight ? '#FEF9E7' : 'rgba(244, 196, 0, 0.1)')
                              : 'transparent',
                          },
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleSelectCity(item.state, cityName)}
                      >
                        <View style={styles.cityLeftCol}>
                          <View
                            style={[
                              styles.cityDot,
                              {
                                backgroundColor: isSelected
                                  ? '#F5B800'
                                  : isLight
                                  ? '#CBD5E1'
                                  : 'rgba(255, 255, 255, 0.25)',
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.cityNameText,
                              {
                                color: isSelected ? '#F5B800' : colors.text,
                                fontWeight: isSelected ? '700' : '500',
                              },
                            ]}
                          >
                            {cityName}
                          </Text>
                        </View>

                        {isSelected && (
                          <View style={styles.selectedBadge}>
                            <Icons.Check color="#F5B800" size={16} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {filteredStates.length === 0 && (
          <View style={styles.emptyContainer}>
            <Icons.MapPinOff color={isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.4)'} size={40} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No locations found</Text>
            <Text style={[styles.emptySub, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)' }]}>
              Try searching for another state, union territory or district.
            </Text>
          </View>
        )}
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    marginBottom: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    height: '100%',
    paddingVertical: 0,
  },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 18,
    gap: 12,
  },
  gpsIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsTextCol: {
    flex: 1,
  },
  gpsTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  gpsSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  sectionHeaderRow: {
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  stateCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  stateIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTextCol: {
    flex: 1,
  },
  stateNameText: {
    fontSize: 14.5,
    marginBottom: 2,
  },
  stateCityCount: {
    fontSize: 11,
    fontWeight: '500',
  },
  citiesContainer: {
    borderTopWidth: 1,
    paddingVertical: 4,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  cityLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cityNameText: {
    fontSize: 13,
  },
  selectedBadge: {
    padding: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
