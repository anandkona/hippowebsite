"use client";

import { motion } from "framer-motion";
import { Handshake, CheckCircle2, Shield, Award, Globe } from "lucide-react";

const partnerFeatures = [
  { icon: Shield, text: "Authorized Tally-Xcelerator Partner" },
  { icon: Award, text: "Certified Implementation Experts" },
  { icon: Globe, text: "Pan-India Service Network" },
];

const trustedBy = [
  "Microsoft", "AWS", "Google Cloud", "Tally Solutions", "Salesforce", "Oracle",
];

type PartnerProps = {
  id: number;
  name: string;
  logo_url: string;
  website_url?: string;
};

const PartnersSection = ({ partners }: { partners?: PartnerProps[] }) => (
  <section id="partners" className="section-padding bg-background">
    <div className="mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
          Strategic Partnerships
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3">
          Trusted by Industry <span className="text-gradient">Leaders</span>
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mb-8">
          Technology Partners & Alliances
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-14">
          {(partners && partners.length > 0) ? partners.map((p) => (
            <a key={p.id} href={p.website_url || '#'} target="_blank" rel="noreferrer" className="text-lg md:text-xl font-bold text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">
              {p.name}
            </a>
          )) : trustedBy.map((name) => (
            <span key={name} className="text-lg md:text-xl font-bold text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">
              {name}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default PartnersSection;
