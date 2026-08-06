import { api } from "@/lib/api";

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_companies: number;
  users_by_role: { role: string; count: number }[];
  users_by_company: { company_name: string; count: number }[];
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  is_staff: boolean;
  company: string | null;
  created_at: string;
}

export interface AdminCompany {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  is_active: boolean;
  created_at: string;
}

export const adminApi = {
  getStats: async () => {
    const { data } = await api.get<AdminStats>("/auth/admin/stats/");
    return data;
  },

  getUsers: async (params?: Record<string, unknown>) => {
    const { data } = await api.get<any>("/auth/admin/users/", { params });
    return data;
  },

  getUser: async (id: string) => {
    const { data } = await api.get<any>(`/auth/admin/users/${id}/`);
    return data;
  },

  updateUser: async (id: string, userData: Partial<AdminUser>) => {
    const { data } = await api.patch<any>(`/auth/admin/users/${id}/`, userData);
    return data;
  },

  deleteUser: async (id: string) => {
    await api.delete(`/auth/admin/users/${id}/`);
  },

  getCompanies: async (params?: Record<string, unknown>) => {
    const { data } = await api.get<any>("/auth/admin/companies/", { params });
    return data;
  },

  deleteCompany: async (id: string) => {
    await api.delete(`/auth/admin/companies/${id}/`);
  },
};
