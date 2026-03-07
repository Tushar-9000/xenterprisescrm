import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, MOCK_USERS } from '@/types/crm';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  loginAs: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, _password: string) => {
    const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  }, []);

  const loginAs = useCallback((u: User) => setUser(u), []);
  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, login, loginAs, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
