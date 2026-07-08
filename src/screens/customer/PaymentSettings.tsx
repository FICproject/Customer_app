import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../../store/themeStore';
import * as Icons from 'lucide-react-native';
import GlassCard from '../../components/GlassCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';


interface SavedCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cardType: 'visa' | 'mastercard' | 'rupay';
  cardColor: 'gold' | 'diamond' | 'silver';
  isDefault: boolean;
}

const INITIAL_CARDS: SavedCard[] = [
  {
    id: '1',
    cardNumber: '•••• •••• •••• 9012',
    cardHolder: 'ARJUN KUMAR',
    expiry: '12/29',
    cardType: 'visa',
    cardColor: 'gold',
    isDefault: true
  },
  {
    id: '2',
    cardNumber: '•••• •••• •••• 4820',
    cardHolder: 'ARJUN KUMAR',
    expiry: '08/31',
    cardType: 'mastercard',
    cardColor: 'diamond',
    isDefault: false
  }
];

export default function PaymentSettings() {
  const navigation = useNavigation();
  const colors = useThemeStore((state) => state.colors);
  const insets = useSafeAreaInsets();

  const [cards, setCards] = useState<SavedCard[]>(INITIAL_CARDS);
  const [selectedUPI, setSelectedUPI] = useState('gpay');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [formNumber, setFormNumber] = useState('');
  const [formHolder, setFormHolder] = useState('');
  const [formExpiry, setFormExpiry] = useState('');
  const [formType, setFormType] = useState<'visa' | 'mastercard' | 'rupay'>('visa');
  const [formColor, setFormColor] = useState<'gold' | 'diamond' | 'silver'>('gold');

  const handleSetDefaultCard = (id: string) => {
    setCards(prev =>
      prev.map(c => ({
        ...c,
        isDefault: c.id === id
      }))
    );
  };

  const handleDeleteCard = (id: string) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCards(prev => prev.filter(c => c.id !== id));
          }
        }
      ]
    );
  };

  const handleAddCard = () => {
    if (!formNumber.trim() || !formHolder.trim() || !formExpiry.trim()) {
      Alert.alert('Validation Error', 'Please fill out all card fields.');
      return;
    }
    const cleanNumber = formNumber.replace(/\s+/g, '');
    if (cleanNumber.length < 12) {
      Alert.alert('Validation Error', 'Please enter a valid card number.');
      return;
    }

    const obfuscated = `•••• •••• •••• ${cleanNumber.substring(cleanNumber.length - 4)}`;
    const newCard: SavedCard = {
      id: Math.random().toString(),
      cardNumber: obfuscated,
      cardHolder: formHolder.toUpperCase(),
      expiry: formExpiry,
      cardType: formType,
      cardColor: formColor,
      isDefault: cards.length === 0
    };

    setCards(prev => [...prev, newCard]);
    setIsModalOpen(false);
  };

  const getCardGradient = (cardColor: string) => {
    switch (cardColor) {
      case 'diamond':
        return (
          <LinearGradient id="diamondCard" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#1E3A8A" />
            <Stop offset="50%" stopColor="#3B82F6" />
            <Stop offset="100%" stopColor="#8B5CF6" />
          </LinearGradient>
        );
      case 'silver':
        return (
          <LinearGradient id="silverCard" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#708090" />
            <Stop offset="50%" stopColor="#A9A9A9" />
            <Stop offset="100%" stopColor="#2F4F4F" />
          </LinearGradient>
        );
      case 'gold':
      default:
        return (
          <LinearGradient id="goldCard" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#B8860B" />
            <Stop offset="50%" stopColor="#FFD700" />
            <Stop offset="100%" stopColor="#8B6508" />
          </LinearGradient>
        );
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
            <Text style={[styles.headerTitle, { color: colors.text }]}>Payment Settings</Text>
            <Text style={styles.headerSubtitle}>Manage your saved cards and payment accounts</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={() => setIsModalOpen(true)}>
          <Icons.Plus color={colors.primary} size={14} style={{ marginRight: 4 }} />
          <Text style={[styles.addBtnText, { color: colors.primary }]}>Add Card</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Credit / Debit Cards section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>CREDIT & DEBIT CARDS</Text>

        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            activeOpacity={0.95}
            onPress={() => handleSetDefaultCard(card.id)}
            style={styles.cardContainer}
          >
            {/* Native Card Background */}
            <View style={StyleSheet.absoluteFill}>
              <Svg width="100%" height="100%">
                <Defs>
                  {getCardGradient(card.cardColor)}
                </Defs>
                <Rect width="100%" height="100%" rx="16" fill={`url(#${card.cardColor}Card)`} />
              </Svg>
            </View>

            {/* Default Status Badge */}
            {card.isDefault && (
              <View style={styles.cardDefaultBadge}>
                <Icons.CheckCircle2 color="#050B1E" size={10} style={{ marginRight: 4 }} />
                <Text style={styles.cardDefaultText}>Primary Mode</Text>
              </View>
            )}

            {/* Card Content Overlay */}
            <View style={styles.cardContent}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardBrandName}>Connect Club</Text>
                <Text style={styles.cardTypeName}>{card.cardType.toUpperCase()}</Text>
              </View>

              <Text style={styles.cardNumberText}>{card.cardNumber}</Text>

              <View style={styles.cardBottomRow}>
                <View>
                  <Text style={styles.cardLabel}>CARD HOLDER</Text>
                  <Text style={styles.cardValue}>{card.cardHolder}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.cardLabel}>EXPIRES</Text>
                  <Text style={styles.cardValue}>{card.expiry}</Text>
                </View>
              </View>
            </View>

            {/* Delete button positioned top-right */}
            <TouchableOpacity
              style={styles.deleteCardBtn}
              onPress={() => handleDeleteCard(card.id)}
            >
              <Icons.Trash2 color="#FFFFFF" size={16} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {/* UPI Payments section */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>UPI NETWORKS</Text>

        <GlassCard style={styles.paymentSelectorCard}>
          {[
            { id: 'gpay', name: 'Google Pay', icon: 'Coins' },
            { id: 'phonepe', name: 'PhonePe', icon: 'Smartphone' },
            { id: 'paytm', name: 'Paytm Wallet', icon: 'Wallet' }
          ].map((upi) => (
            <TouchableOpacity
              key={upi.id}
              style={[styles.upiRow, { borderColor: colors.cardBorder }]}
              onPress={() => setSelectedUPI(upi.id)}
            >
              <View style={styles.upiLeft}>
                <View style={[styles.upiIconBox, { backgroundColor: colors.cardBorder }]}>
                  <Icons.CreditCard color={colors.primary} size={16} />
                </View>
                <Text style={[styles.upiName, { color: colors.text }]}>{upi.name}</Text>
              </View>
              <View style={[styles.selectorCircle, selectedUPI === upi.id && { backgroundColor: '#EF4444', borderColor: '#EF4444' }]}>
                {selectedUPI === upi.id && <Icons.Check color="#FFF" size={10} strokeWidth={3} />}
              </View>
            </TouchableOpacity>
          ))}
        </GlassCard>

        {/* Info Box */}
        <GlassCard style={styles.safetyInfoBox}>
          <Icons.ShieldAlert color={colors.primary} size={18} />
          <Text style={[styles.safetyText, { color: colors.text }]}>
            All transactions are encrypted end-to-end using bank-grade AES-256 protocols. Your security is our highest priority.
          </Text>
        </GlassCard>
      </ScrollView>

      {/* Add Card Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <GlassCard style={[styles.modalCard, { backgroundColor: colors.background === '#F8FAFC' ? '#FFFFFF' : '#0B1530', borderColor: colors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Card</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Icons.X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Card Provider</Text>
              <View style={styles.labelButtonRow}>
                {['visa', 'mastercard', 'rupay'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.labelSelectorBtn,
                      { borderColor: colors.cardBorder },
                      formType === t && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setFormType(t as any)}
                  >
                    <Text style={[styles.labelSelectorText, { color: colors.text }, formType === t && { color: '#050B1E', fontWeight: 'bold' }]}>
                      {t.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Card Theme</Text>
              <View style={styles.labelButtonRow}>
                {['gold', 'diamond', 'silver'].map((col) => (
                  <TouchableOpacity
                    key={col}
                    style={[
                      styles.labelSelectorBtn,
                      { borderColor: colors.cardBorder },
                      formColor === col && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setFormColor(col as any)}
                  >
                    <Text style={[styles.labelSelectorText, { color: colors.text }, formColor === col && { color: '#050B1E', fontWeight: 'bold' }]}>
                      {col.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Card Number</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: colors.cardBorder }]}
                placeholder="4000 1234 5678 9010"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="numeric"
                maxLength={19}
                value={formNumber}
                onChangeText={setFormNumber}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Card Holder Name</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: colors.cardBorder }]}
                placeholder="ARJUN KUMAR"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={formHolder}
                onChangeText={setFormHolder}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Expiry Date</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: colors.cardBorder }]}
                placeholder="MM/YY"
                placeholderTextColor="rgba(255,255,255,0.3)"
                maxLength={5}
                value={formExpiry}
                onChangeText={setFormExpiry}
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddCard}>
                <Text style={styles.submitBtnText}>Add Card</Text>
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
    color: 'rgba(255,255,255,0.4)',
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 16
  },
  cardContainer: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between'
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardBrandName: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.9
  },
  cardTypeName: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'black',
    letterSpacing: 1.5
  },
  cardNumberText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginVertical: 14,
    opacity: 0.95
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardLabel: {
    color: '#FFF',
    fontSize: 8,
    opacity: 0.5,
    letterSpacing: 1
  },
  cardValue: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2
  },
  cardDefaultBadge: {
    position: 'absolute',
    left: 20,
    top: 20,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 10
  },
  cardDefaultText: {
    color: '#050B1E',
    fontSize: 9,
    fontWeight: 'bold'
  },
  deleteCardBtn: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 10
  },
  paymentSelectorCard: {
    padding: 6
  },
  upiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1
  },
  upiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  upiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  upiName: {
    fontSize: 13,
    fontWeight: 'bold'
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
  safetyInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginTop: 20,
    borderColor: 'rgba(244, 196, 0, 0.1)',
    backgroundColor: 'rgba(244, 196, 0, 0.01)'
  },
  safetyText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
    opacity: 0.6
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
    maxHeight: '80%'
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
