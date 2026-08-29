import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Share,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Icons from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';

// 14-day calendar date item
interface DateItem {
  dayName: string; // 'SAT'
  dateNum: number; // 29
  monthStr: string; // 'AUG'
  fullDateStr: string; // 'Sat, 29 Aug 2026'
  dateObj: Date;
  status: 'AVAILABLE' | 'FULL';
}

export default function StayDetails() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const routeParams = (route.params as any) || {};

  const stay = routeParams.stay || {
    id: 'stay_001',
    name: 'Coorg Heritage Villa',
    location: 'Coorg, Karnataka',
    type: 'Villa',
    rating: '4.9',
    reviews: '630',
    price: '₹7,250 / night',
    priceNum: 7250,
    originalPrice: '₹9,500',
    discount: '24% OFF',
    desc: 'Luxury villa nestled amidst coffee plantations, with private plunge pool, lush forest views, breakfast, Wi-Fi and premium luxury rooms crafted for memorable vacations.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop&q=80',
    amenities: ['Swimming Pool', 'Free Wi-Fi', 'Breakfast Included', 'Free Parking', 'Air Conditioning'],
  };

  const { colors, themeMode } = useThemeStore();
  const isLight = colors.background === '#FFFDF5' || colors.background === '#FFFFFF' || colors.background === '#F8FAFC' || colors.background === '#FFF8E8' || themeMode === 'light';

  const currentUser = useAuthStore((state) => state.currentUser);
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = wishlistItems.some((w) => w.id === stay.id);

  // Gallery State
  const galleryImages = useMemo(() => [
    stay.image,
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80',
  ], [stay.image]);

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Room State
  const [selectedRoom, setSelectedRoom] = useState<{
    id: string;
    name: string;
    guests: string;
    priceNum: number;
    priceStr: string;
    inclusions: string[];
  }>({
    id: 'deluxe',
    name: 'DELUXE ROOM',
    guests: '2 Guests • 1 King Bed',
    priceNum: stay.priceNum || 7250,
    priceStr: stay.price || '₹7,250 / night',
    inclusions: ['Breakfast included', 'Free cancellation', 'Free Wi-Fi'],
  });

  // Booking Configuration Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4>(1); // 1: Dates & Guests, 2: Guest Details, 3: Payment & Summary, 4: Confirmed

  // --- Dynamic Dates Generator (14 Days) ---
  const datesList = useMemo<DateItem[]>(() => {
    const list: DateItem[] = [];
    const baseDate = new Date(); // Start from today
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    for (let i = 0; i < 14; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);

      // Tuesday booked simulation
      const isTuesday = d.getDay() === 2;

      list.push({
        dayName: dayNames[d.getDay()],
        dateNum: d.getDate(),
        monthStr: monthNames[d.getMonth()],
        fullDateStr: `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        dateObj: d,
        status: isTuesday ? 'FULL' : 'AVAILABLE',
      });
    }
    return list;
  }, []);

  // Check-In State
  const [checkInIndex, setCheckInIndex] = useState<number>(0);
  const [checkInTimeSlot, setCheckInTimeSlot] = useState<string>('02:00 PM');
  const [manualCheckInTime, setManualCheckInTime] = useState<string>('02:00 PM');

  // Check-Out State (default to next day index 1)
  const [checkOutIndex, setCheckOutIndex] = useState<number>(1);
  const [checkOutTimeSlot, setCheckOutTimeSlot] = useState<string>('11:00 AM');
  const [manualCheckOutTime, setManualCheckOutTime] = useState<string>('11:00 AM');

  // Guests & Rooms Configuration State
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [roomsCount, setRoomsCount] = useState<number>(1);

  // Time Slot Options
  const checkInTimeOptions = ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'];
  const checkOutTimeOptions = ['11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '06:00 PM'];

  // Form Details
  const [guestName, setGuestName] = useState(currentUser?.name || 'Uma Shankar');
  const [guestMobile, setGuestMobile] = useState(currentUser?.phone || '+91 98765 43210');
  const [guestEmail, setGuestEmail] = useState(currentUser?.email || 'uma@connectmobile.com');
  const [guestSpecialNote, setGuestSpecialNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Net Banking' | 'Pay at Hotel'>('UPI');
  const [confirmedBookingId, setConfirmedBookingId] = useState('');

  // Selected Date Objects
  const selectedCheckInItem = datesList[checkInIndex] || datesList[0];
  const selectedCheckOutItem = datesList[checkOutIndex] || datesList[1];

  // Duration (Nights) Calculation
  const computedNights = Math.max(1, checkOutIndex - checkInIndex);

  // Price Calculations
  const pricePerNight = selectedRoom.priceNum;
  const baseRoomCharge = pricePerNight * computedNights * roomsCount;
  const taxesAndFees = Math.round(baseRoomCharge * 0.10);
  const grandTotal = baseRoomCharge + taxesAndFees;

  // Handle Check-In Date Selection
  const handleSelectCheckInDate = (idx: number) => {
    if (datesList[idx].status === 'FULL') {
      Alert.alert('Date Unavailable', 'This date is currently fully booked. Please select an available date.');
      return;
    }
    setCheckInIndex(idx);
    // If check-out is now before or on check-in, push check-out forward
    if (checkOutIndex <= idx) {
      const nextIdx = Math.min(idx + 1, datesList.length - 1);
      setCheckOutIndex(nextIdx);
    }
  };

  // Handle Check-Out Date Selection
  const handleSelectCheckOutDate = (idx: number) => {
    if (idx <= checkInIndex) {
      Alert.alert('Invalid Date', 'Check-out date must be at least 1 day after the check-in date.');
      return;
    }
    setCheckOutIndex(idx);
  };

  // Handle Share
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${stay.name} in ${stay.location} on Connect! ${stay.price}`,
        title: stay.name,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  // Amenities list icon resolver
  const renderAmenityIcon = (amen: string) => {
    const a = amen.toLowerCase();
    if (a.includes('pool') || a.includes('swim')) return <Icons.Waves color="#059669" size={16} />;
    if (a.includes('wifi') || a.includes('internet')) return <Icons.Wifi color="#059669" size={16} />;
    if (a.includes('breakfast') || a.includes('food') || a.includes('dining')) return <Icons.Coffee color="#059669" size={16} />;
    if (a.includes('park')) return <Icons.Car color="#059669" size={16} />;
    if (a.includes('ac') || a.includes('air') || a.includes('condition')) return <Icons.Wind color="#059669" size={16} />;
    if (a.includes('gym') || a.includes('fit')) return <Icons.Dumbbell color="#059669" size={16} />;
    if (a.includes('spa')) return <Icons.Sparkles color="#059669" size={16} />;
    return <Icons.CheckCircle2 color="#059669" size={16} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: isLight ? '#FFFDF5' : colors.background }]}>
      {/* Top Header */}
      <View
        style={[
          styles.headerWrapper,
          {
            paddingTop: Math.max(insets.top, 16) + 6,
            backgroundColor: isLight ? '#FFF1C7' : colors.cardBg,
            borderBottomColor: isLight ? 'rgba(242, 183, 5, 0.25)' : colors.cardBorder,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icons.ArrowLeft color={colors.text} size={22} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {stay.name}
        </Text>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() =>
              toggleWishlist({
                id: stay.id,
                name: stay.name,
                price: stay.price,
                category: 'Stay',
                image: stay.image,
              })
            }
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icons.Heart
              color={isWishlisted ? '#EF4444' : colors.text}
              size={22}
              fill={isWishlisted ? '#EF4444' : 'none'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleShare}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icons.Share2 color={colors.text} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Scroll */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 85 },
        ]}
      >
        {/* IMAGE GALLERY */}
        <View style={styles.galleryContainer}>
          <Image
            source={{ uri: galleryImages[selectedImgIndex] }}
            style={styles.mainGalleryImg}
            resizeMode="cover"
          />

          <View style={styles.thumbnailRow}>
            {galleryImages.map((imgUri, index) => {
              const isSelected = selectedImgIndex === index;
              return (
                <TouchableOpacity
                  key={`thumb_${index}`}
                  style={[
                    styles.thumbnailWrapper,
                    isSelected && styles.thumbnailWrapperSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedImgIndex(index)}
                >
                  <Image source={{ uri: imgUri }} style={styles.thumbnailImg} resizeMode="cover" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.bodyContent}>
          {/* PROPERTY INFORMATION */}
          <View style={styles.propInfoSection}>
            <View style={styles.titleRow}>
              <Text style={[styles.propTitle, { color: colors.text }]}>{stay.name}</Text>
            </View>

            <View style={styles.ratingAndLocRow}>
              <View style={styles.ratingBadge}>
                <Icons.Star color="#F5B800" size={13} fill="#F5B800" />
                <Text style={styles.ratingBadgeText}>{stay.rating || '4.9'}</Text>
              </View>
              <Text style={[styles.reviewsCountText, { color: isLight ? '#64748B' : '#94A3B8' }]}>
                ({stay.reviews || '630'} reviews)
              </Text>
              <Text style={styles.bulletSeparator}>•</Text>
              <Text style={[styles.locationText, { color: isLight ? '#0F172A' : '#F5B800' }]} numberOfLines={1}>
                {stay.location}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.viewOnMapBtn}
              activeOpacity={0.8}
              onPress={() => setIsMapModalOpen(true)}
            >
              <Icons.MapPin color="#D97706" size={15} />
              <Text style={styles.viewOnMapBtnText}>View on Map</Text>
            </TouchableOpacity>
          </View>

          {/* PRICE SECTION */}
          <View style={[styles.priceCard, { backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)', borderColor: isLight ? '#F1EAD8' : colors.cardBorder }]}>
            <View style={styles.priceLeftRow}>
              <Text style={[styles.priceLargeText, { color: isLight ? '#0F172A' : '#F5B800' }]}>
                {stay.price}
              </Text>
              {stay.originalPrice && (
                <Text style={styles.priceOriginalText}>{stay.originalPrice}</Text>
              )}
              <View style={styles.discountTag}>
                <Text style={styles.discountTagText}>{stay.discount || '24% OFF'}</Text>
              </View>
            </View>
            <Text style={styles.taxesNoticeText}>+ ₹{Math.round((stay.priceNum || 7250) * 0.10)} taxes & fees per night</Text>
          </View>

          {/* AMENITIES */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {(stay.amenities || ['Swimming Pool', 'Free Wi-Fi', 'Breakfast Included', 'Free Parking', 'Air Conditioning']).map((amen: string) => (
                <View
                  key={amen}
                  style={[
                    styles.amenityItemCard,
                    {
                      backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
                      borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
                    },
                  ]}
                >
                  <View style={styles.amenityIconContainer}>
                    {renderAmenityIcon(amen)}
                  </View>
                  <Text style={[styles.amenityLabel, { color: colors.text }]}>{amen}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ABOUT PROPERTY */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>About this property</Text>
            <Text style={[styles.aboutText, { color: isLight ? '#334155' : '#CBD5E1' }]}>
              {stay.desc || 'Luxury villa surrounded by nature with private pool, breakfast, Wi-Fi and premium rooms.'}
            </Text>
          </View>

          {/* ROOM OPTIONS */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Available Rooms</Text>

            {/* Room 1: DELUXE ROOM */}
            <View
              style={[
                styles.roomCard,
                {
                  backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
                  borderColor: selectedRoom.id === 'deluxe' ? '#F5B800' : isLight ? '#F1EAD8' : colors.cardBorder,
                },
              ]}
            >
              <View style={styles.roomHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.roomNameText, { color: colors.text }]}>DELUXE ROOM</Text>
                  <Text style={styles.roomGuestsSubtitle}>2 Guests • 1 King Bed</Text>
                </View>
                <View style={styles.roomPricePill}>
                  <Text style={[styles.roomPricePillText, { color: isLight ? '#0F172A' : '#F5B800' }]}>
                    {stay.price || '₹7,250 / night'}
                  </Text>
                </View>
              </View>

              <View style={styles.roomInclusionsList}>
                <View style={styles.inclusionRow}>
                  <Icons.Check color="#059669" size={14} />
                  <Text style={styles.inclusionText}>Breakfast included</Text>
                </View>
                <View style={styles.inclusionRow}>
                  <Icons.Check color="#059669" size={14} />
                  <Text style={styles.inclusionText}>Free cancellation</Text>
                </View>
                <View style={styles.inclusionRow}>
                  <Icons.Check color="#059669" size={14} />
                  <Text style={styles.inclusionText}>Free Wi-Fi</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.selectRoomBtn,
                  selectedRoom.id === 'deluxe' && styles.selectRoomBtnActive,
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  setSelectedRoom({
                    id: 'deluxe',
                    name: 'DELUXE ROOM',
                    guests: '2 Guests • 1 King Bed',
                    priceNum: stay.priceNum || 7250,
                    priceStr: stay.price || '₹7,250 / night',
                    inclusions: ['Breakfast included', 'Free cancellation', 'Free Wi-Fi'],
                  });
                  setBookingStep(1);
                  setIsBookingModalOpen(true);
                }}
              >
                <Text style={styles.selectRoomBtnText}>Select Room</Text>
              </TouchableOpacity>
            </View>

            {/* Room 2: EXECUTIVE ROOM */}
            <View
              style={[
                styles.roomCard,
                {
                  backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
                  borderColor: selectedRoom.id === 'executive' ? '#F5B800' : isLight ? '#F1EAD8' : colors.cardBorder,
                  marginTop: 12,
                },
              ]}
            >
              <View style={styles.roomHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.roomNameText, { color: colors.text }]}>EXECUTIVE ROOM</Text>
                  <Text style={styles.roomGuestsSubtitle}>2 Guests • 1 King Bed</Text>
                </View>
                <View style={styles.roomPricePill}>
                  <Text style={[styles.roomPricePillText, { color: isLight ? '#0F172A' : '#F5B800' }]}>
                    ₹{Math.round((stay.priceNum || 7250) * 1.23).toLocaleString()} / night
                  </Text>
                </View>
              </View>

              <View style={styles.roomInclusionsList}>
                <View style={styles.inclusionRow}>
                  <Icons.Check color="#059669" size={14} />
                  <Text style={styles.inclusionText}>Breakfast included</Text>
                </View>
                <View style={styles.inclusionRow}>
                  <Icons.Check color="#059669" size={14} />
                  <Text style={styles.inclusionText}>Pool access</Text>
                </View>
                <View style={styles.inclusionRow}>
                  <Icons.Check color="#059669" size={14} />
                  <Text style={styles.inclusionText}>Free Wi-Fi</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.selectRoomBtn,
                  selectedRoom.id === 'executive' && styles.selectRoomBtnActive,
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  setSelectedRoom({
                    id: 'executive',
                    name: 'EXECUTIVE ROOM',
                    guests: '2 Guests • 1 King Bed',
                    priceNum: Math.round((stay.priceNum || 7250) * 1.23),
                    priceStr: `₹${Math.round((stay.priceNum || 7250) * 1.23).toLocaleString()} / night`,
                    inclusions: ['Breakfast included', 'Pool access', 'Free Wi-Fi'],
                  });
                  setBookingStep(1);
                  setIsBookingModalOpen(true);
                }}
              >
                <Text style={styles.selectRoomBtnText}>Select Room</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* POLICIES */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Property Policies</Text>
            <View
              style={[
                styles.policyContainer,
                {
                  backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
                  borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
                },
              ]}
            >
              <View style={styles.policyRow}>
                <Icons.Clock color="#D97706" size={16} />
                <Text style={[styles.policyRowText, { color: colors.text }]}>Check-in: 2:00 PM</Text>
              </View>
              <View style={styles.policyRow}>
                <Icons.Clock color="#D97706" size={16} />
                <Text style={[styles.policyRowText, { color: colors.text }]}>Check-out: 11:00 AM</Text>
              </View>
              <View style={styles.policyRow}>
                <Icons.ShieldCheck color="#059669" size={16} />
                <Text style={[styles.policyRowText, { color: colors.text }]}>
                  Free cancellation up to 24 hours before check-in
                </Text>
              </View>
              <View style={styles.policyRow}>
                <Icons.FileText color="#64748B" size={16} />
                <Text style={[styles.policyRowText, { color: colors.text }]}>
                  Valid government ID required at check-in
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* STICKY BOTTOM BOOKING SECTION */}
      <View
        style={[
          styles.stickyBottomBar,
          {
            paddingBottom: Math.max(insets.bottom, 12) + 4,
            backgroundColor: isLight ? '#FFFFFF' : colors.cardBg,
            borderTopColor: isLight ? '#F1EAD8' : colors.cardBorder,
          },
        ]}
      >
        <View style={styles.stickyPriceColumn}>
          <Text style={[styles.stickyPriceText, { color: isLight ? '#0F172A' : '#F5B800' }]}>
            {selectedRoom.priceStr}
          </Text>
          <Text style={styles.stickyRoomSubtitle}>{selectedRoom.name} • {computedNights} night(s)</Text>
        </View>

        <TouchableOpacity
          style={styles.stickySelectRoomBtn}
          activeOpacity={0.85}
          onPress={() => {
            setBookingStep(1);
            setIsBookingModalOpen(true);
          }}
        >
          <Text style={styles.stickySelectRoomBtnText}>Select Room</Text>
        </TouchableOpacity>
      </View>

      {/* --- LOCATION MAP MODAL --- */}
      <Modal visible={isMapModalOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
          <View
            style={[
              styles.headerWrapper,
              {
                paddingTop: Math.max(insets.top, 16),
                backgroundColor: '#0F172A',
                borderBottomColor: 'rgba(255,255,255,0.1)',
              },
            ]}
          >
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => setIsMapModalOpen(false)}>
              <Icons.ArrowLeft color="#FFFFFF" size={22} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Location Map</Text>
            <View style={{ width: 36 }} />
          </View>

          <View style={{ flex: 1, position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1000&auto=format&fit=crop&q=80' }}
              style={{ width: '100%', height: '100%', opacity: 0.8 }}
              resizeMode="cover"
            />
            <View style={styles.mapPinBadge}>
              <Icons.Bed color="#0F172A" size={16} />
              <Text style={styles.mapPinText}>{stay.name}</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* --- STAY BOOKING TIMINGS, DATES & GUEST CONFIGURATION MODAL --- */}
      {/* ========================================================================= */}
      <Modal visible={isBookingModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: isLight ? '#F8FAFC' : colors.cardBg, maxHeight: '94%' }]}>
            {/* Sheet Header */}
            <View style={styles.modalSheetHeader}>
              <View>
                <Text style={[styles.modalSheetSuperHeader, { color: '#D97706' }]}>
                  {bookingStep === 1
                    ? 'CONFIGURE TIMINGS & DATES'
                    : bookingStep === 2
                    ? 'PRIMARY GUEST DETAILS'
                    : bookingStep === 3
                    ? 'BOOKING SUMMARY & PAYMENT'
                    : 'BOOKING CONFIRMATION'}
                </Text>
                <Text style={[styles.modalSheetTitle, { color: colors.text }]}>
                  {bookingStep === 1
                    ? 'Select Dates, Times & Guests'
                    : bookingStep === 2
                    ? 'Guest Information'
                    : bookingStep === 3
                    ? 'Review & Pay'
                    : '✓ Booking Confirmed'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsBookingModalOpen(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.closeSheetBtn}
              >
                <Icons.X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              {/* STEP 1: CONFIGURE TIMINGS, DATES & GUESTS */}
              {bookingStep === 1 && (
                <View style={{ gap: 16 }}>
                  {/* --- 1. CHECK-IN DETAILS BOX --- */}
                  <View style={[styles.configCard, { borderColor: '#3B82F6' }]}>
                    <View style={styles.configCardHeader}>
                      <View style={styles.configCardHeaderLeft}>
                        <View style={[styles.statusDot, { backgroundColor: '#3B82F6' }]} />
                        <Text style={styles.configCardHeaderTitle}>CHECK-IN DETAILS</Text>
                      </View>
                      <View style={styles.configCardBadgeBlue}>
                        <Text style={styles.configCardBadgeBlueText}>
                          {selectedCheckInItem.fullDateStr} • {checkInTimeSlot}
                        </Text>
                      </View>
                    </View>

                    {/* Check-In Date Horizontal Scroller */}
                    <Text style={styles.subfieldLabel}>SELECT CHECK-IN DATE</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateChipsScroller}>
                      {datesList.map((item, idx) => {
                        const isSelected = checkInIndex === idx;
                        const isFull = item.status === 'FULL';

                        return (
                          <TouchableOpacity
                            key={`cin_date_${idx}`}
                            style={[
                              styles.dateCard,
                              isSelected && styles.dateCardSelectedBlue,
                              isFull && styles.dateCardDisabled,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => handleSelectCheckInDate(idx)}
                          >
                            <Text style={[styles.dateCardDay, isSelected && styles.dateCardTextWhite, isFull && styles.dateCardTextMuted]}>
                              {item.dayName}
                            </Text>
                            <Text style={[styles.dateCardNum, isSelected && styles.dateCardTextWhite, isFull && styles.dateCardTextMuted]}>
                              {item.dateNum}
                            </Text>
                            <Text style={[styles.dateCardMonth, isSelected && styles.dateCardTextWhite, isFull && styles.dateCardTextMuted]}>
                              {item.monthStr}
                            </Text>
                            <View style={[styles.dateStatusPill, isSelected ? styles.dateStatusPillSelectedBlue : isFull ? styles.dateStatusPillFull : styles.dateStatusPillAvail]}>
                              <Text style={[styles.dateStatusPillText, isSelected && { color: '#FFFFFF' }, isFull && { color: '#EF4444' }]}>
                                {isSelected ? 'SELECTED' : isFull ? 'FULL' : 'AVAILABLE'}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    {/* Check-In Time Slot */}
                    <Text style={styles.subfieldLabel}>SELECT CHECK-IN TIME SLOT</Text>
                    <View style={styles.timeSlotsWrap}>
                      {checkInTimeOptions.map((timeStr) => {
                        const isSelected = checkInTimeSlot === timeStr;
                        const isSlotNotAvail = timeStr === '01:00 PM' || timeStr === '05:00 PM';

                        return (
                          <TouchableOpacity
                            key={`cin_time_${timeStr}`}
                            style={[
                              styles.timeSlotPill,
                              isSelected && styles.timeSlotPillSelectedEmerald,
                              isSlotNotAvail && styles.timeSlotPillDisabled,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => {
                              if (isSlotNotAvail) {
                                Alert.alert('Slot Unavailable', 'This check-in time slot is full. Please pick another.');
                                return;
                              }
                              setCheckInTimeSlot(timeStr);
                              setManualCheckInTime(timeStr);
                            }}
                          >
                            <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextWhite, isSlotNotAvail && styles.timeSlotTextMuted]}>
                              {timeStr}
                            </Text>
                            <Text style={[styles.timeSlotStatusText, isSelected && { color: '#D1FAE5' }, isSlotNotAvail && { color: '#EF4444' }]}>
                              {isSelected ? 'SELECTED' : isSlotNotAvail ? 'NOT-AVAILABLE' : 'AVAILABLE'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Manual Check-in Time Entry */}
                    <View style={styles.manualEntryRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                        <Icons.Clock color="#3B82F6" size={16} />
                        <View>
                          <Text style={styles.manualEntryLabel}>Manual Check-In Time Entry</Text>
                          <Text style={styles.manualEntrySub}>Select or type custom check-in time</Text>
                        </View>
                      </View>
                      <TextInput
                        style={styles.manualEntryInput}
                        value={manualCheckInTime}
                        onChangeText={(txt) => {
                          setManualCheckInTime(txt);
                          setCheckInTimeSlot(txt);
                        }}
                        placeholder="--:--"
                        placeholderTextColor="#94A3B8"
                      />
                      <View style={styles.manualTimeBadgeBlue}>
                        <Text style={styles.manualTimeBadgeBlueText}>{manualCheckInTime || '02:00 PM'}</Text>
                      </View>
                    </View>
                  </View>

                  {/* --- 2. CHECK-OUT DETAILS BOX --- */}
                  <View style={[styles.configCard, { borderColor: '#10B981' }]}>
                    <View style={styles.configCardHeader}>
                      <View style={styles.configCardHeaderLeft}>
                        <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                        <Text style={styles.configCardHeaderTitle}>CHECK-OUT DETAILS</Text>
                      </View>
                      <View style={styles.configCardBadgeGreen}>
                        <Text style={styles.configCardBadgeGreenText}>
                          {selectedCheckOutItem.fullDateStr} • {checkOutTimeSlot}
                        </Text>
                      </View>
                    </View>

                    {/* Check-Out Date Horizontal Scroller */}
                    <Text style={styles.subfieldLabel}>SELECT CHECK-OUT DATE</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateChipsScroller}>
                      {datesList.map((item, idx) => {
                        const isSelected = checkOutIndex === idx;
                        const isInvalid = idx <= checkInIndex;
                        const isFull = item.status === 'FULL';

                        return (
                          <TouchableOpacity
                            key={`cout_date_${idx}`}
                            style={[
                              styles.dateCard,
                              isSelected && styles.dateCardSelectedGreen,
                              isInvalid && styles.dateCardDisabled,
                              isFull && styles.dateCardDisabled,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => handleSelectCheckOutDate(idx)}
                          >
                            <Text style={[styles.dateCardDay, isSelected && styles.dateCardTextWhite, (isInvalid || isFull) && styles.dateCardTextMuted]}>
                              {item.dayName}
                            </Text>
                            <Text style={[styles.dateCardNum, isSelected && styles.dateCardTextWhite, (isInvalid || isFull) && styles.dateCardTextMuted]}>
                              {item.dateNum}
                            </Text>
                            <Text style={[styles.dateCardMonth, isSelected && styles.dateCardTextWhite, (isInvalid || isFull) && styles.dateCardTextMuted]}>
                              {item.monthStr}
                            </Text>
                            <View style={[styles.dateStatusPill, isSelected ? styles.dateStatusPillSelectedGreen : (isInvalid || isFull) ? styles.dateStatusPillFull : styles.dateStatusPillAvail]}>
                              <Text style={[styles.dateStatusPillText, isSelected && { color: '#FFFFFF' }, (isInvalid || isFull) && { color: '#EF4444' }]}>
                                {isSelected ? 'SELECTED' : isInvalid ? 'INVALID' : isFull ? 'FULL' : 'AVAILABLE'}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    {/* Check-Out Time Slot */}
                    <Text style={styles.subfieldLabel}>SELECT CHECK-OUT TIME SLOT</Text>
                    <View style={styles.timeSlotsWrap}>
                      {checkOutTimeOptions.map((timeStr) => {
                        const isSelected = checkOutTimeSlot === timeStr;

                        return (
                          <TouchableOpacity
                            key={`cout_time_${timeStr}`}
                            style={[
                              styles.timeSlotPill,
                              isSelected && styles.timeSlotPillSelectedEmerald,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => {
                              setCheckOutTimeSlot(timeStr);
                              setManualCheckOutTime(timeStr);
                            }}
                          >
                            <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextWhite]}>
                              {timeStr}
                            </Text>
                            <Text style={[styles.timeSlotStatusText, isSelected && { color: '#D1FAE5' }]}>
                              {isSelected ? 'SELECTED' : 'AVAILABLE'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Manual Check-out Time Entry */}
                    <View style={styles.manualEntryRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                        <Icons.Clock color="#10B981" size={16} />
                        <View>
                          <Text style={styles.manualEntryLabel}>Manual Check-Out Time Entry</Text>
                          <Text style={styles.manualEntrySub}>Select or type custom check-out time</Text>
                        </View>
                      </View>
                      <TextInput
                        style={styles.manualEntryInput}
                        value={manualCheckOutTime}
                        onChangeText={(txt) => {
                          setManualCheckOutTime(txt);
                          setCheckOutTimeSlot(txt);
                        }}
                        placeholder="--:--"
                        placeholderTextColor="#94A3B8"
                      />
                      <View style={styles.manualTimeBadgeGreen}>
                        <Text style={styles.manualTimeBadgeGreenText}>{manualCheckOutTime || '11:00 AM'}</Text>
                      </View>
                    </View>
                  </View>

                  {/* --- 3. GUESTS & ROOMS STEPPERS --- */}
                  <View style={[styles.configCard, { borderColor: '#E2E8F0' }]}>
                    <Text style={[styles.configCardHeaderTitle, { marginBottom: 12 }]}>TRAVELERS, GUESTS & ROOMS</Text>

                    {/* Adults Stepper */}
                    <View style={styles.stepperRow}>
                      <View>
                        <Text style={styles.stepperLabel}>Adults</Text>
                        <Text style={styles.stepperSub}>Age 13+ years</Text>
                      </View>
                      <View style={styles.stepperControls}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => setAdultsCount((prev) => Math.max(1, prev - 1))}
                        >
                          <Icons.Minus color="#0F172A" size={16} />
                        </TouchableOpacity>
                        <Text style={styles.stepperValText}>{adultsCount}</Text>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => setAdultsCount((prev) => Math.min(10, prev + 1))}
                        >
                          <Icons.Plus color="#0F172A" size={16} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Children Stepper */}
                    <View style={styles.stepperRow}>
                      <View>
                        <Text style={styles.stepperLabel}>Children</Text>
                        <Text style={styles.stepperSub}>Age 0-12 years</Text>
                      </View>
                      <View style={styles.stepperControls}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => setChildrenCount((prev) => Math.max(0, prev - 1))}
                        >
                          <Icons.Minus color="#0F172A" size={16} />
                        </TouchableOpacity>
                        <Text style={styles.stepperValText}>{childrenCount}</Text>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => setChildrenCount((prev) => Math.min(6, prev + 1))}
                        >
                          <Icons.Plus color="#0F172A" size={16} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Rooms Stepper */}
                    <View style={[styles.stepperRow, { borderBottomWidth: 0 }]}>
                      <View>
                        <Text style={styles.stepperLabel}>Rooms</Text>
                        <Text style={styles.stepperSub}>Number of rooms</Text>
                      </View>
                      <View style={styles.stepperControls}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => setRoomsCount((prev) => Math.max(1, prev - 1))}
                        >
                          <Icons.Minus color="#0F172A" size={16} />
                        </TouchableOpacity>
                        <Text style={styles.stepperValText}>{roomsCount}</Text>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => setRoomsCount((prev) => Math.min(5, prev + 1))}
                        >
                          <Icons.Plus color="#0F172A" size={16} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* --- 4. LIVE BOOKING SUMMARY CARD --- */}
                  <View style={[styles.summaryCard, { backgroundColor: '#FFFFFF', borderColor: '#F5B800' }]}>
                    <Text style={styles.summaryCardTitle}>YOUR APPOINTMENT / STAY SUMMARY</Text>

                    <View style={styles.summaryPropertyRow}>
                      <Image source={{ uri: stay.image }} style={styles.summaryPropThumb} />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={[styles.summaryHotelName, { color: colors.text }]} numberOfLines={1}>
                            {stay.name}
                          </Text>
                          <Icons.CheckCircle2 color="#3B82F6" size={14} />
                        </View>
                        <Text style={styles.summaryRoomType}>{selectedRoom.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                          <Icons.Star color="#F5B800" size={11} fill="#F5B800" />
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#0F172A' }}>
                            {stay.rating} ({stay.reviews} Reviews)
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.summaryDivider} />

                    <View style={styles.summaryDetailsList}>
                      <View style={styles.summaryItemRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Icons.Calendar color="#3B82F6" size={15} />
                          <Text style={styles.summaryItemLabel}>Check-In</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.summaryItemValBold}>{selectedCheckInItem.fullDateStr}</Text>
                          <Text style={styles.summaryItemValSub}>{checkInTimeSlot}</Text>
                        </View>
                      </View>

                      <View style={styles.summaryItemRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Icons.Calendar color="#10B981" size={15} />
                          <Text style={styles.summaryItemLabel}>Check-Out</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.summaryItemValBold}>{selectedCheckOutItem.fullDateStr}</Text>
                          <Text style={styles.summaryItemValSub}>{checkOutTimeSlot}</Text>
                        </View>
                      </View>

                      <View style={styles.summaryItemRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Icons.Home color="#D97706" size={15} />
                          <Text style={styles.summaryItemLabel}>Duration</Text>
                        </View>
                        <Text style={styles.summaryItemValBold}>{computedNights} Night{computedNights > 1 ? 's' : ''}</Text>
                      </View>

                      <View style={styles.summaryItemRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Icons.Users color="#64748B" size={15} />
                          <Text style={styles.summaryItemLabel}>Travelers / Guests</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.summaryItemValBold}>
                            {adultsCount + childrenCount} Person ({adultsCount} Adults, {childrenCount} Children)
                          </Text>
                          <Text style={styles.summaryItemValSub}>{roomsCount} Room{roomsCount > 1 ? 's' : ''}</Text>
                        </View>
                      </View>

                      <View style={styles.summaryItemRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Icons.Tag color="#64748B" size={15} />
                          <Text style={styles.summaryItemLabel}>Rate per Night</Text>
                        </View>
                        <Text style={styles.summaryItemValBold}>₹{selectedRoom.priceNum.toLocaleString()}</Text>
                      </View>

                      <View style={styles.summaryItemRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Icons.Percent color="#64748B" size={15} />
                          <Text style={styles.summaryItemLabel}>Taxes & Fees (10%)</Text>
                        </View>
                        <Text style={styles.summaryItemValBold}>₹{taxesAndFees.toLocaleString()}</Text>
                      </View>

                      <View style={[styles.summaryItemRow, styles.summaryTotalRow]}>
                        <Text style={styles.summaryTotalLabel}>Total Stay Fee</Text>
                        <Text style={styles.summaryTotalValue}>₹{grandTotal.toLocaleString()}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.modalCtaBtn}
                      activeOpacity={0.85}
                      onPress={() => setBookingStep(2)}
                    >
                      <Text style={styles.modalCtaBtnText}>
                        Continue to Guest Details (₹{grandTotal.toLocaleString()})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* STEP 2: GUEST DETAILS */}
              {bookingStep === 2 && (
                <View style={{ gap: 14 }}>
                  <View style={[styles.summaryCard, { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
                    <Text style={styles.summaryHotelName}>{stay.name}</Text>
                    <Text style={styles.summaryRoomType}>{selectedRoom.name} • {roomsCount} Room(s)</Text>
                    <Text style={styles.summaryDates}>
                      {selectedCheckInItem.fullDateStr} ({checkInTimeSlot}) → {selectedCheckOutItem.fullDateStr} ({checkOutTimeSlot})
                    </Text>
                    <Text style={styles.summaryGuests}>
                      {adultsCount} Adults, {childrenCount} Children • {computedNights} Night(s)
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.inputFieldLabel}>PRIMARY GUEST FULL NAME *</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          color: colors.text,
                          backgroundColor: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.06)',
                          borderColor: isLight ? '#E2E8F0' : colors.cardBorder,
                        },
                      ]}
                      value={guestName}
                      onChangeText={setGuestName}
                      placeholder="e.g. Rahul Sharma"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  <View>
                    <Text style={styles.inputFieldLabel}>MOBILE NUMBER *</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          color: colors.text,
                          backgroundColor: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.06)',
                          borderColor: isLight ? '#E2E8F0' : colors.cardBorder,
                        },
                      ]}
                      value={guestMobile}
                      onChangeText={setGuestMobile}
                      keyboardType="phone-pad"
                      placeholder="+91 98765 43210"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  <View>
                    <Text style={styles.inputFieldLabel}>EMAIL ADDRESS *</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          color: colors.text,
                          backgroundColor: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.06)',
                          borderColor: isLight ? '#E2E8F0' : colors.cardBorder,
                        },
                      ]}
                      value={guestEmail}
                      onChangeText={setGuestEmail}
                      keyboardType="email-address"
                      placeholder="name@example.com"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  <View>
                    <Text style={styles.inputFieldLabel}>SPECIAL REQUESTS (OPTIONAL)</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          color: colors.text,
                          backgroundColor: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.06)',
                          borderColor: isLight ? '#E2E8F0' : colors.cardBorder,
                          height: 60,
                        },
                      ]}
                      value={guestSpecialNote}
                      onChangeText={setGuestSpecialNote}
                      placeholder="Early check-in, high floor, quiet room..."
                      placeholderTextColor="#94A3B8"
                      multiline
                    />
                  </View>

                  <View style={styles.policyNoticeBox}>
                    <Icons.Info color="#D97706" size={15} />
                    <Text style={styles.policyNoticeText}>
                      Confirmation voucher and check-in PIN will be sent to {guestEmail || 'your email'}.
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                    <TouchableOpacity
                      style={[styles.modalCtaBtn, { flex: 1, backgroundColor: '#E2E8F0' }]}
                      activeOpacity={0.85}
                      onPress={() => setBookingStep(1)}
                    >
                      <Text style={[styles.modalCtaBtnText, { color: '#0F172A' }]}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalCtaBtn, { flex: 2 }]}
                      activeOpacity={0.85}
                      onPress={() => {
                        if (!guestName.trim() || !guestMobile.trim() || !guestEmail.trim()) {
                          Alert.alert('Required Fields', 'Please fill in primary guest name, mobile, and email.');
                          return;
                        }
                        setBookingStep(3);
                      }}
                    >
                      <Text style={styles.modalCtaBtnText}>Continue to Payment</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* STEP 3: BOOKING SUMMARY & PAYMENT */}
              {bookingStep === 3 && (
                <View style={{ gap: 14 }}>
                  <Text style={[styles.sectionSubheading, { color: colors.text }]}>Select Payment Method</Text>

                  {(['UPI', 'Card', 'Net Banking', 'Pay at Hotel'] as const).map((payOpt) => {
                    const isSelected = paymentMethod === payOpt;
                    return (
                      <TouchableOpacity
                        key={payOpt}
                        style={[
                          styles.paymentOptionCard,
                          {
                            backgroundColor: isSelected ? '#FFFBEB' : isLight ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                            borderColor: isSelected ? '#F5B800' : isLight ? '#E2E8F0' : colors.cardBorder,
                          },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setPaymentMethod(payOpt)}
                      >
                        <Text
                          style={[
                            styles.paymentOptionText,
                            {
                              color: isSelected ? '#0F172A' : colors.text,
                              fontWeight: isSelected ? '800' : '600',
                            },
                          ]}
                        >
                          {payOpt}
                        </Text>
                        {isSelected && <Icons.Check color="#F5B800" size={18} />}
                      </TouchableOpacity>
                    );
                  })}

                  {/* Summary Box */}
                  <View style={[styles.priceBreakdownCard, { backgroundColor: '#FFFFFF', borderColor: '#F1EAD8' }]}>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>
                        ₹{selectedRoom.priceNum.toLocaleString()} × {computedNights} nights × {roomsCount} room(s)
                      </Text>
                      <Text style={[styles.priceValue, { color: colors.text }]}>₹{baseRoomCharge.toLocaleString()}</Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Taxes & fees (10%)</Text>
                      <Text style={[styles.priceValue, { color: colors.text }]}>₹{taxesAndFees.toLocaleString()}</Text>
                    </View>
                    <View style={[styles.priceRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Grand Total Payable</Text>
                      <Text style={styles.totalValue}>₹{grandTotal.toLocaleString()}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                    <TouchableOpacity
                      style={[styles.modalCtaBtn, { flex: 1, backgroundColor: '#E2E8F0' }]}
                      activeOpacity={0.85}
                      onPress={() => setBookingStep(2)}
                    >
                      <Text style={[styles.modalCtaBtnText, { color: '#0F172A' }]}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalCtaBtn, { flex: 2 }]}
                      activeOpacity={0.85}
                      onPress={() => {
                        const newId = `CN-STAY-${Math.floor(10000 + Math.random() * 90000)}`;
                        setConfirmedBookingId(newId);
                        setBookingStep(4);
                      }}
                    >
                      <Text style={styles.modalCtaBtnText}>Confirm Booking (₹{grandTotal.toLocaleString()})</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* STEP 4: BOOKING CONFIRMED */}
              {bookingStep === 4 && (
                <View style={styles.confirmedContainer}>
                  <View style={styles.confirmedCircle}>
                    <Icons.Check color="#FFFFFF" size={34} />
                  </View>

                  <Text style={styles.confirmedTitle}>✓ Booking Confirmed!</Text>
                  <Text style={styles.confirmedIdText}>Booking ID: {confirmedBookingId || 'CN-STAY-82910'}</Text>

                  <View style={[styles.summaryCard, { width: '100%', backgroundColor: '#FFFFFF', borderColor: '#10B981' }]}>
                    <Text style={[styles.summaryHotelName, { color: colors.text }]}>{stay.name}</Text>
                    <Text style={styles.summaryRoomType}>{selectedRoom.name} • {roomsCount} Room(s)</Text>
                    <Text style={styles.summaryDates}>
                      Check-In: {selectedCheckInItem.fullDateStr} ({checkInTimeSlot})
                    </Text>
                    <Text style={styles.summaryDates}>
                      Check-Out: {selectedCheckOutItem.fullDateStr} ({checkOutTimeSlot})
                    </Text>
                    <Text style={styles.summaryGuests}>
                      Guest: {guestName} ({guestMobile}) • {adultsCount} Adults, {childrenCount} Children
                    </Text>
                    <Text style={[styles.totalValue, { marginTop: 8 }]}>
                      Total Paid: ₹{grandTotal.toLocaleString()} ({paymentMethod})
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.modalCtaBtn}
                    activeOpacity={0.85}
                    onPress={() => {
                      setIsBookingModalOpen(false);
                      navigation.goBack();
                    }}
                  >
                    <Text style={styles.modalCtaBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollContent: {
    paddingTop: 12,
  },
  galleryContainer: {
    paddingHorizontal: 16,
  },
  mainGalleryImg: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  thumbnailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 10,
  },
  thumbnailWrapper: {
    flex: 1,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailWrapperSelected: {
    borderColor: '#F5B800',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  propInfoSection: {
    marginBottom: 12,
  },
  titleRow: {
    marginBottom: 6,
  },
  propTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  ratingAndLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    borderColor: '#F5B800',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  reviewsCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bulletSeparator: {
    color: '#94A3B8',
    fontSize: 12,
  },
  locationText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  viewOnMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  viewOnMapBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#D97706',
  },
  priceCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  priceLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceLargeText: {
    fontSize: 20,
    fontWeight: '900',
  },
  priceOriginalText: {
    fontSize: 14,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  discountTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  taxesNoticeText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  sectionBlock: {
    marginBottom: 18,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  amenityIconContainer: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityLabel: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  aboutText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },
  roomCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
  },
  roomHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roomNameText: {
    fontSize: 15,
    fontWeight: '900',
  },
  roomGuestsSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  roomPricePill: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roomPricePillText: {
    fontSize: 13,
    fontWeight: '900',
  },
  roomInclusionsList: {
    gap: 4,
    marginVertical: 8,
  },
  inclusionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inclusionText: {
    fontSize: 11.5,
    color: '#059669',
    fontWeight: '700',
  },
  selectRoomBtn: {
    backgroundColor: '#F5B800',
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  selectRoomBtnActive: {
    backgroundColor: '#F59E0B',
  },
  selectRoomBtnText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  policyContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  policyRowText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  stickyPriceColumn: {
    flex: 1,
  },
  stickyPriceText: {
    fontSize: 18,
    fontWeight: '900',
  },
  stickyRoomSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  stickySelectRoomBtn: {
    backgroundColor: '#F5B800',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  stickySelectRoomBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  modalSheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalSheetSuperHeader: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  modalSheetTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  closeSheetBtn: {
    padding: 4,
  },
  configCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
  },
  configCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  configCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  configCardHeaderTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#0F172A',
  },
  configCardBadgeBlue: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  configCardBadgeBlueText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
  },
  configCardBadgeGreen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  configCardBadgeGreenText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  subfieldLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  dateChipsScroller: {
    gap: 8,
    paddingBottom: 10,
  },
  dateCard: {
    width: 68,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  dateCardSelectedBlue: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  dateCardSelectedGreen: {
    backgroundColor: '#059669',
    borderColor: '#047857',
  },
  dateCardDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.55,
  },
  dateCardDay: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  dateCardNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 1,
  },
  dateCardMonth: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  dateCardTextWhite: {
    color: '#FFFFFF',
  },
  dateCardTextMuted: {
    color: '#94A3B8',
  },
  dateStatusPill: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  dateStatusPillSelectedBlue: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dateStatusPillSelectedGreen: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dateStatusPillAvail: {
    backgroundColor: '#ECFDF5',
  },
  dateStatusPillFull: {
    backgroundColor: '#FEF2F2',
  },
  dateStatusPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#059669',
  },
  timeSlotsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  timeSlotPill: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 86,
  },
  timeSlotPillSelectedEmerald: {
    backgroundColor: '#059669',
    borderColor: '#047857',
  },
  timeSlotPillDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.6,
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
  },
  timeSlotTextWhite: {
    color: '#FFFFFF',
  },
  timeSlotTextMuted: {
    color: '#94A3B8',
  },
  timeSlotStatusText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#059669',
    marginTop: 1,
  },
  manualEntryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 4,
  },
  manualEntryLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  manualEntrySub: {
    fontSize: 9.5,
    color: '#64748B',
  },
  manualEntryInput: {
    width: 64,
    height: 32,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  manualTimeBadgeBlue: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  manualTimeBadgeBlueText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  manualTimeBadgeGreen: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  manualTimeBadgeGreenText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#065F46',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stepperLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepperSub: {
    fontSize: 10.5,
    color: '#64748B',
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    minWidth: 20,
    textAlign: 'center',
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
  },
  summaryCardTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#64748B',
    marginBottom: 10,
  },
  summaryPropertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryPropThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  summaryHotelName: {
    fontSize: 14,
    fontWeight: '900',
  },
  summaryRoomType: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  summaryDates: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  summaryGuests: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  summaryDetailsList: {
    gap: 8,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryItemLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  summaryItemValBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryItemValSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  summaryTotalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalCtaBtn: {
    backgroundColor: '#F5B800',
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  modalCtaBtnText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  inputFieldLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  textInput: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  policyNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
  },
  policyNoticeText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
  },
  sectionSubheading: {
    fontSize: 14,
    fontWeight: '800',
  },
  paymentOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  paymentOptionText: {
    fontSize: 13.5,
  },
  priceBreakdownCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  priceValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  confirmedContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  confirmedCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmedTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#10B981',
  },
  confirmedIdText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  mapPinBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5B800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 8,
  },
  mapPinText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
  },
});
