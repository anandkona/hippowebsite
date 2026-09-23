"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    author: "Rohan Mehta",
    role: "Director, Global Pharma Solutions",
    content: "Hippo Cloud Technologies transformed our legacy systems into a modern, cloud-native architecture. Their expertise in DevOps is unmatched in the Indian tech landscape.",
    stars: 5
  },
  {
    author: "Ananya Iyer",
    role: "Founder, RetailFlow India",
    content: "The custom software development team at Hippocloud is world-class. They built our e-commerce platform with a focus on Indian consumer behavior and scalability.",
    stars: 5
  },
  {
    author: "Sanjay Vidya",
    role: "Head of IT, Bharat Logistics",
    content: "Managed IT services from Hippocloud have given us complete peace of mind. Their proactive monitoring and localized support are exactly what our enterprise needed.",
    stars: 5
  }
];

const ReviewsSection = () => {
  return (
    <section className="py-20 bg-foreground text-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-background mb-4">Client Success <span className="text-gradient">Stories</span></h2>
          <p className="text-background/50 text-sm max-w-2xl mx-auto">
            Trusted by industry leaders to deliver exceptional digital transformation and enterprise solutions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={review.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-background/10 bg-background/5 relative group hover:border-primary/30 transition-all duration-300"
            >
              <Quote className="absolute top-4 right-6 h-8 w-8 text-primary/10 transition-colors" />
              <div className="flex gap-1 mb-4">
                {[...Array(review.stars)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm mb-6 italic text-background/80 leading-relaxed">"{review.content}"</p>
              <div>
                <div className="font-bold text-background text-base">{review.author}</div>
                <div className="text-[10px] text-primary font-medium tracking-wide mt-0.5 uppercase">{review.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
