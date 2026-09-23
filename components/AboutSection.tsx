"use client";

import { motion } from "framer-motion";

const AboutSection = () => {
  const paragraphs = [
    "Hippo Cloud Technologies is a premier technology partner specializing in scalable cloud solutions and custom software development. We empower businesses to navigate the complexities of digital transformation with our expertise in DevOps, full-stack development, and AI-driven enterprise solutions.",
    "Our journey began with a mission to bridge the gap between complex business challenges and cutting-edge technology. Today, we help global brands reach their full potential through our comprehensive suite of IT services and strategic consultancy.",
  ];
  
  const stats = [
    { value: "10+", label: "Years Experience" },
    { value: "500+", label: "Projects Done" },
    { value: "200+", label: "Global Clients" },
    { value: "24/7", label: "Support" },
  ];
  
  const expertise = [
    { title: "Cloud Solutions", desc: "Architecting resilient infrastructures using AWS, Azure, and GCP." },
    { title: "Software Development", desc: "Crafting bespoke software tailored to unique business needs." },
    { title: "DevOps & Automation", desc: "Enhancing efficiency through modern CI/CD practices." },
    { title: "Enterprise IT Services", desc: "Managed IT support and cybersecurity for growing enterprises." }
  ];

  return (
    <section id="about" className="section-padding bg-foreground text-background">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Who We Are
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-tight">
              Leading the Future of Cloud Innovation
            </h2>
            <div className="space-y-6">
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-lg text-background/60 leading-relaxed">{paragraph}</p>
              ))}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-12 border-t border-background/10">
              {stats.map((stat) => (
                <div key={`${stat.value}-${stat.label}`}>
                  <h4 className="text-3xl font-bold text-primary mb-1">{stat.value}</h4>
                  <p className="text-[10px] text-background/40 uppercase tracking-widest font-bold">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-square rounded-[2rem] bg-background/5 border border-background/10 p-10 flex flex-col justify-center backdrop-blur-sm relative z-10 overflow-hidden group hover:border-primary/30 transition-colors duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className="h-32 w-32 border-4 border-primary rounded-full" />
              </div>
              
              <h3 className="text-2xl font-bold mb-8 text-background">Our Core Expertise</h3>
              <ul className="space-y-6">
                {expertise.map((item) => (
                  <li key={item.title} className="flex items-start gap-4">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="font-bold text-background text-sm mb-1">{item.title}</p>
                      <p className="text-background/50 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-10 -right-10 h-64 w-64 bg-primary/20 blur-[100px] rounded-full" />
            <div className="absolute -top-10 -left-10 h-64 w-64 bg-secondary/10 blur-[100px] rounded-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
