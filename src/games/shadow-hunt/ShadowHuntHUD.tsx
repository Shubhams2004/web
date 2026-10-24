import React from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Target,
  ShieldAlert,
  Clock,
  FileText,
  DoorOpen,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { MissionStats, ShadowHuntGameState } from './types';

interface ShadowHuntHUDProps {
  stats: MissionStats;
  gameState: ShadowHuntGameState;
  isMuted: boolean;
  onToggleMute: () => void;
  onRestart: () => void;
}

export const ShadowHuntHUD: React.FC<ShadowHuntHUDProps> = ({
  stats,
  gameState,
  isMuted,
  onToggleMute,
  onRestart,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isExtractionReady = stats.targetsEliminated >= stats.targetsTotal;
  const isCompromised = stats.alarmsTriggered > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-slate-900/95 border border-slate-800 rounded-xl backdrop-blur-md text-xs font-mono text-slate-300 shadow-lg">
      {/* Primary Objectives Indicators */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* VIP Targets */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/80 shadow-xs">
          <Target className={`w-3.5 h-3.5 ${isExtractionReady ? 'text-emerald-400' : 'text-rose-400'}`} />
          <span className="font-bold text-slate-100">
            {stats.targetsEliminated}/{stats.targetsTotal}
          </span>
          <span className="text-[10px] text-slate-400 uppercase hidden sm:inline">VIPs</span>
        </div>

        {/* Intel recovered count */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/80 text-slate-300">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-slate-100">
            {stats.intelCollected}/{stats.intelTotal}
          </span>
          <span className="text-[10px] text-slate-400 uppercase hidden sm:inline">Intel</span>
        </div>

        {/* Extraction status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold transition-all ${
            isExtractionReady
              ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse'
              : 'bg-slate-850/80 border-slate-800 text-slate-500'
          }`}
        >
          <DoorOpen className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold">
            {isExtractionReady ? 'EXTRACTION OPEN' : 'DOOR LOCKED'}
          </span>
        </div>
      </div>

      {/* Center Stealth Awareness Status */}
      <div className="hidden lg:flex items-center">
        {isCompromised ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs font-bold animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>ALERT ACTIVE (x{stats.alarmsTriggered})</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>STEALTH: 100% CONCEALED</span>
          </div>
        )}
      </div>

      {/* Right Controls & Telemetry */}
      <div className="flex items-center gap-2.5">
        {/* Timer */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-800 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold">{formatTime(stats.timeSeconds)}</span>
        </div>

        {/* Score */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-800 text-cyan-400 font-bold">
          <span>{stats.stealthScore} PTS</span>
        </div>

        {/* Mute Button */}
        <button
          type="button"
          onClick={onToggleMute}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
          title={isMuted ? 'Unmute tactical audio' : 'Mute tactical audio'}
          aria-label={isMuted ? 'Unmute tactical audio' : 'Mute tactical audio'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
        </button>

        {/* Restart Button */}
        <button
          type="button"
          onClick={onRestart}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/60"
          title="Restart mission (R)"
          aria-label="Restart mission"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>
    </div>
  );
};
