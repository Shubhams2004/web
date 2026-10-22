import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  TrendingUp,
  Rss,
  CheckCircle2,
  FileText,
  ExternalLink,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { missionAudio } from '../../mission-control/audio';
import { INITIAL_TRENDING_CASE_STUDIES } from '../../data/trendingCaseStudies';
import { BusinessCaseStudy } from '../../types';
import { CaseStudyDetailModal } from '../case-studies/CaseStudyDetailModal';
import { safeExternalLinkProps } from '../../utils/security';

interface HeroProps {
  onOpenRssDiscovery?: () => void;
  onLaunchGame?: (gameId: string) => void;
  onSelectCaseStudy?: (study: BusinessCaseStudy) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenRssDiscovery,
  onLaunchGame,
  onSelectCaseStudy,
}) => {
  const [internalModalStudy, setInternalModalStudy] = useState<BusinessCaseStudy | null>(null);

  // Flagship featured research piece
  const flagshipStudy: BusinessCaseStudy = INITIAL_TRENDING_CASE_STUDIES[0];

  const handleScrollTo = (targetId: string) => {
    missionAudio.playBeep(480, 0.05);
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenStudy = (study: BusinessCaseStudy) => {
    missionAudio.playTerminalBlip();
    if (onSelectCaseStudy) {
      onSelectCaseStudy(study);
    } else {
      setInternalModalStudy(study);
    }
  };

  return (
    <section
      id="home"
      className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-b border-slate-800 overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[420px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[550px] h-[320px] bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Authoritative Editorial Statement & Directed Action (Span 7) */}
          <motion.div
            className="lg:col-span-7 flex flex-col items-start"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Clean unboxed editorial kicker */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 mb-4 sm:mb-5 tracking-wider uppercase">
              <span className="font-semibold text-blue-400">Corporate Strategy</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Market Catalysts</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Empirical Intelligence</span>
            </div>

            {/* Core Headline in refined editorial serif */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] font-serif mb-5 sm:mb-6 text-balance">
              Synthesizing market catalysts, corporate disruptions & strategic intelligence.
            </h1>

            {/* Lead Narrative */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl mb-8">
              Investigative corporate inquiry paired with quantitative rigor to produce publication-grade business case studies. Every deep dive evaluates capital allocation, competitive moats, regulatory shifts, and operational inflection points.
            </p>

            {/* Adjacent Quantitative Proof Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl py-4 px-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xs mb-8">
              <div>
                <span className="block text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
                  12+
                </span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block mt-0.5">
                  Deep Case Studies
                </span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-blue-400 font-mono tabular-nums">
                  9-Part
                </span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block mt-0.5">
                  Analytical Schema
                </span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-amber-400 font-mono tabular-nums">
                  Real-Time
                </span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block mt-0.5">
                  Live Wire Catalysts
                </span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-emerald-400 font-mono tabular-nums">
                  100%
                </span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block mt-0.5">
                  Sourced Citations
                </span>
              </div>
            </div>

            {/* Decisive Action Buttons: 1 Primary CTA + 1 Secondary CTA */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                id="hero-cta-case-studies"
                type="button"
                onClick={() => handleScrollTo('case-studies')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-900/30 transition-all cursor-pointer active:scale-95"
              >
                <span>Explore Case Studies</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                id="hero-cta-dispatches"
                type="button"
                onClick={() => handleScrollTo('live-wire')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-slate-600 transition-all cursor-pointer active:scale-95"
              >
                <span>Live Market Wire</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleScrollTo('explore')}
                className="text-xs text-slate-400 hover:text-cyan-300 font-medium transition-colors ml-1 cursor-pointer"
              >
                Open Digital Lab & 3D Arcade &rarr;
              </button>
            </div>
          </motion.div>

          {/* Right Column: Flagship Case Study Spotlight (Span 5) */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
          >
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 backdrop-blur-md shadow-2xl flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
              {/* Subtle top hairline accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

              <div>
                {/* Spotlight Header with clean unboxed metadata */}
                <div className="flex items-center justify-between gap-3 mb-3 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1.5 text-blue-400 font-semibold uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Featured Flagship Study</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {flagshipStudy.date}
                  </span>
                </div>

                {/* Company & Industry Unboxed Metadata */}
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300 mb-2">
                  <span className="font-bold text-white">{flagshipStudy.company}</span>
                  {flagshipStudy.ticker && (
                    <span className="text-cyan-400 font-bold">({flagshipStudy.ticker})</span>
                  )}
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-slate-400">{flagshipStudy.industry}</span>
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug font-serif mb-3 group-hover:text-blue-300 transition-colors">
                  {flagshipStudy.title}
                </h2>

                {/* Strategic Dilemma Snippet */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                  {flagshipStudy.businessProblemOrOpportunity}
                </p>

                {/* Verified Quantitative Metrics Strip */}
                <div className="grid grid-cols-3 gap-2.5 mb-5 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  {flagshipStudy.importantDataOrResults.metrics.slice(0, 3).map((metric, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono truncate">
                        {metric.label}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-white font-mono tabular-nums block">
                        {metric.value}
                      </span>
                      {metric.change && (
                        <span className="text-[10px] text-emerald-400 font-semibold block font-mono">
                          {metric.change}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Core Strategic Takeaway */}
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 mb-5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold block mb-1">
                    Key Strategic Lesson
                  </span>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{flagshipStudy.keyLessons[0]}"
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => handleOpenStudy(flagshipStudy)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md shadow-blue-900/20 active:scale-95"
                >
                  <span>Read 9-Part Study</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {flagshipStudy.sources?.[0]?.url && (
                  <a
                    {...safeExternalLinkProps(flagshipStudy.sources[0].url)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
                    title="View SEC 10-Q & Primary Source Document"
                  >
                    <span>SEC 10-Q</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Internal Modal Fallback if not controlled by parent */}
      {internalModalStudy && (
        <CaseStudyDetailModal
          caseStudy={internalModalStudy}
          onClose={() => setInternalModalStudy(null)}
        />
      )}
    </section>
  );
};
