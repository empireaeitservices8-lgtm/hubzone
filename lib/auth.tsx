"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { api, clearToken, getStoredUser, getToken, setStoredUser, setToken } from "./api";
import { toast } from "sonner";

export type User = {
  id: number;
  username: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
  role: "user" | "admin";
  created_at?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; user: User; message?: string }>;
  register: (data: { name: string; email: string; password: string; phone: string; address?: string; city?: string; state?: string; pin?: string }) => Promise<{ success: boolean; user: User; message?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User> & { currentPassword?: string; newPassword?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setUser(null);
      setTokenState(null);
      setLoading(false);
      return;
    }

    try {
      setTokenState(currentToken);
      const res = await api.auth.getProfile();
      if (res.user) {
        setUser(res.user);
        setStoredUser(res.user);
      } else {
        clearToken();
        setUser(null);
        setTokenState(null);
      }
    } catch {
      // If token expired or invalid, clear bad credentials so user is not trapped in an expired state
      clearToken();
      setUser(null);
      setTokenState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleExpired = (e: Event) => {
      clearToken();
      setUser(null);
      setTokenState(null);
      const customMsg = (e as CustomEvent)?.detail;
      toast.error(customMsg || "Your session has expired. Please sign in again.");
    };

    window.addEventListener("hubzone_session_expired", handleExpired);
    return () => window.removeEventListener("hubzone_session_expired", handleExpired);
  }, []);

  useEffect(() => {
    // Initial mount check
    const cached = getStoredUser();
    const curToken = getToken();
    if (cached && curToken) {
      setUser(cached);
      setTokenState(curToken);
    }
    refreshProfile();
  }, [refreshProfile]);

  const login = async (identifier: string, pass: string) => {
    const res = await api.auth.login(identifier, pass);
    if (res.success && res.token) {
      setToken(res.token);
      setStoredUser(res.user);
      setUser(res.user);
      setTokenState(res.token);
      return { success: true, user: res.user, message: res.message };
    }
    throw new Error(res.message || "Login failed");
  };

  const register = async (data: { name: string; email: string; password: string; phone: string; address?: string; city?: string; state?: string; pin?: string }) => {
    const res = await api.auth.register(data);
    if (res.success && res.token) {
      setToken(res.token);
      setStoredUser(res.user);
      setUser(res.user);
      setTokenState(res.token);
      return { success: true, user: res.user, message: res.message };
    }
    throw new Error(res.message || "Registration failed");
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setTokenState(null);
    toast.info("You have signed out.");
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const updateProfile = async (data: Partial<User> & { currentPassword?: string; newPassword?: string }) => {
    const res = await api.auth.updateProfile(data);
    if (res.success && res.user) {
      setUser(res.user);
      setStoredUser(res.user);
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

