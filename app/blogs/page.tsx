import { getActiveBlogs, getSeoMetadata, getActiveProducts, getActiveServices, getActiveTallyServices } from "@/lib/data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Sparkles, BookOpen, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const seo = await getSeoMetadata('/blogs');
  if (!seo) return {
    title: 'Blogs & Engineering Insights | HippoClouds',
    description: 'Discover in-depth analysis, architectural guides, and updates on enterprise cloud platforms, generative AI, and digital transformation.',
  };
  
  return {
    title: seo.title || 'Blogs & Engineering Insights | HippoClouds',
    description: seo.description || 'Discover in-depth analysis, architectural guides, and updates on enterprise cloud platforms, generative AI, and digital transformation.',
    keywords: seo.keywords,
  };
}

export default async function BlogsPage() {
  const [blogs, products, services, tallyServices] = await Promise.all([
    getActiveBlogs(),
    getActiveProducts(),
    getActiveServices(),
    getActiveTallyServices()
  ]);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground selection:bg-primary/20 selection:text-foreground">
      {/* Navbar with automatic scroll transparency transition */}
      <Navbar products={products} services={services} tallyServices={tallyServices} />

      {/* Cinematic Hero Section matching Careers, Contact & Homepage */}
      <section className="relative min-h-screen w-full overflow-hidden bg-foreground flex items-center justify-center">
        {/* Cinematic Background Image with Dual Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/hero-bg.jpg"
            alt="HippoClouds Blogs and Insights"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-transparent to-foreground/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-32 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24">
          <div className="max-w-3xl space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-primary">
                HippoClouds Insights • Cloud, AI & Engineering
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight sm:leading-tight lg:leading-[1.1] text-white tracking-tight">
              Thought Leadership & <br className="hidden sm:inline" />
              <span className="text-gradient">Engineering Insights.</span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base md:text-lg lg:text-xl text-white/75 leading-relaxed font-normal">
              Explore in-depth technical analysis, cloud architectural guides, and engineering updates on scalable enterprise platforms and artificial intelligence.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
              <a
                href="#articles"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-background px-8 py-4 text-xs sm:text-sm font-bold text-foreground transition-transform hover:scale-[1.02] shadow-lg cursor-pointer text-center"
              >
                <span>Browse All Articles</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-primary" />
              </a>

              <div className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-xs font-semibold text-white/90">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>{blogs.length} Published Articles</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Blog Posts Grid Section */}
      <main id="articles" className="flex-1 py-16 sm:py-20 lg:py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-slate-200/80 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
                <BookOpen className="w-4 h-4" />
                <span>Recent Publications</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Latest Articles & Tech Guides
              </h2>
            </div>
            <p className="text-sm text-slate-500 max-w-md">
              Handcrafted by our engineering squads, solution architects, and product strategists.
            </p>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-slate-200/60 shadow-sm max-w-xl mx-auto p-8">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">No Articles Available Yet</h3>
              <p className="text-sm text-slate-500 mb-6">
                We are actively writing new engineering breakdowns and architecture guides. Please check back soon!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Back to Homepage
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((post) => {
                const dateStr = post.published_date 
                  ? new Date(post.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                  : "";
                const readTime = post.read_time || "5 min read";
                
                return (
                  <Link href={`/blogs/${post.id}`} key={post.id} className="group">
                    <article className="flex h-full flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/70 hover:border-primary/40 group-hover:-translate-y-1">
                      <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                        {post.image_url ? (
                          <img 
                            src={post.image_url} 
                            alt={post.title} 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-slate-100 to-primary/5 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-primary/40" />
                          </div>
                        )}
                        <span className="absolute top-4 left-4 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-primary uppercase tracking-wider shadow-sm border border-slate-100">
                          {post.category || "General"}
                        </span>
                      </div>

                      <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-auto">
                          <div className="flex items-center gap-3.5 text-slate-500 text-xs font-medium">
                            {dateStr && (
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                {dateStr}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {readTime}
                            </span>
                          </div>
                          <span className="text-primary text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
