import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { useAuthStore } from '../../store/authStore';
import { apiFetch } from '../../services/api';

const { width } = Dimensions.get('window');

// Date Formatter: YYYY-MM-DD -> 15 Aug 1995
export function formatDobDisplay(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) return '';
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIdx = parseInt(month, 10) - 1;
    const monthLabel = monthNames[monthIdx] || month;
    return `${parseInt(day, 10)} ${monthLabel} ${year}`;
  }
  return trimmed;
}

const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'Connect Mobile needs access to your camera to capture a profile photo.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Camera permission error:', err);
    return false;
  }
};

const requestGalleryPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {
    const permission =
      (Platform.Version as number) >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    const granted = await PermissionsAndroid.request(permission, {
      title: 'Photo Gallery Access',
      message: 'Connect Mobile needs permission to choose a photo from your gallery.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    });
    return granted === PermissionsAndroid.RESULTS.GRANTED || granted === 'never_ask_again';
  } catch (err) {
    console.warn('Gallery permission error:', err);
    return true;
  }
};

export default function EditProfile() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const currentUser = useAuthStore((state) => state.currentUser);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  // Initial Load & Error States
  const [screenLoading, setScreenLoading] = useState(true);
  const [screenError, setScreenError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Other');
  const [avatar, setAvatar] = useState('');

  // Verification states directly from backend
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Original snapshot from backend
  const [initialSnapshot, setInitialSnapshot] = useState<any>(null);

  // UI Action States
  const [saveLoading, setSaveLoading] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  // OTP Verification States
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpTarget, setOtpTarget] = useState<'email' | 'phone' | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [pendingContactVal, setPendingContactVal] = useState('');
  const [bannerError, setBannerError] = useState<string | null>(null);

  // Load actual authenticated profile from backend
  const loadCustomerProfile = useCallback(async () => {
    setScreenLoading(true);
    setScreenError(null);
    try {
      const profile = await fetchProfile();
      if (profile) {
        setName(profile.name || '');
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
        setDob(profile.dob || '');
        setGender((profile.gender as any) || 'Other');
        setAvatar(profile.avatar || '');
        setEmailVerified(Boolean(profile.emailVerified));
        setPhoneVerified(Boolean(profile.phoneVerified));
        setInitialSnapshot(profile);
      } else {
        setScreenError('Unable to load your profile details.');
      }
    } catch (err: any) {
      setScreenError(err?.message || 'Unable to load your profile details.');
    } finally {
      setScreenLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    loadCustomerProfile();
  }, [loadCustomerProfile]);

  // Dirty State Checking
  const isDirty = initialSnapshot
    ? name !== (initialSnapshot.name || '') ||
      email !== (initialSnapshot.email || '') ||
      phone !== (initialSnapshot.phone || '') ||
      dob !== (initialSnapshot.dob || '') ||
      gender !== (initialSnapshot.gender || 'Other') ||
      avatar !== (initialSnapshot.avatar || '') ||
      emailVerified !== Boolean(initialSnapshot.emailVerified) ||
      phoneVerified !== Boolean(initialSnapshot.phoneVerified)
    : false;

  // Validation
  const isValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    email.includes('@') &&
    phone.trim().length >= 10;

  // Contact Field Changes (changes trigger unverified state)
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (initialSnapshot && text !== (initialSnapshot.email || '')) {
      setEmailVerified(false);
    } else if (initialSnapshot) {
      setEmailVerified(Boolean(initialSnapshot.emailVerified));
    }
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    if (initialSnapshot && text !== (initialSnapshot.phone || '')) {
      setPhoneVerified(false);
    } else if (initialSnapshot) {
      setPhoneVerified(Boolean(initialSnapshot.phoneVerified));
    }
  };

  // Trigger OTP Verification flow
  const handleTriggerVerification = async (target: 'email' | 'phone', val: string) => {
    if (!val.trim()) return;
    setSaveLoading(true);
    setBannerError(null);
    try {
      const res = await apiFetch('/customer/profile/send-otp', {
        method: 'POST',
        body: { target, value: val },
      });
      if (res && res.status === 'success') {
        setOtpTarget(target);
        setPendingContactVal(val);
        setOtpValue('');
        setOtpModalVisible(true);
      } else {
        setBannerError(res?.message || 'Failed to send OTP verification code.');
      }
    } catch (err: any) {
      setBannerError(err?.message || 'Network error sending verification OTP.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length < 4) {
      Alert.alert('Verification Error', 'Please enter a valid 4-digit code.');
      return;
    }
    setSaveLoading(true);
    setBannerError(null);
    try {
      const res = await apiFetch('/customer/profile/verify-otp', {
        method: 'POST',
        body: { otp: otpValue, target: otpTarget, value: pendingContactVal },
      });
      if (res && res.status === 'success' && res.verified) {
        if (otpTarget === 'email') {
          setEmailVerified(true);
          setEmail(pendingContactVal);
        } else if (otpTarget === 'phone') {
          setPhoneVerified(true);
          setPhone(pendingContactVal);
        }
        setOtpModalVisible(false);
        Alert.alert(
          'Verified',
          `${otpTarget === 'email' ? 'Email Address' : 'Phone Number'} has been verified successfully.`
        );
      } else {
        Alert.alert('Invalid Code', 'The verification code entered was incorrect.');
      }
    } catch (err: any) {
      setBannerError(err?.message || 'Failed to complete verification.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Native Camera Action
  const handleTakePhoto = async () => {
    const hasPerm = await requestCameraPermission();
    if (!hasPerm) {
      Alert.alert(
        'Camera Permission Needed',
        'Camera permission was denied. Please allow camera access in your device settings.'
      );
      return;
    }
    setActionSheetVisible(false);
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'front',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
        saveToPhotos: false,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) return;
        if (response.errorMessage) {
          Alert.alert('Camera Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
          setSelectedPhotoUri(response.assets[0].uri);
          setZoomScale(1);
          setCropModalVisible(true);
        }
      }
    );
  };

  // Native Gallery Action
  const handleChooseFromGallery = async () => {
    await requestGalleryPermission();
    setActionSheetVisible(false);
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
        selectionLimit: 1,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) return;
        if (response.errorMessage) {
          Alert.alert('Gallery Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
          setSelectedPhotoUri(response.assets[0].uri);
          setZoomScale(1);
          setCropModalVisible(true);
        }
      }
    );
  };

  // Remove Photo -> Shows customer initials
  const handleRemovePhoto = () => {
    setActionSheetVisible(false);
    setAvatar('');
  };

  // Confirm Preview Photo
  const handleUsePhoto = async () => {
    if (!selectedPhotoUri) return;
    setCropModalVisible(false);
    setAvatar(selectedPhotoUri);
  };

  // Save Changes
  const handleSaveChanges = async () => {
    if (!isValid || !isDirty) return;
    setSaveLoading(true);
    setBannerError(null);

    // Prepare only changed fields payload for PATCH
    const patchPayload: Partial<typeof currentUser> = {};
    if (initialSnapshot) {
      if (name !== initialSnapshot.name) patchPayload.name = name;
      if (email !== initialSnapshot.email) patchPayload.email = email;
      if (phone !== initialSnapshot.phone) patchPayload.phone = phone;
      if (dob !== initialSnapshot.dob) patchPayload.dob = dob;
      if (gender !== initialSnapshot.gender) patchPayload.gender = gender;
      if (avatar !== initialSnapshot.avatar) patchPayload.avatar = avatar;
      if (emailVerified !== Boolean(initialSnapshot.emailVerified)) patchPayload.emailVerified = emailVerified;
      if (phoneVerified !== Boolean(initialSnapshot.phoneVerified)) patchPayload.phoneVerified = phoneVerified;
    }

    try {
      const updated = await updateProfile(patchPayload);
      if (updated) {
        Alert.alert('Profile Saved', 'Your profile details were updated successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        setBannerError('Failed to save profile changes. Please try again.');
      }
    } catch (err: any) {
      setBannerError(err?.message || 'An error occurred while saving profile changes.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Full-Screen Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icons.ArrowLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={styles.headerSaveButton}
          onPress={handleSaveChanges}
          disabled={!isDirty || !isValid || saveLoading || screenLoading}
        >
          <Text
            style={[
              styles.headerSaveText,
              (!isDirty || !isValid || saveLoading || screenLoading) && { opacity: 0.4 },
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      {/* Screen Loading Indicator */}
      {screenLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#F4C400" size="large" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      ) : screenError ? (
        /* Screen Error State with Retry Button */
        <View style={styles.centerContainer}>
          <Icons.AlertTriangle color="#EF4444" size={48} style={{ marginBottom: 12 }} />
          <Text style={styles.errorTitle}>Unable to load your profile</Text>
          <Text style={styles.errorSubtitle}>{screenError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCustomerProfile}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Main Form Layout */
        <>
          {bannerError ? (
            <View style={styles.errorBanner}>
              <Icons.AlertCircle color="#EF4444" size={16} />
              <Text style={styles.errorBannerText}>{bannerError}</Text>
              <TouchableOpacity onPress={() => setBannerError(null)}>
                <Icons.X color="#94A3B8" size={16} />
              </TouchableOpacity>
            </View>
          ) : null}

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarContainer}
                activeOpacity={0.85}
                onPress={() => setActionSheetVisible(true)}
              >
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>
                      {name ? name.trim().charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.cameraIconContainer}>
                  <Icons.Camera color="#FFFFFF" size={13} />
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarName}>{name || 'Customer'}</Text>
            </View>

            {/* Personal Information */}
            <Text style={styles.sectionHeading}>Personal Information</Text>
            <View style={styles.card}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.fieldDivider} />

              {/* Email Address */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  {emailVerified ? (
                    <View style={styles.verifiedBadge}>
                      <Icons.CheckCircle2 color="#059669" size={11} />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  ) : email.trim().length > 0 ? (
                    <TouchableOpacity
                      style={styles.verifyButton}
                      onPress={() => handleTriggerVerification('email', email)}
                      disabled={saveLoading}
                    >
                      <Text style={styles.verifyButtonText}>Verify</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={handleEmailChange}
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.fieldDivider} />

              {/* Phone Number */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  {phoneVerified ? (
                    <View style={styles.verifiedBadge}>
                      <Icons.CheckCircle2 color="#059669" size={11} />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  ) : phone.trim().length > 0 ? (
                    <TouchableOpacity
                      style={styles.verifyButton}
                      onPress={() => handleTriggerVerification('phone', phone)}
                      disabled={saveLoading}
                    >
                      <Text style={styles.verifyButtonText}>Verify</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="Enter phone number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Date of Birth */}
              {currentUser && ('dob' in currentUser || dob) && (
                <>
                  <View style={styles.fieldDivider} />
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabel}>Date of Birth</Text>
                      {dob ? (
                        <Text style={styles.formattedDobHint}>{formatDobDisplay(dob)}</Text>
                      ) : null}
                    </View>
                    <TextInput
                      style={styles.textInput}
                      value={dob}
                      onChangeText={setDob}
                      placeholder="YYYY-MM-DD (e.g. 1995-08-15)"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </>
              )}

              {/* Gender */}
              {currentUser && ('gender' in currentUser || gender) && (
                <>
                  <View style={styles.fieldDivider} />
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Gender</Text>
                    <View style={styles.genderRow}>
                      {(['Male', 'Female', 'Other'] as const).map((g) => {
                        const selected = gender === g;
                        return (
                          <TouchableOpacity
                            key={g}
                            style={[
                              styles.genderOption,
                              selected && styles.genderOptionSelected,
                            ]}
                            onPress={() => setGender(g)}
                          >
                            <Text
                              style={[
                                styles.genderOptionText,
                                selected && styles.genderOptionTextSelected,
                              ]}
                            >
                              {g}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Default Address Section */}
            <Text style={styles.sectionHeading}>Default Address</Text>
            <View style={styles.card}>
              {currentUser?.address ? (
                <>
                  <View style={styles.addressDisplayRow}>
                    <Icons.MapPin color="#475569" size={20} style={styles.addressIcon} />
                    <View style={styles.addressInfo}>
                      <Text style={styles.addressText}>{currentUser.address.address}</Text>
                      <Text style={styles.addressCityText}>
                        {currentUser.address.city}, {currentUser.address.state} - {currentUser.address.pincode}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.fieldDivider} />
                  <TouchableOpacity
                    style={styles.manageAddressButton}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('MyAddresses')}
                  >
                    <Text style={styles.manageAddressText}>Manage Addresses</Text>
                    <Icons.ChevronRight color="#64748B" size={16} />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.emptyAddressBlock}>
                  <Text style={styles.emptyAddressText}>No default address</Text>
                  <TouchableOpacity
                    style={styles.addAddressBtn}
                    onPress={() => navigation.navigate('MyAddresses')}
                  >
                    <Text style={styles.addAddressBtnText}>Add Address →</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Fixed Bottom Save Button */}
          <View
            style={[
              styles.bottomButtonContainer,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.saveChangesBtn,
                (!isDirty || !isValid || saveLoading) && styles.disabledBtn,
              ]}
              activeOpacity={0.8}
              onPress={handleSaveChanges}
              disabled={!isDirty || !isValid || saveLoading}
            >
              {saveLoading ? (
                <ActivityIndicator color="#0F172A" size="small" />
              ) : (
                <Text style={styles.saveChangesBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Native Bottom Action Sheet */}
      <Modal
        visible={actionSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setActionSheetVisible(false)}
      >
        <TouchableOpacity
          style={styles.actionSheetOverlay}
          activeOpacity={1}
          onPress={() => setActionSheetVisible(false)}
        >
          <View
            style={styles.actionSheetContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.actionSheetIndicator} />
            <Text style={styles.actionSheetTitle}>Change Profile Photo</Text>

            <TouchableOpacity
              style={styles.actionSheetOption}
              activeOpacity={0.7}
              onPress={handleTakePhoto}
            >
              <Icons.Camera color="#475569" size={20} />
              <Text style={styles.actionSheetOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionSheetOption}
              activeOpacity={0.7}
              onPress={handleChooseFromGallery}
            >
              <Icons.Image color="#475569" size={20} />
              <Text style={styles.actionSheetOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            {avatar ? (
              <TouchableOpacity
                style={[styles.actionSheetOption, styles.destructiveOption]}
                activeOpacity={0.7}
                onPress={handleRemovePhoto}
              >
                <Icons.Trash2 color="#EF4444" size={20} />
                <Text style={[styles.actionSheetOptionText, styles.destructiveOptionText]}>
                  Remove Photo
                </Text>
              </TouchableOpacity>
            ) : null}

            <View style={styles.actionSheetCancelContainer}>
              <TouchableOpacity
                style={styles.actionSheetCancelBtn}
                activeOpacity={0.7}
                onPress={() => setActionSheetVisible(false)}
              >
                <Text style={styles.actionSheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Crop & Preview Modal */}
      <Modal
        visible={cropModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCropModalVisible(false)}
      >
        <View style={styles.cropOverlay}>
          <View style={styles.cropContent}>
            <Text style={styles.cropTitle}>Crop & Position Photo</Text>
            <View style={styles.cropPreviewFrame}>
              {selectedPhotoUri ? (
                <Image
                  source={{ uri: selectedPhotoUri }}
                  style={[
                    styles.cropImagePreview,
                    { transform: [{ scale: zoomScale }] },
                  ]}
                />
              ) : null}
              <View style={styles.cropMaskOverlay} />
            </View>

            <View style={styles.zoomControlRow}>
              <Icons.Minus color="#64748B" size={16} />
              <TouchableOpacity
                style={styles.zoomTrack}
                activeOpacity={0.8}
                onPress={() =>
                  setZoomScale(zoomScale === 1 ? 1.5 : zoomScale === 1.5 ? 2 : 1)
                }
              >
                <View
                  style={[
                    styles.zoomHandle,
                    {
                      left:
                        zoomScale === 1
                          ? '10%'
                          : zoomScale === 1.5
                          ? '50%'
                          : '90%',
                    },
                  ]}
                />
              </TouchableOpacity>
              <Icons.Plus color="#64748B" size={16} />
            </View>
            <Text style={styles.zoomHelperText}>
              Tap track to toggle zoom: {zoomScale}x
            </Text>

            <View style={styles.cropActionRow}>
              <TouchableOpacity
                style={styles.cropCancelBtn}
                onPress={() => setCropModalVisible(false)}
              >
                <Text style={styles.cropCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cropConfirmBtn}
                onPress={handleUsePhoto}
              >
                <Text style={styles.cropConfirmText}>Use Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Verification OTP Modal Sheet */}
      <Modal
        visible={otpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icons.ShieldCheck
              color="#F4C400"
              size={36}
              style={{ alignSelf: 'center', marginBottom: 12 }}
            />
            <Text style={styles.modalTitle}>Verification Required</Text>
            <Text style={styles.otpDescription}>
              We sent a 4-digit code to verify your new{' '}
              {otpTarget === 'email' ? 'email address' : 'phone number'}:{' '}
              {pendingContactVal}
            </Text>
            <TextInput
              style={styles.otpInput}
              value={otpValue}
              onChangeText={setOtpValue}
              placeholder="Enter Code"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={4}
              textAlign="center"
            />
            <TouchableOpacity
              style={styles.otpSubmitBtn}
              onPress={handleVerifyOtp}
              disabled={saveLoading}
            >
              {saveLoading ? (
                <ActivityIndicator color="#0F172A" size="small" />
              ) : (
                <Text style={styles.otpSubmitText}>Verify & Save Contact</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.otpCancelBtn}
              onPress={() => setOtpModalVisible(false)}
            >
              <Text style={styles.otpCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  headerSaveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  headerSaveText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
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
    color: '#64748B',
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
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
  retryButton: {
    backgroundColor: '#F4C400',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 12,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  inputGroup: {
    paddingVertical: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  formattedDobHint: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  textInput: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  fieldDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
    marginLeft: 4,
  },
  verifyButton: {
    backgroundColor: '#FEFCE8',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FACC15',
  },
  verifyButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#854D0E',
  },
  genderRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#F8FAFC',
  },
  genderOptionSelected: {
    borderColor: '#F4C400',
    backgroundColor: '#FEFCE8',
  },
  genderOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  genderOptionTextSelected: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  addressDisplayRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  addressIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  addressCityText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  manageAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  manageAddressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyAddressBlock: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyAddressText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  addAddressBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addAddressBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#854D0E',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  saveChangesBtn: {
    backgroundColor: '#F4C400',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveChangesBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  disabledBtn: {
    backgroundColor: '#E2E8F0',
    opacity: 0.65,
  },
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  actionSheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    paddingTop: 12,
  },
  actionSheetIndicator: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  actionSheetTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  actionSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    width: '100%',
    gap: 12,
  },
  actionSheetOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  destructiveOption: {
    borderBottomWidth: 0,
  },
  destructiveOptionText: {
    color: '#EF4444',
  },
  actionSheetCancelContainer: {
    marginTop: 8,
    borderTopWidth: 8,
    borderTopColor: '#F1F5F9',
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  actionSheetCancelBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  actionSheetCancelText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  cropOverlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  cropContent: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  cropTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  cropPreviewFrame: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropImagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cropMaskOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: (width * 0.7 - 20) / 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  zoomControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
    width: '80%',
  },
  zoomTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#475569',
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  zoomHandle: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F4C400',
    marginLeft: -8,
  },
  zoomHelperText: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 16,
  },
  cropActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cropCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropCancelText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  cropConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F4C400',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropConfirmText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  otpDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: 8,
  },
  otpSubmitBtn: {
    backgroundColor: '#F4C400',
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  otpSubmitText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  otpCancelBtn: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpCancelText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
});
