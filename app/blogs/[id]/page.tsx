import { getBlogById, getActiveProducts, getActiveServices } from "@/lib/data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blog = await getBlogById(id);
  if (!blog) return { title: 'Not Found | Hippocloud' };

  return {
    title: blog.seo_title || `${blog.title} | Hippocloud Blogs`,
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
  const products = await getActiveProducts();
  const services = await getActiveServices();

  const dateStr = blog.published_date 
    ? new Date(blog.published_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
    : "";
  const readTime = blog.read_time || "5 min read";

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Navbar products={products} services={services} />

      <main className="flex-1 pt-32 pb-24 max-w-4xl mx-auto px-6 lg:px-8 w-full">
        <Link href="/blogs" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors mb-10 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to all insights
        </Link>

        <article className="prose prose-slate prose-lg max-w-none">
          <header className="mb-12 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-blue-600 text-xs font-bold uppercase tracking-wider">
                {blog.category || "General"}
              </span>
              <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {dateStr}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {readTime}
                </span>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              {blog.title}
            </h1>
            
            {blog.excerpt && (
              <p className="text-xl text-slate-500 leading-relaxed font-light mb-8">
                {blog.excerpt}
              </p>
            )}

            {blog.image_url && (
              <div className="w-full aspect-[2/1] rounded-2xl overflow-hidden shadow-lg mt-10">
                <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover" />
              </div>
            )}
          </header>

          <div 
            className="mt-12 text-slate-700 leading-loose prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-headings:text-slate-900 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: blog.content || "" }} 
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}
