import React, { useRef, useEffect, useState } from 'react';
import { Sliders, RefreshCw, Eye } from 'lucide-react';

export const VisualLabExperiment: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [frequency, setFrequency] = useState(4.2);
  const [dispersion, setDispersion] = useState(14);
  const [speed, setSpeed] = useState(1.2);
  const pointerPosRef = useRef<{ x: number; y: number }>({ x: 400, y: 220 });

  useEffect(() => {
    let animId: number;
    let time = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#05070e';
      ctx.fillRect(0, 0, width, height);

      time += 0.02 * speed;
      const px = pointerPosRef.current.x;
      const py = pointerPosRef.current.y;

      // Draw chromatic wave layers (Red, Green, Blue offsets)
      const channels = [
        { color: 'rgba(239, 68, 68, 0.45)', offset: -dispersion },
        { color: 'rgba(56, 189, 248, 0.45)', offset: 0 },
        { color: 'rgba(168, 85, 247, 0.45)', offset: dispersion },
      ];

      for (const ch of channels) {
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const lines = 12;
        for (let l = 0; l < lines; l++) {
          const baseY = (height / (lines + 1)) * (l + 1);

          for (let x = 0; x < width; x += 6) {
            const dx = x - px;
            const dy = baseY - py;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Refractive lens distortion + harmonic sine
            const lensDeflection = Math.sin(dist * 0.03 - time * 2) * Math.max(0, 45 - dist * 0.12);
            const wave = Math.sin(x * 0.02 * frequency + time + l * 0.4 + ch.offset * 0.05) * 22;
            const y = baseY + wave + lensDeflection;

            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        }
        ctx.stroke();
      }

      // Draw interactive lens focal point
      const lensGrad = ctx.createRadialGradient(px, py, 2, px, py, 45);
      lensGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      lensGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = lensGrad;
      ctx.beginPath();
      ctx.arc(px, py, 45, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [frequency, dispersion, speed]);

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full h-[400px] sm:h-[460px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <canvas
          ref={canvasRef}
          width={800}
          height={460}
          onMouseMove={handlePointerMove}
          className="w-full h-full block cursor-crosshair"
        />

        <div className="absolute top-3 left-3 pointer-events-none text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 font-mono">
          <span className="text-purple-400 font-bold">● CHROMATIC WAVEFORM & PRISM DISPERSION</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span>Harmonic Frequency</span>
            <span className="font-mono text-cyan-400 font-bold">{frequency.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.2"
            value={frequency}
            onChange={(e) => setFrequency(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span>Prism Dispersion</span>
            <span className="font-mono text-purple-400 font-bold">{dispersion}px</span>
          </div>
          <input
            type="range"
            min="2"
            max="30"
            step="1"
            value={dispersion}
            onChange={(e) => setDispersion(parseInt(e.target.value, 10))}
            className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span>Oscillation Speed</span>
            <span className="font-mono text-emerald-400 font-bold">{speed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.2"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
