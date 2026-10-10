export const dynamic = 'force-dynamic';
import { getActiveTallyPartners, getActiveProducts, getActiveServices, getActiveTallyServices } from '@/lib/data';
import Link from 'next/link';
import TallyServicesSection from '@/components/TallyServicesSection';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PartnerLogoCard from '@/components/PartnerLogoCard';

export default async function TallyServicesPage() {
  const tallyPartners = await getActiveTallyPartners();
  
  // Fallback data if DB is empty
  const displayPartners = tallyPartners.length > 0 ? tallyPartners : [
    { id: 1, name: "Reliance Industries", website_url: "#" },
    { id: 2, name: "Tata Consultancy Services", website_url: "#" },
    { id: 3, name: "Infosys", website_url: "#" },
    { id: 4, name: "Wipro", website_url: "#" },
    { id: 5, name: "HCL Technologies", website_url: "#" }
  ];
  const products = await getActiveProducts();
  const services = await getActiveServices();
  const activeTallyServices = await getActiveTallyServices();

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Navbar products={products} services={services} tallyServices={activeTallyServices} />
      
      <div className="flex-1 pt-16">
        <TallyServicesSection tallyServices={activeTallyServices} />
        
        {displayPartners.length > 0 && (
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center mt-20 mb-24">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Strategic Alliances
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-16">
              Our Tally <span className="text-gradient">Clients & Partners</span>
            </h2>
            
            <div className="relative overflow-hidden w-full max-w-5xl mx-auto mt-10">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent"></div>
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent"></div>
              
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
        )}
      </div>

      <Footer />
    </div>
  );
}


// Trigger Next.js recompile

