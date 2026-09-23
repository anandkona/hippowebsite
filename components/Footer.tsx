"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";


const FacebookIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const InstagramIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const YoutubeIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
);
const LinkedinIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const socialLinks = [
  { Icon: FacebookIcon, href: "https://www.facebook.com/profile.php?id=61559835637386", label: "Facebook" },
  { Icon: InstagramIcon, href: "https://www.instagram.com/hippocloudtechnologies/?hl=en", label: "Instagram" },
  { Icon: YoutubeIcon, href: "https://www.youtube.com/@hippocloudtechnologies", label: "Youtube" },
  { Icon: LinkedinIcon, href: "https://www.linkedin.com/in/hippocloud/", label: "LinkedIn" },
];

const addresses = [
  { label: "Head Office", address: "2nd floor, CBM Compound, Asilmetta, Visakhapatnam, Andhra Pradesh 530003" },
  { label: "Hyderabad Office", address: "#505, 5th Floor, Annapurna Block, Aditya Enclave, Ameerpet, Hyderabad - 500016" },
  { label: "Madhurawada Branch", address: "122, D, No 3-73/2B, H. I. G, near S F S school, Madhilapuri Vuda Colony, Madhurawada, Visakhapatnam, Andhra Pradesh 530041" },
];

const products = [
  { label: "HIPPOCX", href: "https://www.hippoclouds.com/#hippocx" },
  { label: "HIPPOAQUA", href: "https://www.hippoclouds.com/#hippoaqua" },
  { label: "HIPPO BUILDX", href: "https://www.hippoclouds.com/#hippobuildx" },
];

const services = [
  { label: "Cloud Solutions", href: "https://www.hippoclouds.com/services/cloud-solutions" },
  { label: "IT Services", href: "https://www.hippoclouds.com/services/it-services" },
  { label: "Software Development", href: "https://www.hippoclouds.com/services/software-development" },
  { label: "Digital Marketing", href: "https://www.hippoclouds.com/services/digital-marketing" },
  { label: "Skill Academy", href: "https://www.hippoclouds.com/#academy" },
  { label: "BPO Services", href: "https://www.hippoclouds.com/#services" },
];

const legal = [
  { label: "Privacy Policy", href: "https://www.hippoclouds.com/#" },
  { label: "Terms of Service", href: "https://www.hippoclouds.com/#" },
  { label: "Careers", href: "https://www.hippoclouds.com/#" },
];

const Footer = () => {
  const phone = "+91 93478 62547";
  const email = "info@hippoclouds.com";

  return (
    <footer className="bg-foreground text-background w-full selection:bg-primary selection:text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0 mb-16">
          <div className="flex flex-col items-center text-center md:items-start md:text-left lg:col-span-4 space-y-6">
            <a href="#home" className="flex items-center gap-2 group block focus:outline-none">
              <img
                src="/Hippo_Logo_White.png"
                alt="Hippocloud Technologies"
                className="h-12 md:h-14 object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </a>
            <p className="text-background/60 text-sm leading-relaxed max-w-md">
              A global enterprise technology company delivering AI-powered products, consultancy, and digital transformation solutions.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {socialLinks.map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -4, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:shadow-[0_0_20px_rgba(255,66,33,0.4)] transition-all duration-300 group"
                >
                  <Icon className="h-4 w-4 group-hover:text-white transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center text-center md:items-start md:text-left lg:col-span-2 lg:pl-4">
            <h4 className="font-semibold text-white text-xs uppercase tracking-widest mb-6">Products</h4>
            <ul className="space-y-4 text-sm text-background/60">
              {products.map((item) => (
                <li key={item.label}><a href={item.href} className="hover:text-primary transition-colors focus:text-primary focus:outline-none">{item.label}</a></li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center text-center md:items-start md:text-left lg:col-span-2">
            <h4 className="font-semibold text-white text-xs uppercase tracking-widest mb-6">Services</h4>
            <ul className="space-y-4 text-sm text-background/60">
              {services.map((item) => (
                <li key={item.label}><a href={item.href} className="hover:text-primary transition-colors focus:text-primary focus:outline-none">{item.label}</a></li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center text-center md:items-start md:text-left lg:col-span-4">
            <h4 className="font-semibold text-white text-xs uppercase tracking-widest mb-6">Our Presence</h4>
            <div className="space-y-6 w-full max-w-md md:max-w-none">
              {addresses.map((item) => (
                <div key={item.label || item.address} className="space-y-2 group">
                  <h5 className="text-primary text-xs font-bold uppercase tracking-wider flex items-center justify-center md:justify-start gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 opacity-80" />
                    {item.label}
                  </h5>
                  <p className="text-sm text-background/60 leading-relaxed pl-0 md:pl-5 group-hover:text-background/80 transition-colors">
                    {item.address}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-background/10 mb-10">
          <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-y-4 gap-x-8 lg:gap-x-12">
            <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center gap-3 text-sm text-background/60 hover:text-primary transition-colors group focus:outline-none focus:text-primary">
              <div className="h-8 w-8 rounded-lg bg-background/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Phone className="h-3.5 w-3.5 text-background/60 group-hover:text-primary transition-colors" />
              </div>
              {phone}
            </a>
            <a href={`mailto:${email}`} className="flex items-center gap-3 text-sm text-background/60 hover:text-primary transition-colors group focus:outline-none focus:text-primary">
              <div className="h-8 w-8 rounded-lg bg-background/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Mail className="h-3.5 w-3.5 text-background/60 group-hover:text-primary transition-colors" />
              </div>
              {email}
            </a>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-y-4 text-center md:text-left">
          <p className="text-xs text-background/40 order-2 md:order-1">
            © {new Date().getFullYear()} Hippocloud Technologies Pvt Ltd. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-background/40 order-1 md:order-2">
            {legal.map((item) => (
              <a key={item.label} href={item.href} className="hover:text-white transition-colors focus:text-white focus:outline-none">{item.label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
