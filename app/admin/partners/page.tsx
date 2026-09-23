"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Eye, EyeOff, UploadCloud, Loader2, Image as ImageIcon, Pencil, ExternalLink, Save, X } from "lucide-react";
import { createPortal } from "react-dom";
import PermissionGate from "@/components/admin/PermissionGate";

type Partner = {
  id: number;
  name: string;
  logo_url: string;
  website_url: string;
  display_order: number;
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
};

export default function PartnersCMS() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [userRole, setUserRole] = useState("viewer");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPartners = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/partners");
    if (res.ok) {
      const data = await res.json();
      setPartners(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    setUserRole(localStorage.getItem("user_role") || "viewer");
    fetchPartners();
  }, []);

  const resetForm = () => {
    setName("");
    setLogoUrl("");
    setWebsiteUrl("");
    setDisplayOrder(0);
    setIsActive(true);
    setSeoTitle("");
    setSeoDescription("");
    setSeoKeywords("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (partner: Partner) => {
    setName(partner.name);
    setLogoUrl(partner.logo_url || "");
    setWebsiteUrl(partner.website_url || "");
    setDisplayOrder(partner.display_order);
    setIsActive(partner.is_active);
    setSeoTitle(partner.seo_title || "");
    setSeoDescription(partner.seo_description || "");
    setSeoKeywords(partner.seo_keywords || "");
    setEditingId(partner.id);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);

    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/upload", { 
        method: "POST", 
        headers: { "Authorization": `Bearer ${token}` },
        body: data 
      });
      if (res.ok) {
        const result = await res.json();
        setLogoUrl(result.url);
      }
    } catch (error) {
      console.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
      id: editingId,
      name,
      logo_url: logoUrl,
      website_url: websiteUrl,
      display_order: displayOrder,
      is_active: isActive,
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_keywords: seoKeywords
    };

    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/admin/partners", {
        method: editingId ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchPartners();
        resetForm();
      }
    } catch (error) {
      console.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this partner logo?")) return;
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`/api/admin/partners?id=${id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchPartners();
      }
    } catch (error) {
      console.error("Delete failed");
    }
  };

  const handleToggleActive = async (partner: Partner) => {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/admin/partners", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...partner, is_active: !partner.is_active }),
      });
      if (res.ok) {
        await fetchPartners();
      }
    } catch (error) {
      console.error("Toggle failed");
    }
  };

  return (
    <PermissionGate permission="manage_partners">
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-3xl font-bold tracking-tight">Partner Logos</h3>
        </div>
        <button 
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          onClick={() => { resetForm(); setShowForm(true); }}
        >
          <Plus className="h-4 w-4" /> Add Logo
        </button>
      </div>

      {showForm ? (
        <div className="bg-card border border-border/50 shadow-sm rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <h4 className="text-lg font-semibold">{editingId ? "Edit Partner Logo" : "Add Partner Logo"}</h4>
          </div>
          <div className="p-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
                
                {/* Logo Upload Box */}
                <div className="rounded-2xl border border-border bg-muted/20 p-5 flex flex-col justify-between h-full">
                  <div className="flex-1 min-h-[140px] flex items-center justify-center rounded-xl border-2 border-dashed bg-background p-4 relative group hover:border-primary/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo preview" className="h-full w-full object-cover p-2" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                        <span className="text-xs font-medium">Click to upload</span>
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-xl">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  {logoUrl && (
                    <button 
                      type="button" 
                      onClick={() => setLogoUrl("")} 
                      className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" /> Remove Logo
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Name *</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="Partner company name" 
                      required 
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Display Order</label>
                    <input 
                      type="number" 
                      value={displayOrder} 
                      onChange={e => setDisplayOrder(Number(e.target.value))} 
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold">Website URL</label>
                    <input 
                      type="url" 
                      value={websiteUrl} 
                      onChange={e => setWebsiteUrl(e.target.value)} 
                      placeholder="https://" 
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    />
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="isActive" 
                      checked={isActive} 
                      onChange={e => setIsActive(e.target.checked)} 
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4" 
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">Show on website</label>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border/50 pt-6 mt-6">
                <h5 className="font-semibold text-base mb-4">SEO Settings</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-black">Meta Title</label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={e => setSeoTitle(e.target.value)}
                        placeholder="SEO Title..."
                        className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-black">Meta Keywords</label>
                      <input
                        type="text"
                        value={seoKeywords}
                        onChange={e => setSeoKeywords(e.target.value)}
                        placeholder="e.g. partner, tech, solutions"
                        className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-black">Meta Description</label>
                    <textarea
                      value={seoDescription}
                      onChange={e => setSeoDescription(e.target.value)}
                      placeholder="Brief description for search engines..."
                      className="w-full h-full min-h-[108px] rounded-xl border border-input bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-border/50 mt-6">
                <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Update Partner" : "Add Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : loading ? (
        <div className="space-y-4 pt-10">
          <div className="flex justify-center items-center h-32">
             <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
          </div>
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No partners found</h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">You haven't added any partner logos yet. Add them to showcase them on your website.</p>
          <button disabled={userRole === 'viewer'} 
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4" /> Add First Logo
          </button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-x-auto overflow-y-auto max-h-[80vh] scrollbar-hide">
          <table className="w-full text-left text-sm whitespace-nowrap relative">
            <thead className="bg-muted border-b border-border/50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 font-medium text-foreground w-16">S.No</th>
                <th className="px-6 py-4 font-medium text-foreground">Logo</th>
                <th className="px-6 py-4 font-medium text-foreground">Partner Name</th>
                <th className="px-6 py-4 font-medium text-foreground">Website URL</th>
                <th className="px-6 py-4 font-medium text-foreground">Order</th>
                <th className="px-6 py-4 font-medium text-foreground">Status</th>
                <th className="px-6 py-4 font-medium text-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {partners.map((partner, index) => (
                <tr key={partner.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="h-12 w-20 rounded-md bg-white border border-border/50 flex items-center justify-center shrink-0 overflow-hidden">
                      {partner.logo_url ? (
                        <img src={partner.logo_url} alt={partner.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {partner.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {partner.website_url ? (
                      <a href={partner.website_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-500 hover:underline transition-colors">
                        Visit Site <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {partner.display_order}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${partner.is_active ? 'bg-emerald-100/50 text-emerald-700' : 'bg-amber-100/50 text-amber-700'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${partner.is_active ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                      {partner.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button disabled={userRole === 'viewer'} 
                        onClick={() => handleToggleActive(partner)}
                        className={`p-2 rounded-lg transition-colors ${partner.is_active ? 'text-slate-500 hover:bg-slate-100' : 'text-amber-600 hover:bg-amber-50'}`}
                        title={partner.is_active ? "Hide" : "Show"}
                      >
                        {partner.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button disabled={userRole === 'viewer'} 
                        onClick={() => handleEdit(partner)}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" 
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button disabled={userRole === 'viewer'} 
                        onClick={() => handleDelete(partner.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" 
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </PermissionGate>
  );
}
