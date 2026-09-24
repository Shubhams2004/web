import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Wifi,
  Monitor,
  Volume2,
  HardDrive,
  Activity,
  CheckCircle,
} from 'lucide-react';

export const SystemDiagnostics: React.FC = () => {
  const [telemetry, setTelemetry] = useState({
    viewport: '1920x1080',
    dpr: 1,
    concurrency: 8,
    isOnline: true,
    renderEngine: 'HTML5 Canvas 2D 60FPS',
    audioEngine: 'Web Audio API Synth',
  });

  useEffect(() => {
    const updateStats = () => {
      setTelemetry({
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        dpr: window.devicePixelRatio || 1,
        concurrency: navigator.hardwareConcurrency || 4,
        isOnline: navigator.onLine,
        renderEngine: 'HTML5 Canvas 2D 60FPS',
        audioEngine: 'Web Audio API Synth',
      });
    };

    updateStats();
    window.addEventListener('resize', updateStats);
    return () => window.removeEventListener('resize', updateStats);
  }, []);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-sky-300">
            SYSTEM TELEMETRY & RUNTIME STATUS
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>ALL GRIDS OPERATIONAL</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-mono text-xs">
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
            <Monitor className="w-3 h-3 text-cyan-400" />
            <span>VIEWPORT</span>
          </div>
          <div className="text-slate-200 font-bold">{telemetry.viewport}</div>
          <div className="text-[10px] text-slate-500">@{telemetry.dpr}x DPR</div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
            <Cpu className="w-3 h-3 text-amber-400" />
            <span>HARDWARE</span>
          </div>
          <div className="text-slate-200 font-bold">{telemetry.concurrency} Cores</div>
          <div className="text-[10px] text-slate-500">Thread Worker Pool</div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>NETWORK</span>
          </div>
          <div className="text-emerald-400 font-bold">
            {telemetry.isOnline ? 'ONLINE' : 'DISCONNECTED'}
          </div>
          <div className="text-[10px] text-slate-500">Low Latency Bus</div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
            <Volume2 className="w-3 h-3 text-purple-400" />
            <span>AUDIO BUS</span>
          </div>
          <div className="text-slate-200 font-bold truncate">Web Audio</div>
          <div className="text-[10px] text-slate-500">0ms Synth Stream</div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
            <HardDrive className="w-3 h-3 text-sky-400" />
            <span>GRAPHICS</span>
          </div>
          <div className="text-slate-200 font-bold">Canvas 2D</div>
          <div className="text-[10px] text-emerald-400">60 FPS Target</div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
            <Activity className="w-3 h-3 text-rose-400" />
            <span>HEALTH</span>
          </div>
          <div className="text-emerald-400 font-bold">NOMINAL</div>
          <div className="text-[10px] text-slate-500">0 Errors Logged</div>
        </div>
      </div>
    </div>
  );
};
