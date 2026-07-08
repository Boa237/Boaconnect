import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  requestOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (phoneNumber: string, code: string) => Promise<{ isNewUser: boolean; isProfileComplete: boolean }>;
  completeProfile: (fullName: string, city: string, neighborhood: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        try {
          await refreshMe();
        } catch {
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const requestOtp = async (phoneNumber: string) => {
    await api.post('/auth/request-otp', { phoneNumber });
  };

  const verifyOtp = async (phoneNumber: string, code: string) => {
    const { data } = await api.post('/auth/verify-otp', { phoneNumber, code });
    const { accessToken, refreshToken, user: apiUser, isNewUser, isProfileComplete } = data.data;
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    setUser(apiUser);
    return { isNewUser, isProfileComplete };
  };

  const completeProfile = async (fullName: string, city: string, neighborhood: string) => {
    const { data } = await api.patch('/auth/complete-profile', { fullName, city, neighborhood });
    setUser(data.data);
  };

  const refreshMe = async () => {
    const { data } = await api.get('/users/me');
    setUser(data.data);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, requestOtp, verifyOtp, completeProfile, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>');
  return ctx;
}
