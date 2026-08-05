"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Star, ClipboardCheck, TrendingUp, Award, Plus, ChevronDown, ChevronUp, X } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import StatsCard from "@/components/shared/StatsCard";
import { hrApi, PerformanceReview } from "@/features/hr/api/hrApi";
import { employeeApi } from "@/features/employees/api/employeeApi";
import { useAuthStore } from "@/stores/authStore";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-amber-100 text-amber-700",
  acknowledged: "bg-emerald-100 text-emerald-700",
};

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${s <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}

export default function PerformancePage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    employee: "",
    review_period_start: "",
    review_period_end: "",
    overall_rating: 3,
    technical_skills: 3,
    communication: 3,
    teamwork: 3,
    leadership: 3,
    goals_met: 3,
    strengths: "",
    improvements: "",
    comments: "",
  });

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["performanceReviews"],
    queryFn: () => hrApi.performance.getReviews(),
  });

  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeApi.getEmployees(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      hrApi.performance.createReview({
        ...createForm,
        employee: createForm.employee,
        reviewer: user?.id || "",
        status: "draft",
      }),
    onSuccess: () => {
      toast.success("Performance review created");
      setShowCreateDialog(false);
      queryClient.invalidateQueries({ queryKey: ["performanceReviews"] });
      setCreateForm({
        employee: "",
        review_period_start: "",
        review_period_end: "",
        overall_rating: 3,
        technical_skills: 3,
        communication: 3,
        teamwork: 3,
        leadership: 3,
        goals_met: 3,
        strengths: "",
        improvements: "",
        comments: "",
      });
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.error?.message || e?.response?.data?.detail || "Failed to create review";
      toast.error(msg);
    },
  });

  const reviews = reviewsData?.data ?? [];
  const employees = employeesData?.data ?? [];

  const stats = {
    completed: reviews.filter((r: PerformanceReview) => r.status === "acknowledged").length,
    avgRating: reviews.length > 0 ? (reviews.reduce((a: number, b: PerformanceReview) => a + b.overall_rating, 0) / reviews.length).toFixed(1) : "0.0",
    pending: reviews.filter((r: PerformanceReview) => r.status === "draft" || r.status === "submitted").length,
    topPerformers: reviews.filter((r: PerformanceReview) => r.overall_rating >= 4).length,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <PageHeader
        title="Performance Reviews"
        description="Track and manage employee performance evaluations"
        actions={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateDialog(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Review
          </motion.button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Completed Reviews" value={stats.completed} icon={<ClipboardCheck className="w-5 h-5" />} color="emerald" />
        <StatsCard title="Average Rating" value={stats.avgRating} icon={<Star className="w-5 h-5" />} color="amber" />
        <StatsCard title="Pending Reviews" value={stats.pending} icon={<TrendingUp className="w-5 h-5" />} color="sky" />
        <StatsCard title="Top Performers" value={stats.topPerformers} icon={<Award className="w-5 h-5" />} color="indigo" />
      </div>

      <div className="space-y-3">
        {reviews.map((review: PerformanceReview, i: number) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
              className="w-full p-5 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                  {(review.employee_name || "").split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{review.employee_name}</h4>
                  <p className="text-sm text-gray-500">
                    {review.review_period_start && review.review_period_end
                      ? `${format(parseISO(review.review_period_start), "MMM yyyy")} - ${format(parseISO(review.review_period_end), "MMM yyyy")}`
                      : "-"}{" "}
                    {review.reviewer_name ? `by ${review.reviewer_name}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StarRating rating={review.overall_rating} />
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[review.status] || ""}`}>
                  {(review.status || "draft").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </span>
                {expandedReview === review.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {expandedReview === review.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {[
                        { name: "Technical Skills", value: review.technical_skills },
                        { name: "Communication", value: review.communication },
                        { name: "Teamwork", value: review.teamwork },
                        { name: "Leadership", value: review.leadership },
                        { name: "Goals Met", value: review.goals_met },
                      ].filter((c) => c.value != null).map((cat) => (
                        <div key={cat.name} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">{cat.name}</p>
                          <StarRating rating={cat.value!} size={14} />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <h5 className="text-xs font-medium text-emerald-700 uppercase mb-2">Strengths</h5>
                        <p className="text-sm text-gray-700">{review.strengths || "-"}</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-4">
                        <h5 className="text-xs font-medium text-amber-700 uppercase mb-2">Areas for Improvement</h5>
                        <p className="text-sm text-gray-700">{review.improvements || "-"}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="text-xs font-medium text-blue-700 uppercase mb-2">Comments</h5>
                        <p className="text-sm text-gray-700">{review.comments || "-"}</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <span className="text-xs text-gray-400">
                        Created{" "}
                        {review.created_at
                          ? (() => {
                              try {
                                return format(parseISO(review.created_at), "MMM dd, yyyy 'at' hh:mm a");
                              } catch {
                                return review.created_at;
                              }
                            })()
                          : "-"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {reviews.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No performance reviews found</p>
        </div>
      )}

      <AnimatePresence>
        {showCreateDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowCreateDialog(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                  New Performance Review
                </h3>
                <button onClick={() => setShowCreateDialog(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                  <select
                    value={createForm.employee}
                    onChange={(e) => setCreateForm({ ...createForm, employee: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp: any) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name || emp.employee_name || emp.name || emp.email} {emp.last_name || ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period Start *</label>
                    <input
                      type="date"
                      value={createForm.review_period_start}
                      onChange={(e) => setCreateForm({ ...createForm, review_period_start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period End *</label>
                    <input
                      type="date"
                      value={createForm.review_period_end}
                      onChange={(e) => setCreateForm({ ...createForm, review_period_end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overall Rating</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setCreateForm({ ...createForm, overall_rating: s })}>
                        <Star className={`w-8 h-8 cursor-pointer transition-colors ${
                          s <= createForm.overall_rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Category Ratings</p>
                  {[
                    { key: "technical_skills" as const, label: "Technical Skills" },
                    { key: "communication" as const, label: "Communication" },
                    { key: "teamwork" as const, label: "Teamwork" },
                    { key: "leadership" as const, label: "Leadership" },
                    { key: "goals_met" as const, label: "Goals Met" },
                  ].map((cat) => (
                    <div key={cat.key} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{cat.label}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button key={s} onClick={() => setCreateForm({ ...createForm, [cat.key]: s })}>
                              <Star className={`w-4 h-4 cursor-pointer ${
                                s <= createForm[cat.key] ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                              }`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Strengths</label>
                  <textarea value={createForm.strengths} onChange={(e) => setCreateForm({ ...createForm, strengths: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Key strengths..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Areas for Improvement</label>
                  <textarea value={createForm.improvements} onChange={(e) => setCreateForm({ ...createForm, improvements: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Areas for improvement..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                  <textarea value={createForm.comments} onChange={(e) => setCreateForm({ ...createForm, comments: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Additional comments..." />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowCreateDialog(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || !createForm.employee || !createForm.review_period_start || !createForm.review_period_end}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {createMutation.isPending ? "Creating..." : "Create Review"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
