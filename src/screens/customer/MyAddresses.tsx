import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../../store/themeStore';
import * as Icons from 'lucide-react-native';
import GlassCard from '../../components/GlassCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

interface SavedAddress {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  icon: 'Home' | 'Briefcase' | 'MapPin' | 'Heart';
  isDefault: boolean;
}

const INITIAL_ADDRESSES: SavedAddress[] = [
  {
    id: '1',
    label: 'Home',
    name: 'Arjun Kumar',
    phone: '+91 98765 43210',
    address: '25, 11th Cross, 4th Block, Koramangala, Bengaluru, Karnataka - 560034',
    icon: 'Home',
    isDefault: true
  },
  {
    id: '2',
    label: 'Work',
    name: 'Arjun Kumar',
    phone: '+91 98765 43210',
    address: '91, Outer Ring Road, Bellandur, Bengaluru, Karnataka - 560103',
    icon: 'Briefcase',
    isDefault: false
  },
  {
    id: '3',
    label: 'Other',
    name: 'Arjun Kumar',
    phone: '+91 98765 43210',
    address: 'No. 12, MG Road, Pondicherry, Puducherry - 605001',
    icon: 'MapPin',
    isDefault: false
  },
  {
    id: '4',
    label: 'Parents Home',
    name: 'Arjun Kumar',
    phone: '+91 98765 43210',
    address: 'Old No. 8, New No. 15, Thillai Nagar, Tiruchirappalli, Tamil Nadu - 620018',
    icon: 'Heart',
    isDefault: false
  }
];

export default function MyAddresses() {
  const navigation = useNavigation();
  const colors = useThemeStore((state) => state.colors);
  const themeMode = useThemeStore((state) => state.themeMode);
  const insets = useSafeAreaInsets();

  const [addresses, setAddresses] = useState<SavedAddress[]>(INITIAL_ADDRESSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLabel, setFormLabel] = useState('Home');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formIcon, setFormIcon] = useState<'Home' | 'Briefcase' | 'MapPin' | 'Heart'>('Home');

  const handleSelectDefault = (id: string) => {
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }))
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to remove this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAddresses(prev => prev.filter(addr => addr.id !== id));
          }
        }
      ]
    );
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormLabel('Home');
    setFormName('');
    setFormPhone('');
    setFormAddress('');
    setFormIcon('Home');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: SavedAddress) => {
    setEditingId(addr.id);
    setFormLabel(addr.label);
    setFormName(addr.name);
    setFormPhone(addr.phone);
    setFormAddress(addr.address);
    setFormIcon(addr.icon);
    setIsModalOpen(true);
  };

  const handleSaveAddress = () => {
    if (!formName.trim() || !formPhone.trim() || !formAddress.trim()) {
      Alert.alert('Validation Error', 'Please fill out all address fields.');
      return;
    }

    if (editingId) {
      // Edit
      setAddresses(prev =>
        prev.map(addr =>
          addr.id === editingId
            ? {
                ...addr,
                label: formLabel,
                name: formName,
                phone: formPhone,
                address: formAddress,
                icon: formIcon
              }
            : addr
        )
      );
    } else {
      // Add
      const newAddr: SavedAddress = {
        id: Math.random().toString(),
        label: formLabel,
        name: formName,
        phone: formPhone,
        address: formAddress,
        icon: formIcon,
        isDefault: addresses.length === 0
      };
      setAddresses(prev => [...prev, newAddr]);
    }
    setIsModalOpen(false);
  };

  const filteredAddresses = addresses.filter(
    addr =>
      addr.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addr.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAddressIcon = (icon: string) => {
    const iconColor = colors.primary;
    switch (icon) {
      case 'Home':
        return <Icons.Home color={iconColor} size={18} />;
      case 'Briefcase':
        return <Icons.Briefcase color={iconColor} size={18} />;
      case 'Heart':
        return <Icons.Heart color={iconColor} size={18} />;
      case 'MapPin':
      default:
        return <Icons.MapPin color={iconColor} size={18} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerLeftRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icons.ChevronLeft color={colors.text} size={20} />
          </TouchableOpacity>
          <View style={styles.titleWrapper}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>My Addresses</Text>
            <Text style={styles.headerSubtitle}>Manage your saved addresses</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={handleOpenAddModal}>
          <Icons.PlusCircle color={colors.primary} size={16} style={{ marginRight: 4 }} />
          <Text style={[styles.addBtnText, { color: colors.primary }]}>Add Address</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Input Bar */}
        <View style={styles.searchBarRow}>
          <View style={[styles.searchInputWrapper, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Icons.Search color={colors.text} size={16} style={{ opacity: 0.4 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search addresses"
              placeholderTextColor={themeMode === 'light' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.4)'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Icons.Sliders color={colors.text} size={16} style={{ opacity: 0.4 }} />
          </View>
        </View>

        {/* List Title */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitleText, { color: colors.text }]}>Saved Addresses</Text>
          <Text style={styles.sectionCountText}>{filteredAddresses.length} Addresses</Text>
        </View>

        {/* Address Cards List */}
        {filteredAddresses.map((addr) => (
          <TouchableOpacity
            key={addr.id}
            activeOpacity={0.9}
            onPress={() => handleSelectDefault(addr.id)}
          >
            <GlassCard
              style={[
                styles.addressCard,
                addr.isDefault && { borderColor: colors.primary, borderWidth: 1.5 }
              ]}
              borderColor={addr.isDefault ? colors.primary : colors.cardBorder}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.cardBorder }]}>
                    {renderAddressIcon(addr.icon)}
                  </View>
                  <View>
                    <Text style={[styles.addressLabelText, { color: colors.text }]}>{addr.label}</Text>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Selected Indicator Checkbox */}
                <View style={[styles.selectorCircle, addr.isDefault && { backgroundColor: '#EF4444', borderColor: '#EF4444' }]}>
                  {addr.isDefault && <Icons.Check color="#FFF" size={10} strokeWidth={3} />}
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={[styles.userNameText, { color: colors.text }]}>{addr.name}</Text>
                <Text style={styles.phoneText}>{addr.phone}</Text>
                <Text style={[styles.fullAddressText, { color: colors.text }]}>{addr.address}</Text>
              </View>

              <View style={[styles.cardActions, { borderTopColor: colors.cardBorder }]}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenEditModal(addr)}>
                  <Icons.Pencil color={colors.text} size={12} style={{ marginRight: 4 }} />
                  <Text style={[styles.actionBtnText, { color: colors.text }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(addr.id)}>
                  <Icons.Trash2 color="#EF4444" size={12} style={{ marginRight: 4 }} />
                  <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}

        {/* Bottom Banner */}
        <GlassCard style={styles.instructionsCard}>
          <View style={styles.instructionsLeft}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Icons.Navigation color="#EF4444" size={16} />
            </View>
            <View>
              <Text style={[styles.instructionsTitle, { color: colors.text }]}>Set delivery instructions for your address</Text>
              <Text style={styles.instructionsSubtitle}>Add instructions for our delivery partner</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={() => Alert.alert('Instructions', 'Customize gate codes, security notes, or drop-off spots.')}>
            <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: 'bold' }}>Add Now ❯</Text>
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>

      {/* Add / Edit Address Modal Dialog */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <GlassCard style={[styles.modalCard, { backgroundColor: colors.background === '#F8FAFC' ? '#FFFFFF' : '#0B1530', borderColor: colors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{editingId ? 'Edit Address' : 'Add New Address'}</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Icons.X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Address Label</Text>
              <View style={styles.labelButtonRow}>
                {['Home', 'Work', 'Other', 'Parents Home'].map((lbl) => (
                  <TouchableOpacity
                    key={lbl}
                    style={[
                      styles.labelSelectorBtn,
                      { borderColor: colors.cardBorder },
                      formLabel === lbl && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => {
                      setFormLabel(lbl);
                      if (lbl === 'Home') setFormIcon('Home');
                      else if (lbl === 'Work') setFormIcon('Briefcase');
                      else if (lbl === 'Parents Home') setFormIcon('Heart');
                      else setFormIcon('MapPin');
                    }}
                  >
                    <Text style={[styles.labelSelectorText, { color: colors.text }, formLabel === lbl && { color: '#050B1E', fontWeight: 'bold' }]}>
                      {lbl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Contact Name</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: colors.cardBorder }]}
                placeholder="Arjun Kumar"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={formName}
                onChangeText={setFormName}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: colors.cardBorder }]}
                placeholder="+91 98765 43210"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="phone-pad"
                value={formPhone}
                onChangeText={setFormPhone}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Complete Address</Text>
              <TextInput
                style={[styles.textAreaInput, { color: colors.text, borderColor: colors.cardBorder }]}
                placeholder="Flat/House No., Building Name, Street Address, City, State - Pincode"
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline={true}
                numberOfLines={3}
                value={formAddress}
                onChangeText={setFormAddress}
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleSaveAddress}>
                <Text style={styles.submitBtnText}>Save Address</Text>
              </TouchableOpacity>
            </ScrollView>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B1E'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  titleWrapper: {
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold'
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 196, 0, 0.1)'
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  searchBarRow: {
    marginBottom: 16
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingHorizontal: 8,
    height: '100%'
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  sectionTitleText: {
    fontSize: 13,
    fontWeight: 'bold'
  },
  sectionCountText: {
    fontSize: 10,
    color: '#94A3B8'
  },
  addressCard: {
    padding: 16,
    marginBottom: 14
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  addressLabelText: {
    fontSize: 13,
    fontWeight: 'bold'
  },
  defaultBadge: {
    backgroundColor: 'rgba(244, 196, 0, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: 'flex-start'
  },
  defaultBadgeText: {
    color: '#F4C400',
    fontSize: 8,
    fontWeight: 'black'
  },
  selectorCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardBody: {
    marginBottom: 14
  },
  userNameText: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  phoneText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2
  },
  fullAddressText: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 6,
    opacity: 0.8
  },
  cardActions: {
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingTop: 10,
    gap: 16
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  instructionsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginTop: 8,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    backgroundColor: 'rgba(239, 68, 68, 0.02)'
  },
  instructionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  instructionsTitle: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  instructionsSubtitle: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 1
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 30, 0.7)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 40,
    maxHeight: height * 0.8
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  formContainer: {
    gap: 14
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    opacity: 0.8
  },
  labelButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  labelSelectorBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1
  },
  labelSelectorText: {
    fontSize: 11
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    height: 72,
    textAlignVertical: 'top'
  },
  submitBtn: {
    backgroundColor: '#F4C400',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  submitBtnText: {
    color: '#050B1E',
    fontWeight: 'bold',
    fontSize: 14
  }
});
