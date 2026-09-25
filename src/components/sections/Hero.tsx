import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Rss,
  Gamepad2,
  Radio,
  Terminal,
  Compass,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { BrandLogo } from '../common/BrandLogo';
import { SignalConsole } from '../playground/SignalConsole';
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

  const handleSecretPing = (msg?: string) => {
    missionAudio.playTerminalBlip();
    setSecretToast(msg || '✨ ANOMALY DETECTED: Unknown carrier signal tuned.');
    setTimeout(() => {
      setSecretToast(null);
    }, 4500);
  };

  return (
    <section
      id="home"
      className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-b border-slate-800"
    >
      {/* Retro playground backdrop effects */}
      <div className="absolute inset-0 retro-grid-bg opacity-30 pointer-events-none" />
      <div className="absolute inset-0 retro-scanlines opacity-15 pointer-events-none" />

      {/* Subtle top ambient glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Identity, Powerful Headline, Philosophy & Action Hub */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* Identity Status Pill + Secret Discovery Glyph */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-cyan-300 text-xs font-mono font-semibold shadow-2xs">
                <BrandLogo size="sm" className="w-4 h-4 -ml-0.5" />
                <span>Shubham Sonale · Research Analyst & Digital Lab</span>
              </div>

              {/* Secret Clickable Glyph / Anomaly */}
              <button
                type="button"
                onClick={() => {
                  missionAudio.playRadarPing();
                  setIsDiscoveryOpen(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:text-amber-200 hover:bg-amber-500/25 text-[11px] font-mono transition-all cursor-pointer group"
                title="Discover hidden digital playground secrets (Shortcut: ?)"
              >
                <Sparkles className="w-3 h-3 group-hover:rotate-45 transition-transform" />
                <span>[DISCOVER CODEX]</span>
              </button>
            </div>

            {/* Core Hero Headline */}
            <div className="space-y-1 mb-3">
              <span className="text-xs sm:text-sm font-mono font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                <span>NODE 0x01 // DIGITAL PLAYGROUND</span>
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
                WELCOME TO THE WEB
              </h1>
            </div>

            {/* Supporting line */}
            <p className="text-lg sm:text-xl font-semibold text-cyan-300/90 mb-3 tracking-tight font-sans">
              You never know what you'll find.
            </p>

            {/* Identity & Discovery synthesis description */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 font-normal max-w-xl">
              An open digital lab bridging corporate strategy research, live market catalyst discovery, and playable retro-futuristic arcade machines. Explore empirical findings, tune electromagnetic carrier waves, or uncover hidden command decks.
            </p>

            {/* Core Capability Badges */}
            <div className="flex flex-wrap gap-2 mb-7 text-xs font-mono">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                <span>Empirical Case Studies</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <Rss className="w-3.5 h-3.5 text-amber-400" />
                <span>Live RSS Catalyst Discovery</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <Gamepad2 className="w-3.5 h-3.5 text-rose-400" />
                <span>3 Playable Retro Games</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>VHF Signal Console</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="hero-cta-case-studies"
                type="button"
                onClick={() => handleScrollTo('case-studies')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-900/40 transition-all cursor-pointer active:scale-95"
              >
                <span>Explore Research Studies</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                id="hero-cta-arcade"
                type="button"
                onClick={() => {
                  missionAudio.playBeep(920, 0.08);
                  if (onLaunchGame) {
                    onLaunchGame('pixel-dungeon');
                  } else {
                    window.location.hash = '#/game';
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-900/30 transition-all cursor-pointer active:scale-95"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Enter Arcade</span>
              </button>

              {onOpenRssDiscovery && (
                <button
                  id="hero-cta-discover-rss"
                  type="button"
                  onClick={onOpenRssDiscovery}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
                >
                  <Rss className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Discover Live RSS</span>
                  <span className="sm:hidden">Live RSS</span>
                </button>
              )}

              <button
                id="hero-cta-contact"
                type="button"
                onClick={() => handleScrollTo('contact')}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <span>Inquiries</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Right Column: Visual Interactive Signal Console */}
          <div className="lg:col-span-5">
            <SignalConsole
              onSignalDiscovered={(msg) => handleSecretPing(msg)}
              className="w-full"
            />
          </div>
        </div>

        {/* Discovery Notification Toast if triggered */}
        {secretToast && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs font-mono flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{secretToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsDiscoveryOpen(true)}
              className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px] hover:bg-amber-400 transition-colors cursor-pointer shrink-0"
            >
              View Codex
            </button>
          </div>
        )}
      </div>

      {/* Discovery Codex Modal */}
      <DiscoveryModal
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
        onNavigate={(route) => {
          if (route.startsWith('#/game') && onLaunchGame) {
            const id = route.replace('#/game/', '').replace('#/game', '');
            onLaunchGame(id || 'pixel-dungeon');
          } else {
            window.location.hash = route;
          }
        }}
      />
    </section>
  );
};
