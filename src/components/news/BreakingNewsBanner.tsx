import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react';
import { BREAKING_NEWS_ITEMS } from '../../data/newsPlatformData';
import { NewsCategory } from '../../types';

interface BreakingNewsBannerProps {
  onSelectBreakingItem?: (headline: string, category: NewsCategory) => void;
}

export const BreakingNewsBanner: React.FC<BreakingNewsBannerProps> = ({ onSelectBreakingItem }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BREAKING_NEWS_ITEMS.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentItem = BREAKING_NEWS_ITEMS[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % BREAKING_NEWS_ITEMS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + BREAKING_NEWS_ITEMS.length) % BREAKING_NEWS_ITEMS.length);
  };

  return (
    <div
      id="breaking-news-banner"
      className="bg-slate-900 text-white border-y border-red-900/60 shadow-xs relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Breaking Label */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 text-white font-extrabold text-[11px] tracking-wider uppercase shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            Breaking
          </span>
          <span className="text-red-400 font-mono text-[10px] hidden sm:inline-block">
            LIVE UPDATES
          </span>
        </div>

        {/* Center: Ticking Headline */}
        <div className="flex-1 min-w-0 flex items-center gap-2.5 px-2">
          <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80 shrink-0">
            {currentItem.category}
          </span>
          <button
            type="button"
            onClick={() => onSelectBreakingItem && onSelectBreakingItem(currentItem.headline, currentItem.category)}
            className="text-xs sm:text-sm font-medium text-slate-100 hover:text-white truncate text-left transition-colors cursor-pointer group flex items-center gap-1.5"
            title={currentItem.headline}
          >
            <span className="truncate group-hover:underline underline-offset-2">{currentItem.headline}</span>
            <span className="text-[10px] font-mono text-slate-400 shrink-0 font-normal">
              ({currentItem.timestamp})
            </span>
          </button>
        </div>

        {/* Right: Controls (Prev, Pause, Next) */}
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous breaking news headline"
            className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? 'Resume ticker rotation' : 'Pause ticker rotation'}
            className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer text-xs"
            title={isPaused ? 'Resume ticker' : 'Pause ticker'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next breaking news headline"
            className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono text-slate-500 ml-1.5 hidden md:inline">
            {currentIndex + 1}/{BREAKING_NEWS_ITEMS.length}
          </span>
        </div>
      </div>
    </div>
  );
};
