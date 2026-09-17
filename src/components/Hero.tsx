import React from 'react';
import { ArrowDown, ArrowUpRight, Search, FileSpreadsheet, CheckCircle, BarChart3 } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import { portfolioData } from '../data/portfolioData';

export const Hero: React.FC = () => {
  const handleScrollTo = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section
      id="home"
      className="relative pt-32 pb-20 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-slate-100/50 border-b border-slate-200/60"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-3xl"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Availability pill badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-medium mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>{portfolioData.person.statusBadge}</span>
            </div>
          </motion.div>

          {/* Welcoming Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6"
          >
            Hi, I’m {portfolioData.person.fullName}.
            <span className="block text-blue-600 font-semibold mt-1">
              {portfolioData.person.headline}
            </span>
          </motion.h1>

          {/* Brief Tagline about what I do */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl font-normal"
          >
            {portfolioData.person.tagline}
          </motion.p>

          {/* Core Pillars / Specializations quick pills */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-2.5 mb-10 text-xs font-medium text-slate-700"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 shadow-xs">
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>User Research</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 shadow-xs">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>Survey Architecture</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 shadow-xs">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Usability Testing</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 shadow-xs">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Data Analysis</span>
            </div>
          </motion.div>

          {/* Call-to-action buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
          >
            <button
              id="hero-cta-portfolio"
              type="button"
              onClick={() => handleScrollTo('portfolio')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <span>View My Work</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              id="hero-cta-contact"
              type="button"
              onClick={() => handleScrollTo('contact')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold text-sm border border-slate-300 shadow-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              <span>Get in Touch</span>
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
            </button>
          </motion.div>
        </motion.div>

        {/* Quick Credentials / Highlight strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-16 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-left"
        >
          {portfolioData.about.highlights.map((item, index) => (
            <div key={index} className="space-y-1">
              <dt className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                {item.label}
              </dt>
              <dd className="text-base sm:text-lg font-bold text-slate-800">
                {item.value}
              </dd>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
