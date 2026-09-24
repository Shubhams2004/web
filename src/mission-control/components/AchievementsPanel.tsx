import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Radio,
  Compass,
  Activity,
  Layers,
  Shield,
  Skull,
  Gauge,
  Cpu,
  Lock,
  CheckCircle2,
  Flame,
  Sparkles,
} from 'lucide-react';
import { getStoredAchievements } from '../achievements';
import type { Achievement } from '../types';

export const AchievementsPanel: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    setAchievements(getStoredAchievements());
  }, []);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Radio':
        return <Radio className="w-4 h-4 text-cyan-400" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-sky-400" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-amber-400" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'Shield':
        return <Shield className="w-4 h-4 text-amber-400" />;
      case 'Skull':
        return <Skull className="w-4 h-4 text-rose-400" />;
      case 'Gauge':
        return <Gauge className="w-4 h-4 text-cyan-400" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-yellow-300" />;
      default:
        return <Award className="w-4 h-4 text-amber-400" />;
    }
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const totalXp = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xpValue, 0);

  const percent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const clearanceRank =
    percent === 100
      ? 'SUPREME COMMANDER'
      : percent >= 75
      ? 'CHIEF OPERATIVE'
      : percent >= 50
      ? 'SENIOR SPECIALIST'
      : percent >= 25
      ? 'SECTOR AGENT'
      : 'RECRUIT CLASSIFIED';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
      {/* Header with Clearance Level & XP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-amber-300">
            SECRET CLEARANCE & MISSION ACHIEVEMENTS
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>RANK:</span>
            <span className="text-cyan-300 font-bold">{clearanceRank}</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>{totalXp} XP</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono text-slate-400">
          <span>
            COMPLETION PROGRESS: <strong className="text-slate-200">{unlockedCount}</strong> / {totalCount} UNLOCKED
          </span>
          <span className="text-cyan-400 font-bold">{percent}%</span>
        </div>
        <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-400 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`p-3 rounded-xl border transition-all ${
              ach.unlocked
                ? 'bg-slate-950/90 border-cyan-700/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                : 'bg-slate-950/40 border-slate-900 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div
                className={`p-1.5 rounded-lg border ${
                  ach.unlocked
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-slate-950 border-slate-900 text-slate-600'
                }`}
              >
                {ach.unlocked ? getIcon(ach.icon) : <Lock className="w-4 h-4 text-slate-600" />}
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                +{ach.xpValue} XP
              </span>
            </div>

            <h3
              className={`text-xs font-bold font-mono line-clamp-1 mb-1 ${
                ach.unlocked ? 'text-slate-200' : 'text-slate-500'
              }`}
            >
              {ach.title}
            </h3>

            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              {ach.description}
            </p>

            {ach.unlocked && (
              <div className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>UNLOCKED</span>
                </span>
                <span className="text-slate-500">{ach.unlockedAt || 'ACTIVE'}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
