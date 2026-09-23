import { getActiveBlogs, getSeoMetadata } from "@/lib/data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const seo = await getSeoMetadata('/blogs');
  if (!seo) return {};
  
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
  };
}

export default async function BlogsPage() {
  const blogs = await getActiveBlogs();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Navbar products={[]} services={[]} />

      <main className="flex-1 pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Our Latest Insights</h1>
          <p className="text-lg text-slate-500">Discover thought leadership, tutorials, and news about cloud technologies and enterprise transformation.</p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            No blog posts available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post) => {
              const dateStr = post.published_date 
                ? new Date(post.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                : "";
              const readTime = post.read_time || "5 min read";
              
              return (
                <Link href={`/blogs/${post.id}`} key={post.id}>
                  <article className="group cursor-pointer flex h-full flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                    <div className="aspect-video relative overflow-hidden bg-slate-100">
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50" />
                      )}
                      <span className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-blue-600 uppercase tracking-wider shadow-sm">
                        {post.category || "General"}
                      </span>
                    </div>
                    <div className="p-7 space-y-4 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                        <div className="flex items-center gap-4 text-slate-500 text-xs font-medium">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {dateStr}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {readTime}
                          </span>
                        </div>
                        <span className="text-blue-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
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
      </main>

      <Footer />
    </div>
  );
}
