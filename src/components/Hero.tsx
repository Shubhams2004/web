import React from 'react';
import { ArrowDown, ArrowUpRight, FileText, BookOpen, FileSpreadsheet, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { portfolioData } from '../data/portfolioData';

export const Hero: React.FC = () => {
  const handleScrollTo = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative pt-32 pb-20 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-slate-100/50 border-b border-slate-200/60"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {/* Availability pill badge */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-medium mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>{portfolioData.person.statusBadge}</span>
            </div>
          </div>

          {/* Welcoming Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Hi, I’m {portfolioData.person.fullName}.
            <span className="block text-blue-600 font-semibold mt-1">
              {portfolioData.person.headline}
            </span>
          </h1>

          {/* Brief Tagline about what I do */}
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl font-normal">
            {portfolioData.person.tagline}
          </p>

          {/* Core Pillars / Specializations quick pills */}
          <div className="flex flex-wrap gap-2.5 mb-10 text-xs font-medium text-slate-700">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 shadow-xs">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Research Writing</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 shadow-xs">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Case Studies</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 shadow-xs">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>Survey & Quantitative</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 shadow-xs">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Data Storytelling</span>
            </div>
          </div>

          {/* Call-to-action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <button
              id="hero-cta-portfolio"
              type="button"
              onClick={() => handleScrollTo('portfolio')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer"
            >
              <span>View Case Studies</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              id="hero-cta-contact"
              type="button"
              onClick={() => handleScrollTo('contact')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold text-sm border border-slate-300 shadow-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 cursor-pointer"
            >
              <span>Get in Touch</span>
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </motion.div>

        {/* Quick Credentials / Highlight strip */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
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
