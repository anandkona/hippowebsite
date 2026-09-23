"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { AlertOctagon, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      {/* We pass an empty array to Navbar because we can't fetch products in a Client Error Component easily */}
      <Navbar products={[]} />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-32 pb-24 relative overflow-hidden">
        {/* Background Decorative Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px] -z-10" />

        <div className="bg-red-50 p-6 rounded-full mb-8">
          <AlertOctagon className="h-16 w-16 text-red-500" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
          Oops! Something went wrong
        </h2>

        <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
          An unexpected error occurred while loading this page. Our team has been notified and we are working to fix it.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 px-8 py-4 text-sm font-semibold transition-all w-full sm:w-auto"
          >
            <RefreshCcw className="h-4 w-4" /> Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] transition-all w-full sm:w-auto"
          >
            Return to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
