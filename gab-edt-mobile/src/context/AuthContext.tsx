import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { registerForPushNotificationsAsync } from '../services/NotificationService';

type AuthContextType = {
  userToken: string | null;
  userRole: string | null;
  isLoading: boolean;
  login: (token: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  userRole: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Charger le token au démarrage de l'app
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('userToken');
        const storedRole = await SecureStore.getItemAsync('userRole');
        if (storedToken) {
          setUserToken(storedToken);
          setUserRole(storedRole || 'STUDENT');
        }
      } catch (error) {
        console.error("Erreur de récupération du token", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const login = async (token: string, role: string = 'STUDENT') => {
    try {
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userRole', role);
      setUserToken(token);
      setUserRole(role);

      // Register for Push Notifications
      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          await fetch('http://10.0.2.2:8080/api/v1/users/push-token', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ token: pushToken })
          });
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
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userRole');
      setUserToken(null);
      setUserRole(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du token", error);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, userRole, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
