import React, { createContext, useContext, useState } from 'react';
import type { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isCustomer: boolean;
  isProfessional: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('fixora_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('fixora_token') || null;
  });

  const login = (authData: AuthResponse) => {
    setUser(authData.user);
    setToken(authData.token);
    localStorage.setItem('fixora_user', JSON.stringify(authData.user));
    localStorage.setItem('fixora_token', authData.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fixora_user');
    localStorage.removeItem('fixora_token');
  };

  const isAuthenticated = !!user && !!token;
  const isCustomer = user?.role === 'CUSTOMER';
  const isProfessional = user?.role === 'PROFESSIONAL';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isCustomer,
        isProfessional,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
