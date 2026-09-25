"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";

const defaultBlogs = [
  {
    category: "Technology",
    title: "Beyond the Database: The Shift to Agentic Architecture in Enterprise CRM",
    excerpt: "Explore the shift from static databases to headless, agentic architectures, and see how modern enterprise CRMs are replacing manual data-drudgery with autonomous workflows.",
    date: "May 20, 2026",
    readTime: "5 min read",
  },
  {
    category: "IoT Innovation",
    title: "Next-Gen Utilities: How IoT is Revolutionizing Smart Water Management",
    excerpt: "From real-time leak detection to predictive pipeline analytics, explore how IoT-driven smart water networks are tackling water scarcity and optimizing utility operations.",
    date: "May 20, 2026",
    readTime: "5 min read",
  },
  {
    category: "AI & Enterprise",
    title: "Driving the Future: A Practical Guide to Digital Transformation",
    excerpt: "Discover why true digital transformation is less about the technology and more about people, culture, and delivering continuous value to your customers.",
    date: "May 20, 2026",
    readTime: "5 min read",
  }
];

const BlogSection = ({ blogs }: { blogs?: any[] }) => {
  const displayBlogs = blogs && blogs.length > 0 ? blogs : defaultBlogs;

  return (
    <section id="blog" className="section-padding bg-muted/30 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="relative mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto px-4"
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Insights & Thought Leadership
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Latest <span className="text-gradient">Insights</span>
            </h2>
          </motion.div>
          
          <div className="mt-6 md:mt-0 md:absolute md:right-0 md:bottom-2 flex justify-center md:justify-end">
            <Link href="/blogs" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all text-sm group">
              View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="relative group/nav flex items-center gap-4">
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayBlogs.map((post, i) => {
                const dateStr = post.published_date ? new Date(post.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : post.date;
                const readTime = post.read_time || post.readTime || "5 min read";
                return (
                  <Link href={`/blogs/${post.id || ''}`} key={i}>
                    <motion.article
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="group cursor-pointer flex h-full"
                    >
                      <div className="rounded-2xl overflow-hidden border border-border bg-background hover:shadow-xl hover:shadow-foreground/5 hover:border-primary/20 transition-all duration-500 flex flex-col w-full">
                      <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                        {post.image_url && (
                          <img src={post.image_url} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:scale-110 transition-transform duration-700" />
                        <span className="absolute top-4 left-4 rounded-full bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                          {post.category || "General"}
                        </span>
                      </div>
                      <div className="p-7 space-y-4 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 min-h-[3.5rem]">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 flex-1">
                            {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex items-center gap-3 text-muted-foreground text-xs">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {dateStr}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {readTime}
                            </span>
                          </div>
                          <span className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                      </div>
                    </motion.article>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
