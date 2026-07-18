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
    const response = await api.post("/auth/register/", data);
    return response.data;
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
