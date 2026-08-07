"use client";

import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthStore();

  const register = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirm: string;
  }) => {
    try {
      const response = await api.post("/auth/register/", data);
      return response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";
      throw new Error(typeof msg === "string" ? msg : "Registration failed.");
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
  };
}
