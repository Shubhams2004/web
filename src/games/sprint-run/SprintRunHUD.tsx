import React from 'react';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Zap,
  HelpCircle,
  Trophy,
  Flame,
} from 'lucide-react';
import { GameScoreSnapshot, MilestoneEvent } from './types';

interface SprintRunHUDProps {
  stats: GameScoreSnapshot;
  isMuted: boolean;
  isPaused: boolean;
  milestoneNotice: MilestoneEvent | null;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onOpenHelp: () => void;
  onTriggerSprint: () => void;
}

export const SprintRunHUD: React.FC<SprintRunHUDProps> = ({
  stats,
  isMuted,
  isPaused,
  milestoneNotice,
  onToggleMute,
  onTogglePause,
  onRestart,
  onOpenHelp,
  onTriggerSprint,
}) => {
  const isSprintReady = stats.sprintEnergy >= 20;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none z-20">
      {/* Top HUD: Distance, Score, Coins, Action buttons */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: Primary Run Metrics */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {/* Main Distance and Score Cluster */}
          <div className="bg-slate-950/65 backdrop-blur-md border border-slate-800/80 rounded-xl px-3.5 py-2 shadow-lg flex items-center gap-4 text-white">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Distance
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono tabular-nums leading-tight text-white">
                {stats.distance}
                <span className="text-xs font-normal text-slate-400 ml-0.5">m</span>
              </span>
            </div>

            <div className="h-6 w-px bg-slate-800" aria-hidden="true" />

            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Score
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono tabular-nums leading-tight text-amber-400">
                {stats.score.toLocaleString()}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-800" aria-hidden="true" />

            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Coins
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono tabular-nums leading-tight text-yellow-300 flex items-center gap-1">
                <span>🪙</span>
                <span>{stats.coins}</span>
              </span>
            </div>
          </div>

          {/* Speed & Multiplier Indicator */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300 px-1">
            <span>Velocity:</span>
            <span className="text-emerald-400 font-bold tabular-nums">{stats.speedKmh} km/h</span>
            <span aria-hidden="true">·</span>
            {stats.multiplier > 1 ? (
              <span className="text-amber-400 font-bold animate-pulse">2× SPRINT BOOST</span>
            ) : (
              <span className="text-slate-400">1× Pace</span>
            )}
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="w-10 h-10 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
          </button>

          <button
            type="button"
            onClick={onTogglePause}
            aria-label={isPaused ? 'Resume Game' : 'Pause Game'}
            className="w-10 h-10 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-slate-300" />}
          </button>

          <button
            type="button"
            onClick={onRestart}
            aria-label="Restart Run"
            className="w-10 h-10 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-300" />
          </button>

          <button
            type="button"
            onClick={onOpenHelp}
            aria-label="View Controls & Tips"
            className="w-10 h-10 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Center: Milestone Pop-In Notice */}
      {milestoneNotice && (
        <div className="self-center animate-bounce pointer-events-auto">
          <div className="bg-amber-500/90 text-slate-950 px-5 py-2.5 rounded-2xl shadow-2xl font-black font-sans text-sm sm:text-base tracking-wide border-2 border-amber-300 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            <span>{milestoneNotice.message}</span>
          </div>
        </div>
      )}

      {/* Bottom Area: Sprint Meter & Dedicated Thumb Sprint Button */}
      <div className="flex items-end justify-between gap-4 pointer-events-auto">
        {/* Left: Sprint Gauge Bar */}
        <div className="bg-slate-950/70 backdrop-blur-md border border-slate-800 rounded-xl p-3 w-48 sm:w-60 shadow-lg flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Sprint Boost</span>
            </span>
            <span className="text-slate-300 tabular-nums font-bold">
              {stats.sprintEnergy}%
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-150 ${
                stats.multiplier > 1
                  ? 'bg-gradient-to-r from-amber-400 to-cyan-400 animate-pulse'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-400'
              }`}
              style={{ width: `${stats.sprintEnergy}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {stats.multiplier > 1 ? '⚡ Super Sprint Active' : 'Double tap or Shift to boost'}
          </span>
        </div>

        {/* Right: Quick-Tap Sprint Booster Button (Mobile thumb reach) */}
        <button
          type="button"
          onClick={onTriggerSprint}
          disabled={!isSprintReady && stats.multiplier === 1}
          className={`group flex items-center gap-2.5 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl shadow-xl font-bold font-mono text-xs sm:text-sm tracking-wide transition-all cursor-pointer active:scale-95 border ${
            stats.multiplier > 1
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 shadow-amber-500/30'
              : isSprintReady
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400 shadow-cyan-600/30'
              : 'bg-slate-900/80 text-slate-500 border-slate-800 opacity-60 cursor-not-allowed'
          }`}
        >
          <Flame
            className={`w-5 h-5 ${
              stats.multiplier > 1 ? 'animate-bounce text-slate-950' : 'text-cyan-200'
            }`}
          />
          <span>{stats.multiplier > 1 ? 'BOOSTING!' : 'SPRINT'}</span>
        </button>
      </div>
    </div>
  );
};
