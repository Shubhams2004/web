import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Flame,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import { audio } from './audio';
import type { KeyControls } from './gameTypes';

interface MobileControlsProps {
  controls: KeyControls;
  onControlChange: (key: keyof KeyControls, pressed: boolean) => void;
  onPause: () => void;
  onRestart: () => void;
  gameState: 'start' | 'countdown' | 'playing' | 'paused' | 'gameover';
}

type ControlLayoutMode = 'split' | 'dpad';

export const MobileControls: React.FC<MobileControlsProps> = ({
  controls,
  onControlChange,
  onPause,
  onRestart,
  gameState,
}) => {
  const [layoutMode, setLayoutMode] = useState<ControlLayoutMode>('split');

  // Track active pointer IDs per control key to support multi-touch and press-and-hold perfectly
  const pointerMapRef = useRef<Map<keyof KeyControls, Set<number>>>(
    new Map([
      ['left', new Set<number>()],
      ['right', new Set<number>()],
      ['accelerate', new Set<number>()],
      ['brake', new Set<number>()],
    ])
  );

  // Release all active controls safely
  const releaseAllControls = useCallback(() => {
    const keys: (keyof KeyControls)[] = ['left', 'right', 'accelerate', 'brake'];
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

  // Window-level safety listeners: prevent controls from getting stuck
  useEffect(() => {
    const handleGlobalPointerUpOrCancel = (e: PointerEvent) => {
      let changed = false;
      pointerMapRef.current.forEach((pointers, key) => {
        if (pointers.has(e.pointerId)) {
          pointers.delete(e.pointerId);
          if (pointers.size === 0) {
            onControlChange(key, false);
            changed = true;
          }
        }
      });
      if (changed) {
        // State updated
      }
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

  // Pointer event handlers for arcade buttons
  const handlePointerDown = (key: keyof KeyControls) => (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    audio.userInteracted();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if setPointerCapture is unsupported on specific platform
    }

    const set = pointerMapRef.current.get(key);
    if (set) {
      set.add(e.pointerId);
    }
    onControlChange(key, true);
  };

  const handlePointerUp = (key: keyof KeyControls) => (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    const set = pointerMapRef.current.get(key);
    if (set) {
      set.delete(e.pointerId);
      if (set.size === 0) {
        onControlChange(key, false);
      }
    } else {
      onControlChange(key, false);
    }
  };

  const handlePointerCancel = (key: keyof KeyControls) => (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    const set = pointerMapRef.current.get(key);
    if (set) {
      set.delete(e.pointerId);
      if (set.size === 0) {
        onControlChange(key, false);
      }
    } else {
      onControlChange(key, false);
    }
  };

  const toggleLayoutMode = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    releaseAllControls();
    setLayoutMode((prev) => (prev === 'split' ? 'dpad' : 'split'));
  };

  return (
    <div
      className="w-full max-w-[480px] mx-auto select-none touch-none"
      style={{
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
      onContextMenu={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
    >
      {/* Control Pad Console Enclosure (Directly adjacent to game screen) */}
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-2.5 sm:p-3 rounded-2xl border-2 border-slate-800 shadow-[0_6px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.06)]">
        {/* Subtle decorative corner rivets */}
        <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-slate-700 shadow-inner" />
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-700 shadow-inner" />

        {/* LAYOUT 1: SPLIT-THUMB ERGONOMIC CONSOLE (Default) */}
        {layoutMode === 'split' ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 items-center">
            {/* Left Thumb Cluster: STEERING (◀ Left, ▶ Right) */}
            <div className="flex flex-col gap-1.5 bg-slate-950/70 p-2 rounded-xl border border-slate-800/90 shadow-inner">
              <div className="flex items-center justify-between px-1 text-[9px] font-mono tracking-wider text-slate-500 font-semibold">
                <span>STEERING</span>
                <span className="text-cyan-400">LATERAL</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {/* ◀ Steer Left */}
                <button
                  type="button"
                  onPointerDown={handlePointerDown('left')}
                  onPointerUp={handlePointerUp('left')}
                  onPointerCancel={handlePointerCancel('left')}
                  className={`h-18 sm:h-20 rounded-xl flex flex-col items-center justify-center font-mono transition-all duration-75 select-none touch-none border-2 shadow-md ${
                    controls.left
                      ? 'bg-gradient-to-b from-cyan-400 to-cyan-500 text-slate-950 border-cyan-200 translate-y-1 shadow-[0_0_20px_rgba(6,182,212,0.9),inset_0_2px_4px_rgba(0,0,0,0.3)]'
                      : 'bg-gradient-to-b from-slate-800 to-slate-850 text-cyan-400 border-cyan-500/30 hover:border-cyan-500/60 shadow-[0_3px_0_#0f172a]'
                  }`}
                  aria-label="Steer Left"
                >
                  <span className="text-2xl sm:text-3xl font-black leading-none drop-shadow-sm">
                    ◀
                  </span>
                  <span className="text-[10px] sm:text-xs font-black tracking-wider mt-1 uppercase">
                    LEFT
                  </span>
                </button>

                {/* ▶ Steer Right */}
                <button
                  type="button"
                  onPointerDown={handlePointerDown('right')}
                  onPointerUp={handlePointerUp('right')}
                  onPointerCancel={handlePointerCancel('right')}
                  className={`h-18 sm:h-20 rounded-xl flex flex-col items-center justify-center font-mono transition-all duration-75 select-none touch-none border-2 shadow-md ${
                    controls.right
                      ? 'bg-gradient-to-b from-cyan-400 to-cyan-500 text-slate-950 border-cyan-200 translate-y-1 shadow-[0_0_20px_rgba(6,182,212,0.9),inset_0_2px_4px_rgba(0,0,0,0.3)]'
                      : 'bg-gradient-to-b from-slate-800 to-slate-850 text-cyan-400 border-cyan-500/30 hover:border-cyan-500/60 shadow-[0_3px_0_#0f172a]'
                  }`}
                  aria-label="Steer Right"
                >
                  <span className="text-2xl sm:text-3xl font-black leading-none drop-shadow-sm">
                    ▶
                  </span>
                  <span className="text-[10px] sm:text-xs font-black tracking-wider mt-1 uppercase">
                    RIGHT
                  </span>
                </button>
              </div>
            </div>

            {/* Right Thumb Cluster: PEDALS (▲ Accelerate, ▼ Brake/Reverse) */}
            <div className="flex flex-col gap-1.5 bg-slate-950/70 p-2 rounded-xl border border-slate-800/90 shadow-inner">
              <div className="flex items-center justify-between px-1 text-[9px] font-mono tracking-wider text-slate-500 font-semibold">
                <span>THROTTLE</span>
                <span className="text-amber-400">PEDALS</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {/* ▼ Brake / Reverse */}
                <button
                  type="button"
                  onPointerDown={handlePointerDown('brake')}
                  onPointerUp={handlePointerUp('brake')}
                  onPointerCancel={handlePointerCancel('brake')}
                  className={`h-18 sm:h-20 rounded-xl flex flex-col items-center justify-center font-mono transition-all duration-75 select-none touch-none border-2 shadow-md ${
                    controls.brake
                      ? 'bg-gradient-to-b from-rose-500 to-red-600 text-white border-rose-300 translate-y-1 shadow-[0_0_20px_rgba(239,68,68,0.9),inset_0_2px_4px_rgba(0,0,0,0.4)]'
                      : 'bg-gradient-to-b from-slate-800 to-slate-850 text-rose-400 border-rose-500/30 hover:border-rose-500/60 shadow-[0_3px_0_#0f172a]'
                  }`}
                  aria-label="Brake or Reverse"
                >
                  <span className="text-2xl sm:text-3xl font-black leading-none drop-shadow-sm flex items-center justify-center gap-0.5">
                    ▼
                  </span>
                  <span className="text-[10px] sm:text-xs font-black tracking-wider mt-1 uppercase flex items-center gap-0.5">
                    <ShieldAlert className="w-3 h-3 hidden xs:inline" />
                    BRAKE
                  </span>
                </button>

                {/* ▲ Accelerate */}
                <button
                  type="button"
                  onPointerDown={handlePointerDown('accelerate')}
                  onPointerUp={handlePointerUp('accelerate')}
                  onPointerCancel={handlePointerCancel('accelerate')}
                  className={`h-18 sm:h-20 rounded-xl flex flex-col items-center justify-center font-mono transition-all duration-75 select-none touch-none border-2 shadow-md ${
                    controls.accelerate
                      ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-yellow-500 text-slate-950 border-amber-100 translate-y-1 shadow-[0_0_26px_rgba(245,158,11,1),inset_0_2px_4px_rgba(0,0,0,0.3)]'
                      : 'bg-gradient-to-b from-slate-800 to-slate-850 text-amber-300 border-amber-400/40 hover:border-amber-400/70 shadow-[0_3px_0_#0f172a]'
                  }`}
                  aria-label="Accelerate"
                >
                  <span className="text-2xl sm:text-3xl font-black leading-none drop-shadow-sm flex items-center justify-center gap-0.5">
                    ▲
                  </span>
                  <span className="text-[10px] sm:text-xs font-black tracking-wider mt-1 uppercase flex items-center gap-0.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse hidden xs:inline" />
                    GAS
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* LAYOUT 2: CLASSIC ARCADE D-PAD CROSS WITH COMPACT ACTION PEDALS */
          <div className="flex flex-col sm:flex-row items-center justify-around gap-3 sm:gap-5 py-1">
            {/* 4-Way D-Pad Cross Cluster */}
            <div className="relative w-40 h-40 flex items-center justify-center bg-slate-950/80 p-2 rounded-full border border-slate-800 shadow-inner">
              {/* Central Hub Plate */}
              <div className="absolute w-10 h-10 rounded-full bg-slate-900 border border-slate-700/80 z-10 pointer-events-none flex items-center justify-center shadow-inner">
                <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-700" />
              </div>

              {/* ▲ Accelerate / Forward (Top of D-Pad) */}
              <button
                type="button"
                onPointerDown={handlePointerDown('accelerate')}
                onPointerUp={handlePointerUp('accelerate')}
                onPointerCancel={handlePointerCancel('accelerate')}
                className={`absolute top-1 left-1/2 -translate-x-1/2 w-13 h-14 rounded-t-xl rounded-b-md flex flex-col items-center justify-start pt-1.5 font-mono border-2 transition-all ${
                  controls.accelerate
                    ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.9)] translate-y-0.5'
                    : 'bg-slate-800 text-amber-300 border-amber-400/30'
                }`}
                aria-label="Accelerate (Up)"
              >
                <span className="text-xl font-black leading-none">▲</span>
                <span className="text-[8px] font-bold mt-0.5 tracking-tighter">GAS</span>
              </button>

              {/* ▼ Brake / Reverse (Bottom of D-Pad) */}
              <button
                type="button"
                onPointerDown={handlePointerDown('brake')}
                onPointerUp={handlePointerUp('brake')}
                onPointerCancel={handlePointerCancel('brake')}
                className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-13 h-14 rounded-b-xl rounded-t-md flex flex-col items-center justify-end pb-1.5 font-mono border-2 transition-all ${
                  controls.brake
                    ? 'bg-rose-500 text-white border-rose-200 shadow-[0_0_20px_rgba(239,68,68,0.9)] -translate-y-0.5'
                    : 'bg-slate-800 text-rose-400 border-rose-500/30'
                }`}
                aria-label="Brake / Reverse (Down)"
              >
                <span className="text-[8px] font-bold mb-0.5 tracking-tighter">BRAKE</span>
                <span className="text-xl font-black leading-none">▼</span>
              </button>

              {/* ◀ Steer Left (Left of D-Pad) */}
              <button
                type="button"
                onPointerDown={handlePointerDown('left')}
                onPointerUp={handlePointerUp('left')}
                onPointerCancel={handlePointerCancel('left')}
                className={`absolute left-1 top-1/2 -translate-y-1/2 w-14 h-13 rounded-l-xl rounded-r-md flex items-center justify-start pl-2 font-mono border-2 transition-all ${
                  controls.left
                    ? 'bg-cyan-400 text-slate-950 border-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.9)] translate-x-0.5'
                    : 'bg-slate-800 text-cyan-400 border-cyan-500/30'
                }`}
                aria-label="Steer Left"
              >
                <span className="text-xl font-black leading-none">◀</span>
                <span className="text-[8px] font-bold ml-1 tracking-tighter">LEFT</span>
              </button>

              {/* ▶ Steer Right (Right of D-Pad) */}
              <button
                type="button"
                onPointerDown={handlePointerDown('right')}
                onPointerUp={handlePointerUp('right')}
                onPointerCancel={handlePointerCancel('right')}
                className={`absolute right-1 top-1/2 -translate-y-1/2 w-14 h-13 rounded-r-xl rounded-l-md flex items-center justify-end pr-2 font-mono border-2 transition-all ${
                  controls.right
                    ? 'bg-cyan-400 text-slate-950 border-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.9)] -translate-x-0.5'
                    : 'bg-slate-800 text-cyan-400 border-cyan-500/30'
                }`}
                aria-label="Steer Right"
              >
                <span className="text-[8px] font-bold mr-1 tracking-tighter">RIGHT</span>
                <span className="text-xl font-black leading-none">▶</span>
              </button>
            </div>

            {/* Quick Action Side Buttons for Gas & Brake in D-Pad Mode */}
            <div className="flex sm:flex-col gap-2.5 w-full sm:w-40">
              <button
                type="button"
                onPointerDown={handlePointerDown('accelerate')}
                onPointerUp={handlePointerUp('accelerate')}
                onPointerCancel={handlePointerCancel('accelerate')}
                className={`flex-1 sm:h-16 py-2.5 rounded-xl font-mono flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${
                  controls.accelerate
                    ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.9)]'
                    : 'bg-slate-800 text-amber-300 border-amber-400/40 shadow-[0_3px_0_#0f172a]'
                }`}
                aria-label="Gas Action Button"
              >
                <span className="text-xl font-black">▲</span>
                <span className="text-xs font-black tracking-wider uppercase">BOOST / GAS</span>
              </button>

              <button
                type="button"
                onPointerDown={handlePointerDown('brake')}
                onPointerUp={handlePointerUp('brake')}
                onPointerCancel={handlePointerCancel('brake')}
                className={`flex-1 sm:h-16 py-2.5 rounded-xl font-mono flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${
                  controls.brake
                    ? 'bg-rose-500 text-white border-rose-200 shadow-[0_0_20px_rgba(239,68,68,0.9)]'
                    : 'bg-slate-800 text-rose-400 border-rose-500/40 shadow-[0_3px_0_#0f172a]'
                }`}
                aria-label="Brake Action Button"
              >
                <span className="text-xl font-black">▼</span>
                <span className="text-xs font-black tracking-wider uppercase">BRAKE / REV</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Input Telemetry Feedback Bar */}
        <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500 uppercase tracking-wider text-[9px]">ACTIVE:</span>
            <span className={controls.left ? 'text-cyan-400 font-bold' : 'text-slate-600'}>
              ◀ L
            </span>
            <span className={controls.right ? 'text-cyan-400 font-bold' : 'text-slate-600'}>
              ▶ R
            </span>
            <span className={controls.accelerate ? 'text-amber-400 font-bold' : 'text-slate-600'}>
              ▲ GAS
            </span>
            <span className={controls.brake ? 'text-rose-400 font-bold' : 'text-slate-600'}>
              ▼ BRK
            </span>
          </div>

          <div className="text-[9px] text-slate-500">
            <span>PRESS & HOLD</span>
          </div>
        </div>

        {/* BOTTOM ACTION BAR: PAUSE, RESTART & LAYOUT SWITCHER (Placed below the control pads) */}
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              audio.userInteracted();
              onPause();
            }}
            className={`flex-1 py-2 px-2.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold flex items-center justify-center gap-1.5 border transition-all active:scale-95 ${
              gameState === 'paused'
                ? 'bg-amber-500/25 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {gameState === 'paused' ? (
              <>
                <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>RESUME</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>PAUSE (SPACE)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              audio.userInteracted();
              onRestart();
            }}
            className="flex-1 py-2 px-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] sm:text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>RESTART (R)</span>
          </button>

          <button
            type="button"
            onClick={toggleLayoutMode}
            className="px-2.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg text-[10px] sm:text-[11px] font-mono font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            title="Toggle Control Layout: Split Thumbs vs D-Pad Cross"
          >
            {layoutMode === 'split' ? (
              <>
                <Compass className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden xs:inline">D-PAD</span>
              </>
            ) : (
              <>
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden xs:inline">SPLIT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
