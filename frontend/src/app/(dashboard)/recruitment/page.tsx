"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Users, Briefcase, FileCheck, UserCheck, Plus, Eye, X, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import StatsCard from "@/components/shared/StatsCard";
import { api } from "@/lib/api";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  description: string;
  location: string;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  openings: number;
  status: string;
  posted_by_name: string;
  created_at: string;
}

interface Applicant {
  id: string;
  job: string;
  job_title: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  applied_date: string;
  status: "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";
  experience: string;
  education: string;
  notes: string;
  resume_url: string;
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

const tabs = ["Pipeline", "Job Postings", "All Applicants"];

export default function RecruitmentPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("Pipeline");
  const [selectedCandidate, setSelectedCandidate] = useState<Applicant | null>(null);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showApplicantDialog, setShowApplicantDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [jobForm, setJobForm] = useState({ title: "", department: "", description: "", location: "", employment_type: "full_time", salary_min: "", salary_max: "", openings: "1", status: "open" });
  const [applicantForm, setApplicantForm] = useState({ job: "", first_name: "", last_name: "", email: "", phone: "", experience: "", education: "", notes: "" });

  const { data: jobsData } = useQuery({
    queryKey: ["job-postings"],
    queryFn: () => api.get("/hr/job-postings/").then((r) => r.data?.results ?? r.data ?? []),
  });

  const { data: applicantsData } = useQuery({
    queryKey: ["applicants"],
    queryFn: () => api.get("/hr/applicants/").then((r) => r.data?.results ?? r.data ?? []),
  });

  const jobs: JobPosting[] = jobsData ?? [];
  const applicants: Applicant[] = applicantsData ?? [];

  const createJobMutation = useMutation({
    mutationFn: (data: any) => api.post("/hr/job-postings/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-postings"] });
      toast.success("Job posted successfully");
      setShowJobDialog(false);
      resetJobForm();
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed to create job"),
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/hr/job-postings/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-postings"] });
      toast.success("Job updated");
      setShowJobDialog(false);
      setEditingJob(null);
      resetJobForm();
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed to update job"),
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/hr/job-postings/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-postings"] });
      toast.success("Job deleted");
    },
  });

  const createApplicantMutation = useMutation({
    mutationFn: (data: any) => api.post("/hr/applicants/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      toast.success("Applicant added");
      setShowApplicantDialog(false);
      resetApplicantForm();
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed to add applicant"),
  });

  const updateApplicantStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/hr/applicants/${id}/`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applicants"] }),
  });

  const resetJobForm = () => setJobForm({ title: "", department: "", description: "", location: "", employment_type: "full_time", salary_min: "", salary_max: "", openings: "1", status: "open" });
  const resetApplicantForm = () => setApplicantForm({ job: "", first_name: "", last_name: "", email: "", phone: "", experience: "", education: "", notes: "" });

  const stats = {
    total: applicants.length,
    inPipeline: applicants.filter((c) => c.status !== "hired" && c.status !== "offer" && c.status !== "rejected").length,
    offers: applicants.filter((c) => c.status === "offer").length,
    hiredThisMonth: applicants.filter((c) => c.status === "hired").length,
  };

  const grouped: Record<string, Applicant[]> = {};
  kanbanColumns.forEach((col) => { grouped[col.key] = []; });
  applicants.forEach((c) => { if (grouped[c.status]) grouped[c.status].push(c); });

  const openJobDialog = (job?: JobPosting) => {
    if (job) {
      setEditingJob(job);
      setJobForm({
        title: job.title, department: job.department, description: job.description, location: job.location,
        employment_type: job.employment_type, salary_min: job.salary_min?.toString() || "",
        salary_max: job.salary_max?.toString() || "", openings: job.openings?.toString() || "1", status: job.status,
      });
    } else {
      setEditingJob(null);
      resetJobForm();
    }
    setShowJobDialog(true);
  };

  const submitJob = () => {
    const payload = {
      ...jobForm,
      salary_min: jobForm.salary_min ? Number(jobForm.salary_min) : null,
      salary_max: jobForm.salary_max ? Number(jobForm.salary_max) : null,
      openings: Number(jobForm.openings) || 1,
    };
    if (editingJob) {
      updateJobMutation.mutate({ id: editingJob.id, data: payload });
    } else {
      createJobMutation.mutate(payload);
    }
  };

  const submitApplicant = () => {
    const job = jobs.find((j) => j.id === applicantForm.job);
    createApplicantMutation.mutate({
      ...applicantForm,
      position: job?.title || "",
      department: job?.department || "",
    });
  };

  const fmtDate = (d?: string) => {
    if (!d) return "-";
    try { return format(parseISO(d), "MMM dd, yyyy"); } catch { return d; }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <PageHeader
        title="Recruitment"
        description="Manage job postings and track applicants through the hiring pipeline"
        actions={
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openJobDialog()}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Post Job
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { resetApplicantForm(); setShowApplicantDialog(true); }}
              className="px-5 py-2.5 bg-white border rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Applicant
            </motion.button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Applications" value={stats.total} icon={<Users className="w-5 h-5" />} color="sky" />
        <StatsCard title="In Pipeline" value={stats.inPipeline} icon={<Briefcase className="w-5 h-5" />} color="amber" />
        <StatsCard title="Offers Extended" value={stats.offers} icon={<FileCheck className="w-5 h-5" />} color="indigo" />
        <StatsCard title="Hired" value={stats.hiredThisMonth} icon={<UserCheck className="w-5 h-5" />} color="emerald" />
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Pipeline" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => (
            <div key={col.key} className="min-w-[280px] flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                <h3 className="font-semibold text-black text-sm">{col.label}</h3>
                <span className="text-xs bg-gray-100 text-black px-2 py-0.5 rounded-full">{grouped[col.key]?.length ?? 0}</span>
              </div>
              <div className="space-y-3 min-h-[200px] bg-gray-100 rounded-xl p-3">
                {grouped[col.key]?.map((candidate, i) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`bg-white rounded-xl p-4 border border-gray-200 border-l-4 ${statusCardColors[candidate.status]} shadow-sm hover:shadow-md transition-all cursor-pointer`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                        {candidate.first_name?.[0]}{candidate.last_name?.[0]}
                      </div>
                      <Eye className="w-4 h-4 text-gray-500" />
                    </div>
                    <h4 className="font-medium text-black mt-3 text-sm">{candidate.full_name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{candidate.position || candidate.job_title}</p>
                    <p className="text-xs text-gray-500 mt-1">{candidate.department}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                      <span className="text-[11px] text-gray-500">{fmtDate(candidate.applied_date)}</span>
                      <span className="text-[11px] text-gray-500">{candidate.experience}</span>
                    </div>
                  </motion.div>
                ))}
                {(!grouped[col.key] || grouped[col.key].length === 0) && (
                  <div className="text-center py-8 text-sm text-gray-500">No candidates</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Job Postings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{job.title}</h4>
                <div className="flex gap-1">
                  <button onClick={() => openJobDialog(job)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="w-3.5 h-3.5 text-gray-500" /></button>
                  <button onClick={() => deleteJobMutation.mutate(job.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-2">{job.department} &middot; {job.location || "Remote"}</p>
              <p className="text-sm text-gray-500 mb-3">{job.employment_type.replace("_", " ")} &middot; {job.openings} opening{job.openings !== 1 ? "s" : ""}</p>
              {job.salary_min && <p className="text-sm font-medium text-emerald-600">${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max || 0).toLocaleString()}</p>}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${job.status === "open" ? "bg-emerald-100 text-emerald-700" : job.status === "draft" ? "bg-gray-100 text-gray-700" : "bg-red-100 text-red-700"}`}>{job.status}</span>
                <span className="text-xs text-gray-500">{fmtDate(job.created_at)}</span>
              </div>
            </motion.div>
          ))}
          {jobs.length === 0 && <div className="col-span-full py-12 text-center text-gray-500">No job postings yet. Click "Post Job" to create one.</div>}
        </div>
      )}

      {activeTab === "All Applicants" && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Position</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Applied</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((a) => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedCandidate(a)}>
                  <td className="p-4 font-medium">{a.full_name}</td>
                  <td className="p-4">{a.position || a.job_title}</td>
                  <td className="p-4 text-gray-500">{a.email}</td>
                  <td className="p-4 text-gray-500">{fmtDate(a.applied_date)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      a.status === "applied" ? "bg-blue-100 text-blue-700" :
                      a.status === "screening" ? "bg-amber-100 text-amber-700" :
                      a.status === "interview" ? "bg-purple-100 text-purple-700" :
                      a.status === "offer" ? "bg-indigo-100 text-indigo-700" :
                      a.status === "hired" ? "bg-emerald-100 text-emerald-700" :
                      "bg-red-100 text-red-700"
                    }`}>{a.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <select
                      value={a.status}
                      onChange={(e) => { e.stopPropagation(); updateApplicantStatus.mutate({ id: a.id, status: e.target.value }); }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="applied">Applied</option>
                      <option value="screening">Screening</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
              {applicants.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">No applicants yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {selectedCandidate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedCandidate(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {selectedCandidate.first_name?.[0]}{selectedCandidate.last_name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-black">{selectedCandidate.full_name}</h3>
                    <p className="text-sm text-gray-500">{selectedCandidate.position || selectedCandidate.job_title}</p>
                    <p className="text-xs text-gray-500">{selectedCandidate.department}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCandidate(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Email</p><p className="text-sm font-medium text-black">{selectedCandidate.email}</p></div>
                  <div className="bg-gray-100 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Phone</p><p className="text-sm font-medium text-black">{selectedCandidate.phone || "-"}</p></div>
                  <div className="bg-gray-100 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Experience</p><p className="text-sm font-medium text-black">{selectedCandidate.experience || "-"}</p></div>
                  <div className="bg-gray-100 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Education</p><p className="text-sm font-medium text-black">{selectedCandidate.education || "-"}</p></div>
                </div>
                <div className="bg-gray-100 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Applied Date</p><p className="text-sm font-medium text-black">{fmtDate(selectedCandidate.applied_date)}</p></div>
                {selectedCandidate.notes && <div className="bg-gray-100 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Notes</p><p className="text-sm text-black">{selectedCandidate.notes}</p></div>}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setSelectedCandidate(null)} className="px-4 py-2 text-black bg-gray-100 rounded-lg hover:bg-gray-200">Close</button>
                <select
                  value={selectedCandidate.status}
                  onChange={(e) => { updateApplicantStatus.mutate({ id: selectedCandidate.id, status: e.target.value }); setSelectedCandidate({ ...selectedCandidate, status: e.target.value as any }); }}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="applied">Applied</option>
                  <option value="screening">Screening</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showJobDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowJobDialog(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">{editingJob ? "Edit Job" : "Post Job"}</h3>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Title *</label><input value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Department</label><input value={jobForm.department} onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" /></div>
                  <div><label className="block text-sm font-medium mb-1">Location</label><input value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Employment Type</label><select value={jobForm.employment_type} onChange={(e) => setJobForm({ ...jobForm, employment_type: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm"><option value="full_time">Full Time</option><option value="part_time">Part Time</option><option value="contract">Contract</option><option value="intern">Intern</option></select></div>
                  <div><label className="block text-sm font-medium mb-1">Openings</label><input type="number" value={jobForm.openings} onChange={(e) => setJobForm({ ...jobForm, openings: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Salary Min</label><input type="number" value={jobForm.salary_min} onChange={(e) => setJobForm({ ...jobForm, salary_min: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" /></div>
                  <div><label className="block text-sm font-medium mb-1">Salary Max</label><input type="number" value={jobForm.salary_max} onChange={(e) => setJobForm({ ...jobForm, salary_max: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" /></div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowJobDialog(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button onClick={submitJob} disabled={!jobForm.title} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{editingJob ? "Update" : "Post"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showApplicantDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowApplicantDialog(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">Add Applicant</h3>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Job Posting *</label><select value={applicantForm.job} onChange={(e) => setApplicantForm({ ...applicantForm, job: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm"><option value="">Select job</option>{jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}</select></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">First Name *</label><input value={applicantForm.first_name} onChange={(e) => setApplicantForm({ ...applicantForm, first_name: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" /></div>
                  <div><label className="block text-sm font-medium mb-1">Last Name *</label><input value={applicantForm.last_name} onChange={(e) => setApplicantForm({ ...applicantForm, last_name: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Email *</label><input type="email" value={applicantForm.email} onChange={(e) => setApplicantForm({ ...applicantForm, email: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" /></div>
                  <div><label className="block text-sm font-medium mb-1">Phone</label><input value={applicantForm.phone} onChange={(e) => setApplicantForm({ ...applicantForm, phone: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Experience</label><input value={applicantForm.experience} onChange={(e) => setApplicantForm({ ...applicantForm, experience: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="e.g. 5 years" /></div>
                  <div><label className="block text-sm font-medium mb-1">Education</label><input value={applicantForm.education} onChange={(e) => setApplicantForm({ ...applicantForm, education: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Notes</label><textarea value={applicantForm.notes} onChange={(e) => setApplicantForm({ ...applicantForm, notes: e.target.value })} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" /></div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowApplicantDialog(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button onClick={submitApplicant} disabled={!applicantForm.first_name || !applicantForm.last_name || !applicantForm.email || !applicantForm.job} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">Add</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
