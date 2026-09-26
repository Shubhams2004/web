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
  Award,
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

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md text-xs font-mono text-slate-300">
      {/* Primary Objective Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
          <Target className={`w-3.5 h-3.5 ${isExtractionReady ? 'text-emerald-400' : 'text-rose-400'}`} />
          <span className="font-bold text-slate-100">
            {stats.targetsEliminated}/{stats.targetsTotal}
          </span>
          <span className="text-[10px] text-slate-400 uppercase hidden sm:inline">Targets</span>
        </div>

        {/* Extraction state pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
            isExtractionReady
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 animate-pulse'
              : 'bg-slate-850 border-slate-800 text-slate-400'
          }`}
        >
          <DoorOpen className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold">
            {isExtractionReady ? 'EXTRACTION ACTIVE' : 'LOCKED'}
          </span>
        </div>

        {/* Intel collected count */}
        <div className="hidden md:flex items-center gap-1.5 text-slate-400">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            Intel: {stats.intelCollected}/{stats.intelTotal}
          </span>
        </div>
      </div>

      {/* Right controls & Metrics */}
      <div className="flex items-center gap-3">
        {/* Timer */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatTime(stats.timeSeconds)}</span>
        </div>

        {/* Score */}
        <div className="hidden sm:flex items-center gap-1 text-cyan-400 font-bold">
          <span>{stats.stealthScore} PTS</span>
        </div>

        {/* Alarm status */}
        {stats.alarmsTriggered > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[10px] font-bold">
            <ShieldAlert className="w-3 h-3 text-rose-400 animate-bounce" />
            <span>ALARM x{stats.alarmsTriggered}</span>
          </div>
        )}

        {/* Mute Button */}
        <button
          type="button"
          onClick={onToggleMute}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title={isMuted ? 'Unmute tactical audio' : 'Mute audio'}
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Restart Button */}
        <button
          type="button"
          onClick={onRestart}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Restart mission (R)"
          aria-label="Restart mission"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
