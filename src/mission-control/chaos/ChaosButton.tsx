import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Zap,
  RotateCcw,
  Sparkles,
  AlertOctagon,
  Clock,
} from 'lucide-react';
import { selectRandomChaosEvent, playChaosSound } from './chaosEvents';
import { ChaosOverlay } from './ChaosOverlay';
import { unlockAchievement } from '../achievements';
import type { ChaosEventConfig } from './types';

const COOLDOWN_DURATION_SEC = 6;

interface ChaosButtonProps {
  onLogEvent?: (msg: string) => void;
}

export const ChaosButton: React.FC<ChaosButtonProps> = ({ onLogEvent }) => {
  const [activeEvent, setActiveEvent] = useState<ChaosEventConfig | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [totalChaosCount, setTotalChaosCount] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('mission_control_chaos_count') || '0', 10);
    } catch {
      return 0;
    }
  });

  const cooldownTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  const handleTriggerChaos = () => {
    if (cooldownRemaining > 0 || activeEvent !== null) return;

    // Pick random visual event
    const event = selectRandomChaosEvent();
    setActiveEvent(event);
    playChaosSound(event);

    // Increment count & save
    const nextCount = totalChaosCount + 1;
    setTotalChaosCount(nextCount);
    try {
      localStorage.setItem('mission_control_chaos_count', nextCount.toString());
    } catch {}

    // Achievements check
    unlockAchievement('entropy_unleashed');
    if (event.isRare) {
      unlockAchievement('cosmic_singularity');
    }

    if (onLogEvent) {
      onLogEvent(`CHAOS PROTOCOL: Activated [${event.badge}] - ${event.title}`);
    }

    // Start cooldown timer
    setCooldownRemaining(COOLDOWN_DURATION_SEC);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);

    cooldownTimerRef.current = window.setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEventComplete = () => {
    setActiveEvent(null);
  };

  const isCoolingDown = cooldownRemaining > 0;

  return (
    <>
      {/* Visual Overlay when event is active */}
      {activeEvent && (
        <ChaosOverlay event={activeEvent} onComplete={handleEventComplete} />
      )}

      {/* Tactical Chaos Command Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border-2 border-amber-600/60 p-4 sm:p-5 shadow-[0_0_25px_rgba(245,158,11,0.15)] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Decorative Hazard Stripe Top Border */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 opacity-80"
          style={{
            background:
              'repeating-linear-gradient(45deg, #d97706, #d97706 10px, #0f172a 10px, #0f172a 20px)',
          }}
        />

        {/* Info & Telemetry */}
        <div className="flex items-center gap-3.5">
          <div
            className={`p-3 rounded-2xl border transition-all ${
              activeEvent
                ? 'bg-amber-500 border-amber-300 text-black animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                : isCoolingDown
                ? 'bg-slate-950 border-slate-800 text-slate-500'
                : 'bg-amber-950/80 border-amber-700/80 text-amber-400'
            }`}
          >
            {activeEvent ? (
              <Sparkles className="w-6 h-6 animate-spin" />
            ) : (
              <Flame className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 tracking-wider">
                EXPERIMENTAL PROTOCOL
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                ACTIVATIONS: <strong className="text-amber-300">{totalChaosCount}</strong>
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-100 font-mono flex items-center gap-1.5">
              <span>QUANTUM CHAOS PROTOCOL</span>
              <span className="text-xs text-amber-400 font-normal">
                (Harmless Visual Anomalies)
              </span>
            </h3>

            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Triggers a harmless randomized sensory event (pixel rain, visual glitches, tectonic wobbles, alien intercepts, or the rare 1-in-30 Golden Singularity). All effects auto-restore.
            </p>
          </div>
        </div>

        {/* Action Button with Cooldown Countdown */}
        <div className="w-full md:w-auto shrink-0 flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={handleTriggerChaos}
            disabled={isCoolingDown || activeEvent !== null}
            className={`w-full md:w-auto px-5 py-3 rounded-xl font-mono text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeEvent !== null
                ? 'bg-amber-600 text-black border-2 border-amber-300 animate-pulse shadow-[0_0_25px_rgba(245,158,11,0.8)]'
                : isCoolingDown
                ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95'
            }`}
            title={isCoolingDown ? `Cooling down (${cooldownRemaining}s)` : 'Trigger Random Chaos Event'}
            aria-label="Trigger Chaos Protocol"
          >
            {activeEvent !== null ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-black" />
                <span>ANOMALY ACTIVE</span>
              </>
            ) : isCoolingDown ? (
              <>
                <Clock className="w-4 h-4 text-slate-500" />
                <span>COOLING DOWN ({cooldownRemaining}s)</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-slate-950 fill-current" />
                <span>INITIATE CHAOS</span>
              </>
            )}
          </button>

          <span className="text-[10px] font-mono text-slate-500">
            {isCoolingDown ? 'Anti-spam delay active' : 'Pure visual feedback · Safe'}
          </span>
        </div>
      </div>
    </>
  );
};
