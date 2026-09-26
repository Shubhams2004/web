import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Magnet, Compass, RotateCcw, Zap } from 'lucide-react';

interface FloatingBox {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  color: string;
  isFleeing: boolean;
}

export const WeirdWebLabExperiment: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [gravityOn, setGravityOn] = useState(false);
  const [cursorRepel, setCursorRepel] = useState(true);
  const [score, setScore] = useState(0);

  const [boxes, setBoxes] = useState<FloatingBox[]>([
    {
      id: 'b1',
      label: '404 Reality Missing',
      x: 120,
      y: 80,
      vx: 1.2,
      vy: 0.8,
      rotation: 4,
      vRot: 0.2,
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      isFleeing: false,
    },
    {
      id: 'b2',
      label: 'NaN === NaN (False)',
      x: 360,
      y: 110,
      vx: -0.9,
      vy: 1.1,
      rotation: -6,
      vRot: -0.15,
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      isFleeing: false,
    },
    {
      id: 'b3',
      label: 'Uncaught Infinite Loop',
      x: 220,
      y: 220,
      vx: 1.5,
      vy: -1.2,
      rotation: 12,
      vRot: 0.3,
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      isFleeing: false,
    },
    {
      id: 'b4',
      label: 'CSS is Awesome (Overflow: Hidden)',
      x: 480,
      y: 260,
      vx: -1.4,
      vy: -0.7,
      rotation: -10,
      vRot: -0.25,
      color: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      isFleeing: false,
    },
    {
      id: 'b5',
      label: 'Catch Me If You Can',
      x: 300,
      y: 330,
      vx: 0.7,
      vy: -1.4,
      rotation: 8,
      vRot: 0.1,
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      isFleeing: true,
    },
  ]);

  const pointerPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let animId: number;

    const loop = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const maxX = rect.width - 160;
      const maxY = rect.height - 50;

      const px = pointerPos.current.x;
      const py = pointerPos.current.y;

      setBoxes((prev) =>
        prev.map((b) => {
          let vx = b.vx;
          let vy = b.vy;
          let rot = b.rotation + b.vRot;

          // Apply room gravity if enabled
          if (gravityOn) {
            vy += 0.35;
          }

          // Cursor repulsion / magnetic force
          if (cursorRepel) {
            const dx = (b.x + 80) - px;
            const dy = (b.y + 25) - py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              const force = (120 - dist) * 0.08;
              vx += (dx / dist) * force;
              vy += (dy / dist) * force;
            }
          }

          let x = b.x + vx;
          let y = b.y + vy;

          // Boundaries
          if (x < 10) {
            x = 10;
            vx = Math.abs(vx) * 0.9;
          } else if (x > maxX) {
            x = maxX;
            vx = -Math.abs(vx) * 0.9;
          }

          if (y < 10) {
            y = 10;
            vy = Math.abs(vy) * 0.9;
          } else if (y > maxY) {
            y = maxY;
            vy = -Math.abs(vy) * (gravityOn ? 0.75 : 0.9);
          }

          return {
            ...b,
            x,
            y,
            vx: vx * 0.98,
            vy: vy * 0.98,
            rotation: rot,
          };
        })
      );

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gravityOn, cursorRepel]);

  const handlePointerMove = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    pointerPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleBoxClick = (id: string) => {
    setScore((s) => s + 1);
    // Give impulsive kick
    setBoxes((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          return {
            ...b,
            vx: (Math.random() - 0.5) * 16,
            vy: -10 - Math.random() * 8,
            vRot: (Math.random() - 0.5) * 8,
          };
        }
        return b;
      })
    );
  };

  const resetAll = () => {
    setBoxes([
      {
        id: 'b1',
        label: '404 Reality Missing',
        x: 120,
        y: 80,
        vx: 1.2,
        vy: 0.8,
        rotation: 4,
        vRot: 0.2,
        color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        isFleeing: false,
      },
      {
        id: 'b2',
        label: 'NaN === NaN (False)',
        x: 360,
        y: 110,
        vx: -0.9,
        vy: 1.1,
        rotation: -6,
        vRot: -0.15,
        color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        isFleeing: false,
      },
      {
        id: 'b3',
        label: 'Uncaught Infinite Loop',
        x: 220,
        y: 220,
        vx: 1.5,
        vy: -1.2,
        rotation: 12,
        vRot: 0.3,
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        isFleeing: false,
      },
      {
        id: 'b4',
        label: 'CSS is Awesome (Overflow: Hidden)',
        x: 480,
        y: 260,
        vx: -1.4,
        vy: -0.7,
        rotation: -10,
        vRot: -0.25,
        color: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        isFleeing: false,
      },
      {
        id: 'b5',
        label: 'Catch Me If You Can',
        x: 300,
        y: 330,
        vx: 0.7,
        vy: -1.4,
        rotation: 8,
        vRot: 0.1,
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        isFleeing: true,
      },
    ]);
  };

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        onMouseMove={handlePointerMove}
        className="relative w-full h-[400px] sm:h-[460px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl select-none"
      >
        <div className="absolute top-3 left-3 pointer-events-none text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 font-mono z-10">
          <span className="text-amber-400 font-bold">● ZERO-G DOM ENTROPY</span> · Captured: {score}
        </div>

        {/* Floating Interactive DOM Elements */}
        {boxes.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => handleBoxClick(b.id)}
            style={{
              transform: `translate3d(${b.x}px, ${b.y}px, 0px) rotate(${b.rotation}deg)`,
            }}
            className={`absolute top-0 left-0 px-3 py-2 rounded-xl text-xs font-mono font-bold border backdrop-blur-md shadow-lg transition-transform duration-75 cursor-grab active:cursor-grabbing active:scale-95 ${b.color}`}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setGravityOn(!gravityOn)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              gravityOn
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {gravityOn ? 'Room Gravity: ON' : 'Room Gravity: ZERO-G'}
          </button>

          <button
            type="button"
            onClick={() => setCursorRepel(!cursorRepel)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              cursorRepel
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Magnet className="w-3.5 h-3.5" />
            <span>Cursor Repel: {cursorRepel ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={resetAll}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reset DOM elements"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Click elements to impart kinetic momentum
        </span>
      </div>
    </div>
  );
};
