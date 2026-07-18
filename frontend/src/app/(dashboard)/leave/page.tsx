"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { CalendarDays, Plus, CheckCircle, XCircle, Clock, AlertCircle, Send } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/layout/DataTable";
import StatsCard from "@/components/shared/StatsCard";
import { hrApi, LeaveRequest, LeaveType } from "@/features/hr/api/hrApi";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
};

const tabs = ["My Requests", "All Requests", "Leave Types", "Calendar"];

export default function LeavePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("My Requests");
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestForm, setRequestForm] = useState({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });

  const { data: leaveTypes } = useQuery({
    queryKey: ["leaveTypes"],
    queryFn: () => hrApi.leave.getTypes(),
  });

  const { data: myRequestsData, isLoading: myLoading } = useQuery({
    queryKey: ["leaveRequests", "my"],
    queryFn: () => hrApi.leave.getRequests({ employeeId: "me" }),
  });

  const { data: allRequestsData, isLoading: allLoading } = useQuery({
    queryKey: ["leaveRequests", "all"],
    queryFn: () => hrApi.leave.getRequests(),
    enabled: activeTab === "All Requests",
  });

  const { data: balanceData } = useQuery({
    queryKey: ["leaveBalance", "me"],
    queryFn: () => hrApi.leave.getBalance("me"),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => hrApi.leave.approve(id),
    onSuccess: () => {
      toast.success("Leave request approved");
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    },
    onError: () => toast.error("Failed to approve leave request"),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => hrApi.leave.reject(id),
    onSuccess: () => {
      toast.success("Leave request rejected");
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    },
    onError: () => toast.error("Failed to reject leave request"),
  });

  const createMutation = useMutation({
    mutationFn: () => hrApi.leave.createRequest(requestForm),
    onSuccess: () => {
      toast.success("Leave request submitted");
      setShowRequestDialog(false);
      setRequestForm({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    },
    onError: () => toast.error("Failed to submit leave request"),
  });

  const myRequests = myRequestsData?.data ?? [];
  const allRequests = allRequestsData?.data ?? [];

  const stats = {
    pending: myRequests.filter((r) => r.status === "pending").length,
    approved: myRequests.filter((r) => r.status === "approved" && r.startDate.startsWith(format(new Date(), "yyyy-MM"))).length,
    rejected: myRequests.filter((r) => r.status === "rejected").length,
    remaining: balanceData?.balances?.reduce((a, b) => a + b.remaining, 0) ?? 0,
  };

  const myColumns = [
    { header: "Leave Type", accessorKey: "leaveType" as const },
    { header: "Start Date", accessorKey: "startDate" as const, cell: (r: LeaveRequest) => format(parseISO(r.startDate), "MMM dd, yyyy") },
    { header: "End Date", accessorKey: "endDate" as const, cell: (r: LeaveRequest) => format(parseISO(r.endDate), "MMM dd, yyyy") },
    { header: "Days", accessorKey: "days" as const },
    { header: "Reason", accessorKey: "reason" as const, cell: (r: LeaveRequest) => <span className="truncate max-w-[200px] block">{r.reason}</span> },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: (r: LeaveRequest) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[r.status]}`}>
          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
        </span>
      ),
    },
  ];

  const allColumns = [
    { header: "Employee", accessorKey: "employeeName" as const },
    { header: "Leave Type", accessorKey: "leaveType" as const },
    { header: "Start Date", accessorKey: "startDate" as const, cell: (r: LeaveRequest) => format(parseISO(r.startDate), "MMM dd, yyyy") },
    { header: "End Date", accessorKey: "endDate" as const, cell: (r: LeaveRequest) => format(parseISO(r.endDate), "MMM dd, yyyy") },
    { header: "Days", accessorKey: "days" as const },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: (r: LeaveRequest) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[r.status]}`}>
          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: (r: LeaveRequest) =>
        r.status === "pending" ? (
          <div className="flex gap-2">
            <button
              onClick={() => approveMutation.mutate(r.id)}
              disabled={approveMutation.isPending}
              className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => rejectMutation.mutate(r.id)}
              disabled={rejectMutation.isPending}
              className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
  ];

  const calendarApproved = allRequests.filter((r) => r.status === "approved");

  const today = new Date();
  const calStart = startOfMonth(today);
  const calEnd = endOfMonth(today);
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <PageHeader
        title="Leave Management"
        description="Manage employee leave requests and balances"
        actions={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowRequestDialog(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Request Leave
          </motion.button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Pending Requests" value={stats.pending} icon={<Clock className="w-5 h-5" />} color="amber" />
        <StatsCard title="Approved This Month" value={stats.approved} icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
        <StatsCard title="Rejected" value={stats.rejected} icon={<XCircle className="w-5 h-5" />} color="rose" />
        <StatsCard title="Remaining Balance" value={`${stats.remaining} days`} icon={<CalendarDays className="w-5 h-5" />} color="sky" />
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <motion.button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
            whileHover={{ scale: 1.02 }}
          >
            {tab}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "My Requests" && (
            <DataTable columns={myColumns} data={myRequests} isLoading={myLoading} searchKey="leaveType" searchPlaceholder="Search leave type..." />
          )}

          {activeTab === "All Requests" && (
            <DataTable columns={allColumns} data={allRequests} isLoading={allLoading} searchKey="employeeName" searchPlaceholder="Search employee..." />
          )}

          {activeTab === "Leave Types" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(leaveTypes ?? []).map((lt: LeaveType, i: number) => (
                <motion.div
                  key={lt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{lt.name}</h4>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                      {lt.daysAllowed} days
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{lt.description}</p>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${(lt.daysUsed / lt.daysAllowed) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Used: {lt.daysUsed}</span>
                    <span>Remaining: {lt.daysAllowed - lt.daysUsed}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "Calendar" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Approved Leaves — {format(today, "MMMM yyyy")}</h3>
              <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
                ))}
                {calDays.map((day, i) => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const leavesOnDay = calendarApproved.filter((r) => {
                    const start = parseISO(r.startDate);
                    const end = parseISO(r.endDate);
                    return isWithinInterval(day, { start, end });
                  });
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.005 }}
                      className={`p-2 rounded-lg text-center text-sm min-h-[48px] border ${
                        leavesOnDay.length > 0 ? "bg-red-50 border-red-200" : "border-gray-100"
                      }`}
                    >
                      <span className="text-xs text-gray-700">{format(day, "d")}</span>
                      {leavesOnDay.length > 0 && (
                        <div className="mt-1">
                          {leavesOnDay.slice(0, 2).map((l, j) => (
                            <div key={j} className="text-[10px] bg-red-100 text-red-700 rounded px-1 truncate">
                              {l.employeeName}
                            </div>
                          ))}
                          {leavesOnDay.length > 2 && (
                            <div className="text-[10px] text-red-500">+{leavesOnDay.length - 2} more</div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showRequestDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowRequestDialog(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                Request Leave
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                  <select
                    value={requestForm.leaveTypeId}
                    onChange={(e) => setRequestForm({ ...requestForm, leaveTypeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select leave type</option>
                    {(leaveTypes ?? []).map((lt: LeaveType) => (
                      <option key={lt.id} value={lt.id}>{lt.name} ({lt.daysAllowed - lt.daysUsed} days left)</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={requestForm.startDate}
                      onChange={(e) => setRequestForm({ ...requestForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={requestForm.endDate}
                      onChange={(e) => setRequestForm({ ...requestForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    value={requestForm.reason}
                    onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Reason for leave..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowRequestDialog(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || !requestForm.leaveTypeId || !requestForm.startDate || !requestForm.endDate || !requestForm.reason}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {createMutation.isPending ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}