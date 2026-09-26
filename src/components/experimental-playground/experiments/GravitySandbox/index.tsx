import React, { useState, useCallback, useEffect } from 'react';
import { GravitySandboxCanvas } from './GravitySandboxCanvas';
import { GravitySandboxControls } from './GravitySandboxControls';
import { Particle, GravitySettings, SimulationTelemetry } from '../../types';
import { SANDBOX_PRESETS, SandboxPreset } from './presets';

const INITIAL_SETTINGS: GravitySettings = {
  gravityConstant: 0.8,
  collisionDamping: 0.998,
  boundaryMode: 'bounce',
  enableTrails: true,
  trailLength: 28,
  defaultSpawnMass: 25,
  spawnType: 'particle',
  timeScale: 1.0,
  showVelocityVectors: false,
  soundEnabled: false,
};

export const GravitySandboxExperiment: React.FC = () => {
  const [settings, setSettings] = useState<GravitySettings>(INITIAL_SETTINGS);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [stepTrigger, setStepTrigger] = useState<number>(0);
  const [activePresetId, setActivePresetId] = useState<string>('solar-system');
  const [telemetry, setTelemetry] = useState<SimulationTelemetry>({
    particleCount: 5,
    fps: 60,
    kineticEnergy: 0,
    attractorCount: 1,
  });

  // Initial particles loaded from default preset (solar system)
  const [particles, setParticles] = useState<Particle[]>(() => {
    const defaultPreset = SANDBOX_PRESETS[0];
    return defaultPreset.particles(800, 500);
  });

  // Handle Preset selection
  const handleSelectPreset = useCallback((preset: SandboxPreset) => {
    setActivePresetId(preset.id);
    setSettings((s) => ({ ...s, gravityConstant: preset.gravityConstant }));
    const initialBodies = preset.particles(800, 500);
    setParticles(initialBodies);
  }, []);

  // Reset to current preset
  const handleReset = useCallback(() => {
    const preset = SANDBOX_PRESETS.find((p) => p.id === activePresetId) || SANDBOX_PRESETS[0];
    handleSelectPreset(preset);
  }, [activePresetId, handleSelectPreset]);

  // Clear all particles
  const handleClear = useCallback(() => {
    setParticles([]);
  }, []);

  // Spawn cluster of 20 random orbiting particles
  const handleSpawnCluster = useCallback(() => {
    const colors = ['#38bdf8', '#34d399', '#f472b6', '#a78bfa', '#fbbf24'];
    const cx = 400;
    const cy = 250;
    const newItems: Particle[] = [];

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 180;
      const speed = 2.2 * (Math.random() * 0.4 + 0.8);
      newItems.push({
        id: `burst-${Date.now()}-${i}`,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: -Math.sin(angle) * speed,
        vy: Math.cos(angle) * speed,
        mass: 10 + Math.random() * 20,
        radius: 4 + Math.random() * 3,
        color: colors[i % colors.length],
        trail: [],
      });
    }

    setParticles((prev) => [...prev, ...newItems]);
  }, []);

  // Keyboard shortcut listener: Space to Pause/Resume, R to Reset, C to Clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused((p) => !p);
      } else if (e.key.toLowerCase() === 'r') {
        handleReset();
      } else if (e.key.toLowerCase() === 'c') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClear, handleReset]);

  return (
    <div className="space-y-4">
      {/* Simulation Stage Canvas */}
      <GravitySandboxCanvas
        settings={settings}
        isPaused={isPaused}
        stepTrigger={stepTrigger}
        particles={particles}
        setParticles={setParticles}
        onUpdateTelemetry={setTelemetry}
      />

      {/* Control Panel */}
      <GravitySandboxControls
        settings={settings}
        setSettings={setSettings}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((p) => !p)}
        onStep={() => setStepTrigger((t) => t + 1)}
        onReset={handleReset}
        onClear={handleClear}
        onSpawnCluster={handleSpawnCluster}
        onSelectPreset={handleSelectPreset}
        activePresetId={activePresetId}
        telemetry={telemetry}
      />
    </div>
  );
};
