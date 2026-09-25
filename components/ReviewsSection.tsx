"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Plus, ArrowRight, X, Loader2, CheckCircle2, MessageSquareQuote } from "lucide-react";
import Link from "next/link";
import { ReviewItem, FALLBACK_REVIEWS } from "@/lib/fallbackData";

interface ReviewsSectionProps {
  reviews?: ReviewItem[];
}

const ReviewsSection = ({ reviews = [] }: ReviewsSectionProps) => {
  const initialReviews = reviews && reviews.length > 0 ? reviews : FALLBACK_REVIEWS;
  const [reviewList, setReviewList] = useState<any[]>(initialReviews);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [author, setAuthor] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [stars, setStars] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (reviews && reviews.length > 0) {
      setReviewList(reviews);
    }
  }, [reviews]);

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
        setReviewList((prev) => [data.review, ...prev]);
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

  // Fixed exactly to 6 review boxes on the homepage
  const visibleReviews = reviewList.slice(0, 6);
  const hasMoreThanSix = reviewList.length > 6;

  return (
    <section id="reviews" className="py-20 bg-foreground text-background overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="relative mb-12 sm:mb-16">
          <div className="text-center max-w-2xl lg:max-w-3xl mx-auto px-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
              <MessageSquareQuote className="h-3.5 w-3.5" /> Client Testimonials
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-background tracking-tight">
              Client Success <span className="text-gradient">Stories</span>
            </h2>
            <p className="text-background/60 text-sm sm:text-base lg:text-lg max-w-xl lg:max-w-2xl mx-auto mt-3 sm:mt-4 leading-relaxed">
              Trusted by global enterprise leaders to accelerate cloud transformation and mission-critical workflows.
            </p>
          </div>

          {/* Add Review Button - Moves to right end on iPad/Laptop/Desktop, centered on Mobile */}
          <div className="mt-6 md:mt-0 md:absolute md:right-0 md:bottom-1 flex justify-center md:justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4" /> Add Review
            </button>
          </div>
        </div>

        {/* 6 Fixed Review Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleReviews.map((review, i) => (
            <motion.div
              key={review.id || `${review.author}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl border border-background/10 bg-background/5 relative group hover:border-primary/40 transition-all duration-300 flex flex-col justify-between"
            >
              <Quote className="absolute top-4 right-6 h-8 w-8 text-primary/10 transition-colors group-hover:text-primary/20" />

              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.stars || 5)].map((_, starIdx) => (
                    <Star key={starIdx} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-background/50 font-semibold ml-1.5">
                    {review.stars || 5}.0
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-sm mb-6 italic text-background/85 leading-relaxed line-clamp-4">
                  "{review.content}"
                </p>
              </div>

              {/* Author Details */}
              <div className="pt-4 border-t border-background/10">
                <div className="font-bold text-background text-base">{review.author}</div>
                <div className="text-xs text-primary font-medium tracking-wide mt-0.5 uppercase">
                  {review.role}{review.company ? ` • ${review.company}` : ""}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Down "See More" Button if more than 6 reviews */}
        {hasMoreThanSix && (
          <div className="mt-14 text-center">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-3 rounded-full border border-background/20 bg-background/10 px-8 py-3.5 text-sm font-bold text-background hover:bg-background/20 hover:border-primary/50 transition-all shadow-xl hover:scale-105 active:scale-95 group"
            >
              See More ({reviewList.length - 6} more reviews)
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>

      {/* Add Review Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card text-foreground w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-border/50">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MessageSquareQuote className="h-5 w-5 text-primary" />
                Add Review
              </h3>
              <button
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <CheckCircle2 className="h-14 w-14 text-emerald-500 animate-bounce" />
                <h4 className="text-lg font-bold text-foreground">Review Submitted!</h4>
                <p className="text-sm text-muted-foreground">Thank you for sharing your experience with Hippo Cloud.</p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">
                      Role / Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VP of Technology"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Enterprise"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                {/* Rating Selector */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5">
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
                            starVal <= stars ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold ml-2 text-foreground">{stars} of 5 Stars</span>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5">
                    Your Review / Testimonial *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Share how Hippo Cloud helped your team or business..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
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
    </section>
  );
};

export default ReviewsSection;
