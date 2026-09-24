import React from 'react';
import {
  Shield,
  Skull,
  Car,
  ChevronRight,
  Zap,
  Activity,
  Trophy,
  ExternalLink,
} from 'lucide-react';
import { SECTOR_MISSIONS } from '../sectors';
import { missionAudio } from '../audio';
import type { SectorMission } from '../types';

interface SectorGridProps {
  onLaunchSector: (route: string) => void;
  onInspectSector?: (sector: SectorMission) => void;
}

export const SectorGrid: React.FC<SectorGridProps> = ({
  onLaunchSector,
  onInspectSector,
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Shield':
        return <Shield className="w-5 h-5 text-amber-400" />;
      case 'Skull':
        return <Skull className="w-5 h-5 text-emerald-400" />;
      case 'Car':
        return <Car className="w-5 h-5 text-rose-400" />;
      default:
        return <Zap className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getHighScore = (key: string): number => {
    try {
      return parseInt(localStorage.getItem(key) || '0', 10);
    } catch {
      return 0;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-cyan-300">
            ACTIVE OPERATIONAL SECTORS ({SECTOR_MISSIONS.length})
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          ALL GRID NODES RESPONSIVE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SECTOR_MISSIONS.map((sec) => {
          const hiScore = getHighScore(sec.highScoreKey);

          return (
            <div
              key={sec.id}
              className="group relative bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
            >
              {/* Sector Header */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
                  <span className="text-cyan-400 font-bold tracking-widest">{sec.sectorCode}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-emerald-400 font-bold">{sec.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-slate-700 transition-colors">
                    {getIcon(sec.iconName)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {sec.title}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400 block">
                      {sec.genre}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {sec.description}
                </p>
              </div>

              {/* Metrics & Action */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>HIGH SCORE:</span>
                  </span>
                  <span className="text-amber-300 font-bold">
                    {hiScore > 0 ? hiScore.toLocaleString() : 'UNRECORDED'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      missionAudio.playRadarPing();
                      onLaunchSector(sec.route);
                    }}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 hover:border-cyan-400 text-cyan-200 hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-sm group-hover:shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                  >
                    <span>ENGAGE SECTOR</span>
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>

                  {onInspectSector && (
                    <button
                      type="button"
                      onClick={() => {
                        missionAudio.playTerminalBlip();
                        onInspectSector(sec);
                      }}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                      title="Inspect Sector Diagnostics"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
