"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { useState } from "react";

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        setIsSuccess(true);
        setFormData({ name: "", phone: "", email: "", message: "" });
      } else {
        if (res.status === 429) {
          setErrorMsg(data.error);
        } else {
          setErrorMsg("Failed to submit. Please try again.");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <section id="contact" className="section-padding bg-background">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left - Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex-1 space-y-6"
        >
          <div>
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Get In Touch
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              Ready to <span className="text-gradient">Transform</span> Your Enterprise?
            </h2>
            <p className="text-muted-foreground text-sm mt-3 leading-relaxed max-w-lg">
              Connect with our enterprise solutions team to discuss how Hippocloud Technologies can accelerate your digital transformation journey.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { icon: Mail, label: "Email", value: "info@hippoclouds.com", href: "mailto:info@hippoclouds.com" },
              { icon: Phone, label: "Phone", value: "+91 93478 62547", href: "tel:+919347862547" },
              { icon: MapPin, label: "Head Office", value: "Asilmetta, Visakhapatnam, AP 530003" },
              { icon: MapPin, label: "Madhurawada Branch", value: "Madhurawada, Visakhapatnam, AP 530041" },
            ].map((item) => (
              <a 
                key={item.label} 
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/20 transition-colors ${!item.href && 'pointer-events-none'}`}
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.label}</div>
                  <div className="font-semibold text-foreground text-sm">{item.value}</div>
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
          <div className="rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-6 md:p-8 text-center flex flex-col justify-center max-w-lg mx-auto shadow-2xl shadow-primary/20">
            <h3 className="text-xl md:text-2xl font-bold text-primary-foreground mb-4">
              Schedule a Free Consultation
            </h3>
            <p className="text-primary-foreground/80 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
              Let our experts assess your needs and recommend the perfect solution for your business.
            </p>
            
            <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/20">
              {isSuccess ? (
                <div className="text-center py-8 text-white">
                  <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <Send className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Request Received!</h4>
                  <p className="text-white/80">Our experts will contact you shortly.</p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="mt-6 text-sm font-semibold hover:underline"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
                  <div>
                    <label className="text-xs font-bold text-white/90 uppercase tracking-wider mb-1.5 block">Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                      placeholder="Your Full Name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/90 uppercase tracking-wider mb-1.5 block">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                      title="Please enter a valid 10-digit phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, "")})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                      placeholder="Your Phone Number"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/90 uppercase tracking-wider mb-1.5 block">Email Address (Optional)</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                      placeholder="Your Email Address"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-white/90 uppercase tracking-wider mb-1 block">Your Message</label>
                    <textarea 
                      rows={2}
                      placeholder="How can we help you?"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>

                  {errorMsg && (
                    <div className="bg-red-500/20 text-red-100 text-sm p-3 rounded-lg border border-red-500/30">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-white text-primary px-4 py-2.5 text-sm font-bold hover:scale-[1.02] transition-all shadow-lg disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Request"}
                  </button>
                </form>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  </section>
  );
};

export default ContactSection;







