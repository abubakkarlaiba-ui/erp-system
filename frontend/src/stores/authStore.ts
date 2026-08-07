"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  refreshUser: () => Promise<void>;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      setHasHydrated: (value: boolean) => set({ _hasHydrated: value }),

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { api } = await import("@/lib/api");
          const response = await api.post("/auth/login/", { email, password });
          const { access, refresh, user, requires_2fa } = response.data;

          if (requires_2fa) {
            set({ isLoading: false });
            throw new Error("2FA_REQUIRED");
          }

          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", access);
            if (refresh) localStorage.setItem("refresh_token", refresh);
          }
          set({
            user,
            token: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          const msg =
            error?.response?.data?.error?.message ||
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            error?.response?.data?.detail ||
            error?.message ||
            "Invalid credentials. Please try again.";
          const err = new Error(typeof msg === "string" ? msg : "Invalid credentials. Please try again.");
          throw err;
        }
      },

      logout: () => {
        try {
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }
        } catch {
          // ignore
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setUser: (user: User) => set({ user }),

      setTokens: (access: string, refresh: string) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", access);
          localStorage.setItem("refresh_token", refresh);
        }
        set({ token: access, refreshToken: refresh });
      },

      refreshUser: async () => {
        const { api } = await import("@/lib/api");
        const response = await api.get("/auth/profile/");
        set({ user: response.data, isAuthenticated: true });
      },
    }),
    {
      name: "erp-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          state?.setHasHydrated(true);
        };
      },
    }
  )
);
