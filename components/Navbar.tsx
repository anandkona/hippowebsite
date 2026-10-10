"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const FacebookIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const InstagramIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
);
const YoutubeIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>
);
const LinkedinIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
);

const socialLinks = [
  { icon: FacebookIcon, href: "https://www.facebook.com/profile.php?id=61559835637386", label: "Facebook" },
  { icon: InstagramIcon, href: "https://www.instagram.com/hippocloudtechnologies/?hl=en", label: "Instagram" },
  { icon: YoutubeIcon, href: "https://www.youtube.com/@hippocloudtechnologies", label: "Youtube" },
  { icon: LinkedinIcon, href: "https://www.linkedin.com/in/hippocloud/", label: "LinkedIn" },
];

const baseNavItems = [
  { label: "Home", href: "/#home" },
  { label: "Skill Hub", href: "/#academy" },
    { label: "Tally Services", href: "/tally-services" },
  { label: "Blogs", href: "/#blog" },
  { label: "Contact", href: "/contact" },
];

const Navbar = ({ products = [], services = [], tallyServices = [] }: { products?: any[], services?: any[], tallyServices?: any[] }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname() || '';
  const isHomePage = pathname === '/';
  
  // Slug pages also have dark hero sections and should start transparent
  const isTransparentTop = isHomePage || 
    (pathname.startsWith('/products/') && pathname.length > '/products/'.length) ||
    (pathname.startsWith('/services/') && pathname.length > '/services/'.length) ||
    (pathname.startsWith('/tally-services/') && pathname.length > '/tally-services/'.length) ||
    (pathname.startsWith('/admin/tally-services/') && pathname.length > '/admin/tally-services/'.length); // Add admin if needed, but maybe not. Let's stick to public pages.
    
  const isTransparent = isTransparentTop && !scrolled;

  const navItems: any[] = [
    baseNavItems[0], // Home
    {
      label: "Products",
      href: "/#products",
      children: products.length > 0
        ? products.map(p => ({ label: p.name, href: `/products/${p.product_id}` }))
        : [
          { label: "HIPPOCX", href: "/products/hippocx" },
          { label: "HIPPOAQUA", href: "/products/hippoaqua" },
          { label: "HIPPO BUILDX", href: "/products/hippobuildx" },
          { label: "HIPPO MINT", href: "/products/hippomint" },
        ]
    },
    {
      label: "Services",
      href: "/#services",
      children: services.length > 0
        ? services.map(s => ({ label: s.title, href: s.slug ? `/services/${s.slug}` : "/#services" }))
        : [
          { label: "Cloud Solutions", href: "/#services" },
          { label: "IT Services", href: "/#services" },
          { label: "Software Development", href: "/#services" },
          { label: "Digital Marketing", href: "/#services" },
          { label: "Product Development", href: "/#services" },
          { label: "Strategic Consultancy", href: "/#services" },
          { label: "BPO Services", href: "/#services" },
        ]
    },
    baseNavItems[1], // Skill Hub
      {
        label: "Tally Services",
        href: "/tally-services",
        children: tallyServices && tallyServices.length > 0
          ? tallyServices.map(ts => ({ label: ts.title || ts.name, href: `/tally-services/${ts.slug}` }))
          : undefined
      },
      ...baseNavItems.slice(3) // Blogs, Contact
  ];

  const email = "info@hippoclouds.com";
  const phone = "+91 93478 62547";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
      handleScroll();
      window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

      const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      if (pathname === '/') {
        const targetId = href.substring(2);
        const element = document.getElementById(targetId);
        if (element) {
          e.preventDefault();
          const navbarHeight = 72;
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;

          window.scrollTo({
            top: elementPosition - navbarHeight,
            behavior: 'smooth'
          });
        }
      } else {
        // If we are on another page, force a hard navigation to ensure it doesn't get stuck
        e.preventDefault();
        window.location.href = href;
      }
      setMobileOpen(false);
    } else {
      setMobileOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full" style={{ zIndex: 99999 }}>
      {/* Top Bar - Desktop Only */}
      {true && (
        <div className={`hidden lg:block transition-all duration-500 overflow-hidden ${scrolled ? 'max-h-0 opacity-0 -translate-y-full' : 'max-h-10 opacity-100'}`}>
          <div className={isTransparentTop ? "bg-transparent py-1" : "bg-gray-900 py-1"}>
            <div className="mx-auto max-w-7xl h-full flex items-center justify-between px-6 lg:px-8 xl:px-12">
              <div className="flex items-center gap-6">
                <a href={`mailto:${email}`} className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-white/60 hover:text-primary transition-colors">
                  <Mail className="h-3 w-3 text-primary" />
                  {email}
                </a>
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/60 hover:text-primary transition-colors">
                  <Phone className="h-3 w-3 text-primary" />
                  {phone}
                </a>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ y: -2, scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="h-6 w-6 flex items-center justify-center rounded-md bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white hover:shadow-[0_0_12px_rgba(255,66,33,0.4)] transition-all duration-300"
                    >
                      <social.icon className="h-3 w-3" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <nav className={`transition-all duration-500 h-16 lg:h-[72px] w-full relative z-[120] ${
        isTransparent ? 'bg-transparent'
          : 'bg-white shadow-md border-b border-gray-100'
      }`}>
        <div className="mx-auto max-w-7xl h-full flex items-center justify-between px-6 lg:px-8 xl:px-12">
          {/* Logo */}
          <Link href="/#home" onClick={(e) => handleAnchorClick(e, "/#home")} className="flex items-center gap-2 group">
            <img
              src={isTransparent ? "/Hippo_Logo_White.png" : "/Hippo_Logo_Black.png"}
              alt="Hippocloud Technologies"
              className="h-10 lg:h-12 object-contain transition-all duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  className={`flex items-center gap-1 px-2 xl:px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    isTransparent
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-gray-700 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-3 w-3" />}
                </Link>
                {item.children && openDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-2 min-w-[220px]">
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-2">
                      {item.children.map((child: any) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={(e) => handleAnchorClick(e, child.href)}
                          className="block px-4 py-3 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/contact"
              className={`hidden lg:block px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                isTransparent
                  ? 'bg-white text-gray-900 shadow-lg shadow-black/20 hover:shadow-black/40 hover:-translate-y-0.5'
                  : 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5'
              }`}
            >
              Get Started
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className={`lg:hidden relative z-[110] p-2 transition-colors touch-manipulation ${
                isTransparent ? 'text-white' : 'text-gray-800'
              }`}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu full screen drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/50 z-[140]"
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="lg:hidden fixed left-0 bottom-0 top-0 w-[80%] max-w-sm bg-background z-[150] overflow-y-auto flex flex-col shadow-2xl"
              >
                <div className="h-20 border-b border-border/50 flex items-center justify-between px-6 shadow-sm">
                  <Link href="/#home" onClick={(e) => handleAnchorClick(e, "/#home")} className="flex items-center gap-2 group">
                    <img
                      src="/Hippo_Logo_Black.png"
                      alt="Hippocloud Technologies"
                      className="h-10 object-contain"
                    />
                  </Link>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 -mr-2 text-foreground hover:text-primary transition-colors touch-manipulation"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="px-6 py-8 space-y-6 flex-1">
                  <div className="space-y-1">
                    {navItems.map((item) => (
                      <div key={item.label} className="border-b border-border/50 last:border-0">
                        <div className="flex items-center justify-between">
                          {item.children ? (
                            <button
                              onClick={() => setMobileDropdown(mobileDropdown === item.label ? null : item.label)}
                              className="flex items-center justify-between w-full py-4 text-base font-semibold text-foreground hover:text-primary"
                            >
                              {item.label}
                              <ChevronDown className={`h-5 w-5 text-foreground/60 transition-transform duration-300 ${mobileDropdown === item.label ? 'rotate-180' : ''}`} />
                            </button>
                          ) : (
                            <Link
                              href={item.href}
                              onClick={(e) => handleAnchorClick(e, item.href)}
                              className="flex items-center justify-between py-4 text-base font-semibold text-foreground hover:text-primary flex-1"
                            >
                              {item.label}
                            </Link>
                          )}
                        </div>
                        <AnimatePresence>
                          {item.children && mobileDropdown === item.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pb-4 space-y-1 mt-1">
                                {item.children.map((child: any) => (
                                  <Link
                                    key={child.label}
                                    href={child.href}
                                    onClick={(e) => handleAnchorClick(e, child.href)}
                                    className="block py-1.5 text-sm text-muted-foreground hover:text-primary"
                                  >
                                    {child.label}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 space-y-6 border-t border-border">
                    <div className="flex flex-col gap-4">
                      <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 text-primary" />
                        {phone}
                      </a>
                      <a href={`mailto:${email}`} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 text-primary" />
                        {email}
                      </a>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      {socialLinks.map((social) => (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noreferrer"
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-colors"
                        >
                          <social.icon className="h-5 w-5" />
                        </a>
                      ))}
                    </div>

                    <Link
                      href="/contact"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full text-center py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;












