"use client";

import { motion } from "framer-motion";
import { ArrowRight, Activity } from "lucide-react";
import * as Icons from "lucide-react";
import Link from "next/link";

type Service = {
  id?: number;
  title: string;
  description: string;
  highlight: string;
  icon_name: string;
  slug?: string;
};

const ServicesSection = ({ services = [] }: { services?: Service[] }) => {
  if (!services || services.length === 0) return null;

  return (
  <section id="services" className="section-padding bg-foreground">
    <div className="mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
          Our Capabilities
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-background mt-3">
          Enterprise Solutions That Drive Growth
        </h2>
        <p className="text-background/60 text-lg mt-5 max-w-2xl mx-auto leading-relaxed">
          Comprehensive technology services designed for enterprises that demand excellence, scalability, and innovation.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, i) => {
          const Icon = (Icons as any)[service.icon_name] || Activity;
          return (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative rounded-2xl border border-background/10 bg-background/5 p-8 backdrop-blur-sm hover:bg-background/10 hover:border-white transition-all duration-500"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-[#ff4221] group-hover:scale-110 transition-all duration-300">
                <Icon className="h-7 w-7 text-primary group-hover:text-white" />
              </div>
              <span className="text-xs font-bold text-primary/80 uppercase tracking-widest">{service.highlight}</span>
              <h3 className="text-xl font-bold text-background mt-2 mb-3">{service.title}</h3>
              <p className="text-background/50 leading-relaxed text-[15px]">{service.description}</p>
              
              {service.slug ? (
                <Link href={`/services/${service.slug}`} className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold mt-5 group-hover:gap-2.5 transition-all">
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <a href="/contact" className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold mt-5 group-hover:gap-2.5 transition-all">
                  Discuss Solution <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
  );
};

export default ServicesSection;
