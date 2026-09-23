"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Globe, Smartphone, Download } from "lucide-react";
import Link from "next/link";

type ProductHeroProps = {
  productName: string;
  productTagline: string;
  productLogoUrl?: string;
  productImageUrl: string;
  heroTitles?: string[];
  heroSubtitles?: string[];
  heroImages?: string[];
  heroSections?: { title: string; subtitle: string; imageUrl: string }[];
  isWebsite?: boolean;
  websiteLink?: string;
  isApp?: boolean;
  iosLink?: string;
  androidLink?: string;
};

export default function ProductHero({
  productName,
  productTagline,
  productLogoUrl,
  productImageUrl,
  heroTitles = [],
  heroSubtitles = [],
  heroImages = [],
  heroSections = [],
  isWebsite = false,
  websiteLink = "",
  isApp = false,
  iosLink = "",
  androidLink = "",
}: ProductHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out any empty strings that might have been saved in the CMS
  const validTitles = heroTitles.filter((t: string) => t && t.trim().length > 0);
  const validSubtitles = heroSubtitles.filter((s: string) => s && s.trim().length > 0);
  const validImages = heroImages.filter((i: string) => i && i.trim().length > 0);

  // Use fallback values if the arrays are empty
  let titles = validTitles.length > 0 ? validTitles : [productName];
  let subtitles = validSubtitles.length > 0 ? validSubtitles : [productTagline];
  let images = validImages.length > 0 ? validImages : [productImageUrl];

  if (heroSections && heroSections.length > 0) {
    titles = heroSections.map(s => s.title || productName);
    subtitles = heroSections.map(s => s.subtitle || productTagline);
    images = heroSections.map(s => s.imageUrl || productImageUrl);
  }

  // We rotate based on the maximum length of the arrays
  const maxItems = Math.max(titles.length, subtitles.length, images.length);

  useEffect(() => {
    if (maxItems <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % maxItems);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [maxItems]);

  const currentTitle = titles[Math.min(currentIndex, titles.length - 1)];
  const currentSubtitle = subtitles[Math.min(currentIndex, subtitles.length - 1)];
  const currentImage = images[Math.min(currentIndex, images.length - 1)];

  const formatExternalUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  const formattedWebsiteLink = formatExternalUrl(websiteLink);
  const formattedIosLink = formatExternalUrl(iosLink);
  const formattedAndroidLink = formatExternalUrl(androidLink);

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen w-full overflow-hidden flex items-center justify-center text-center">
      <AnimatePresence mode="wait">
        {currentImage && (
          <motion.div
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${currentImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
      </AnimatePresence>

      {/* Simple Dark Overlay for readability (no dark blue) */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 lg:px-8 pt-32 pb-24">
        <div className="flex flex-col items-center gap-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold tracking-widest uppercase text-white shadow-lg">
            {productName} {productTagline && `/ ${productTagline}`}
          </div>
          
          <div className="flex flex-col">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentTitle}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15] whitespace-pre-line drop-shadow-lg"
              >
                {currentTitle}
              </motion.h1>
            </AnimatePresence>
          </div>

          <div>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentSubtitle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-lg md:text-xl text-slate-200 leading-relaxed max-w-3xl mx-auto whitespace-pre-line drop-shadow-md"
              >
                {currentSubtitle}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
            {isWebsite && websiteLink && (
              <a href={formattedWebsiteLink} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 w-full sm:w-auto text-sm">
                Ready to Start Journey <ArrowRight className="h-4 w-4" />
              </a>
            )}
            
            {isApp && iosLink && (
              <a href={formattedIosLink} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white text-slate-900 hover:bg-gray-100 rounded-full font-bold transition-all shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2 w-full sm:w-auto text-sm">
                <Download className="h-4 w-4" /> Download for iOS
              </a>
            )}

            {isApp && androidLink && (
              <a href={formattedAndroidLink} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 w-full sm:w-auto text-sm border border-emerald-500/20">
                <Smartphone className="h-4 w-4" /> Get it on Android
              </a>
            )}

            {/* Fallback button if no specific links */}
            {!isWebsite && !isApp && (
              <a href="#demo" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 w-full sm:w-auto text-sm">
                Ready to Start Journey <ArrowRight className="h-4 w-4" />
              </a>
            )}
            
            <Link href="/contact" className="px-8 py-4 bg-transparent hover:bg-white/10 text-white border border-white/30 rounded-full font-bold transition-all backdrop-blur-sm flex items-center justify-center w-full sm:w-auto text-sm">
              Explore Expert
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
