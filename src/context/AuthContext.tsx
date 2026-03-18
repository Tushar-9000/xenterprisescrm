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
  registerUser: (user: User, password: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authUsers, setAuthUsers] = useState<User[]>([...MOCK_USERS]);
  const [passwords, setPasswords] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    MOCK_USERS.forEach(u => { map[u.id] = u.password || `${u.name}123`; });
    return map;
  });

  const login = useCallback((email: string, password: string) => {
    const found = authUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found && passwords[found.id] === password) {
      setUser(found);
      return true;
    }
    return false;
  }, [authUsers, passwords]);

  const loginAs = useCallback((u: User) => setUser(u), []);
  const logout = useCallback(() => setUser(null), []);

  const updatePassword = useCallback((userId: string, newPassword: string) => {
    setPasswords(prev => ({ ...prev, [userId]: newPassword }));
  }, []);

  const registerUser = useCallback((newUser: User, password: string) => {
    setAuthUsers(prev => {
      if (prev.find(u => u.id === newUser.id)) return prev;
      return [...prev, newUser];
    });
    setPasswords(prev => ({ ...prev, [newUser.id]: password }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, loginAs, logout, isAuthenticated: !!user, passwords, updatePassword, registerUser }}>
      {children}
    </AuthContext.Provider>
  );
};
