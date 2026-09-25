"use client";

import { motion } from "framer-motion";
import { ArrowRight, ImageIcon } from "lucide-react";
import Link from "next/link";

type Skill = {
  id: number;
  title: string;
  description: string;
  image_url: string;
};

import { useState } from "react";

const SkillCard = ({ skill, index }: { skill: Skill; index: number }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const isLong = skill.description.length > 90;
  const displayedDesc = isLong ? skill.description.slice(0, 90) + '...' : skill.description;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group cursor-pointer"
        onClick={() => { if (isLong) setModalOpen(true); }}
      >
        <div className="h-48 overflow-hidden bg-muted/20 border-b border-border relative shrink-0">
          {skill.image_url ? (
            <img 
              src={skill.image_url} 
              alt={skill.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`flex items-center justify-center h-full w-full ${skill.image_url ? 'hidden' : ''}`}>
            <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <h4 className="font-bold text-foreground text-lg mb-2">{skill.title}</h4>
          <p className="text-muted-foreground text-sm leading-relaxed flex-1">
            {displayedDesc}
            {isLong && (
              <button 
                onClick={(e) => { e.stopPropagation(); setModalOpen(true); }} 
                className="text-primary font-semibold hover:underline ml-1 inline-block"
              >
                Read more
              </button>
            )}
          </p>
        </div>
      </motion.div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200" onClick={() => setModalOpen(false)}>
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 md:p-8 overflow-y-auto flex-1">
               <h4 className="text-xl md:text-2xl font-bold text-foreground mb-4">{skill.title}</h4>
               <p className="text-muted-foreground text-sm md:text-base leading-relaxed whitespace-pre-wrap">{skill.description}</p>
            </div>
            <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end shrink-0">
              <button onClick={() => setModalOpen(false)} className="px-6 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const AcademySection = ({ skills = [] }: { skills?: Skill[] }) => (
  <section id="academy" className="section-padding bg-muted/30">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-3xl text-center space-y-6"
        >
          <div>
            <span className="inline-block rounded-full bg-secondary/10 px-4 py-1.5 text-secondary text-xs font-bold uppercase tracking-[0.2em] mb-4">
              Skill Academy
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Invest in Your <span className="text-gradient">Workforce</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mt-5">
              Our enterprise academy delivers intensive, industry-aligned training programs designed for organizations that invest heavily in equipping their people with the skills of tomorrow.
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground shadow-lg shadow-secondary/20 hover:scale-[1.02] transition-all mx-auto"
          >
            Explore Programs <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full pt-8 border-t border-border/50"
        >
          <div className="mb-10 text-center flex flex-col items-center">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">Skills We Deliver</h3>
            <div className="h-1 w-16 bg-primary mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {skills.map((skill, i) => (
              <SkillCard key={skill.id} skill={skill} index={i} />
            ))}

            {skills.length === 0 && (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center py-12 px-6 border border-dashed border-border rounded-2xl text-muted-foreground bg-muted/10">
                Skills will appear here once added in the Admin Panel.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default AcademySection;
