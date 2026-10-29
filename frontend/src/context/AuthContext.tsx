import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../lib/api";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  farmerId?: string;
  landSize?: number;
  primaryCrop?: string;
  role: "user" | "farmer" | "admin";
  isVerified: boolean;
  sellerStatus?: "none" | "pending" | "approved" | "rejected";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  otpSent: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: object) => Promise<void>;
  sendOtp: (identifier: string, role?: string) => Promise<any>;
  verifyOtp: (identifier: string, code: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [otpSent, setOtpSent]   = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("ks_token");
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  async function refreshUser() {
    try {
      const data: any = await api.getMe();
      setUser(data.user);
    } catch {
      localStorage.removeItem("ks_token");
      setUser(null);
    }
  }

  async function login(email: string, password: string) {
    const data: any = await api.login({ email, password });
    localStorage.setItem("ks_token", data.token);
    setUser(data.user);
  }

  async function register(formData: object) {
    const data: any = await api.register(formData);
    localStorage.setItem("ks_token", data.token);
    setUser(data.user);
  }

  async function sendOtp(identifier: string, role?: string): Promise<any> {
    const data = await api.sendOtp(identifier, role);
    setOtpSent(true);
    return data; // caller can read devOtp in dev mode
  }

  async function verifyOtp(identifier: string, code: string) {
    const data: any = await api.verifyOtp(identifier, code);
    localStorage.setItem("ks_token", data.token);
    setUser(data.user);
    setOtpSent(false);
  }

  function logout() {
    localStorage.removeItem("ks_token");
    setUser(null);
    setOtpSent(false);
  }

  return (
    <AuthContext.Provider value={{
      user, isLoading, isLoggedIn: !!user, otpSent,
      login, register, sendOtp, verifyOtp, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
