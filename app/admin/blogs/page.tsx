"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, FileText, Calendar, Clock, PlusCircle, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PermissionGate from "@/components/admin/PermissionGate";

type Blog = {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  image_url: string;
  published_date: string;
  read_time: string;
  is_active: boolean;
};

export default function BlogsCMS() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [userRole, setUserRole] = useState("viewer");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blogs");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    setUserRole(localStorage.getItem("user_role") || "viewer");
    fetchBlogs();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    const res = await fetch(`/api/admin/blogs?id=${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
    });
    if (res.ok) {
      fetchBlogs();
    } else {
      alert("Failed to delete blog post");
    }
  };

  return (
    <PermissionGate permission="manage_blogs">
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold tracking-tight">Blogs</h2>
        <Link
          href="/admin/blogs/create"
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
        >
          <PlusCircle className="h-4 w-4" /> New Post
        </Link>
      </div>

      {/* Blogs Table */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-x-auto overflow-y-auto max-h-[80vh]">
        <table className="w-full text-left text-sm whitespace-nowrap relative">
          <thead className="bg-muted border-b border-border/50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 font-medium text-foreground w-16">S.No</th>
              <th className="px-6 py-4 font-medium text-foreground">Blog Post</th>
              <th className="px-6 py-4 font-medium text-foreground">Category</th>
              <th className="px-6 py-4 font-medium text-foreground">Date</th>
              <th className="px-6 py-4 font-medium text-foreground">Status</th>
              <th className="px-6 py-4 font-medium text-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
            ) : blogs.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No blogs found.</td></tr>
            ) : blogs.map((blog, index) => (
              <tr key={blog.id} className="group hover:bg-muted/30 transition-all duration-200">
                <td className="px-6 py-4 text-muted-foreground">{index + 1}</td>
                <td className="px-6 py-4 font-medium text-foreground min-w-[250px] max-w-[350px]">
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-100 text-sky-600 rounded-lg flex-shrink-0 overflow-hidden w-10 h-10 flex items-center justify-center">
                      {blog.image_url ? (
                        <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </div>
                    <div className="truncate">
                      {blog.title}
                      <div className="text-xs text-muted-foreground font-normal mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {blog.read_time}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-muted px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider text-slate-600 uppercase">
                    {blog.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(blog.published_date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${blog.is_active ? 'bg-emerald-100/50 text-emerald-700' : 'bg-amber-100/50 text-amber-700'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${blog.is_active ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                    {blog.is_active ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/admin/blogs/${blog.id}`}
                      className="p-2 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 rounded-xl transition-all shadow-sm hover:shadow-md"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button disabled={userRole === 'viewer'}
                      onClick={() => handleDelete(blog.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none"
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
    </div>
    </PermissionGate>
  );
}
