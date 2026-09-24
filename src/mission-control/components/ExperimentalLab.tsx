import React, { useState, useRef, useEffect } from 'react';
import {
  FlaskConical,
  Volume2,
  Layers,
  Tv,
  RefreshCw,
  Sparkles,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { missionAudio } from '../audio';
import { unlockAchievement } from '../achievements';

export const ExperimentalLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audio' | 'matrix' | 'crt'>('audio');

  // --- Audio Lab State ---
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [synthFeedback, setSynthFeedback] = useState<string>('Ready for frequency modulation.');

  // --- Dungeon Matrix Lab State ---
  const [matrixSeed, setMatrixSeed] = useState<number>(4096);
  const [roomCount, setRoomCount] = useState<number>(5);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- CRT Lab State ---
  const [scanlineDensity, setScanlineDensity] = useState<'low' | 'med' | 'high'>('med');
  const [bloomEnabled, setBloomEnabled] = useState<boolean>(true);

  // Trigger lab sound
  const handlePlaySound = (preset: 'laser' | 'warp' | 'subbass' | 'chime' | 'glitch') => {
    missionAudio.playLabSound(preset);
    setActivePreset(preset);
    setSynthFeedback(`Oscillator rendered: ${preset.toUpperCase()} [${Math.floor(Math.random() * 800 + 400)}Hz]`);
    unlockAchievement('audio_technician');
    setTimeout(() => setActivePreset(null), 400);
  };

  // Generate procedural dungeon mini-preview
  const generateProceduralSeed = () => {
    const nextSeed = Math.floor(Math.random() * 90000) + 10000;
    setMatrixSeed(nextSeed);
    const rooms = Math.floor(Math.random() * 4) + 4;
    setRoomCount(rooms);
    missionAudio.playTerminalBlip();
    unlockAchievement('cartographer');
  };

  // Draw procedural map on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Reset background
    ctx.fillStyle = '#06090e';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Procedural pseudo-rooms based on seed
    const pseudoRandom = (seed: number, index: number) => {
      const x = Math.sin(seed + index) * 10000;
      return x - Math.floor(x);
    };

    const roomCoords: { x: number; y: number; rw: number; rh: number }[] = [];

    for (let i = 0; i < roomCount; i++) {
      const rx = Math.floor(pseudoRandom(matrixSeed, i * 4) * (w - 70)) + 15;
      const ry = Math.floor(pseudoRandom(matrixSeed, i * 4 + 1) * (h - 60)) + 15;
      const rw = Math.floor(pseudoRandom(matrixSeed, i * 4 + 2) * 45) + 30;
      const rh = Math.floor(pseudoRandom(matrixSeed, i * 4 + 3) * 35) + 25;

      roomCoords.push({ x: rx, y: ry, rw, rh });

      // Room floor
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(rx, ry, rw, rh);

      // Room core
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.fillRect(rx + 2, ry + 2, rw - 4, rh - 4);
    }

    // Connect rooms with corridors
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    for (let i = 0; i < roomCoords.length - 1; i++) {
      const r1 = roomCoords[i];
      const r2 = roomCoords[i + 1];

      const cx1 = r1.x + r1.rw / 2;
      const cy1 = r1.y + r1.rh / 2;
      const cx2 = r2.x + r2.rw / 2;
      const cy2 = r2.y + r2.rh / 2;

      ctx.beginPath();
      ctx.moveTo(cx1, cy1);
      ctx.lineTo(cx2, cy1);
      ctx.lineTo(cx2, cy2);
      ctx.stroke();
    }

    // Highlight start & exit node
    if (roomCoords.length > 0) {
      // Start (Green)
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(roomCoords[0].x + 10, roomCoords[0].y + 10, 4, 0, Math.PI * 2);
      ctx.fill();

      // Exit (Amber)
      const last = roomCoords[roomCoords.length - 1];
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(last.x + last.rw - 10, last.y + last.rh - 10, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [matrixSeed, roomCount, activeTab]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-amber-300">
            EXPERIMENTAL PROTOTYPE LAB
          </h2>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'audio'
                ? 'bg-amber-950 text-amber-300 border border-amber-800/80 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sonic Synth Lab
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'matrix'
                ? 'bg-amber-950 text-amber-300 border border-amber-800/80 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Procedural Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('crt')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'crt'
                ? 'bg-amber-950 text-amber-300 border border-amber-800/80 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CRT Phosphor Grid
          </button>
        </div>
      </div>

      {/* Tab 1: Sonic Synthesizer Lab */}
      {activeTab === 'audio' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>WEB AUDIO API OSCILLATOR & SYNTHESIS ARRAY</span>
            <span className="text-amber-400 font-bold">100% SELF-CONTAINED</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'laser', label: 'Laser Cannon', icon: '⚡' },
              { id: 'warp', label: 'Warp Drive', icon: '🌀' },
              { id: 'subbass', label: 'Sub-Bass Drop', icon: '🔊' },
              { id: 'chime', label: 'Relic Chime', icon: '✨' },
              { id: 'glitch', label: 'Data Glitch', icon: '📡' },
            ].map((snd) => (
              <button
                key={snd.id}
                type="button"
                onClick={() =>
                  handlePlaySound(snd.id as 'laser' | 'warp' | 'subbass' | 'chime' | 'glitch')
                }
                className={`py-3 px-2 rounded-xl border font-mono text-xs text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activePreset === snd.id
                    ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-95'
                    : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-lg">{snd.icon}</span>
                <span className="font-bold">{snd.label}</span>
                <span className="text-[10px] text-slate-400">Trigger Wave</span>
              </button>
            ))}
          </div>

          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{synthFeedback}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">AUDIO READY</span>
          </div>
        </div>
      )}

      {/* Tab 2: Procedural Matrix Lab */}
      {activeTab === 'matrix' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>PROCEDURAL ROGUELIKE DUNGEON ALGORITHM PROTOTYPE</span>
            <button
              type="button"
              onClick={generateProceduralSeed}
              className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded-md font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Compile New Seed</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Live Canvas Preview */}
            <div className="sm:col-span-2 aspect-[16/9] w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
              <canvas
                ref={canvasRef}
                width={360}
                height={200}
                className="w-full h-full block image-rendering-pixelated"
              />
            </div>

            {/* Seed Parameters */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5 text-xs font-mono">
              <div className="text-cyan-400 font-bold text-[11px] uppercase tracking-wider">
                COMPUTATIONAL TELEMETRY
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">SEED DIGEST</span>
                <span className="text-slate-200 font-bold">#{matrixSeed}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">ROOMS GENERATED</span>
                <span className="text-emerald-400 font-bold">{roomCount} Chambers</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">CORRIDORS LINKED</span>
                <span className="text-sky-300 font-bold">{roomCount - 1} Dogleg Tunnels</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">START / EXIT PATHING</span>
                <span className="text-amber-400 font-bold">100% Solvable</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: CRT Phosphor Grid */}
      {activeTab === 'crt' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400 font-mono">
            VIRTUAL CATHODE-RAY TUBE (CRT) SHADER EXPERIMENTS
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="text-slate-300 font-bold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>SCANLINE DENSITY</span>
              </div>
              <div className="flex gap-2">
                {(['low', 'med', 'high'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setScanlineDensity(d);
                      missionAudio.playTerminalBlip();
                    }}
                    className={`flex-1 py-1.5 rounded-lg border text-center font-bold capitalize transition-colors ${
                      scanlineDensity === d
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">PHOSPHOR BLOOM</span>
                <button
                  type="button"
                  onClick={() => {
                    setBloomEnabled(!bloomEnabled);
                    missionAudio.playTerminalBlip();
                  }}
                  className={`px-3 py-1 rounded-md border font-bold text-xs ${
                    bloomEnabled
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {bloomEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>

            {/* CRT Preview Window */}
            <div className="relative aspect-[16/9] bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-center items-center overflow-hidden">
              <div
                className={`font-mono text-center font-black tracking-widest text-emerald-400 transition-all ${
                  bloomEnabled ? 'drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : ''
                }`}
              >
                <div className="text-lg">SIGNAL ACQUIRED</div>
                <div className="text-xs text-emerald-300 mt-1 font-normal">
                  FRAME RATE: 60.0 FPS · LOW LATENCY
                </div>
              </div>

              {/* Scanline Effect overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    scanlineDensity === 'high'
                      ? 'repeating-linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.35) 1px, transparent 1px, transparent 2px)'
                      : scanlineDensity === 'med'
                      ? 'repeating-linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.25) 1px, transparent 1px, transparent 3px)'
                      : 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 4px)',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
