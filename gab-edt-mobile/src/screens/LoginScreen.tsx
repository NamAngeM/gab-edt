import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { COLORS } from '../theme/colors';
import { FONTS } from '../theme/fonts';

export const LoginScreen = () => {
  const { login } = useAuth();

  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'STUDENT' | 'PARENT' | 'TEACHER'>('STUDENT');

  const handleLogin = async () => {
    if (!matricule || !password) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/api/v1/auth/login', {
        email: matricule,
        password: password
      });

      const data = response.data?.data || response.data;
      const token = data?.token;
      const backendRole = data?.role || role;
      const refreshToken = data?.refreshToken;
      const user = data?.firstName ? { firstName: data.firstName, lastName: data.lastName || '', email: data.email || matricule, institutionName: data.institutionName } : undefined;

      if (token) {
        await login(token, backendRole, refreshToken, user);
      } else {
        Alert.alert('Erreur', 'Token manquant dans la réponse du serveur.');
      }
    } catch (error: any) {
      console.error('Erreur de connexion', error);
      const message = error.response?.data?.message || 'Identifiants incorrects ou erreur réseau.';
      Alert.alert('Erreur de connexion', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoBadgeContainer}>
            <View style={styles.logoBadgeInner}>
              <View style={styles.gabonFlagPill}>
                <View style={[styles.flagStripe, { backgroundColor: COLORS.gabonGreen }]} />
                <View style={[styles.flagStripe, { backgroundColor: COLORS.gabonYellow }]} />
                <View style={[styles.flagStripe, { backgroundColor: COLORS.gabonBlue }]} />
              </View>
              <Text style={styles.logoTextG}>G</Text>
              <Text style={styles.logoTextSub}>LMBA</Text>
            </View>
          </View>

          <Text style={styles.title}>Lycée National Léon Mba</Text>
          <Text style={styles.subtitle}>Espace Numérique de Travail • <Text style={{ color: COLORS.brand600, fontFamily: FONTS.bold }}>GAB-EDT</Text></Text>

          <View style={styles.trustBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.trustBadgeText}>Portail Sécurisé • Année 2026–2027</Text>
          </View>
        </View>

        <View style={styles.roleSelectorContainer}>
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'STUDENT' && styles.roleBtnActive]}
              onPress={() => setRole('STUDENT')}
            >
              <Text style={[styles.roleBtnText, role === 'STUDENT' && styles.roleBtnTextActive]}>Élève / Étudiant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'PARENT' && styles.roleBtnActive]}
              onPress={() => setRole('PARENT')}
            >
              <Text style={[styles.roleBtnText, role === 'PARENT' && styles.roleBtnTextActive]}>Parent / Tuteur</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, role === 'TEACHER' && styles.roleBtnActive]}
              onPress={() => setRole('TEACHER')}
            >
              <Text style={[styles.roleBtnText, role === 'TEACHER' && styles.roleBtnTextActive]}>Enseignant</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.loginCard}>
          <View style={styles.cardFlagBorder}>
            <View style={[styles.flagStripe, { backgroundColor: COLORS.gabonGreen }]} />
            <View style={[styles.flagStripe, { backgroundColor: COLORS.gabonYellow }]} />
            <View style={[styles.flagStripe, { backgroundColor: COLORS.gabonYellow }]} />
            <View style={[styles.flagStripe, { backgroundColor: COLORS.gabonBlue }]} />
          </View>

          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Authentification</Text>
            <View style={styles.portailBadge}>
              <Text style={styles.portailBadgeText}>Portail Scolaire</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitle}>Accédez à vos plannings, notes et services</Text>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{role === 'TEACHER' ? 'Identifiant Enseignant' : 'Matricule Élève / Parent'}</Text>
              <Text style={styles.labelHint}>Format : LMBA-XXXX</Text>
            </View>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={18} color={COLORS.slate400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={role === 'TEACHER' ? 'Ex : PROF-2024-...' : 'Ex : LMBA-2024-8942'}
                placeholderTextColor={COLORS.slate400}
                value={matricule}
                onChangeText={setMatricule}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Mot de passe</Text>
              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={18} color={COLORS.slate400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor={COLORS.slate400}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={18} color={COLORS.slate400} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.rememberMeContainer} onPress={() => setRememberMe(!rememberMe)}>
            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
              {rememberMe && <MaterialIcons name="check" size={12} color={COLORS.white} />}
            </View>
            <Text style={styles.rememberMeText}>Mémoriser cet appareil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, (!matricule || !password) && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={!matricule || !password || loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Se connecter à mon espace</Text>
                <MaterialIcons name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU ACCÈS RAPIDE</Text>
          </View>

          <TouchableOpacity style={styles.biometryButton}>
            <MaterialIcons name="face" size={20} color={COLORS.brand500} />
            <Text style={styles.biometryText}>Biométrie</Text>
          </TouchableOpacity>
        </View>


        <View style={styles.footer}>
          <View style={styles.footerFlagPill}>
            <View style={[styles.flagStripe, { backgroundColor: COLORS.gabonGreen }]} />
            <View style={[styles.flagStripe, { backgroundColor: COLORS.gabonYellow }]} />
            <View style={[styles.flagStripe, { backgroundColor: COLORS.gabonBlue }]} />
          </View>
          <Text style={styles.footerText}>Ministère de l'Éducation Nationale</Text>
          <Text style={styles.footerSubText}>RÉPUBLIQUE GABONAISE • UNION - TRAVAIL - JUSTICE</Text>
          <Text style={styles.versionText}>GAB-EDT v2.4.0 • Chiffrement SSL 256-bit</Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoBadgeContainer: {
    padding: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 20,
    marginBottom: 12,
  },
  logoBadgeInner: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.brand500,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: COLORS.brand500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gabonFlagPill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    flexDirection: 'row',
  },
  flagStripe: {
    flex: 1,
    height: '100%',
  },
  logoTextG: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.white,
    marginTop: 6,
  },
  logoTextSub: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: '#bfdbfe',
    marginTop: -2,
    letterSpacing: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.slate900,
    marginBottom: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    color: COLORS.slate500,
    textAlign: 'center',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
    shadowColor: COLORS.slate900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  trustBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: FONTS.medium,
    color: COLORS.slate600,
  },
  roleSelectorContainer: {
    marginBottom: 16,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.slate200,
    borderRadius: 12,
    padding: 3,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  roleBtnActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleBtnText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: FONTS.medium,
    color: COLORS.slate600,
  },
  roleBtnTextActive: {
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.brand600,
  },
  loginCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    shadowColor: COLORS.slate900,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardFlagBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    flexDirection: 'row',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.slate900,
  },
  portailBadge: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  portailBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.brand600,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.slate500,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    color: COLORS.slate700,
  },
  labelHint: {
    fontSize: 10,
    color: COLORS.slate500,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.slate900,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    color: COLORS.brand500,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.slate300,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: COLORS.brand500,
    borderColor: COLORS.brand500,
  },
  rememberMeText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: FONTS.medium,
    color: COLORS.slate700,
  },
  loginButton: {
    backgroundColor: COLORS.brand500,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.brand500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.slate400,
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.slate200,
  },
  dividerText: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    fontSize: 10,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    color: COLORS.slate500,
    letterSpacing: 1,
  },
  biometryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    borderRadius: 12,
    height: 44,
  },
  biometryText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    color: COLORS.slate700,
  },

  footer: {
    alignItems: 'center',
  },
  footerFlagPill: {
    flexDirection: 'row',
    width: 36,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.slate700,
    marginBottom: 2,
  },
  footerSubText: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: FONTS.semiBold,
    color: COLORS.slate500,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  versionText: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    color: COLORS.slate400,
  }
});
