"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";



const fallbackProducts = [
  {
    id: "hippocx",
    name: "HIPPOCX",
    tagline: "AI-Powered CRM & Digital Integration Platform",
    description: "An intelligent enterprise CRM that leverages AI to automate customer interactions, deliver predictive analytics, and integrate seamlessly across your digital ecosystem.",
    image: "/assets/product-crm.jpg",
    imageMode: "contain",
    logo: "/assets/HCX.png",
    features: ["AI-Driven Lead Scoring", "Omnichannel Integration", "Predictive Analytics", "Smart Workflow Automation", "Real-time Dashboards", "Enterprise API"],
  },
  {
    id: "hippoaqua",
    name: "HIPPOAQUA",
    tagline: "Intelligent Water Management System",
    description: "Advanced IoT-enabled water management platform for utilities and enterprises. Real-time monitoring, quality analytics, distribution optimization, and regulatory compliance.",
    image: "/assets/product-aqua.jpg",
    features: ["IoT Sensor Network", "Quality Monitoring", "Distribution Optimization", "Compliance Automation", "Leak Detection AI", "Usage Analytics"],
  },
  {
    id: "hippobuildx",
    name: "HIPPO BUILDX",
    tagline: "Smart Construction & Project Management",
    description: "Digital construction management platform that streamlines planning, execution, and monitoring. From blueprint to handover, manage every phase with precision.",
    image: "/assets/product-buildx.jpg",
    features: ["BIM Integration", "Resource Planning", "Progress Tracking", "Team Collaboration", "Cost Management", "Safety Compliance"],
  },
];

const ProductsSection = ({ products = [] }: { products?: any[] }) => {
  const displayProducts = products.length > 0 ? products : fallbackProducts;

  return (
    <section id="products" className="section-padding bg-background">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block rounded-full bg-secondary/10 px-4 py-1.5 text-secondary text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Product Suite
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3">
            Enterprise Products Built for Scale
          </h2>
          <p className="text-muted-foreground text-lg mt-5 max-w-2xl mx-auto leading-relaxed">
            Industry-leading software products powering enterprises across CRM, water management, and construction.
          </p>
        </motion.div>

        <div className="space-y-12 lg:space-y-32">
          {displayProducts.map((product, i) => {
            const isContainedImage = product.imageMode === "contain" || product.image_mode === "contain";
            const currentId = product.product_id || product.id;
            const currentImage = product.image_url || product.image;
            const currentLogo = product.logo_url || product.logo;
            const features = product.features || [];
            
            // Check if product should redirect to external website
            const pageContent = product.page_content || {};
            let productLink = `/products/${currentId}`;
            let linkTarget = "_self";
            
            if (pageContent.isWebsite && pageContent.websiteLink) {
              productLink = pageContent.websiteLink;
              if (!productLink.startsWith('http://') && !productLink.startsWith('https://')) {
                productLink = `https://${productLink}`;
              }
              linkTarget = "_blank";
            }

            return (
              <motion.div
                key={currentId}
                id={currentId}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className={`flex flex-col ${i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} gap-12 lg:gap-20 items-center`}
              >
                {/* Image */}
                <div className={`flex-1 w-full ${currentId === 'hippoaqua' ? 'lg:scale-110' : ''}`}>
                  <Link href={productLink} target={linkTarget} className="block">
                    <div
                      className={`relative rounded-3xl overflow-hidden transition-transform duration-500 hover:scale-[1.02] cursor-pointer aspect-video lg:aspect-[4/3] ${isContainedImage ? "border border-border/60 bg-gradient-to-br from-muted via-background to-accent/40 p-4 md:p-6" : ""
                        } ${product.id === 'hippoaqua' ? 'shadow-2xl shadow-primary/10' : ''}`}
                    >
                      <img
                        src={currentImage}
                        alt={product.name}
                        className={`w-full h-full ${isContainedImage ? "object-contain" : "object-cover"}`}
                      />
                      <div className="absolute bottom-6 left-6 flex items-center gap-2">
                        <span className="rounded-full bg-background/90 backdrop-blur-sm px-5 py-2 text-sm font-bold text-foreground shadow-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {product.name}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6">
                  <span className="block text-primary text-xs font-bold uppercase tracking-[0.2em] mb-2">
                    {product.tagline}
                  </span>
                  <div className="flex items-center gap-3">
                    {currentLogo ? (
                      <img
                        src={currentLogo}
                        alt={`${product.name} logo`}
                        className="h-10 w-auto object-contain"
                      />
                    ) : (
                      <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                        {product.name}
                      </h3>
                    )}
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {features.map((f: string) => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground/80">{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <Link
                      href={productLink}
                      target={linkTarget}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] transition-all"
                    >
                      {pageContent.isWebsite && pageContent.websiteLink ? `Get ${product.name}` : "Explore Product"} <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-6 py-3 text-sm font-semibold text-secondary hover:bg-secondary/20 transition-all"
                    >
                      Request Demo
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
