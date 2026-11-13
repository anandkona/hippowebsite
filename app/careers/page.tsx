"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CareersHeader from "@/components/careers/CareersHeader";
import {
  Search,
  MapPin,
  Briefcase,
  Sparkles,
  TrendingUp,
  Heart,
  GraduationCap,
  Award,
  Globe2,
  Rocket,
  ArrowRight,
  CheckCircle2,
  IndianRupee,
  Clock,
  Building,
  Check,
  X,
  Upload,
  FileCheck,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function CareersUnifiedPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState("All");

  // Selected Job for Details Modal
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Apply Modal State
  const [applyJob, setApplyJob] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any>(null);
  const [duplicateBlock, setDuplicateBlock] = useState<any>(null);
  const [applyError, setApplyError] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    current_location: "Visakhapatnam",
    current_company: "",
    total_experience: "2",
    expected_ctc_lpa: "8",
    notice_period: "30 Days",
    resume_url: "",
    resume_filename: "",
    cover_letter: ""
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/careers/jobs?limit=50");
      const json = await res.json();
      if (json.success && json.data) {
        setJobs(json.data.jobs || []);
      }
    } catch (err) {
      console.error("Error fetching careers jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    "All",
    "Mobile Engineering",
    "Software Development",
    "Cloud Solutions",
    "Artificial Intelligence",
    "Product Design"
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchDept = department === "All" || job.department.toLowerCase() === department.toLowerCase();
    const matchSearch =
      !searchTerm ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.required_skills && job.required_skills.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchDept && matchSearch;
  });

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Competitive";
    const toLpa = (val: number) => {
      const lpa = val >= 10000 ? val / 100000 : val;
      return lpa % 1 === 0 ? `${lpa}` : `${lpa.toFixed(1)}`;
    };
    if (min && max) return `₹${toLpa(min)} - ${toLpa(max)} LPA`;
    if (min) return `From ₹${toLpa(min)} LPA`;
    return `Up to ₹${toLpa(max!)} LPA`;
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingResume(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("docType", "Resume");

      const res = await fetch("/api/careers/upload", {
        method: "POST",
        body: fd
      });

      const data = await res.json();
      if (data.success && data.data) {
        setFormData((prev) => ({
          ...prev,
          resume_url: data.data.fileUrl,
          resume_filename: data.data.fileName
        }));
      } else {
        alert(data.message || "Failed to upload resume file.");
      }
    } catch (err: any) {
      alert("Error uploading resume file.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim()) {
      alert("Please enter your first name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!formData.mobile.trim()) {
      alert("Please enter your phone number.");
      return;
    }
    if (!formData.resume_url) {
      alert("Please attach your resume (PDF or DOCX).");
      return;
    }

    try {
      setSubmitting(true);
      setApplyError("");

      const payload = {
        ...formData,
        expected_ctc: formData.expected_ctc_lpa ? `₹${formData.expected_ctc_lpa} LPA` : "Negotiable",
        total_experience: parseFloat(formData.total_experience) || 0
      };

      const res = await fetch(`/api/careers/jobs/${applyJob.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.status === 409 || data.code === "ALREADY_APPLIED") {
        setDuplicateBlock({
          application_id: data.applicationId || "Application on file",
          applied_at: data.appliedAt || new Date().toISOString()
        });
        return;
      }

      if (!res.ok || !data.success) {
        setApplyError(data.message || "Failed to submit application.");
        return;
      }

      setSubmissionSuccess(data.data);
    } catch (err) {
      setApplyError("Network error occurred while submitting application.");
    } finally {
      setSubmitting(false);
    }
  };

  const perks = [
    {
      icon: TrendingUp,
      title: "High-Impact Engineering",
      desc: "Work on core cloud-native architectures, multi-tenant SaaS products, and AI agent frameworks deployed for industry leaders."
    },
    {
      icon: GraduationCap,
      title: "Hippo Skill Hub & Mentorship",
      desc: "Accelerate your career with sponsored cloud certifications (AWS, Azure, GCP), peer code reviews, and direct executive mentorship."
    },
    {
      icon: Heart,
      title: "Comprehensive Wellness",
      desc: "Top-tier health and medical coverage for you and your family, flexible hybrid schedules, and dedicated wellness days."
    },
    {
      icon: Award,
      title: "Competitive CTC & Rewards",
      desc: "Industry-benchmarked compensation packages with performance bonuses, milestone recognition, and project-based rewards."
    },
    {
      icon: Globe2,
      title: "Global Client Exposure",
      desc: "Collaborate with international enterprise clients and cross-functional teams spanning diverse domains and technologies."
    },
    {
      icon: Rocket,
      title: "Ownership & Rapid Growth",
      desc: "Small agile squads with immense technical ownership. Ship solutions directly to production without bureaucratic delays."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground selection:bg-primary/20 selection:text-foreground">
      {/* Main HippoClouds Navbar */}
      <Navbar />

      {/* Official Homepage & Products Hero Style - Full Screen Height */}
      <section className="relative min-h-screen w-full overflow-hidden bg-foreground flex items-center justify-center">
        {/* Cinematic Background Image with Dual Gradient Overlays matching Homepage */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/hero-bg.jpg"
            alt="HippoClouds Careers"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-transparent to-foreground/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-32 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24">
          <div className="max-w-3xl space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-primary">
                We're Hiring • Build What Matters
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight sm:leading-tight lg:leading-[1.1] text-white tracking-tight"
            >
              Build the Future. <br className="hidden sm:inline" />
              <span className="text-gradient">Grow Your Career Here.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="max-w-xl text-sm sm:text-base md:text-lg lg:text-xl text-white/75 leading-relaxed font-normal"
            >
              Join visionary developers, designers, and cloud architects solving mission-critical enterprise challenges with high-scale cloud platforms and intelligent AI systems.
            </motion.p>

            {/* Quick Action Buttons matching Home Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2"
            >
              <a
                href="#openings"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-background px-8 py-4 text-xs sm:text-sm font-bold text-foreground transition-transform hover:scale-[1.02] shadow-lg cursor-pointer text-center"
              >
                <span>Browse All Openings</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-primary" />
              </a>

              <div className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-xs font-semibold text-white/90">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{jobs.length || 6} Active Positions Available</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* In-Page Search & Filter Sticky Bar */}
      <div className="sticky top-16 lg:top-[72px] z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-xs py-3 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by role, skill, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-muted/40 border border-border rounded-xl pl-10 pr-4 py-2 sm:py-2.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-muted/40 border border-border rounded-xl px-3.5 py-2 sm:py-2.5 text-xs text-foreground font-medium focus:outline-none focus:border-primary cursor-pointer flex-1 sm:flex-initial sm:w-auto"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {(searchTerm || department !== "All") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDepartment("All");
                }}
                className="px-3 py-2 text-xs font-bold text-primary hover:underline shrink-0 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Open Positions Section with Instant Dialog Apply */}
      <section id="openings" className="pt-10 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 xl:px-12 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10">
            <div>
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-2 sm:mb-2.5">
                Current Openings
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mt-1">
                Explore Opportunities at HippoClouds
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-1.5 max-w-xl leading-relaxed">
                Click any role to view detailed responsibilities or apply directly in seconds.
              </p>
            </div>

            <span className="text-xs font-bold text-muted-foreground mt-3 md:mt-0">
              Showing {filteredJobs.length} active position{filteredJobs.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-muted/40 animate-pulse border border-border" />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground mb-1">No positions match your search criteria</h3>
              <p className="text-xs text-muted-foreground mb-5">Try clearing your search terms or exploring all available openings.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDepartment("All");
                }}
                className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: (index % 6) * 0.08 }}
                  className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:border-primary/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider truncate max-w-[55%]">
                        {job.department}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        <IndianRupee className="w-3 h-3" />
                        {formatSalary(job.min_salary, job.max_salary)}
                      </span>
                    </div>

                    <h3
                      className="text-base sm:text-lg font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors cursor-pointer leading-snug"
                      onClick={() => setSelectedJob(job)}
                    >
                      {job.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground mb-3 sm:mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0 text-primary/70" /> {job.city || "Visakhapatnam"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3 shrink-0 text-primary/70" /> {job.work_mode || "Onsite"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 shrink-0 text-primary/70" /> {job.min_experience ? `${job.min_experience}+ yrs` : "Experienced"}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {job.about_role || job.short_summary || "Join our team to build scalable software platforms."}
                    </p>

                    {/* Skills pills */}
                    {job.required_skills && job.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {job.required_skills.slice(0, 4).map((skill: string, i: number) => (
                          <span key={i} className="text-[11px] font-medium bg-muted group-hover:bg-primary/5 px-2.5 py-0.5 rounded-md border border-border/60 transition-colors">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => {
                        setApplyJob(job);
                        setSubmissionSuccess(null);
                        setDuplicateBlock(null);
                        setApplyError("");
                      }}
                      className="px-3.5 sm:px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer group-hover:shadow-md"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why HippoClouds Section */}
      <section className="pt-12 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 xl:px-12 bg-muted/30 border-y border-border/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <span className="inline-block rounded-full bg-secondary/10 px-4 py-1.5 text-secondary text-xs font-bold uppercase tracking-[0.2em] mb-2 sm:mb-2.5">
              Why Join Us
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Built for Builders, <span className="text-gradient">Designed for Growth</span>
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-2.5 leading-relaxed max-w-2xl mx-auto">
              We empower team members with deep technical autonomy, modern engineering stacks, and an environment where bold ideas turn into mission-critical software.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {perks.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <div
                  key={perk.title}
                  className="bg-card rounded-2xl border border-border/80 p-5 sm:p-6 lg:p-7 hover:shadow-lg hover:border-primary/40 transition-all duration-300"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">{perk.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{perk.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* JOB DETAILS MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-5 sm:p-7 md:p-8 shadow-2xl relative my-6 sm:my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-border gap-3 sm:gap-4">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">
                  {selectedJob.department}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {selectedJob.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                  <span>{selectedJob.city || "Visakhapatnam"}, {selectedJob.country || "India"}</span>
                  <span>•</span>
                  <span>{selectedJob.work_mode || "Onsite"}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-bold">{formatSalary(selectedJob.min_salary, selectedJob.max_salary)}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 sm:space-y-6 pt-5 text-xs text-foreground/90">
              <div>
                <h4 className="font-bold text-sm text-foreground mb-1.5">Role Overview</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedJob.about_role || selectedJob.short_summary || "Work on core product and platform initiatives."}
                </p>
              </div>

              {selectedJob.responsibilities && (
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1.5">Responsibilities & Deliverables</h4>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line space-y-1">
                    {selectedJob.responsibilities}
                  </div>
                </div>
              )}

              {selectedJob.required_skills && selectedJob.required_skills.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-foreground mb-1.5">Required Skills</h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedJob.required_skills.map((skill: string, i: number) => (
                      <span key={i} className="bg-primary/10 text-primary border border-primary/20 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted text-xs font-semibold text-center"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const target = selectedJob;
                    setSelectedJob(null);
                    setApplyJob(target);
                    setSubmissionSuccess(null);
                    setDuplicateBlock(null);
                    setApplyError("");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Apply for this Role</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT APPLICATION MODAL (No Backdrop Blur) */}
      {applyJob && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-5 sm:p-7 md:p-8 shadow-2xl relative my-6 sm:my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border gap-3">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                  Quick Application
                </span>
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  Apply for {applyJob.title}
                </h3>
              </div>
              <button
                onClick={() => setApplyJob(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submissionSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <FileCheck className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-foreground">Application Submitted!</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Thank you! Your application has been received. Our recruitment team will review your profile shortly.
                </p>
                <div className="bg-muted/40 rounded-xl p-4 max-w-sm mx-auto text-xs space-y-2 border border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Application No:</span>
                    <span className="font-mono font-bold text-foreground">{submissionSuccess.applicationId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-semibold text-emerald-600">Under Review</span>
                  </div>
                </div>
                <button
                  onClick={() => setApplyJob(null)}
                  className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Done
                </button>
              </div>
            ) : duplicateBlock ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-foreground">Application Already on Record</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  You have already applied for this position. Our hiring team is currently evaluating your profile.
                </p>
                <button
                  onClick={() => setApplyJob(null)}
                  className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4 pt-4">
                {applyError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{applyError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      First Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kumar"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Email Address <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="anand@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Phone Number <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Total Experience (Yrs)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.total_experience}
                      onChange={(e) => setFormData({ ...formData, total_experience: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Current Location
                    </label>
                    <input
                      type="text"
                      placeholder="Visakhapatnam"
                      value={formData.current_location}
                      onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">
                      Expected CTC (LPA)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 10"
                      value={formData.expected_ctc_lpa}
                      onChange={(e) => setFormData({ ...formData, expected_ctc_lpa: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Resume Document <span className="text-destructive">*</span>
                  </label>
                  <div className="border-2 border-dashed border-border rounded-xl p-4 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                    {formData.resume_filename ? (
                      <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 font-semibold">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Attached: {formData.resume_filename}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground font-medium mb-1">Attach PDF or DOCX (Max 10MB)</p>
                    )}
                    <div className="mt-2">
                      <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                        {uploadingResume ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>{formData.resume_filename ? "Replace File" : "Choose Resume"}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          disabled={uploadingResume}
                          onChange={handleResumeUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Message / Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short introduction or relevant highlights..."
                    value={formData.cover_letter}
                    onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setApplyJob(null)}
                    className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted text-xs font-semibold transition-colors text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingResume}
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Official Footer */}
      <Footer />
    </div>
  );
}
