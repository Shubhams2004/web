import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Sliders,
  Volume2,
  VolumeX,
  FastForward,
  Trash2,
  Orbit,
  Atom,
  Magnet,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { GravitySettings, SimulationTelemetry, SpawnType, BoundaryMode } from '../../types';
import { SANDBOX_PRESETS, SandboxPreset } from './presets';

interface GravitySandboxControlsProps {
  settings: GravitySettings;
  setSettings: React.Dispatch<React.SetStateAction<GravitySettings>>;
  isPaused: boolean;
  onTogglePause: () => void;
  onStep: () => void;
  onReset: () => void;
  onClear: () => void;
  onSpawnCluster: () => void;
  onSelectPreset: (preset: SandboxPreset) => void;
  activePresetId: string;
  telemetry: SimulationTelemetry;
}

export const GravitySandboxControls: React.FC<GravitySandboxControlsProps> = ({
  settings,
  setSettings,
  isPaused,
  onTogglePause,
  onStep,
  onReset,
  onClear,
  onSpawnCluster,
  onSelectPreset,
  activePresetId,
  telemetry,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-slate-200 space-y-5">
      {/* Top Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 font-mono text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Bodies</span>
            <span className="text-slate-100 font-bold">{telemetry.particleCount}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Engine</span>
            <span className={`font-bold ${telemetry.fps >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {telemetry.fps} FPS
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Energy</span>
            <span className="text-cyan-400 font-bold">{telemetry.kineticEnergy} J</span>
          </div>
        </div>

        {/* Sound toggle and Primary Play/Pause */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              settings.soundEnabled
                ? 'bg-slate-800 border-slate-700 text-blue-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={settings.soundEnabled ? 'Mute audio' : 'Enable audio synth'}
          >
            {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onTogglePause}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {isPaused && (
            <button
              type="button"
              onClick={onStep}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Step 1 frame forward"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Reset active preset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClear}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Clear all bodies"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Preset Scenarios
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SANDBOX_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-950/80 border-blue-500 text-blue-200 shadow-xs'
                    : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-xs block truncate">{preset.name}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1 block mt-0.5">
                  {preset.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spawn Type Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Click / Tap Spawn Mode</span>
          <button
            type="button"
            onClick={onSpawnCluster}
            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-normal cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Burst +20 Particles</span>
          </button>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'particle', label: 'Stardust Particle', color: 'border-sky-500/50 text-sky-300' },
            { id: 'massive', label: 'Massive Planet', color: 'border-blue-500/50 text-blue-300' },
            { id: 'attractor', label: 'Gravitational Well', color: 'border-amber-500/50 text-amber-300' },
            { id: 'repeller', label: 'Anti-Gravity Core', color: 'border-rose-500/50 text-rose-300' },
          ].map((type) => {
            const isSelected = settings.spawnType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSettings((s) => ({ ...s, spawnType: type.id as SpawnType }))}
                className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                  isSelected
                    ? `bg-slate-800 border-white text-white font-bold shadow-xs`
                    : `bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200`
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Physics Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Gravity Constant */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Gravity Constant (G)</span>
            <span className="font-mono text-blue-400 font-bold">{settings.gravityConstant.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-0.5"
            max="2.5"
            step="0.05"
            value={settings.gravityConstant}
            onChange={(e) => setSettings((s) => ({ ...s, gravityConstant: parseFloat(e.target.value) }))}
            className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Spawn Mass */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Default Mass</span>
            <span className="font-mono text-cyan-400 font-bold">{settings.defaultSpawnMass} kg</span>
          </div>
          <input
            type="range"
            min="2"
            max="120"
            step="2"
            value={settings.defaultSpawnMass}
            onChange={(e) => setSettings((s) => ({ ...s, defaultSpawnMass: parseInt(e.target.value, 10) }))}
            className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Simulation Speed */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Time Scale</span>
            <span className="font-mono text-purple-400 font-bold">{settings.timeScale.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.0"
            step="0.1"
            value={settings.timeScale}
            onChange={(e) => setSettings((s) => ({ ...s, timeScale: parseFloat(e.target.value) }))}
            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Toggles Bar: Boundaries, Trails, Vectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
        {/* Boundary Mode */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Boundary:</span>
          {(['bounce', 'wrap', 'void'] as BoundaryMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSettings((s) => ({ ...s, boundaryMode: mode }))}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase transition-colors cursor-pointer ${
                settings.boundaryMode === mode
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Checkbox Toggles */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableTrails}
              onChange={(e) => setSettings((s) => ({ ...s, enableTrails: e.target.checked }))}
              className="rounded accent-blue-500 cursor-pointer"
            />
            <span>Orbital Trails</span>
          </label>

          <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showVelocityVectors}
              onChange={(e) => setSettings((s) => ({ ...s, showVelocityVectors: e.target.checked }))}
              className="rounded accent-blue-500 cursor-pointer"
            />
            <span>Vectors</span>
          </label>
        </div>
      </div>
    </div>
  );
};
