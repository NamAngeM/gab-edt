import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  ActivityIndicator
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export const LoginScreen = () => {
  const { login } = useAuth();
  
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    // Basic validation
    if (!matricule || !password) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Simulate successful login with a mock token
      login('mock-jwt-token-12345');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <View style={styles.logoSquare}>
          <Text style={styles.logoText}>G</Text>
        </View>
        <Text style={styles.title}>Lycée National Léon Mba</Text>
        <Text style={styles.subtitle}>Espace Numérique de Travail</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Matricule Élève / Parent</Text>
          <View style={styles.inputWrapper}>
            <Feather name="user" size={20} color={COLORS.outline} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: LMBA-2024-..."
              placeholderTextColor={COLORS.outlineVariant}
              value={matricule}
              onChangeText={setMatricule}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.inputWrapper}>
            <Feather name="lock" size={20} color={COLORS.outline} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Votre mot de passe"
              placeholderTextColor={COLORS.outlineVariant}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={COLORS.outline} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.loginButton, (!matricule || !password) && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={!matricule || !password || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.loginButtonText}>Se Connecter</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <View style={styles.gabonBadge}>
          <View style={[styles.gabonStripe, { backgroundColor: COLORS.gabonGreen }]} />
          <View style={[styles.gabonStripe, { backgroundColor: COLORS.gabonYellow }]} />
          <View style={[styles.gabonStripe, { backgroundColor: COLORS.gabonBlue }]} />
        </View>
        <Text style={styles.footerText}>Ministère de l'Éducation Nationale</Text>
        <Text style={styles.footerSubText}>République Gabonaise</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 40,
  },
  logoSquare: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.onSurface,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.outlineVariant,
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  gabonBadge: {
    flexDirection: 'row',
    width: 30,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  gabonStripe: {
    flex: 1,
    height: '100%',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  footerSubText: {
    fontSize: 10,
    color: COLORS.outline,
    marginTop: 2,
  }
});
