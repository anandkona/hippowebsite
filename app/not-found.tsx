import { getActiveProducts, getActiveServices } from "@/lib/data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default async function NotFound() {
  const products = await getActiveProducts();
  const services = await getActiveServices();

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      <Navbar products={products} services={services} />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-32 pb-24 relative overflow-hidden">
        {/* Background Decorative Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />

        <div className="relative">
          <h1 className="text-[120px] sm:text-[180px] font-extrabold text-slate-100 tracking-tighter leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-background/50 backdrop-blur-sm p-4 rounded-full">
              <AlertCircle className="h-16 w-16 sm:h-24 sm:w-24 text-primary animate-pulse" />
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-8 mb-4 tracking-tight">
          Oops! Page Not Found
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link 
          href="/" 
          className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          Return to Home
        </Link>
      </main>

      <Footer />
    </div>
  );
}
