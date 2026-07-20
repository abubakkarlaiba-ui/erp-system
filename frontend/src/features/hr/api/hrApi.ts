import { api as apiClient } from "@/lib/api";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  hoursWorked: number;
  status: "present" | "absent" | "late" | "half-day" | "on-leave";
  overtime: number;
}

export interface AttendanceParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  status?: string;
}

export interface LeaveType {
  id: string;
  name: string;
  daysAllowed: number;
  daysUsed: number;
  description: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  approvedBy?: string;
  approvedAt?: string;
}

export interface LeaveBalance {
  employeeId: string;
  balances: Array<{
    leaveType: string;
    allowed: number;
    used: number;
    remaining: number;
  }>;
}

export interface PayrollPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "draft" | "processing" | "completed" | "closed";
  totalEmployees: number;
  totalAmount: number;
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  periodId: string;
  periodName: string;
  basicSalary: number;
  allowances: number;
  overtime: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: "draft" | "processed" | "paid";
  generatedAt: string;
}

export interface SalaryStructure {
  id: string;
  name: string;
  baseSalary: number;
  allowances: Record<string, number>;
  deductions: Record<string, number>;
  description: string;
}

export interface Training {
  id: string;
  title: string;
  trainer: string;
  description: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  progress: number;
  location: string;
  category: string;
}

export interface TrainingAssignment {
  id: string;
  trainingId: string;
  employeeId: string;
  employeeName: string;
  status: "enrolled" | "in-progress" | "completed" | "dropped";
  completionDate?: string;
  score?: number;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewPeriod: string;
  reviewerName: string;
  overallRating: number;
  categories: Array<{
    name: string;
    rating: number;
    comments: string;
  }>;
  status: "draft" | "in-progress" | "completed";
  strengths: string;
  improvements: string;
  goals: string;
  createdAt: string;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  hours: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  description: string;
}

export interface EmployeeShift {
  id: string;
  employeeId: string;
  employeeName: string;
  shiftId: string;
  shiftName: string;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export const hrApi = {
  attendance: {
    get: (params?: AttendanceParams) =>
      apiClient.get("/hr/attendance/", { params }).then((r) => {
        const d = r.data;
        const results = d?.results ?? d?.data ?? (Array.isArray(d) ? d : []);
        return { data: results, count: d?.count ?? results.length };
      }),
    clockIn: () =>
      apiClient.post("/hr/attendance/clock-in/"),
    clockOut: () =>
      apiClient.post("/hr/attendance/clock-out/"),
    mark: (data: { employeeId: string; date: string; status: string; checkIn?: string; checkOut?: string }) =>
      apiClient.post("/hr/attendance/", data),
  },

  leave: {
    getTypes: () =>
      apiClient.get("/hr/leave-types/").then((r) => {
        const d = r.data;
        const results = d?.results ?? d?.data ?? (Array.isArray(d) ? d : []);
        return { data: results };
      }),
    getRequests: (params?: AttendanceParams) =>
      apiClient.get("/hr/leave-requests/", { params }).then((r) => {
        const d = r.data;
        const results = d?.results ?? d?.data ?? (Array.isArray(d) ? d : []);
        return { data: results, count: d?.count ?? results.length };
      }),
    createRequest: (data: { leaveTypeId: string; startDate: string; endDate: string; reason: string }) =>
      apiClient.post("/hr/leave-requests/", data),
    approve: (id: string) =>
      apiClient.put(`/hr/leave-requests/${id}/approve/`),
    reject: (id: string) =>
      apiClient.put(`/hr/leave-requests/${id}/reject/`),
    getBalance: (employeeId: string) =>
      apiClient.get(`/hr/leave-requests/balance/${employeeId}/`).then((r) => {
        const d = r.data;
        return { data: d?.data ?? d };
      }),
  },

  payroll: {
    getPeriods: () =>
      apiClient.get("/hr/payroll-periods/").then((r) => {
        const d = r.data;
        return { data: d?.results ?? d?.data ?? (Array.isArray(d) ? d : []) };
      }),
    getPayslips: (params?: AttendanceParams) =>
      apiClient.get("/hr/payslips/", { params }).then((r) => {
        const d = r.data;
        const results = d?.results ?? d?.data ?? (Array.isArray(d) ? d : []);
        return { data: results, count: d?.count ?? results.length };
      }),
    generatePayslip: (data: { periodId: string; employeeIds?: string[] }) =>
      apiClient.post("/hr/payslips/", data),
    getPayslip: (id: string) =>
      apiClient.get(`/hr/payslips/${id}/`),
  },

  salary: {
    getStructures: () =>
      apiClient.get("/hr/salary-structures/").then((r) => {
        const d = r.data;
        return { data: d?.results ?? d?.data ?? (Array.isArray(d) ? d : []) };
      }),
    createStructure: (data: Omit<SalaryStructure, "id">) =>
      apiClient.post("/hr/salary-structures/", data),
  },

  training: {
    getAll: () =>
      apiClient.get("/hr/trainings/").then((r) => {
        const d = r.data;
        return { data: d?.results ?? d?.data ?? (Array.isArray(d) ? d : []) };
      }),
    create: (data: Omit<Training, "id" | "currentParticipants" | "progress">) =>
      apiClient.post("/hr/trainings/", data),
    getAssignments: (id: string) =>
      apiClient.get(`/hr/training-assignments/?training=${id}`).then((r) => {
        const d = r.data;
        return { data: d?.results ?? d?.data ?? (Array.isArray(d) ? d : []) };
      }),
  },

  performance: {
    getReviews: (params?: AttendanceParams) =>
      apiClient.get("/hr/performance-reviews/", { params }).then((r) => {
        const d = r.data;
        const results = d?.results ?? d?.data ?? (Array.isArray(d) ? d : []);
        return { data: results, count: d?.count ?? results.length };
      }),
    createReview: (data: Omit<PerformanceReview, "id" | "createdAt">) =>
      apiClient.post("/hr/performance-reviews/", data),
  },

  overtime: {
    getRequests: (params?: AttendanceParams) =>
      apiClient.get("/hr/overtimes/", { params }).then((r) => {
        const d = r.data;
        const results = d?.results ?? d?.data ?? (Array.isArray(d) ? d : []);
        return { data: results, count: d?.count ?? results.length };
      }),
    createRequest: (data: { employeeId: string; date: string; hours: number; reason: string }) =>
      apiClient.post("/hr/overtimes/", data),
    approve: (id: string) =>
      apiClient.put(`/hr/overtimes/${id}/approve/`),
  },

  shifts: {
    getAll: () =>
      apiClient.get("/hr/shifts/").then((r) => {
        const d = r.data;
        return { data: d?.results ?? d?.data ?? (Array.isArray(d) ? d : []) };
      }),
    create: (data: Omit<Shift, "id">) =>
      apiClient.post("/hr/shifts/", data),
    getEmployeeShifts: (params?: AttendanceParams) =>
      apiClient.get("/hr/employee-shifts/", { params }).then((r) => {
        const d = r.data;
        const results = d?.results ?? d?.data ?? (Array.isArray(d) ? d : []);
        return { data: results, count: d?.count ?? results.length };
      }),
  },
};
