import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Tv,
  HelpCircle,
  Trophy,
  Shield,
  Zap,
  Bomb,
  Flame,
  Crosshair,
  Skull,
  Gamepad2,
  Car,
  Radio,
} from 'lucide-react';
import { ZombieCanvas } from './ZombieCanvas';
import { MobileControls } from './MobileControls';
import { zombieAudio } from './audio';
import type { ZombieGameState, KeyControls, ZombieGameStats } from './types';

interface ZombieGamePageProps {
  onBack: () => void;
  onSwitchGame?: (gameId: string) => void;
}

export const ZombieGamePage: React.FC<ZombieGamePageProps> = ({ onBack, onSwitchGame }) => {
  const [gameState, setGameState] = useState<ZombieGameState>('start');
  const [isMuted, setIsMuted] = useState<boolean>(() => zombieAudio.isMuted());
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Live score stats from canvas
  const [stats, setStats] = useState<ZombieGameStats>({
    score: 0,
    highScore: 0,
    wave: 1,
    kills: 0,
    timeSurvived: 0,
    health: 100,
    maxHealth: 100,
    weapon: 'pistol',
    weaponTimeRemaining: 0,
  });

  // Mobile / External controls
  const [externalControls, setExternalControls] = useState<KeyControls>({
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
  });

  useEffect(() => {
    // Initial mute sync
    setIsMuted(zombieAudio.isMuted());

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Set page title for SEO & tab
    const prevTitle = document.title;
    document.title = 'Zombie Survival — Top-Down Retro Arcade | Shubham Sonale';

    const handleClearInputs = () => {
      setExternalControls({
        up: false,
        down: false,
        left: false,
        right: false,
        attack: false,
      });
    };

    window.addEventListener('blur', handleClearInputs);
    const handleVisChange = () => {
      if (document.hidden) handleClearInputs();
    };
    document.addEventListener('visibilitychange', handleVisChange);

    return () => {
      document.title = prevTitle;
      window.removeEventListener('blur', handleClearInputs);
      document.removeEventListener('visibilitychange', handleVisChange);
    };
  }, []);

  const handleToggleMute = () => {
    const next = zombieAudio.toggleMute();
    setIsMuted(next);
  };

  const handleControlChange = (key: keyof KeyControls, pressed: boolean) => {
    setExternalControls((prev) => ({ ...prev, [key]: pressed }));
  };

  const handlePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  };

  const handleRestart = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR' }));
  };

  const handleTriggerBomb = () => {
    const trigger = (window as unknown as { triggerZombieNuke?: () => void }).triggerZombieNuke;
    if (trigger) trigger();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
      {/* Top Arcade Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 sm:py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Back to Portfolio */}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit to Portfolio</span>
            <span className="sm:hidden">Exit</span>
          </button>

          {/* Center Brand Title */}
          <div className="flex items-center gap-2">
            <Skull className="w-5 h-5 text-emerald-500 animate-pulse hidden sm:inline" />
            <h1
              className="text-xs sm:text-base font-black tracking-wider text-emerald-400"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              ZOMBIE SURVIVAL
            </h1>
            <span className="hidden md:inline text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              RETRO '89
            </span>
          </div>

          {/* Quick Controls: Switch Game, Mute, CRT, Help */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onSwitchGame && (
              <button
                type="button"
                onClick={() => onSwitchGame('retro-racer')}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-rose-800/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900/40 transition-colors"
                title="Switch to Retro Racer"
              >
                <Car className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px]">Racer</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-2 rounded-lg text-xs border transition-colors ${
                isMuted
                  ? 'bg-slate-900 border-slate-800 text-slate-500'
                  : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/40'
              }`}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => setCrtEnabled(!crtEnabled)}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                crtEnabled
                  ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-400'
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

      {/* Arcade Games Launcher Bar (Seamless switching between games) */}
      <div className="bg-slate-900/60 border-b border-slate-800/60 px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
            <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
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
              onClick={() => onSwitchGame && onSwitchGame('zombie-survival')}
              className="px-3 py-1 rounded-lg font-mono text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.3)] flex items-center gap-1.5"
            >
              <Skull className="w-3 h-3 text-emerald-400" />
              <span>Zombie Survival</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchGame && onSwitchGame('pixel-dungeon')}
              className="px-3 py-1 rounded-lg font-mono text-[11px] font-semibold bg-slate-900 text-slate-400 hover:text-amber-400 hover:bg-slate-850 border border-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3 h-3" />
              <span>Pixel Dungeon</span>
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
              <span>ARENA SURVIVAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Arcade Experience Frame */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 sm:py-7 flex flex-col items-center justify-center">
        {/* Arcade Cabinet Exterior Frame */}
        <div className="relative w-full max-w-xl mx-auto bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-3 sm:p-5 border-2 border-slate-800 shadow-[0_0_50px_rgba(16,185,129,0.12)]">
          {/* Top Marquee Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 px-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold tracking-widest text-[10px]">WAVE {stats.wave}</span>
            </div>

            <div className="text-slate-400 flex items-center gap-2 text-[11px]">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>HI-SCORE: <strong className="text-amber-300 font-bold">{stats.highScore.toLocaleString()}</strong></span>
            </div>

            <div className="flex items-center gap-1 text-slate-400 text-[11px]">
              <Skull className="w-3.5 h-3.5 text-rose-400" />
              <span>KILLS: <strong className="text-slate-200">{stats.kills}</strong></span>
            </div>
          </div>

          {/* High-Performance 60FPS Game Canvas */}
          <ZombieCanvas
            gameState={gameState}
            onGameStateChange={setGameState}
            onStatsUpdate={setStats}
            externalControls={externalControls}
            crtEnabled={crtEnabled}
          />

          {/* Arcade Touch Controls (Directly below canvas inside cabinet) */}
          <div className="w-full mt-3">
            <MobileControls
              controls={externalControls}
              onControlChange={handleControlChange}
              onPause={handlePause}
              onRestart={handleRestart}
              gameState={gameState}
              onBomb={handleTriggerBomb}
            />
          </div>

          {/* Cabinet Bottom Coin Slot & Speaker Grilles */}
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between px-2 text-slate-500 text-[11px] font-mono">
            <div className="flex items-center gap-1">
              <span className="inline-block w-8 h-1 bg-slate-800 rounded-full" />
              <span className="inline-block w-8 h-1 bg-slate-800 rounded-full" />
              <span className="inline-block w-8 h-1 bg-slate-800 rounded-full" />
            </div>

            <span className="text-[10px] text-slate-500 tracking-wider">QUARANTINE ZONE · INSERT COIN</span>

            <div className="flex items-center gap-1">
              <span className="inline-block w-8 h-1 bg-slate-800 rounded-full" />
              <span className="inline-block w-8 h-1 bg-slate-800 rounded-full" />
              <span className="inline-block w-8 h-1 bg-slate-800 rounded-full" />
            </div>
          </div>
        </div>

        {/* Feature Grid: Weapon Arsenal & Survival Items */}
        <div className="w-full max-w-xl mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {/* Shotgun */}
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-950/60 border border-orange-800/50 text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-[11px]">Shotgun</p>
              <p className="text-[10px] text-slate-400">5-pellet spread</p>
            </div>
          </div>

          {/* Machine Gun */}
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-950/60 border border-sky-800/50 text-sky-400">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-[11px]">Machine Gun</p>
              <p className="text-[10px] text-slate-400">High rate of fire</p>
            </div>
          </div>

          {/* Medkit */}
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-[11px]">Medkit</p>
              <p className="text-[10px] text-slate-400">+35 HP Restore</p>
            </div>
          </div>

          {/* Tactical Nuke */}
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-800/50 text-rose-400">
              <Bomb className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-[11px]">Tactical Nuke</p>
              <p className="text-[10px] text-slate-400">Clears arena</p>
            </div>
          </div>
        </div>

        {/* Live Session Telemetry */}
        <div className="w-full max-w-xl mt-4 p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Active Weapon: <strong className="text-slate-200 uppercase">{stats.weapon}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span>Time Survived: <strong className="text-slate-200">{stats.timeSurvived}s</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span>Current Score: <strong className="text-amber-300">{stats.score.toLocaleString()}</strong></span>
          </div>
        </div>
      </main>

      {/* How to Play Modal */}
      {showHelpModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h2
                className="text-sm font-bold text-emerald-400 flex items-center gap-2"
                style={{ fontFamily: "'Press Start 2P', monospace" }}
              >
                HOW TO PLAY
              </h2>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono p-1"
              >
                [CLOSE ✕]
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div>
                <p className="font-bold text-slate-100 mb-1">🎮 Desktop Keyboard Controls:</p>
                <ul className="space-y-1 font-mono text-[11px] text-slate-400 pl-2">
                  <li>• <strong className="text-emerald-400">WASD / Arrow Keys</strong> : Move survivor in 8 directions</li>
                  <li>• <strong className="text-amber-400">Space / J / Mouse Click</strong> : Fire weapon</li>
                  <li>• <strong className="text-cyan-400">Mouse Cursor</strong> : Aim flashlight & crosshair</li>
                  <li>• <strong className="text-white">P</strong> : Pause / Resume</li>
                  <li>• <strong className="text-rose-400">R</strong> : Quick Restart</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-slate-100 mb-1">📱 Mobile Touch Controls:</p>
                <ul className="space-y-1 font-mono text-[11px] text-slate-400 pl-2">
                  <li>• <strong className="text-emerald-400">Left D-Pad</strong> : Move (press & hold)</li>
                  <li>• <strong className="text-rose-400">Right FIRE Button</strong> : Continuous rapid fire</li>
                  <li>• <strong className="text-amber-400">Touch Arena</strong> : Tap anywhere on canvas to aim & fire</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-slate-100 mb-1">☣ Undead Threat Levels:</p>
                <p className="text-slate-400 text-[11px]">
                  • <strong className="text-emerald-400">Walkers</strong>: Standard undead (100 pts)<br />
                  • <strong className="text-rose-400">Runners</strong>: Fast crimson sprinters (150 pts)<br />
                  • <strong className="text-purple-400">Tanks</strong>: Armored hulks with high health (350 pts)<br />
                  • <strong className="text-yellow-400">Crawlers</strong>: Sneaky low ambushers (120 pts)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-mono text-xs font-bold transition-colors"
            >
              ENTER ARENA
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 border-t border-slate-900 text-center text-xs text-slate-500 font-mono">
        <p>Zombie Survival '89 · Crafted with HTML5 Canvas & Web Audio API</p>
      </footer>
    </div>
  );
};
