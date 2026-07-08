import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AppNavigator';
import GlassCard from '../components/GlassCard';
import * as Icons from 'lucide-react-native';

const { height } = Dimensions.get('window');

type LanguageSelectionProp = StackNavigationProp<AuthStackParamList, 'LanguageSelection'>;

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', active: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', active: false },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', active: false },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', active: false },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', active: false },
];

export default function LanguageSelection() {
  const navigation = useNavigation<LanguageSelectionProp>();
  const [selected, setSelected] = useState('en');

  const handleSelectLanguage = (code: string) => {
    setSelected(code);
    // Auto-advance to Permissions
    setTimeout(() => {
      navigation.navigate('Permissions');
    }, 300);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icons.ChevronLeft color="#FFF" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Language</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introBox}>
          <Text style={styles.title}>Choose your language</Text>
          <Text style={styles.subtitle}>Select your preferred interface language. You can adjust this anytime in your passport settings.</Text>
        </View>

        {/* List */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>SUPPORTED LANGUAGES</Text>
          {LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <TouchableOpacity key={lang.code} activeOpacity={0.9} onPress={() => handleSelectLanguage(lang.code)}>
                <GlassCard
                  style={styles.langCard}
                  borderColor={isSelected ? 'rgba(244, 196, 0, 0.4)' : 'rgba(255, 255, 255, 0.08)'}
                  backgroundColor={isSelected ? 'rgba(244, 196, 0, 0.03)' : 'rgba(255, 255, 255, 0.02)'}
                >
                  <View style={styles.cardRow}>
                    <Text style={styles.flagText}>{lang.flag}</Text>
                    <View style={styles.textDetails}>
                      <Text style={[styles.langName, isSelected ? { color: '#F4C400' } : null]}>{lang.name}</Text>
                      <Text style={styles.nativeName}>{lang.nativeName}</Text>
                    </View>
                    {isSelected ? (
                      <Icons.Check color="#F4C400" size={18} />
                    ) : (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.05,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  introBox: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.55)',
    lineHeight: 18,
  },
  listContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  langCard: {
    marginBottom: 12,
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flagText: {
    fontSize: 22,
  },
  textDetails: {
    flex: 1,
    marginLeft: 16,
  },
  langName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  nativeName: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 2,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
