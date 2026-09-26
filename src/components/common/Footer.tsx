import React, { useState } from 'react';
import {
  ArrowUp,
  Radio,
  Gamepad2,
  Terminal,
  Activity,
  Zap,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { portfolioData } from '../../data/portfolioData';
import { BrandLogo } from './BrandLogo';
import { missionAudio } from '../../mission-control/audio';

export const Footer: React.FC = () => {
  const [carrierPinging, setCarrierPinging] = useState(false);
  const [carrierResponse, setCarrierResponse] = useState<string | null>(null);

  const scrollToTop = () => {
    missionAudio.playBeep(520, 0.04);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTestCarrier = () => {
    setCarrierPinging(true);
    missionAudio.userInteracted();
    missionAudio.playRadarPing();

    setTimeout(() => {
      missionAudio.playTerminalBlip();
      setCarrierPinging(false);
      setCarrierResponse(
        'BEACON 0x8F ACK: Subterranean command center listening on [Ctrl+Shift+M]. Grid nominal.'
      );

      setTimeout(() => {
        setCarrierResponse(null);
      }, 6000);
    }, 600);
  };

  return (
    <footer
      id="site-footer"
      className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 font-mono relative overflow-hidden"
    >
      {/* Background retro grid lines */}
      <div className="absolute inset-0 retro-grid-bg opacity-15 pointer-events-none" />
      <div className="absolute inset-0 retro-scanlines opacity-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Telemetry Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-8 border-b border-slate-800 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Activity className="w-3.5 h-3.5" />
              <span>SYS_VER: 3.2.0 // PLAYGROUND</span>
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>CARRIER: LOCKED (142.85 MHz)</span>
            </span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline text-slate-400">
              LATENCY: 12ms // BUFFER: CLEAN
            </span>
          </div>

          {/* Mysterious Interactive Ping Control */}
          <button
            type="button"
            onClick={handleTestCarrier}
            disabled={carrierPinging}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-850 border border-slate-750 text-slate-300 hover:text-cyan-300 text-[10px] font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Ping deep network carrier beacon"
          >
            <Wifi className={`w-3 h-3 text-cyan-400 ${carrierPinging ? 'animate-ping' : ''}`} />
            <span>{carrierPinging ? 'PINGING...' : 'PING CARRIER BEACON'}</span>
          </button>
        </div>

        {/* Carrier response feedback banner */}
        {carrierResponse && (
          <div className="mb-6 p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs flex items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{carrierResponse}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#/mission-control';
              }}
              className="px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-bold text-[10px] hover:bg-cyan-400 cursor-pointer shrink-0"
            >
              Enter HQ
            </button>
          </div>
        )}

        {/* Primary Row: Identity & Navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" className="w-9 h-9" />
            <div>
              <span className="text-white font-bold text-sm tracking-tight block font-sans">
                {portfolioData.person.fullName}
              </span>
              <span className="text-xs text-slate-400">
                {portfolioData.person.headline} · Digital Playground
              </span>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
            {portfolioData.navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="hover:text-cyan-400 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#/playground"
              className="hover:text-blue-400 transition-colors flex items-center gap-1 font-semibold text-blue-400"
            >
              <span>🧪 Lab</span>
            </a>
            <a
              href="#/game"
              className="hover:text-rose-400 transition-colors flex items-center gap-1 font-bold text-rose-400"
            >
              <Gamepad2 className="w-3 h-3" />
              <span>Arcade</span>
            </a>
            <a
              href="#/news"
              className="hover:text-cyan-400 transition-colors"
            >
              Newsroom
            </a>
          </nav>

          <button
            type="button"
            onClick={scrollToTop}
            id="back-to-top-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
            aria-label="Scroll back to top"
          >
            <span>Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Sub-Footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="font-sans">
            &copy; {new Date().getFullYear()} {portfolioData.person.fullName}. Living digital playground & empirical research synthesis.
          </p>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-slate-400">
              Identity → Discovery → Play
            </span>

            {/* Secret Mission Control shortcut button */}
            <button
              type="button"
              onClick={() => {
                missionAudio.playRadarPing();
                window.location.hash = '#/mission-control';
              }}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-cyan-400 transition-colors py-1 px-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-800/80 cursor-pointer group"
              title="Access Subterranean Mission Control HQ (Shortcut: Ctrl+Shift+M)"
              aria-label="Mission Control HQ"
            >
              <Radio className="w-3 h-3 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span>Mission Control</span>
              <span className="text-[9px] text-cyan-400 font-mono hidden md:inline">
                [⌘⇧M]
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
