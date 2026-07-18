"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { DollarSign, FileText, Clock, TrendingUp, Play, Download, Plus, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import DataTable from "@/components/layout/DataTable";
import StatsCard from "@/components/shared/StatsCard";
import { hrApi, Payslip, PayrollPeriod, SalaryStructure } from "@/features/hr/api/hrApi";

const periodStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  closed: "bg-purple-100 text-purple-700",
};

const payslipStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  processed: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
};

const tabs = ["Payroll Periods", "Payslips", "Salary Structures"];

export default function PayrollPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("Payroll Periods");
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [expandedStructure, setExpandedStructure] = useState<string | null>(null);

  const { data: periods, isLoading: periodsLoading } = useQuery({
    queryKey: ["payrollPeriods"],
    queryFn: () => hrApi.payroll.getPeriods(),
  });

  const { data: payslipsData, isLoading: payslipsLoading } = useQuery({
    queryKey: ["payslips"],
    queryFn: () => hrApi.payroll.getPayslips(),
    enabled: activeTab === "Payslips",
  });

  const { data: structures, isLoading: structuresLoading } = useQuery({
    queryKey: ["salaryStructures"],
    queryFn: () => hrApi.salary.getStructures(),
    enabled: activeTab === "Salary Structures",
  });

  const generateMutation = useMutation({
    mutationFn: () => hrApi.payroll.generatePayslip({ periodId: selectedPeriod }),
    onSuccess: () => {
      toast.success("Payslips generated successfully");
      setShowGenerateDialog(false);
      setSelectedPeriod("");
      queryClient.invalidateQueries({ queryKey: ["payslips"] });
      queryClient.invalidateQueries({ queryKey: ["payrollPeriods"] });
    },
    onError: () => toast.error("Failed to generate payslips"),
  });

  const payslips = payslipsData?.data ?? [];

  const stats = {
    totalPayroll: payslips.reduce((a, b) => a + b.netPay, 0),
    processed: payslips.filter((p) => p.status === "processed").length,
    pending: payslips.filter((p) => p.status === "draft").length,
    avgSalary: payslips.length > 0 ? payslips.reduce((a, b) => a + b.netPay, 0) / payslips.length : 0,
  };

  const periodColumns = [
    { header: "Period", accessorKey: "name" as const },
    { header: "Start Date", accessorKey: "startDate" as const, cell: (r: PayrollPeriod) => format(parseISO(r.startDate), "MMM dd, yyyy") },
    { header: "End Date", accessorKey: "endDate" as const, cell: (r: PayrollPeriod) => format(parseISO(r.endDate), "MMM dd, yyyy") },
    { header: "Employees", accessorKey: "totalEmployees" as const },
    {
      header: "Total Amount",
      accessorKey: "totalAmount" as const,
      cell: (r: PayrollPeriod) => <span className="font-semibold text-gray-900">${r.totalAmount.toLocaleString()}</span>,
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: (r: PayrollPeriod) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${periodStatusColors[r.status]}`}>
          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
        </span>
      ),
    },
  ];

  const payslipColumns = [
    { header: "Employee", accessorKey: "employeeName" as const },
    { header: "Period", accessorKey: "periodName" as const },
    { header: "Gross Pay", accessorKey: "grossPay" as const, cell: (r: Payslip) => `$${r.grossPay.toLocaleString()}` },
    { header: "Deductions", accessorKey: "deductions" as const, cell: (r: Payslip) => <span className="text-red-600">-${r.deductions.toLocaleString()}</span> },
    {
      header: "Net Pay",
      accessorKey: "netPay" as const,
      cell: (r: Payslip) => <span className="font-semibold text-emerald-700">${r.netPay.toLocaleString()}</span>,
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: (r: Payslip) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${payslipStatusColors[r.status]}`}>
          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id" as const,
      cell: (r: Payslip) => (
        <button className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
          <Download className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <PageHeader
        title="Payroll Management"
        description="Manage payroll periods, payslips, and salary structures"
        actions={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowGenerateDialog(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Generate Payslips
          </motion.button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Payroll" value={`$${(stats.totalPayroll / 1000).toFixed(1)}k`} icon={<DollarSign className="w-5 h-5" />} color="emerald" />
        <StatsCard title="Processed This Month" value={stats.processed} icon={<FileText className="w-5 h-5" />} color="sky" />
        <StatsCard title="Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} color="amber" />
        <StatsCard title="Average Salary" value={`$${(stats.avgSalary / 1000).toFixed(1)}k`} icon={<TrendingUp className="w-5 h-5" />} color="indigo" />
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
          {activeTab === "Payroll Periods" && (
            <DataTable columns={periodColumns} data={periods ?? []} isLoading={periodsLoading} searchKey="name" searchPlaceholder="Search periods..." />
          )}

          {activeTab === "Payslips" && (
            <DataTable columns={payslipColumns} data={payslips} isLoading={payslipsLoading} searchKey="employeeName" searchPlaceholder="Search employee..." />
          )}

          {activeTab === "Salary Structures" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(structures ?? []).map((s: SalaryStructure, i: number) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{s.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{s.description}</p>
                      </div>
                      <span className="text-lg font-bold text-emerald-600">${s.baseSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Layers className="w-4 h-4" />
                      <span>Base Salary</span>
                    </div>
                    <button
                      onClick={() => setExpandedStructure(expandedStructure === s.id ? null : s.id)}
                      className="mt-3 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      {expandedStructure === s.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {expandedStructure === s.id ? "Hide Details" : "View Breakdown"}
                    </button>
                  </div>
                  <AnimatePresence>
                    {expandedStructure === s.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 p-5 bg-gray-50">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">Allowances</h5>
                              {Object.entries(s.allowances).map(([key, val]) => (
                                <div key={key} className="flex justify-between text-sm py-1">
                                  <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                                  <span className="font-medium text-emerald-600">+${val.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                            <div>
                              <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">Deductions</h5>
                              {Object.entries(s.deductions).map(([key, val]) => (
                                <div key={key} className="flex justify-between text-sm py-1">
                                  <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                                  <span className="font-medium text-red-600">-${val.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showGenerateDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowGenerateDialog(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-indigo-600" />
                Generate Payslips
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Period</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select period</option>
                    {(periods ?? []).map((p: PayrollPeriod) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-gray-500">Payslips will be generated for all active employees in the selected period.</p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowGenerateDialog(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                <button
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending || !selectedPeriod}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {generateMutation.isPending ? "Generating..." : "Generate"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}