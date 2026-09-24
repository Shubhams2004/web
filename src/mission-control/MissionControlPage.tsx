import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Radio,
  Gamepad2,
  Terminal,
  HelpCircle,
  Shield,
  Activity,
  Award,
} from 'lucide-react';
import { SectorGrid } from './components/SectorGrid';
import { ExperimentalLab } from './components/ExperimentalLab';
import { MissionFeed } from './components/MissionFeed';
import { AchievementsPanel } from './components/AchievementsPanel';
import { SystemDiagnostics } from './components/SystemDiagnostics';
import { ChaosButton } from './chaos';
import { missionAudio } from './audio';
import { unlockAchievement } from './achievements';

interface MissionControlPageProps {
  onBack: () => void;
  onLaunchGame: (route: string) => void;
}

export const MissionControlPage: React.FC<MissionControlPageProps> = ({
  onBack,
  onLaunchGame,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => missionAudio.isMuted());
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showManual, setShowManual] = useState<boolean>(false);

  useEffect(() => {
    // Initial audio setup & first contact achievement
    missionAudio.userInteracted();
    missionAudio.playRadarPing();
    unlockAchievement('first_contact');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Set page title
    const prevTitle = document.title;
    document.title = 'Mission Control HQ — Tactical Arcade Command | Shubham Sonale';

    // Live clock
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => {
      document.title = prevTitle;
      clearInterval(timer);
    };
  }, []);

  const handleToggleMute = () => {
    const next = missionAudio.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white pb-12">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Command Deck</span>
            <span className="sm:hidden">Exit</span>
          </button>

          {/* Title Banner */}
          <div className="flex items-center gap-2 text-center">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>CLASSIFIED HQ</span>
            </span>
            <h1 className="text-sm sm:text-base font-black tracking-wider uppercase bg-gradient-to-r from-cyan-400 via-sky-200 to-cyan-500 bg-clip-text text-transparent">
              MISSION CONTROL
            </h1>
          </div>

          {/* Audio, Manual, Arcade Hub */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-2 rounded-lg text-xs border transition-colors ${
                isMuted
                  ? 'bg-rose-950/60 border-rose-900/60 text-rose-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title={isMuted ? 'Unmute Command Audio' : 'Mute Command Audio'}
              aria-label="Sound Toggle"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setShowManual(true)}
              className="p-2 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Mission Control Directives"
              aria-label="Directives"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Sub-Header Marquee Banner */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 text-xs font-mono">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-slate-400 text-[11px]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>DEFCON 4 · SYSTEM STABLE</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="hidden sm:inline">SYSTEM TIME: <strong className="text-slate-200">{currentTime}</strong></span>
          </div>

          <div className="flex items-center gap-4">
            <span>SECTORS ONLINE: <strong className="text-cyan-400 font-bold">3/3</strong></span>
            <span>CLEARANCE: <strong className="text-amber-400 font-bold">ALPHA-7</strong></span>
          </div>
        </div>
      </div>

      {/* Main Command Deck Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 sm:py-8 space-y-8">
        {/* Chaos Protocol Capability Banner */}
        <section aria-label="Chaos Protocol">
          <ChaosButton />
        </section>

        {/* 1. Operational Game Sectors Grid */}
        <section aria-label="Game Sectors">
          <SectorGrid onLaunchSector={onLaunchGame} />
        </section>

        {/* 2. Experimental Prototype Lab */}
        <section aria-label="Experimental Lab">
          <ExperimentalLab />
        </section>

        {/* 3. System Telemetry & Status */}
        <section aria-label="System Diagnostics">
          <SystemDiagnostics />
        </section>

        {/* 4. Dynamic Mission Telemetry Feed */}
        <section aria-label="Mission Feed">
          <MissionFeed />
        </section>

        {/* 5. Secret Mission Achievements */}
        <section aria-label="Secret Achievements">
          <AchievementsPanel />
        </section>
      </main>

      {/* Directives / Clearance Manual Modal */}
      {showManual && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-5 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <Radio className="w-4 h-4" />
                <span>MISSION CONTROL DIRECTIVES</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowManual(false)}
                className="text-slate-400 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-slate-300 text-[11px] leading-relaxed">
              <p>
                <strong className="text-cyan-300 block mb-0.5">CENTRAL COMMAND HUB:</strong>
                Mission Control coordinates all interactive sectors, experimental labs, and real-time telemetry across this site.
              </p>
              <p>
                <strong className="text-amber-400 block mb-0.5">⚡ QUANTUM CHAOS PROTOCOL:</strong>
                Trigger unpredictable, harmless visual events (pixel/emoji rain, cyber glitch, tectonic wobble, 1984 arcade mode, tumbling debris, plasma burst, alien intercept, mock instability, or the rare 1-in-30 Golden Singularity). All events auto-restore with zero data corruption.
              </p>
              <p>
                <strong className="text-amber-300 block mb-0.5">LAUNCHING MISSIONS:</strong>
                Directly engage any active operational sector (Pixel Dungeon, Zombie Survival, Retro Racer) from the Sector Grid.
              </p>
              <p>
                <strong className="text-emerald-300 block mb-0.5">EXPERIMENTAL LAB:</strong>
                Test live in-browser audio frequency synthesis, real-time procedural dungeon seed generation, and virtual CRT visualizers.
              </p>
              <p>
                <strong className="text-purple-300 block mb-0.5">KEYBOARD SHORTCUT:</strong>
                Press <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white font-bold">Ctrl + Shift + M</span> (or <span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white font-bold">Cmd + Shift + M</span>) from anywhere on the portfolio to open Mission Control instantly.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowManual(false)}
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-colors cursor-pointer"
            >
              CLOSE MANUAL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
