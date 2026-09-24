import React from 'react';
import { ArrowDown, ArrowUpRight, TrendingUp, Sparkles, Rss, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { BrandLogo } from '../common/BrandLogo';

interface HeroProps {
  onOpenRssDiscovery?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenRssDiscovery }) => {
  const handleScrollTo = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-22 overflow-hidden bg-gradient-to-b from-white via-slate-50/70 to-slate-100/50 border-b border-slate-200/60"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {/* Quick status pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-900 text-xs font-semibold mb-5 shadow-2xs">
            <BrandLogo size="sm" className="w-4 h-4 -ml-0.5" />
            <span>Shubham Sonale · Research Analyst & Strategy Writer</span>
          </div>

          {/* Very brief, high-impact headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-4">
            Trending Business Case Studies & Corporate Strategy Research
          </h1>

          {/* 1 concise sentence summary */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6 font-normal">
            Synthesizing breaking market catalysts, corporate disruptions, and public filings into empirical, original business case studies powered by live RSS discovery and Groq research synthesis.
          </p>

          {/* Core Feature Badges */}
          <div className="flex flex-wrap gap-2 mb-8 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
              <Rss className="w-3.5 h-3.5 text-amber-500" />
              <span>Live RSS Catalyst Discovery</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Groq Server-Side Synthesis</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Quantitative Data & Results</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Executive Strategic Lessons</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="hero-cta-case-studies"
              type="button"
              onClick={() => handleScrollTo('case-studies')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <span>Explore Case Studies</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            {onOpenRssDiscovery && (
              <button
                id="hero-cta-discover-rss"
                type="button"
                onClick={onOpenRssDiscovery}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 shadow-2xs transition-colors cursor-pointer"
              >
                <Rss className="w-4 h-4 text-amber-500" />
                <span>Discover Live Business Stories</span>
              </button>
            )}

            <button
              id="hero-cta-contact"
              type="button"
              onClick={() => handleScrollTo('contact')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <span>Research Inquiries</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
