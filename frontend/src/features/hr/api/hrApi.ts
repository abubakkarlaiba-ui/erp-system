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
      apiClient.get<{ data: AttendanceRecord[]; total: number }>("/hr/attendance/", { params }),
    clockIn: () =>
      apiClient.post<AttendanceRecord>("/hr/attendance/clock-in/"),
    clockOut: () =>
      apiClient.post<AttendanceRecord>("/hr/attendance/clock-out/"),
    mark: (data: { employeeId: string; date: string; status: string; checkIn?: string; checkOut?: string }) =>
      apiClient.post<AttendanceRecord>("/hr/attendance/", data),
  },

  leave: {
    getTypes: () =>
      apiClient.get<LeaveType[]>("/hr/leave-types/"),
    getRequests: (params?: AttendanceParams) =>
      apiClient.get<{ data: LeaveRequest[]; total: number }>("/hr/leave-requests/", { params }),
    createRequest: (data: { leaveTypeId: string; startDate: string; endDate: string; reason: string }) =>
      apiClient.post<LeaveRequest>("/hr/leave-requests/", data),
    approve: (id: string) =>
      apiClient.put<LeaveRequest>(`/hr/leave-requests/${id}/approve/`),
    reject: (id: string) =>
      apiClient.put<LeaveRequest>(`/hr/leave-requests/${id}/reject/`),
    getBalance: (employeeId: string) =>
      apiClient.get<LeaveBalance>(`/hr/leave-requests/balance/${employeeId}/`),
  },

  payroll: {
    getPeriods: () =>
      apiClient.get<PayrollPeriod[]>("/hr/payroll-periods/"),
    getPayslips: (params?: AttendanceParams) =>
      apiClient.get<{ data: Payslip[]; total: number }>("/hr/payslips/", { params }),
    generatePayslip: (data: { periodId: string; employeeIds?: string[] }) =>
      apiClient.post<Payslip[]>("/hr/payslips/", data),
    getPayslip: (id: string) =>
      apiClient.get<Payslip>(`/hr/payslips/${id}/`),
  },

  salary: {
    getStructures: () =>
      apiClient.get<SalaryStructure[]>("/hr/salary-structures/"),
    createStructure: (data: Omit<SalaryStructure, "id">) =>
      apiClient.post<SalaryStructure>("/hr/salary-structures/", data),
  },

  training: {
    getAll: () =>
      apiClient.get<Training[]>("/hr/trainings/"),
    create: (data: Omit<Training, "id" | "currentParticipants" | "progress">) =>
      apiClient.post<Training>("/hr/trainings/", data),
    getAssignments: (id: string) =>
      apiClient.get<TrainingAssignment[]>(`/hr/training-assignments/?training=${id}`),
  },

  performance: {
    getReviews: (params?: AttendanceParams) =>
      apiClient.get<{ data: PerformanceReview[]; total: number }>("/hr/performance-reviews/", { params }),
    createReview: (data: Omit<PerformanceReview, "id" | "createdAt">) =>
      apiClient.post<PerformanceReview>("/hr/performance-reviews/", data),
  },

  overtime: {
    getRequests: (params?: AttendanceParams) =>
      apiClient.get<{ data: OvertimeRequest[]; total: number }>("/hr/overtimes/", { params }),
    createRequest: (data: { employeeId: string; date: string; hours: number; reason: string }) =>
      apiClient.post<OvertimeRequest>("/hr/overtimes/", data),
    approve: (id: string) =>
      apiClient.put<OvertimeRequest>(`/hr/overtimes/${id}/approve/`),
  },

  shifts: {
    getAll: () =>
      apiClient.get<Shift[]>("/hr/shifts/"),
    create: (data: Omit<Shift, "id">) =>
      apiClient.post<Shift>("/hr/shifts/", data),
    getEmployeeShifts: (params?: AttendanceParams) =>
      apiClient.get<{ data: EmployeeShift[]; total: number }>("/hr/employee-shifts/", { params }),
  },
};
