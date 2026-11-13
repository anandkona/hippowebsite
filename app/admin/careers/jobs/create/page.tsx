"use client";

import PermissionGate from "@/components/admin/PermissionGate";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateJobRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/careers/jobs");
  }, [router]);

  return (
    <PermissionGate permission="manage_careers">
    <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
      Redirecting to Manage Jobs...
    </div>
      </PermissionGate>
  );
}
