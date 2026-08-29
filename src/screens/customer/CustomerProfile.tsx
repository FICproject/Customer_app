import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  Platform,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import * as Icons from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useActivityStore } from '../../store/activityStore';
import { useThemeStore } from '../../store/themeStore';

export default function CustomerProfile() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors, themeMode } = useThemeStore();
  const isLight = colors.background === '#FFFDF5' || colors.background === '#FFFFFF' || colors.background === '#F8FAFC' || colors.background === '#FFF8E8' || themeMode === 'light';

  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const recentViews = useActivityStore((state) => state.recentViews);

  // Loading, error and photo action sheet states
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const loadProfileData = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await fetchProfile();
      if (!res && !currentUser) {
        setProfileError('Unable to load your profile details.');
      }
    } catch (e: any) {
      if (!currentUser) {
        setProfileError(e.message || 'Unable to load your profile details.');
      }
    } finally {
      setProfileLoading(false);
    }
  }, [fetchProfile, currentUser]);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  // Permissions helpers
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'Connect Mobile needs camera access to capture your profile photo.',
          buttonNeutral: 'Ask Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Photo Library Permission',
            message: 'Connect Mobile needs access to your gallery to choose a profile photo.',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Photo Library Permission',
            message: 'Connect Mobile needs storage access to choose a profile photo.',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  };

  // Camera Handler
  const handleTakePhoto = async () => {
    setIsPhotoModalOpen(false);
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera permission in app settings to take a profile photo.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 600,
        maxHeight: 600,
        cameraType: 'front',
        saveToPhotos: false,
      },
      async (response: ImagePickerResponse) => {
        if (response.didCancel || !response.assets || response.assets.length === 0) return;
        const newUri = response.assets[0].uri;
        if (newUri) {
          setIsUploadingPhoto(true);
          try {
            await updateProfile({ avatar: newUri });
          } catch (err) {
            console.warn('Failed to update avatar photo:', err);
          } finally {
            setIsUploadingPhoto(false);
          }
        }
      }
    );
  };

  // Gallery Handler
  const handleChooseFromGallery = async () => {
    setIsPhotoModalOpen(false);
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert(
        'Gallery Permission Required',
        'Please allow photo access in app settings to select a profile photo.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 600,
        maxHeight: 600,
        selectionLimit: 1,
      },
      async (response: ImagePickerResponse) => {
        if (response.didCancel || !response.assets || response.assets.length === 0) return;
        const newUri = response.assets[0].uri;
        if (newUri) {
          setIsUploadingPhoto(true);
          try {
            await updateProfile({ avatar: newUri });
          } catch (err) {
            console.warn('Failed to update avatar photo from gallery:', err);
          } finally {
            setIsUploadingPhoto(false);
          }
        }
      }
    );
  };

  // Remove Photo Handler
  const handleRemovePhoto = async () => {
    setIsPhotoModalOpen(false);
    setIsUploadingPhoto(true);
    try {
      await updateProfile({ avatar: '' });
    } catch (err) {
      console.warn('Failed to remove avatar photo:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your Connect account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top App Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            height: 56 + insets.top,
            backgroundColor: isLight ? '#FFF1C7' : colors.background,
            borderBottomColor: isLight ? 'rgba(242, 183, 5, 0.25)' : colors.cardBorder,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
      </View>

      {profileLoading && !currentUser ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#F5B800" size="large" />
          <Text style={[styles.loadingText, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)' }]}>
            Loading profile...
          </Text>
        </View>
      ) : profileError && !currentUser ? (
        <View style={styles.centerContainer}>
          <Icons.AlertTriangle color="#EF4444" size={48} style={{ marginBottom: 12 }} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Unable to load profile</Text>
          <Text style={styles.errorSubtitle}>{profileError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadProfileData}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Production Redesigned Top Profile Card */}
          <TouchableOpacity
            style={[
              styles.profileCard,
              {
                backgroundColor: isLight ? '#FFFFFF' : 'rgba(13, 22, 54, 0.65)',
                borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
              },
            ]}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('EditProfile')}
          >
            {/* Left: Avatar with Camera Action Button */}
            <View style={styles.avatarWrapper}>
              {currentUser?.avatar ? (
                <Image source={{ uri: currentUser.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarCircleFallback}>
                  <Text style={styles.avatarInitial}>
                    {currentUser?.name ? currentUser.name.trim().charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              )}

              {isUploadingPhoto ? (
                <View style={styles.avatarLoadingOverlay}>
                  <ActivityIndicator size="small" color="#0F172A" />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.cameraActionButton}
                  activeOpacity={0.8}
                  onPress={() => setIsPhotoModalOpen(true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icons.Camera color="#0F172A" size={13} />
                </TouchableOpacity>
              )}
            </View>

            {/* Center: Profile Name, Tier, Email & Phone */}
            <View style={styles.profileDetailsCol}>
              <View style={styles.nameAndBadgeRow}>
                <Text style={[styles.profileNameText, { color: colors.text }]} numberOfLines={1}>
                  {currentUser?.name || 'Connect Member'}
                </Text>
                {currentUser?.membership ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('CustomerTabs', { screen: 'Membership' })}
                    style={styles.goldMembershipBadge}
                  >
                    <Icons.Crown color="#D97706" size={10} />
                    <Text style={styles.goldMembershipText}>
                      {(currentUser.membership || 'gold').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <Text style={[styles.profileEmailText, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)' }]} numberOfLines={1}>
                {currentUser?.email || 'uma@connectapp.com'}
              </Text>

              {currentUser?.phone ? (
                <Text style={[styles.profilePhoneText, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)' }]}>
                  {currentUser.phone}
                </Text>
              ) : (
                <Text style={[styles.profilePhoneText, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.6)' }]}>
                  +91 98765 43210
                </Text>
              )}
            </View>

            {/* Right: Edit Button */}
            <TouchableOpacity
              style={[
                styles.editButtonPill,
                {
                  backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.06)',
                  borderColor: isLight ? '#E2E8F0' : colors.cardBorder,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Icons.Pencil color={isLight ? '#0F172A' : '#FFFFFF'} size={13} />
              <Text style={[styles.editButtonText, { color: colors.text }]}>Edit</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* 1. ACCOUNT SECTION */}
          <Text style={[styles.sectionTitle, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)' }]}>
            ACCOUNT
          </Text>
          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isLight ? '#FFFFFF' : 'rgba(13, 22, 54, 0.65)',
                borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
              },
            ]}
          >
            {/* My Orders */}
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CustomerTabs', { screen: 'Orders' })}
            >
              <View style={[styles.iconCircle, { backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.06)' }]}>
                <Icons.ShoppingBag color={isLight ? '#0F172A' : '#FFFFFF'} size={16} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>My Orders</Text>
              <Icons.ChevronRight color="#94A3B8" size={16} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.06)' }]} />

            {/* Wishlist with live count */}
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Wishlist')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FDF2F8' }]}>
                <Icons.Heart color="#DB2777" size={16} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>Wishlist</Text>
              <View style={styles.menuBadgeRow}>
                {wishlistItems.length > 0 && (
                  <View style={styles.countPill}>
                    <Text style={styles.countPillText}>
                      {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
                    </Text>
                  </View>
                )}
                <Icons.ChevronRight color="#94A3B8" size={16} />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.06)' }]} />

            {/* Personal Information */}
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View style={[styles.iconCircle, { backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.06)' }]}>
                <Icons.User color={isLight ? '#0F172A' : '#FFFFFF'} size={16} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>Personal Information</Text>
              <Icons.ChevronRight color="#94A3B8" size={16} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.06)' }]} />

            {/* Saved Addresses */}
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('MyAddresses')}
            >
              <View style={[styles.iconCircle, { backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.06)' }]}>
                <Icons.MapPin color={isLight ? '#0F172A' : '#FFFFFF'} size={16} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>Saved Addresses</Text>
              <Icons.ChevronRight color="#94A3B8" size={16} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.06)' }]} />

            {/* Payment Methods */}
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('PaymentSettings')}
            >
              <View style={[styles.iconCircle, { backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.06)' }]}>
                <Icons.CreditCard color={isLight ? '#0F172A' : '#FFFFFF'} size={16} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>Payment Methods</Text>
              <Icons.ChevronRight color="#94A3B8" size={16} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.06)' }]} />

            {/* My Bookings */}
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CustomerTabs', { screen: 'Orders' })}
            >
              <View style={[styles.iconCircle, { backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.06)' }]}>
                <Icons.Calendar color={isLight ? '#0F172A' : '#FFFFFF'} size={16} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>My Bookings</Text>
              <Icons.ChevronRight color="#94A3B8" size={16} />
            </TouchableOpacity>
          </View>

          {/* 2. MY ACTIVITY SECTION */}
          <Text style={[styles.sectionTitle, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)' }]}>
            MY ACTIVITY
          </Text>
          <View
            style={[
              styles.activityCard,
              {
                backgroundColor: isLight ? '#FFFFFF' : 'rgba(13, 22, 54, 0.65)',
                borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
              },
            ]}
          >
            <View style={styles.activityHeader}>
              <View style={styles.activityHeaderTitleRow}>
                <View style={[styles.activityIconCircle, { backgroundColor: isLight ? '#FEF9E7' : 'rgba(245, 184, 0, 0.12)' }]}>
                  <Icons.Eye color="#F5B800" size={15} />
                </View>
                <Text style={[styles.activityCardTitle, { color: colors.text }]}>Recently Viewed</Text>
              </View>
              {recentViews && recentViews.length > 0 ? (
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('RecentlyViewed')}
                >
                  <Text style={[styles.viewAllText, { color: '#F5B800' }]}>View All</Text>
                  <Icons.ChevronRight color="#F5B800" size={14} />
                </TouchableOpacity>
              ) : null}
            </View>

            {recentViews && recentViews.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentViewsScroll}
              >
                {recentViews.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.recentViewCard,
                      {
                        backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: isLight ? '#E2E8F0' : colors.cardBorder,
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate('ProductDetails', {
                        item: {
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          category: item.category || 'Products',
                          img: item.image,
                          image: item.image,
                          vendor: item.vendor,
                        },
                        category: item.category || 'Products',
                      })
                    }
                  >
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.recentViewImg} />
                    ) : (
                      <View style={[styles.recentViewImg, styles.recentViewPlaceholder]}>
                        <Icons.ShoppingBag color="#94A3B8" size={20} />
                      </View>
                    )}
                    <Text style={[styles.recentViewName, { color: colors.text }]} numberOfLines={2}>
                      {item.name}
                    </Text>
                    {item.price ? (
                      <Text style={styles.recentViewPrice}>{item.price}</Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyActivityContainer}>
                <View style={[styles.emptyActivityIconCircle, { backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.05)' }]}>
                  <Icons.Clock color="#94A3B8" size={20} />
                </View>
                <Text style={[styles.emptyActivityTitle, { color: colors.text }]}>No recently viewed items</Text>
                <Text style={[styles.emptyActivitySubtitle, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)' }]}>
                  Products you explore will appear here.
                </Text>
              </View>
            )}
          </View>

          {/* 3. SUPPORT & SETTINGS SECTION */}
          <Text style={[styles.sectionTitle, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)' }]}>
            SUPPORT & SETTINGS
          </Text>
          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isLight ? '#FFFFFF' : 'rgba(13, 22, 54, 0.65)',
                borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
              },
            ]}
          >
            {/* Help & Support */}
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() =>
                Alert.alert(
                  'Help & Support',
                  'Connect Support Concierge is available 24/7.\n\nEmail: support@connectapp.com\nToll-Free: 1800-266-6328'
                )
              }
            >
              <View style={[styles.iconCircle, { backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.06)' }]}>
                <Icons.HelpCircle color={isLight ? '#0F172A' : '#FFFFFF'} size={16} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>Help & Support</Text>
              <Icons.ChevronRight color="#94A3B8" size={16} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.06)' }]} />

            {/* Notifications */}
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() =>
                Alert.alert(
                  'Notification Preferences',
                  'Push & SMS notification alerts are active for order updates and deliveries.'
                )
              }
            >
              <View style={[styles.iconCircle, { backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.06)' }]}>
                <Icons.Bell color={isLight ? '#0F172A' : '#FFFFFF'} size={16} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>Notifications</Text>
              <Icons.ChevronRight color="#94A3B8" size={16} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.06)' }]} />

            {/* Privacy & Security */}
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() =>
                Alert.alert(
                  'Privacy & Security',
                  'Your account is secured with end-to-end encryption and two-factor authentication.'
                )
              }
            >
              <View style={[styles.iconCircle, { backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.06)' }]}>
                <Icons.ShieldCheck color={isLight ? '#0F172A' : '#FFFFFF'} size={16} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>Privacy & Security</Text>
              <Icons.ChevronRight color="#94A3B8" size={16} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: isLight ? '#F1EAD8' : 'rgba(255, 255, 255, 0.06)' }]} />

            {/* Settings */}
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
              onPress={() => Alert.alert('Settings', 'Connect App v2.4.0\nRegion: India (English)')}
            >
              <View style={[styles.iconCircle, { backgroundColor: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.06)' }]}>
                <Icons.Settings color={isLight ? '#0F172A' : '#FFFFFF'} size={16} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>Settings</Text>
              <Icons.ChevronRight color="#94A3B8" size={16} />
            </TouchableOpacity>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity style={styles.signOutButton} activeOpacity={0.8} onPress={handleSignOut}>
            <Icons.LogOut color="#EF4444" size={16} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          {/* Version Info */}
          <Text style={[styles.versionText, { color: isLight ? '#94A3B8' : 'rgba(255, 255, 255, 0.35)' }]}>
            Connect App v2.4.0 • Made with ❤️
          </Text>
        </ScrollView>
      )}

      {/* Photo Picker Action Sheet Modal */}
      <Modal
        visible={isPhotoModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPhotoModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsPhotoModalOpen(false)}
        >
          <View
            style={[
              styles.actionSheetCard,
              {
                backgroundColor: isLight ? '#FFFFFF' : '#0B1530',
                borderColor: isLight ? '#FDE68A' : colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.actionSheetTitle, { color: colors.text }]}>Profile Photo</Text>
            <Text style={[styles.actionSheetSub, { color: isLight ? '#64748B' : 'rgba(255, 255, 255, 0.5)' }]}>
              Update your account avatar
            </Text>

            <TouchableOpacity style={styles.actionSheetOption} onPress={handleTakePhoto}>
              <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(245, 184, 0, 0.12)' }]}>
                <Icons.Camera color="#F5B800" size={18} />
              </View>
              <Text style={[styles.actionOptionText, { color: colors.text }]}>Take Photo with Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionSheetOption} onPress={handleChooseFromGallery}>
              <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                <Icons.Image color="#3B82F6" size={18} />
              </View>
              <Text style={[styles.actionOptionText, { color: colors.text }]}>Choose from Gallery</Text>
            </TouchableOpacity>

            {currentUser?.avatar ? (
              <TouchableOpacity style={styles.actionSheetOption} onPress={handleRemovePhoto}>
                <View style={[styles.actionIconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                  <Icons.Trash2 color="#EF4444" size={18} />
                </View>
                <Text style={[styles.actionOptionText, { color: '#EF4444' }]}>Remove Current Photo</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.actionCancelBtn, { borderColor: isLight ? '#E2E8F0' : colors.cardBorder }]}
              onPress={() => setIsPhotoModalOpen(false)}
            >
              <Text style={[styles.actionCancelText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: '#F5B800',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },

  // Redesigned Top Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  avatarCircleFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cameraActionButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F5B800',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileDetailsCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameAndBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
    marginBottom: 3,
  },
  profileNameText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
    maxWidth: 140,
  },
  goldMembershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  goldMembershipText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#854D0E',
    letterSpacing: 0.5,
  },
  profileEmailText: {
    fontSize: 12.5,
    fontWeight: '500',
    marginBottom: 2,
  },
  profilePhoneText: {
    fontSize: 12,
    fontWeight: '500',
  },
  editButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 6,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 4,
  },
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1.5,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
  },
  menuBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countPill: {
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#DB2777',
  },
  divider: {
    height: 1,
    marginLeft: 58,
  },
  activityCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1.5,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  recentViewsScroll: {
    gap: 10,
  },
  recentViewCard: {
    width: 105,
    borderRadius: 10,
    borderWidth: 1,
    padding: 6,
  },
  recentViewImg: {
    width: '100%',
    height: 80,
    borderRadius: 6,
    marginBottom: 6,
    backgroundColor: '#E2E8F0',
  },
  recentViewPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentViewName: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    marginBottom: 2,
  },
  recentViewPrice: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F5B800',
  },
  emptyActivityContainer: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  emptyActivityIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyActivityTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  emptyActivitySubtitle: {
    fontSize: 11.5,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 6,
    marginBottom: 16,
  },
  signOutText: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
  },

  // Modal Action Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 30, 0.65)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  actionSheetCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  actionSheetTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  actionSheetSub: {
    fontSize: 12,
    marginBottom: 16,
  },
  actionSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionCancelBtn: {
    marginTop: 12,
    borderTopWidth: 1,
    paddingTop: 14,
    alignItems: 'center',
  },
  actionCancelText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
