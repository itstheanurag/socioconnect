"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient, type ApiUser } from "./api-client";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  avatar: string | null;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (redirectTo?: string) => void;
  closeAuthModal: () => void;
  loginWithGoogle: (redirectTo?: string) => Promise<void>;
  loginWithDemo: (mockUser?: Partial<AuthUser>) => void;
  mockLogin: (mockUser?: Partial<AuthUser>) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function setCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match && match[3] ? decodeURIComponent(match[3]) : null;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalRedirect, setModalRedirect] = useState("/app");
  const router = useRouter();

  // Refresh profile from /v1/auth/me
  const refreshProfile = useCallback(async () => {
    try {
      const apiUser: ApiUser = await apiClient.auth.getMe();
      if (apiUser) {
        const mappedUser: AuthUser = {
          id: apiUser.id,
          email: apiUser.email,
          firstName: apiUser.firstName || "Creator",
          lastName: apiUser.lastName,
          avatar: apiUser.avatar,
          role: apiUser.role || "USER",
        };
        setUser(mappedUser);
        setCookie("socioconnect_user", JSON.stringify(mappedUser));
      }
    } catch {
      // User not authenticated with backend
    }
  }, []);

  // Check authentication status on mount
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Check if user cookie exists
      const savedUser = getCookie("socioconnect_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as AuthUser;
          setUser(parsed);
        } catch {
          removeCookie("socioconnect_user");
        }
      }

      // 2. Attempt fetching fresh profile if token exists
      const token = getCookie("access_token");
      if (token) {
        await refreshProfile();
      }
    } finally {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  // Check if URL has ?auth=login parameter on load to auto-open modal
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("auth") === "login") {
        const next = urlParams.get("next") || "/app";
        setModalRedirect(next);
        setIsAuthModalOpen(true);
      }
    }
  }, []);

  const openAuthModal = (redirectTo = "/app") => {
    setModalRedirect(redirectTo);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    if (typeof window !== "undefined" && window.location.search.includes("auth=login")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      url.searchParams.delete("next");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  };

  const loginWithGoogle = async (redirectTo = modalRedirect) => {
    setIsLoading(true);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("auth_redirect", redirectTo);
      }

      const authUrl = await apiClient.auth.getOAuthUrl("google", "false");
      if (authUrl) {
        window.location.href = authUrl;
        return;
      }

      // Fallback
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/oauth/google?redirect=true`;
    } catch {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/oauth/google?redirect=true`;
    } finally {
      setIsLoading(false);
    }
  };

  const mockLogin = (mockUserData?: Partial<AuthUser>) => {
    const defaultUser: AuthUser = {
      id: "usr_creator_01",
      email: "maya.rao@socioconnect.app",
      firstName: "maya",
      lastName: "rao",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      role: "CREATOR",
      ...mockUserData,
    };

    setUser(defaultUser);
    setCookie("socioconnect_user", JSON.stringify(defaultUser));
    setCookie("access_token", "mock_access_token_demo", 30);
    closeAuthModal();

    const redirectTarget =
      (typeof window !== "undefined" && sessionStorage.getItem("auth_redirect")) ||
      modalRedirect ||
      "/app";
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("auth_redirect");
    }
    router.push(redirectTarget);
  };

  const logout = async () => {
    try {
      await apiClient.auth.logout();
    } catch {
      // Ignored
    } finally {
      removeCookie("access_token");
      removeCookie("socioconnect_user");
      removeCookie("socioconnect_ticket");
      setUser(null);
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        loginWithDemo: mockLogin,
        mockLogin,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
