"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, Upload, UploadCloud, X, Save } from "lucide-react";
import { createPortal } from "react-dom";
import PermissionGate from "@/components/admin/PermissionGate";

type Banner = {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  is_active: boolean;
};

export default function BannersCMS() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [userRole, setUserRole] = useState("viewer");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [formData, setFormData] = useState({ title: "", subtitle: "", image_url: "", is_active: false });
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const fetchBanners = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/banners");
    if (res.ok) {
      const data = await res.json();
      setBanners(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    setUserRole(localStorage.getItem("user_role") || "viewer");
    fetchBanners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingBanner ? "PUT" : "POST";
    const body = editingBanner ? { id: editingBanner.id, ...formData } : formData;

    const res = await fetch("/api/admin/banners", {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setIsModalOpen(false);
      setEditingBanner(null);
      setFormData({ title: "", subtitle: "", image_url: "", is_active: false });
      fetchBanners();
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/banners?id=${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
    });
    if (res.ok) fetchBanners();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` },
        body: formDataUpload,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData({ ...formData, image_url: data.url });
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({ title: banner.title, subtitle: banner.subtitle, image_url: banner.image_url, is_active: banner.is_active });
    setIsModalOpen(true);
  };

  return (
    <PermissionGate permission="manage_banners">
    <div className="w-full">
      <div className="flex justify-end items-center mb-6">
        <button 
          onClick={() => { setEditingBanner(null); setFormData({ title: "", subtitle: "", image_url: "", is_active: false }); setIsModalOpen(true); }}
          className="bg-primary text-primary-foreground hover:bg-primary/95 h-10 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4 shrink-0" /> <span>Add Banner</span>
        </button>
      </div>
      
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-x-auto overflow-y-auto max-h-[80vh]">
        <table className="w-full text-left text-sm whitespace-nowrap relative">
          <thead className="bg-muted border-b border-border/50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 font-medium text-foreground w-16">S.No</th>
              <th className="px-6 py-4 font-medium text-foreground">Image</th>
              <th className="px-6 py-4 font-medium text-foreground">Title</th>
              <th className="px-6 py-4 font-medium text-foreground">Status</th>
              <th className="px-6 py-4 font-medium text-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
            ) : banners.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No banners found.</td></tr>
            ) : banners.map((banner, index) => (
              <tr key={banner.id} className="hover:bg-muted/20">
                <td className="px-6 py-4 text-muted-foreground">{index + 1}</td>
                <td className="px-6 py-4">
                  <div className="h-16 w-32 rounded-lg overflow-hidden bg-muted">
                    <img src={banner.image_url} alt="Banner" className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-foreground">
                  {banner.title}
                  <div className="text-xs text-muted-foreground font-normal mt-1">{banner.subtitle.substring(0, 50)}...</div>
                </td>
                <td className="px-6 py-4">
                  {banner.is_active ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEdit(banner)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg mr-2 transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button disabled={userRole === 'viewer'} onClick={() => handleDelete(banner.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editingBanner ? "Edit Banner" : "Add Banner"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Title</label>
                <input required type="text" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Subtitle</label>
                <textarea required className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-24" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Background Image</label>
                <div className="flex items-center gap-4">
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="h-16 w-24 object-cover rounded border border-border" />
                  )}
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-colors relative overflow-hidden">
                      {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <UploadCloud className="h-6 w-6 mb-2" />
                          <span className="text-xs font-medium">Click to upload</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="rounded border-input text-primary focus:ring-primary" />
                <label htmlFor="isActive" className="text-sm font-medium">Set as Active Banner</label>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2">
                  <X className="h-4 w-4 shrink-0" />
                  <span>Cancel</span>
                </button>
                <button type="submit" className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-md">
                  <Save className="h-4 w-4 shrink-0" />
                  <span>Save Banner</span>
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
