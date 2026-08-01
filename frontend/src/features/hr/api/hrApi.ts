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
        const results = (d?.results ?? d?.data ?? (Array.isArray(d) ? d : [])).map((t: any) => ({
          id: String(t.id),
          name: t.name || "",
          daysAllowed: Number(t.days_allowed) || 0,
          daysUsed: 0,
          description: t.description || "",
        }));
        return { data: results };
      }),
    getRequests: (params?: AttendanceParams) =>
      apiClient.get("/hr/leave-requests/", { params }).then((r) => {
        const d = r.data;
        const results = (d?.results ?? d?.data ?? (Array.isArray(d) ? d : [])).map((l: any) => ({
          id: String(l.id),
          employeeId: String(l.employee || ""),
          employeeName: l.employee_name || "",
          leaveType: l.leave_type_name || "",
          startDate: l.start_date || "",
          endDate: l.end_date || "",
          days: Number(l.total_days) || 0,
          reason: l.reason || "",
          status: l.status || "pending",
          approvedBy: l.approved_by_name || "",
          approvedAt: l.approval_date || "",
        }));
        return { data: results, count: d?.count ?? results.length };
      }),
    createRequest: (data: { leaveTypeId: string; startDate: string; endDate: string; reason: string }) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return apiClient.post("/hr/leave-requests/", {
        leave_type: data.leaveTypeId,
        start_date: data.startDate,
        end_date: data.endDate,
        reason: data.reason,
        total_days: totalDays,
      });
    },
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
        const results = (d?.results ?? d?.data ?? (Array.isArray(d) ? d : [])).map((p: any) => ({
          id: String(p.id),
          name: p.name || "",
          startDate: p.start_date || "",
          endDate: p.end_date || "",
          status: p.status || "draft",
          totalEmployees: Number(p.total_employees) || 0,
          totalAmount: Number(p.total_amount) || 0,
        }));
        return { data: results };
      }),
    getPayslips: (params?: AttendanceParams) =>
      apiClient.get("/hr/payslips/", { params }).then((r) => {
        const d = r.data;
        const results = (d?.results ?? d?.data ?? (Array.isArray(d) ? d : [])).map((p: any) => ({
          id: String(p.id),
          employeeId: String(p.employee || ""),
          employeeName: p.employee_name || "",
          periodId: String(p.period || ""),
          periodName: p.period_name || "",
          basicSalary: Number(p.basic_salary) || 0,
          allowances: Number(p.allowances) || 0,
          overtime: Number(p.overtime) || 0,
          grossPay: Number(p.gross_salary) || 0,
          deductions: Number(p.tax_deduction || 0) + Number(p.pension_deduction || 0) + Number(p.insurance_deduction || 0) + Number(p.other_deductions || 0),
          netPay: Number(p.net_salary) || 0,
          status: p.status || "draft",
          generatedAt: p.paid_date || p.created_at || "",
        }));
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
        const results = (d?.results ?? d?.data ?? (Array.isArray(d) ? d : [])).map((s: any) => ({
          id: String(s.id),
          name: s.name || "",
          baseSalary: Number(s.basic_salary) || 0,
          allowances: s.allowances || {},
          deductions: s.deductions || {},
          description: s.description || "",
        }));
        return { data: results };
      }),
    createStructure: (data: Omit<SalaryStructure, "id">) =>
      apiClient.post("/hr/salary-structures/", data),
  },

  training: {
    getAll: () =>
      apiClient.get("/hr/trainings/").then((r) => {
        const d = r.data;
        const results = (d?.results ?? d?.data ?? (Array.isArray(d) ? d : [])).map((t: any) => ({
          id: String(t.id),
          title: t.title || "",
          trainer: t.trainer || t.instructor || "",
          description: t.description || "",
          startDate: t.start_date || "",
          endDate: t.end_date || "",
          maxParticipants: Number(t.max_participants) || 0,
          currentParticipants: Number(t.current_participants) || 0,
          status: t.status || "scheduled",
          progress: Number(t.progress) || 0,
          location: t.location || "",
          category: t.category || "",
        }));
        return { data: results };
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
        const results = (d?.results ?? d?.data ?? (Array.isArray(d) ? d : [])).map((rev: any) => ({
          id: String(rev.id),
          employeeId: String(rev.employee || ""),
          employeeName: rev.employee_name || "",
          reviewPeriod: rev.review_period || "",
          reviewerName: rev.reviewer_name || rev.reviewer || "",
          overallRating: Number(rev.overall_rating) || 0,
          categories: rev.categories || [],
          status: rev.status || "draft",
          strengths: rev.strengths || "",
          improvements: rev.improvements || "",
          goals: rev.goals || "",
          createdAt: rev.created_at || "",
        }));
        return { data: results, count: d?.count ?? results.length };
      }),
    createReview: (data: Omit<PerformanceReview, "id" | "createdAt">) =>
      apiClient.post("/hr/performance-reviews/", data),
  },

  overtime: {
    getRequests: (params?: AttendanceParams) =>
      apiClient.get("/hr/overtimes/", { params }).then((r) => {
        const d = r.data;
        const results = (d?.results ?? d?.data ?? (Array.isArray(d) ? d : [])).map((o: any) => ({
          id: String(o.id),
          employeeId: String(o.employee || ""),
          employeeName: o.employee_name || "",
          date: o.date || "",
          hours: Number(o.hours) || 0,
          reason: o.reason || "",
          status: o.status || "pending",
          approvedBy: o.approved_by_name || "",
        }));
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
        const results = (d?.results ?? d?.data ?? (Array.isArray(d) ? d : [])).map((s: any) => ({
          id: String(s.id),
          name: s.name || "",
          startTime: s.start_time || s.start || "",
          endTime: s.end_time || s.end || "",
          breakMinutes: Number(s.break_minutes) || 0,
          description: s.description || "",
        }));
        return { data: results };
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
