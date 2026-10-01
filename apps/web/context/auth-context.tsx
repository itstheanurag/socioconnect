"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCurrentUser, getGoogleOAuthUrl, logoutUser, UserProfile } from "@/lib/api-client";
import { useNotification } from "@/context/notification-context";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthenticating: boolean;
  isAuthModalOpen: boolean;
  authError: string | null;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { toast } = useNotification();

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const currentUser = await getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }

      // Check for error in URL params from OAuth redirection
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam =
          urlParams.get("error") ||
          urlParams.get("auth_error") ||
          urlParams.get("error_description");

        if (errorParam && isMounted) {
          const decoded = decodeURIComponent(errorParam);
          setAuthError(decoded);
          toast.error("Authentication Failed", decoded);
          setIsAuthModalOpen(true);
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const openAuthModal = useCallback(() => {
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  }, []);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const oauthUrl = await getGoogleOAuthUrl();
      if (oauthUrl) {
        window.location.href = oauthUrl;
      } else {
        throw new Error("Unable to retrieve Google OAuth endpoint");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to initiate Google authentication";
      setAuthError(message);
      toast.error("Google Sign-In Error", message);
      setIsAuthenticating(false);
    }
  }, [toast]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
      toast.success("Signed Out", "You have been logged out successfully.");
    } catch {
      toast.error("Logout Failed", "An error occurred while signing out.");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAuthenticating,
        isAuthModalOpen,
        authError,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        logout,
        refreshUser,
        clearError,
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
