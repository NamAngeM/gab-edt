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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

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
          {/* Logo Badge */}
          <View style={styles.logoBadgeContainer}>
            <View style={styles.logoBadgeInner}>
              <View style={styles.gabonFlagPill}>
                <View style={[styles.flagStripe, { backgroundColor: '#009e60' }]} />
                <View style={[styles.flagStripe, { backgroundColor: '#fcd116' }]} />
                <View style={[styles.flagStripe, { backgroundColor: '#3a75c4' }]} />
              </View>
              <Text style={styles.logoTextG}>G</Text>
              <Text style={styles.logoTextSub}>LMBA</Text>
            </View>
          </View>

          <Text style={styles.title}>Lycée National Léon Mba</Text>
          <Text style={styles.subtitle}>Espace Numérique de Travail • <Text style={{ color: '#1d4ed8', fontWeight: 'bold' }}>GAB-EDT</Text></Text>
          
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

        {/* Login Card */}
        <View style={styles.loginCard}>
          <View style={styles.cardFlagBorder}>
            <View style={[styles.flagStripe, { backgroundColor: '#009e60' }]} />
            <View style={[styles.flagStripe, { backgroundColor: '#fcd116' }]} />
            <View style={[styles.flagStripe, { backgroundColor: '#fcd116' }]} />
            <View style={[styles.flagStripe, { backgroundColor: '#3a75c4' }]} />
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
              <Feather name="user" size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={role === 'TEACHER' ? 'Ex : PROF-2024-...' : 'Ex : LMBA-2024-8942'}
                placeholderTextColor="#94a3b8"
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
              <Feather name="lock" size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Feather name={showPassword ? "eye" : "eye-off"} size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.rememberMeContainer} onPress={() => setRememberMe(!rememberMe)}>
            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
              {rememberMe && <Feather name="check" size={12} color="#fff" />}
            </View>
            <Text style={styles.rememberMeText}>Mémoriser cet appareil</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginButton, (!matricule || !password) && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={!matricule || !password || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Se connecter à mon espace</Text>
                <Feather name="arrow-right" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU ACCÈS RAPIDE</Text>
          </View>

          <TouchableOpacity style={styles.biometryButton}>
            <MaterialCommunityIcons name="face-recognition" size={20} color="#2563eb" />
            <Text style={styles.biometryText}>Biométrie</Text>
          </TouchableOpacity>
        </View>


        <View style={styles.footer}>
          <View style={styles.footerFlagPill}>
            <View style={[styles.flagStripe, { backgroundColor: '#009e60' }]} />
            <View style={[styles.flagStripe, { backgroundColor: '#fcd116' }]} />
            <View style={[styles.flagStripe, { backgroundColor: '#3a75c4' }]} />
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
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#2563eb', // gradient representation
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#2563eb',
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
    color: '#fff',
    marginTop: 6,
  },
  logoTextSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#bfdbfe',
    marginTop: -2,
    letterSpacing: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  trustBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#475569',
  },
  roleSelectorContainer: {
    marginBottom: 16,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
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
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleBtnText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
  },
  roleBtnTextActive: {
    fontWeight: '700',
    color: '#1d4ed8',
  },
  loginCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
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
    color: '#0f172a',
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
    color: '#1d4ed8',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
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
    color: '#334155',
  },
  labelHint: {
    fontSize: 10,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    color: '#0f172a',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563eb',
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
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  rememberMeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
  },
  loginButton: {
    backgroundColor: '#2563eb',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
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
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    position: 'absolute',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 1,
  },
  biometryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    height: 44,
  },
  biometryText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
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
    color: '#334155',
    marginBottom: 2,
  },
  footerSubText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  versionText: {
    fontSize: 10,
    color: '#94a3b8',
  }
});
