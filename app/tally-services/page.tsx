export const dynamic = 'force-dynamic';
import { getActiveTallyPartners, getActiveProducts, getActiveServices, getActiveTallyServices } from '@/lib/data';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PartnerLogoCard from '@/components/PartnerLogoCard';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Award, Globe, Handshake, BarChart3, Layers } from 'lucide-react';

export default async function TallyServicesPage() {
  const [tallyPartners, products, services, activeTallyServices] = await Promise.all([
    getActiveTallyPartners(),
    getActiveProducts(),
    getActiveServices(),
    getActiveTallyServices()
  ]);
  
  // Fallback data if DB is empty
  const displayPartners = tallyPartners.length > 0 ? tallyPartners : [
    { id: 1, name: "Reliance Industries", website_url: "#" },
    { id: 2, name: "Tata Consultancy Services", website_url: "#" },
    { id: 3, name: "Infosys", website_url: "#" },
    { id: 4, name: "Wipro", website_url: "#" },
    { id: 5, name: "HCL Technologies", website_url: "#" }
  ];

  const defaultServices = [
    { title: "TallyPrime Implementation & Setup", desc: "End-to-end multi-branch deployment, ledger configuration, and workflow automation tailored for your industry." },
    { title: "Custom TDL Integration & APIs", desc: "Seamless bi-directional integration between Tally and your CRMs, ERPs, ecommerce portals, and payment gateways." },
    { title: "Statutory & GST Compliance", desc: "Automate e-invoicing, e-way bills, audit trails, and automated reconciliation with GSTN portals." },
    { title: "Cloud Hosting & Remote Access", desc: "Access your Tally license anywhere with military-grade encrypted cloud hosting, daily backups, and zero downtime." },
    { title: "Data Migration & Version Upgrades", desc: "Flawless zero-data-loss migration from legacy Tally versions or competitive ERP systems." },
    { title: "Priority Support & Corporate Training", desc: "Round-the-clock technical troubleshooting, corporate user training, and dedicated account managers." }
  ];

  const servicesList = activeTallyServices && activeTallyServices.length > 0 ? activeTallyServices : defaultServices;

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground selection:bg-primary/20 selection:text-foreground">
      {/* Navbar with smooth scroll transition */}
      <Navbar products={products} services={services} tallyServices={activeTallyServices} />
      
      {/* Cinematic Hero Section matching Careers, Blogs & Contact */}
      <section className="relative min-h-screen w-full overflow-hidden bg-foreground flex items-center justify-center">
        {/* Cinematic Background Image with Dual Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/hero-bg.jpg"
            alt="HippoClouds Tally Services"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-transparent to-foreground/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-32 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24">
          <div className="max-w-3xl space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-primary">
                Official Tally-Xcelerator Partner • Pan-India Support
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight sm:leading-tight lg:leading-[1.1] text-white tracking-tight">
              Enterprise Tally <br className="hidden sm:inline" />
              <span className="text-gradient">Solutions & Cloud Services.</span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base md:text-lg lg:text-xl text-white/75 leading-relaxed font-normal">
              Accelerate your accounting, GST compliance, custom TDL integrations, and cloud hosting with India's most certified enterprise Tally-Xcelerator experts.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
              <a
                href="#tally-services-grid"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-background px-8 py-4 text-xs sm:text-sm font-bold text-foreground transition-transform hover:scale-[1.02] shadow-lg cursor-pointer text-center"
              >
                <span>Explore All Services</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-primary" />
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-xs font-semibold text-white/90 hover:bg-white/10 transition-colors"
              >
                <span>Request Custom Demo</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Highlights Section */}
      <section className="bg-slate-900 border-b border-slate-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="p-3 rounded-lg bg-primary/20 text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Authorized Partner</h4>
                <p className="text-xs text-slate-400">Certified Tally-Xcelerator Implementation Partner</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="p-3 rounded-lg bg-primary/20 text-primary">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Certified Engineers</h4>
                <p className="text-xs text-slate-400">10+ Years delivering custom TDL integrations</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="p-3 rounded-lg bg-primary/20 text-primary">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Pan-India Reach</h4>
                <p className="text-xs text-slate-400">Multi-location enterprise deployments & SLA support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tally Services Grid */}
      <section id="tally-services-grid" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Comprehensive Capabilities
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Tailored Tally Services for Your Business
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mt-4">
              From out-of-the-box configuration to custom TDL software architecture and high-availability cloud hosting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesList.map((service: any, idx: number) => {
              const slug = service.slug || service.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              const linkUrl = service.slug ? `/tally-services/${service.slug}` : `/contact`;

              return (
                <div 
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 sm:p-8 flex flex-col hover:shadow-xl hover:border-primary/40 transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="rounded-xl bg-primary/10 p-3.5 text-primary w-fit mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 mb-3 group-hover:text-primary transition-colors">
                    {service.title || service.name}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                    {service.desc || service.description || "Enterprise deployment, configuration, custom workflows, and high-uptime support."}
                  </p>
                  
                  <Link 
                    href={linkUrl}
                    className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider group-hover:gap-3 transition-all pt-4 border-t border-slate-100 mt-auto"
                  >
                    <span>{service.slug ? "View Full Service" : "Learn More & Enquire"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Strategic Alliances / Clients */}
      {displayPartners.length > 0 && (
        <section className="py-20 bg-white border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Strategic Alliances
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mt-2 mb-12">
              Our Tally <span className="text-gradient">Clients & Partners</span>
            </h2>
            
            <div className="relative overflow-hidden w-full max-w-5xl mx-auto mt-6">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent"></div>
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent"></div>
              
              <div 
                className="flex w-max animate-[scroll_35s_linear_infinite] hover:[animation-play-state:paused]" 
              >
                <div className="flex gap-8 md:gap-12 pr-8 md:pr-12">
                  {displayPartners.map((partner: any) => (
                    <PartnerLogoCard key={partner.id} partner={partner} />
                  ))}
                </div>
                <div className="flex gap-8 md:gap-12 pr-8 md:pr-12">
                  {displayPartners.map((partner: any) => (
                    <PartnerLogoCard key={`dup-${partner.id}`} partner={partner} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
