"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";

type Blog = {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  image_url: string;
  published_date: string;
  read_time: string;
};

export default function BlogsSection({ blogs }: { blogs: Blog[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextPosts = () => {
    if (currentIndex + 3 < blogs.length) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevPosts = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const displayedPosts = blogs.slice(currentIndex, currentIndex + 3);

  return (
    <section id="blog" className="py-24 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Insights & Thought Leadership
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Insights</span>
            </h2>
          </motion.div>
          
          <Link href="#blog" className="hidden md:inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all text-sm">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative group/nav flex items-center gap-4">
          {/* Left Navigation Button */}
          <button
            onClick={prevPosts}
            disabled={currentIndex === 0}
            className="hidden md:flex items-center justify-center flex-shrink-0 rounded-full border border-border bg-background hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-background disabled:hover:text-foreground z-10 h-12 w-12"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {blogs.length === 0 ? (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">No insights published yet. Stay tuned!</p>
                  </div>
                ) : (
                  displayedPosts.map((post, i) => (
                    <motion.article
                      key={post.id}
                      layout
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="group cursor-pointer flex h-full"
                    >
                      <Link href={`#`} className="rounded-2xl overflow-hidden border border-border bg-background hover:shadow-xl hover:shadow-foreground/5 hover:border-primary/20 transition-all duration-500 flex flex-col w-full">
                        <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                          {post.image_url ? (
                            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:scale-110 transition-transform duration-700" />
                          )}
                          <span className="absolute top-4 left-4 rounded-full bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                            {post.category}
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
                                {new Date(post.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {post.read_time}
                              </span>
                            </div>
                            <span className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                              Read <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Navigation Button */}
          <button
            onClick={nextPosts}
            disabled={(currentIndex + 3 >= blogs.length)}
            className="hidden md:flex items-center justify-center flex-shrink-0 rounded-full border border-border bg-background hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-background disabled:hover:text-foreground z-10 h-12 w-12"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          {/* Mobile Navigation Buttons */}
          <div className="flex md:hidden items-center justify-center gap-4 mt-8 w-full">
            <button
              onClick={prevPosts}
              disabled={currentIndex === 0}
              className="flex items-center justify-center rounded-full border border-border h-10 w-10 disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextPosts}
              disabled={(currentIndex + 3 >= blogs.length)}
              className="flex items-center justify-center rounded-full border border-border h-10 w-10 disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
