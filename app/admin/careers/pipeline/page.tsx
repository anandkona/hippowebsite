"use client";

import PermissionGate from "@/components/admin/PermissionGate";

import { useEffect, useState } from "react";
import Link from "next/link";
import CareersSubNav from "@/components/admin/CareersSubNav";
import { GitFork, Loader2, ArrowRight, CheckCircle2, ChevronRight, User } from "lucide-react";

export default function KanbanPipelinePage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const stages = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Technical Interview",
    "Managerial Interview",
    "HR Interview",
    "Offer Released",
    "Offer Accepted",
    "Hired"
  ];

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/careers/applications?limit=100", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setApplications(data.data.applications || []);
      }
    } catch (e) {
      console.error("Pipeline load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveStage = async (appId: string | number, nextStage: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/careers/applications/${appId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ stage: nextStage })
      });
      const data = await res.json();
      if (data.success) {
        fetchApplications();
      } else {
        alert(data.message || "Failed to update stage");
      }
    } catch (e) {
      alert("Failed to advance stage");
    }
  };

  return (
    <PermissionGate permission="manage_careers">
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mt-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Kanban Recruitment Pipeline</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Visual recruitment pipeline across candidate lifecycle stages.
          </p>
        </div>
      </div>

      {/* Sub Nav */}
      <CareersSubNav />

      {/* Kanban Board Container */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar">
          {stages.map((stage) => {
            const stageApps = applications.filter(
              (a) => (a.current_stage || "Applied").toLowerCase() === stage.toLowerCase()
            );

            return (
              <div
                key={stage}
                className="w-72 shrink-0 bg-card rounded-2xl border border-border/50 p-3 flex flex-col max-h-[750px] shadow-sm"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between p-2 mb-2 border-b border-border/50">
                  <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">
                    {stage}
                  </h4>
                  <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {stageApps.length}
                  </span>
                </div>

                {/* Candidate Cards */}
                <div className="flex-1 overflow-y-auto space-y-2.5 p-1 custom-scrollbar">
                  {stageApps.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-muted-foreground/60 border border-dashed border-border/60 rounded-xl">
                      Empty stage
                    </div>
                  ) : (
                    stageApps.map((app) => (
                      <div
                        key={app.id}
                        className="bg-background border border-border rounded-xl p-3 shadow-xs hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="font-bold text-xs text-foreground line-clamp-1">
                            {app.candidate_name || "Applicant"}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {app.application_number}
                          </span>
                        </div>

                        <div className="text-[11px] text-muted-foreground mb-2 line-clamp-1">
                          {app.job_title || "General"}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <span className="text-[10px] text-muted-foreground">
                            {app.created_at ? new Date(app.created_at).toLocaleDateString() : ""}
                          </span>

                          <div className="flex items-center gap-1">
                            <select
                              value={app.current_stage || "Applied"}
                              onChange={(e) => handleMoveStage(app.id, e.target.value)}
                              className="text-[10px] bg-muted border border-border rounded px-1.5 py-1 text-foreground focus:outline-none cursor-pointer"
                            >
                              {stages.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
      </PermissionGate>
  );
}
