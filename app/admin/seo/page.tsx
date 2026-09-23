"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, X, Save } from "lucide-react";
import PermissionGate from "@/components/admin/PermissionGate";

export default function SEOCMS() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("viewer");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [initialData, setInitialData] = useState({ page_path: "/", title: "", description: "", keywords: "" });
  const [formData, setFormData] = useState({ page_path: "/", title: "", description: "", keywords: "" });

  const fetchSeo = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/seo");
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        // Just use the first one (usually the homepage '/')
        const seo = data[0];
        const seoData = { page_path: seo.page_path, title: seo.title, description: seo.description, keywords: seo.keywords };
        setFormData(seoData);
        setInitialData(seoData);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    setUserRole(localStorage.getItem("user_role") || "viewer");
    fetchSeo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const res = await fetch("/api/admin/seo", {
      method: "POST", // Upsert
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setSaved(true);
      setInitialData(formData); // Update initial data to the newly saved data
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <PermissionGate permission="manage_seo">
    <div className="w-full">
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold mb-1 block">Meta Title</label>
                <input required type="text" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Hippo Cloud Technologies" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Meta Keywords</label>
                <input type="text" className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} placeholder="cloud, software, development" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Meta Description</label>
              <textarea required className="w-full h-[180px] rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Scalable Cloud Solutions..." />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border/50">
            <button type="button" onClick={() => setFormData(initialData)} className="w-full sm:w-auto px-6 py-3 sm:py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2">
              <X className="h-4 w-4 shrink-0" />
              <span>Cancel</span>
            </button>
            <button type="submit" disabled={saving} className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-md">
              {saving ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : saved ? <Check className="h-4 w-4 shrink-0" /> : <Save className="h-4 w-4 shrink-0" />}
              <span>{saving ? "Saving..." : saved ? "Saved!" : "Save SEO Settings"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    </PermissionGate>
  );
}
