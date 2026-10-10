"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, PlusCircle, Edit2, Trash2, Loader2, X, Save, Activity, LayoutTemplate } from "lucide-react";
import * as Icons from "lucide-react";
import { createPortal } from "react-dom";
import PermissionGate from "@/components/admin/PermissionGate";

type TallyService = {
  id: number;
  title: string;
  description: string;
  highlight: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
  slug?: string;
};

const ExpandableDescription = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  if (text.length <= 60) return <span>{text}</span>;
  return (
    <span>
      {expanded ? (
        <span 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(false); }} 
          className="cursor-pointer title-collapse hover:text-foreground transition-colors"
          title="Click to collapse"
        >
          {text}
        </span>
      ) : (
        <span>
          {text.substring(0, 60)}
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(true); }} 
            className="text-muted-foreground hover:text-primary font-bold tracking-widest cursor-pointer focus:outline-none ml-1"
            title="Click to show more"
          >
            ...
          </button>
        </span>
      )}
    </span>
  );
};

export default function AdminTallyServicesPage() {
  const [tallyServices, setTallyServices] = useState<TallyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTallyService, setEditingTallyService] = useState<TallyService | null>(null);
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState("viewer");

  useEffect(() => setMounted(true), []);

  const [formData, setFormData] = useState({ title: "", description: "", highlight: "", icon_name: "Activity", display_order: 0, is_active: true, _iconSearchFocus: false });

  const fetchTallyServices = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/tally-services");
    if (res.ok) {
      const data = await res.json();
      setTallyServices(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    setUserRole(localStorage.getItem("user_role") || "viewer");
    fetchTallyServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingTallyService ? "PUT" : "POST";
    const body = editingTallyService ? { id: editingTallyService.id, ...formData } : formData;

    const res = await fetch("/api/admin/tally-services", {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setIsModalOpen(false);
      setEditingTallyService(null);
      setFormData({ title: "", description: "", highlight: "", icon_name: "Activity", display_order: 0, is_active: true, _iconSearchFocus: false });
      fetchTallyServices();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    const res = await fetch(`/api/admin/tally-services?id=${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
    });
    if (res.ok) fetchTallyServices();
  };

  const openEdit = (service: TallyService) => {
    setEditingTallyService(service);
    setFormData({ title: service.title, description: service.description, highlight: service.highlight, icon_name: service.icon_name, display_order: service.display_order, is_active: service.is_active, _iconSearchFocus: false });
    setIsModalOpen(true);
  };

  return (
    <PermissionGate permission="manage_tally_services">
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 -mt-4">
        <h2 className="text-2xl font-bold tracking-tight">Tally Services</h2>
        <button
          onClick={() => { setEditingTallyService(null); setFormData({ title: "", description: "", highlight: "", icon_name: "Activity", display_order: 0, is_active: true, _iconSearchFocus: false }); setIsModalOpen(true); }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4 shrink-0" /> <span>Add Tally Service</span>
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap relative">
          <thead className="bg-muted border-b border-border/50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-foreground w-16">S.No</th>
              <th className="px-4 py-3 text-sm font-medium text-foreground">Tally Service Name</th>
              <th className="px-4 py-3 text-sm font-medium text-foreground">Highlight</th>
              
              <th className="px-4 py-3 text-sm font-medium text-foreground">Order</th>
              <th className="px-4 py-3 text-sm font-medium text-foreground">Status</th>
              <th className="px-4 py-3 text-sm font-medium text-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
            ) : tallyServices.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No tally-services found. Click 'Add Tally Service' to create one.</td></tr>
            ) : tallyServices.map((service, index) => {
              const Icon = (Icons as any)[service.icon_name] || Activity;

              return (
                <tr key={service.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                  <td className="px-4 py-3 text-sm">
                    {service.slug ? (
                      <Link href={`/admin/tally-services/${service.slug}`} className="flex items-center gap-4 group cursor-pointer block">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center overflow-hidden shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{service.title}</div>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center overflow-hidden shrink-0">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm">{service.title}</div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-xs font-bold text-primary/80 uppercase tracking-wider">{service.highlight}</span>
                  </td>
                  
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{service.display_order}</td>
                  <td className="px-4 py-3 text-sm">
                    {service.is_active ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500">Active</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">Hidden</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <button onClick={() => openEdit(service)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg mr-2 transition-colors" title="Edit Basic Info">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button disabled={userRole === 'viewer'} onClick={() => handleDelete(service.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-6 pb-4 border-b border-border">{editingTallyService ? "Edit Tally Service" : "Add Tally Service"}</h2>

            
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Tally Service Title</label>
                  <input required type="text" placeholder="e.g. Product Development" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Highlight (Small overhead text)</label>
                  <input required type="text" placeholder="e.g. Full-cycle development" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.highlight} onChange={e => setFormData({ ...formData, highlight: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Description</label>
                  <textarea required placeholder="Detailed description..." className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-24 resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Lucide Icon Name</label>
                  <div className="flex gap-3 relative">
                    <div className="flex-1 relative">
                      <input
                        required
                        type="text"
                        placeholder="e.g. Code, Users, Headphones, Cog"
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={formData.icon_name}
                        onChange={e => setFormData({ ...formData, icon_name: e.target.value })}
                        onFocus={() => setFormData(prev => ({ ...prev, _iconSearchFocus: true }))}
                        onBlur={() => setTimeout(() => setFormData(prev => ({ ...prev, _iconSearchFocus: false })), 200)}
                      />
                      {formData._iconSearchFocus && formData.icon_name && (
                        <div className="absolute z-10 top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl">
                          {Object.keys(Icons)
                            .filter(key => key.toLowerCase().includes(formData.icon_name.toLowerCase()) && key !== 'default' && key !== 'createLucideIcon')
                            .slice(0, 50)
                            .map(iconKey => {
                              const IconComponent = (Icons as any)[iconKey];
                              return (
                                <div
                                  key={iconKey}
                                  className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100"
                                  onClick={() => setFormData({ ...formData, icon_name: iconKey, _iconSearchFocus: false })}
                                >
                                  <IconComponent className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm">{iconKey}</span>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 text-primary">
                      {(() => {
                        const PreviewIcon = (Icons as any)[formData.icon_name];
                        return PreviewIcon ? <PreviewIcon className="w-5 h-5" /> : <Activity className="w-5 h-5 opacity-50" />;
                      })()}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">Type the exact name of a <a href="https://lucide.dev/icons/" target="_blank" rel="noreferrer" className="text-primary hover:underline">Lucide icon</a>.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Display Order</label>
                    <input type="number" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })} />
                  </div>
                  <div className="flex items-end pb-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="isActiveTallyService" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="rounded border-input text-primary focus:ring-primary" />
                      <label htmlFor="isActiveTallyService" className="text-sm font-medium">Visible on Homepage</label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">Save Service</button>
                </div>
              </form>
            </div>
          </div>
      )}
    </div>
    </PermissionGate>
  );
}









