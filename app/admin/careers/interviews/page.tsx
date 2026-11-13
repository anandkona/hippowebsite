"use client";

import PermissionGate from "@/components/admin/PermissionGate";

import { useEffect, useState } from "react";
import CareersSubNav from "@/components/admin/CareersSubNav";
import {
  Calendar,
  Plus,
  ExternalLink,
  Loader2,
  Star,
  Check,
  X,
  Clock,
  User,
  Video
} from "lucide-react";

export default function AdminInterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // New Interview Form
  const [formData, setFormData] = useState({
    application_id: "",
    round_name: "Technical Round 1",
    interview_type: "Technical",
    interviewer_name: "Sai Parla (Lead Architect)",
    interviewer_email: "saiparla@hippoclouds.com",
    scheduled_date: new Date().toISOString().split("T")[0],
    start_time: "10:30 AM",
    end_time: "11:30 AM",
    meeting_link: "https://meet.google.com/hpc-tech-interview",
    location_details: "Online Video Call"
  });

  // Feedback Form Modal State
  const [feedbackModalInt, setFeedbackModalInt] = useState<any>(null);
  const [feedbackData, setFormDataFeedback] = useState({
    technical_skills: 5,
    communication: 5,
    problem_solving: 5,
    overall_rating: 4.5,
    recommendation: "Hire",
    comments: "Candidate exhibited high proficiency in system architecture and clean code patterns."
  });

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/careers/interviews", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setInterviews(data.data || []);
      }
    } catch (e) {
      console.error("Interviews fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/careers/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowScheduleModal(false);
        fetchInterviews();
      } else {
        alert(data.message || "Failed to schedule interview");
      }
    } catch (e) {
      alert("Error scheduling interview.");
    }
  };

  const handleSubmitScorecard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModalInt) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/careers/interviews/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          interview_id: feedbackModalInt.id,
          ...feedbackData
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackModalInt(null);
        fetchInterviews();
      } else {
        alert(data.message || "Failed to save feedback");
      }
    } catch (e) {
      alert("Error submitting feedback scorecard");
    }
  };

  return (
    <PermissionGate permission="manage_careers">
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mt-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Interview Management & Scorecards</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Schedule technical, managerial, and HR rounds. Track ratings and structured panelist feedback.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 rounded-xl font-medium text-xs flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Schedule Interview
        </button>
      </div>

      {/* Sub Nav */}
      <CareersSubNav />

      {/* Interviews Table in HippoClouds Admin Theme */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted border-b border-border/50 text-foreground text-xs font-medium">
            <tr>
              <th className="px-4 py-3 w-16 text-muted-foreground">S.No</th>
              <th className="px-5 py-3">Interview ID</th>
              <th className="px-5 py-3">Candidate & Job</th>
              <th className="px-5 py-3">Round & Type</th>
              <th className="px-5 py-3">Interviewer</th>
              <th className="px-5 py-3">Date & Time</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-xs">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </td>
              </tr>
            ) : interviews.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-muted-foreground">
                  No interviews scheduled yet.
                </td>
              </tr>
            ) : (
              interviews.map((item, idx) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground font-medium">{idx + 1}</td>
                  <td className="px-5 py-3 font-mono font-bold text-primary">
                    {item.interview_id}
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-bold text-foreground text-sm">
                      {item.first_name} {item.last_name}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-normal">
                      {item.job_title}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-foreground">{item.round_name}</div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary">
                      {item.interview_type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    <div className="font-medium text-foreground">
                      {item.interviewer_name || "Assigned Panelist"}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    <div className="font-medium text-foreground">
                      {new Date(item.scheduled_date).toLocaleDateString()}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {item.start_time} - {item.end_time}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {item.status || "Scheduled"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.meeting_link && (
                        <a
                          href={item.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Open Meeting Link"
                        >
                          <Video className="w-3.5 h-3.5 text-primary" />
                        </a>
                      )}

                      <button
                        onClick={() => setFeedbackModalInt(item)}
                        className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Submit Scorecard
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-xs space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Schedule Candidate Interview</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInterview} className="space-y-4">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Application ID</label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  required
                  value={formData.application_id}
                  onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Round Name</label>
                  <input
                    type="text"
                    value={formData.round_name}
                    onChange={(e) => setFormData({ ...formData, round_name: e.target.value })}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Interview Type</label>
                  <select
                    value={formData.interview_type}
                    onChange={(e) => setFormData({ ...formData, interview_type: e.target.value })}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Managerial">Managerial</option>
                    <option value="HR">HR</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Interviewer Name</label>
                  <input
                    type="text"
                    value={formData.interviewer_name}
                    onChange={(e) => setFormData({ ...formData, interviewer_name: e.target.value })}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Interviewer Email</label>
                  <input
                    type="email"
                    value={formData.interviewer_email}
                    onChange={(e) => setFormData({ ...formData, interviewer_email: e.target.value })}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Start Time</label>
                  <input
                    type="text"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">End Time</label>
                  <input
                    type="text"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Meeting Link (Google Meet / Zoom)</label>
                <input
                  type="text"
                  value={formData.meeting_link}
                  onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2 rounded-xl transition-colors shadow-sm"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Scorecard Modal */}
      {feedbackModalInt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-xs space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Interview Evaluation Scorecard</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Candidate: {feedbackModalInt.first_name} {feedbackModalInt.last_name} ({feedbackModalInt.round_name})
                </p>
              </div>
              <button
                onClick={() => setFeedbackModalInt(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitScorecard} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Technical Skills (1 - 5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.5"
                    value={feedbackData.technical_skills}
                    onChange={(e) =>
                      setFormDataFeedback({ ...feedbackData, technical_skills: parseFloat(e.target.value) })
                    }
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Communication (1 - 5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.5"
                    value={feedbackData.communication}
                    onChange={(e) =>
                      setFormDataFeedback({ ...feedbackData, communication: parseFloat(e.target.value) })
                    }
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Problem Solving (1 - 5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.5"
                    value={feedbackData.problem_solving}
                    onChange={(e) =>
                      setFormDataFeedback({ ...feedbackData, problem_solving: parseFloat(e.target.value) })
                    }
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Overall Recommendation</label>
                  <select
                    value={feedbackData.recommendation}
                    onChange={(e) =>
                      setFormDataFeedback({ ...feedbackData, recommendation: e.target.value })
                    }
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Strong Hire">Strong Hire</option>
                    <option value="Hire">Hire</option>
                    <option value="Hold">Hold</option>
                    <option value="Reject">Reject</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Detailed Panel Comments</label>
                <textarea
                  rows={4}
                  value={feedbackData.comments}
                  onChange={(e) => setFormDataFeedback({ ...feedbackData, comments: e.target.value })}
                  className="w-full bg-muted/40 border border-border rounded-xl p-3 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setFeedbackModalInt(null)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2 rounded-xl transition-colors shadow-sm"
                >
                  Save Scorecard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
      </PermissionGate>
  );
}
