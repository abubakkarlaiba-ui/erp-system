import { api } from "@/lib/api";
import type { User } from "@/types";

interface LoginResponse {
  data: {
    access: string;
    refresh: string;
    user: User;
  };
}

interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>("/auth/login/", { email, password }),

  register: (data: RegisterRequest) =>
    api.post("/auth/register/", data),

  logout: (refresh: string) =>
    api.post("/auth/logout/", { refresh }),

  refreshToken: (refresh: string) =>
    api.post("/auth/token/refresh/", { refresh }),

  getProfile: () =>
    api.get<User>("/auth/profile/"),

  updateProfile: (data: Partial<User>) =>
    api.patch<User>("/auth/profile/", data),

  changePassword: (data: { old_password: string; new_password: string }) =>
    api.post("/auth/change-password/", data),

  setup2FA: () =>
    api.post("/auth/2fa/setup/"),

  verify2FA: (code: string) =>
    api.post("/auth/2fa/verify/", { code }),

  getLoginHistory: () =>
    api.get("/auth/login-history/"),

  getUsers: () =>
    api.get("/auth/users/"),

  getRoles: () =>
    api.get("/auth/roles/"),
};
