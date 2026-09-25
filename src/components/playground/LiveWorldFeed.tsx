import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Activity,
  Pause,
  Play,
  Terminal,
  Radio,
  Gamepad2,
  Sparkles,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { missionAudio } from '../../mission-control/audio';
import { fetchNewsArticles, formatRelativeTime } from '../../utils/newsApi';
import { NewsArticle } from '../../types';

export type FeedEventType = 'SYSTEM EVENT' | 'GAME DISCOVERED' | 'SECRET DETECTED' | 'SIGNAL RECEIVED';

export interface FeedItem {
  id: string;
  type: FeedEventType;
  title: string;
  detail: string;
  timestamp: string;
  source: string;
  linkRoute?: string;
  externalUrl?: string;
  actionText?: string;
  isSecret?: boolean;
  isLiveNews?: boolean;
}

const BASE_TELEMETRY_ITEMS: FeedItem[] = [
  {
    id: 'ev-base-1',
    type: 'SYSTEM EVENT',
    title: 'Quantum Telemetry Synchronized',
    detail: 'Research cache & analytical processor running on nominal cycles.',
    timestamp: 'Recent',
    source: 'RESEARCH-CORE',
    linkRoute: '#case-studies',
    actionText: 'View Case Studies',
  },
  {
    id: 'ev-base-2',
    type: 'GAME DISCOVERED',
    title: 'Arcade Suite Primed',
    detail: 'Pixel Dungeon, Zombie Survival, and Retro Racer active on 60 FPS canvas.',
    timestamp: 'Recent',
    source: 'ARCADE-SUITE',
    linkRoute: '#/game',
    actionText: 'Launch Arcade',
  },
  {
    id: 'ev-base-3',
    type: 'SECRET DETECTED',
    title: 'Subterranean Frequency Intercepted',
    detail: 'Terminal shortcut [Ctrl+Shift+M] opens classified Mission Control HQ.',
    timestamp: 'Recent',
    source: 'MISSION-CONTROL',
    linkRoute: '#/mission-control',
    actionText: 'Access HQ',
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
  const [items, setItems] = useState<FeedItem[]>(BASE_TELEMETRY_ITEMS);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveWire, setIsLiveWire] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [relativeUpdated, setRelativeUpdated] = useState('Just now');
  const [activeFilter, setActiveFilter] = useState<'ALL' | FeedEventType>('ALL');
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);

  const isFetchingRef = useRef(false);

  // Load real live news from repository API and transform into feed items
  const loadLiveFeedNews = useCallback(async (isManual = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (isManual) setIsLoading(true);

    try {
      const res = await fetchNewsArticles('All', isManual);
      if (Array.isArray(res.articles) && res.articles.length > 0) {
        // Convert real live articles into authentic feed items
        const liveFeedItems: FeedItem[] = res.articles.map((art, idx) => ({
          id: `news-${art.id}-${idx}`,
          type: 'SIGNAL RECEIVED',
          title: art.title,
          detail: art.summary,
          timestamp: art.publishedAt || 'Recent',
          source: art.source ? art.source.toUpperCase() : 'NEWS WIRE',
          externalUrl: art.url,
          linkRoute: '#/news',
          actionText: art.url ? 'Read Source' : 'View in Newsroom',
          isLiveNews: true,
        }));

        setItems([
          ...liveFeedItems.slice(0, 7),
          ...BASE_TELEMETRY_ITEMS,
          ...liveFeedItems.slice(7, 12),
        ]);
        setIsLiveWire(res.fromBackend);
        const updateTime = new Date();
        setLastUpdated(updateTime);
        setRelativeUpdated(formatRelativeTime(updateTime));
      }
    } catch {
      // Preserve existing items
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    loadLiveFeedNews(false);
  }, [loadLiveFeedNews]);

  // Periodic 15-minute refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        loadLiveFeedNews(false);
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isPaused, loadLiveFeedNews]);

  // Tick relative time
  useEffect(() => {
    if (!lastUpdated) return;
    const tick = setInterval(() => {
      setRelativeUpdated(formatRelativeTime(lastUpdated));
    }, 30000);
    return () => clearInterval(tick);
  }, [lastUpdated]);

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

  const handleAction = (item: FeedItem) => {
    missionAudio.playBeep(880, 0.08);
    if (item.externalUrl) {
      window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (item.linkRoute) {
      window.location.hash = item.linkRoute;
    }
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
              <div className="flex items-center gap-2">
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

                {isLiveWire ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                    LIVE WIRE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[10px]">
                    ARCHIVE FEED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                Real-world news dispatches, research milestones, and telemetry signals
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {lastUpdated && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Updated {relativeUpdated}</span>
              </span>
            )}

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(['ALL', 'SIGNAL RECEIVED', 'SYSTEM EVENT', 'GAME DISCOVERED', 'SECRET DETECTED'] as const).map(
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
                      : filter === 'SIGNAL RECEIVED'
                      ? 'WIRE NEWS'
                      : filter === 'SYSTEM EVENT'
                      ? 'SYSTEM'
                      : filter === 'GAME DISCOVERED'
                      ? 'GAMES'
                      : 'SECRETS'}
                  </button>
                )
              )}
            </div>

            {/* Manual Refresh Button */}
            <button
              type="button"
              onClick={() => {
                missionAudio.playBeep(640, 0.05);
                loadLiveFeedNews(true);
              }}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh live feed"
            >
              <RefreshCw className={`w-3 h-3 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-[11px]">SYNC</span>
            </button>

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
                    <span>{item.type === 'SIGNAL RECEIVED' ? 'LIVE DISPATCH' : item.type}</span>
                  </span>
                  <span className="text-slate-400">{item.timestamp}</span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-normal mb-3 line-clamp-2">
                  {item.detail}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                <span className="truncate max-w-[140px] font-semibold text-slate-300">
                  {item.source}
                </span>

                {item.externalUrl ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(item);
                    }}
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                  >
                    <span>Read Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                ) : item.linkRoute ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(item);
                    }}
                    className="inline-flex items-center gap-0.5 text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                  >
                    <span>{item.actionText || 'Inspect'}</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  <span className="text-slate-500 font-mono">NOMINAL</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Item Detail Popover / Inspector */}
        {selectedItem && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
                  [CARRIER INSPECT]
                </span>
                <span className="text-slate-400 text-[10px]">{selectedItem.source}</span>
              </div>
              <h4 className="text-white font-bold text-xs sm:text-sm">{selectedItem.title}</h4>
              <p className="text-slate-400 text-[11px] mt-1">{selectedItem.detail}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selectedItem.externalUrl ? (
                <a
                  href={selectedItem.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  <span>Open Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : selectedItem.linkRoute ? (
                <button
                  type="button"
                  onClick={() => handleAction(selectedItem)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
                >
                  {selectedItem.actionText || 'Visit'}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs cursor-pointer"
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
