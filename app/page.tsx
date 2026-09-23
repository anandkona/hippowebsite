import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import ProductsSection from "@/components/ProductsSection";
import AcademySection from "@/components/AcademySection";
import PartnersSection from "@/components/PartnersSection";
import PartnerLogoCard from "@/components/PartnerLogoCard";
import BlogSection from "@/components/BlogSection";
import ReviewsSection from "@/components/ReviewsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import FloatingChat from "@/components/chatbot/FloatingChat";
import { getActiveBanners, getActivePartners, getSeoMetadata, getActiveProducts, getActiveServices, getActiveSkills, getActiveBlogs } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata('/');
  if (!seo) return {};

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
  };
}

export default async function Home() {
  const banners = await getActiveBanners();
  const partners = await getActivePartners();
  const products = await getActiveProducts();
  const services = await getActiveServices();
  const skills = await getActiveSkills();
  const blogs = await getActiveBlogs();

  return (
    <div className="flex flex-col min-h-screen font-sans scroll-pt-20 lg:scroll-pt-24">
      <Navbar products={products} services={services} />
      <HeroSection banners={banners} />

      {/* Partner Logos Banner */}
      {partners && partners.length > 0 && (
        <div className="relative z-20 bg-slate-50/50 py-12 w-full border-b border-border">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <h3 className="text-center text-sm font-bold text-blue-700 tracking-[0.2em] mb-10 uppercase">
              Companies We Serve
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {partners.map((partner) => (
                <PartnerLogoCard key={partner.id} partner={partner as any} />
              ))}
            </div>
          </div>
        </div>
      )}

      <AboutSection />
      <ProductsSection products={products} />
      <ServicesSection services={services} />
      <AcademySection skills={skills} />
      <PartnersSection partners={partners} />
      <BlogSection blogs={blogs} />
      <ReviewsSection />
      <ContactSection />

      {/* Floating Chat Widget */}
      <FloatingChat />

      <Footer />
    </div>
  );
}
