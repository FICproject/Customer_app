import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { apiFetch } from '../../services/api';

export interface CustomerAddress {
  id: string;
  userId: string;
  label: 'Home' | 'Work' | 'Other';
  name: string;
  phone: string;
  house: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function MyAddresses() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const currentUser = useAuthStore((state) => state.currentUser);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  // Addresses state
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal & Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form Fields
  const [formLabel, setFormLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formHouse, setFormHouse] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formLandmark, setFormLandmark] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formPincode, setFormPincode] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);

  // Load Addresses from API
  const loadAddresses = useCallback(async () => {
    setLoading(true);
    setError(null);
    const uId = currentUser?.id || 'cust_uma';
    try {
      const res = await apiFetch(`/customer/addresses?userId=${encodeURIComponent(uId)}`, {
        method: 'GET',
      });
      if (res && res.status === 'success' && Array.isArray(res.data)) {
        setAddresses(res.data);
      } else {
        setError(res?.message || 'Unable to load saved addresses.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error loading addresses.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // Set Address as Default
  const handleSetDefault = async (addrId: string) => {
    const uId = currentUser?.id || 'cust_uma';
    try {
      // Optimistically update UI
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === addrId,
        }))
      );

      await apiFetch(`/customer/addresses/${addrId}/default?userId=${encodeURIComponent(uId)}`, {
        method: 'PATCH',
      });

      // Synchronize profile store
      fetchProfile();
    } catch (err: any) {
      Alert.alert('Error', 'Unable to set default address. Please try again.');
      loadAddresses();
    }
  };

  // Delete Address
  const handleDeleteAddress = (addrId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to remove this delivery address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const uId = currentUser?.id || 'cust_uma';
            try {
              setAddresses((prev) => prev.filter((a) => a.id !== addrId));
              await apiFetch(`/customer/addresses/${addrId}?userId=${encodeURIComponent(uId)}`, {
                method: 'DELETE',
              });
              fetchProfile();
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete address.');
              loadAddresses();
            }
          },
        },
      ]
    );
  };

  // Open Modal for Adding New Address
  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setFormLabel('Home');
    setFormName(currentUser?.name || '');
    setFormPhone(currentUser?.phone || '');
    setFormHouse('');
    setFormStreet('');
    setFormLandmark('');
    setFormCity('Bengaluru');
    setFormState('Karnataka');
    setFormPincode('');
    setFormIsDefault(addresses.length === 0);
    setModalVisible(true);
  };

  // Open Modal for Editing Address
  const handleOpenEditModal = (addr: CustomerAddress) => {
    setEditingAddressId(addr.id);
    setFormLabel(addr.label);
    setFormName(addr.name);
    setFormPhone(addr.phone);
    setFormHouse(addr.house);
    setFormStreet(addr.street);
    setFormLandmark(addr.landmark || '');
    setFormCity(addr.city);
    setFormState(addr.state);
    setFormPincode(addr.pincode);
    setFormIsDefault(addr.isDefault);
    setModalVisible(true);
  };

  // Validate & Save Address
  const handleSaveAddress = async () => {
    if (!formName.trim()) {
      Alert.alert('Validation Error', 'Please enter recipient name.');
      return;
    }
    if (!formPhone.trim() || formPhone.trim().length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formHouse.trim()) {
      Alert.alert('Validation Error', 'Please enter house/flat/building details.');
      return;
    }
    if (!formStreet.trim()) {
      Alert.alert('Validation Error', 'Please enter street/area/locality details.');
      return;
    }
    if (!formCity.trim()) {
      Alert.alert('Validation Error', 'Please enter city name.');
      return;
    }
    if (!formState.trim()) {
      Alert.alert('Validation Error', 'Please enter state name.');
      return;
    }
    if (!formPincode.trim() || !/^\d{6}$/.test(formPincode.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid 6-digit postal pincode.');
      return;
    }

    setSubmitting(true);
    const uId = currentUser?.id || 'cust_uma';
    const payload = {
      userId: uId,
      label: formLabel,
      name: formName.trim(),
      phone: formPhone.trim(),
      house: formHouse.trim(),
      street: formStreet.trim(),
      landmark: formLandmark.trim(),
      city: formCity.trim(),
      state: formState.trim(),
      pincode: formPincode.trim(),
      isDefault: formIsDefault || addresses.length === 0,
    };

    try {
      if (editingAddressId) {
        // Update existing address
        await apiFetch(`/customer/addresses/${editingAddressId}?userId=${encodeURIComponent(uId)}`, {
          method: 'PATCH',
          body: payload,
        });
      } else {
        // Create new address
        await apiFetch(`/customer/addresses?userId=${encodeURIComponent(uId)}`, {
          method: 'POST',
          body: payload,
        });
      }

      setModalVisible(false);
      await loadAddresses();
      fetchProfile();
    } catch (err: any) {
      Alert.alert('Save Failed', err?.message || 'Could not save address. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter addresses if search query is present
  const filteredAddresses = addresses.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.label.toLowerCase().includes(q) ||
      a.street.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.pincode.includes(q)
    );
  });

  const getLabelIcon = (label: string) => {
    switch (label) {
      case 'Work':
        return <Icons.Briefcase color="#475569" size={16} />;
      case 'Other':
        return <Icons.MapPin color="#475569" size={16} />;
      default:
        return <Icons.Home color="#475569" size={16} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icons.ArrowLeft color="#0F172A" size={24} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Addresses</Text>
        </View>

        <TouchableOpacity
          style={styles.headerAddBtn}
          activeOpacity={0.8}
          onPress={handleOpenAddModal}
        >
          <Icons.Plus color="#0F172A" size={16} />
          <Text style={styles.headerAddBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#F4C400" size="large" />
          <Text style={styles.loadingText}>Loading saved addresses...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Icons.AlertTriangle color="#EF4444" size={48} style={{ marginBottom: 12 }} />
          <Text style={styles.errorTitle}>Unable to load addresses</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAddresses}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : addresses.length === 0 ? (
        /* Empty State */
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Icons.MapPin color="#F4C400" size={36} />
          </View>
          <Text style={styles.emptyTitle}>No saved addresses yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your delivery addresses for quick and hassle-free checkout.
          </Text>
          <TouchableOpacity style={styles.emptyAddBtn} onPress={handleOpenAddModal}>
            <Icons.Plus color="#0F172A" size={18} />
            <Text style={styles.emptyAddBtnText}>Add Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Addresses List */
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Optional Search bar if many addresses exist */}
          {addresses.length >= 5 ? (
            <View style={styles.searchBar}>
              <Icons.Search color="#94A3B8" size={18} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search addresses..."
                placeholderTextColor="#94A3B8"
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icons.X color="#94A3B8" size={16} />
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          <View style={styles.listHeaderRow}>
            <Text style={styles.sectionHeading}>Saved Addresses</Text>
            <Text style={styles.addressCountBadge}>{addresses.length} Saved</Text>
          </View>

          {filteredAddresses.map((addr) => (
            <View
              key={addr.id}
              style={[
                styles.addressCard,
                addr.isDefault && styles.defaultCardBorder,
              ]}
            >
              {/* Card Header: Label, Default Tag & Radio Selector */}
              <View style={styles.cardHeader}>
                <View style={styles.labelBadgeRow}>
                  <View style={styles.labelIconPill}>
                    {getLabelIcon(addr.label)}
                  </View>
                  <Text style={styles.addressLabel}>{addr.label}</Text>
                  {addr.isDefault ? (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  ) : null}
                </View>

                {/* Default Radio Selector */}
                <TouchableOpacity
                  style={styles.radioSelector}
                  activeOpacity={0.7}
                  onPress={() => handleSetDefault(addr.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {addr.isDefault ? (
                    <Icons.CheckCircle2 color="#059669" size={22} />
                  ) : (
                    <Icons.Circle color="#CBD5E1" size={22} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Recipient Details */}
              <Text style={styles.recipientName}>{addr.name}</Text>
              <Text style={styles.recipientPhone}>{addr.phone}</Text>

              {/* Formatted Address */}
              <Text style={styles.addressBody}>
                {addr.house ? `${addr.house}, ` : ''}
                {addr.street}
                {addr.landmark ? `, Near ${addr.landmark}` : ''}
                {'\n'}
                {addr.city}, {addr.state} - {addr.pincode}
              </Text>

              {/* Actions Divider */}
              <View style={styles.cardDivider} />

              {/* Card Actions: Edit & Delete */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  activeOpacity={0.7}
                  onPress={() => handleOpenEditModal(addr)}
                >
                  <Icons.Pencil color="#475569" size={15} />
                  <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteActionBtn]}
                  activeOpacity={0.7}
                  onPress={() => handleDeleteAddress(addr.id)}
                >
                  <Icons.Trash2 color="#EF4444" size={15} />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add / Edit Address Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalSheet}>
            {/* Sheet Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setModalVisible(false)}
              >
                <Icons.X color="#475569" size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Address Label Selector */}
              <Text style={styles.formSectionLabel}>Address Type</Text>
              <View style={styles.labelSelectorRow}>
                {(['Home', 'Work', 'Other'] as const).map((type) => {
                  const selected = formLabel === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.labelChoiceBtn,
                        selected && styles.labelChoiceSelected,
                      ]}
                      onPress={() => setFormLabel(type)}
                    >
                      {type === 'Home' ? (
                        <Icons.Home color={selected ? '#0F172A' : '#64748B'} size={16} />
                      ) : type === 'Work' ? (
                        <Icons.Briefcase color={selected ? '#0F172A' : '#64748B'} size={16} />
                      ) : (
                        <Icons.MapPin color={selected ? '#0F172A' : '#64748B'} size={16} />
                      )}
                      <Text
                        style={[
                          styles.labelChoiceText,
                          selected && styles.labelChoiceTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Recipient Details */}
              <Text style={styles.formSectionLabel}>Contact Information</Text>
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Full Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="e.g. Uma"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Mobile Number *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formPhone}
                  onChangeText={setFormPhone}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Address Details */}
              <Text style={styles.formSectionLabel}>Address Details</Text>
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Flat, House No., Building *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formHouse}
                  onChangeText={setFormHouse}
                  placeholder="e.g. Flat 402, Sunshine Apts"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Area, Street, Sector *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formStreet}
                  onChangeText={setFormStreet}
                  placeholder="e.g. 11th Cross, 4th Block, Koramangala"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Landmark (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formLandmark}
                  onChangeText={setFormLandmark}
                  placeholder="e.g. Near Sony World Signal"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.twoColumnRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.fieldLabel}>City *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formCity}
                    onChangeText={setFormCity}
                    placeholder="Bengaluru"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.fieldLabel}>Pincode *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formPincode}
                    onChangeText={setFormPincode}
                    placeholder="6-digit PIN"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>State *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formState}
                  onChangeText={setFormState}
                  placeholder="Karnataka"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Default Address Checkbox */}
              <TouchableOpacity
                style={styles.defaultToggleRow}
                activeOpacity={0.8}
                onPress={() => setFormIsDefault(!formIsDefault)}
              >
                {formIsDefault ? (
                  <Icons.CheckSquare color="#F4C400" size={20} />
                ) : (
                  <Icons.Square color="#94A3B8" size={20} />
                )}
                <Text style={styles.defaultToggleText}>Make this my default address</Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.saveAddressBtn, submitting && { opacity: 0.6 }]}
                activeOpacity={0.8}
                onPress={handleSaveAddress}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#0F172A" size="small" />
                ) : (
                  <Text style={styles.saveAddressBtnText}>
                    {editingAddressId ? 'Update Address' : 'Save Address'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
  headerBackButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4C400',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  headerAddBtnText: {
    fontSize: 13,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEFCE8',
    borderWidth: 1,
    borderColor: '#FEF08A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4C400',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  emptyAddBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 2,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressCountBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  defaultCardBorder: {
    borderColor: '#F4C400',
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelIconPill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  defaultBadge: {
    backgroundColor: '#FEFCE8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#854D0E',
  },
  radioSelector: {
    padding: 2,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  recipientPhone: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  addressBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    marginBottom: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 10,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  deleteActionBtn: {
    marginLeft: 8,
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  formSectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 6,
  },
  labelSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  labelChoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    gap: 6,
  },
  labelChoiceSelected: {
    backgroundColor: '#FEFCE8',
    borderColor: '#F4C400',
  },
  labelChoiceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  labelChoiceTextSelected: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  formGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  twoColumnRow: {
    flexDirection: 'row',
  },
  defaultToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  defaultToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  saveAddressBtn: {
    backgroundColor: '#F4C400',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  saveAddressBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
});
