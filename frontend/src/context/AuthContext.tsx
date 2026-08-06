"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { authStorage } from "@/lib/auth";
import type {
  User,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  TokenResponse,
  MessageResponse,
} from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<MessageResponse>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<MessageResponse>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount: if we have a token, fetch the current user
  useEffect(() => {
    const initAuth = async () => {
      if (!authStorage.hasTokens()) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get<User>("/auth/me");
        setUser(res.data);
      } catch {
        authStorage.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await api.post<TokenResponse>("/auth/login", payload);
    authStorage.setTokens(res.data.access_token, res.data.refresh_token);
    setUser(res.data.user);
    if (res.data.user.role === "customer") router.push("/customer");
    else if (res.data.user.role === "provider") router.push("/provider");
    else if (res.data.user.role === "admin") router.push("/admin");
  }, [router]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await api.post<TokenResponse>("/auth/register", payload);
    authStorage.setTokens(res.data.access_token, res.data.refresh_token);
    setUser(res.data.user);
    if (res.data.user.role === "customer") router.push("/customer");
    else if (res.data.user.role === "provider") router.push("/provider");
    else if (res.data.user.role === "admin") router.push("/admin");
  }, [router]);

  const logout = useCallback(() => {
    authStorage.clearTokens();
    setUser(null);
    router.push("/login");
  }, [router]);

  const forgotPassword = useCallback(async (payload: ForgotPasswordPayload) => {
    const res = await api.post<MessageResponse>("/auth/forgot-password", payload);
    return res.data;
  }, []);

  const resetPassword = useCallback(async (payload: ResetPasswordPayload) => {
    const res = await api.post<MessageResponse>("/auth/reset-password", payload);
    return res.data;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
