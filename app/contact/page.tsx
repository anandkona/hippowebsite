import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { getActiveProducts, getActiveServices, getSeoMetadata , getActiveTallyServices } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata('/contact');
  if (!seo) return {};
  
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
  };
}

export default async function ContactPage() {
  const products = await getActiveProducts();
  const services = await getActiveServices();
  const activeTallyServices = await getActiveTallyServices();

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white selection:bg-blue-500/30">
      <Navbar products={products} services={services} tallyServices={activeTallyServices} />
      
      {/* Spacer for fixed navbar */}
      <div className="pt-32" />

      <main className="flex-grow">
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
