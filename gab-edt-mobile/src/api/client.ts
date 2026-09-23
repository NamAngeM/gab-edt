import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// L'URL de base dépend de l'environnement d'exécution (émulateur Android, iOS, ou appareil physique)
// 10.0.2.2 est l'alias spécial pour localhost sur l'émulateur Android.
// Pour tester sur un vrai téléphone, remplacez par l'adresse IP locale de votre ordinateur (ex: 192.168.1.XX)
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes de timeout
});

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

// Intercepteur pour les réponses : gère les erreurs globalement
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Gestion de l'expiration du token ou de la non-autorisation
    if (error.response && error.response.status === 401) {
      console.warn("Session expirée ou non autorisée. Vous devriez être déconnecté.");
      // L'idéal serait d'émettre un événement ici ou d'utiliser un callback 
      // pour appeler logout() de AuthContext, mais nous gérons le comportement de 
      // base pour l'instant.
      await SecureStore.deleteItemAsync('userToken');
      // Force le rechargement de l'app ou la redirection vers le login (à affiner selon l'architecture React Navigation)
    }
    
    return Promise.reject(error);
  }
);
