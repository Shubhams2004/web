import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Tv,
  HelpCircle,
  Trophy,
  Shield,
  Swords,
  RotateCcw,
  Skull,
  Gamepad2,
  Car,
  Key,
  Coins,
  Heart,
  Sparkles,
  Play,
  Footprints,
  Radio,
} from 'lucide-react';
import { PixelDungeonCanvas } from './PixelDungeonCanvas';
import { MobileControls } from './MobileControls';
import { dungeonAudio } from './audio';
import type { DungeonGameState, DungeonKeyControls, PlayerStats } from './types';

interface PixelDungeonPageProps {
  onBack: () => void;
  onSwitchGame?: (gameId: string) => void;
}

export const PixelDungeonPage: React.FC<PixelDungeonPageProps> = ({
  onBack,
  onSwitchGame,
}) => {
  const [gameState, setGameState] = useState<DungeonGameState>('start');
  const [isMuted, setIsMuted] = useState<boolean>(() => dungeonAudio.isMuted());
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Stats received from Canvas
  const [stats, setStats] = useState<PlayerStats>({
    hp: 100,
    maxHp: 100,
    attack: 8,
    defense: 2,
    keys: 0,
    coins: 0,
    score: 0,
    highScore: 0,
    floor: 1,
    weaponName: 'Rusty Dagger',
    weaponTier: 1,
    armorName: 'Tattered Tunic',
    armorTier: 1,
    enemiesDefeated: 0,
  });

  // Mobile / External controls
  const [externalControls, setExternalControls] = useState<DungeonKeyControls>({
    up: false,
    down: false,
    left: false,
    right: false,
    wait: false,
    action: false,
  });

  const [stepTrigger, setStepTrigger] = useState<number>(0);
  const [lastStepDir, setLastStepDir] = useState<
    'up' | 'down' | 'left' | 'right' | 'wait' | 'action' | null
  >(null);

  useEffect(() => {
    setIsMuted(dungeonAudio.isMuted());
    window.scrollTo({ top: 0, behavior: 'instant' });

    const prevTitle = document.title;
    document.title = 'Pixel Dungeon — Retro Roguelike Crawler | Shubham Sonale';

    const handleClearInputs = () => {
      setExternalControls({
        up: false,
        down: false,
        left: false,
        right: false,
        wait: false,
        action: false,
      });
    };

    window.addEventListener('blur', handleClearInputs);
    const handleVis = () => {
      if (document.hidden) handleClearInputs();
    };
    document.addEventListener('visibilitychange', handleVis);

    return () => {
      document.title = prevTitle;
      window.removeEventListener('blur', handleClearInputs);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, []);

  const handleToggleMute = () => {
    const next = dungeonAudio.toggleMute();
    setIsMuted(next);
  };

  const handleControlChange = (key: keyof DungeonKeyControls, pressed: boolean) => {
    setExternalControls((prev) => ({ ...prev, [key]: pressed }));
  };

  const handleMobileStep = (dir: 'up' | 'down' | 'left' | 'right' | 'wait' | 'action') => {
    setLastStepDir(dir);
    setStepTrigger((prev) => prev + 1);
  };

  const handleRestart = () => {
    setGameState('start');
  };

  const hpPercent = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Arcade Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Back to Portfolio */}
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit to Portfolio</span>
            <span className="sm:hidden">Exit</span>
          </button>

          {/* Game Title with Retro Badge */}
          <div className="flex items-center gap-2 text-center">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
              DUNGEON CRAWLER
            </span>
            <h1 className="text-sm sm:text-base font-black tracking-wider uppercase bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
              PIXEL DUNGEON
            </h1>
          </div>

          {/* Quick Controls: Audio, CRT, Help */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-2 rounded-lg text-xs border transition-colors ${
                isMuted
                  ? 'bg-rose-950/60 border-rose-900/60 text-rose-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              aria-label="Sound Toggle"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setCrtEnabled(!crtEnabled)}
              className={`px-2.5 py-1.5 rounded-lg text-xs border flex items-center gap-1 transition-colors ${
                crtEnabled
                  ? 'bg-amber-950/60 border-amber-700/60 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title="Toggle CRT Scanline Effect"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">{crtEnabled ? 'CRT ON' : 'CRT OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="How to Play"
              aria-label="Game Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Arcade Games Launcher Bar (Seamless switching between all 3 games) */}
      <div className="bg-slate-900/60 border-b border-slate-800/60 px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
            <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">ARCADE VAULT:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSwitchGame && onSwitchGame('shadow-hunt')}
              className="px-3 py-1 rounded-lg font-mono text-[11px] font-semibold bg-slate-900 text-slate-400 hover:text-cyan-400 hover:bg-slate-850 border border-slate-800 transition-colors flex items-center gap-1.5"
            >
              <span>🗡️</span>
              <span>Shadow Hunt</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchGame && onSwitchGame('pixel-dungeon')}
              className="px-3 py-1 rounded-lg font-mono text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.3)] flex items-center gap-1.5"
            >
              <Shield className="w-3 h-3 text-amber-400" />
              <span>Pixel Dungeon</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchGame && onSwitchGame('zombie-survival')}
              className="px-3 py-1 rounded-lg font-mono text-[11px] font-semibold bg-slate-900 text-slate-400 hover:text-emerald-400 hover:bg-slate-850 border border-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Skull className="w-3 h-3 text-emerald-400" />
              <span>Zombie Survival</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchGame && onSwitchGame('retro-racer')}
              className="px-3 py-1 rounded-lg font-mono text-[11px] font-semibold bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-850 border border-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Car className="w-3 h-3" />
              <span>Retro Racer</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#/mission-control';
              }}
              className="px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Access Mission Control HQ"
            >
              <Radio className="w-3 h-3 text-cyan-400" />
              <span>HQ</span>
            </button>
            <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
              <span>TURN-BASED ROGUELIKE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Arcade Experience Frame */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 sm:py-7 flex flex-col items-center justify-center">
        {/* Arcade Cabinet Exterior Frame */}
        <div className="relative w-full max-w-xl mx-auto bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-3 sm:p-5 border-2 border-slate-800 shadow-[0_0_50px_rgba(245,158,11,0.12)]">
          {/* Top Marquee Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 px-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="font-bold tracking-widest text-[10px]">DEPTH B{stats.floor}</span>
            </div>

            <div className="text-slate-400 flex items-center gap-2 text-[11px]">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>
                HI-SCORE: <strong className="text-amber-300 font-bold">{stats.highScore.toLocaleString()}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>
                KEYS: <strong className="text-amber-300">{stats.keys}</strong>
              </span>
            </div>
          </div>

          {/* Health Bar Marquee */}
          <div className="mb-3 px-1 flex items-center gap-3">
            <div className="flex items-center gap-1 text-rose-400 text-xs font-mono font-bold">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>HP</span>
            </div>
            <div className="flex-1 h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  hpPercent > 50
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : hpPercent > 25
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono text-slate-300 font-bold">
              {stats.hp}/{stats.maxHp}
            </span>
          </div>

          {/* High-Performance Canvas */}
          <PixelDungeonCanvas
            gameState={gameState}
            onGameStateChange={setGameState}
            onStatsUpdate={setStats}
            externalControls={externalControls}
            stepTrigger={stepTrigger}
            lastStepDir={lastStepDir}
            crtEnabled={crtEnabled}
          />

          {/* Equipment & Telemetry Strip */}
          <div className="mt-3 grid grid-cols-4 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px] font-mono">
            {/* Weapon */}
            <div className="flex flex-col">
              <span className="text-slate-500 text-[9px]">WEAPON</span>
              <div className="flex items-center gap-1 text-sky-400 font-bold truncate">
                <Swords className="w-3 h-3 shrink-0" />
                <span className="truncate">{stats.weaponName}</span>
              </div>
              <span className="text-slate-400 text-[9px]">+{stats.attack} ATK</span>
            </div>

            {/* Armor */}
            <div className="flex flex-col">
              <span className="text-slate-500 text-[9px]">ARMOR</span>
              <div className="flex items-center gap-1 text-indigo-400 font-bold truncate">
                <Shield className="w-3 h-3 shrink-0" />
                <span className="truncate">{stats.armorName}</span>
              </div>
              <span className="text-slate-400 text-[9px]">+{stats.defense} DEF</span>
            </div>

            {/* Gold */}
            <div className="flex flex-col">
              <span className="text-slate-500 text-[9px]">GOLD</span>
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Coins className="w-3 h-3 shrink-0" />
                <span>{stats.coins}</span>
              </div>
              <span className="text-slate-400 text-[9px]">Score +{stats.score}</span>
            </div>

            {/* Enemies Slain */}
            <div className="flex flex-col">
              <span className="text-slate-500 text-[9px]">KILLS</span>
              <div className="flex items-center gap-1 text-rose-400 font-bold">
                <Skull className="w-3 h-3 shrink-0" />
                <span>{stats.enemiesDefeated}</span>
              </div>
              <span className="text-slate-400 text-[9px]">Monsters</span>
            </div>
          </div>

          {/* Bottom Action Bar: Restart, Start, etc. */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Run</span>
            </button>

            {gameState === 'start' && (
              <button
                type="button"
                onClick={() => setGameState('playing')}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-all cursor-pointer animate-pulse"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>ENTER CRYPT</span>
              </button>
            )}

            <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
              Bump enemy to attack · WASD or D-Pad
            </div>
          </div>

          {/* Dedicated On-Screen Mobile Touch Controls */}
          <div className="mt-4 pt-3 border-t border-slate-800/60 block sm:hidden">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest text-center mb-1">
              Touch Controls · Press & Hold Supported
            </div>
            <MobileControls
              onControlChange={handleControlChange}
              onStep={handleMobileStep}
              disabled={gameState === 'floor-transition'}
            />
          </div>
        </div>

        {/* Feature Cards / Game Lore */}
        <div className="w-full max-w-xl mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
            <div className="text-amber-400 font-bold flex items-center gap-1.5 mb-1">
              <Footprints className="w-3.5 h-3.5" />
              <span>PROCEDURAL MAZES</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Every floor features randomized room layouts, corridors, locked doors, and hidden secrets.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
            <div className="text-sky-400 font-bold flex items-center gap-1.5 mb-1">
              <Swords className="w-3.5 h-3.5" />
              <span>TURN-BASED COMBAT</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Monsters only move when you move. Bump into enemies to strike and upgrade equipment.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
            <div className="text-emerald-400 font-bold flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FOG OF WAR</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Torchlight illuminates nearby chambers. Visited corridors remain mapped in memory.
            </p>
          </div>
        </div>
      </main>

      {/* How to Play Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-5 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>HOW TO PLAY PIXEL DUNGEON</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-slate-300">
              <div>
                <strong className="text-amber-300 block mb-1">🎮 CONTROLS:</strong>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                  <li><span className="text-slate-200">WASD / Arrow Keys</span>: Move 1 tile or bump enemy to attack.</li>
                  <li><span className="text-slate-200">Space / E / Strike Button</span>: Strike facing direction.</li>
                  <li><span className="text-slate-200">Z / Period / Wait Button</span>: Pass turn / rest to let enemies approach.</li>
                  <li><span className="text-slate-200">Mobile</span>: On-screen D-pad and action buttons with press & hold.</li>
                </ul>
              </div>

              <div>
                <strong className="text-amber-300 block mb-1">🛡️ ITEMS & UPGRADES:</strong>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                  <li><span className="text-rose-400">❤️ Potion</span>: Restores +28 Health Points.</li>
                  <li><span className="text-sky-400">⚔️ Weapon</span>: Upgrades blade and boosts ATK damage.</li>
                  <li><span className="text-indigo-400">🛡️ Armor</span>: Upgrades defense shield and reduces damage.</li>
                  <li><span className="text-amber-400">🗝️ Key</span>: Unlocks heavy iron doors.</li>
                  <li><span className="text-amber-300">💰 Gold</span>: Adds bonus score and wealth.</li>
                </ul>
              </div>

              <div>
                <strong className="text-amber-300 block mb-1">💀 BESTIARY:</strong>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                  <li><span className="text-emerald-400">Goblin</span>: Balanced health and medium dagger strikes.</li>
                  <li><span className="text-purple-400">Bat</span>: Fast and agile, can flutter double steps.</li>
                  <li><span className="text-slate-200">Skeleton</span>: Sturdy bone armor, hits hard with scythe.</li>
                </ul>
              </div>

              <div>
                <strong className="text-amber-300 block mb-1">🚪 DUNGEON OBJECTIVE:</strong>
                <p className="text-[11px] text-slate-400">
                  Find the stairs (<span className="text-sky-400">▼</span>) to descend into deeper crypts. Each floor gets progressively more perilous!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-colors"
            >
              GOT IT, LET'S CRAWL!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
