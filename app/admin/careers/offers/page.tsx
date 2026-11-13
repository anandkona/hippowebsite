"use client";

import PermissionGate from "@/components/admin/PermissionGate";

import { useEffect, useState } from "react";
import CareersSubNav from "@/components/admin/CareersSubNav";
import { Gift, Plus, Loader2, Send, CheckCircle2, XCircle, IndianRupee, X } from "lucide-react";

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    application_id: "",
    designation: "Senior Flutter Developer",
    department: "Mobile Engineering",
    joining_date: "2026-12-01",
    location: "Visakhapatnam, Andhra Pradesh",
    annual_ctc: 1500000,
    fixed_component: 1300000,
    variable_component: 200000,
    probation_period: "3 Months",
    notice_period: "30 Days",
    status: "Sent"
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/careers/offers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOffers(data.data || []);
      }
    } catch (e) {
      console.error("Offers fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/careers/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        fetchOffers();
      } else {
        alert(data.message || "Failed to create offer");
      }
    } catch (e) {
      alert("Error rolling out job offer");
    }
  };

  const formatLakh = (val: number) => `₹${(val / 100000).toFixed(2)}L`;

  return (
    <PermissionGate permission="manage_careers">
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mt-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Offer Management</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Roll out official employment offers, track digital acceptance, and review CTC breakdown.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 rounded-xl font-medium text-xs flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Rollout Offer
        </button>
      </div>

      {/* Sub Nav */}
      <CareersSubNav />

      {/* Offers Table */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted border-b border-border/50 text-foreground text-xs font-medium">
            <tr>
              <th className="px-4 py-3 w-16 text-muted-foreground">S.No</th>
              <th className="px-5 py-3">Candidate & Role</th>
              <th className="px-5 py-3">Department & Location</th>
              <th className="px-5 py-3">Annual CTC</th>
              <th className="px-5 py-3">Joining Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-xs">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </td>
              </tr>
            ) : offers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  No offers rolled out yet.
                </td>
              </tr>
            ) : (
              offers.map((item, idx) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground font-medium">{idx + 1}</td>
                  <td className="px-5 py-3">
                    <div className="font-bold text-foreground text-sm">
                      {item.first_name} {item.last_name}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-normal">
                      {item.designation}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    <div>{item.department}</div>
                    <div className="text-[11px] text-muted-foreground">{item.location}</div>
                  </td>
                  <td className="px-5 py-3 font-bold text-emerald-600">
                    {formatLakh(item.annual_ctc)}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {item.joining_date ? new Date(item.joining_date).toLocaleDateString() : "TBD"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.status === "Accepted"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : item.status === "Rejected"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {item.status || "Sent"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {item.status === "Accepted" ? "Ready for Onboarding" : "Awaiting Candidate"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rollout Offer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-xs space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Rollout Employment Offer</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-4">
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
                  <label className="block text-muted-foreground font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Annual CTC (₹)</label>
                  <input
                    type="number"
                    value={formData.annual_ctc}
                    onChange={(e) =>
                      setFormData({ ...formData, annual_ctc: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joining_date}
                    onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2 rounded-xl transition-colors shadow-sm"
                >
                  Release Offer
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
