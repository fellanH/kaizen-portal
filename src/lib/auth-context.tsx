"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api } from "./api";

interface AuthState {
  email: string | null;
  loading: boolean;
  login: (email: string) => Promise<{ ok: boolean; message: string }>;
  verify: (token: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  email: null,
  loading: true,
  login: async () => ({ ok: false, message: "" }),
  verify: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMe()
      .then((user) => {
        setEmail(user.email);
      })
      .catch(() => {
        api.clearToken();
        api.clearDevUserApiKey();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string) => {
    return api.login(email);
  }, []);

  const verify = useCallback(async (token: string) => {
    try {
      const result = await api.verify(token);
      if (result.ok && result.jwt) {
        api.setToken(result.jwt);
        setEmail(result.email);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    api.clearDevUserApiKey();
    setEmail(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ email, loading, login, verify, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
