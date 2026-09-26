import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  ArrowLeft,
  Sparkles,
  Info,
  Radio,
  Sliders,
  Maximize2,
  Terminal,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { EXPERIMENTS_REGISTRY } from './experimentsRegistry';
import { ExperimentDefinition, ExperimentCategory } from './types';
import { ExperimentCard } from './ExperimentCard';
import { GravitySandboxExperiment } from './experiments/GravitySandbox';
import { AILabExperiment } from './experiments/AILab';
import { VisualLabExperiment } from './experiments/VisualLab';
import { GameMechanicsLabExperiment } from './experiments/GameMechanicsLab';
import { WeirdWebLabExperiment } from './experiments/WeirdWebLab';

interface ExperimentalPlaygroundPageProps {
  onBack: () => void;
  initialExperimentId?: string;
}

export const ExperimentalPlaygroundPage: React.FC<ExperimentalPlaygroundPageProps> = ({
  onBack,
  initialExperimentId,
}) => {
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentDefinition>(() => {
    if (initialExperimentId) {
      const match = EXPERIMENTS_REGISTRY.find((e) => e.id === initialExperimentId);
      if (match) return match;
    }
    return EXPERIMENTS_REGISTRY[0]; // 🧲 Physics Lab: Gravity Sandbox
  });

  const [activeCategory, setActiveCategory] = useState<ExperimentCategory>('all');

  // Filtered experiments
  const filteredExperiments = EXPERIMENTS_REGISTRY.filter((exp) => {
    if (activeCategory === 'all') return true;
    return exp.category === activeCategory;
  });

  // Scroll to active stage on experiment select
  const handleSelectExperiment = (exp: ExperimentDefinition) => {
    setSelectedExperiment(exp);
    const stageEl = document.getElementById('experiment-stage');
    if (stageEl) {
      stageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-900 selection:text-blue-100">
      {/* Laboratory Technical Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Lab Header Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portfolio</span>
            </button>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LAB FACILITY RUNTIME ACTIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 border border-slate-800 px-2 py-0.5 rounded-md bg-slate-900/60">
              SEC-7 // BUILD 2026.09
            </span>
          </div>
        </div>
      </header>

      {/* Main Laboratory Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 relative z-10">
        {/* Lab Hero & Title Banner */}
        <section className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-blue-950/70 border border-blue-500/30 text-blue-300">
            <FlaskConical className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive Web Research Facility</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            🧪 Experimental Playground
          </h1>

          <p className="text-base sm:text-xl text-slate-400 font-medium italic leading-relaxed">
            “Experiments in progress. Some may break. That’s the point.”
          </p>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
            A zero-compromise sandbox environment for exploring physics simulations, latent space vectors,
            tactile game mechanics, visual wave dispersion, and wild browser experiments.
          </p>
        </section>

        {/* Active Experiment Stage */}
        <section id="experiment-stage" className="space-y-4 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedExperiment.icon}</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {selectedExperiment.name}
                </h2>
                <span className="font-mono text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 rounded-md border text-emerald-400 bg-emerald-950/60 border-emerald-500/30">
                  {selectedExperiment.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {selectedExperiment.description}
              </p>
            </div>

            <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono shrink-0">
              Interactive Canvas Active
            </div>
          </div>

          {/* Active Experiment Component Stage */}
          <div className="w-full">
            {selectedExperiment.id === 'gravity-sandbox' && <GravitySandboxExperiment />}
            {selectedExperiment.id === 'ai-lab' && <AILabExperiment />}
            {selectedExperiment.id === 'visual-lab' && <VisualLabExperiment />}
            {selectedExperiment.id === 'game-mechanics-lab' && <GameMechanicsLabExperiment />}
            {selectedExperiment.id === 'weird-web' && <WeirdWebLabExperiment />}
          </div>
        </section>

        {/* Experiment Grid Directory */}
        <section className="space-y-6 pt-6 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                All Laboratory Experiments
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select any experiment module below to mount it into the primary testing stage.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
              {[
                { id: 'all', label: 'All Modules' },
                { id: 'physics', label: '🧲 Physics' },
                { id: 'ai', label: '🤖 AI' },
                { id: 'visual', label: '🌌 Visual' },
                { id: 'game', label: '🎮 Game' },
                { id: 'weird', label: '🧠 Weird Web' },
              ].map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id as ExperimentCategory)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* The Grid of Experiment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExperiments.map((exp) => (
              <ExperimentCard
                key={exp.id}
                experiment={exp}
                isActive={selectedExperiment.id === exp.id}
                onSelect={handleSelectExperiment}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Lab Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>EXPERIMENTAL LABORATORY // RESEARCH DIVISION</span>
          <button
            type="button"
            onClick={onBack}
            className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
          >
            ← Return to Main Website
          </button>
        </div>
      </footer>
    </div>
  );
};
