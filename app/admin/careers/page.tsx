"use client";

import PermissionGate from "@/components/admin/PermissionGate";

import { useEffect, useState } from "react";
import Link from "next/link";
import CareersSubNav from "@/components/admin/CareersSubNav";
import {
  Briefcase,
  Users,
  FileText,
  CheckCircle2,
  Calendar,
  Gift,
  UserCheck,
  TrendingUp,
  Plus,
  ArrowRight,
  Loader2,
  Clock,
  ExternalLink
} from "lucide-react";

export default function AdminCareersDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/careers/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error("Stats load error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentApps = data?.recentApplications || [];

  return (
    <PermissionGate permission="manage_careers">
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mt-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Careers & Job Management</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Monitor active job postings, application submissions, and applicant statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/careers"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border"
          >
            <span>Live Careers Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/admin/careers/jobs"
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 rounded-xl font-medium text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Briefcase className="h-3.5 w-3.5" /> Manage Jobs
          </Link>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <CareersSubNav />

      {/* KPI Cards in Admin Style - Jobs & Applications only */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Total Jobs</span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.totalJobs || 0}</div>
          <div className="text-[11px] text-muted-foreground mt-1">
            <span className="font-semibold text-emerald-600">{stats.activeJobs || 0}</span> active openings
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Received Applications</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.totalApplications || 0}</div>
          <div className="text-[11px] text-muted-foreground mt-1">
            <span className="font-semibold text-primary">{stats.pendingApplications || 0}</span> under review
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Shortlisted / Reviewed</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {Math.max((stats.totalApplications || 0) - (stats.pendingApplications || 0), 0)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Applications evaluated
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground text-base">Recent Applications</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Candidate submissions across active job postings.
            </p>
          </div>
          <Link
            href="/admin/careers/applications"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted border-b border-border/50 text-foreground text-xs font-medium">
              <tr>
                <th className="px-4 py-3 w-16 text-muted-foreground">S.No</th>
                <th className="px-4 py-3">Candidate Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Applied Job</th>
                <th className="px-4 py-3">Current Stage</th>
                <th className="px-4 py-3">Applied Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-xs">
              {recentApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    No applications received yet.
                  </td>
                </tr>
              ) : (
                recentApps.map((app: any, idx: number) => (
                  <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground font-medium">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-foreground">
                      {app.candidate_name || "Applicant"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <a href={`mailto:${app.candidate_email}`} className="hover:text-primary transition-colors">
                        {app.candidate_email || "N/A"}
                      </a>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {app.job_title || "General"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
                        {app.current_stage || "Applied"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {app.created_at ? new Date(app.created_at).toLocaleDateString() : "Recent"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/careers/applications`}
                        className="text-primary hover:underline font-bold"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
      </PermissionGate>
  );
}
