"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Pencil, ShieldAlert, ShieldCheck, Shield, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import PermissionGate from "@/components/admin/PermissionGate";

type User = {
  id: number;
  username: string;
  email: string;
  role_id: number;
  role_name: string;
  created_at: string;
};

type Role = {
  id: number;
  name: string;
};

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<number | "">("");

  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Quick permission check on client side
    try {
      const perms = JSON.parse(localStorage.getItem("user_permissions") || "[]");
      if (!perms.includes("manage_team")) {
        router.push("/admin/dashboard");
      } else {
        fetchData();
      }
    } catch (e) {
      router.push("/admin/login");
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const headers = { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` };
    
    const [usersRes, rolesRes] = await Promise.all([
      fetch("/api/admin/users", { headers }),
      fetch("/api/admin/roles", { headers })
    ]);

    if (usersRes.ok && rolesRes.ok) {
      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();
      setUsers(usersData);
      setRoles(rolesData);
      if (rolesData.length > 0) setRoleId(rolesData[0].id);
    } else {
      router.push("/admin/dashboard");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setRoleId(roles.length > 0 ? roles[0].id : "");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (user: User) => {
    setUsername(user.username);
    setEmail(user.email);
    setPassword(""); // Keep password empty unless changing
    setRoleId(user.role_id);
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleId) return alert('Please select a role');

    setIsSaving(true);
    
    const payload = {
      id: editingId,
      username,
      email,
      role_id: roleId,
      password: password || undefined
    };

    try {
      const res = await fetch("/api/admin/users", {
        method: editingId ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchData();
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

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
      });
      if (res.ok) {
        await fetchData();
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
          <h3 className="text-3xl font-bold tracking-tight">Users</h3>
        </div>
        <button 
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          onClick={() => { resetForm(); setShowForm(true); }}
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border/50 shadow-sm rounded-xl overflow-hidden mb-6">
          <div className="p-6 border-b border-border/50">
            <h4 className="text-lg font-semibold">{editingId ? "Edit User" : "Add User"}</h4>
          </div>
          <div className="p-6">
            <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Username</label>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    required 
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Password {editingId && <span className="text-xs text-muted-foreground font-normal">(Leave blank to keep unchanged)</span>}</label>
                  <div className="relative group">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required={!editingId} 
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Role</label>
                  <select
                    value={roleId}
                    onChange={e => setRoleId(Number(e.target.value))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
                <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Update User" : "Add User"}
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
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16 text-center">S.No</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role & Permissions</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {users.map((u, index) => (
                <tr key={u.id} className="group hover:bg-muted/30 transition-all duration-200">
                  <td className="px-6 py-4 text-xs font-mono text-muted-foreground text-center">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{u.username}</span>
                      <span className="text-xs text-muted-foreground">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm">
                      {u.role_name === 'Super Admin' ? <ShieldAlert className="h-3.5 w-3.5"/> : <Shield className="h-3.5 w-3.5" />}
                      {u.role_name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(u)}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 rounded-xl transition-all shadow-sm hover:shadow-md" 
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {u.username !== 'admin' && (
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-xl transition-all shadow-sm hover:shadow-md" 
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ShieldAlert className="h-12 w-12 opacity-20 mb-4" />
                      <p className="text-sm font-medium">No users found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </PermissionGate>
  );
}

