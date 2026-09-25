import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Radio,
  ExternalLink,
  Clock,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { NewsArticle } from '../../types';
import { fetchNewsArticles, formatRelativeTime } from '../../utils/newsApi';
import { missionAudio } from '../../mission-control/audio';

interface CuratedLiveWireProps {
  onOpenNewsroom?: () => void;
  onSelectArticle?: (article: NewsArticle) => void;
  className?: string;
}

export const CuratedLiveWire: React.FC<CuratedLiveWireProps> = ({
  onOpenNewsroom,
  onSelectArticle,
  className = '',
}) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLiveWire, setIsLiveWire] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [relativeUpdated, setRelativeUpdated] = useState<string>('Just now');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isFetchingRef = useRef<boolean>(false);

  const loadData = useCallback(async (isManual = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (isManual) setIsRefreshing(true);
    setErrorMsg(null);

    try {
      const res = await fetchNewsArticles('All', isManual);
      if (Array.isArray(res.articles) && res.articles.length > 0) {
        setArticles(res.articles);
        setIsLiveWire(res.fromBackend);
        const updateTime = new Date();
        setLastUpdated(updateTime);
        setRelativeUpdated(formatRelativeTime(updateTime));
      }
    } catch (err) {
      console.warn('[CuratedLiveWire] Error fetching live wire:', err);
      setErrorMsg('Unable to refresh live wire dispatches');
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Periodic 15-minute background refresh
  useEffect(() => {
    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    const interval = setInterval(() => {
      loadData(false);
    }, FIFTEEN_MINUTES);

    return () => clearInterval(interval);
  }, [loadData]);

  // Tick relative time
  useEffect(() => {
    if (!lastUpdated) return;
    const tick = setInterval(() => {
      setRelativeUpdated(formatRelativeTime(lastUpdated));
    }, 30000);
    return () => clearInterval(tick);
  }, [lastUpdated]);

  const handleManualRefresh = () => {
    if (isRefreshing || isFetchingRef.current) return;
    missionAudio.playBeep(680, 0.05);
    loadData(true);
  };

  const handleArticleClick = (art: NewsArticle) => {
    missionAudio.playTerminalBlip();
    if (onSelectArticle) {
      onSelectArticle(art);
    } else if (art.url) {
      window.open(art.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.hash = '#/news';
    }
  };

  const leadStory = articles[0];
  const secondaryStories = articles.slice(1, 4);

  return (
    <section
      id="live-wire"
      className={`py-12 sm:py-16 bg-white border-b border-slate-200/80 ${className}`}
      aria-label="Live Research and News Wire"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80">
                <Radio className="w-3.5 h-3.5 text-blue-600" />
                <span>Live Wire Intelligence</span>
              </span>

              {isLiveWire ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LIVE NEWS PIPELINE</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-medium">
                  <span>Archived Reference Feed</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 font-serif leading-tight">
              Current Dispatches & Market Catalysts
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Real-time dispatches from verified media wires and corporate sources. Integrated directly into the research laboratory.
            </p>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 text-xs shrink-0">
            {lastUpdated && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Updated {relativeUpdated}</span>
              </span>
            )}

            <button
              type="button"
              id="refresh-live-wire-btn"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh live wire dispatches"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh Wire'}</span>
            </button>
          </div>
        </div>

        {/* Subtle non-blocking notification if fetch failed */}
        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMsg}. Preserving previously loaded dispatches.</span>
            </div>
            <button
              type="button"
              onClick={handleManualRefresh}
              className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold hover:bg-amber-300"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && articles.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
            <div className="lg:col-span-7 bg-slate-100 rounded-2xl h-80" />
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-100 rounded-xl h-24" />
              <div className="bg-slate-100 rounded-xl h-24" />
              <div className="bg-slate-100 rounded-xl h-24" />
            </div>
          </div>
        ) : (
          /* Curated 2-Column Content Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Lead Featured Real Story (Span 7) */}
            {leadStory && (
              <div
                onClick={() => handleArticleClick(leadStory)}
                className="lg:col-span-7 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white p-6 sm:p-7 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                      {leadStory.category}
                    </span>

                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{leadStory.publishedAt}</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug font-serif mb-3">
                    {leadStory.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                    {leadStory.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-xs">
                      {leadStory.source || 'News Wire'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {leadStory.url ? (
                      <a
                        href={leadStory.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        <span>Read Source Article</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-blue-600 font-bold">
                        <span>Inspect in Newsroom</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Right: Breaking & Current Stories Strip (Span 5) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3.5">
              {secondaryStories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => handleArticleClick(story)}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-2xs hover:shadow-xs cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 mb-1.5">
                      <span className="font-bold text-blue-700 uppercase tracking-wider">
                        {story.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{story.publishedAt}</span>
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                      {story.title}
                    </h4>

                    {story.summary && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 leading-relaxed">
                        {story.summary}
                      </p>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                      {story.source || 'News Wire'}
                    </span>

                    {story.url ? (
                      <a
                        href={story.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold"
                      >
                        <span>Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-blue-600 font-bold">
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Direct Jump to Newsroom */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold block text-slate-100">
                    The News Chronicle Platform
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Access dedicated beats: World, Politics, Tech, India, Maharashtra
                  </span>
                </div>

                <a
                  href="#/news"
                  onClick={(e) => {
                    if (onOpenNewsroom) {
                      e.preventDefault();
                      onOpenNewsroom();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer"
                >
                  <span>Open Platform</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
