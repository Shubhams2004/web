import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Tv,
  HelpCircle,
  Trophy,
  Zap,
  Shield,
  Star,
  Gamepad2,
  Flame,
} from 'lucide-react';
import { RetroRacerCanvas } from './RetroRacerCanvas';
import { MobileControls } from './MobileControls';
import { audio } from './audio';
import type { GameState, KeyControls, GameScoreSnapshot } from './gameTypes';

interface RetroGamePageProps {
  onBack: () => void;
}

export const RetroGamePage: React.FC<RetroGamePageProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<GameState>('start');
  const [isMuted, setIsMuted] = useState<boolean>(() => audio.isMuted());
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Live Score stats reported from canvas
  const [stats, setStats] = useState<GameScoreSnapshot>({
    score: 0,
    highScore: 0,
    speed: 0,
    distance: 0,
    nearMisses: 0,
    carsOvertaken: 0,
    powerUpsCollected: 0,
  });

  // Mobile / External controls state
  const [externalControls, setExternalControls] = useState<KeyControls>({
    left: false,
    right: false,
    accelerate: false,
    brake: false,
  });

  // Check if touch device
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  useEffect(() => {
    // Detect touch capability
    const hasTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    setIsTouchDevice(hasTouch);

    // Initial mute sync
    setIsMuted(audio.isMuted());

    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Set page title for SEO & Browser tab
    const prevTitle = document.title;
    document.title = 'Retro Racer — 80s Arcade Highway Pursuit | Shubham Sonale';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  const handleToggleMute = () => {
    const newMuted = audio.toggleMute();
    setIsMuted(newMuted);
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
    // Canvas handles 'R' key or restart trigger
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR' }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 selection:text-white flex flex-col">
      {/* Top Arcade Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Back to Home / Portfolio */}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit to Portfolio</span>
          </button>

          {/* Center Brand / Logo */}
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-rose-500 animate-pulse hidden sm:inline" />
            <h1
              className="text-sm sm:text-base font-black tracking-wider text-rose-500"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              RETRO RACER
            </h1>
            <span className="hidden md:inline text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
              ARCADE '89
            </span>
          </div>

          {/* Quick Controls: Audio, CRT, Help */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-2 rounded-lg text-xs border transition-colors ${
                isMuted
                  ? 'bg-slate-900 border-slate-800 text-slate-500'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-400 hover:bg-rose-900/40'
              }`}
              title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
              aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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

      {/* Main Arcade Experience */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 sm:py-8 flex flex-col items-center justify-center">
        {/* Arcade Cabinet Exterior Frame */}
        <div className="relative w-full max-w-xl mx-auto bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-3 sm:p-5 border-2 border-slate-800 shadow-[0_0_50px_rgba(225,29,72,0.15)]">
          {/* Top Arcade Marquee Badge */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 px-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="font-bold tracking-widest text-[10px]">INSERT COIN</span>
            </div>
            <div className="text-slate-400 flex items-center gap-2 text-[11px]">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>RECORD: <strong className="text-amber-300 font-bold">{stats.highScore}</strong></span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-slate-500 text-[10px]">
              <span>CREDIT 01</span>
            </div>
          </div>

          {/* High Performance 60FPS Game Canvas */}
          <RetroRacerCanvas
            gameState={gameState}
            onGameStateChange={setGameState}
            onScoreUpdate={setStats}
            externalControls={externalControls}
            crtEnabled={crtEnabled}
          />

          {/* Cabinet Bottom Coin Slot & Speaker Grilles */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between px-2 text-slate-500 text-[11px] font-mono">
            <div className="flex items-center gap-1">
              <span className="inline-block w-8 h-1 bg-slate-800 rounded-full" />
              <span className="inline-block w-8 h-1 bg-slate-800 rounded-full" />
              <span className="inline-block w-8 h-1 bg-slate-800 rounded-full" />
            </div>

            <span className="text-[10px] text-slate-500 tracking-wider">25¢ TO PLAY</span>

            <div className="flex items-center gap-1">
              <span className="inline-block w-8 h-1 bg-slate-800 rounded-full" />
              <span className="inline-block w-8 h-1 bg-slate-800 rounded-full" />
              <span className="inline-block w-8 h-1 bg-slate-800 rounded-full" />
            </div>
          </div>
        </div>

        {/* Mobile On-Screen Touch Controls (Always ready for touch users) */}
        <div className="w-full mt-4">
          <MobileControls
            controls={externalControls}
            onControlChange={handleControlChange}
            onPause={handlePause}
            onRestart={handleRestart}
            gameState={gameState}
          />
        </div>

        {/* Arcade Feature Grid: Power-ups & Controls Summary */}
        <div className="w-full max-w-xl mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Turbo Card */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-950/60 border border-sky-800/50 text-sky-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-xs">Turbo Boost</p>
              <p className="text-[11px] text-slate-400">Temporary supersonic speed & ramming</p>
            </div>
          </div>

          {/* Shield Card */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-xs">Force Shield</p>
              <p className="text-[11px] text-slate-400">Absorbs 1 collision impact safely</p>
            </div>
          </div>

          {/* Star Card */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-950/60 border border-pink-800/50 text-pink-400">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-xs">Score Multiplier</p>
              <p className="text-[11px] text-slate-400">2X points for all overtakes & distance</p>
            </div>
          </div>
        </div>

        {/* Live Session Telemetry & High Score Snapshot */}
        <div className="w-full max-w-xl mt-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Session Overtakes: <strong className="text-slate-200">{stats.carsOvertaken}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>Near Misses: <strong className="text-amber-300">+{stats.nearMisses * 150} pts</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>Power-ups: <strong className="text-sky-400">{stats.powerUpsCollected}</strong></span>
          </div>
        </div>
      </main>

      {/* Retro Instructions / How to Play Modal */}
      {showHelpModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="bg-slate-900 border-2 border-rose-500/80 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h2
                className="text-sm font-bold text-rose-500 flex items-center gap-2"
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
                  <li>• <strong className="text-cyan-400">← / A</strong> : Steer Left</li>
                  <li>• <strong className="text-cyan-400">→ / D</strong> : Steer Right</li>
                  <li>• <strong className="text-amber-400">↑ / W</strong> : Accelerate (push top speed)</li>
                  <li>• <strong className="text-red-400">↓ / S</strong> : Brake (avoid tight pileups)</li>
                  <li>• <strong className="text-white">Space</strong> : Pause / Resume</li>
                  <li>• <strong className="text-white">R</strong> : Quick Restart</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-slate-100 mb-1">📱 Mobile & Touch Controls:</p>
                <p className="text-slate-400 text-[11px]">
                  Use the large on-screen steering pads and gas/brake buttons. Multi-touch is supported!
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-100 mb-1">⭐ Scoring & Combos:</p>
                <p className="text-slate-400 text-[11px]">
                  Pass cars closely to trigger <strong>Near Miss (+150 pts)</strong> bonuses. Maintain 100+ MPH for high-speed score bonuses, and grab glowing power-ups for shields, turbo, and 2X score multipliers!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="mt-6 w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-mono text-xs font-bold transition-colors"
            >
              START DRIVING
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 border-t border-slate-900 text-center text-xs text-slate-500 font-mono">
        <p>Retro Racer '89 · Crafted with HTML5 Canvas & Web Audio API</p>
      </footer>
    </div>
  );
};
