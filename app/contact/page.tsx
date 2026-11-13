"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { Sparkles, ArrowRight, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground selection:bg-primary/20 selection:text-foreground">
      {/* Navbar with smooth scroll transition */}
      <Navbar />

      {/* Full-Screen Cinematic Hero Section matching Careers Page */}
      <section className="relative min-h-screen w-full overflow-hidden bg-foreground flex items-center justify-center">
        {/* Cinematic Background Image with Dual Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/hero-bg.jpg"
            alt="HippoClouds Contact"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-transparent to-foreground/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-32 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24">
          <div className="max-w-3xl space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-primary">
                Let's Build Together • Enterprise Consultation
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight sm:leading-tight lg:leading-[1.1] text-white tracking-tight"
            >
              Get in Touch with <br className="hidden sm:inline" />
              <span className="text-gradient">Our Technology Experts.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="max-w-xl text-sm sm:text-base md:text-lg lg:text-xl text-white/75 leading-relaxed font-normal"
            >
              Whether you are planning a cloud migration, building an AI-powered SaaS product, or seeking enterprise technical consultancy, our team is ready to assist.
            </motion.p>

            {/* Quick Action Buttons matching Careers & Home Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2"
            >
              <a
                href="#contact"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-background px-8 py-4 text-xs sm:text-sm font-bold text-foreground transition-transform hover:scale-[1.02] shadow-lg cursor-pointer text-center"
              >
                <span>Send Consultation Request</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-primary" />
              </a>

              <a
                href="tel:+919347862547"
                className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-xs font-semibold text-white/90 hover:bg-white/10 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-primary" />
                <span>+91 93478 62547</span>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <main className="flex-grow">
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
