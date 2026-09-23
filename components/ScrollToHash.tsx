"use client";

import { useEffect } from "react";

export default function ScrollToHash() {
  useEffect(() => {
    // Check if there is a hash in the URL on mount
    if (typeof window !== "undefined" && window.location.hash) {
      // Small delay to allow the page and framer-motion to render/layout
      setTimeout(() => {
        const id = window.location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    }
  }, []);

  return null;
}
