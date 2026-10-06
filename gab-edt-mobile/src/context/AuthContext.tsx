import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { registerForPushNotificationsAsync } from '../services/NotificationService';
import { apiClient, setSessionExpiredHandler } from '../api/client';

type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  institutionName?: string;
};

type AuthContextType = {
  userToken: string | null;
  userRole: string | null;
  userData: UserData | null;
  isLoading: boolean;
  login: (token: string, role?: string, refreshToken?: string, userData?: UserData) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  userRole: null,
  userData: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Charger le token au démarrage de l'app
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('userToken');
        const storedRole = await SecureStore.getItemAsync('userRole');
        const storedUserData = await SecureStore.getItemAsync('userData');
        if (storedToken) {
          setUserToken(storedToken);
          setUserRole(storedRole || 'STUDENT');
          if (storedUserData) {
            try { setUserData(JSON.parse(storedUserData)); } catch {}
          }
        }
      } catch (error) {
        console.error("Erreur de récupération du token", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  // Session non renouvelable (refresh token expiré ou révoqué) : retour à l'écran de connexion
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUserToken(null);
      setUserRole(null);
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  const login = async (token: string, role: string = 'STUDENT', refreshToken?: string, user?: UserData) => {
    try {
      await SecureStore.setItemAsync('userToken', token);
      if (refreshToken) {
        await SecureStore.setItemAsync('refreshToken', refreshToken);
      }
      await SecureStore.setItemAsync('userRole', role);
      if (user) {
        await SecureStore.setItemAsync('userData', JSON.stringify(user));
        setUserData(user);
      }
      setUserToken(token);
      setUserRole(role);

      // Register for Push Notifications
      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          await apiClient.put('/api/v1/users/push-token', { token: pushToken });
        }
      } catch (err) {
        console.log('Push token registration error:', err);
      }

    } catch (error) {
      console.error("Erreur lors de la sauvegarde du token", error);
    }
  };

  const logout = async () => {
    try {
      // Révoque le refresh token côté serveur (ignore les erreurs réseau)
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        await apiClient.post('/api/v1/auth/logout', { refreshToken }).catch(() => undefined);
      }
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userRole');
      await SecureStore.deleteItemAsync('userData');
      setUserToken(null);
      setUserRole(null);
      setUserData(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du token", error);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, userRole, userData, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
