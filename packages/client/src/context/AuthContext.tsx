import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; name: string; role: 'parent' | 'teacher' }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchToStudent: (studentId: string) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  isParent: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(apiClient.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        const result = await apiClient.getMe();
        if (result.success && result.data) {
          setUser(result.data);
        } else {
          apiClient.setToken(null);
          setToken(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const result = await apiClient.login({ email, password });
    if (result.success && result.data) {
      setUser(result.data.user);
      setToken(result.data.token);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const register = async (data: { email: string; password: string; name: string; role: 'parent' | 'teacher' }) => {
    const result = await apiClient.register(data);
    if (result.success && result.data) {
      setUser(result.data.user);
      setToken(result.data.token);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
    setToken(null);
  };

  const switchToStudent = async (studentId: string) => {
    const result = await apiClient.studentLogin(studentId);
    if (result.success && result.data) {
      setUser(result.data.user);
      setToken(result.data.token);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchToStudent,
        isAuthenticated: !!user,
        isParent: user?.role === 'parent',
        isStudent: user?.role === 'student',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}