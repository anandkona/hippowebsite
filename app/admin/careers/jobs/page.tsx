"use client";

import PermissionGate from "@/components/admin/PermissionGate";

import { useEffect, useState } from "react";
import Link from "next/link";
import CareersSubNav from "@/components/admin/CareersSubNav";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  PauseCircle,
  Loader2,
  ExternalLink,
  PlusCircle,
  X,
  MapPin,
  Clock,
  Sparkles,
  Edit2,
  AlertTriangle
} from "lucide-react";

export default function AdminJobsManagementPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);

  // Delete Confirmation Modal State
  const [jobToDelete, setJobToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Publish Confirmation Modal State
  const [jobToPublish, setJobToPublish] = useState<any | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // New Job Form State
  const [formData, setFormData] = useState({
    title: "",
    department: "Software Development",
    work_mode: "Onsite",
    city: "Visakhapatnam",
    country: "India",
    openings: 1,
    employment_type: "Full Time",
    min_experience: 2,
    max_experience: 5,
    min_salary_lpa: 8,
    max_salary_lpa: 15,
    short_summary: "",
    start_date: "",
    end_date: "",
    responsibilities: [
      "Architect, develop, and maintain performant cloud and web applications.",
      "Collaborate with product designers and engineering squads on sprint goals.",
      "Conduct rigorous code reviews and write clean, modular, and testable code."
    ] as string[],
    required_skills: [
      "React",
      "Node.js",
      "TypeScript",
      "PostgreSQL"
    ] as string[],
    status: "Published",
    featured: false
  });

  useEffect(() => {
    fetchJobs();
  }, [search, statusFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      params.set("limit", "50");

      const res = await fetch(`/api/careers/jobs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setJobs(data.data.jobs || []);
      }
    } catch (e) {
      console.error("Jobs load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingJob(null);
    setFormData({
      title: "",
      department: "Software Development",
      work_mode: "Onsite",
      city: "Visakhapatnam",
      country: "India",
      openings: 1,
      employment_type: "Full Time",
      min_experience: 2,
      max_experience: 5,
      min_salary_lpa: 8,
      max_salary_lpa: 15,
      short_summary: "",
      start_date: "",
      end_date: "",
      responsibilities: [
        "Architect, develop, and maintain performant cloud and web applications.",
        "Collaborate with product designers and engineering squads on sprint goals.",
        "Conduct rigorous code reviews and write clean, modular, and testable code."
      ],
      required_skills: [
        "React",
        "Node.js",
        "TypeScript",
        "PostgreSQL"
      ],
      status: "Published",
      featured: false
    });
  };

  const openEdit = (job: any) => {
    setEditingJob(job);
    
    // Parse responsibilities into array
    let respArray: string[] = [];
    if (job.responsibilities) {
      respArray = job.responsibilities
        .split("\n")
        .map((l: string) => l.replace(/^[•\-\*]\s*/, "").trim())
        .filter(Boolean);
    }
    if (respArray.length === 0) {
      respArray = [
        "Architect, develop, and maintain performant cloud and web applications.",
        "Collaborate with product designers and engineering squads on sprint goals."
      ];
    }

    // Parse salary LPA
    const minLpa = job.min_salary ? Math.round(Number(job.min_salary) / 100000 * 10) / 10 : 8;
    const maxLpa = job.max_salary ? Math.round(Number(job.max_salary) / 100000 * 10) / 10 : 15;

    // Format dates to YYYY-MM-DD for date inputs
    const formatDateInput = (d?: string) => {
      if (!d) return "";
      try {
        return new Date(d).toISOString().split("T")[0];
      } catch {
        return "";
      }
    };

    setFormData({
      title: job.title || "",
      department: job.department || "Software Development",
      work_mode: job.work_mode || "Onsite",
      city: job.city || "Visakhapatnam",
      country: job.country || "India",
      openings: job.openings || 1,
      employment_type: job.employment_type || "Full Time",
      min_experience: Number(job.min_experience) || 2,
      max_experience: Number(job.max_experience) || 5,
      min_salary_lpa: minLpa,
      max_salary_lpa: maxLpa,
      short_summary: job.short_summary || job.about_role || "",
      start_date: formatDateInput(job.start_date),
      end_date: formatDateInput(job.end_date || job.closing_date),
      responsibilities: respArray,
      required_skills: Array.isArray(job.required_skills) && job.required_skills.length > 0
        ? job.required_skills
        : ["React", "Node.js", "TypeScript"],
      status: job.status || "Published",
      featured: Boolean(job.featured)
    });

    setIsModalOpen(true);
  };

  const handleSaveJob = async (statusOverride?: string) => {
    if (!formData.title.trim()) {
      alert("Job title is required.");
      return;
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem("admin_token");
      const cleanedResponsibilities = formData.responsibilities
        .map((r) => r.trim())
        .filter(Boolean);
      const cleanedSkills = formData.required_skills
        .map((s) => s.trim())
        .filter(Boolean);

      const targetStatus = statusOverride || formData.status || "Published";

      const payload = {
        ...formData,
        status: targetStatus,
        closing_date: formData.end_date || null,
        min_salary: formData.min_salary_lpa ? Math.round(formData.min_salary_lpa * 100000) : null,
        max_salary: formData.max_salary_lpa ? Math.round(formData.max_salary_lpa * 100000) : null,
        about_role: formData.short_summary,
        responsibilities: cleanedResponsibilities.length > 0 
          ? cleanedResponsibilities.map((r) => `• ${r.replace(/^[•\-\*]\s*/, '')}`).join("\n") 
          : "",
        required_skills: cleanedSkills,
        preferred_skills: [],
        benefits: ["Health Insurance", "Learning Allowance", "Hybrid Flexibility"]
      };

      const url = editingJob ? `/api/careers/jobs/${editingJob.id}` : "/api/careers/jobs";
      const method = editingJob ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        resetForm();
        fetchJobs();
      } else {
        alert(data.message || `Failed to ${editingJob ? "update" : "create"} job.`);
      }
    } catch (err) {
      alert(`Error ${editingJob ? "updating" : "creating"} job.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (jobId: string | number, newStatus: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/careers/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchJobs();
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (e) {
      alert("Failed to update job status");
    }
  };

  const confirmPublishJob = async () => {
    if (!jobToPublish) return;
    try {
      setIsPublishing(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/careers/jobs/${jobToPublish.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "Published" })
      });
      const data = await res.json();
      if (data.success) {
        setJobToPublish(null);
        fetchJobs();
      } else {
        alert(data.message || "Failed to publish job opening");
      }
    } catch (e) {
      alert("Error occurred while publishing job");
    } finally {
      setIsPublishing(false);
    }
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/careers/jobs/${jobToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setJobToDelete(null);
        fetchJobs();
      } else {
        alert(data.message || "Failed to delete job.");
      }
    } catch (e) {
      alert("Failed to delete job.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PermissionGate permission="manage_careers">
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between -mt-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manage Job Postings</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure job specifications, departments, and active recruitment requirements.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
        >
          <PlusCircle className="h-4 w-4" /> New Job
        </button>
      </div>

      {/* Sub Nav */}
      <CareersSubNav />

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search job title, ID, or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/40 border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs text-foreground font-medium focus:outline-none focus:border-primary cursor-pointer w-full sm:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Paused">Paused</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Jobs Table matching Admin Table Design */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted border-b border-border/50 text-foreground text-xs font-medium">
            <tr>
              <th className="px-4 py-3 w-16 text-muted-foreground">S.No</th>
              <th className="px-4 py-3">Job ID</th>
              <th className="px-4 py-3">Position & Department</th>
              <th className="px-4 py-3">Location & Mode</th>
              <th className="px-4 py-3">Openings</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-xs">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  No jobs found matching your criteria.
                </td>
              </tr>
            ) : (
              jobs.map((job, idx) => (
                <tr key={job.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground font-medium">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono font-medium text-muted-foreground">
                    {job.job_id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-foreground text-sm">{job.title}</div>
                    <div className="text-[11px] text-muted-foreground font-normal">
                      {job.department} • {job.employment_type || "Full Time"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div>{job.city || "Visakhapatnam"}, {job.country || "India"}</div>
                    <div className="text-[11px] text-muted-foreground">{job.work_mode || "Onsite"}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {job.openings || 1}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        job.status === "Published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : job.status === "Draft"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : job.status === "Paused" || job.status === "Inactive"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {job.status || "Published"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Publish Action for Drafts (with confirmation dialog) */}
                      {job.status === "Draft" && (
                        <button
                          onClick={() => setJobToPublish(job)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Publish Draft Opening"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* Edit Button: only shown if status is NOT Draft */}
                      {job.status !== "Draft" && (
                        <button
                          onClick={() => openEdit(job)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Job Opening"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Inactive / Activate Toggle (for non-Draft jobs) */}
                      {job.status === "Inactive" ? (
                        <button
                          onClick={() => handleStatusChange(job.id, "Published")}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Activate Job"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      ) : job.status === "Published" ? (
                        <button
                          onClick={() => handleStatusChange(job.id, "Inactive")}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Make Inactive"
                        >
                          <PauseCircle className="w-4 h-4" />
                        </button>
                      ) : null}

                      {/* Delete Button */}
                      <button
                        onClick={() => setJobToDelete(job)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Job Opening"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Professional Create Job Modal - Exactly matching Products CMS modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {editingJob ? "Edit Job Opening" : "Post New Job Opening"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editingJob ? "Update role specifications, requirements, and parameters." : "Enter role details, parameters, and requirements."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveJob("Published"); }} className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-1 block text-foreground">
                  Job Title <span className="text-destructive">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Senior Flutter Developer"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block text-foreground">Department</label>
                  <select
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Software Development">Software Development</option>
                    <option value="Mobile Engineering">Mobile Engineering</option>
                    <option value="Cloud Solutions">Cloud Solutions</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Product Design">Product Design</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-1 block text-foreground">Work Mode</label>
                  <select
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                    value={formData.work_mode}
                    onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
                  >
                    <option value="Onsite">Onsite</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block text-foreground">City & Campus</label>
                  <input
                    type="text"
                    placeholder="Visakhapatnam"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-1 block text-foreground">Total Openings</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.openings}
                    onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block text-foreground">
                  Short Summary <span className="text-destructive">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="A concise 2-sentence summary of the role..."
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={formData.short_summary}
                  onChange={(e) => setFormData({ ...formData, short_summary: e.target.value })}
                />
              </div>

              {/* Bullet-point Responsibilities */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold block text-foreground">
                    Responsibilities & Deliverables
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        responsibilities: [...formData.responsibilities, ""]
                      })
                    }
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Bullet Point
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.responsibilities.map((resp, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 ml-1" />
                      <input
                        type="text"
                        className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={resp}
                        placeholder={`Responsibility #${index + 1}...`}
                        onChange={(e) => {
                          const updated = [...formData.responsibilities];
                          updated[index] = e.target.value;
                          setFormData({ ...formData, responsibilities: updated });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.responsibilities.filter((_, i) => i !== index);
                          setFormData({ ...formData, responsibilities: updated });
                        }}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {formData.responsibilities.length === 0 && (
                    <div className="text-xs text-muted-foreground italic text-center py-3 border border-dashed border-border rounded-xl">
                      No bullet points added. Click "+ Add Bullet Point" to specify responsibilities.
                    </div>
                  )}
                </div>
              </div>

              {/* Bullet-point Required Skills */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold block text-foreground">
                    Required Skills
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        required_skills: [...formData.required_skills, ""]
                      })
                    }
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Skill
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.required_skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary shrink-0 ml-1" />
                      <input
                        type="text"
                        className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={skill}
                        placeholder={`e.g. ${index === 0 ? "Flutter" : index === 1 ? "Dart" : "PostgreSQL"}...`}
                        onChange={(e) => {
                          const updated = [...formData.required_skills];
                          updated[index] = e.target.value;
                          setFormData({ ...formData, required_skills: updated });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.required_skills.filter((_, i) => i !== index);
                          setFormData({ ...formData, required_skills: updated });
                        }}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove skill"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {formData.required_skills.length === 0 && (
                    <div className="text-xs text-muted-foreground italic text-center py-3 border border-dashed border-border rounded-xl">
                      No skills added. Click "+ Add Skill" to add specific technologies or proficiencies.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block text-foreground">Min Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.min_experience}
                    onChange={(e) => setFormData({ ...formData, min_experience: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-1 block text-foreground">Max Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.max_experience}
                    onChange={(e) => setFormData({ ...formData, max_experience: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-semibold block text-foreground">Min Salary (LPA)</label>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formData.min_salary_lpa ? `₹${formData.min_salary_lpa} Lakhs/yr` : "Not set"}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="e.g. 8"
                      className="w-full rounded-xl border border-input bg-background pl-7 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.min_salary_lpa || ""}
                      onChange={(e) => setFormData({ ...formData, min_salary_lpa: parseFloat(e.target.value) || 0 })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">LPA</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-semibold block text-foreground">Max Salary (LPA)</label>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formData.max_salary_lpa ? `₹${formData.max_salary_lpa} Lakhs/yr` : "Not set"}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="e.g. 15"
                      className="w-full rounded-xl border border-input bg-background pl-7 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.max_salary_lpa || ""}
                      onChange={(e) => setFormData({ ...formData, max_salary_lpa: parseFloat(e.target.value) || 0 })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">LPA</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block text-foreground">
                    Posting Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-1 block text-foreground">
                    Posting End Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded border-input accent-primary"
                  />
                  <span>Highlight as Featured Job</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-6 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border bg-background hover:bg-muted text-foreground rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                {/* Save as Draft Button */}
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveJob("Draft")}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 font-bold rounded-xl text-sm transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  Save as Draft
                </button>

                {/* Publish Button */}
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSaveJob("Published")}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Publish Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog Modal (No Backdrop Blur) */}
      {jobToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !isDeleting && setJobToDelete(null)}
        >
          <div
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 text-foreground relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-foreground mb-1">
                  Delete Job Opening?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to delete <strong className="text-foreground">{jobToDelete.title}</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-5 mt-5 border-t border-border">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setJobToDelete(null)}
                className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteJob}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{isDeleting ? "Deleting..." : "Yes, Delete Job"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirmation Dialog Modal (No Backdrop Blur) */}
      {jobToPublish && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !isPublishing && setJobToPublish(null)}
        >
          <div
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 text-foreground relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-foreground mb-1">
                  Publish Job Opening?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to publish <strong className="text-foreground">{jobToPublish.title}</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-5 mt-5 border-t border-border">
              <button
                type="button"
                disabled={isPublishing}
                onClick={() => setJobToPublish(null)}
                className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPublishing}
                onClick={confirmPublishJob}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isPublishing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{isPublishing ? "Publishing..." : "Yes, Publish Job"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
      </PermissionGate>
  );
}
