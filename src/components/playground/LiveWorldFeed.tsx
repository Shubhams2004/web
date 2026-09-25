import React, { useState, useEffect } from 'react';
import {
  Activity,
  Pause,
  Play,
  Terminal,
  Radio,
  Gamepad2,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { missionAudio } from '../../mission-control/audio';

export type FeedEventType = 'SYSTEM EVENT' | 'GAME DISCOVERED' | 'SECRET DETECTED' | 'SIGNAL RECEIVED';

export interface FeedItem {
  id: string;
  type: FeedEventType;
  title: string;
  detail: string;
  timestamp: string;
  source: string;
  linkRoute?: string;
  actionText?: string;
  isSecret?: boolean;
}

const INITIAL_FEED_ITEMS: FeedItem[] = [
  {
    id: 'ev-1',
    type: 'SIGNAL RECEIVED',
    title: 'Carrier Frequency Locked',
    detail: 'Orbital relay beacon synchronized at 142.85 MHz. Clean telemetry.',
    timestamp: 'Just now',
    source: 'RELAY-07',
  },
  {
    id: 'ev-2',
    type: 'GAME DISCOVERED',
    title: 'Pixel Dungeon Crypt Explored',
    detail: 'Hero cleared Chamber Level 3, collected bronze chest and dagger.',
    timestamp: '2m ago',
    source: 'ARCADE-SUITE',
    linkRoute: '#/game/pixel-dungeon',
    actionText: 'Enter Dungeon',
  },
  {
    id: 'ev-3',
    type: 'SYSTEM EVENT',
    title: 'Market Catalyst Indexed',
    detail: 'Breaking corporate restructuring synthesized into empirical case study.',
    timestamp: '5m ago',
    source: 'RESEARCH-CORE',
    linkRoute: '#case-studies',
    actionText: 'View Study',
  },
  {
    id: 'ev-4',
    type: 'SECRET DETECTED',
    title: 'Subterranean Frequency Pinged',
    detail: 'Cipher code accepted: [Ctrl+Shift+M] triggers subterranean command center.',
    timestamp: '8m ago',
    source: 'MISSION-CONTROL',
    linkRoute: '#/mission-control',
    actionText: 'Access HQ',
    isSecret: true,
  },
  {
    id: 'ev-5',
    type: 'SIGNAL RECEIVED',
    title: 'Newsroom Wire Feed Synced',
    detail: 'Incoming live RSS bulletins deconstructed via Groq AI processor.',
    timestamp: '12m ago',
    source: 'NEWSROOM',
    linkRoute: '#/news',
    actionText: 'Read Wire',
  },
];

const RANDOM_EVENT_TEMPLATES: Omit<FeedItem, 'id' | 'timestamp'>[] = [
  {
    type: 'SIGNAL RECEIVED',
    title: 'Atmospheric Pulse Captured',
    detail: 'Sub-audible carrier bounce registered across 88.40 MHz.',
    source: 'RADAR-GRID',
  },
  {
    type: 'GAME DISCOVERED',
    title: 'Retro Highway Pursuit Recorded',
    detail: 'Speed achieved: 210 MPH without bumper contact. Turbo active.',
    source: 'RETRO-RACER',
    linkRoute: '#/game/retro-racer',
    actionText: 'Race Now',
  },
  {
    type: 'SYSTEM EVENT',
    title: 'Telemetry Buffer Purged',
    detail: 'High-speed cache cycle executed. 0 memory leaks across components.',
    source: 'SYS-MONITOR',
  },
  {
    type: 'GAME DISCOVERED',
    title: 'Zombie Quarantine Cleared',
    detail: 'Tactical nuke power-up detonated in Sector 4. Wave 7 survived.',
    source: 'ZOMBIE-SURVIVAL',
    linkRoute: '#/game/zombie-survival',
    actionText: 'Defend Arena',
  },
  {
    type: 'SECRET DETECTED',
    title: 'Chaos Subsystem Intercepted',
    detail: 'Glitch generator primed with pixel rain, wobble, and alien relays.',
    source: 'CHAOS-HQ',
    linkRoute: '#/mission-control',
    actionText: 'Inspect Chaos',
    isSecret: true,
  },
];

interface LiveWorldFeedProps {
  className?: string;
  onItemClick?: (item: FeedItem) => void;
}

export const LiveWorldFeed: React.FC<LiveWorldFeedProps> = ({
  className = '',
  onItemClick,
}) => {
  const [items, setItems] = useState<FeedItem[]>(INITIAL_FEED_ITEMS);
  const [isPaused, setIsPaused] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | FeedEventType>('ALL');
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);

  // Periodically prepend simulated live event if not paused
  useEffect(() => {
    if (isPaused) return;

    const interval = window.setInterval(() => {
      const template =
        RANDOM_EVENT_TEMPLATES[Math.floor(Math.random() * RANDOM_EVENT_TEMPLATES.length)];
      const newItem: FeedItem = {
        ...template,
        id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: 'Just now',
      };

      setItems((prev) => [newItem, ...prev.slice(0, 11)]);
    }, 11000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const filteredItems = items.filter((it) => {
    if (activeFilter === 'ALL') return true;
    return it.type === activeFilter;
  });

  const getBadgeStyle = (type: FeedEventType) => {
    switch (type) {
      case 'GAME DISCOVERED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'SECRET DETECTED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'SIGNAL RECEIVED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'SYSTEM EVENT':
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  const getIcon = (type: FeedEventType) => {
    switch (type) {
      case 'GAME DISCOVERED':
        return <Gamepad2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      case 'SECRET DETECTED':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'SIGNAL RECEIVED':
        return <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      case 'SYSTEM EVENT':
      default:
        return <Terminal className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    }
  };

  const handleItemSelect = (item: FeedItem) => {
    missionAudio.playTerminalBlip();
    setSelectedItem(item);
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const handleAction = (route?: string) => {
    if (!route) return;
    missionAudio.playBeep(880, 0.08);
    window.location.hash = route;
  };

  return (
    <section
      id="live-world-feed"
      className={`py-8 sm:py-10 border-b border-slate-200/80 bg-slate-900 text-slate-200 font-mono relative overflow-hidden ${className}`}
      aria-label="Live Activity and World Feed"
    >
      {/* Background CRT scanlines */}
      <div className="absolute inset-0 retro-scanlines opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with Title and Stream Control */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>LIVE ACTIVITY & WORLD FEED</span>
                <span className="flex h-2 w-2 relative">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isPaused ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isPaused ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-normal">
                Real-time telemetry, arcade milestones, and secret discovery logs
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(['ALL', 'SYSTEM EVENT', 'GAME DISCOVERED', 'SECRET DETECTED', 'SIGNAL RECEIVED'] as const).map(
                (filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => {
                      missionAudio.playBeep(520, 0.04);
                      setActiveFilter(filter);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      activeFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filter === 'ALL'
                      ? 'ALL'
                      : filter === 'SYSTEM EVENT'
                      ? 'SYSTEM'
                      : filter === 'GAME DISCOVERED'
                      ? 'GAMES'
                      : filter === 'SECRET DETECTED'
                      ? 'SECRETS'
                      : 'SIGNALS'}
                  </button>
                )
              )}
            </div>

            {/* Pause/Play Stream Button */}
            <button
              type="button"
              onClick={() => {
                missionAudio.playBeep(isPaused ? 740 : 380, 0.05);
                setIsPaused(!isPaused);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title={isPaused ? 'Resume live feed updates' : 'Pause live feed updates'}
            >
              {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
              <span className="text-[11px]">{isPaused ? 'RESUME' : 'PAUSE'}</span>
            </button>
          </div>
        </div>

        {/* Compact Grid of Feed items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.slice(0, 6).map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemSelect(item)}
              className={`p-3.5 rounded-xl border bg-slate-950/60 hover:bg-slate-950/90 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between ${
                item.isSecret
                  ? 'border-amber-500/40 hover:border-amber-400 ring-1 ring-amber-500/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 text-[10px]">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-bold uppercase tracking-wider ${getBadgeStyle(
                      item.type
                    )}`}
                  >
                    {getIcon(item.type)}
                    <span>{item.type}</span>
                  </span>
                  <span className="text-slate-400">{item.timestamp}</span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-normal mb-3">
                  {item.detail}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                <span className="truncate max-w-[130px] font-semibold text-slate-400">
                  {item.source}
                </span>

                {item.linkRoute ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(item.linkRoute);
                    }}
                    className="inline-flex items-center gap-0.5 text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                  >
                    <span>{item.actionText || 'Inspect'}</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  <span className="text-slate-400">NOMINAL</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Item Detail Modal / Banner */}
        {selectedItem && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-cyan-500/40 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">INSPECTING:</span>
              <span className="text-white font-semibold">{selectedItem.title}</span>
              <span className="hidden sm:inline text-slate-400">— {selectedItem.detail}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selectedItem.linkRoute && (
                <button
                  type="button"
                  onClick={() => handleAction(selectedItem.linkRoute)}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] cursor-pointer"
                >
                  {selectedItem.actionText || 'Visit'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
