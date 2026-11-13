"use client";

import PermissionGate from "@/components/admin/PermissionGate";

import { useEffect, useState } from "react";
import Link from "next/link";
import CareersSubNav from "@/components/admin/CareersSubNav";
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Loader2,
  ArrowRight,
  GraduationCap,
  Briefcase
} from "lucide-react";

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCandidates();
  }, [search]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/careers/candidates?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCandidates(data.data.candidates || []);
      }
    } catch (e) {
      console.error("Candidates fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionGate permission="manage_careers">
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mt-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Candidate Pool</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Registered candidates, their profile completeness, and submission histories.
          </p>
        </div>
      </div>

      {/* Sub Nav */}
      <CareersSubNav />

      {/* Search Bar */}
      <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name, email, phone, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/40 border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted border-b border-border/50 text-foreground text-xs font-medium">
            <tr>
              <th className="px-4 py-3 w-16 text-muted-foreground">S.No</th>
              <th className="px-5 py-3">Candidate</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Location</th>
              <th className="px-5 py-3">Current Role & Exp</th>
              <th className="px-5 py-3">Registered On</th>
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
            ) : candidates.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  No candidates found in pool.
                </td>
              </tr>
            ) : (
              candidates.map((c, idx) => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground font-medium">{idx + 1}</td>
                  <td className="px-5 py-3">
                    <div className="font-bold text-foreground text-sm">
                      {c.first_name} {c.last_name}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-normal">
                      {c.headline || "Job Applicant"}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      {c.email}
                    </div>
                    {c.phone && (
                      <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        {c.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      {c.city || "Visakhapatnam"}, {c.country || "India"}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    <div className="font-medium text-foreground">
                      {c.current_company || "Fresher / Not specified"}
                    </div>
                    <div className="text-[11px]">
                      {c.total_experience_years ? `${c.total_experience_years} years exp` : "Entry Level"}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : "Recent"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/careers/applications`}
                      className="text-primary hover:underline font-bold"
                    >
                      View Applications
                    </Link>
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
