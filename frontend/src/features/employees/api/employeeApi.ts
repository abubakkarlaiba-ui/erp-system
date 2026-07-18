import { api } from "@/lib/api";
import type {
  Employee,
  EmployeeDocument,
  EmployeeContract,
  EmployeeEducation,
  EmployeeSkill,
  EmployeeTimeline,
  PaginatedResponse,
  ApiResponse,
} from "@/types";

export const employeeApi = {
  getEmployees: async (params?: Record<string, unknown>) => {
    const { data } = await api.get<PaginatedResponse<Employee>>("/employees", {
      params,
    });
    return data;
  },

  getEmployee: async (id: string) => {
    const { data } = await api.get<ApiResponse<Employee>>(`/employees/${id}`);
    return data;
  },

  createEmployee: async (employeeData: Partial<Employee>) => {
    const { data } = await api.post<ApiResponse<Employee>>(
      "/employees",
      employeeData
    );
    return data;
  },

  updateEmployee: async (id: string, employeeData: Partial<Employee>) => {
    const { data } = await api.put<ApiResponse<Employee>>(
      `/employees/${id}`,
      employeeData
    );
    return data;
  },

  deleteEmployee: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/employees/${id}`);
    return data;
  },

  getEmployeeDocuments: async (id: string) => {
    const { data } = await api.get<PaginatedResponse<EmployeeDocument>>(
      `/employees/${id}/documents`
    );
    return data;
  },

  uploadDocument: async (id: string, documentData: FormData) => {
    const { data } = await api.post<ApiResponse<EmployeeDocument>>(
      `/employees/${id}/documents`,
      documentData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  },

  getEmployeeContracts: async (id: string) => {
    const { data } = await api.get<PaginatedResponse<EmployeeContract>>(
      `/employees/${id}/contracts`
    );
    return data;
  },

  getEmployeeEducation: async (id: string) => {
    const { data } = await api.get<PaginatedResponse<EmployeeEducation>>(
      `/employees/${id}/education`
    );
    return data;
  },

  getEmployeeSkills: async (id: string) => {
    const { data } = await api.get<PaginatedResponse<EmployeeSkill>>(
      `/employees/${id}/skills`
    );
    return data;
  },

  getEmployeeTimeline: async (id: string) => {
    const { data } = await api.get<PaginatedResponse<EmployeeTimeline>>(
      `/employees/${id}/timeline`
    );
    return data;
  },
};
