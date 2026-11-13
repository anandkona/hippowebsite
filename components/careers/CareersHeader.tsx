"use client";

import Link from "next/link";
import { Sparkles, Phone, Mail } from "lucide-react";

export default function CareersHeader() {
  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white/90 text-xs">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 xl:px-12 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/careers"
            className="flex items-center gap-1.5 font-bold text-white hover:text-primary transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Careers at HippoClouds</span>
          </Link>
          <span className="hidden md:inline-block text-white/20">|</span>
          <a
            href="#openings"
            className="hidden md:inline-block text-white/60 hover:text-white transition-colors"
          >
            Active Openings
          </a>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-white/70">
          <a
            href="#openings"
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-semibold px-3 py-1 rounded-md transition-colors shadow-sm"
          >
            <Sparkles className="w-3 h-3" />
            <span>Browse Jobs & Apply</span>
          </a>
        </div>
      </div>
    </div>
  );
}
