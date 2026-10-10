import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import ProductsSection from "@/components/ProductsSection";
import AcademySection from "@/components/AcademySection";
import TallyServicesSection from "@/components/TallyServicesSection";
import PartnerLogoCard from "@/components/PartnerLogoCard";
import BlogSection from "@/components/BlogSection";
import ReviewsSection from "@/components/ReviewsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

import { getActiveBanners, getActivePartners, getSeoMetadata, getActiveProducts, getActiveServices, getActiveSkills, getActiveBlogs, getActiveReviews, getActiveTallyServices } from "@/lib/data";

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
  const reviews = await getActiveReviews();
  const activeTallyServices = await getActiveTallyServices();

  return (
    <div className="flex flex-col min-h-screen font-sans scroll-pt-20 lg:scroll-pt-24">
      <Navbar products={products} services={services} tallyServices={activeTallyServices} />
      <HeroSection banners={banners} />

      {/* Partner Logos Banner */}
      {partners && partners.length > 0 && (
        <section className="py-16 bg-muted/30 border-y border-border/50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 xl:px-12">
            <div className="text-center mb-10">
              <h3 className="text-sm font-bold text-blue-700 tracking-[0.2em] uppercase">
                Companies We Serve
              </h3>
            </div>
            <div className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-muted/30 to-transparent"></div>
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-muted/30 to-transparent"></div>
              
              <div 
                className="flex w-max animate-[scroll_35s_linear_infinite] hover:[animation-play-state:paused]" 
              >
                <div className="flex gap-8 md:gap-12 pr-8 md:pr-12">
                  {partners.map((partner) => (
                    <PartnerLogoCard key={partner.id} partner={partner as any} />
                  ))}
                </div>
                <div className="flex gap-8 md:gap-12 pr-8 md:pr-12">
                  {partners.map((partner) => (
                    <PartnerLogoCard key={`dup-${partner.id}`} partner={partner as any} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <AboutSection />
      <ProductsSection products={products} />
      <ServicesSection services={services} />
      <AcademySection skills={skills} />
      <TallyServicesSection tallyServices={activeTallyServices} />
      <BlogSection blogs={blogs} />
      <ReviewsSection reviews={reviews} />
      <ContactSection />

      {/* Floating Chat Widget */}
      

      <Footer />
    </div>
  );
}



