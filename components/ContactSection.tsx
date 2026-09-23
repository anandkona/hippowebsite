"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";

const ContactSection = () => (
  <section id="contact" className="section-padding bg-background">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left - Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex-1 space-y-8"
        >
          <div>
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Get In Touch
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              Ready to <span className="text-gradient">Transform</span> Your Enterprise?
            </h2>
            <p className="text-muted-foreground text-lg mt-5 leading-relaxed max-w-lg">
              Connect with our enterprise solutions team to discuss how Hippocloud Technologies can accelerate your digital transformation journey.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: "info@hippoclouds.com", href: "mailto:info@hippoclouds.com" },
              { icon: Phone, label: "Phone", value: "+91 93478 62547", href: "tel:+919347862547" },
              { icon: MapPin, label: "Head Office", value: "Asilmetta, Visakhapatnam, AP 530003" },
              { icon: MapPin, label: "Madhurawada Branch", value: "Madhurawada, Visakhapatnam, AP 530041" },
            ].map((item) => (
              <a 
                key={item.label} 
                href={item.href}
                className={`flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-primary/20 transition-colors ${!item.href && 'pointer-events-none'}`}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.label}</div>
                  <div className="font-semibold text-foreground text-sm md:text-base">{item.value}</div>
                </div>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Right - CTA Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1"
        >
          <div className="rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-10 md:p-14 text-center flex flex-col justify-center min-h-[450px] shadow-2xl shadow-primary/20">
            <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Schedule a Free Consultation
            </h3>
            <p className="text-primary-foreground/80 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
              Let our experts assess your needs and recommend the perfect solution for your business.
            </p>
            <div className="flex flex-col gap-4">
              <a
                href="mailto:info@hippoclouds.com"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-background text-foreground px-8 py-4 text-sm font-bold hover:scale-[1.02] transition-all shadow-lg"
              >
                Book a Meeting <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="tel:+91 93478 62547"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-foreground/30 text-primary-foreground px-8 py-4 text-sm font-bold hover:bg-primary-foreground/10 transition-colors"
              >
                <Phone className="h-4 w-4" /> Call Us Now
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default ContactSection;
