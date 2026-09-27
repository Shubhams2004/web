import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Rss,
  Layers,
  Compass,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { motion } from 'motion/react';
import { BrandLogo } from '../common/BrandLogo';
import { DiscoveryModal } from '../playground/DiscoveryModal';
import { missionAudio } from '../../mission-control/audio';

interface HeroProps {
  onOpenRssDiscovery?: () => void;
  onLaunchGame?: (gameId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenRssDiscovery, onLaunchGame }) => {
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [secretToast, setSecretToast] = useState<string | null>(null);

  // Global discovery shortcut: Press '?' or '~' to open Discovery Codex
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if (e.key === '?' || e.key === '~') {
        e.preventDefault();
        missionAudio.playRadarPing();
        setIsDiscoveryOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleScrollTo = (targetId: string) => {
    missionAudio.playBeep(480, 0.05);
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-b border-slate-800 overflow-hidden"
    >
      {/* Subtle background ambient gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[300px] bg-emerald-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Authoritative Editorial Statement & Action Hub (Span 7) */}
          <motion.div
            className="lg:col-span-7 flex flex-col items-start"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Clean unboxed editorial kicker */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-300 mb-4 sm:mb-5 tracking-wider uppercase">
              <span className="font-semibold">Corporate Strategy</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-semibold">Market Catalysts</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-semibold">Interactive Software</span>
            </div>

            {/* Core Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] font-serif mb-5 sm:mb-6 text-balance">
              Synthesizing market catalysts, corporate disruptions & strategic intelligence.
            </h1>

            {/* Lead Narrative */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl mb-6">
              I combine investigative corporate inquiry with quantitative rigor to produce publication-grade business case studies and strategic intelligence. From public filings to live market catalysts, every study evaluates capital allocation, competitive moats, and operational inflection points.
            </p>

            {/* Quiet Curatorial Metadata */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono text-slate-400 mb-8 sm:mb-10">
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Empirical Case Studies</span>
              </div>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Rss className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Wire Catalysts</span>
              </div>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open Digital Lab</span>
              </div>
            </div>

            {/* Clean Action Button Row */}
            <div className="flex flex-wrap items-center gap-3.5">
              <button
                id="hero-cta-case-studies"
                type="button"
                onClick={() => handleScrollTo('case-studies')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-900/30 transition-all cursor-pointer active:scale-95"
              >
                <span>Read Case Studies</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                id="hero-cta-dispatches"
                type="button"
                onClick={() => handleScrollTo('live-wire')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-slate-600 transition-all cursor-pointer active:scale-95"
              >
                <span>Latest Dispatches</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                id="hero-cta-explore"
                type="button"
                onClick={() => handleScrollTo('explore')}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl text-slate-400 hover:text-cyan-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                <span>Explore Lab & 3D Games</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Right Column: Editorial Featured Study Spotlight (Span 5) */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
          >
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
              {/* Subtle top accent rule */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400" />

              <div>
                {/* Spotlight Header */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Featured Case Study</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Q3 Edition
                  </span>
                </div>

                {/* Spotlight Title */}
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug font-serif mb-3 group-hover:text-blue-300 transition-colors">
                  AI Personal Assistant & Task Automation
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                  Low-cost agentic task automation infrastructure leveraging Groq API reasoning, Supabase persistent state, and Cloudflare Workers serverless execution.
                </p>

                {/* Key Spec Pillars */}
                <div className="space-y-2 mb-6 text-xs text-slate-300 font-mono">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Architecture</span>
                    <span className="font-semibold text-white">Triad Serverless Model</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Inference Core</span>
                    <span className="font-semibold text-cyan-300">Groq LPU Engine</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Execution Tier</span>
                    <span className="font-semibold text-emerald-300">100% Free-Tier Architecture</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    missionAudio.playTerminalBlip();
                    window.location.hash = '#/case-study/project-ai-assistant';
                  }}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <span>Read Full Architecture Study</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    missionAudio.playRadarPing();
                    setIsDiscoveryOpen(true);
                  }}
                  className="text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
                  title="Discover Codex (Shortcut: ?)"
                >
                  Codex [?]
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Discovery Codex Modal */}
      <DiscoveryModal
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
        onNavigate={(route) => {
          if (route.startsWith('#/game') && onLaunchGame) {
            const id = route.replace('#/game/', '').replace('#/game', '');
            onLaunchGame(id || 'sprint-run');
          } else {
            window.location.hash = route;
          }
        }}
      />
    </section>
  );
};
