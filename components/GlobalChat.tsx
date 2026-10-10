"use client";

import { usePathname } from "next/navigation";
import FloatingChat from "./chatbot/FloatingChat";

export default function GlobalChat() {
  const pathname = usePathname() || '';

  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  return <FloatingChat />;
}
