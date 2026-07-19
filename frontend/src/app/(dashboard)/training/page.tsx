"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { GraduationCap, Users, Clock, CheckCircle, Plus, MapPin, Calendar, X } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import StatsCard from "@/components/shared/StatsCard";
import { hrApi, Training } from "@/features/hr/api/hrApi";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  "in-progress": "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

const progressColors: Record<string, string> = {
  scheduled: "bg-blue-400",
  "in-progress": "bg-amber-400",
  completed: "bg-emerald-400",
  cancelled: "bg-gray-300",
};

export default function TrainingPage() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    trainer: "",
    description: "",
    startDate: "",
    endDate: "",
    maxParticipants: 0,
    location: "",
    category: "",
  });

  const { data: trainings, isLoading } = useQuery({
    queryKey: ["trainings"],
    queryFn: () => hrApi.training.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: () => hrApi.training.create(createForm as any),
    onSuccess: () => {
      toast.success("Training created successfully");
      setShowCreateDialog(false);
      setCreateForm({ title: "", trainer: "", description: "", startDate: "", endDate: "", maxParticipants: 0, location: "", category: "" });
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
    },
    onError: () => toast.error("Failed to create training"),
  });

  const trainingList = trainings?.data ?? [];

  const stats = {
    active: trainingList.filter((t) => t.status === "in-progress").length,
    upcoming: trainingList.filter((t) => t.status === "scheduled").length,
    completed: trainingList.filter((t) => t.status === "completed").length,
    totalParticipants: trainingList.reduce((a, b) => a + b.currentParticipants, 0),
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <PageHeader
        title="Training & Development"
        description="Manage employee training programs and track participation"
        actions={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateDialog(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Training
          </motion.button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active Trainings" value={stats.active} icon={<GraduationCap className="w-5 h-5" />} color="amber" />
        <StatsCard title="Upcoming" value={stats.upcoming} icon={<Clock className="w-5 h-5" />} color="sky" />
        <StatsCard title="Completed" value={stats.completed} icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
        <StatsCard title="Total Participants" value={stats.totalParticipants} icon={<Users className="w-5 h-5" />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainingList.map((training, i) => (
          <motion.div
            key={training.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-gray-900 leading-tight">{training.title}</h4>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[training.status]}`}>
                  {training.status.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{training.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{training.trainer}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{format(parseISO(training.startDate), "MMM dd")} — {format(parseISO(training.endDate), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{training.location}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Participants</span>
                  <span className="text-xs font-medium text-gray-700">{training.currentParticipants}/{training.maxParticipants}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${training.progress}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-2 rounded-full ${progressColors[training.status]}`}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[11px] text-gray-400">Progress</span>
                  <span className="text-[11px] font-medium text-gray-600">{training.progress}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {trainingList.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No training programs found</p>
        </div>
      )}

      <AnimatePresence>
        {showCreateDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreateDialog(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  Create Training
                </h3>
                <button onClick={() => setShowCreateDialog(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Training title" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trainer</label>
                  <input type="text" value={createForm.trainer} onChange={(e) => setCreateForm({ ...createForm, trainer: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Trainer name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Training description..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" value={createForm.startDate} onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" value={createForm.endDate} onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                    <input type="number" value={createForm.maxParticipants || ""} onChange={(e) => setCreateForm({ ...createForm, maxParticipants: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
                      <option value="">Select category</option>
                      <option value="technical">Technical</option>
                      <option value="leadership">Leadership</option>
                      <option value="compliance">Compliance</option>
                      <option value="soft-skills">Soft Skills</option>
                      <option value="onboarding">Onboarding</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" value={createForm.location} onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Location or 'Online'" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowCreateDialog(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || !createForm.title || !createForm.trainer || !createForm.startDate || !createForm.endDate}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {createMutation.isPending ? "Creating..." : "Create Training"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}