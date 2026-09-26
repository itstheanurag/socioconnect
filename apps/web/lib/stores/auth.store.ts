import { create } from "zustand";
import { apiClient } from "../api-client";
import type { AuthUserDto } from "@repo/contracts";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match && match[3] ? decodeURIComponent(match[3]) : null;
}

function setCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export interface AuthState {
  user: AuthUserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  modalRedirect: string;

  // Actions
  setUser: (user: AuthUserDto | null) => void;
  openAuthModal: (redirectTo?: string) => void;
  closeAuthModal: () => void;
  initializeAuth: () => Promise<void>;
  loginWithGoogle: (redirectTo?: string) => Promise<void>;
  loginWithDemo: (mockUser?: Partial<AuthUserDto>) => void;
  mockLogin: (mockUser?: Partial<AuthUserDto>) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const performDemoLogin = (mockUserData?: Partial<AuthUserDto>) => {
    const demoUser: AuthUserDto = {
      id: "usr_creator_01",
      email: "maya.rao@socioconnect.app",
      firstName: "maya",
      lastName: "rao",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      role: "CREATOR",
      ...mockUserData,
    };

    set({ user: demoUser, isAuthenticated: true, isAuthModalOpen: false });
    setCookie("socioconnect_user", JSON.stringify(demoUser));
    setCookie("access_token", "mock_access_token_demo", 30);

    const redirectTarget =
      (typeof window !== "undefined" && sessionStorage.getItem("auth_redirect")) ||
      get().modalRedirect ||
      "/app";
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("auth_redirect");
      window.location.href = redirectTarget;
    }
  };

  return {
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isAuthModalOpen: false,
    modalRedirect: "/app",

    setUser: (user) => {
      set({ user, isAuthenticated: !!user });
      if (user) {
        setCookie("socioconnect_user", JSON.stringify(user));
      } else {
        removeCookie("socioconnect_user");
      }
    },

    openAuthModal: (redirectTo = "/app") => {
      set({ isAuthModalOpen: true, modalRedirect: redirectTo });
    },

    closeAuthModal: () => {
      set({ isAuthModalOpen: false });
      if (typeof window !== "undefined" && window.location.search.includes("auth=login")) {
        const url = new URL(window.location.href);
        url.searchParams.delete("auth");
        url.searchParams.delete("next");
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
      }
    },

    initializeAuth: async () => {
      set({ isLoading: true });
      try {
        // 1. Check saved user cookie
        const saved = getCookie("socioconnect_user");
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as AuthUserDto;
            set({ user: parsed, isAuthenticated: true });
          } catch {
            removeCookie("socioconnect_user");
          }
        }

        // 2. Fetch fresh profile from API
        const token = getCookie("access_token");
        if (token) {
          try {
            const apiUser = await apiClient.auth.getMe();
            if (apiUser) {
              const dtoUser: AuthUserDto = {
                id: apiUser.id,
                email: apiUser.email,
                firstName: apiUser.firstName || "Creator",
                lastName: apiUser.lastName,
                avatar: apiUser.avatar,
                role: apiUser.role || "USER",
                createdAt: apiUser.createdAt,
              };
              set({ user: dtoUser, isAuthenticated: true });
              setCookie("socioconnect_user", JSON.stringify(dtoUser));
            }
          } catch {
            // Token expired or invalid
          }
        }
      } finally {
        set({ isLoading: false });
      }
    },

    loginWithGoogle: async (redirectTo) => {
      const target = redirectTo || get().modalRedirect || "/app";
      set({ isLoading: true });
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("auth_redirect", target);
        }

        const authUrl = await apiClient.auth.getOAuthUrl("google", "false");
        if (authUrl) {
          window.location.href = authUrl;
          return;
        }

        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/oauth/google?redirect=true`;
      } catch {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/oauth/google?redirect=true`;
      } finally {
        set({ isLoading: false });
      }
    },

    loginWithDemo: performDemoLogin,
    mockLogin: performDemoLogin,

    logout: async () => {
      try {
        await apiClient.auth.logout();
      } catch {
        // Ignored
      } finally {
        removeCookie("access_token");
        removeCookie("socioconnect_user");
        removeCookie("socioconnect_ticket");
        set({ user: null, isAuthenticated: false });
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      }
    },
  };
});
