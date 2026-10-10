"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Pencil, ShieldAlert, Shield, Check, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import PermissionGate from "@/components/admin/PermissionGate";

type Role = {
  id: number;
  name: string;
  permissions: string[];
  created_at: string;
};

const AVAILABLE_PERMISSIONS = [
  { id: 'manage_blogs', name: 'Manage Blogs' },
  { id: 'manage_skills', name: 'Manage Skills' },
  { id: 'manage_partners', name: 'Manage Partners' },
  { id: 'manage_products', name: 'Manage Products' },
  { id: 'manage_services', name: 'Manage Services' },
    { id: 'manage_tally_services', name: 'Manage Tally Services' },
  { id: 'manage_seo', name: 'Manage Global SEO' },
  { id: 'manage_banners', name: 'Manage Banners' },
  { id: 'manage_reviews', name: 'Manage Reviews' },
  { id: 'manage_chat', name: 'Manage Live Chat' },
  { id: 'manage_team', name: 'Manage Team & Roles (Super Admin Level)' },
];

export default function RolesAdmin() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [viewingRolePerms, setViewingRolePerms] = useState<Role | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/roles", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
    });
    if (res.ok) {
      const data = await res.json();
      setRoles(data);
    } else {
      router.push("/admin/dashboard");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setName("");
    setPermissions([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (role: Role) => {
    if (role.name === 'Super Admin') {
      alert("You cannot edit the default Super Admin role.");
      return;
    }
    setName(role.name);
    setPermissions(role.permissions || []);
    setEditingId(role.id);
    setShowForm(true);
  };

  const handleTogglePermission = (permId: string) => {
    setPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '') return alert('Name is required');

    setIsSaving(true);
    
    const payload = {
      id: editingId,
      name,
      permissions
    };

    try {
      const res = await fetch("/api/admin/roles", {
        method: editingId ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchRoles();
        resetForm();
      } else {
        const err = await res.json();
        alert(`Failed to save: ${err.message}`);
      }
    } catch (error) {
      console.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if (role.name === 'Super Admin') {
      alert("You cannot delete the Super Admin role.");
      return;
    }
    if (!confirm(`Are you sure you want to delete the ${role.name} role?`)) return;
    try {
      const res = await fetch(`/api/admin/roles?id=${role.id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
      });
      if (res.ok) {
        await fetchRoles();
      } else {
        const err = await res.json();
        alert(`Delete failed: ${err.message}`);
      }
    } catch (error) {
      console.error("Delete failed");
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <PermissionGate permission="manage_team">
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-3xl font-bold tracking-tight">Custom Roles</h3>
        </div>
        <button 
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          onClick={() => { resetForm(); setShowForm(true); }}
        >
          <Plus className="h-4 w-4" /> Create Role
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border/50 shadow-sm rounded-xl overflow-hidden mb-6">
          <div className="p-6 border-b border-border/50">
            <h4 className="text-lg font-semibold">{editingId ? "Edit Role" : "Create Role"}</h4>
          </div>
          <div className="p-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2 max-w-md">
                <label className="text-sm font-semibold">Role Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  placeholder="e.g. Content Manager"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <label className="text-sm font-semibold">Permissions</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {AVAILABLE_PERMISSIONS.map(perm => {
                    const isSelected = permissions.includes(perm.id);
                    return (
                      <label 
                        key={perm.id} 
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/50'}`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border shrink-0 ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background'}`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={isSelected}
                          onChange={() => handleTogglePermission(perm.id)} 
                        />
                        <span className="text-sm font-medium leading-tight select-none">
                          {perm.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex gap-3 justify-end pt-6 border-t border-border/50">
                <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Update Role" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap relative">
            <thead className="bg-muted/50 border-b border-border/50 backdrop-blur-xl">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">S.No</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {roles.map((r, index) => (
                <tr key={r.id} className="group hover:bg-muted/30 transition-all duration-200">
                  <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center h-8 w-8 rounded-full ${r.name === 'Super Admin' ? 'bg-purple-100 text-purple-600' : 'bg-primary/10 text-primary'}`}>
                        {r.name === 'Super Admin' ? <ShieldAlert className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                      </div>
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                      <button 
                        onClick={() => setViewingRolePerms(r)} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {r.permissions?.length || 0} Permissions
                      </button>
                    </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(r)}
                        disabled={r.name === 'Super Admin'}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none" 
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(r)}
                        disabled={r.name === 'Super Admin'}
                        className="p-2 text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none" 
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ShieldAlert className="h-12 w-12 opacity-20 mb-4" />
                      <p className="text-sm font-medium">No roles found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
    
      {/* View Permissions Modal */}
      {viewingRolePerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200" onClick={() => setViewingRolePerms(null)}>
          <div className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h2 className="text-lg font-bold">Permissions: {viewingRolePerms.name}</h2>
              
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {viewingRolePerms.permissions && viewingRolePerms.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {viewingRolePerms.permissions.map(pId => {
                    const def = AVAILABLE_PERMISSIONS.find(p => p.id === pId);
                    return (
                      <span key={pId} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                        {def?.name || pId}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No permissions assigned to this role.</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-border/50 bg-muted/20 flex justify-end">
              <button onClick={() => setViewingRolePerms(null)} className="px-6 py-2 rounded-xl bg-muted text-muted-foreground font-semibold hover:bg-muted/80 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PermissionGate>
  );
}





