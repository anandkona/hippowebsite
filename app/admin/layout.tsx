"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Image as ImageIcon, Users, Search, LogOut, Loader2, ArrowLeft, Home, BookOpen, Package, Shield, MessageSquare } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Skip check for login page itself
    if (pathname === '/admin/login') {
      setIsChecking(false);
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
    } else {
      setUserName(localStorage.getItem("user_name") || "Admin");
      setUserRole(localStorage.getItem("user_role") || "viewer");
      try {
        const perms = JSON.parse(localStorage.getItem("user_permissions") || "[]");
        setUserPermissions(perms);
      } catch (e) {
        setUserPermissions([]);
      }
      setIsChecking(false);
    }
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If login page, don't show the dashboard shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_permissions");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_isAdmin");
      router.push("/admin/login");
    }
  };

  const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard, permission: "none" },
    { name: "Home Settings", href: "/admin/home", icon: Home, permission: "manage_banners" },
    { name: "Partners", href: "/admin/partners", icon: Users, permission: "manage_partners" },
    { name: "Skill Hub", href: "/admin/skills", icon: BookOpen, permission: "manage_skills" },
    { name: "Blogs", href: "/admin/blogs", icon: BookOpen, permission: "manage_blogs" },
    { name: "Products", href: "/admin/products", icon: Package, permission: "manage_products" },
    { name: "Services", href: "/admin/services", icon: BookOpen, permission: "manage_services" },
    { name: "Live Chat", href: "/admin/chat", icon: MessageSquare, permission: "none" },
    { name: "Team", href: "/admin/users", icon: Users, permission: "manage_team" },
    { name: "Roles", href: "/admin/roles", icon: Shield, permission: "manage_team" },
  ];

  return (
    <div className="h-screen bg-muted/20 flex overflow-hidden">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/50 flex flex-col flex-shrink-0 overflow-y-auto transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-border/50 flex justify-center items-center relative">
          <img src="/Hippo_Logo_Black.png" alt="Logo" className="h-10 w-auto object-contain" />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 pb-2 pt-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Admin Panel
            </p>
          </div>
          {navItems.filter(item => item.permission === "none" || (Array.isArray(userPermissions) && userPermissions.includes(item.permission))).map((item) => {
            const isActive = pathname === item.href || (item.href === "/admin/home" && ["/admin/banners", "/admin/seo", "/admin/home"].includes(pathname || ""));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50 space-y-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {/* Top Navbar */}
        <div className="sticky top-0 z-10 bg-card border-b border-border/50 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-2 md:hidden hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
            </button>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Site
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {userName?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block">
              {userName}
            </span>
          </div>
        </div>
        <div className="p-4 sm:p-6 md:p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
