"use client";

import PermissionGate from "@/components/admin/PermissionGate";

import { useEffect, useState } from "react";
import Link from "next/link";
import CareersSubNav from "@/components/admin/CareersSubNav";
import { FileText, Search, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";

export default function AdminApplicationsListPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const stages = [
    "Applied",
    "Marked as Reviewed"
  ];

  useEffect(() => {
    fetchApplications();
  }, [search, stageFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (stageFilter) params.set("stage", stageFilter);
      params.set("limit", "50");

      const res = await fetch(`/api/careers/applications?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setApplications(data.data.applications || []);
      }
    } catch (e) {
      console.error("Applications fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (appId: string | number, newStage: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/careers/applications/${appId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ stage: newStage })
      });
      const data = await res.json();
      if (data.success) {
        fetchApplications();
      }
    } catch (e) {
      alert("Failed to update application stage");
    }
  };

  return (
    <PermissionGate permission="manage_careers">
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mt-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Applications Repository</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Complete list of candidate submissions, active stages, and screening outcomes.
          </p>
        </div>
      </div>

      {/* Sub Nav */}
      <CareersSubNav />

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name, email, or application number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/40 border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs text-foreground font-medium focus:outline-none focus:border-primary cursor-pointer w-full sm:w-auto"
          >
            <option value="">All Stages</option>
            {stages.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted border-b border-border/50 text-foreground text-xs font-medium">
            <tr>
              <th className="px-4 py-3 w-16 text-muted-foreground">S.No</th>
              <th className="px-5 py-3">Candidate</th>
              <th className="px-5 py-3">Job Applied</th>
              <th className="px-5 py-3">Current Stage</th>
              <th className="px-5 py-3">Submitted On</th>
              <th className="px-5 py-3 text-right">Update Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-xs">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  No applications found.
                </td>
              </tr>
            ) : (
              applications.map((app, idx) => (
                <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground font-medium">{idx + 1}</td>
                  <td className="px-5 py-3">
                    <div className="font-bold text-foreground text-sm">
                      {app.candidate_name || "Applicant"}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-normal">
                      {app.candidate_email}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-foreground font-medium">
                    {app.job_title || "General Application"}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
                      {app.current_stage || "Applied"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {app.created_at ? new Date(app.created_at).toLocaleDateString() : "Recent"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleStageChange(app.id, app.current_stage === "Marked as Reviewed" ? "Applied" : "Marked as Reviewed")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                        app.current_stage === "Marked as Reviewed"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-primary text-white hover:bg-primary/90"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{app.current_stage === "Marked as Reviewed" ? "Reviewed ✓" : "Mark as Reviewed"}</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
      </PermissionGate>
  );
}
