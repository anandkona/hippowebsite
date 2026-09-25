"use client";

import { useState, useEffect } from "react";
import {
  ImageIcon,
  Users,
  Search,
  BookOpen,
  Briefcase,
  Package,
  GraduationCap,
  Quote,
  Loader2
} from "lucide-react";
import Link from "next/link";

type Stats = {
  banners: { total: number; active: number };
  partners: { total: number };
  blogs: { total: number; active: number };
  seo: { total: number };
  products: { total: number; active: number };
  services: { total: number; active: number };
  skills: { total: number; active: number };
  reviews?: { total: number; active: number };
};

export default function AdminDashboard() {
  const [userName, setUserName] = useState("Admin");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isSuperOrAdmin, setIsSuperOrAdmin] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    const role = localStorage.getItem("user_role");
    const isAdmin = localStorage.getItem("user_isAdmin") === "true";
    if (name) setUserName(name.split(" ")[0]);
    try {
      const perms = JSON.parse(localStorage.getItem("user_permissions") || "[]");
      setPermissions(perms);
      setIsSuperOrAdmin(role === "Super Admin" || isAdmin || perms.includes("manage_team") || perms.includes("manage_all"));
    } catch {
      setIsSuperOrAdmin(role === "Super Admin" || isAdmin);
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dashboardLinks = [
    { title: "Products", count: stats?.products?.total || 0, icon: Package, href: "/admin/products", permission: "manage_products" },
    { title: "Services", count: stats?.services?.total || 0, icon: Briefcase, href: "/admin/services", permission: "manage_services" },
    { title: "Skills", count: stats?.skills?.total || 0, icon: GraduationCap, href: "/admin/skills", permission: "manage_skills" },
    { title: "Blog Posts", count: stats?.blogs?.total || 0, icon: BookOpen, href: "/admin/blogs", permission: "manage_blogs" },
    { title: "Reviews", count: stats?.reviews?.total || 0, icon: Quote, href: "/admin/reviews", permission: "manage_reviews" },
    { title: "Partners", count: stats?.partners?.total || 0, icon: Users, href: "/admin/partners", permission: "manage_partners" },
    { title: "Banners", count: stats?.banners?.total || 0, icon: ImageIcon, href: "/admin/banners", permission: "manage_banners" },
    { title: "SEO Settings", count: stats?.seo?.total || 0, icon: Search, href: "/admin/seo", permission: "manage_seo" },
  ].filter(link => isSuperOrAdmin || permissions.includes(link.permission));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Simple Header matching other admin pages */}
      <div>
        <h3 className="text-3xl font-bold tracking-tight">Welcome, {userName}</h3>
        <p className="text-sm text-muted-foreground mt-2">Select a section below to manage your website content.</p>
      </div>

      {/* Simple Grid matching admin card styles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6">
        {dashboardLinks.map((link, idx) => (
          <Link key={idx} href={link.href} className="bg-card rounded-2xl border border-border/50 p-6 flex flex-col items-center justify-center text-center hover:bg-muted/30 hover:border-primary/50 transition-colors shadow-sm">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
              <link.icon className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-bold text-foreground mb-1">{link.title}</h4>
            <p className="text-sm text-muted-foreground">{link.count} items</p>
          </Link>
        ))}
      </div>

    </div>
  );
}
