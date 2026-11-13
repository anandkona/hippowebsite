"use client";

import PermissionGate from "@/components/admin/PermissionGate";

import { useEffect, useState } from "react";
import CareersSubNav from "@/components/admin/CareersSubNav";
import { CheckSquare, Loader2, Check, Clock } from "lucide-react";

export default function AdminOnboardingPage() {
  const [onboardings, setOnboardings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnboardings();
  }, []);

  const fetchOnboardings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/careers/onboarding", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOnboardings(data.data || []);
      }
    } catch (e) {
      console.error("Onboarding load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (id: number, key: string, currentVal: boolean) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/careers/onboarding", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id, [key]: !currentVal })
      });
      const data = await res.json();
      if (data.success) {
        fetchOnboardings();
      }
    } catch (e) {
      alert("Error updating onboarding step");
    }
  };

  return (
    <PermissionGate permission="manage_careers">
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mt-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Employee Onboarding Tracker</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Track post-offer background checks, document verification, email generation, and equipment delivery.
          </p>
        </div>
      </div>

      {/* Sub Nav */}
      <CareersSubNav />

      {/* Onboarding Table in HippoClouds Admin Theme */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted border-b border-border/50 text-foreground text-xs font-medium">
            <tr>
              <th className="px-4 py-3 w-16 text-muted-foreground">S.No</th>
              <th className="px-5 py-3">Employee ID</th>
              <th className="px-5 py-3">Candidate & Role</th>
              <th className="px-5 py-3">Joining Date</th>
              <th className="px-5 py-3">Documents</th>
              <th className="px-5 py-3">IT Laptop</th>
              <th className="px-5 py-3">Corporate Email</th>
              <th className="px-5 py-3">Welcome Kit</th>
              <th className="px-5 py-3 text-right">Overall Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-xs">
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </td>
              </tr>
            ) : onboardings.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-muted-foreground">
                  No onboarding pipelines currently active. When candidates accept formal offers, they appear automatically here.
                </td>
              </tr>
            ) : (
              onboardings.map((item, idx) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground font-medium">{idx + 1}</td>
                  <td className="px-5 py-3 font-mono font-bold text-primary">
                    {item.employee_id || item.onboarding_id}
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-bold text-foreground text-sm">
                      {item.first_name} {item.last_name}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-normal">
                      {item.designation}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium text-foreground">
                    {item.joining_date ? new Date(item.joining_date).toLocaleDateString() : "TBD"}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggleTask(item.id, "documents_submitted", item.documents_submitted)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                        item.documents_submitted
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {item.documents_submitted ? "Verified ✓" : "Pending"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggleTask(item.id, "it_laptop_ready", item.it_laptop_ready)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                        item.it_laptop_ready
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {item.it_laptop_ready ? "Dispatched ✓" : "Pending"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggleTask(item.id, "email_account_created", item.email_account_created)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                        item.email_account_created
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {item.email_account_created ? "Created ✓" : "Pending"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleToggleTask(item.id, "hr_welcome_kit", item.hr_welcome_kit)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                        item.hr_welcome_kit
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {item.hr_welcome_kit ? "Sent ✓" : "Pending"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {item.status || "In Progress"}
                    </span>
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
