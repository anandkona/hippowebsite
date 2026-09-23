"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import BlurIn from "./BlurIn";
import SplitText from "./SplitText";

type BannerProps = {
  id?: number;
  title?: string;
  subtitle?: string;
  image_url?: string;
};

const HeroSection = ({ banners }: { banners?: BannerProps[] | null }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate banners
  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const activeBanner = banners && banners.length > 0 ? banners[currentIndex] : null;

  const bgImage = activeBanner?.image_url || "/assets/hero-bg.jpg";
  const titleText = activeBanner?.title || "Empowering Global Business.";
  const subtitleText = activeBanner?.subtitle || "From AI-driven CRM to enterprise consultancy, we deliver technology solutions that scale across industries and borders.";

  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden bg-foreground">
      {/* Background Image with overlay */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={bgImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          <img src={bgImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-transparent to-foreground/50" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-20 flex min-h-screen flex-col justify-center">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 xl:px-12 pt-24 pb-12">
          <div className="max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={titleText}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col gap-8"
              >
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    AI-Powered Enterprise Solutions
                  </span>
                </div>

                <h1 className="text-4xl font-bold leading-tight text-background md:text-5xl lg:text-6xl xl:text-7xl lg:leading-[1.1]">
                  <SplitText staggerDelay={0.06} duration={0.6} renderWord={(word) =>
                    word === "Business." ? <span className="text-gradient font-serif italic">{word}</span> : word
                  }>
                    {titleText}
                  </SplitText>
                </h1>

                <p className="max-w-xl text-lg leading-relaxed text-background/70 md:text-xl">
                  {subtitleText}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/contact"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-background px-8 py-4 text-sm font-bold text-foreground transition-transform hover:scale-[1.02]"
                  >
                    Schedule a Consultation
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <a
                    href="#products"
                    className="group inline-flex items-center gap-2 rounded-full border border-background/20 px-8 py-4 text-sm font-semibold text-background transition-all hover:bg-background/10"
                  >
                    <Play className="h-4 w-4" />
                    Watch Overview
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel Indicators */}
        {banners && banners.length > 1 && (
          <div className="absolute bottom-12 left-0 right-0 z-30 flex justify-center gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-primary/30 hover:bg-primary/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Stats Bar */}
        <BlurIn delay={0.8} duration={0.6}>
          <div className="border-t border-background/10 bg-background/5 backdrop-blur-md">
          </div>
        </BlurIn>
      </div>
    </section>
  );
};

export default HeroSection;
