
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import api from '../lib/api';

interface User {
  userId: string;
  email: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'nexora_access_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Validate an existing session when the application loads.
  useEffect(() => {
    const handleSessionExpired = () => setUser(null);
    window.addEventListener('nexora:session-expired', handleSessionExpired);

    const validateSession = async () => {
      const token = sessionStorage.getItem(TOKEN_KEY);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<User>('/auth/me');
        setUser(response.data);
      } catch {
        sessionStorage.removeItem(TOKEN_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
    return () => window.removeEventListener('nexora:session-expired', handleSessionExpired);
  }, []);

  // Log in and retrieve the authenticated user.
  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<{ access_token: string }>('/auth/login', {
      email,
      password,
    });

    const token = response.data.access_token;

    sessionStorage.setItem(TOKEN_KEY, token);

    try {
      const userResponse = await api.get<User>('/auth/me');
      setUser(userResponse.data);
    } catch (error) {
      sessionStorage.removeItem(TOKEN_KEY);
      setUser(null);
      throw error;
    }
  }, []);

  // Register a new account. Registration does not automatically log in.
  const register = useCallback(async (data: RegisterData) => {
    await api.post('/auth/register', data);
  }, []);

  // Clear the current session.
  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Access authentication state and functions from any component.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
}
