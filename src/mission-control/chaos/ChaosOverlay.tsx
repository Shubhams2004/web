import React, { useEffect, useState, useRef } from 'react';
import {
  Sparkles,
  Zap,
  Activity,
  AlertTriangle,
  Radio,
  X,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import type { ChaosEventConfig } from './types';

interface ChaosOverlayProps {
  event: ChaosEventConfig;
  onComplete: () => void;
}

export const ChaosOverlay: React.FC<ChaosOverlayProps> = ({ event, onComplete }) => {
  const [progress, setProgress] = useState<number>(100);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check reduced motion preference
  useEffect(() => {
    try {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(media.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } catch {
      setPrefersReducedMotion(false);
    }
  }, []);

  // Timer countdown and auto-cleanup
  useEffect(() => {
    const startTime = Date.now();
    const duration = event.durationMs;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(interval);
        onComplete();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [event, onComplete]);

  // Particle explosion canvas animation
  useEffect(() => {
    if (event.id !== 'particle_burst' && event.id !== 'golden_singularity') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const isGolden = event.id === 'golden_singularity';
    const numParticles = isGolden ? 180 : 120;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const colors = isGolden
      ? ['#fbbf24', '#f59e0b', '#fef08a', '#ffffff', '#d97706']
      : ['#06b6d4', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#a855f7'];

    const particles = Array.from({ length: numParticles }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (isGolden ? 12 : 9) + 2;
      return {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * (isGolden ? 5 : 4) + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.015 + 0.008,
        gravity: 0.12,
      };
    });

    let animId: number;
    const renderParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha = Math.max(0, p.alpha - p.decay);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(renderParticles);
    };

    animId = requestAnimationFrame(renderParticles);
    return () => cancelAnimationFrame(animId);
  }, [event]);

  // Handle screen wobble on the main page wrapper
  useEffect(() => {
    if (event.id !== 'screen_wobble' || prefersReducedMotion) return;

    // Apply temporary animated wobble CSS
    const rootEl = document.getElementById('root') || document.body;
    rootEl.style.transition = 'transform 0.1s ease-in-out';

    let count = 0;
    const wobbleInterval = setInterval(() => {
      count++;
      const damp = Math.max(0, 1 - count / 25);
      const angle = (Math.sin(count * 0.8) * 1.8 * damp).toFixed(2);
      const shiftX = (Math.cos(count * 1.2) * 5 * damp).toFixed(1);
      const shiftY = (Math.sin(count * 1.1) * 3 * damp).toFixed(1);

      rootEl.style.transform = `translate(${shiftX}px, ${shiftY}px) rotate(${angle}deg)`;

      if (count > 25) {
        clearInterval(wobbleInterval);
        rootEl.style.transform = '';
      }
    }, 80);

    return () => {
      clearInterval(wobbleInterval);
      rootEl.style.transform = '';
      rootEl.style.transition = '';
    };
  }, [event, prefersReducedMotion]);

  // Emojis for pixel rain
  const emojis = ['👾', '🕹️', '🚀', '💣', '💎', '💀', '⚡', '🪙', '🍕', '🍄', '🛸', '✨', '🗡️'];
  const rainItems = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    emoji: emojis[i % emojis.length],
    left: `${(i * 2.8 + Math.random() * 2).toFixed(1)}%`,
    delay: `${(Math.random() * 1.8).toFixed(2)}s`,
    duration: `${(Math.random() * 1.5 + 2).toFixed(2)}s`,
    size: `${Math.floor(Math.random() * 16 + 20)}px`,
  }));

  // Falling debris items
  const debrisItems = [
    { text: 'SEC-01', color: 'border-cyan-500 text-cyan-300' },
    { text: 'HP +100', color: 'border-emerald-500 text-emerald-300' },
    { text: '⚠️ FLUX', color: 'border-amber-500 text-amber-300' },
    { text: '🗝️ KEY', color: 'border-yellow-400 text-yellow-300' },
    { text: '404 BUFFER', color: 'border-rose-500 text-rose-300' },
    { text: '60 FPS', color: 'border-sky-500 text-sky-300' },
    { text: 'NITRO BOOST', color: 'border-orange-500 text-orange-300' },
    { text: 'SLICER.EXE', color: 'border-purple-500 text-purple-300' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden select-none"
      aria-live="polite"
      role="status"
    >
      {/* Top Banner Alert (Heads-up feedback) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-lg pointer-events-auto">
        <div
          className={`backdrop-blur-md border rounded-2xl p-3.5 shadow-2xl transition-all ${
            event.isRare
              ? 'bg-amber-950/90 border-amber-400 text-amber-100 shadow-[0_0_30px_rgba(245,158,11,0.5)]'
              : 'bg-slate-950/90 border-cyan-500 text-slate-100 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-1.5 font-mono text-xs">
            <div className="flex items-center gap-2">
              {event.isRare ? (
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              ) : (
                <Flame className="w-4 h-4 text-cyan-400 animate-pulse" />
              )}
              <span
                className={`font-black tracking-wider uppercase text-[11px] ${
                  event.isRare ? 'text-amber-300' : 'text-cyan-300'
                }`}
              >
                {event.badge}
              </span>
            </div>

            <button
              type="button"
              onClick={onComplete}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              title="Dismiss Anomaly"
              aria-label="Dismiss Chaos Anomaly"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="font-bold text-sm font-mono tracking-wide">{event.title}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{event.subtitle}</div>

          {/* Progress countdown bar */}
          <div className="mt-2.5 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-75 rounded-full ${
                event.isRare ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          EVENT 1: Pixel / Emoji Rain
          ========================================================================= */}
      {event.id === 'emoji_rain' && (
        <div className="absolute inset-0 pointer-events-none">
          {rainItems.map((item) => (
            <div
              key={item.id}
              className="absolute animate-bounce"
              style={{
                left: item.left,
                top: '-40px',
                fontSize: item.size,
                animation: prefersReducedMotion
                  ? 'none'
                  : `chaos-rain ${item.duration} cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite`,
                animationDelay: item.delay,
              }}
            >
              {item.emoji}
            </div>
          ))}
          <style>{`
            @keyframes chaos-rain {
              0% { transform: translateY(-30px) rotate(0deg); opacity: 0; }
              15% { opacity: 1; }
              85% { opacity: 1; }
              100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* =========================================================================
          EVENT 2: UI Glitch & Chromatic Aberration
          ========================================================================= */}
      {event.id === 'ui_glitch' && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Chromatic shift overlay */}
          <div className="absolute inset-0 bg-cyan-500/10 mix-blend-screen animate-pulse" />
          <div className="absolute inset-0 bg-rose-500/10 mix-blend-screen animate-ping" />

          {/* Glitch Scanlines */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 2px, transparent 2px, transparent 4px)',
            }}
          />

          {/* Random horizontal glitch slices */}
          <div className="absolute top-1/4 left-0 right-0 h-12 bg-cyan-400/20 translate-x-3 mix-blend-difference" />
          <div className="absolute top-1/2 left-0 right-0 h-8 bg-rose-400/20 -translate-x-4 mix-blend-difference" />
          <div className="absolute top-3/4 left-0 right-0 h-16 bg-emerald-400/20 translate-x-2 mix-blend-difference" />

          {/* Digital static code blocks */}
          <div className="absolute bottom-8 left-8 p-3 rounded-lg bg-black/80 border border-emerald-500/60 font-mono text-[10px] text-emerald-400 max-w-xs space-y-0.5">
            <div>&gt; MEM_FAULT: 0x8849F03B [DUMP]</div>
            <div>&gt; BUFFER_SWAP: RGB_CHROMA_DESYNC</div>
            <div>&gt; RECOVERY_DAEMON: NOMINAL STATUS IMMINENT</div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EVENT 3: Screen Wobble (Ripple Water Effect)
          ========================================================================= */}
      {event.id === 'screen_wobble' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[85vw] h-[85vh] rounded-full border-4 border-cyan-400/30 animate-ping" />
          <div className="absolute w-[60vw] h-[60vh] rounded-full border-2 border-cyan-300/40 animate-pulse" />
          <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/80 text-cyan-300 font-mono text-xs font-bold shadow-lg">
            GRAVITATIONAL DISRUPTION DETECTED
          </div>
        </div>
      )}

      {/* =========================================================================
          EVENT 4: Retro 1984 Arcade Mode
          ========================================================================= */}
      {event.id === 'retro_arcade' && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Phosphor green tint */}
          <div className="absolute inset-0 bg-emerald-950/40 mix-blend-color" />

          {/* Heavy CRT scanline raster */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'repeating-linear-gradient(0deg, rgba(0,255,100,0.08) 0px, rgba(0,255,100,0.08) 1px, transparent 1px, transparent 3px)',
            }}
          />

          {/* CRT Curved vignette shadow */}
          <div
            className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.9)]"
            style={{
              borderRadius: '24px',
            }}
          />

          {/* Retro Arcade Marquee Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/90 border-2 border-emerald-400 text-emerald-400 font-mono text-xs font-black tracking-widest text-center shadow-[0_0_15px_rgba(52,211,153,0.6)]">
            INSERT COIN · 1 PLAYER READY · INSERT 25¢
          </div>
        </div>
      )}

      {/* =========================================================================
          EVENT 5: Falling UI Elements / Debris
          ========================================================================= */}
      {event.id === 'falling_debris' && (
        <div className="absolute inset-0 pointer-events-none">
          {debrisItems.map((item, idx) => (
            <div
              key={idx}
              className={`absolute px-3 py-1.5 rounded-lg bg-slate-950/90 border font-mono text-xs font-bold shadow-lg ${item.color}`}
              style={{
                left: `${12 + idx * 11}%`,
                top: '-50px',
                animation: prefersReducedMotion
                  ? 'none'
                  : `debris-fall ${2.4 + (idx % 3) * 0.4}s ease-in forwards`,
                animationDelay: `${idx * 0.15}s`,
              }}
            >
              {item.text}
            </div>
          ))}
          <style>{`
            @keyframes debris-fall {
              0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
              20% { opacity: 1; }
              80% { transform: translateY(85vh) rotate(180deg); }
              90% { transform: translateY(78vh) rotate(190deg); }
              100% { transform: translateY(85vh) rotate(185deg); opacity: 0.9; }
            }
          `}</style>
        </div>
      )}

      {/* =========================================================================
          EVENT 6: Particle Explosion (Canvas)
          ========================================================================= */}
      {(event.id === 'particle_burst' || event.id === 'golden_singularity') && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      )}

      {/* =========================================================================
          EVENT 7: Alien Signal Radar
          ========================================================================= */}
      {event.id === 'alien_signal' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Radar sweeping circle */}
          <div className="relative w-72 h-72 rounded-full border-2 border-emerald-500/60 bg-emerald-950/20 shadow-[0_0_50px_rgba(16,185,129,0.2)] flex items-center justify-center">
            {/* Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-500/40" />
            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-emerald-500/40" />
            <div className="w-48 h-48 rounded-full border border-emerald-500/30" />
            <div className="w-24 h-24 rounded-full border border-emerald-500/30" />

            {/* Sweep radar cone */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, rgba(16,185,129,0.3) 60deg, transparent 65deg)',
                animation: prefersReducedMotion ? 'none' : 'radar-spin 2s linear infinite',
              }}
            />

            {/* Alien Glyph Intercept */}
            <div className="relative z-10 text-center font-mono space-y-1">
              <div className="text-3xl animate-bounce">👽</div>
              <div className="text-[11px] font-bold text-emerald-300 tracking-widest">
                ⍙⟒ ☊⍜⋔⟒ ⟟⋏ ⌿⟒⏃☊⟒
              </div>
              <div className="text-[9px] text-emerald-400">BEACON LOCKED · FREQ 1420MHz</div>
            </div>
          </div>
          <style>{`
            @keyframes radar-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* =========================================================================
          EVENT 8: Fake System Instability Sequence
          ========================================================================= */}
      {event.id === 'instability_sequence' && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-rose-950/90 border-2 border-rose-500 rounded-2xl p-5 text-rose-100 font-mono shadow-[0_0_40px_rgba(244,63,94,0.4)] space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-rose-400 font-black text-sm">
              <AlertTriangle className="w-5 h-5 animate-ping" />
              <span>CORE INSTABILITY IN PROGRESS</span>
            </div>

            <p className="text-xs text-rose-200">
              Heuristic subroutines desynchronized. Attempting memory integrity reconciliation...
            </p>

            <div className="py-2 px-3 bg-black/60 rounded-xl border border-rose-900 text-xs flex items-center justify-between text-rose-400">
              <span>AUTO-RECOVERY:</span>
              <span className="font-bold text-emerald-400">NOMINAL IN {Math.ceil(progress / 25)}s</span>
            </div>

            <div className="text-[10px] text-rose-300">
              *Harmless visual anomaly demonstration. No systems or data were affected.
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EVENT 9: Mythic Golden Singularity (Rare Event)
          ========================================================================= */}
      {event.id === 'golden_singularity' && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
          <div className="absolute inset-0 bg-amber-500/10 mix-blend-screen" />
          <div className="max-w-lg w-full bg-gradient-to-b from-amber-950/95 to-slate-950/95 border-2 border-amber-400 rounded-3xl p-6 text-center space-y-3 font-mono shadow-[0_0_60px_rgba(245,158,11,0.6)]">
            <div className="inline-flex p-3 rounded-2xl bg-amber-900/60 border border-amber-400 text-amber-300 shadow-md">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>

            <h3 className="text-lg font-black tracking-widest text-amber-300 uppercase">
              GOLDEN MATRIX SINGULARITY
            </h3>

            <p className="text-xs text-amber-100 leading-relaxed">
              You hit the ultra-rare <strong>1-in-30 anomaly</strong>! The command center heuristics have entered a momentary state of cosmic retro alignment.
            </p>

            <div className="inline-block px-3 py-1 bg-amber-900/80 border border-amber-400/80 text-amber-200 rounded-full text-xs font-bold">
              🌟 SPECIAL ANOMALY TROPHY UNLOCKED 🌟
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
