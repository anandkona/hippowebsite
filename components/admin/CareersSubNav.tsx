"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  GitFork,
  Calendar,
  FileCheck,
  Gift,
  CheckSquare,
  Plus
} from "lucide-react";

export default function CareersSubNav({ onOpenNewJob }: { onOpenNewJob?: () => void }) {
  const pathname = usePathname() || "";

  const subItems = [
    { label: "Overview", href: "/admin/careers", icon: LayoutDashboard },
    { label: "Manage Jobs", href: "/admin/careers/jobs", icon: Briefcase },
    { label: "Received Applications", href: "/admin/careers/applications", icon: FileCheck },
  ];

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-2 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {subItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/careers" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
