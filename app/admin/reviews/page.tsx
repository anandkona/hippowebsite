"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Eye, EyeOff, Loader2, Star, Pencil, X, Quote, Sparkles, Search, MessageSquareQuote } from "lucide-react";
import PermissionGate from "@/components/admin/PermissionGate";

export type Review = {
  id: number;
  author: string;
  role: string;
  company?: string;
  content: string;
  stars: number;
  avatar_url?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export default function ReviewsCMS() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRole, setUserRole] = useState("viewer");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const [author, setAuthor] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [stars, setStars] = useState(5);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUserRole(localStorage.getItem("user_role") || "viewer");
    fetchReviews();
  }, []);

  const resetForm = () => {
    setAuthor("");
    setRole("");
    setCompany("");
    setContent("");
    setStars(5);
    setDisplayOrder(0);
    setIsActive(true);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (rev: Review) => {
    setAuthor(rev.author);
    setRole(rev.role);
    setCompany(rev.company || "");
    setContent(rev.content);
    setStars(rev.stars || 5);
    setDisplayOrder(rev.display_order || 0);
    setIsActive(rev.is_active);
    setEditingId(rev.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !role || !content) {
      alert("Please fill in author name, role, and review content.");
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem("admin_token");
    const method = editingId ? "PUT" : "POST";
    const body: any = {
      author,
      role,
      company,
      content,
      stars,
      display_order: displayOrder,
      is_active: isActive
    };
    if (editingId) body.id = editingId;

    try {
      const res = await fetch("/api/admin/reviews", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        resetForm();
        fetchReviews();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to save review.");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchReviews();
      } else {
        alert("Failed to delete review.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const toggleActive = async (rev: Review) => {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...rev,
          is_active: !rev.is_active
        })
      });
      if (res.ok) fetchReviews();
    } catch (err) {
      console.error("Toggle active error:", err);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.author.toLowerCase().includes(q) ||
      r.role.toLowerCase().includes(q) ||
      (r.company && r.company.toLowerCase().includes(q)) ||
      r.content.toLowerCase().includes(q)
    );
  });

  return (
    <PermissionGate permission="manage_reviews">
      <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Quote className="h-5 w-5 text-primary" />
              Reviews
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {userRole !== "viewer" && (
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add Review
            </button>
          )}
        </div>
      </div>

      {/* Table Form Content */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto scrollbar-hide">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-14 text-center">S.No</th>
                <th className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
                <th className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
                <th className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Review</th>
                <th className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rating</th>
                <th className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Order</th>
                <th className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Status</th>
                <th className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredReviews.map((rev, index) => {
                const isExpanded = expandedIds.has(rev.id);
                return (
                  <tr key={rev.id} className="group hover:bg-muted/30 transition-all duration-200">
                    {/* S.No */}
                    <td className="px-5 py-4 text-sm font-medium text-muted-foreground text-center">
                      {index + 1}
                    </td>

                    {/* Client */}
                    <td className="px-5 py-4">
                      <span className="font-semibold text-foreground text-sm">
                        {rev.author}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4 text-sm text-foreground/85">
                      {rev.role}
                    </td>

                    {/* Company */}
                    <td className="px-5 py-4 text-sm text-foreground/80">
                      {rev.company || "—"}
                    </td>

                    {/* Review (Truncated snippet with ... dots to show remaining content) */}
                    <td className="px-5 py-4 whitespace-normal min-w-[240px] max-w-sm">
                      <div className="flex items-start gap-1.5">
                        <p className={`text-xs text-foreground/85 italic leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                          "{rev.content}"
                        </p>
                        {rev.content && rev.content.length > 50 && (
                          <button
                            type="button"
                            onClick={() => toggleRow(rev.id)}
                            className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-black text-primary hover:bg-primary/10 tracking-widest transition-colors cursor-pointer shrink-0 mt-0.5"
                            title={isExpanded ? "Collapse review" : "Click ... to view remaining content"}
                          >
                            ...
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-yellow-400">
                        {[...Array(rev.stars || 5)].map((_, idx) => (
                          <Star key={idx} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-xs font-semibold text-muted-foreground ml-1.5">
                          {rev.stars || 5}.0
                        </span>
                      </div>
                    </td>

                    {/* Order */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-block text-[11px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
                        {rev.display_order}
                      </span>
                    </td>

                    {/* Status & Quick Toggle */}
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleActive(rev);
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border shadow-sm ${
                          rev.is_active
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                        }`}
                        title={rev.is_active ? "Active on site (click to hide)" : "Hidden (click to activate)"}
                      >
                        {rev.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {rev.is_active ? "Active" : "Hidden"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        {userRole !== "viewer" && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(rev);
                              }}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 rounded-xl transition-all shadow-sm hover:shadow"
                              title="Edit Review"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(rev.id);
                              }}
                              className="p-2 text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-xl transition-all shadow-sm hover:shadow"
                              title="Delete Review"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <MessageSquareQuote className="h-12 w-12 opacity-25 mb-3" />
                      <p className="text-sm font-semibold text-foreground">No reviews found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {searchQuery ? "Try refining your search query." : "Click 'Add Review' to create your first client review."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Review Modal (Without backdrop blur) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {editingId ? "Edit Review" : "Add Client Review"}
              </h3>
              <button
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Client / Author Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Mehta"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Director, Global Pharma"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Global Pharma Solutions"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Review / Testimonial Content *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter the client's testimonial..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Star Rating (1 - 5)
                  </label>
                  <div className="flex items-center gap-1.5 mt-1">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setStars(starVal)}
                        className="p-1 text-yellow-400 focus:outline-none"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            starVal <= stars ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-foreground ml-2">{stars} / 5</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveReview"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <label htmlFor="isActiveReview" className="text-xs font-semibold text-foreground cursor-pointer">
                  Display actively on homepage
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Update Review" : "Save Review"}
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
