import React from 'react';
import { ArrowLeft, ArrowRight, Flame, ShieldAlert, Pause, RotateCcw } from 'lucide-react';
import type { KeyControls } from './gameTypes';

interface MobileControlsProps {
  controls: KeyControls;
  onControlChange: (key: keyof KeyControls, pressed: boolean) => void;
  onPause: () => void;
  onRestart: () => void;
  gameState: 'start' | 'countdown' | 'playing' | 'paused' | 'gameover';
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  controls,
  onControlChange,
  onPause,
  onRestart,
  gameState,
}) => {
  const handleTouch = (key: keyof KeyControls, pressed: boolean) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onControlChange(key, pressed);
  };

  return (
    <div
      className="w-full max-w-xl mx-auto px-4 py-3 select-none touch-none"
      style={{ touchAction: 'none' }}
    >
      {/* Action Utility Bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onPause();
          }}
          className="flex-1 py-2 px-3 bg-slate-800/90 active:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95"
        >
          <Pause className="w-3.5 h-3.5 text-amber-400" />
          <span>{gameState === 'paused' ? 'RESUME' : 'PAUSE'}</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onRestart();
          }}
          className="flex-1 py-2 px-3 bg-slate-800/90 active:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>RESTART (R)</span>
        </button>
      </div>

      {/* Main Steering & Driving Touchpads */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Thumb: Steering */}
        <div className="bg-slate-900/80 p-2 rounded-2xl border border-slate-800 shadow-inner flex gap-2">
          <button
            type="button"
            onTouchStart={handleTouch('left', true)}
            onTouchEnd={handleTouch('left', false)}
            onMouseDown={handleTouch('left', true)}
            onMouseUp={handleTouch('left', false)}
            onMouseLeave={handleTouch('left', false)}
            className={`flex-1 h-16 rounded-xl flex flex-col items-center justify-center font-mono font-black text-sm transition-all ${
              controls.left
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-95'
                : 'bg-slate-800/90 text-cyan-400 border border-cyan-500/30'
            }`}
            aria-label="Steer Left"
          >
            <ArrowLeft className="w-7 h-7" />
            <span className="text-[10px] tracking-wider mt-0.5">LEFT</span>
          </button>

          <button
            type="button"
            onTouchStart={handleTouch('right', true)}
            onTouchEnd={handleTouch('right', false)}
            onMouseDown={handleTouch('right', true)}
            onMouseUp={handleTouch('right', false)}
            onMouseLeave={handleTouch('right', false)}
            className={`flex-1 h-16 rounded-xl flex flex-col items-center justify-center font-mono font-black text-sm transition-all ${
              controls.right
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-95'
                : 'bg-slate-800/90 text-cyan-400 border border-cyan-500/30'
            }`}
            aria-label="Steer Right"
          >
            <ArrowRight className="w-7 h-7" />
            <span className="text-[10px] tracking-wider mt-0.5">RIGHT</span>
          </button>
        </div>

        {/* Right Thumb: Brake & Gas */}
        <div className="bg-slate-900/80 p-2 rounded-2xl border border-slate-800 shadow-inner flex gap-2">
          <button
            type="button"
            onTouchStart={handleTouch('brake', true)}
            onTouchEnd={handleTouch('brake', false)}
            onMouseDown={handleTouch('brake', true)}
            onMouseUp={handleTouch('brake', false)}
            onMouseLeave={handleTouch('brake', false)}
            className={`w-2/5 h-16 rounded-xl flex flex-col items-center justify-center font-mono font-black text-xs transition-all ${
              controls.brake
                ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.7)] scale-95'
                : 'bg-slate-800/90 text-red-400 border border-red-500/30'
            }`}
            aria-label="Brake"
          >
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[9px] tracking-wider mt-0.5">BRAKE</span>
          </button>

          <button
            type="button"
            onTouchStart={handleTouch('accelerate', true)}
            onTouchEnd={handleTouch('accelerate', false)}
            onMouseDown={handleTouch('accelerate', true)}
            onMouseUp={handleTouch('accelerate', false)}
            onMouseLeave={handleTouch('accelerate', false)}
            className={`w-3/5 h-16 rounded-xl flex flex-col items-center justify-center font-mono font-black text-sm transition-all ${
              controls.accelerate
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.8)] scale-95'
                : 'bg-gradient-to-t from-amber-600/30 to-amber-500/20 text-amber-300 border border-amber-400/40'
            }`}
            aria-label="Accelerate"
          >
            <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
            <span className="text-[10px] tracking-wider mt-0.5">GAS / BOOST</span>
          </button>
        </div>
      </div>
    </div>
  );
};
