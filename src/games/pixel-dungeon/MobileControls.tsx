import React, { useRef, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Swords,
} from 'lucide-react';
import type { DungeonKeyControls } from './types';

interface MobileControlsProps {
  onControlChange: (key: keyof DungeonKeyControls, pressed: boolean) => void;
  onStep: (dir: 'up' | 'down' | 'left' | 'right' | 'wait' | 'action') => void;
  disabled?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onControlChange,
  onStep,
  disabled = false,
}) => {
  const holdIntervalRef = useRef<number | null>(null);
  const holdTimeoutRef = useRef<number | null>(null);
  const activeKeyRef = useRef<string | null>(null);

  // Stop hold timers
  const stopHold = () => {
    if (holdTimeoutRef.current !== null) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current !== null) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    if (activeKeyRef.current) {
      const k = activeKeyRef.current as keyof DungeonKeyControls;
      onControlChange(k, false);
      activeKeyRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopHold();
    };
  }, []);

  const handlePointerDown = (
    key: keyof DungeonKeyControls,
    e: React.PointerEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (disabled) return;

    // Capture pointer
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    stopHold();
    activeKeyRef.current = key;
    onControlChange(key, true);

    // Immediate action
    onStep(key as 'up' | 'down' | 'left' | 'right' | 'wait' | 'action');

    // Repeated step on hold for directional navigation
    if (key === 'up' || key === 'down' || key === 'left' || key === 'right') {
      holdTimeoutRef.current = window.setTimeout(() => {
        holdIntervalRef.current = window.setInterval(() => {
          onStep(key);
        }, 150);
      }, 250);
    }
  };

  const handlePointerUp = (
    _key: keyof DungeonKeyControls,
    e: React.PointerEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    stopHold();
  };

  const handlePointerCancel = (
    _key: keyof DungeonKeyControls,
    e: React.PointerEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    stopHold();
  };

  return (
    <div
      className="w-full flex items-center justify-between gap-3 px-2 py-2 select-none touch-none"
      style={{ touchAction: 'none' }}
    >
      {/* 4-Way D-Pad on Left */}
      <div className="relative w-36 h-36 sm:w-40 sm:h-40 bg-slate-900/90 rounded-2xl p-1.5 border border-slate-700/80 shadow-inner flex items-center justify-center">
        {/* Center Cross Decoration */}
        <div className="absolute w-10 h-10 rounded-lg bg-slate-950/70 pointer-events-none border border-slate-800" />

        {/* Up */}
        <button
          type="button"
          onPointerDown={(e) => handlePointerDown('up', e)}
          onPointerUp={(e) => handlePointerUp('up', e)}
          onPointerCancel={(e) => handlePointerCancel('up', e)}
          onPointerLeave={(e) => handlePointerCancel('up', e)}
          className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-gradient-to-b from-slate-700 to-slate-800 active:from-amber-600 active:to-amber-700 text-amber-300 active:text-white flex items-center justify-center shadow-md border border-slate-600 active:scale-95 transition-transform"
          aria-label="Move Up"
        >
          <ChevronUp className="w-7 h-7" />
        </button>

        {/* Down */}
        <button
          type="button"
          onPointerDown={(e) => handlePointerDown('down', e)}
          onPointerUp={(e) => handlePointerUp('down', e)}
          onPointerCancel={(e) => handlePointerCancel('down', e)}
          onPointerLeave={(e) => handlePointerCancel('down', e)}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-gradient-to-t from-slate-700 to-slate-800 active:from-amber-600 active:to-amber-700 text-amber-300 active:text-white flex items-center justify-center shadow-md border border-slate-600 active:scale-95 transition-transform"
          aria-label="Move Down"
        >
          <ChevronDown className="w-7 h-7" />
        </button>

        {/* Left */}
        <button
          type="button"
          onPointerDown={(e) => handlePointerDown('left', e)}
          onPointerUp={(e) => handlePointerUp('left', e)}
          onPointerCancel={(e) => handlePointerCancel('left', e)}
          onPointerLeave={(e) => handlePointerCancel('left', e)}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 active:from-amber-600 active:to-amber-700 text-amber-300 active:text-white flex items-center justify-center shadow-md border border-slate-600 active:scale-95 transition-transform"
          aria-label="Move Left"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>

        {/* Right */}
        <button
          type="button"
          onPointerDown={(e) => handlePointerDown('right', e)}
          onPointerUp={(e) => handlePointerUp('right', e)}
          onPointerCancel={(e) => handlePointerCancel('right', e)}
          onPointerLeave={(e) => handlePointerCancel('right', e)}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-gradient-to-l from-slate-700 to-slate-800 active:from-amber-600 active:to-amber-700 text-amber-300 active:text-white flex items-center justify-center shadow-md border border-slate-600 active:scale-95 transition-transform"
          aria-label="Move Right"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      </div>

      {/* Action Buttons on Right: Wait / Skip Turn + Attack / Action */}
      <div className="flex flex-col gap-2.5 sm:gap-3">
        {/* Wait Turn Button */}
        <button
          type="button"
          onPointerDown={(e) => handlePointerDown('wait', e)}
          onPointerUp={(e) => handlePointerUp('wait', e)}
          onPointerCancel={(e) => handlePointerCancel('wait', e)}
          onPointerLeave={(e) => handlePointerCancel('wait', e)}
          className="flex items-center justify-center gap-2 w-28 sm:w-32 h-12 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 active:border-amber-500 text-slate-300 active:text-amber-300 font-mono text-xs font-bold shadow-md active:scale-95 transition-transform"
          aria-label="Wait Turn"
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>WAIT (PASS)</span>
        </button>

        {/* Attack / Interact Button */}
        <button
          type="button"
          onPointerDown={(e) => handlePointerDown('action', e)}
          onPointerUp={(e) => handlePointerUp('action', e)}
          onPointerCancel={(e) => handlePointerCancel('action', e)}
          onPointerLeave={(e) => handlePointerCancel('action', e)}
          className="flex items-center justify-center gap-2 w-28 sm:w-32 h-14 rounded-xl bg-gradient-to-b from-amber-600 to-amber-700 border-2 border-amber-400 text-amber-50 active:bg-amber-800 font-mono text-xs font-black shadow-[0_0_12px_rgba(245,158,11,0.4)] active:scale-95 transition-transform"
          aria-label="Attack / Interact"
        >
          <Swords className="w-5 h-5 text-amber-200" />
          <span>STRIKE</span>
        </button>
      </div>
    </div>
  );
};
