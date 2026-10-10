"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToHash() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if there is a hash in the URL on mount or path change
    if (typeof window !== "undefined" && window.location.hash) {
      // Small delay to allow the page and framer-motion to render/layout
      setTimeout(() => {
        const id = window.location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          const navbarHeight = 72; // Account for navbar manually
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementPosition - navbarHeight,
            behavior: "smooth"
          });
        }
      }, 500);
    }
  }, [pathname]); // Run every time the pathname changes

  return null;
}
