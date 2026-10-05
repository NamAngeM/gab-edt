import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// URL de l'API : EXPO_PUBLIC_API_URL (fichier .env ou variable de build EAS).
// Par défaut : 10.0.2.2, alias de localhost depuis l'émulateur Android.
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes de timeout
});

// Appelé quand la session ne peut plus être renouvelée (AuthContext repasse alors sur l'écran de connexion)
let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

// Intercepteur pour les requêtes : attache le token JWT s'il existe
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du token JWT', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Un seul renouvellement à la fois, partagé par les requêtes parallèles
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  if (!refreshToken) return null;
  try {
    const res = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, { refreshToken }, { timeout: 10000 });
    const data = res.data?.data;
    if (!data?.token || !data?.refreshToken) return null;
    await SecureStore.setItemAsync('userToken', data.token);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    return data.token;
  } catch {
    return null;
  }
}

// Intercepteur pour les réponses : le jeton d'accès (15 min) est renouvelé automatiquement
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthCall = typeof original?.url === 'string' && original.url.includes('/auth/');
    if (error.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      refreshing = refreshing ?? refreshAccessToken().finally(() => { refreshing = null; });
      const newToken = await refreshing;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('refreshToken');
      onSessionExpired?.();
    }
    return Promise.reject(error);
  }
);
