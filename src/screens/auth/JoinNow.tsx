import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/GlassCard';
import * as Icons from 'lucide-react-native';

const { height } = Dimensions.get('window');

type JoinNowScreenProp = StackNavigationProp<AuthStackParamList, 'JoinNow'>;

type Role = 'customer' | 'delivery' | 'vendor';

export default function JoinNow() {
  const navigation = useNavigation<JoinNowScreenProp>();
  const register = useAuthStore((state) => state.register);

  const [role, setRole] = useState<Role>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || (role === 'vendor' && !businessName)) {
      setError('Please fill in all details.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      register({ name, email, businessName }, role, (user) => {
        setLoading(false);
        console.log('[Register Successful]:', user);
      });
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icons.ChevronLeft color="#FFF" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tab Role Switcher */}
        <View style={styles.roleTabs}>
          {(['customer', 'delivery', 'vendor'] as Role[]).map((tabRole) => {
            const active = role === tabRole;
            const label = tabRole.charAt(0).toUpperCase() + tabRole.slice(1);
            return (
              <TouchableOpacity
                key={tabRole}
                style={[styles.tabButton, active ? styles.activeTab : null]}
                activeOpacity={0.8}
                onPress={() => setRole(tabRole)}
              >
                <Text style={[styles.tabText, active ? styles.activeTabText : null]}>
                  {label === 'Delivery' ? 'Partner' : label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Register Box */}
        <GlassCard 
          style={styles.registerCard}
          backgroundColor="rgba(13, 22, 54, 0.65)"
          borderColor="rgba(255, 255, 255, 0.05)"
        >
          <Text style={styles.cardHeader}>Register</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Full Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <View style={styles.inputWrapper}>
              <Icons.User color="rgba(255, 255, 255, 0.65)" size={16} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="enter your full name"
                placeholderTextColor="rgba(255, 255, 255, 0.45)"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Business Name (Vendor Only) */}
          {role === 'vendor' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>BUSINESS / SHOP NAME</Text>
              <View style={styles.inputWrapper}>
                <Icons.Store color="rgba(255, 255, 255, 0.65)" size={16} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="enter business name"
                  placeholderTextColor="rgba(255, 255, 255, 0.45)"
                  value={businessName}
                  onChangeText={setBusinessName}
                />
              </View>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <Icons.Mail color="rgba(255, 255, 255, 0.65)" size={16} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="enter your email"
                placeholderTextColor="rgba(255, 255, 255, 0.45)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Icons.Lock color="rgba(255, 255, 255, 0.65)" size={16} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="choose password"
                placeholderTextColor="rgba(255, 255, 255, 0.45)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.registerButton} activeOpacity={0.8} onPress={handleRegister} disabled={loading}>
            <Text style={styles.registerButtonText}>{loading ? 'Creating account...' : 'Create Connect Account'}</Text>
          </TouchableOpacity>

          {/* Join Now Prompt */}
          <View style={styles.promptRow}>
            <Text style={styles.promptText}>Already registered?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.promptLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B1E',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.05,
    paddingBottom: 24,
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
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#F4C400',
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.55)',
  },
  activeTabText: {
    color: '#050B1E',
  },
  registerCard: {
    padding: 24,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#030714',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFF',
  },
  registerButton: {
    backgroundColor: '#F4C400',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#F4C400',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#050B1E',
  },
  promptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  promptText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  promptLink: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F4C400',
  },
});
