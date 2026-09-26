import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Particle, GravitySettings, SimulationTelemetry } from '../../types';
import { missionAudio } from '../../../../mission-control/audio';

interface GravitySandboxCanvasProps {
  settings: GravitySettings;
  isPaused: boolean;
  stepTrigger: number;
  particles: Particle[];
  setParticles: React.Dispatch<React.SetStateAction<Particle[]>>;
  onUpdateTelemetry: (telemetry: SimulationTelemetry) => void;
  className?: string;
}

export const GravitySandboxCanvas: React.FC<GravitySandboxCanvasProps> = ({
  settings,
  isPaused,
  stepTrigger,
  particles,
  setParticles,
  onUpdateTelemetry,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Interaction dragging state
  const draggingIdRef = useRef<string | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const dragVelocityHistoryRef = useRef<Array<{ x: number; y: number; time: number }>>([]);
  const pointerWellRef = useRef<{ x: number; y: number; active: boolean; isRepel: boolean }>({
    x: 0,
    y: 0,
    active: false,
    isRepel: false,
  });

  // Hover indicator
  const [hoveredParticle, setHoveredParticle] = useState<string | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });

  // Refs for animation loop access without stale closure
  const particlesRef = useRef<Particle[]>(particles);
  particlesRef.current = particles;
  const settingsRef = useRef<GravitySettings>(settings);
  settingsRef.current = settings;
  const isPausedRef = useRef<boolean>(isPaused);
  isPausedRef.current = isPaused;

  // FPS tracking
  const fpsTrackerRef = useRef<{ frames: number; lastTime: number; fps: number }>({
    frames: 0,
    lastTime: performance.now(),
    fps: 60,
  });

  // Handle Canvas Resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rAFId: number | null = null;

    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(320, Math.floor(rect.width));
      const height = Math.max(300, Math.floor(rect.height));

      setCanvasDimensions((prev) => {
        if (prev.width === width && prev.height === height) return prev;
        return { width, height };
      });

      const canvas = canvasRef.current;
      if (canvas) {
        const targetW = width * dpr;
        const targetH = height * dpr;
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(dpr, dpr);
        }
      }
    };

    handleResize();

    const observer = new ResizeObserver(() => {
      if (rAFId !== null) {
        cancelAnimationFrame(rAFId);
      }
      rAFId = requestAnimationFrame(() => {
        handleResize();
      });
    });

    observer.observe(container);

    return () => {
      if (rAFId !== null) {
        cancelAnimationFrame(rAFId);
      }
      observer.disconnect();
    };
  }, []);

  // Step physics simulation by 1 dt
  const stepPhysics = useCallback((dt: number) => {
    const list = [...particlesRef.current];
    const s = settingsRef.current;
    const { width, height } = canvasDimensions;
    const effectiveG = s.gravityConstant * 0.4;
    const softening = 24; // Softening parameter to prevent infinity slingshot
    const draggingId = draggingIdRef.current;

    let totalKinetic = 0;

    // 1. Calculate mutual gravitational acceleration
    const accelerations = list.map(() => ({ ax: 0, ay: 0 }));

    for (let i = 0; i < list.length; i++) {
      const p1 = list[i];
      if (p1.id === draggingId && p1.isFixed) continue;

      for (let j = i + 1; j < list.length; j++) {
        const p2 = list[j];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq + softening * softening);

        // Standard Newton F = G * m1 * m2 / r^2
        const forceMagnitude = (effectiveG * p1.mass * p2.mass) / (distSq + softening);

        let f1x = (forceMagnitude * dx) / dist;
        let f1y = (forceMagnitude * dy) / dist;

        // Attractor/Repeller multipliers
        if (p2.isRepeller) {
          f1x *= -2.5;
          f1y *= -2.5;
        } else if (p2.isAttractor) {
          f1x *= 1.8;
          f1y *= 1.8;
        }

        if (p1.isRepeller) {
          f1x *= 2.5;
          f1y *= 2.5;
        }

        // Apply a = F / m
        if (p1.id !== draggingId && !p1.isFixed) {
          accelerations[i].ax += f1x / p1.mass;
          accelerations[i].ay += f1y / p1.mass;
        }

        if (p2.id !== draggingId && !p2.isFixed) {
          accelerations[j].ax -= f1x / p2.mass;
          accelerations[j].ay -= f1y / p2.mass;
        }
      }

      // Pointer gravity well / repeller
      if (pointerWellRef.current.active && p1.id !== draggingId && !p1.isFixed) {
        const pdx = pointerWellRef.current.x - p1.x;
        const pdy = pointerWellRef.current.y - p1.y;
        const pdistSq = pdx * pdx + pdy * pdy;
        const pdist = Math.sqrt(pdistSq + 100);
        const pForce = (effectiveG * p1.mass * 800) / (pdistSq + 150);
        const sign = pointerWellRef.current.isRepel ? -1.8 : 1.5;

        accelerations[i].ax += (sign * pForce * pdx) / (pdist * p1.mass);
        accelerations[i].ay += (sign * pForce * pdy) / (pdist * p1.mass);
      }
    }

    // 2. Integrate velocities and positions
    const updated: Particle[] = [];

    for (let i = 0; i < list.length; i++) {
      const p = { ...list[i] };

      if (p.id === draggingId) {
        // Position updated by pointer event
        updated.push(p);
        continue;
      }

      if (!p.isFixed) {
        p.vx += accelerations[i].ax * dt;
        p.vy += accelerations[i].ay * dt;

        // Apply collision damping / atmospheric friction
        p.vx *= s.collisionDamping;
        p.vy *= s.collisionDamping;

        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }

      // Kinetic energy E_k = 0.5 * m * v^2
      const speedSq = p.vx * p.vx + p.vy * p.vy;
      totalKinetic += 0.5 * p.mass * speedSq;

      // Handle boundaries
      if (s.boundaryMode === 'bounce') {
        const r = p.radius;
        if (p.x < r) {
          p.x = r;
          p.vx = -p.vx * 0.85;
        } else if (p.x > width - r) {
          p.x = width - r;
          p.vx = -p.vx * 0.85;
        }

        if (p.y < r) {
          p.y = r;
          p.vy = -p.vy * 0.85;
        } else if (p.y > height - r) {
          p.y = height - r;
          p.vy = -p.vy * 0.85;
        }
      } else if (s.boundaryMode === 'wrap') {
        const margin = 20;
        if (p.x < -margin) p.x = width + margin;
        else if (p.x > width + margin) p.x = -margin;

        if (p.y < -margin) p.y = height + margin;
        else if (p.y > height + margin) p.y = -margin;
      } else if (s.boundaryMode === 'void') {
        // Discard particles that left boundaries by 2.5x
        if (
          p.x < -width * 0.5 ||
          p.x > width * 1.5 ||
          p.y < -height * 0.5 ||
          p.y > height * 1.5
        ) {
          continue;
        }
      }

      // Update particle orbital trail history
      if (s.enableTrails) {
        const trail = [...p.trail, { x: p.x, y: p.y }];
        if (trail.length > s.trailLength) {
          trail.shift();
        }
        p.trail = trail;
      } else if (p.trail.length > 0) {
        p.trail = [];
      }

      updated.push(p);
    }

    particlesRef.current = updated;
    setParticles(updated);

    return totalKinetic;
  }, [canvasDimensions, setParticles]);

  // Main Render & Animation Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height } = canvasDimensions;
      const s = settingsRef.current;

      // Update FPS meter
      const now = performance.now();
      fpsTrackerRef.current.frames++;
      if (now - fpsTrackerRef.current.lastTime >= 500) {
        fpsTrackerRef.current.fps = Math.round(
          (fpsTrackerRef.current.frames * 1000) / (now - fpsTrackerRef.current.lastTime)
        );
        fpsTrackerRef.current.frames = 0;
        fpsTrackerRef.current.lastTime = now;
      }

      // Step physics if running
      let kineticEnergy = 0;
      if (!isPausedRef.current) {
        kineticEnergy = stepPhysics(s.timeScale);
      }

      // Update telemetry
      const currentList = particlesRef.current;
      const attractorCount = currentList.filter((p) => p.isAttractor).length;
      onUpdateTelemetry({
        particleCount: currentList.length,
        fps: fpsTrackerRef.current.fps,
        kineticEnergy: Math.round(kineticEnergy),
        attractorCount,
      });

      // Clear Canvas with subtle trail persistence
      ctx.fillStyle = s.enableTrails ? 'rgba(15, 23, 42, 0.28)' : 'rgba(15, 23, 42, 1)';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle laboratory coordinate grid
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.22)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      ctx.beginPath();
      for (let x = gridSize; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = gridSize; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw pointer gravity field if active
      if (pointerWellRef.current.active) {
        const pw = pointerWellRef.current;
        const radGrad = ctx.createRadialGradient(pw.x, pw.y, 5, pw.x, pw.y, 80);
        if (pw.isRepel) {
          radGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
          radGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        } else {
          radGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
          radGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        }
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(pw.x, pw.y, 80, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Trails
      if (s.enableTrails) {
        for (const p of currentList) {
          if (p.trail.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = p.color;
            ctx.lineWidth = Math.max(1, p.radius * 0.35);
            ctx.globalAlpha = 0.45;
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            for (let t = 1; t < p.trail.length; t++) {
              ctx.lineTo(p.trail[t].x, p.trail[t].y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // Draw Particles and Attractor Fields
      for (const p of currentList) {
        const isHovered = hoveredParticle === p.id;
        const isDragged = draggingIdRef.current === p.id;

        // Attractor event-horizon glow rings
        if (p.isAttractor) {
          const glowGrad = ctx.createRadialGradient(p.x, p.y, p.radius * 0.8, p.x, p.y, p.radius * 3.5);
          glowGrad.addColorStop(0, p.color);
          glowGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
          glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.isRepeller) {
          const glowGrad = ctx.createRadialGradient(p.x, p.y, p.radius * 0.8, p.x, p.y, p.radius * 3.5);
          glowGrad.addColorStop(0, '#ef4444');
          glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Main Body Circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, isDragged ? p.radius * 1.2 : p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = isHovered || isDragged || p.isAttractor ? 16 : 6;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Inner core highlight for depth
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.25, p.y - p.radius * 0.25, p.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();

        // Selection ring if hovered or dragged
        if (isHovered || isDragged) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius + 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Velocity Vectors
        if (s.showVelocityVectors && !p.isFixed && (Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1)) {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.65)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 8, p.y + p.vy * 8);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [canvasDimensions, hoveredParticle, onUpdateTelemetry, stepPhysics]);

  // Single step trigger
  useEffect(() => {
    if (stepTrigger > 0 && isPausedRef.current) {
      stepPhysics(settingsRef.current.timeScale);
    }
  }, [stepTrigger, stepPhysics]);

  // Helper: Find particle near coordinates
  const findParticleAt = (x: number, y: number): Particle | null => {
    const list = particlesRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      const dx = p.x - x;
      const dy = p.y - y;
      const distSq = dx * dx + dy * dy;
      const threshold = Math.max(20, p.radius + 12);
      if (distSq <= threshold * threshold) {
        return p;
      }
    }
    return null;
  };

  // Helper: Get local canvas coords
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX || 0 : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY || 0 : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Spawn a particle at position
  const spawnObjectAt = (x: number, y: number, vx = 0, vy = 0) => {
    const s = settingsRef.current;
    const colors = ['#38bdf8', '#34d399', '#f472b6', '#a78bfa', '#fbbf24', '#f97316'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    let mass = s.defaultSpawnMass;
    let radius = Math.max(4, Math.min(22, Math.sqrt(mass) * 1.5));
    let isAttractor = false;
    let isRepeller = false;
    let color = randomColor;

    if (s.spawnType === 'attractor') {
      mass = Math.max(800, mass * 15);
      radius = 18;
      isAttractor = true;
      color = '#f59e0b';
    } else if (s.spawnType === 'repeller') {
      mass = Math.max(500, mass * 10);
      radius = 16;
      isRepeller = true;
      color = '#ef4444';
    } else if (s.spawnType === 'massive') {
      mass = Math.max(150, mass * 3.5);
      radius = 12;
      color = '#60a5fa';
    }

    const newParticle: Particle = {
      id: `p-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      x,
      y,
      vx,
      vy,
      mass,
      radius,
      color,
      isAttractor,
      isRepeller,
      trail: [],
    };

    setParticles((prev) => [...prev, newParticle]);

    if (s.soundEnabled) {
      missionAudio.playBeep(isAttractor ? 220 : 640, 0.06);
    }
  };

  // Pointer Down (Mouse & Touch)
  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    const targetParticle = findParticleAt(coords.x, coords.y);

    // Right-click or holding Alt/Shift activates gravity attractor well
    const isRightClick = 'button' in e && e.button === 2;
    const isShiftKey = 'shiftKey' in e && e.shiftKey;

    if (isRightClick || isShiftKey) {
      pointerWellRef.current = {
        x: coords.x,
        y: coords.y,
        active: true,
        isRepel: 'altKey' in e && e.altKey,
      };
      return;
    }

    if (targetParticle) {
      // Begin dragging existing particle
      draggingIdRef.current = targetParticle.id;
      dragStartPosRef.current = { x: coords.x, y: coords.y };
      dragVelocityHistoryRef.current = [{ x: coords.x, y: coords.y, time: performance.now() }];
    } else {
      // Clicked on empty canvas -> Spawn new particle
      spawnObjectAt(coords.x, coords.y, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8);
    }
  };

  // Pointer Move
  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    // Update pointer well if active
    if (pointerWellRef.current.active) {
      pointerWellRef.current.x = coords.x;
      pointerWellRef.current.y = coords.y;
    }

    // Check hover
    if (!draggingIdRef.current) {
      const target = findParticleAt(coords.x, coords.y);
      setHoveredParticle(target ? target.id : null);
      return;
    }

    // Dragging active particle
    const draggingId = draggingIdRef.current;
    setParticles((prev) =>
      prev.map((p) => {
        if (p.id === draggingId) {
          return { ...p, x: coords.x, y: coords.y };
        }
        return p;
      })
    );

    // Record dragging velocity history for fling physics
    const now = performance.now();
    const history = dragVelocityHistoryRef.current;
    history.push({ x: coords.x, y: coords.y, time: now });
    if (history.length > 5) {
      history.shift();
    }
  };

  // Pointer Up / Fling Release
  const handlePointerUp = () => {
    if (pointerWellRef.current.active) {
      pointerWellRef.current.active = false;
    }

    const draggingId = draggingIdRef.current;
    if (!draggingId) return;

    // Calculate release velocity from the last drag points
    const history = dragVelocityHistoryRef.current;
    let flingVx = 0;
    let flingVy = 0;

    if (history.length >= 2) {
      const oldest = history[0];
      const newest = history[history.length - 1];
      const dt = Math.max(16, newest.time - oldest.time);
      // Velocity in px per frame (~16ms)
      flingVx = ((newest.x - oldest.x) / dt) * 14;
      flingVy = ((newest.y - oldest.y) / dt) * 14;

      // Cap fling speed
      const maxSpeed = 16;
      const speed = Math.sqrt(flingVx * flingVx + flingVy * flingVy);
      if (speed > maxSpeed) {
        flingVx = (flingVx / speed) * maxSpeed;
        flingVy = (flingVy / speed) * maxSpeed;
      }
    }

    setParticles((prev) =>
      prev.map((p) => {
        if (p.id === draggingId) {
          return {
            ...p,
            vx: flingVx,
            vy: flingVy,
          };
        }
        return p;
      })
    );

    if (settingsRef.current.soundEnabled && (Math.abs(flingVx) > 1 || Math.abs(flingVy) > 1)) {
      missionAudio.playBeep(480, 0.04);
    }

    draggingIdRef.current = null;
    dragStartPosRef.current = null;
    dragVelocityHistoryRef.current = [];
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[380px] sm:min-h-[460px] md:min-h-[540px] bg-slate-950 rounded-2xl overflow-hidden select-none touch-none border border-slate-800 shadow-2xl ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onTouchCancel={handlePointerUp}
        className="w-full h-full block cursor-crosshair focus:outline-hidden"
        tabIndex={0}
        aria-label="Gravity Physics Sandbox Interactive Canvas"
        role="region"
      />

      {/* Subtle in-canvas quick hint overlay */}
      <div className="absolute bottom-3 left-3 pointer-events-none text-[11px] text-slate-400/80 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 backdrop-blur-xs flex items-center gap-2 font-mono">
        <span>Click/Tap: Spawn</span>
        <span>•</span>
        <span>Drag & Throw: Fling</span>
        <span>•</span>
        <span>Shift+Hold: Gravity Well</span>
      </div>
    </div>
  );
};
