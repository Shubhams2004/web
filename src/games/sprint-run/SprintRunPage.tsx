import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Trophy,
  Zap,
  HelpCircle,
  X,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Flame,
  Gamepad2,
  Compass,
  Sparkles,
} from 'lucide-react';
import { SprintRunCanvas } from './SprintRunCanvas';
import { SprintRunHUD } from './SprintRunHUD';
import { sprintAudio } from './audio';
import { GameState, GameScoreSnapshot, MilestoneEvent } from './types';

interface SprintRunPageProps {
  onBack: () => void;
  onSwitchGame?: (gameId: string) => void;
}

const STORAGE_KEY_HIGH_SCORE = 'sprint_run_high_score';
const STORAGE_KEY_BEST_DISTANCE = 'sprint_run_best_distance';

export const SprintRunPage: React.FC<SprintRunPageProps> = ({
  onBack,
  onSwitchGame,
}) => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [isMuted, setIsMuted] = useState<boolean>(() => sprintAudio.isMuted());
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [milestoneNotice, setMilestoneNotice] = useState<MilestoneEvent | null>(null);
  const [requestSprintTrigger, setRequestSprintTrigger] = useState<boolean>(false);

  // High score persistence
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY_HIGH_SCORE) || '0', 10);
    } catch {
      return 0;
    }
  });

  const [bestDistance, setBestDistance] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY_BEST_DISTANCE) || '0', 10);
    } catch {
      return 0;
    }
  });

  // Live HUD metrics
  const [stats, setStats] = useState<GameScoreSnapshot>({
    score: 0,
    distance: 0,
    coins: 0,
    highScore: 0,
    bestDistance: 0,
    sprintEnergy: 60,
    speedKmh: 65,
    multiplier: 1,
  });

  // Final run summary
  const [finalSummary, setFinalSummary] = useState<GameScoreSnapshot | null>(null);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Initialize page, title & cleanup
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const prevTitle = document.title;
    document.title = 'Sprint Run — 3D Jungle Temple Endless Runner | Shubham Sonale';

    setIsMuted(sprintAudio.isMuted());

    return () => {
      document.title = prevTitle;
    };
  }, []);

  const handleToggleMute = useCallback(() => {
    const next = sprintAudio.toggleMute();
    setIsMuted(next);
  }, []);

  const handleStartRun = () => {
    sprintAudio.userInteracted();
    sprintAudio.playJump();
    setIsNewRecord(false);
    setFinalSummary(null);
    setGameState('playing');
  };

  const handleRestart = useCallback(() => {
    sprintAudio.userInteracted();
    sprintAudio.playJump();
    setIsNewRecord(false);
    setFinalSummary(null);
    setGameState('playing');
  }, []);

  const handleTogglePause = useCallback(() => {
    sprintAudio.userInteracted();
    setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
  }, []);

  const handleGameOver = useCallback(
    (finalStats: GameScoreSnapshot) => {
      let isRecord = false;
      if (finalStats.score > highScore) {
        setHighScore(finalStats.score);
        try {
          localStorage.setItem(STORAGE_KEY_HIGH_SCORE, finalStats.score.toString());
        } catch {
          // ignore
        }
        isRecord = true;
      }

      if (finalStats.distance > bestDistance) {
        setBestDistance(finalStats.distance);
        try {
          localStorage.setItem(STORAGE_KEY_BEST_DISTANCE, finalStats.distance.toString());
        } catch {
          // ignore
        }
        isRecord = true;
      }

      setIsNewRecord(isRecord);
      setFinalSummary({
        ...finalStats,
        highScore: Math.max(highScore, finalStats.score),
        bestDistance: Math.max(bestDistance, finalStats.distance),
      });
      setGameState('gameover');
    },
    [highScore, bestDistance]
  );

  const handleScoreUpdate = useCallback(
    (liveStats: GameScoreSnapshot) => {
      setStats({
        ...liveStats,
        highScore,
        bestDistance,
      });
    },
    [highScore, bestDistance]
  );

  const handleMilestone = useCallback((event: MilestoneEvent) => {
    setMilestoneNotice(event);
    setTimeout(() => {
      setMilestoneNotice(null);
    }, 4000);
  }, []);

  const handleTriggerSprint = useCallback(() => {
    sprintAudio.userInteracted();
    setRequestSprintTrigger(true);
    setTimeout(() => setRequestSprintTrigger(false), 100);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Header Bar matching site contract */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Back Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            {/* Game Brand & Title */}
            <div className="flex items-center gap-2">
              <span className="text-xl">🏃‍♂️</span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm sm:text-base leading-tight">
                    Sprint Run
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-mono">
                    3D Endless Runner
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 leading-tight hidden sm:block">
                  Ancient Jungle Temple Expedition
                </span>
              </div>
            </div>
          </div>

          {/* Quick Game Switcher & Actions */}
          <div className="flex items-center gap-2">
            {onSwitchGame && (
              <div className="hidden md:flex items-center gap-1 text-xs">
                <span className="text-slate-500 mr-1">Other Games:</span>
                <button
                  type="button"
                  onClick={() => onSwitchGame('shadow-hunt')}
                  className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  Shadow Hunt
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchGame('pixel-dungeon')}
                  className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  Pixel Dungeon
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchGame('retro-racer')}
                  className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  Retro Racer
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleMute}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              title="Controls & Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main 3D Canvas Area */}
      <main className="relative flex-1 w-full min-h-[calc(100vh-53px)] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
        {/* Three.js Canvas */}
        <SprintRunCanvas
          gameState={gameState}
          onGameOver={handleGameOver}
          onScoreUpdate={handleScoreUpdate}
          onMilestone={handleMilestone}
          isMuted={isMuted}
          onRequestSprintToggle={requestSprintTrigger}
        />

        {/* Live HUD while playing or paused */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <SprintRunHUD
            stats={stats}
            isMuted={isMuted}
            isPaused={gameState === 'paused'}
            milestoneNotice={milestoneNotice}
            onToggleMute={handleToggleMute}
            onTogglePause={handleTogglePause}
            onRestart={handleRestart}
            onOpenHelp={() => setShowHelpModal(true)}
            onTriggerSprint={handleTriggerSprint}
          />
        )}

        {/* 1. START MENU OVERLAY */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center gap-5">
              {/* Game Badge & Title */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-4xl">🏃‍♂️💨</span>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Sprint Run
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xs">
                  Original 3D endless runner through the mysterious ancient jungle temple ruins.
                </p>
              </div>

              {/* Personal Bests Record Box */}
              <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 gap-4 text-left">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                    Best Distance
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                    {bestDistance}
                    <span className="text-xs text-slate-400 ml-1">m</span>
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                    High Score
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
                    {highScore.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Touch & Keyboard Controls Quick Guide */}
              <div className="w-full bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3.5 text-xs text-slate-300 flex flex-col gap-2 text-left font-mono">
                <div className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider">
                  Mobile Touch / Keyboard Controls:
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>• Swipe Left / Right : Switch Lane</div>
                  <div>• Swipe Up / Space : Jump</div>
                  <div>• Swipe Down / S : Slide Under</div>
                  <div>• Double Tap / Shift : Sprint Boost</div>
                </div>
              </div>

              {/* Primary Start CTA Button */}
              <button
                type="button"
                onClick={handleStartRun}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-base sm:text-lg tracking-wide shadow-lg shadow-emerald-900/40 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>START SPRINT RUN</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. PAUSE OVERLAY */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center gap-5">
              <span className="text-3xl">⏸️</span>
              <h2 className="text-2xl font-black text-white">Expedition Paused</h2>

              <div className="w-full flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleTogglePause}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Resume Run</span>
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Course</span>
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-medium text-xs transition-all cursor-pointer"
                >
                  Exit to Portfolio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. GAME OVER OVERLAY */}
        {gameState === 'gameover' && finalSummary && (
          <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center gap-5">
              {/* Header */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-4xl">💥</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Run Completed!
                </h2>
                {isNewRecord && (
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1 font-mono uppercase tracking-wider animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>New Personal Record Achieved!</span>
                  </span>
                )}
              </div>

              {/* Stats Grid */}
              <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 gap-3 text-left">
                <div className="bg-slate-900/60 p-2.5 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Distance
                  </span>
                  <span className="text-xl font-black font-mono text-white">
                    {finalSummary.distance}m
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Score
                  </span>
                  <span className="text-xl font-black font-mono text-amber-400">
                    {finalSummary.score.toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Gold Coins
                  </span>
                  <span className="text-xl font-black font-mono text-yellow-300">
                    🪙 {finalSummary.coins}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Best Distance
                  </span>
                  <span className="text-xl font-black font-mono text-emerald-400">
                    {bestDistance}m
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-base shadow-lg shadow-emerald-900/40 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>PLAY AGAIN</span>
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Back to Portfolio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. CONTROLS & TIPS MODAL */}
        {showHelpModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">How to Play Sprint Run</h3>
                  <p className="text-xs text-slate-400">Master the Ancient Jungle Ruins</p>
                </div>
              </div>

              {/* Maneuvers */}
              <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-cyan-400 shrink-0">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Lane Switching</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Swipe left or right (or press Left / Right arrows or A / D) to switch between the 3 lanes and evade ancient stone obelisks.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-emerald-400 shrink-0">
                    <ArrowUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Leaping & Jumping</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Swipe up (or Space / Up arrow / W) to leap over low fallen tree logs, broken platform chasms, and crumbling ground tiles.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-amber-400 shrink-0">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Sliding Under Traps</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Swipe down (or Down arrow / S) to slide under spiked stone arches and high swinging pendulums.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-red-400 shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">High-Speed Sprint Boost</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Double-tap anywhere on screen or press Shift / tap the Sprint button to trigger a supersonic sprint. Smashes minor barriers and doubles score points! Refill with green gems.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
