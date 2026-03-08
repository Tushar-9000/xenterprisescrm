import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, MOCK_USERS } from '@/types/crm';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  loginAs: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  passwords: Record<string, string>;
  updatePassword: (userId: string, newPassword: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [passwords, setPasswords] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    MOCK_USERS.forEach(u => { map[u.id] = u.password || `${u.name}123`; });
    return map;
  });

  const login = useCallback((email: string, password: string) => {
    const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found && passwords[found.id] === password) {
      setUser(found);
      return true;
    }
    return false;
  }, [passwords]);

  const loginAs = useCallback((u: User) => setUser(u), []);
  const logout = useCallback(() => setUser(null), []);

  const updatePassword = useCallback((userId: string, newPassword: string) => {
    setPasswords(prev => ({ ...prev, [userId]: newPassword }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, loginAs, logout, isAuthenticated: !!user, passwords, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
