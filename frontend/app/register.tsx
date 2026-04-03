import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../stores/authStore';
import FinlyButton from '../components/FinlyButton';
import FinlyTextField from '../components/FinlyTextField';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });

  const handleRegister = async () => {
    // Validate
    const newErrors = { name: '', email: '', password: '' };
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password must be at least 6 characters';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (newErrors.name || newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({ name: '', email: '', password: '' });
      await register(name, email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#6C63FF', '#9C63FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logo}>Finly</Text>
          </LinearGradient>
          <Text style={styles.welcome}>Create your account 🚀</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <FinlyTextField
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            error={errors.name}
          />

          <FinlyTextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <FinlyTextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            error={errors.password}
          />

          <FinlyButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginTextBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoGradient: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  logo: {
    ...Typography.displayLarge,
    color: Colors.textPrimary,
  },
  welcome: {
    ...Typography.heading2,
    color: Colors.textPrimary,
  },
  form: {
    marginTop: Spacing.xl,
  },
  registerButton: {
    marginTop: Spacing.md,
  },
  loginLink: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  loginText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  loginTextBold: {
    color: Colors.primary,
    fontWeight: '600',
  },
});