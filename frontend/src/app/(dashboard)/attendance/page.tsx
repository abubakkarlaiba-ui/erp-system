"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isWithinInterval } from "date-fns";
import { Clock, CalendarDays, Users, TrendingUp, CheckCircle, XCircle, Timer, Filter } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/layout/DataTable";
import StatsCard from "@/components/shared/StatsCard";
import { hrApi, AttendanceRecord } from "@/features/hr/api/hrApi";

const statusColors: Record<string, string> = {
  present: "bg-emerald-100 text-emerald-700",
  absent: "bg-red-100 text-red-700",
  late: "bg-amber-100 text-amber-700",
  "half-day": "bg-orange-100 text-orange-700",
  "on-leave": "bg-blue-100 text-blue-700",
};

const statusDotColors: Record<string, string> = {
  present: "bg-emerald-500",
  absent: "bg-red-500",
  late: "bg-amber-500",
  "half-day": "bg-orange-500",
  "on-leave": "bg-blue-500",
};

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showMarkDialog, setShowMarkDialog] = useState(false);
  const [markForm, setMarkForm] = useState({ employeeId: "", date: "", status: "present", checkIn: "", checkOut: "" });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["attendance", filterDateFrom, filterDateTo, filterEmployee, filterStatus],
    queryFn: () =>
      hrApi.attendance.get({
        startDate: filterDateFrom || format(monthStart, "yyyy-MM-dd"),
        endDate: filterDateTo || format(monthEnd, "yyyy-MM-dd"),
        employeeId: filterEmployee || undefined,
        status: filterStatus || undefined,
      }),
  });

  const records: AttendanceRecord[] = useMemo(() => {
    const raw = (attendanceData as any)?.data?.results ?? [];
    return raw.map((r: any) => ({
      id: String(r.id),
      employeeId: String(r.employee),
      employeeName: r.employee_name || "-",
      date: r.date || "",
      checkIn: r.check_in || null,
      checkOut: r.check_out || null,
      hoursWorked: Number(r.hours_worked) || 0,
      status: r.status || "present",
      overtime: Number(r.overtime_hours) || 0,
    }));
  }, [attendanceData]);

  const stats = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayRecords = records.filter((r) => r.date === today);
    const present = todayRecords.filter((r) => r.status === "present" || r.status === "late").length;
    const absent = todayRecords.filter((r) => r.status === "absent").length;
    const avgHours = todayRecords.length > 0 ? todayRecords.reduce((a, b) => a + b.hoursWorked, 0) / todayRecords.length : 0;
    const overtimeThisMonth = records.reduce((a, b) => a + b.overtime, 0);
    return { present, absent, avgHours: avgHours.toFixed(1), overtimeThisMonth: overtimeThisMonth.toFixed(1) };
  }, [records]);

  const clockInMutation = useMutation({
    mutationFn: () => hrApi.attendance.clockIn(),
    onSuccess: () => {
      toast.success("Clocked in successfully");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: () => toast.error("Failed to clock in"),
  });

  const clockOutMutation = useMutation({
    mutationFn: () => hrApi.attendance.clockOut(),
    onSuccess: () => {
      toast.success("Clocked out successfully");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: () => toast.error("Failed to clock out"),
  });

  const markMutation = useMutation({
    mutationFn: () => hrApi.attendance.mark(markForm),
    onSuccess: () => {
      toast.success("Attendance marked successfully");
      setShowMarkDialog(false);
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: () => toast.error("Failed to mark attendance"),
  });

  const todayRecord = records.find((r) => r.date === format(new Date(), "yyyy-MM-dd"));
  const clockedIn = todayRecord?.checkIn && !todayRecord?.checkOut;

  const columns = [
    { header: "Date", accessorKey: "date" as const, cell: (info: any) => {
      const row = info.row?.original || info;
      return format(parseISO(row.date), "MMM dd, yyyy");
    }},
    { header: "Employee", accessorKey: "employeeName" as const, cell: (info: any) => {
      const row = info.row?.original || info;
      return row.employeeName || "-";
    }},
    { header: "Check In", accessorKey: "checkIn" as const, cell: (info: any) => {
      const row = info.row?.original || info;
      return row.checkIn ? format(parseISO(row.checkIn), "hh:mm a") : "—";
    }},
    { header: "Check Out", accessorKey: "checkOut" as const, cell: (info: any) => {
      const row = info.row?.original || info;
      return row.checkOut ? format(parseISO(row.checkOut), "hh:mm a") : "—";
    }},
    { header: "Hours", accessorKey: "hoursWorked" as const, cell: (info: any) => {
      const row = info.row?.original || info;
      return `${Number(row.hoursWorked || 0).toFixed(1)}h`;
    }},
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: (info: any) => {
        const row = info.row?.original || info;
        const status = String(row.status || "present");
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-700"}`}>
            {status.replace("-", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
          </span>
        );
      },
    },
    {
      header: "Overtime",
      accessorKey: "overtime" as const,
      cell: (info: any) => {
        const row = info.row?.original || info;
        return (Number(row.overtime || 0) > 0 ? <span className="text-amber-600 font-medium">{row.overtime}h</span> : "—");
      },
    },
  ];

  const calendarHeatmap = useMemo(() => {
    const map: Record<string, AttendanceRecord> = {};
    records.forEach((r) => { map[r.date] = r; });
    return map;
  }, [records]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <PageHeader
        title="Attendance Management"
        description="Track employee attendance and work hours"
        actions={
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => (clockedIn ? clockOutMutation.mutate() : clockInMutation.mutate())}
              disabled={clockInMutation.isPending || clockOutMutation.isPending}
              className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                clockedIn
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              } disabled:opacity-50`}
            >
              {clockedIn ? <Clock className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
              {clockedIn ? "Clock Out" : "Clock In"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowMarkDialog(true)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Mark Attendance
            </motion.button>
          </div>
        }
      />

      {todayRecord?.checkIn && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span className="text-sm text-gray-600">Clocked In:</span>
              <span className="font-semibold text-indigo-700">{format(parseISO(todayRecord.checkIn), "hh:mm a")}</span>
            </div>
            {todayRecord.checkOut && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                <span className="text-sm text-gray-600">Clocked Out:</span>
                <span className="font-semibold text-red-700">{format(parseISO(todayRecord.checkOut), "hh:mm a")}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-gray-600">Hours Today:</span>
              <span className="font-semibold text-amber-700">{todayRecord.hoursWorked.toFixed(1)}h</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Today Present" value={stats.present} icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
        <StatsCard title="Today Absent" value={stats.absent} icon={<XCircle className="w-5 h-5" />} color="rose" />
        <StatsCard title="Average Hours" value={`${stats.avgHours}h`} icon={<Timer className="w-5 h-5" />} color="sky" />
        <StatsCard title="Overtime This Month" value={`${stats.overtimeThisMonth}h`} icon={<TrendingUp className="w-5 h-5" />} color="amber" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Attendance Calendar</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ‹
            </button>
            <span className="font-medium text-gray-700 min-w-[140px] text-center">{format(currentMonth, "MMMM yyyy")}</span>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ›
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4 text-xs">
          {Object.entries(statusDotColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="text-gray-600 capitalize">{status.replace("-", " ")}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
          ))}
          {monthDays.map((day, i) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const record = calendarHeatmap[dateStr];
            const dayOfWeek = day.getDay();
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.01 }}
                className={`relative p-2 rounded-lg text-center text-sm min-h-[48px] border border-gray-100 ${
                  record ? (statusColors[record.status] ?? "bg-gray-50") : dayOfWeek === 0 || dayOfWeek === 6 ? "bg-gray-50" : ""
                }`}
              >
                <span className="text-xs text-gray-700">{format(day, "d")}</span>
                {record && (
                  <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${statusDotColors[record.status]}`} />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Employee</label>
            <input
              type="text"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              placeholder="Search employee..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={records} isLoading={isLoading} />

      {showMarkDialog && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowMarkDialog(false)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Mark Attendance</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={markForm.employeeId}
                  onChange={(e) => setMarkForm({ ...markForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter employee ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={markForm.date}
                  onChange={(e) => setMarkForm({ ...markForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={markForm.status}
                  onChange={(e) => setMarkForm({ ...markForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half-day">Half Day</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                  <input
                    type="time"
                    value={markForm.checkIn}
                    onChange={(e) => setMarkForm({ ...markForm, checkIn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                  <input
                    type="time"
                    value={markForm.checkOut}
                    onChange={(e) => setMarkForm({ ...markForm, checkOut: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowMarkDialog(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
              <button
                onClick={() => markMutation.mutate()}
                disabled={markMutation.isPending || !markForm.employeeId || !markForm.date}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {markMutation.isPending ? "Marking..." : "Mark Attendance"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}