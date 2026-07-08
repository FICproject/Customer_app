import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/GlassCard';
import * as Icons from 'lucide-react-native';

const { height } = Dimensions.get('window');

type LoginScreenProp = StackNavigationProp<AuthStackParamList, 'Login'>;

type Role = 'customer' | 'delivery' | 'vendor';

export default function Login() {
  const navigation = useNavigation<LoginScreenProp>();
  const login = useAuthStore((state) => state.login);

  const [role, setRole] = useState<Role>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate/perform login request
      login(email, role, (user) => {
        setLoading(false);
        console.log('[Login Successful]:', user);
      });
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Logo and Intro */}
        <View style={styles.introSection}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../../assets/images/forge_india_logo.jpg')}
              style={styles.logoCircleImage}
            />
          </View>
          <Text style={styles.title}>Connect App</Text>
          <Text style={styles.subtitle}>Enter your details to access your dashboard</Text>
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

        {/* Login Box */}
        <GlassCard 
          style={styles.loginCard}
          backgroundColor="rgba(13, 22, 54, 0.65)"
          borderColor="rgba(255, 255, 255, 0.05)"
        >
          <Text style={styles.cardHeader}>Sign In</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
                placeholder="enter password"
                placeholderTextColor="rgba(255, 255, 255, 0.45)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} activeOpacity={0.8} onPress={handleLogin} disabled={loading}>
            <Text style={styles.loginButtonText}>{loading ? 'Verifying...' : 'Access Dashboard'}</Text>
          </TouchableOpacity>

          {/* Join Now Prompt */}
          <View style={styles.promptRow}>
            <Text style={styles.promptText}>New to Connect App?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('JoinNow')}>
              <Text style={styles.promptLink}> Join Now</Text>
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
    paddingTop: height * 0.08,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  introSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#F4C400',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    shadowColor: '#F4C400',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  logoCircleImage: {
    width: 57,
    height: 57,
    borderRadius: 28.5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'black',
    color: '#FFF',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 4,
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
  loginCard: {
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
  loginButton: {
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
  loginButtonText: {
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
