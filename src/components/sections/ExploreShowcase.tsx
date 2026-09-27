import React from 'react';
import {
  Gamepad2,
  FlaskConical,
  Newspaper,
  Terminal,
  ArrowRight,
  Sparkles,
  Zap,
  Play,
  Layers,
} from 'lucide-react';
import { missionAudio } from '../../mission-control/audio';

interface ExploreShowcaseProps {
  onLaunchGame?: (gameId: string) => void;
  className?: string;
}

export const ExploreShowcase: React.FC<ExploreShowcaseProps> = ({
  onLaunchGame,
  className = '',
}) => {
  const handleGameClick = (gameId: string) => {
    missionAudio.playBeep(880, 0.06);
    if (onLaunchGame) {
      onLaunchGame(gameId);
    } else {
      window.location.hash = `#/game/${gameId}`;
    }
  };

  const handleNavigate = (route: string) => {
    missionAudio.playBeep(720, 0.05);
    window.location.hash = route;
  };

  return (
    <section
      id="explore"
      className={`py-16 sm:py-20 lg:py-24 bg-slate-900 text-white border-b border-slate-800 relative overflow-hidden ${className}`}
      aria-label="Explore Interactive Systems and Deeper Laboratory"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-cyan-400 mb-3">
            <span>Deeper Environments</span>
            <span aria-hidden="true">·</span>
            <span>Interactive Systems</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight font-serif mb-4">
            Explore the Digital Ecosystem
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Beyond strategic research case studies and market dispatches, step into the site's deeper interactive layers: playable 3D games, browser laboratories, and dedicated publishing platforms.
          </p>
        </div>

        {/* 4-Card Curated Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
          {/* Card 1: 3D Sprint Run & Arcade (Span 7) */}
          <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group hover:border-slate-700 transition-all shadow-lg relative overflow-hidden">
            {/* Background Preview Image with measured scrim overlay */}
            <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500 overflow-hidden pointer-events-none">
              <img
                src="/src/assets/images/sprint_run_card_preview_1790417905607.jpg"
                alt="Sprint Run 3D Jungle Ruins Preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-bold uppercase tracking-wider">
                    New 3D Release
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  4 Playable Games
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight font-serif mb-3">
                Sprint Run & 3D Arcade
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mb-6">
                An original modern 3D endless adventure runner through ancient jungle ruins with kinematic stride animation, jump and slide maneuvers, and supersonic sprint boosts. Plus Retro Racer, Shadow Hunt, and Pixel Dungeon.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleGameClick('sprint-run')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-emerald-900/30 transition-all cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Play Sprint Run (3D)</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('#/game')}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                <span>Browse All Games</span>
              </button>
            </div>
          </div>

          {/* Card 2: Experimental Laboratory (Span 5) */}
          <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group hover:border-slate-700 transition-all shadow-lg">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                  <FlaskConical className="w-4 h-4" />
                  <span className="font-bold uppercase tracking-wider">
                    Interactive Sandbox
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  Web Prototypes
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight leading-tight font-serif mb-3">
                Experimental Playground
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Hands-on browser experiments: physics simulators, waveform visualizers, dynamic UI interaction models, and WebGL prototypes built for exploratory research.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleNavigate('#/playground')}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 hover:border-cyan-600/50 transition-all cursor-pointer group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-500"
              >
                <span>Launch Experimental Lab</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 3: Dedicated Digital Newsroom (Span 6) */}
          <div className="lg:col-span-6 bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group hover:border-slate-700 transition-all shadow-lg">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
                  <Newspaper className="w-4 h-4" />
                  <span className="font-bold uppercase tracking-wider">
                    Publishing Platform
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  Live Media Wires
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-serif mb-3">
                Digital Newsroom Platform
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Full-page digital publication with multi-category dispatches, real-time RSS market wire ingestion, search filtering, and reader view modals.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleNavigate('#/news')}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                <span>Open Dedicated Newsroom</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 4: Mission Control Command Center (Span 6) */}
          <div className="lg:col-span-6 bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group hover:border-slate-700 transition-all shadow-lg">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                  <Terminal className="w-4 h-4" />
                  <span className="font-bold uppercase tracking-wider">
                    Internal Operations
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Ctrl + Shift + M
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-serif mb-3">
                Mission Control Command Center
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Command terminal and telemetry hub for monitoring platform vitals, system architecture, direct game launching, and operational diagnostics.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleNavigate('#/mission-control')}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <span>Access Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
