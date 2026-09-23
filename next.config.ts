import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allows the Next.js dev server to accept requests from this local IP
  allowedDevOrigins: ["192.168.1.145"],
};

export default nextConfig;
