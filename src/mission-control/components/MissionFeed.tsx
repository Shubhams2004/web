import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { missionAudio } from '../audio';
import { unlockAchievement } from '../achievements';
import type { MissionLogEntry } from '../types';

const INITIAL_LOGS: MissionLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '08:24:12',
    category: 'SYSTEM',
    message: 'Command Core initialized. All subsystems report nominal status.',
    status: 'success',
  },
  {
    id: 'log-2',
    timestamp: '08:24:15',
    category: 'SECTOR',
    message: 'Sector 01 [Pixel Dungeon] link active. Procedural level seeds verified.',
    status: 'info',
  },
  {
    id: 'log-3',
    timestamp: '08:24:18',
    category: 'SECTOR',
    message: 'Sector 02 [Zombie Survival] telemetry synchronized. Mutation vectors contained.',
    status: 'info',
  },
  {
    id: 'log-4',
    timestamp: '08:24:20',
    category: 'SECTOR',
    message: 'Sector 03 [Retro Racer] turbines calibrated. Speed telemetry operational.',
    status: 'info',
  },
  {
    id: 'log-5',
    timestamp: '08:24:25',
    category: 'LAB',
    message: 'Web Audio API oscillator array standing by for sound wave synthesis.',
    status: 'success',
  },
];

export const MissionFeed: React.FC = () => {
  const [logs, setLogs] = useState<MissionLogEntry[]>(INITIAL_LOGS);
  const [filter, setFilter] = useState<'ALL' | 'SYSTEM' | 'SECTOR' | 'LAB'>('ALL');
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnosticStage, setDiagnosticStage] = useState<number>(0);

  // Periodic heartbeat message in the feed
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const heartbeats: { cat: MissionLogEntry['category']; msg: string; st: MissionLogEntry['status'] }[] = [
        { cat: 'SYSTEM', msg: 'System heartbeat: Client memory footprint stable.', st: 'info' },
        { cat: 'SECTOR', msg: 'Sector grid telemetry sync: Latency < 1ms.', st: 'success' },
        { cat: 'LAB', msg: 'Prototype sandbox: Canvas 2D pipeline primed.', st: 'info' },
        { cat: 'SYSTEM', msg: 'Orbital status check: All services responsive.', st: 'info' },
      ];
      const pick = heartbeats[Math.floor(Math.random() * heartbeats.length)];
      setLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          category: pick.cat,
          message: pick.msg,
          status: pick.st,
        },
        ...prev.slice(0, 19),
      ]);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const runFullDiagnostics = () => {
    if (isDiagnosing) return;
    setIsDiagnosing(true);
    setDiagnosticStage(1);
    missionAudio.playDiagnosticSweep();

    const stages = [
      { msg: 'Phase 1/5: Auditing Web Audio synthesis bus...', st: 'info' },
      { msg: 'Phase 2/5: Verifying HTML5 Canvas 2D render loop performance...', st: 'info' },
      { msg: 'Phase 3/5: Probing Sector 01 (Pixel Dungeon) procedural state...', st: 'success' },
      { msg: 'Phase 4/5: Checking Sector 02 & 03 high-score telemetry...', st: 'success' },
      { msg: 'Phase 5/5: ALL SYSTEMS OPTIMAL. Full diagnostic verification completed.', st: 'success' },
    ];

    stages.forEach((item, index) => {
      setTimeout(() => {
        setDiagnosticStage(index + 1);
        missionAudio.playTerminalBlip();
        const timeStr = new Date().toTimeString().split(' ')[0];
        setLogs((prev) => [
          {
            id: `diag-${Date.now()}-${index}`,
            timestamp: timeStr,
            category: 'SYSTEM',
            message: item.msg,
            status: item.st as MissionLogEntry['status'],
          },
          ...prev,
        ]);

        if (index === stages.length - 1) {
          setIsDiagnosing(false);
          setDiagnosticStage(0);
          unlockAchievement('system_analyst');
        }
      }, (index + 1) * 700);
    });
  };

  const filteredLogs = filter === 'ALL' ? logs : logs.filter((l) => l.category === filter);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-emerald-300">
            DYNAMIC MISSION TELEMETRY FEED
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runFullDiagnostics}
            disabled={isDiagnosing}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
              isDiagnosing
                ? 'bg-amber-950 text-amber-300 border border-amber-800/80 animate-pulse'
                : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isDiagnosing ? `Scanning (${diagnosticStage}/5)...` : 'Run Diagnostics'}</span>
          </button>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono">
            {(['ALL', 'SYSTEM', 'SECTOR', 'LAB'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filter === cat
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log Console Window */}
      <div className="bg-slate-950 rounded-xl border border-slate-800/90 p-3 max-h-56 overflow-y-auto space-y-2 font-mono text-xs select-text">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-2.5 leading-relaxed py-0.5 border-b border-slate-900 last:border-none"
          >
            <span className="text-slate-500 shrink-0 text-[10px] pt-0.5">{log.timestamp}</span>

            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                log.category === 'SYSTEM'
                  ? 'bg-sky-950 text-sky-400 border border-sky-800/50'
                  : log.category === 'SECTOR'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                  : 'bg-amber-950 text-amber-400 border border-amber-800/50'
              }`}
            >
              {log.category}
            </span>

            <span
              className={`flex-1 break-words ${
                log.status === 'success'
                  ? 'text-slate-200'
                  : log.status === 'alert'
                  ? 'text-rose-400 font-bold'
                  : 'text-slate-400'
              }`}
            >
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
