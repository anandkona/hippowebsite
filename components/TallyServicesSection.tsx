"use client";

import { motion } from "framer-motion";
import { Handshake, CheckCircle2, Shield, Award, Globe } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const fallbackServices = [
  { title: "Tally Implementation" },
  { title: "Custom Integration" },
  { title: "GST Compliance" },
  { title: "Training & Support" }
];

export default function TallyServicesSection({ tallyServices }: { tallyServices?: any[] }) {
  const displayServices = tallyServices && tallyServices.length > 0 ? tallyServices : fallbackServices;
  const pathname = usePathname();
  const isTallyPage = pathname === "/tally-services";

  return (
    <section id="tally-services" className={`bg-background border-y border-border/50 ${isTallyPage ? "pt-24 pb-16 lg:pt-32" : "section-padding"}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Text & Bullets */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full text-left space-y-6"
          >
            <div>
              <div className="inline-flex items-center justify-center rounded-xl bg-blue-50 p-3 mb-6">
                <Handshake className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-slate-900 leading-tight tracking-tight">
                Tally-Xcelerator Partner
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mt-4">
                As an official Tally-Xcelerator partner, we deliver enterprise-grade Tally implementations, custom integrations, and ongoing support. Streamline your accounting, inventory, GST compliance, and business operations with India's most trusted business software.
              </p>
            </div>

            <div className="flex flex-col gap-4 mt-8">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-slate-700 font-medium">Authorized Tally-Xcelerator Partner</span>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-slate-700 font-medium">Certified Implementation Experts</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-slate-700 font-medium">Pan-India Service Network</span>
              </div>
            </div>
            
            {!isTallyPage && (
              <div className="pt-4">
                <Link href="/tally-services" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors">
                  Explore All Tally Services
                </Link>
              </div>
            )}
          </motion.div>

          {/* Right Column: Cards */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {displayServices.map((service, idx) => (
                <div 
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col items-center justify-center text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer hover:border-blue-300"
                >
                  <div className="rounded-full bg-blue-50/50 p-2 text-blue-500 mb-4 group-hover:bg-blue-100 transition-colors duration-300">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[15px] sm:text-base text-slate-900 leading-tight">
                    {service.title || service.name}
                  </h3>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
