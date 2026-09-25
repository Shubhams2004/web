import React, { useState } from 'react';
import {
  Gamepad2,
  Play,
  Trophy,
  Flame,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  Crosshair,
  Gauge,
} from 'lucide-react';
import { AVAILABLE_GAMES, GameDefinition } from '../../games';
import { missionAudio } from '../../mission-control/audio';

interface FeaturedExperienceCardProps {
  onLaunchGame?: (gameId: string) => void;
  className?: string;
}

export const FeaturedExperienceCard: React.FC<FeaturedExperienceCardProps> = ({
  onLaunchGame,
  className = '',
}) => {
  const [selectedGameId, setSelectedGameId] = useState<string>('pixel-dungeon');

  const selectedGame: GameDefinition =
    AVAILABLE_GAMES.find((g) => g.id === selectedGameId) || AVAILABLE_GAMES[0];

  const handleSelectGame = (id: string) => {
    setSelectedGameId(id);
    missionAudio.playBeep(640, 0.05);
  };

  const handleLaunch = () => {
    missionAudio.playBeep(1040, 0.12);
    missionAudio.playTerminalBlip();
    if (onLaunchGame) {
      onLaunchGame(selectedGame.id);
    } else {
      window.location.hash = `#/game/${selectedGame.id}`;
    }
  };

  // Game-specific highlights
  const getGameHighlights = (id: string) => {
    switch (id) {
      case 'pixel-dungeon':
        return [
          { label: 'Style', val: 'Turn-Based Crypt Roguelike' },
          { label: 'Mechanics', val: 'Inventory, Potions, Floor Keys' },
          { label: 'Depth', val: 'Infinite Procedural Chambers' },
          { label: 'Audio', val: 'Self-Synthesized Chiptune' },
        ];
      case 'zombie-survival':
        return [
          { label: 'Style', val: 'Top-Down Wave Shooter' },
          { label: 'Arsenal', val: 'Pistol, Shotgun, Nuke Drops' },
          { label: 'Threat', val: 'Fast Mutants & Boss Hordes' },
          { label: 'Year', val: '1989 Quarantine Arena' },
        ];
      case 'retro-racer':
      default:
        return [
          { label: 'Style', val: 'Top-Down Highway Pursuit' },
          { label: 'Feature', val: 'Near-Miss Bonus & Turbo Booster' },
          { label: 'Speed', val: '240 MPH Max Velocity' },
          { label: 'Visuals', val: '80s Synthwave Grid Lines' },
        ];
    }
  };

  const highlights = getGameHighlights(selectedGame.id);

  return (
    <section
      id="featured-experience"
      className={`py-8 sm:py-12 border-b border-slate-200/70 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white relative overflow-hidden ${className}`}
      aria-label="Featured Retro Arcade Experience"
    >
      {/* Background ambient grid */}
      <div className="absolute inset-0 retro-grid-bg opacity-30 pointer-events-none" />
      <div className="absolute inset-0 retro-scanlines opacity-15 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 text-xs font-mono font-semibold mb-2">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>ARCADE LABORATORY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Featured Experience</span>
              <span className="text-xs font-mono font-normal text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700">
                100% IN-BROWSER
              </span>
            </h2>
          </div>

          {/* Quick switcher tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700/80">
            {AVAILABLE_GAMES.map((game) => {
              const isActive = game.id === selectedGameId;
              return (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => handleSelectGame(game.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {game.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Large Interactive Featured Card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-slate-850 to-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Column: Visual Showcase & Gameplay Teaser */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative bg-slate-950/40">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold">
                    {selectedGame.badge}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono">
                    {selectedGame.releaseYear}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-mono flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    <span>Highscore Tracked</span>
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">
                  {selectedGame.title}
                </h3>
                <p className="text-cyan-400 font-mono text-sm font-semibold mb-4">
                  {selectedGame.subtitle}
                </p>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  {selectedGame.description}
                </p>

                {/* Highlights Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                  {highlights.map((h, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono"
                    >
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                        {h.label}
                      </div>
                      <div className="text-slate-200 font-semibold truncate">{h.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  id={`launch-${selectedGame.id}-btn`}
                  onClick={handleLaunch}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-900/40 hover:shadow-cyan-900/40 transition-all cursor-pointer group active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                  <span>PLAY {selectedGame.title.toUpperCase()}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    missionAudio.playBeep(480, 0.06);
                    window.location.hash = '#/game';
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Browse All 3 Games</span>
                </button>
              </div>
            </div>

            {/* Right Column: Retro Interactive Canvas / Mini Cockpit View */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-900 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-4 pb-2 border-b border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>EMULATOR READY</span>
                  </span>
                  <span>CANVAS 2D / 60 FPS</span>
                </div>

                {/* Simulated CRT Screen Preview */}
                <div className="relative rounded-xl bg-black border-2 border-slate-700/80 p-4 aspect-4/3 flex flex-col items-center justify-center text-center overflow-hidden shadow-inner group">
                  <div className="absolute inset-0 retro-scanlines opacity-40 pointer-events-none" />
                  <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black pointer-events-none" />

                  {/* Icon illustration per game */}
                  <div className="relative z-10 mb-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 group-hover:scale-110 transition-transform duration-300">
                    {selectedGame.id === 'pixel-dungeon' && (
                      <Shield className="w-12 h-12 text-amber-400" />
                    )}
                    {selectedGame.id === 'zombie-survival' && (
                      <Crosshair className="w-12 h-12 text-emerald-400" />
                    )}
                    {selectedGame.id === 'retro-racer' && (
                      <Gauge className="w-12 h-12 text-cyan-400" />
                    )}
                  </div>

                  <div className="relative z-10 font-mono text-xs text-slate-300">
                    <span className="text-cyan-400 font-bold tracking-widest block text-sm">
                      {selectedGame.title}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Press [Play] to enter retro full arena
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLaunch}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                  >
                    <span className="px-4 py-2 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg">
                      <Play className="w-3.5 h-3.5 fill-white" /> Launch Arcade
                    </span>
                  </button>
                </div>
              </div>

              {/* Discovery prompt in card */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-slate-400">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Hidden: Discover easter egg codes in-game</span>
                </span>
                <span className="text-slate-400">WASD / ARROWS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
