import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug, getActiveProducts, getActiveServices , getActiveTallyServices } from "@/lib/data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, ChevronDown, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";
import { FadeInUp } from "@/components/MotionWrapper";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const pc = product.page_content || {};
  const productName = product.title || product.name;
  const title = pc.seoTitle || pc.heroTitle || `${productName} | Hippocloud Products`;
  const description = pc.seoDescription || pc.heroSubtitle || product.description || `Discover ${productName} by Hippocloud.`;

  return {
    title,
    description,
    keywords: pc.seoKeywords || `${productName}, cloud product, SaaS, Hippocloud`,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.hippoclouds.com/products/${slug}`,
      images: [
        {
          url: pc.heroBackgroundImage || 'https://www.hippoclouds.com/default-og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${productName} at Hippocloud`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [pc.heroBackgroundImage || 'https://www.hippoclouds.com/default-og-image.jpg'],
    },
    alternates: {
      canonical: `https://www.hippoclouds.com/products/${slug}`,
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const products = await getActiveProducts();
  const services = await getActiveServices();
  const activeTallyServices = await getActiveTallyServices();

  if (!product) {
    notFound();
  }

  const pc = product.page_content || {};

  // Parse sections
  const heroTitle = pc.heroTitle || "Cloud Solutions Built for Secure, Scalable Growth";
  const heroSubtitle = pc.heroSubtitle || product.description;
  const heroTag = pc.heroTag || product.name?.toUpperCase() + " / TRANSFORMING ENTERPRISES";
  const stats = pc.stats || [];
  const detailedFeatures = pc.detailedFeatures || [];
  const steps = pc.steps || [];
  const faqs = pc.faqs || [];

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white selection:bg-blue-500/30">
      <Navbar products={products} services={services} tallyServices={activeTallyServices} />

      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 overflow-hidden flex items-center justify-center min-h-[70vh]">

        {/* Full Background Image */}
        <div className="absolute inset-0 z-0">
          {(product.image_url || pc.heroBackgroundImage) ? (
            <img
              src={product.image_url || pc.heroBackgroundImage}
              alt={product.title || product.name || "Hero Image"}
              className="w-full h-full object-cover"
            />
          ) : (
            <img src="/assets/hero-bg.jpg" alt="Fallback Hero" className="w-full h-full object-cover" />
          )}
          {/* Simple dark overlay so text is readable, no dark blue solid colors */}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
          <FadeInUp className="space-y-6 lg:space-y-7 flex flex-col items-center">
            <div className="inline-block px-4 py-1.5 mb-2 lg:mb-6 text-[10px] font-bold tracking-[0.2em] text-slate-300 uppercase bg-white/10 rounded-full border border-white/20 backdrop-blur-md shadow-lg">
              {heroTag}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 lg:mb-6 leading-[1.15] lg:leading-[1.1] tracking-tight text-white drop-shadow-lg">
              {heroTitle}
            </h1>
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed mb-6 lg:mb-10 font-light max-w-3xl mx-auto drop-shadow-md">
              {heroSubtitle}
            </p>
            <div className="mt-6 lg:mt-9 flex flex-col sm:flex-row gap-4 justify-center pt-2 w-full sm:w-auto">
                {pc.isWebsite && pc.websiteLink && (
                  <Link href={pc.websiteLink.startsWith("http") ? pc.websiteLink : "https://" + pc.websiteLink} target="_blank" className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-black/30 transition-all hover:bg-blue-500 hover:scale-105 w-full sm:w-auto">
                    Visit Website <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                {pc.isApp && (
                  <>
                    {pc.iosLink && (
                      <Link href={pc.iosLink.startsWith("http") ? pc.iosLink : "https://" + pc.iosLink} target="_blank" className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-8 py-4 text-sm font-bold text-white shadow-xl shadow-black/30 transition-all hover:scale-105 w-full sm:w-auto">
                        Get on App Store
                      </Link>
                    )}
                    {pc.androidLink && (
                      <Link href={pc.androidLink.startsWith("http") ? pc.androidLink : "https://" + pc.androidLink} target="_blank" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3DDC84] px-8 py-4 text-sm font-bold text-black shadow-xl shadow-black/30 transition-all hover:scale-105 w-full sm:w-auto">
                        Get on Google Play
                      </Link>
                    )}
                  </>
                )}
                {(!pc.isWebsite && !pc.isApp) && (
                  <Link href={pc.heroPrimaryCtaLink || "/contact"} className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-black/30 transition-all hover:bg-blue-500 hover:scale-105 w-full sm:w-auto">
                    {pc.heroPrimaryCtaText || "Ready to Start Journey"} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                <Link href={pc.heroSecondaryCtaLink || "#capabilities"} className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 backdrop-blur-sm px-8 py-4 text-sm font-bold text-white transition-all hover:bg-white/20 w-full sm:w-auto">
                  {pc.heroSecondaryCtaText || "Explore Expert"}
                </Link>
              </div>
          </FadeInUp>
        </div>
      </section>

      {/* Stats Grid */}
      {stats.length > 0 && (
        <section className="bg-white border-b border-slate-100 py-8 sm:py-12 relative z-30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeInUp>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-center justify-between">
                {stats.map((stat: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center justify-center text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest">{stat.label}</div>
                    {stat.subtitle && <div className="text-[10px] text-slate-400 mt-1">{stat.subtitle}</div>}
                  </div>
                ))}
              </div>
            </FadeInUp>
          </div>
        </section>
      )}

      {/* 2. CAPABILITIES SECTION */}
      {detailedFeatures.length > 0 && (
        <section id="capabilities" className="py-16 sm:py-24 bg-white relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeInUp className="mb-10 sm:mb-14 text-center md:text-left">
              <div className="text-blue-600 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">{pc.coreCapabilitiesTag || "CORE CAPABILITIES / KEY FEATURES"}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4 max-w-2xl mx-auto md:mx-0 leading-tight tracking-tight">
                {pc.coreCapabilitiesTitle || "Everything needed to launch and operate cloud with confidence."}
              </h2>
              {pc.coreCapabilitiesSubtitle && <p className="text-slate-500 text-sm max-w-3xl mx-auto md:mx-0 leading-relaxed">{pc.coreCapabilitiesSubtitle}</p>}
            </FadeInUp>

            <FadeInUp>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {detailedFeatures.map((feat: any, idx: number) => (
                  <div key={idx} className="group rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl">
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 transition-colors group-hover:bg-blue-500 overflow-hidden">
                        {feat.imageUrl ? (
                          <img src={feat.imageUrl} alt="icon" className="w-full h-full object-cover" />
                        ) : (
                          <Rocket className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500 transition-colors group-hover:text-white" />
                        )}
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{feat.title}</h3>
                        <p className="mt-2 sm:mt-3 leading-relaxed text-slate-500 text-sm sm:text-base">{feat.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeInUp>
          </div>
        </section>
      )}

      {/* 3. APPROACH / CLOUD JOURNEY SECTION */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeInUp>
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20">
              {/* Left Column - Title & Subtitle */}
              <div>
                <div className="text-blue-600 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">{pc.pathTag || "CLOUD OPERATING MODEL"}</div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                  {pc.pathTitle || "A practical path from legacy systems to cloud maturity."}
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {pc.pathSubtitle || "Our framework ensures a smooth transition, reducing risks and accelerating time-to-value for enterprise cloud adoption."}
                </p>
              </div>

              {/* Right Column - Checkmarks */}
              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-4 items-start content-start">
                {(pc.pathItems && pc.pathItems.length > 0 ? pc.pathItems : [
                  "Enterprise benefits",
                  "Operational benefits",
                  "Clear cost controls and resource governance",
                  "Security-first implementation with audit-friendly controls",
                  "Operational dashboards for proactive decisions",
                  "A practical roadmap for modernization and automation"
                ]).map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm shadow-slate-100/50 h-full">
                    <div className="h-5 w-5 shrink-0 rounded-full flex items-center justify-center text-blue-500 mt-0.5">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* 4. PROCESS STEPS SECTION */}
      {steps.length > 0 && (
        <section className="py-16 sm:py-24 bg-white border-t border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeInUp className="mb-10 sm:mb-16 text-center md:text-left">
              <div className="text-blue-600 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">{pc.stepsTag || "PROCESS / WORKFLOW"}</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4 max-w-xl mx-auto md:mx-0 leading-tight tracking-tight">
                {pc.stepsTitle || "Clear steps from assessment to optimization."}
              </h2>
            </FadeInUp>

            <FadeInUp>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {steps.map((step: any, idx: number) => (
                  <div key={idx} className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm hover:border-blue-300 transition-colors relative flex flex-col text-center sm:text-left">
                    <div className="text-blue-500 font-bold text-sm mb-3 sm:mb-4">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed flex-1">{step.description}</p>
                  </div>
                ))}
              </div>
            </FadeInUp>
          </div>
        </section>
      )}

      {/* 5. FAQS SECTION (DARK) */}
      {faqs.length > 0 && (
        <section className="py-24 bg-[#11131A] text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20">
              {/* Left Column */}
              <div>
                <div className="text-blue-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">{pc.faqsTag || "QUESTIONS"}</div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight leading-tight">{pc.faqsTitle || "Cloud decisions made clearer."}</h2>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                {faqs.map((faq: any, idx: number) => (
                  <details key={idx} className="bg-[#1A1D24] rounded-xl border border-slate-800 group [&_summary::-webkit-details-marker]:hidden [&_summary]:list-none cursor-pointer hover:border-slate-700 transition-colors overflow-hidden">
                    <summary className="flex items-center justify-between font-bold text-[14px] p-6 outline-none">
                      <span className="pr-8 text-slate-200">{faq.question}</span>
                      <span className="shrink-0 text-slate-500 group-open:rotate-180 transition-transform">
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-slate-400 leading-relaxed text-sm border-t border-slate-800/50 pt-5">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. FINAL CTA SECTION (LIGHT) */}
      <section id="contact" className="py-24 bg-white text-center border-t border-slate-100 scroll-mt-28">
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            {pc.finalCtaTitle || "Ready to build a better cloud foundation?"}
          </h2>
          {pc.finalCtaDescription && <p className="text-sm text-slate-500 max-w-xl mx-auto">{pc.finalCtaDescription}</p>}
          <div className="pt-4">
            <Link href={pc.finalCtaLink || "/contact"} className="inline-flex items-center justify-center px-8 py-3 bg-[#0A6BFF] text-white rounded-full text-sm font-bold transition-all hover:bg-blue-700 shadow-lg shadow-blue-600/20">
              {pc.finalCtaButtonText || "Contact Us"} <span className="ml-2 font-normal">→</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


