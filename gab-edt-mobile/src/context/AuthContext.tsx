import React, { createContext, useState, useContext } from 'react';

type AuthContextType = {
  userToken: string | null;
  login: (token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);

  const login = (token: string) => {
    // Dans le futur, on sauvegardera le token avec expo-secure-store ici
    setUserToken(token);
  };

  const logout = () => {
    // Et on le supprimera ici
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
