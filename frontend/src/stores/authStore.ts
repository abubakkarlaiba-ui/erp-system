"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { api, setAuthToken, clearAuthToken } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post("/auth/login/", { email, password });
          const { access, refresh, user } = response.data.data;
          setAuthToken(access);
          set({
            user,
            token: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          if (refreshToken) {
            await api.post("/auth/logout/", { refresh: refreshToken });
          }
        } catch {
          // logout even if API fails
        } finally {
          clearAuthToken();
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      setUser: (user: User) => set({ user }),

      setTokens: (access: string, refresh: string) => {
        setAuthToken(access);
        set({ token: access, refreshToken: refresh });
      },

      refreshUser: async () => {
        try {
          const response = await api.get("/auth/profile/");
          set({ user: response.data.data || response.data });
        } catch {
          get().logout();
        }
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
    }
  )
);
