"use client";

import { useState } from "react";
import BannersCMS from "../banners/page";
import SEOCMS from "../seo/page";
import { ImageIcon, Search } from "lucide-react";

export default function AdminHomePage() {
  const [activeTab, setActiveTab] = useState<"banners" | "seo">("banners");

  const tabs = [
    { id: "banners", label: "Hero Banners", icon: ImageIcon },
    { id: "seo", label: "SEO Settings", icon: Search },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border/50 flex justify-between items-end overflow-x-auto custom-scrollbar w-full">
        <nav className="-mb-px flex space-x-6 sm:space-x-8 px-1 min-w-max" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }
                `}
              >
                <tab.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div id="tab-actions" className="mb-2" />
      </div>

      <div className="mt-6">
        {activeTab === "banners" && <BannersCMS />}
        {activeTab === "seo" && <SEOCMS />}
      </div>
    </div>
  );
}

