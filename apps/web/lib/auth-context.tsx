"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useAuthStore, type AuthState } from "./stores/auth.store";
import type { AuthUserDto } from "@repo/contracts";

export type AuthUser = AuthUserDto;

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authStore = useAuthStore();

  useEffect(() => {
    void authStore.initializeAuth();
  }, [authStore.initializeAuth]);

  return <AuthContext.Provider value={authStore}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return useAuthStore();
  }
  return context;
}
