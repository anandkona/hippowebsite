"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, X } from "lucide-react";
import PermissionGate from "@/components/admin/PermissionGate";

type Skill = {
  id: number;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
};

export default function SkillsAdmin() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userRole, setUserRole] = useState("viewer");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUserRole(localStorage.getItem("user_role") || "viewer");
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/skills");
      if (res.ok) {
        const data = await res.json();
        setSkills(data);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImageUrl("");
    setDisplayOrder(0);
    setIsActive(true);
    setSeoTitle("");
    setSeoDescription("");
    setSeoKeywords("");
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (skill: Skill) => {
    setTitle(skill.title);
    setDescription(skill.description);
    setImageUrl(skill.image_url || "");
    setDisplayOrder(skill.display_order);
    setIsActive(skill.is_active);
    setSeoTitle(skill.seo_title || "");
    setSeoDescription(skill.seo_description || "");
    setSeoKeywords(skill.seo_keywords || "");
    setEditingId(skill.id);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const body = { 
      id: editingId, 
      title, 
      description, 
      image_url: imageUrl, 
      display_order: displayOrder, 
      is_active: isActive,
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_keywords: seoKeywords
    };

    try {
      const res = await fetch("/api/admin/skills", {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        resetForm();
        fetchSkills();
      } else {
        alert("Failed to save skill.");
      }
    } catch (error) {
      console.error("Error saving skill:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/skills?id=${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        }
      });

      if (res.ok) {
        fetchSkills();
      } else {
        alert("Failed to delete skill");
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PermissionGate permission="manage_skills">
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Skills Hub</h2>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Add Skill
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32 bg-card rounded-2xl border border-border shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
        </div>
      ) : skills.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border border-dashed p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <ImageIcon className="h-10 w-10 text-primary/60" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No skills found</h3>
          <p className="text-muted-foreground max-w-md mb-6">Add your first skill to showcase it in the academy section.</p>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-primary/10 text-primary px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/20 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add First Skill
          </button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap relative">
            <thead className="bg-muted border-b border-border/50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 font-medium text-foreground w-16">S.No</th>
                <th className="px-6 py-4 font-medium text-foreground">Skill Image</th>
                <th className="px-6 py-4 font-medium text-foreground">Title</th>
                <th className="px-6 py-4 font-medium text-foreground w-1/3">Description</th>
                <th className="px-6 py-4 font-medium text-foreground">Order</th>
                <th className="px-6 py-4 font-medium text-foreground">Status</th>
                <th className="px-6 py-4 font-medium text-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {skills.map((skill, index) => (
                <tr key={skill.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="h-12 w-12 rounded-xl bg-muted/30 p-2 flex items-center justify-center shrink-0 border border-border/50">
                      {skill.image_url ? (
                        <img src={skill.image_url} alt={skill.title} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {skill.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground whitespace-normal max-w-[400px]">
                    <span className="line-clamp-2" title={skill.description}>{skill.description}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {skill.display_order}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${skill.is_active ? 'bg-emerald-100/50 text-emerald-700' : 'bg-amber-100/50 text-amber-700'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${skill.is_active ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                      {skill.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button disabled={userRole === 'viewer'}
                        onClick={() => handleEdit(skill)}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        disabled={deletingId === skill.id || userRole === 'viewer'}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === skill.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200" onClick={resetForm}>
          <div className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border/50 bg-muted/10 flex justify-between items-center">
              <h4 className="text-lg font-semibold">{editingId ? "Edit Skill" : "Add Skill"}</h4>
              <button onClick={resetForm} className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="skillForm" onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">

                  {/* Image Upload Box */}
                  <div className="rounded-2xl border border-border bg-muted/20 p-5 flex flex-col justify-between h-full">
                    <div className="flex-1 min-h-[140px] flex items-center justify-center rounded-xl border-2 border-dashed bg-background p-4 relative group hover:border-primary/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      {imageUrl ? (
                        <img src={imageUrl} alt="Skill preview" className="max-h-full max-w-full object-contain p-2" />
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
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" /> Remove Image
                      </button>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Title *</label>
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Artificial Intelligence"
                        required
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-1 block">Description *</label>
                      <textarea 
                        required 
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-24 overflow-hidden"
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        placeholder="Short description of the skill..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Display Order</label>
                        <input
                          type="number"
                          value={displayOrder}
                          onChange={e => setDisplayOrder(Number(e.target.value))}
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div className="flex items-end pb-2">
                        <div className="flex items-center gap-2">
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
                  </div>
                </div>

                <div className="border-t border-border/50 pt-6 mt-6">
                  <h5 className="font-semibold text-base mb-4">SEO Settings</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Meta Title</label>
                        <input
                          type="text"
                          value={seoTitle}
                          onChange={e => setSeoTitle(e.target.value)}
                          placeholder="SEO Title..."
                          className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Meta Keywords</label>
                        <input
                          type="text"
                          value={seoKeywords}
                          onChange={e => setSeoKeywords(e.target.value)}
                          placeholder="e.g. skill, tech, training"
                          className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Meta Description</label>
                      <textarea
                        value={seoDescription}
                        onChange={e => setSeoDescription(e.target.value)}
                        placeholder="Brief description for search engines..."
                        className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 h-full min-h-[108px] resize-none"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-border/50 bg-muted/10 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                Cancel
              </button>
              <button type="submit" form="skillForm" className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                {editingId ? "Update Skill" : "Save Skill"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PermissionGate>
  );
}

