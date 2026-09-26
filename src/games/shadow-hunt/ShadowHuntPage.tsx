import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Target,
  Shield,
  Award,
  Play,
  Crosshair,
  Footprints,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Skull,
  HelpCircle,
  X,
} from 'lucide-react';
import { ShadowHuntCanvas } from './ShadowHuntCanvas';
import { ShadowHuntHUD } from './ShadowHuntHUD';
import { shadowAudio } from './audio';
import { ShadowHuntGameState, MissionStats } from './types';
import { LEVEL_01 } from './levelData';

interface ShadowHuntPageProps {
  onBack: () => void;
  onSwitchGame?: (gameId: string) => void;
}

export const ShadowHuntPage: React.FC<ShadowHuntPageProps> = ({
  onBack,
  onSwitchGame,
}) => {
  const [gameState, setGameState] = useState<ShadowHuntGameState>('briefing');
  const [isMuted, setIsMuted] = useState<boolean>(() => shadowAudio.isMuted());
  const [showDossier, setShowDossier] = useState<boolean>(false);
  const [keyResetCounter, setKeyResetCounter] = useState<number>(0);

  const [stats, setStats] = useState<MissionStats>({
    targetsTotal: 3,
    targetsEliminated: 0,
    intelCollected: 0,
    intelTotal: 2,
    alarmsTriggered: 0,
    timeSeconds: 0,
    stealthScore: 1000,
    rank: 'S',
  });

  const handleToggleMute = useCallback(() => {
    const next = shadowAudio.toggleMute();
    setIsMuted(next);
  }, []);

  const handleStartMission = () => {
    shadowAudio.userInteracted();
    shadowAudio.playDash();
    setGameState('playing');
  };

  const handleRestart = useCallback(() => {
    shadowAudio.userInteracted();
    setStats({
      targetsTotal: 3,
      targetsEliminated: 0,
      intelCollected: 0,
      intelTotal: 2,
      alarmsTriggered: 0,
      timeSeconds: 0,
      stealthScore: 1000,
      rank: 'S',
    });
    setKeyResetCounter((c) => c + 1);
    setGameState('playing');
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none selection:bg-blue-900 selection:text-blue-100">
      {/* Top Header Bar */}
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

            {/* Game Title */}
            <div className="flex items-center gap-2">
              <span className="text-xl">🗡️</span>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white tracking-tight leading-tight">
                  Shadow Hunt
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  Tactical Stealth Infiltration · Touch-First
                </span>
              </div>
            </div>
          </div>

          {/* Quick Game Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              className="px-2.5 py-1 rounded-lg font-bold bg-blue-600 text-white shadow-xs"
            >
              Shadow Hunt
            </button>
            <button
              type="button"
              onClick={() => onSwitchGame && onSwitchGame('pixel-dungeon')}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer hidden sm:inline"
            >
              Pixel Dungeon
            </button>
            <button
              type="button"
              onClick={() => onSwitchGame && onSwitchGame('zombie-survival')}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer hidden md:inline"
            >
              Zombie Survival
            </button>
            <button
              type="button"
              onClick={() => onSwitchGame && onSwitchGame('retro-racer')}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer hidden lg:inline"
            >
              Retro Racer
            </button>

            <button
              type="button"
              onClick={() => setShowDossier(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
              title="Mission Briefing & Field Manual"
              aria-label="Mission Briefing"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Stage Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 md:p-6 flex flex-col gap-3 relative">
        {/* Minimal HUD Bar */}
        <ShadowHuntHUD
          stats={stats}
          gameState={gameState}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onRestart={handleRestart}
        />

        {/* Canvas Game Stage */}
        <div className="relative flex-1 w-full min-h-[460px] sm:min-h-[580px] md:min-h-[640px]">
          <ShadowHuntCanvas
            key={`canvas-${keyResetCounter}`}
            gameState={gameState}
            onGameStateChange={setGameState}
            onUpdateStats={setStats}
            onRestart={handleRestart}
            isMuted={isMuted}
          />

          {/* Mission Briefing Overlay */}
          {gameState === 'briefing' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-2xl flex items-center justify-center p-4 z-20 animate-fade-in">
              <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl text-center space-y-5">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-3xl shadow-lg">
                  🗡️
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono tracking-widest text-blue-400 uppercase">
                    {LEVEL_01.codeName}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {LEVEL_01.name}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    {LEVEL_01.briefing}
                  </p>
                </div>

                {/* Tactical Objectives Checklist */}
                <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-left text-xs font-mono space-y-2 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Eliminate 3 VIP Target Enforcers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Avoid Vision Cones & Security Alarms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Reach Sector North-East Extraction</span>
                  </div>
                </div>

                {/* Touch-First Control Tip */}
                <div className="text-[11px] text-slate-400 bg-blue-950/40 border border-blue-900/60 rounded-xl p-2.5 text-center">
                  Touch & drag anywhere to guide the assassin. Tap targets in range to strike.
                </div>

                <button
                  type="button"
                  onClick={handleStartMission}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-900/30 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Begin Infiltration</span>
                </button>
              </div>
            </div>
          )}

          {/* Mission Failed Overlay */}
          {gameState === 'failed' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex items-center justify-center p-4 z-20 animate-fade-in">
              <div className="max-w-sm w-full bg-slate-900 border border-rose-900/80 rounded-2xl p-6 sm:p-7 shadow-2xl text-center space-y-5">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 text-2xl shadow-lg">
                  <Skull className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono tracking-widest text-rose-400 uppercase">
                    COMPROMISED // STATUS CRITICAL
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Mission Terminated
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    You were spotted and neutralized by facility guards. Utilize cover and flank behind patrol routes.
                  </p>
                </div>

                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-xs font-mono flex justify-between text-slate-400">
                  <span>Targets Eliminated:</span>
                  <span className="text-white font-bold">{stats.targetsEliminated}/3</span>
                </div>

                <button
                  type="button"
                  onClick={handleRestart}
                  className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-900/30 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Mission</span>
                </button>
              </div>
            </div>
          )}

          {/* Mission Accomplished (Victory) Overlay */}
          {gameState === 'victory' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex items-center justify-center p-4 z-20 animate-fade-in">
              <div className="max-w-md w-full bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-2xl shadow-lg">
                  <Award className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase">
                    EXTRACTION SUCCESSFUL // ASSET SECURED
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Mission Accomplished
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    All high-value targets eliminated. Clean extraction confirmed by HQ.
                  </p>
                </div>

                {/* Debrief Performance Metrics */}
                <div className="grid grid-cols-2 gap-2.5 bg-slate-950 rounded-xl p-3.5 border border-slate-800 text-xs font-mono">
                  <div className="text-left p-2 rounded-lg bg-slate-900/60">
                    <span className="text-slate-500 text-[10px] block">STEALTH RANK</span>
                    <span className="text-xl font-bold text-emerald-400">RANK {stats.rank}</span>
                  </div>
                  <div className="text-left p-2 rounded-lg bg-slate-900/60">
                    <span className="text-slate-500 text-[10px] block">MISSION SCORE</span>
                    <span className="text-xl font-bold text-cyan-400">{stats.stealthScore}</span>
                  </div>
                  <div className="text-left p-2 rounded-lg bg-slate-900/60">
                    <span className="text-slate-500 text-[10px] block">MISSION TIME</span>
                    <span className="text-slate-200 font-bold">{Math.round(stats.timeSeconds)}s</span>
                  </div>
                  <div className="text-left p-2 rounded-lg bg-slate-900/60">
                    <span className="text-slate-500 text-[10px] block">INTEL RECOVERED</span>
                    <span className="text-emerald-300 font-bold">{stats.intelCollected}/{stats.intelTotal}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Play Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={onBack}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all cursor-pointer"
                  >
                    Return Home
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Field Manual / Dossier Modal */}
      {showDossier && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-white text-base">Field Manual: Shadow Hunt</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDossier(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-blue-400">Touch & Drag Movement:</span>
                <p className="text-slate-400">
                  Touch and drag anywhere on the screen to direct your operative. Movement accelerates smoothly toward your pointer.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-cyan-400">Assassination Takedowns:</span>
                <p className="text-slate-400">
                  Approach behind guards without entering their vision cone. When within strike range, tap the target to execute a lethal shadow strike.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400">Vision Cones & Line-of-Sight:</span>
                <p className="text-slate-400">
                  Walls, server racks, and cargo crates block enemy vision. If spotted, duck behind a corner immediately to break line-of-sight before full alert.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400">Extraction Phase:</span>
                <p className="text-slate-400">
                  Once all 3 VIP target officers are eliminated, the extraction lift at Sector North-East activates. Reach the green perimeter to complete the mission.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDossier(false)}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Close Manual
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
