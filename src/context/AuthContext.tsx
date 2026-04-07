import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@/types/crm';
import { db as supabase } from '@/integrations/supabase/db';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
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

const mapDbUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  username: row.username || undefined,
  email: row.email,
  phone: row.phone || undefined,
  dob: row.dob || undefined,
  address: row.address || undefined,
  profilePic: row.profile_pic || undefined,
  password: row.password || undefined,
  role: row.role,
  avatar: row.avatar || undefined,
  joiningDate: row.joining_date || undefined,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [passwords, setPasswords] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadPasswords = async () => {
      const { data } = await supabase.from('users').select('id, password');
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((u: any) => { map[u.id] = u.password || ''; });
        setPasswords(map);
      }
    };
    loadPasswords();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .single();
    if (data && data.password === password) {
      setUser(mapDbUser(data));
      return true;
    }
    return false;
  }, []);

  const loginAs = useCallback((u: User) => setUser(u), []);
  const logout = useCallback(() => setUser(null), []);

  const updatePassword = useCallback(async (userId: string, newPassword: string) => {
    await supabase.from('users').update({ password: newPassword }).eq('id', userId);
    setPasswords(prev => ({ ...prev, [userId]: newPassword }));
  }, []);

  const registerUser = useCallback(async (newUser: User, password: string) => {
    await supabase.from('users').upsert({
      id: newUser.id,
      name: newUser.name,
      username: newUser.username || null,
      email: newUser.email,
      phone: newUser.phone || null,
      dob: newUser.dob || null,
      address: newUser.address || null,
      profile_pic: newUser.profilePic || null,
      password: password,
      role: newUser.role,
      avatar: newUser.avatar || null,
      joining_date: newUser.joiningDate || null,
    });
    setPasswords(prev => ({ ...prev, [newUser.id]: password }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, loginAs, logout, isAuthenticated: !!user, passwords, updatePassword, registerUser }}>
      {children}
    </AuthContext.Provider>
  );
};
