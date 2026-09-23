"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const AdminLogin = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("user_role", data.role);
        localStorage.setItem("user_permissions", JSON.stringify(data.permissions));
        localStorage.setItem("user_name", data.username);
        if (data.email) localStorage.setItem("user_email", data.email);
        localStorage.setItem("user_isAdmin", data.isAdmin.toString());

        router.push("/admin/dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 z-0">
        <img src="/assets/hero-bg.jpg" alt="Background" className="w-full h-full object-cover opacity-40 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-primary/20 backdrop-blur-sm" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="mb-4">
        </div>

        <div className="rounded-2xl border border-white/10 bg-background/60 backdrop-blur-2xl shadow-lg overflow-hidden p-1">
          <div className="rounded-xl bg-background/40 p-6 md:p-8">
            <div className="flex flex-col items-center mb-6">
              <div className="h-16 w-48 flex items-center justify-center mb-2">
                <img src="/Hippo_Logo_Black.png" alt="Hippo Logo" className="w-full h-auto object-contain" />
              </div>
              <p className="text-foreground/60 text-sm font-medium">Log in to access your dashboard</p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="space-y-5">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 text-sm font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {error}
                  </motion.div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground/80 px-1">Username or Email</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Enter your credentials"
                      className="flex h-12 w-full rounded-xl border border-border/50 bg-background/50 px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-background transition-all pl-12 shadow-sm"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground/80 px-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40 group-focus-within:text-primary transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="flex h-12 w-full rounded-xl border border-border/50 bg-background/50 px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-background transition-all pl-12 pr-12 shadow-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground focus:outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end pt-1">
                    <a href="#" className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                <button 
                  type="submit" 
                  className="w-full flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold h-12 transition-all hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 active:scale-95 disabled:pointer-events-none disabled:opacity-70" 
                  disabled={isLoading}
                >
                  <span className="flex items-center">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Authenticating...
                      </>
                    ) : (
                      "Sign In Securely"
                    )}
                  </span>
                </button>
                <div className="flex justify-center pt-2">
                  <Link 
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-foreground/60 hover:text-foreground hover:underline transition-colors"
                  >
                    <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Website
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        <p className="text-center text-sm text-foreground/40 mt-8">
          © {new Date().getFullYear()} Hippocloud Technologies. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
