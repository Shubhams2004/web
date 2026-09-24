import React, { useRef, useEffect, useCallback } from 'react';
import {
  Crosshair,
  RotateCcw,
  Pause,
  Play,
  ShieldAlert,
  Flame,
  Bomb,
  Zap,
} from 'lucide-react';
import { zombieAudio } from './audio';
import type { KeyControls, ZombieGameState } from './types';

interface MobileControlsProps {
  controls: KeyControls;
  onControlChange: (key: keyof KeyControls, pressed: boolean) => void;
  onPause: () => void;
  onRestart: () => void;
  gameState: ZombieGameState;
  onBomb?: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  controls,
  onControlChange,
  onPause,
  onRestart,
  gameState,
  onBomb,
}) => {
  // Track active pointer IDs per control to support flawless multi-touch and press-and-hold
  const pointerMapRef = useRef<Map<keyof KeyControls, Set<number>>>(
    new Map([
      ['up', new Set<number>()],
      ['down', new Set<number>()],
      ['left', new Set<number>()],
      ['right', new Set<number>()],
      ['attack', new Set<number>()],
    ])
  );

  const releaseAllControls = useCallback(() => {
    const keys: (keyof KeyControls)[] = ['up', 'down', 'left', 'right', 'attack'];
    keys.forEach((key) => {
      const set = pointerMapRef.current.get(key);
      if (set && set.size > 0) {
        set.clear();
        onControlChange(key, false);
      } else if (controls[key]) {
        onControlChange(key, false);
      }
    });
  }, [controls, onControlChange]);

  useEffect(() => {
    const handleGlobalPointerUpOrCancel = (e: PointerEvent) => {
      pointerMapRef.current.forEach((pointers, key) => {
        if (pointers.has(e.pointerId)) {
          pointers.delete(e.pointerId);
          if (pointers.size === 0) {
            onControlChange(key, false);
          }
        }
      });
    };

    const handleWindowBlur = () => {
      releaseAllControls();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        releaseAllControls();
      }
    };

    window.addEventListener('pointerup', handleGlobalPointerUpOrCancel);
    window.addEventListener('pointercancel', handleGlobalPointerUpOrCancel);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUpOrCancel);
      window.removeEventListener('pointercancel', handleGlobalPointerUpOrCancel);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onControlChange, releaseAllControls]);

  const handlePointerDown = (key: keyof KeyControls) => (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    zombieAudio.userInteracted();

    const pointers = pointerMapRef.current.get(key);
    if (pointers) {
      pointers.add(e.pointerId);
    }
    onControlChange(key, true);

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerUp = (key: keyof KeyControls) => (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const pointers = pointerMapRef.current.get(key);
    if (pointers) {
      pointers.delete(e.pointerId);
      if (pointers.size === 0) {
        onControlChange(key, false);
      }
    } else {
      onControlChange(key, false);
    }

    try {
      if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }
    } catch {}
  };

  const handlePointerCancel = (key: keyof KeyControls) => (e: React.PointerEvent<HTMLButtonElement>) => {
    handlePointerUp(key)(e);
  };

  return (
    <div
      className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-3 select-none touch-none shadow-inner"
      style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Top Utility Row */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 px-1 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-[10px] tracking-wide uppercase text-slate-300">
            Survival Controller
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onBomb && (
            <button
              type="button"
              onClick={onBomb}
              className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1 active:scale-95 transition-transform"
            >
              <Bomb className="w-3 h-3" />
              <span>NUKE</span>
            </button>
          )}

          <button
            type="button"
            onClick={onPause}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title={gameState === 'paused' ? 'Resume' : 'Pause'}
            aria-label="Pause or Resume"
          >
            {gameState === 'paused' ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Restart"
            aria-label="Restart Game"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>
      </div>

      {/* Main Touch Area: Left D-Pad + Right Attack Button */}
      <div className="grid grid-cols-2 gap-3 items-center">
        {/* Left Side: 8-Way D-Pad Matrix */}
        <div className="flex flex-col items-center justify-center p-1">
          <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
            {/* Top Left diagonal helper */}
            <div />

            {/* UP */}
            <button
              type="button"
              onPointerDown={handlePointerDown('up')}
              onPointerUp={handlePointerUp('up')}
              onPointerCancel={handlePointerCancel('up')}
              className={`h-11 rounded-xl font-bold flex items-center justify-center border transition-all active:scale-95 ${
                controls.up
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                  : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700/80'
              }`}
              style={{ touchAction: 'none' }}
              aria-label="Move Up"
            >
              ▲
            </button>

            {/* Top Right */}
            <div />

            {/* LEFT */}
            <button
              type="button"
              onPointerDown={handlePointerDown('left')}
              onPointerUp={handlePointerUp('left')}
              onPointerCancel={handlePointerCancel('left')}
              className={`h-11 rounded-xl font-bold flex items-center justify-center border transition-all active:scale-95 ${
                controls.left
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                  : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700/80'
              }`}
              style={{ touchAction: 'none' }}
              aria-label="Move Left"
            >
              ◀
            </button>

            {/* Center D-Pad Hub */}
            <div className="h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            </div>

            {/* RIGHT */}
            <button
              type="button"
              onPointerDown={handlePointerDown('right')}
              onPointerUp={handlePointerUp('right')}
              onPointerCancel={handlePointerCancel('right')}
              className={`h-11 rounded-xl font-bold flex items-center justify-center border transition-all active:scale-95 ${
                controls.right
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                  : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700/80'
              }`}
              style={{ touchAction: 'none' }}
              aria-label="Move Right"
            >
              ▶
            </button>

            {/* Bottom Left */}
            <div />

            {/* DOWN */}
            <button
              type="button"
              onPointerDown={handlePointerDown('down')}
              onPointerUp={handlePointerUp('down')}
              onPointerCancel={handlePointerCancel('down')}
              className={`h-11 rounded-xl font-bold flex items-center justify-center border transition-all active:scale-95 ${
                controls.down
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                  : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700/80'
              }`}
              style={{ touchAction: 'none' }}
              aria-label="Move Down"
            >
              ▼
            </button>

            {/* Bottom Right */}
            <div />
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-1">MOVE (HOLD)</span>
        </div>

        {/* Right Side: Big Attack / Fire Button & Hold Indicator */}
        <div className="flex flex-col items-center justify-center p-1">
          <button
            type="button"
            onPointerDown={handlePointerDown('attack')}
            onPointerUp={handlePointerUp('attack')}
            onPointerCancel={handlePointerCancel('attack')}
            className={`w-32 h-32 rounded-3xl font-black text-sm flex flex-col items-center justify-center gap-1.5 border-2 transition-all active:scale-95 shadow-xl ${
              controls.attack
                ? 'bg-rose-500 text-white border-rose-300 shadow-[0_0_24px_rgba(244,63,94,0.9)] scale-95'
                : 'bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 text-white border-rose-500/80 hover:from-rose-500 hover:to-rose-800'
            }`}
            style={{ touchAction: 'none' }}
            aria-label="Fire Weapon"
          >
            <Crosshair className={`w-8 h-8 ${controls.attack ? 'animate-spin' : ''}`} />
            <span className="tracking-widest uppercase font-mono font-bold text-xs">
              {controls.attack ? 'FIRING' : 'FIRE'}
            </span>
            <span className="text-[8px] font-mono tracking-tight text-rose-200 opacity-80">
              PRESS & HOLD
            </span>
          </button>
          <span className="text-[9px] font-mono text-slate-500 mt-1">RAPID AUTO-FIRE</span>
        </div>
      </div>
    </div>
  );
};
