import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ExternalLink,
  Clock,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  Building2,
  Radio,
} from 'lucide-react';
import { NewsArticle } from '../../types';
import { fetchNewsArticles, formatRelativeTime } from '../../utils/newsApi';
import { missionAudio } from '../../mission-control/audio';
import { safeOpenExternal, safeExternalLinkProps } from '../../utils/security';

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
      const opened = safeOpenExternal(art.url);
      if (!opened) {
        window.location.hash = '#/news';
      }
    } else {
      window.location.hash = '#/news';
    }
  };

  const leadStory = articles[0];
  const secondaryStories = articles.slice(1, 4);

  return (
    <section
      id="live-wire"
      className={`py-14 sm:py-20 bg-white border-b border-slate-200/80 ${className}`}
      aria-label="Live Market Dispatches and News Wire"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Prestigious Editorial Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-10 border-b border-slate-200">
          <div>
            {/* Unboxed metadata kicker */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
              <span className="font-bold text-blue-600">Digital Dispatch</span>
              <span aria-hidden="true">·</span>
              <span>Market Wires & Catalysts</span>
              <span aria-hidden="true">·</span>
              {isLiveWire ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-Time Feed</span>
                </span>
              ) : (
                <span className="text-slate-500">Archived Pipeline</span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 font-serif leading-tight">
              Current Dispatches & Market Catalysts
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Curated corporate intelligence, regulatory filings, and macroeconomic market movements synthesized from verified wires.
            </p>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 text-xs shrink-0">
            {lastUpdated && (
              <span className="text-[11px] font-mono text-slate-500">
                Updated {relativeUpdated}
              </span>
            )}

            <button
              type="button"
              id="refresh-live-wire-btn"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 font-medium text-xs border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh live wire dispatches"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Wire'}</span>
            </button>
          </div>
        </div>

        {/* Non-blocking error notification */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMsg}. Preserving previously loaded dispatches.</span>
            </div>
            <button
              type="button"
              onClick={handleManualRefresh}
              className="px-2.5 py-1 rounded bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && articles.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-7 bg-slate-100 rounded-2xl h-80" />
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-100 rounded-xl h-24" />
              <div className="bg-slate-100 rounded-xl h-24" />
              <div className="bg-slate-100 rounded-xl h-24" />
            </div>
          </div>
        ) : (
          /* Magazine 3-Tier Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: Lead Featured Story (Span 7) */}
            {leadStory && (
              <div
                onClick={() => handleArticleClick(leadStory)}
                className="lg:col-span-7 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white p-7 sm:p-8 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Category and date unboxed metadata */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 font-mono">
                    <span className="font-bold text-blue-600 uppercase tracking-wider">
                      {leadStory.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{leadStory.publishedAt}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-600 font-semibold">{leadStory.source || 'News Wire'}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug font-serif mb-4">
                    {leadStory.title}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed line-clamp-4 mb-6">
                    {leadStory.summary}
                  </p>
                </div>

                <div className="pt-5 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3 text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">
                    Click to read article overview
                  </span>

                  <div className="flex items-center gap-2">
                    {leadStory.url ? (
                      <a
                        {...safeExternalLinkProps(leadStory.url)}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <span>Source Document</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform">
                        <span>Read in Newsroom</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Right: Secondary Stories & Newsroom Portal Card (Span 5) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              {secondaryStories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => handleArticleClick(story)}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mb-2">
                      <span className="font-bold text-blue-700 uppercase tracking-wider">
                        {story.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{story.publishedAt}</span>
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                      {story.title}
                    </h4>

                    {story.summary && (
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                        {story.summary}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 truncate max-w-[160px]">
                      {story.source || 'News Wire'}
                    </span>

                    {story.url ? (
                      <a
                        {...safeExternalLinkProps(story.url)}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        <span>Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Editorial Callout: Jump into Dedicated Newsroom */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4 shadow-sm">
                <div>
                  <h4 className="font-bold text-sm text-slate-100 font-serif">
                    The News Chronicle Platform
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Browse dedicated category beats: Technology, Global Markets, Politics & Macro.
                  </p>
                </div>

                <a
                  href="#/news"
                  onClick={(e) => {
                    if (onOpenNewsroom) {
                      e.preventDefault();
                      onOpenNewsroom();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer"
                >
                  <span>Open Newsroom</span>
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
