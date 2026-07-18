"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Users, Briefcase, FileCheck, UserCheck, Plus, Eye, X } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatsCard from "@/components/shared/StatsCard";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  appliedDate: string;
  status: "applied" | "screening" | "interview" | "offer" | "hired";
  resumeUrl: string;
  notes: string;
  experience: string;
  education: string;
}

const kanbanColumns = [
  { key: "applied", label: "Applied", color: "bg-blue-500" },
  { key: "screening", label: "Screening", color: "bg-amber-500" },
  { key: "interview", label: "Interview", color: "bg-purple-500" },
  { key: "offer", label: "Offer", color: "bg-indigo-500" },
  { key: "hired", label: "Hired", color: "bg-emerald-500" },
] as const;

const statusCardColors: Record<string, string> = {
  applied: "border-l-blue-500",
  screening: "border-l-amber-500",
  interview: "border-l-purple-500",
  offer: "border-l-indigo-500",
  hired: "border-l-emerald-500",
};

const mockCandidates: Candidate[] = [
  { id: "1", name: "Sarah Johnson", email: "sarah@example.com", phone: "+1 555-0101", position: "Senior Frontend Developer", department: "Engineering", appliedDate: "2026-07-10", status: "applied", resumeUrl: "", notes: "Strong React skills", experience: "5 years", education: "BS Computer Science" },
  { id: "2", name: "Michael Chen", email: "michael@example.com", phone: "+1 555-0102", position: "Backend Engineer", department: "Engineering", appliedDate: "2026-07-08", status: "screening", resumeUrl: "", notes: "Go and Python expertise", experience: "7 years", education: "MS Software Engineering" },
  { id: "3", name: "Emily Rodriguez", email: "emily@example.com", phone: "+1 555-0103", position: "Product Manager", department: "Product", appliedDate: "2026-07-05", status: "interview", resumeUrl: "", notes: "Former FAANG PM", experience: "8 years", education: "MBA" },
  { id: "4", name: "David Kim", email: "david@example.com", phone: "+1 555-0104", position: "DevOps Engineer", department: "Engineering", appliedDate: "2026-07-02", status: "offer", resumeUrl: "", notes: "AWS certified", experience: "4 years", education: "BS Information Technology" },
  { id: "5", name: "Lisa Thompson", email: "lisa@example.com", phone: "+1 555-0105", position: "UX Designer", department: "Design", appliedDate: "2026-06-28", status: "hired", resumeUrl: "", notes: "Exceptional portfolio", experience: "6 years", education: "BFA Interaction Design" },
  { id: "6", name: "James Wilson", email: "james@example.com", phone: "+1 555-0106", position: "Data Analyst", department: "Data", appliedDate: "2026-07-12", status: "applied", resumeUrl: "", notes: "Strong SQL and Python", experience: "3 years", education: "MS Data Science" },
  { id: "7", name: "Anna Martinez", email: "anna@example.com", phone: "+1 555-0107", position: "Marketing Manager", department: "Marketing", appliedDate: "2026-07-09", status: "screening", resumeUrl: "", notes: "B2B SaaS experience", experience: "5 years", education: "BA Marketing" },
  { id: "8", name: "Robert Brown", email: "robert@example.com", phone: "+1 555-0108", position: "Senior Frontend Developer", department: "Engineering", appliedDate: "2026-07-06", status: "interview", resumeUrl: "", notes: "Next.js and TypeScript expert", experience: "6 years", education: "BS Computer Science" },
  { id: "9", name: "Priya Patel", email: "priya@example.com", phone: "+1 555-0109", position: "QA Engineer", department: "Engineering", appliedDate: "2026-07-01", status: "hired", resumeUrl: "", notes: "Automation specialist", experience: "4 years", education: "BS Computer Engineering" },
  { id: "10", name: "Alex Nguyen", email: "alex@example.com", phone: "+1 555-0110", position: "Product Manager", department: "Product", appliedDate: "2026-07-14", status: "applied", resumeUrl: "", notes: "Startup experience", experience: "3 years", education: "MS Product Management" },
];

export default function RecruitmentPage() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidates, setCandidates] = useState(mockCandidates);

  const stats = {
    total: candidates.length,
    inPipeline: candidates.filter((c) => c.status !== "hired" && c.status !== "offer").length,
    offers: candidates.filter((c) => c.status === "offer").length,
    hiredThisMonth: candidates.filter((c) => c.status === "hired" && c.appliedDate.startsWith("2026-07")).length,
  };

  const grouped = useMemo(() => {
    const map: Record<string, Candidate[]> = {};
    kanbanColumns.forEach((col) => { map[col.key] = []; });
    candidates.forEach((c) => {
      if (map[c.status]) map[c.status].push(c);
    });
    return map;
  }, [candidates]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <PageHeader
        title="Recruitment"
        description="Manage job postings and track applicants through the hiring pipeline"
        actions={
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Post Job
          </motion.button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Applications" value={stats.total} icon={<Users className="w-5 h-5" />} color="sky" />
        <StatsCard title="In Pipeline" value={stats.inPipeline} icon={<Briefcase className="w-5 h-5" />} color="amber" />
        <StatsCard title="Offers Extended" value={stats.offers} icon={<FileCheck className="w-5 h-5" />} color="indigo" />
        <StatsCard title="Hired This Month" value={stats.hiredThisMonth} icon={<UserCheck className="w-5 h-5" />} color="emerald" />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {kanbanColumns.map((col) => (
          <div key={col.key} className="min-w-[280px] flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
              <h3 className="font-semibold text-gray-800 text-sm">{col.label}</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{grouped[col.key]?.length ?? 0}</span>
            </div>
            <div className="space-y-3 min-h-[200px] bg-gray-50 rounded-xl p-3">
              {grouped[col.key]?.map((candidate, i) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  drag
                  dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                  dragElastic={0.1}
                  onDragEnd={() => {}}
                  onClick={() => setSelectedCandidate(candidate)}
                  className={`bg-white rounded-xl p-4 border border-gray-200 border-l-4 ${statusCardColors[candidate.status]} shadow-sm hover:shadow-md transition-all cursor-pointer`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                      {candidate.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <Eye className="w-4 h-4 text-gray-400" />
                  </div>
                  <h4 className="font-medium text-gray-900 mt-3 text-sm">{candidate.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{candidate.position}</p>
                  <p className="text-xs text-gray-400 mt-1">{candidate.department}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-[11px] text-gray-400">{format(parseISO(candidate.appliedDate), "MMM dd, yyyy")}</span>
                    <span className="text-[11px] text-gray-500">{candidate.experience}</span>
                  </div>
                </motion.div>
              ))}
              {(!grouped[col.key] || grouped[col.key].length === 0) && (
                <div className="text-center py-8 text-sm text-gray-400">No candidates</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setSelectedCandidate(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {selectedCandidate.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedCandidate.name}</h3>
                    <p className="text-sm text-gray-500">{selectedCandidate.position}</p>
                    <p className="text-xs text-gray-400">{selectedCandidate.department}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCandidate(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedCandidate.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedCandidate.phone}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Experience</p>
                    <p className="text-sm font-medium text-gray-900">{selectedCandidate.experience}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Education</p>
                    <p className="text-sm font-medium text-gray-900">{selectedCandidate.education}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Applied Date</p>
                  <p className="text-sm font-medium text-gray-900">{format(parseISO(selectedCandidate.appliedDate), "MMMM dd, yyyy")}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{selectedCandidate.notes}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setSelectedCandidate(null)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Close
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Move Forward
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}