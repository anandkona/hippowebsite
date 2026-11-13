import { getBlogById, getActiveProducts, getActiveServices, getActiveTallyServices } from "@/lib/data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, Sparkles, Share2, BookOpen } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blog = await getBlogById(id);
  if (!blog) return { title: 'Not Found | HippoClouds' };

  return {
    title: blog.seo_title || `${blog.title} | HippoClouds Insights`,
    description: blog.seo_description || blog.excerpt || blog.title,
    keywords: blog.seo_keywords ? blog.seo_keywords.split(',').map((k: string) => k.trim()) : [],
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blog = await getBlogById(id);
  
  if (!blog) {
    notFound();
  }

  // Fetch navigation data
  const [products, services, activeTallyServices] = await Promise.all([
    getActiveProducts(),
    getActiveServices(),
    getActiveTallyServices()
  ]);

  const dateStr = blog.published_date 
    ? new Date(blog.published_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
    : "";
  const readTime = blog.read_time || "5 min read";

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground selection:bg-primary/20 selection:text-foreground">
      {/* Navbar with smooth scroll transition */}
      <Navbar products={products} services={services} tallyServices={activeTallyServices} />

      {/* Cinematic Hero Header for Single Article */}
      <section className="relative w-full overflow-hidden bg-foreground min-h-[60vh] sm:min-h-[65vh] flex items-center justify-center">
        {/* Cinematic Background Image with Dual Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src={blog.image_url || "/assets/hero-bg.jpg"}
            alt={blog.title}
            className="h-full w-full object-cover blur-[2px] scale-105 opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/95 to-foreground/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-transparent to-foreground/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-32 pb-16 sm:pt-36 sm:pb-20">
          <div className="space-y-6">
            <Link 
              href="/blogs" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium text-xs sm:text-sm bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-full backdrop-blur-sm transition-all border border-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to All Articles
            </Link>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/30 px-3.5 py-1 text-xs font-bold text-primary uppercase tracking-wider backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-primary" />
                {blog.category || "General"}
              </span>
              <div className="flex items-center gap-4 text-white/70 text-xs sm:text-sm font-medium">
                {dateStr && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {dateStr}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {readTime}
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              {blog.title}
            </h1>

            {blog.excerpt && (
              <p className="text-base sm:text-lg md:text-xl text-white/75 leading-relaxed font-light max-w-3xl">
                {blog.excerpt}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Article Body Section */}
      <main className="flex-1 py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {blog.image_url && (
            <div className="w-full aspect-[21/9] sm:aspect-[2/1] rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 mb-12 -mt-20 relative z-30 bg-slate-100">
              <img 
                src={blog.image_url} 
                alt={blog.title} 
                className="w-full h-full object-cover" 
              />
            </div>
          )}

          <article className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-primary prose-a:font-semibold hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-lg">
            <div 
              dangerouslySetInnerHTML={{ __html: blog.content || "" }} 
            />
          </article>

          {/* Bottom Call to Action */}
          <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link 
              href="/blogs"
              className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Browse More Technical Articles
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
            >
              <span>Consult Our Cloud Architects</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
