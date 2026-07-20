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

function mapEmployee(e: any): Employee {
  const addr = [e.address_line1, e.address_line2, e.city, e.state, e.country, e.postal_code].filter(Boolean).join(", ");
  return {
    id: e.id,
    employeeId: e.employee_id,
    firstName: e.first_name,
    lastName: e.last_name,
    email: e.email,
    phone: e.phone || "",
    dateOfBirth: e.date_of_birth || "",
    gender: e.gender || "",
    address: addr || e.address_line1 || "",
    status: e.status || "active",
    joiningDate: e.joining_date || "",
    department: e.department ? { id: e.department, name: e.department_name || "" } : undefined,
    designation: e.designation ? { id: e.designation, name: e.designation_name || "" } : undefined,
    branch: e.branch ? { id: e.branch, name: e.branch_name || "" } : undefined,
    salary: e.salary,
    avatar: e.profile_photo || e.avatar || "",
    company: e.company,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
  } as Employee;
}

function mapDocument(d: any): EmployeeDocument {
  return {
    id: d.id,
    name: d.name || d.title || "Document",
    type: d.document_type || d.type || "file",
    uploadedAt: d.uploaded_at || d.created_at || "",
    url: d.file || d.url || "",
  } as EmployeeDocument;
}

function mapContract(c: any): EmployeeContract {
  return {
    id: c.id,
    title: c.title || c.contract_type || "Contract",
    type: c.contract_type || c.type || "employment",
    status: c.status || "active",
    startDate: c.start_date || "",
    endDate: c.end_date || null,
    salary: c.salary,
  } as EmployeeContract;
}

function mapEducation(ed: any): EmployeeEducation {
  return {
    id: ed.id,
    degree: ed.degree || "",
    institution: ed.institution || "",
    field: ed.field_of_study || ed.field || "",
    startYear: ed.start_year || ed.startYear || "",
    endYear: ed.end_year || ed.endYear || "",
    grade: ed.grade || "",
  } as EmployeeEducation;
}

function mapSkill(s: any): EmployeeSkill {
  return {
    id: s.id,
    name: s.name || s.skill_name || "",
    proficiency: s.proficiency || "intermediate",
    yearsOfExperience: s.years_of_experience || s.yearsOfExperience || 0,
  } as EmployeeSkill;
}

function mapTimelineEvent(e: any): EmployeeTimeline {
  return {
    id: e.id,
    type: e.event_type || e.type || "other",
    date: e.effective_date || e.date || "",
    description: e.description || "",
    fromValue: e.from_value || "",
    toValue: e.to_value || "",
  } as EmployeeTimeline;
}

export const employeeApi = {
  getEmployees: async (params?: Record<string, unknown>) => {
    const { data } = await api.get<any>("/employees/employees/", { params });
    const results = (data?.results ?? data?.data ?? data ?? []).map(mapEmployee);
    return { data: results, count: data?.count ?? results.length };
  },

  getEmployee: async (id: string) => {
    const { data } = await api.get<any>(`/employees/employees/${id}/`);
    return { data: mapEmployee(data) };
  },

  createEmployee: async (employeeData: Partial<Employee>) => {
    const payload: any = {};
    if (employeeData.firstName) payload.first_name = employeeData.firstName;
    if (employeeData.lastName) payload.last_name = employeeData.lastName;
    if (employeeData.email) payload.email = employeeData.email;
    if (employeeData.phone) payload.phone = employeeData.phone;
    if (employeeData.dateOfBirth) payload.date_of_birth = employeeData.dateOfBirth;
    if (employeeData.gender) payload.gender = employeeData.gender;
    if (employeeData.joiningDate) payload.joining_date = employeeData.joiningDate;
    if (employeeData.status) payload.status = employeeData.status;
    if (employeeData.department) payload.department = typeof employeeData.department === 'object' ? employeeData.department.id : employeeData.department;
    if (employeeData.designation) payload.designation = typeof employeeData.designation === 'object' ? employeeData.designation.id : employeeData.designation;
    if (employeeData.branch) payload.branch = typeof employeeData.branch === 'object' ? employeeData.branch.id : employeeData.branch;
    const { data } = await api.post<any>("/employees/employees/", payload);
    return { data: mapEmployee(data) };
  },

  updateEmployee: async (id: string, employeeData: Partial<Employee>) => {
    const payload: any = {};
    if (employeeData.firstName) payload.first_name = employeeData.firstName;
    if (employeeData.lastName) payload.last_name = employeeData.lastName;
    if (employeeData.email) payload.email = employeeData.email;
    if (employeeData.phone) payload.phone = employeeData.phone;
    if (employeeData.dateOfBirth) payload.date_of_birth = employeeData.dateOfBirth;
    if (employeeData.gender) payload.gender = employeeData.gender;
    if (employeeData.status) payload.status = employeeData.status;
    if (employeeData.department) payload.department = typeof employeeData.department === 'object' ? employeeData.department.id : employeeData.department;
    if (employeeData.designation) payload.designation = typeof employeeData.designation === 'object' ? employeeData.designation.id : employeeData.designation;
    if (employeeData.branch) payload.branch = typeof employeeData.branch === 'object' ? employeeData.branch.id : employeeData.branch;
    const { data } = await api.put<any>(`/employees/employees/${id}/`, payload);
    return { data: mapEmployee(data) };
  },

  deleteEmployee: async (id: string) => {
    const { data } = await api.delete<any>(`/employees/employees/${id}/`);
    return data;
  },

  getEmployeeDocuments: async (id: string) => {
    const { data } = await api.get<any>(`/employees/employees/${id}/documents/`);
    const results = (data?.results ?? data?.data ?? data ?? []).map(mapDocument);
    return { data: results };
  },

  uploadDocument: async (id: string, documentData: FormData) => {
    const { data } = await api.post<any>(
      `/employees/employees/${id}/documents/`,
      documentData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return { data: mapDocument(data) };
  },

  getEmployeeContracts: async (id: string) => {
    const { data } = await api.get<any>(`/employees/employees/${id}/contracts/`);
    const results = (data?.results ?? data?.data ?? data ?? []).map(mapContract);
    return { data: results };
  },

  getEmployeeEducation: async (id: string) => {
    const { data } = await api.get<any>(`/employees/employees/${id}/education/`);
    const results = (data?.results ?? data?.data ?? data ?? []).map(mapEducation);
    return { data: results };
  },

  getEmployeeSkills: async (id: string) => {
    const { data } = await api.get<any>(`/employees/employees/${id}/skills/`);
    const results = (data?.results ?? data?.data ?? data ?? []).map(mapSkill);
    return { data: results };
  },

  getEmployeeTimeline: async (id: string) => {
    const { data } = await api.get<any>(`/employees/employees/${id}/timeline/`);
    const results = (data?.results ?? data?.data ?? data ?? []).map(mapTimelineEvent);
    return { data: results };
  },
};
