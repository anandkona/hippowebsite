"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export const PAGE_PERMISSIONS: Record<string, string> = {
  "/admin/blogs": "manage_blogs",
  "/admin/blogs/create": "manage_blogs",
  "/admin/skills": "manage_skills",
  "/admin/partners": "manage_partners",
  "/admin/products": "manage_products",
  "/admin/services": "manage_services",
  "/admin/seo": "manage_seo",
  "/admin/banners": "manage_banners",
  "/admin/users": "manage_team",
  "/admin/roles": "manage_team",
};

export function usePermission(requiredPermission: string | null) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!requiredPermission) {
      setAllowed(true);
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const perms = JSON.parse(localStorage.getItem("user_permissions") || "[]");
      if (perms.includes(requiredPermission) || perms.includes("manage_all")) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }
    } catch {
      router.push("/admin/login");
    }
  }, [requiredPermission, router]);

  return allowed;
}

export default function PermissionGate({
  permission,
  children,
}: {
  permission: string | null;
  children: React.ReactNode;
}) {
  const allowed = usePermission(permission);

  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground max-w-md">
            You don&apos;t have permission to access this page. Contact your administrator to request access.
          </p>
          <button
            onClick={() => window.location.href = "/admin/dashboard"}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
