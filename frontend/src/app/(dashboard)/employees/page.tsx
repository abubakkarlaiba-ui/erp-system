"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  Users,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  UserPlus,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/layout/DataTable";
import { StatsCard } from "@/components/shared/StatsCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { employeeApi } from "@/features/employees/api/employeeApi";
import { companyApi } from "@/features/companies/api/companyApi";
import type { Employee } from "@/types";
import { cn, formatDate } from "@/lib/utils";

const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  companyId: z.string().min(1, "Company is required"),
  branchId: z.string().min(1, "Branch is required"),
  departmentId: z.string().min(1, "Department is required"),
  designationId: z.string().min(1, "Designation is required"),
  joiningDate: z.string().min(1, "Joining date is required"),
  employmentType: z.enum(["full_time", "part_time", "contract", "intern"]),
  salary: z.number().min(0, "Salary must be positive").optional(),
  status: z.enum(["active", "inactive", "on_leave"]),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");

  const {
    data: employeesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeApi.getEmployees(),
  });

  const { data: companiesData } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companyApi.getCompanies(),
  });

  const createMutation = useMutation({
    mutationFn: employeeApi.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee created successfully");
      setIsDialogOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create employee");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) =>
      employeeApi.updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee updated successfully");
      setIsDialogOpen(false);
      setEditingEmployee(null);
      reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update employee");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: employeeApi.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deleted successfully");
      setDeletingEmployee(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete employee");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyId: "",
      branchId: "",
      departmentId: "",
      designationId: "",
      joiningDate: "",
      employmentType: "full_time",
      salary: 0,
      status: "active",
    },
  });

  const onSubmit = (data: EmployeeFormData) => {
    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    reset({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || "",
      companyId: employee.companyId,
      branchId: employee.branchId,
      departmentId: employee.departmentId,
      designationId: employee.designationId,
      joiningDate: employee.joiningDate,
      employmentType: employee.employmentType,
      salary: employee.salary || 0,
      status: employee.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (deletingEmployee) {
      deleteMutation.mutate(deletingEmployee.id);
    }
  };

  const filteredEmployees = (employeesData?.data || []).filter((employee) => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || employee.status === statusFilter;
    const matchesDepartment =
      departmentFilter === "all" || employee.departmentId === departmentFilter;
    const matchesBranch =
      branchFilter === "all" || employee.branchId === branchFilter;
    return matchesSearch && matchesStatus && matchesDepartment && matchesBranch;
  });

  const stats = {
    total: employeesData?.data?.length || 0,
    active: employeesData?.data?.filter((e) => e.status === "active").length || 0,
    onLeave: employeesData?.data?.filter((e) => e.status === "on_leave").length || 0,
    newThisMonth:
      employeesData?.data?.filter((e) => {
        const joiningDate = new Date(e.joiningDate);
        const now = new Date();
        return (
          joiningDate.getMonth() === now.getMonth() &&
          joiningDate.getFullYear() === now.getFullYear()
        );
      }).length || 0,
  };

  const columns = [
    {
      header: "Employee",
      accessorKey: "firstName" as const,
      cell: (row: Employee) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {row.avatar ? (
              <img
                src={row.avatar}
                alt={`${row.firstName} ${row.lastName}`}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              `${row.firstName[0]}${row.lastName[0]}`
            )}
          </div>
          <div>
            <Link
              href={`/employees/${row.id}`}
              className="font-medium hover:underline"
            >
              {row.firstName} {row.lastName}
            </Link>
            <div className="text-sm text-muted-foreground">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Employee ID",
      accessorKey: "employeeId" as const,
      cell: (row: Employee) => (
        <span className="font-mono text-sm">{row.employeeId}</span>
      ),
    },
    {
      header: "Department",
      accessorKey: "department" as const,
      cell: (row: Employee) => (
        <span>{row.department?.name || "-"}</span>
      ),
    },
    {
      header: "Designation",
      accessorKey: "designation" as const,
      cell: (row: Employee) => (
        <span>{row.designation?.name || "-"}</span>
      ),
    },
    {
      header: "Branch",
      accessorKey: "branch" as const,
      cell: (row: Employee) => <span>{row.branch?.name || "-"}</span>,
    },
    {
      header: "Joining Date",
      accessorKey: "joiningDate" as const,
      cell: (row: Employee) => (
        <span className="text-muted-foreground">
          {formatDate(row.joiningDate)}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: (row: Employee) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
            row.status === "active"
              ? "bg-green-100 text-green-700"
              : row.status === "on_leave"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          )}
        >
          {row.status === "active" && <CheckCircle2 className="h-3 w-3" />}
          {row.status === "on_leave" && <Clock className="h-3 w-3" />}
          {row.status === "inactive" && <Users className="h-3 w-3" />}
          {row.status.replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row: Employee) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/employees/${row.id}`}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <MoreVertical className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleEdit(row)}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeletingEmployee(row)}
            className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const departments = [
    ...new Map(
      (employeesData?.data || [])
        .filter((e) => e.department)
        .map((e) => [e.departmentId, e.department])
    ).values(),
  ];

  const branches = [
    ...new Map(
      (employeesData?.data || [])
        .filter((e) => e.branch)
        .map((e) => [e.branchId, e.branch])
    ).values(),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Employees"
        action={{
          label: "Add Employee",
          onClick: () => {
            setEditingEmployee(null);
            reset();
            setIsDialogOpen(true);
          },
        }}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Employees"
          value={stats.total}
          icon={Users}
        />
        <StatsCard
          title="Active"
          value={stats.active}
          icon={CheckCircle2}
          className="text-green-600"
        />
        <StatsCard
          title="On Leave"
          value={stats.onLeave}
          icon={Clock}
          className="text-yellow-600"
        />
        <StatsCard
          title="New This Month"
          value={stats.newThisMonth}
          icon={UserPlus}
          className="text-blue-600"
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept?.id} value={dept?.id}>
                {dept?.name}
              </option>
            ))}
          </select>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Branches</option>
            {branches.map((branch) => (
              <option key={branch?.id} value={branch?.id}>
                {branch?.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Failed to load employees. Please try again.
        </div>
      ) : filteredEmployees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees found"
          description={
            searchQuery ||
            statusFilter !== "all" ||
            departmentFilter !== "all" ||
            branchFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Get started by adding your first employee."
          }
          action={
            !searchQuery &&
            statusFilter === "all" &&
            departmentFilter === "all" &&
            branchFilter === "all"
              ? {
                  label: "Add Employee",
                  onClick: () => {
                    setEditingEmployee(null);
                    reset();
                    setIsDialogOpen(true);
                  },
                }
              : undefined
          }
        />
      ) : (
        <DataTable columns={columns} data={filteredEmployees} />
      )}

      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setIsDialogOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border bg-background p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold">
                {editingEmployee ? "Edit Employee" : "Add Employee"}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name *</label>
                    <input
                      {...register("firstName")}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {errors.firstName && (
                      <p className="text-xs text-destructive">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name *</label>
                    <input
                      {...register("lastName")}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {errors.lastName && (
                      <p className="text-xs text-destructive">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email *</label>
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <input
                      {...register("phone")}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company *</label>
                    <select
                      {...register("companyId")}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select Company</option>
                      {companiesData?.data?.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                    {errors.companyId && (
                      <p className="text-xs text-destructive">
                        {errors.companyId.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Branch *</label>
                    <select
                      {...register("branchId")}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select Branch</option>
                    </select>
                    {errors.branchId && (
                      <p className="text-xs text-destructive">
                        {errors.branchId.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Department *</label>
                    <select
                      {...register("departmentId")}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select Department</option>
                    </select>
                    {errors.departmentId && (
                      <p className="text-xs text-destructive">
                        {errors.departmentId.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Designation *</label>
                    <select
                      {...register("designationId")}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select Designation</option>
                    </select>
                    {errors.designationId && (
                      <p className="text-xs text-destructive">
                        {errors.designationId.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Joining Date *</label>
                    <input
                      {...register("joiningDate")}
                      type="date"
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {errors.joiningDate && (
                      <p className="text-xs text-destructive">
                        {errors.joiningDate.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Employment Type *</label>
                    <select
                      {...register("employmentType")}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="intern">Intern</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Salary</label>
                    <input
                      {...register("salary", { valueAsNumber: true })}
                      type="number"
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {errors.salary && (
                      <p className="text-xs text-destructive">
                        {errors.salary.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status *</label>
                    <select
                      {...register("status")}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="active">Active</option>
                      <option value="on_leave">On Leave</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingEmployee
                      ? "Update"
                      : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingEmployee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setDeletingEmployee(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl border bg-background p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <Trash2 className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Delete Employee</h2>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete{" "}
                    {deletingEmployee.firstName} {deletingEmployee.lastName}?
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setDeletingEmployee(null)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
