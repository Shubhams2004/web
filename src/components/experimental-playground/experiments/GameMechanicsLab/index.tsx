import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Scissors, RotateCcw, Gamepad2, ArrowRight } from 'lucide-react';

interface VerletPoint {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  isPinned: boolean;
}

interface VerletStick {
  p0: number;
  p1: number;
  length: number;
  isBroken: boolean;
}

export const GameMechanicsLabExperiment: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'drag' | 'cut'>('drag');
  const pointsRef = useRef<VerletPoint[]>([]);
  const sticksRef = useRef<VerletStick[]>([]);
  const draggingIdxRef = useRef<number | null>(null);

  const initRope = useCallback(() => {
    const points: VerletPoint[] = [];
    const sticks: VerletStick[] = [];

    const segments = 22;
    const startX = 140;
    const endX = 660;
    const stepX = (endX - startX) / (segments - 1);
    const y = 140;

    for (let i = 0; i < segments; i++) {
      points.push({
        x: startX + i * stepX,
        y: y + Math.sin((i / segments) * Math.PI) * 40,
        oldX: startX + i * stepX,
        oldY: y + Math.sin((i / segments) * Math.PI) * 40,
        isPinned: i === 0 || i === segments - 1,
      });

      if (i > 0) {
        sticks.push({
          p0: i - 1,
          p1: i,
          length: stepX * 1.05,
          isBroken: false,
        });
      }
    }

    pointsRef.current = points;
    sticksRef.current = sticks;
  }, []);

  useEffect(() => {
    initRope();
  }, [initRope]);

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const gravity = 0.35;
      const friction = 0.99;

      ctx.fillStyle = '#080c15';
      ctx.fillRect(0, 0, width, height);

      // Update points
      const points = pointsRef.current;
      const sticks = sticksRef.current;
      const draggingIdx = draggingIdxRef.current;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (p.isPinned || i === draggingIdx) continue;

        const vx = (p.x - p.oldX) * friction;
        const vy = (p.y - p.oldY) * friction + gravity;

        p.oldX = p.x;
        p.oldY = p.y;
        p.x += vx;
        p.y += vy;

        // Floor collision
        if (p.y > height - 30) {
          p.y = height - 30;
          p.oldY = p.y + vy * 0.5;
        }
      }

      // Relax sticks multiple iterations
      for (let iter = 0; iter < 5; iter++) {
        for (const s of sticks) {
          if (s.isBroken) continue;
          const p0 = points[s.p0];
          const p1 = points[s.p1];
          const dx = p1.x - p0.x;
          const dy = p1.y - p0.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const diff = (dist - s.length) / dist;

          if (!p0.isPinned && s.p0 !== draggingIdx) {
            p0.x += dx * 0.5 * diff;
            p0.y += dy * 0.5 * diff;
          }
          if (!p1.isPinned && s.p1 !== draggingIdx) {
            p1.x -= dx * 0.5 * diff;
            p1.y -= dy * 0.5 * diff;
          }
        }
      }

      // Draw Sticks
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (const s of sticks) {
        if (s.isBroken) continue;
        const p0 = points[s.p0];
        const p1 = points[s.p1];
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
      }
      ctx.stroke();

      // Draw Points
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        ctx.fillStyle = p.isPinned ? '#f43f5e' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.isPinned ? 7 : 4, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'cut') {
      // Sever nearest stick
      const sticks = sticksRef.current;
      const points = pointsRef.current;
      for (const s of sticks) {
        if (s.isBroken) continue;
        const p0 = points[s.p0];
        const p1 = points[s.p1];
        const midX = (p0.x + p1.x) / 2;
        const midY = (p0.y + p1.y) / 2;
        const dist = Math.sqrt((midX - x) ** 2 + (midY - y) ** 2);
        if (dist < 22) {
          s.isBroken = true;
          break;
        }
      }
      return;
    }

    // Drag point
    const points = pointsRef.current;
    let closestIdx: number | null = null;
    let minDist = 30;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    }

    draggingIdxRef.current = closestIdx;
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingIdxRef.current === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const p = pointsRef.current[draggingIdxRef.current];
    if (p) {
      p.x = x;
      p.y = y;
    }
  };

  const handlePointerUp = () => {
    draggingIdxRef.current = null;
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full h-[400px] sm:h-[460px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <canvas
          ref={canvasRef}
          width={800}
          height={460}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          className="w-full h-full block cursor-pointer"
        />

        <div className="absolute top-3 left-3 pointer-events-none text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 font-mono">
          <span className="text-cyan-400 font-bold">● VERLET CHAIN RIGIDITY</span> · Mode: {tool.toUpperCase()}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTool('drag')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              tool === 'drag'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Drag Joints
          </button>
          <button
            type="button"
            onClick={() => setTool('cut')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              tool === 'cut'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Sever Links</span>
          </button>
          <button
            type="button"
            onClick={initRope}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reset rope"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <a
          href="#/game"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Launch Full Arcade Suite</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
