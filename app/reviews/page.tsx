"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Star, Quote, Plus, ArrowLeft, Search, X, Loader2, CheckCircle2, MessageSquareQuote, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReviewItem } from "@/lib/fallbackData";

export default function AllReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Form State for Add Review Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [stars, setStars] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/reviews", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load reviews: ${res.status}`);
        return (await res.json()) as ReviewItem[];
      })
      .then((data) => setReviews(data))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Failed to load reviews:", error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const resetForm = () => {
    setAuthor("");
    setRole("");
    setCompany("");
    setContent("");
    setStars(5);
    setSubmitSuccess(false);
    setIsModalOpen(false);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !role.trim() || !content.trim()) {
      alert("Please fill in your name, role, and review content.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: author.trim(),
          role: role.trim(),
          company: company.trim(),
          content: content.trim(),
          stars,
        }),
      });

      const data = await res.json();
      if (res.ok && data.review) {
        setReviews((prev) => [data.review, ...prev]);
        setSubmitSuccess(true);
        setTimeout(() => {
          resetForm();
        }, 1200);
      } else {
        alert(data.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.company && r.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = selectedRating === null || (r.stars || 5) === selectedRating;

    return matchesSearch && matchesRating;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-primary/20">
      <Navbar products={[]} services={[]} />

      <main className="flex-1 pt-28 sm:pt-36 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Top Back Link */}
        <div className="mb-6">
          <Link
            href="/#reviews"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client, company, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Star Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedRating(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                selectedRating === null
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All ({reviews.length})
            </button>
            {[5, 4, 3].map((starCount) => {
              const count = reviews.filter((r) => (r.stars || 5) === starCount).length;
              return (
                <button
                  key={starCount}
                  onClick={() => setSelectedRating(selectedRating === starCount ? null : starCount)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                    selectedRating === starCount
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {starCount} Stars ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Bar After Filter Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <p className="text-sm font-semibold text-slate-500">
            Showing <span className="text-slate-900 font-bold">{filteredReviews.length}</span> {filteredReviews.length === 1 ? 'Review' : 'Reviews'}
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-md hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Review
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredReviews.map((review, index) => (
                  <motion.div
                    key={review.id ?? `${review.author}-${index}`}
                    layout
                    initial={{ opacity: 0, y: 28, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.97 }}
                    viewport={{ once: true, amount: 0.2 }}
                    whileHover={{ y: -6, scale: 1.015 }}
                    transition={{
                      duration: 0.5,
                      delay: Math.min(index, 5) * 0.07,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-primary/30 hover:shadow-xl flex flex-col justify-between relative group"
                  >
                    <Quote className="absolute top-5 right-6 h-8 w-8 text-slate-100 group-hover:text-primary/10 transition-colors duration-300" />

                    <div>
                      {/* Stars */}
                      <div className="flex items-center gap-1 mb-4 text-yellow-400">
                        {[...Array(review.stars || 5)].map((_, idx) => (
                          <Star key={idx} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-xs font-semibold text-slate-500 ml-1.5">
                          {review.stars || 5}.0
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-sm text-slate-700 italic leading-relaxed mb-6">
                        &ldquo;{review.content}&rdquo;
                      </p>
                    </div>

                    {/* Author / Client */}
                    <div className="pt-4 border-t border-slate-100">
                      <div className="font-bold text-slate-900 text-base">{review.author}</div>
                      <div className="text-xs text-primary font-medium tracking-wide mt-0.5 uppercase">
                        {review.role}{review.company ? ` • ${review.company}` : ""}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredReviews.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <MessageSquareQuote className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No reviews found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchQuery || selectedRating !== null
                    ? "Try adjusting your search or star rating filter."
                    : "Be the first client to submit a testimonial!"}
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow hover:bg-primary/90"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Review
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Add Review Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <Sparkles className="h-5 w-5 text-primary" />
                Submit Your Review
              </h3>
              <button
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <CheckCircle2 className="h-14 w-14 text-emerald-500 animate-bounce" />
                <h4 className="text-lg font-bold text-slate-900">Review Submitted!</h4>
                <p className="text-sm text-slate-500">Thank you for sharing your experience with Hippo Cloud.</p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rachel Adams"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Role / Designation *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VP of Operations"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Global Tech Partners"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                {/* Rating Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setStars(starVal)}
                        className="p-1 focus:outline-none hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            starVal <= stars ? "fill-yellow-400 text-yellow-400" : "text-slate-200"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold ml-2 text-slate-800">{stars} of 5 Stars</span>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Review / Testimonial *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Share how Hippo Cloud helped your organization..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
