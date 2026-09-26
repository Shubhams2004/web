import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Radio,
  Sliders,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
  ExternalLink,
  Terminal,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { missionAudio } from '../../mission-control/audio';
import { fetchNewsArticles } from '../../utils/newsApi';

interface SignalMessage {
  id: string;
  frequency: string;
  source: string;
  status: string;
  message: string;
  isSecret?: boolean;
  actionLabel?: string;
  actionRoute?: string;
}

const DEFAULT_SIGNALS: SignalMessage[] = [
  {
    id: 'sig-01',
    frequency: '142.85 MHz',
    source: 'SECTOR-01 // CORE',
    status: 'CARRIER_LOCKED',
    message: 'Grid integrity stable. Quantum research cache synced with global feeds.',
  },
  {
    id: 'sig-02',
    frequency: '218.40 MHz',
    source: 'ORBITAL-7 // TELEMETRY',
    status: 'DATA_STREAM',
    message: 'Empirical market catalyst analyzer online. Ready for live synthesis.',
  },
  {
    id: 'sig-03',
    frequency: '433.92 MHz',
    source: 'ARCADE-SUITE // CHIP-8',
    status: 'AUDIO_CARRIER',
    message: 'Subterranean arcade detected: Pixel Dungeon & Retro Pursuit active.',
    actionLabel: 'Launch Arcade',
    actionRoute: '#/game',
  },
  {
    id: 'sig-lab',
    frequency: '512.00 MHz',
    source: 'EXPERIMENTAL-LAB // SEC-7',
    status: 'SANDBOX_ACTIVE',
    message: 'N-body Gravity Sandbox & quantum particles active. Interactive tests online.',
    actionLabel: 'Enter Lab',
    actionRoute: '#/playground',
  },
  {
    id: 'sig-04',
    frequency: '88.70 MHz',
    source: 'NEWSROOM-RELAY',
    status: 'BROADCAST',
    message: 'Global wire scanner listening: Live business disruptions streaming.',
    actionLabel: 'Open News Portal',
    actionRoute: '#/news',
  },
  {
    id: 'sig-05',
    frequency: '915.00 MHz',
    source: 'RESEARCH-NODE',
    status: 'ENCRYPTED',
    message: 'Public filing deconstructor: 10-K & earnings transcripts indexed.',
  },
];

const SURPRISE_SIGNALS: SignalMessage[] = [
  {
    id: 'secret-mc',
    frequency: '133.70 MHz',
    source: 'MISSION CONTROL // CLASSIFIED',
    status: 'ANOMALY_DETECTED',
    message: '⚡ TRANSMISSION: Subterranean command center accessible via [Ctrl+Shift+M].',
    isSecret: true,
    actionLabel: 'Enter Mission Control',
    actionRoute: '#/mission-control',
  },
  {
    id: 'secret-chaos',
    frequency: '666.00 MHz',
    source: 'CHAOS_SUBSYSTEM',
    status: 'ENTROPY_HIGH',
    message: '⚠️ WARNING: Subterranean Chaos Protocol is primed for activation.',
    isSecret: true,
    actionLabel: 'Inspect Chaos',
    actionRoute: '#/mission-control',
  },
  {
    id: 'secret-dungeon',
    frequency: '007.42 MHz',
    source: 'DUNGEON-CRYPT-9',
    status: 'SIGNAL_INTERCEPT',
    message: '🗝️ RUNE DISCOVERED: Pixel Dungeon level seed [7701] contains hidden health potions.',
    isSecret: true,
    actionLabel: 'Play Dungeon',
    actionRoute: '#/game/pixel-dungeon',
  },
  {
    id: 'secret-alien',
    frequency: '1420.40 MHz',
    source: 'DEEP_SPACE // WOW-SIGNAL',
    status: 'INTERSTELLAR',
    message: '👽 WOW! Transmission received: "WE WITNESS YOUR WEB PLAYGROUND."',
    isSecret: true,
  },
];

interface SignalConsoleProps {
  onSignalDiscovered?: (message: string) => void;
  className?: string;
}

export const SignalConsole: React.FC<SignalConsoleProps> = ({
  onSignalDiscovered,
  className = '',
}) => {
  const [activeSignalIndex, setActiveSignalIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [audioMuted, setAudioMuted] = useState(() => missionAudio.isMuted());
  const [discoveredSecretsCount, setDiscoveredSecretsCount] = useState(0);
  const [tuningFrequency, setTuningFrequency] = useState('142.85');
  const [signalHistory, setSignalHistory] = useState<SignalMessage[]>(DEFAULT_SIGNALS);
  const [scanPulse, setScanPulse] = useState(0);

  const currentSignal = signalHistory[activeSignalIndex] || DEFAULT_SIGNALS[0];
  const timerRef = useRef<number | null>(null);

  // Ingest real live news wire transmissions into signal rotation
  useEffect(() => {
    let isMounted = true;
    fetchNewsArticles('All')
      .then((res) => {
        if (!isMounted || !Array.isArray(res.articles) || res.articles.length === 0) return;
        const liveArticles = res.articles.slice(0, 2);
        const liveSignals: SignalMessage[] = liveArticles.map((art, idx) => ({
          id: `sig-wire-${art.id}-${idx}`,
          frequency: `${(104.2 + idx * 3.8).toFixed(2)} MHz`,
          source: `WIRE // ${art.source ? art.source.toUpperCase() : 'LIVE NEWS'}`,
          status: 'LIVE_DISPATCH',
          message: art.title,
          actionLabel: 'Read Dispatch',
          actionRoute: '#/news',
        }));

        setSignalHistory((prev) => [...liveSignals, ...prev]);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-cycle through signals slowly if not scanning
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setActiveSignalIndex((prev) => (prev + 1) % signalHistory.length);
      setScanPulse((p) => (p + 1) % 100);
    }, 9000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [signalHistory.length]);

  const toggleSound = () => {
    const next = missionAudio.toggleMute();
    setAudioMuted(next);
    if (!next) {
      missionAudio.playBeep(600, 0.08);
    }
  };

  const handleTune = useCallback(() => {
    setIsScanning(true);
    missionAudio.userInteracted();
    missionAudio.playDiagnosticSweep();

    // Generate random frequency display during scanning
    const randomFreq = (Math.random() * 800 + 50).toFixed(2);
    setTuningFrequency(randomFreq);

    setTimeout(() => {
      // 25% chance of uncovering a secret surprise signal
      const roll = Math.random();
      if (roll < 0.3) {
        const surprise = SURPRISE_SIGNALS[Math.floor(Math.random() * SURPRISE_SIGNALS.length)];
        setIsGlitching(true);
        missionAudio.playTerminalBlip();
        missionAudio.playRadarPing();

        setSignalHistory((prev) => {
          if (!prev.some((s) => s.id === surprise.id)) {
            return [surprise, ...prev];
          }
          return prev;
        });

        setActiveSignalIndex(0);
        setTuningFrequency(surprise.frequency.replace(' MHz', ''));
        setDiscoveredSecretsCount((c) => c + 1);

        if (onSignalDiscovered) {
          onSignalDiscovered(`Discovered signal [${surprise.frequency}]: ${surprise.message}`);
        }

        setTimeout(() => setIsGlitching(false), 800);
      } else {
        // Normal next signal
        const nextIdx = (activeSignalIndex + 1) % DEFAULT_SIGNALS.length;
        setActiveSignalIndex(nextIdx);
        setTuningFrequency(DEFAULT_SIGNALS[nextIdx].frequency.replace(' MHz', ''));
        missionAudio.playTerminalBlip();
      }

      setIsScanning(false);
    }, 450);
  }, [activeSignalIndex, onSignalDiscovered]);

  const handleActionClick = (route?: string) => {
    if (!route) return;
    missionAudio.playBeep(880, 0.1);
    window.location.hash = route;
  };

  return (
    <div
      className={`relative rounded-2xl bg-slate-900 border border-slate-700/80 shadow-xl overflow-hidden font-mono text-slate-200 select-none ${
        isGlitching ? 'ring-2 ring-amber-400/80 animate-pulse' : ''
      } ${className}`}
      aria-label="Interactive Signal Console"
    >
      {/* Retro CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none retro-scanlines opacity-25 z-10" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800 text-[11px] relative z-20">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                currentSignal.isSecret ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                currentSignal.isSecret ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </span>
          <span className="font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 inline" />
            <span>SIGNAL CONSOLE</span>
          </span>
          <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-800/80 text-[10px] text-cyan-300 font-semibold">
            VHF/UHF
          </span>
        </div>

        {/* Audio mute & indicator */}
        <div className="flex items-center gap-2">
          {discoveredSecretsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{discoveredSecretsCount} SECRETS</span>
            </span>
          )}
          <button
            type="button"
            onClick={toggleSound}
            className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
            title={audioMuted ? 'Unmute Console Audio' : 'Mute Console Audio'}
            aria-label={audioMuted ? 'Unmute Console Audio' : 'Mute Console Audio'}
          >
            {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Signal Display Screen */}
      <div className="p-4 sm:p-5 relative z-20 space-y-3">
        {/* Frequency & Source Ticker */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider">FREQ</span>
            <span className="text-cyan-400 font-bold tracking-widest text-sm bg-slate-950 px-2 py-0.5 rounded border border-cyan-900/60">
              {isScanning ? `${tuningFrequency} MHz` : currentSignal.frequency}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider">SRC</span>
            <span
              className={`font-semibold text-[11px] truncate max-w-[160px] sm:max-w-none ${
                currentSignal.isSecret ? 'text-amber-300 font-bold' : 'text-slate-300'
              }`}
            >
              {currentSignal.source}
            </span>
          </div>
        </div>

        {/* Oscilloscope / Waveform Visualizer simulation */}
        <div className="h-6 w-full bg-slate-950 rounded border border-slate-800 flex items-center px-2 overflow-hidden gap-0.5">
          {Array.from({ length: 28 }).map((_, i) => {
            const height = isScanning
              ? Math.max(15, ((Math.sin((i + scanPulse * 3) * 0.4) + 1) / 2) * 90)
              : Math.max(20, ((Math.cos((i + scanPulse) * 0.3) + 1) / 2) * (currentSignal.isSecret ? 85 : 55));
            return (
              <div
                key={i}
                className={`flex-1 rounded-xs transition-all duration-150 ${
                  currentSignal.isSecret ? 'bg-amber-400' : 'bg-cyan-400'
                }`}
                style={{
                  height: `${height}%`,
                  opacity: 0.35 + (i % 3) * 0.25,
                }}
              />
            );
          })}
        </div>

        {/* Readout Message Box */}
        <div
          className={`p-3 rounded-xl border text-xs sm:text-sm leading-relaxed transition-all ${
            currentSignal.isSecret
              ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
              : 'bg-slate-950/70 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {currentSignal.isSecret ? (
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Terminal className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            )}
            <p className="flex-1">
              {isScanning ? (
                <span className="inline-flex items-center gap-1.5 text-cyan-300">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning electromagnetic spectrum for carrier waves...</span>
                </span>
              ) : (
                <span>{currentSignal.message}</span>
              )}
            </p>
          </div>

          {/* Action route button if message provides a portal shortcut */}
          {!isScanning && currentSignal.actionRoute && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Direct portal link available</span>
              <button
                type="button"
                onClick={() => handleActionClick(currentSignal.actionRoute)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                <span>{currentSignal.actionLabel || 'Access'}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Interactive Affordances / Tuning Controls */}
        <div className="flex items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="signal-console-tune-btn"
              onClick={handleTune}
              disabled={isScanning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer active:scale-95"
              title="Tune radio spectrum to scan for transmissions"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isScanning ? 'TUNING...' : 'TUNE SPECTRUM'}</span>
            </button>

            <button
              type="button"
              id="signal-console-scan-btn"
              onClick={() => {
                missionAudio.playBeep(440, 0.05);
                setActiveSignalIndex((prev) => (prev + 1) % signalHistory.length);
              }}
              disabled={isScanning}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              title="Next Signal Channel"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">NEXT CHANNEL</span>
            </button>
          </div>

          <div className="text-[10px] text-slate-400 hidden xs:block">
            <span>CH {activeSignalIndex + 1}/{signalHistory.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
