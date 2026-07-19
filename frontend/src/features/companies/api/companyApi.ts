import { api } from "@/lib/api";
import type {
  Company,
  Branch,
  Department,
  Designation,
  FiscalYear,
  Holiday,
  PaginatedResponse,
  ApiResponse,
} from "@/types";

export const companyApi = {
  getCompanies: async (params?: Record<string, unknown>) => {
    const { data } = await api.get<PaginatedResponse<Company>>("/companies/companies/", {
      params,
    });
    return data;
  },

  getCompany: async (id: string) => {
    const { data } = await api.get<ApiResponse<Company>>(`/companies/companies/${id}/`);
    return data;
  },

  createCompany: async (companyData: Partial<Company>) => {
    const { data } = await api.post<ApiResponse<Company>>(
      "/companies/companies/",
      companyData
    );
    return data;
  },

  updateCompany: async (id: string, companyData: Partial<Company>) => {
    const { data } = await api.put<ApiResponse<Company>>(
      `/companies/companies/${id}/`,
      companyData
    );
    return data;
  },

  deleteCompany: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/companies/companies/${id}/`);
    return data;
  },

  getBranches: async (companyId: string) => {
    const { data } = await api.get<PaginatedResponse<Branch>>(
      `/companies/companies/${companyId}/branches/`
    );
    return data;
  },

  createBranch: async (companyId: string, branchData: Partial<Branch>) => {
    const { data } = await api.post<ApiResponse<Branch>>(
      `/companies/companies/${companyId}/branches/`,
      branchData
    );
    return data;
  },

  updateBranch: async (
    companyId: string,
    id: string,
    branchData: Partial<Branch>
  ) => {
    const { data } = await api.put<ApiResponse<Branch>>(
      `/companies/companies/${companyId}/branches/${id}/`,
      branchData
    );
    return data;
  },

  deleteBranch: async (companyId: string, id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(
      `/companies/companies/${companyId}/branches/${id}/`
    );
    return data;
  },

  getDepartments: async (companyId: string) => {
    const { data } = await api.get<PaginatedResponse<Department>>(
      `/companies/companies/${companyId}/departments/`
    );
    return data;
  },

  createDepartment: async (
    companyId: string,
    departmentData: Partial<Department>
  ) => {
    const { data } = await api.post<ApiResponse<Department>>(
      `/companies/companies/${companyId}/departments/`,
      departmentData
    );
    return data;
  },

  updateDepartment: async (
    companyId: string,
    id: string,
    departmentData: Partial<Department>
  ) => {
    const { data } = await api.put<ApiResponse<Department>>(
      `/companies/companies/${companyId}/departments/${id}/`,
      departmentData
    );
    return data;
  },

  deleteDepartment: async (companyId: string, id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(
      `/companies/companies/${companyId}/departments/${id}/`
    );
    return data;
  },

  getDesignations: async (companyId: string) => {
    const { data } = await api.get<PaginatedResponse<Designation>>(
      `/companies/companies/${companyId}/designations/`
    );
    return data;
  },

  createDesignation: async (
    companyId: string,
    designationData: Partial<Designation>
  ) => {
    const { data } = await api.post<ApiResponse<Designation>>(
      `/companies/companies/${companyId}/designations/`,
      designationData
    );
    return data;
  },

  updateDesignation: async (
    companyId: string,
    id: string,
    designationData: Partial<Designation>
  ) => {
    const { data } = await api.put<ApiResponse<Designation>>(
      `/companies/companies/${companyId}/designations/${id}/`,
      designationData
    );
    return data;
  },

  deleteDesignation: async (companyId: string, id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(
      `/companies/companies/${companyId}/designations/${id}/`
    );
    return data;
  },

  getFiscalYears: async (companyId: string) => {
    const { data } = await api.get<PaginatedResponse<FiscalYear>>(
      `/companies/companies/${companyId}/fiscal-years/`
    );
    return data;
  },

  getHolidays: async (companyId: string) => {
    const { data } = await api.get<PaginatedResponse<Holiday>>(
      `/companies/companies/${companyId}/holidays/`
    );
    return data;
  },
};
