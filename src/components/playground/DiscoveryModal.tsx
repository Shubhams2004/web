import React, { useEffect } from 'react';
import {
  Sparkles,
  X,
  Radio,
  Gamepad2,
  Terminal,
  Zap,
  ShieldAlert,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { missionAudio } from '../../mission-control/audio';

interface DiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (route: string) => void;
}

export const DiscoveryModal: React.FC<DiscoveryModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    missionAudio.playAchievementFanfare();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRoute = (route: string) => {
    missionAudio.playTerminalBlip();
    onClose();
    if (onNavigate) {
      onNavigate(route);
    } else {
      window.location.hash = route;
    }
  };

  const secrets = [
    {
      title: 'Subterranean Mission Control',
      code: 'Ctrl + Shift + M',
      desc: 'Deep subterranean operations deck. Controls live sector nodes, achievements, telemetry, and audio synthesizers.',
      route: '#/mission-control',
      action: 'Enter Command Deck',
      icon: Terminal,
      color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800',
    },
    {
      title: 'Chaos Mode Capability',
      code: 'Mission Control -> CHAOS',
      desc: 'A hidden capability triggering harmless visual events: pixel rain, screen wobble, UI glitches, alien signals, and retro arcade overlays.',
      route: '#/mission-control',
      action: 'Prime Chaos',
      icon: Zap,
      color: 'text-amber-400 bg-amber-950/60 border-amber-800',
    },
    {
      title: 'VHF Signal Console',
      code: 'Hero [Tune Spectrum]',
      desc: 'Scan electromagnetic spectrum channels to intercept classified transmissions, cryptographic seeds, and alien carriers.',
      route: '#home',
      action: 'Tune Console',
      icon: Radio,
      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
    },
    {
      title: 'Three 80s/90s Arcade Classics',
      code: 'Arcade Suite',
      desc: 'Pixel Dungeon procedural crawler, Zombie Survival 1989 arena, and Retro Racer synthwave highway pursuit.',
      route: '#/game',
      action: 'Open Arcade',
      icon: Gamepad2,
      color: 'text-rose-400 bg-rose-950/60 border-rose-800',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Discovery & Secrets Codex"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 font-mono text-slate-200 overflow-hidden"
      >
        {/* Retro scanlines */}
        <div className="absolute inset-0 retro-scanlines opacity-20 pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>DIGITAL PLAYGROUND CODEX</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  DISCOVERY
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Subtle anomalies, hidden commands, and interactive subterranean protocols
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close discovery modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Secrets & Protocols Grid */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 relative z-10">
          {secrets.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg border shrink-0 ${sec.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm text-white">{sec.title}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {sec.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">{sec.desc}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRoute(sec.route)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer"
                >
                  <span>{sec.action}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Tip Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 relative z-10">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Hint: Press [?] or click secret beacon glyphs anytime.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
