"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  GraduationCap,
  Star,
  Clock,
  TrendingUp,
  Download,
  User,
  Building2,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { employeeApi } from "@/features/employees/api/employeeApi";
import type { Employee } from "@/types";
import { cn, formatDate, formatCurrency } from "@/lib/utils";

type Tab = "overview" | "documents" | "contracts" | "education" | "skills" | "timeline" | "performance";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: User },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "contracts", label: "Contracts", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Award },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "performance", label: "Performance", icon: TrendingUp },
];

export default function EmployeeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: employeeData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employee", params.id],
    queryFn: () => employeeApi.getEmployee(params.id),
  });

  const { data: documentsData } = useQuery({
    queryKey: ["employee-documents", params.id],
    queryFn: () => employeeApi.getEmployeeDocuments(params.id),
    enabled: activeTab === "documents",
  });

  const { data: contractsData } = useQuery({
    queryKey: ["employee-contracts", params.id],
    queryFn: () => employeeApi.getEmployeeContracts(params.id),
    enabled: activeTab === "contracts",
  });

  const { data: educationData } = useQuery({
    queryKey: ["employee-education", params.id],
    queryFn: () => employeeApi.getEmployeeEducation(params.id),
    enabled: activeTab === "education",
  });

  const { data: skillsData } = useQuery({
    queryKey: ["employee-skills", params.id],
    queryFn: () => employeeApi.getEmployeeSkills(params.id),
    enabled: activeTab === "skills",
  });

  const { data: timelineData } = useQuery({
    queryKey: ["employee-timeline", params.id],
    queryFn: () => employeeApi.getEmployeeTimeline(params.id),
    enabled: activeTab === "timeline",
  });

  const deleteMutation = useMutation({
    mutationFn: employeeApi.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deleted successfully");
      router.push("/employees");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete employee");
      setIsDeleting(false);
    },
  });

  const handleDelete = () => {
    setIsDeleting(true);
    deleteMutation.mutate(params.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !employeeData?.data) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          Failed to load employee details. Please try again.
        </div>
      </div>
    );
  }

  const employee = employeeData.data;

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Full Name</div>
                <div className="font-medium">
                  {employee.firstName} {employee.lastName}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{employee.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="font-medium">{employee.phone || "-"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Address</div>
                <div className="font-medium">
                  {employee.address || "-"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Date of Birth
                </div>
                <div className="font-medium">
                  {employee.dateOfBirth
                    ? formatDate(employee.dateOfBirth)
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-lg font-semibold">Employment Information</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Employee ID
                </div>
                <div className="font-mono font-medium">
                  {employee.employeeId}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Department</div>
                <div className="font-medium">
                  {employee.department?.name || "-"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Designation
                </div>
                <div className="font-medium">
                  {employee.designation?.name || "-"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Branch</div>
                <div className="font-medium">
                  {employee.branch?.name || "-"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Joining Date
                </div>
                <div className="font-medium">
                  {formatDate(employee.joiningDate)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Salary</div>
                <div className="font-medium">
                  {employee.salary
                    ? formatCurrency(employee.salary)
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {employee.emergencyContacts &&
        employee.emergencyContacts.length > 0 && (
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold">Emergency Contacts</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {employee.emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-4"
                >
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {contact.relationship}
                  </div>
                  <div className="mt-2 text-sm">{contact.phone}</div>
                  {contact.email && (
                    <div className="text-sm text-muted-foreground">
                      {contact.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4">
      {documentsData?.data?.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents"
          description="No documents have been uploaded for this employee yet."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documentsData?.data?.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-xl border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{doc.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {doc.type} • {formatDate(doc.uploadedAt)}
                  </div>
                </div>
              </div>
              <a
                href={doc.url}
                download
                className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContracts = () => (
    <div className="space-y-4">
      {contractsData?.data?.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No contracts"
          description="No contracts have been added for this employee yet."
        />
      ) : (
        <div className="space-y-4">
          {contractsData?.data?.map((contract) => (
            <div
              key={contract.id}
              className="rounded-xl border bg-card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{contract.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {contract.type}
                  </div>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    contract.status === "active"
                      ? "bg-green-100 text-green-700"
                      : contract.status === "expired"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  )}
                >
                  {contract.status}
                </span>
              </div>
              <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                <div>
                  <div className="text-muted-foreground">Start Date</div>
                  <div className="font-medium">
                    {formatDate(contract.startDate)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">End Date</div>
                  <div className="font-medium">
                    {contract.endDate
                      ? formatDate(contract.endDate)
                      : "Ongoing"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Salary</div>
                  <div className="font-medium">
                    {contract.salary
                      ? formatCurrency(contract.salary)
                      : "-"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-4">
      {educationData?.data?.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No education records"
          description="No education records have been added for this employee yet."
        />
      ) : (
        <div className="space-y-4">
          {educationData?.data?.map((edu) => (
            <div
              key={edu.id}
              className="rounded-xl border bg-card p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{edu.degree}</div>
                  <div className="text-sm text-muted-foreground">
                    {edu.institution}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {edu.startYear} - {edu.endYear || "Present"}
                </div>
              </div>
              {edu.field && (
                <div className="mt-2 text-sm">Field: {edu.field}</div>
              )}
              {edu.grade && (
                <div className="mt-1 text-sm">
                  Grade: <span className="font-medium">{edu.grade}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-4">
      {skillsData?.data?.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No skills"
          description="No skills have been added for this employee yet."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skillsData?.data?.map((skill) => (
            <div
              key={skill.id}
              className="rounded-xl border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{skill.name}</div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    skill.proficiency === "expert"
                      ? "bg-purple-100 text-purple-700"
                      : skill.proficiency === "advanced"
                      ? "bg-blue-100 text-blue-700"
                      : skill.proficiency === "intermediate"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  )}
                >
                  {skill.proficiency}
                </span>
              </div>
              {skill.yearsOfExperience && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {skill.yearsOfExperience} years of experience
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-4">
      {timelineData?.data?.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No timeline events"
          description="No timeline events have been recorded for this employee yet."
        />
      ) : (
        <div className="relative space-y-6 pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
          {timelineData?.data?.map((event, index) => (
            <div key={event.id} className="relative">
              <div
                className={cn(
                  "absolute -left-5 top-1 h-3 w-3 rounded-full border-2 border-background",
                  event.type === "promotion"
                    ? "bg-green-500"
                    : event.type === "transfer"
                    ? "bg-blue-500"
                    : event.type === "resignation"
                    ? "bg-red-500"
                    : "bg-gray-500"
                )}
              />
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium capitalize">{event.type}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(event.date)}
                  </div>
                </div>
                {event.description && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {event.description}
                  </div>
                )}
                {event.fromValue && event.toValue && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">
                      {event.fromValue}
                    </span>
                    <span className="mx-2">→</span>
                    <span className="font-medium">{event.toValue}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-4">
      {employee.performanceReviews &&
      employee.performanceReviews.length > 0 ? (
        <div className="space-y-4">
          {employee.performanceReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border bg-card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{review.period}</div>
                  <div className="text-sm text-muted-foreground">
                    Review by {review.reviewer}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold">
                    {review.score}/10
                  </span>
                </div>
              </div>
              {review.comments && (
                <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
                  {review.comments}
                </div>
              )}
              {review.goals && review.goals.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium">Goals</div>
                  <ul className="mt-2 space-y-1">
                    {review.goals.map((goal, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            goal.completed ? "bg-green-500" : "bg-gray-300"
                          )}
                        />
                        {goal.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="No performance reviews"
          description="No performance reviews have been recorded for this employee yet."
        />
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "documents":
        return renderDocuments();
      case "contracts":
        return renderContracts();
      case "education":
        return renderEducation();
      case "skills":
        return renderSkills();
      case "timeline":
        return renderTimeline();
      case "performance":
        return renderPerformance();
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="flex items-center justify-between">
        <PageHeader
          title={`${employee.firstName} ${employee.lastName}`}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/employees/${params.id}/edit`)}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="w-full md:w-64 shrink-0">
          <div className="rounded-xl border bg-card p-6 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {employee.avatar ? (
                <img
                  src={employee.avatar}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                `${employee.firstName[0]}${employee.lastName[0]}`
              )}
            </div>
            <h2 className="mt-4 text-lg font-semibold">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {employee.designation?.name || "No designation"}
            </p>
            <p className="text-sm text-muted-foreground">
              {employee.department?.name || "No department"}
            </p>
            <div className="mt-4 space-y-2 text-sm text-left">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{employee.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.phone}</span>
                </div>
              )}
              {employee.branch && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.branch.name}</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                  employee.status === "active"
                    ? "bg-green-100 text-green-700"
                    : employee.status === "on_leave"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                )}
              >
                {employee.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap gap-1 rounded-lg border bg-muted p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6">{renderTabContent()}</div>
        </div>
      </div>
    </motion.div>
  );
}
