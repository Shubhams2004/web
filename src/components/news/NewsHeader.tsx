import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Bookmark,
  ArrowLeft,
  Sun,
  TrendingUp,
  Clock,
  Radio,
  Share2,
} from 'lucide-react';
import { REGIONAL_WEATHER, MARKET_TICKERS } from '../../data/newsPlatformData';
import { BrandLogo } from '../BrandLogo';

interface NewsHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onBackToPortfolio: () => void;
  savedCount: number;
  showSavedOnly: boolean;
  onToggleSavedOnly: () => void;
}

export const NewsHeader: React.FC<NewsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onBackToPortfolio,
  savedCount,
  showSavedOnly,
  onToggleSavedOnly,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [activeWeatherIdx, setActiveWeatherIdx] = useState<number>(0);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      };
      setCurrentDateTime(now.toLocaleDateString('en-US', options));
    };
    updateTime();
  }, []);

  // Cycle through weather cities smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWeatherIdx((prev) => (prev + 1) % REGIONAL_WEATHER.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const currentWeather = REGIONAL_WEATHER[activeWeatherIdx];

  return (
    <header id="news-portal-header" className="bg-white border-b border-slate-200">
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Live Date & Edition */}
          <div className="flex items-center gap-3 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              {currentDateTime || 'Monday, Sep 21, 2026'}
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-400">
              Edition: <strong className="text-slate-200 font-semibold">India & Global</strong>
            </span>
            <span className="hidden lg:inline text-slate-600">|</span>
            <span className="hidden lg:flex items-center gap-1 text-slate-300">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentWeather.city}:</span>
              <strong className="text-white">{currentWeather.temp}</strong>
              <span className="text-slate-400">({currentWeather.condition})</span>
            </span>
          </div>

          {/* Right: Quick Market Ticker Snippet & Back to Portfolio */}
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
            {/* Quick Market Highlight */}
            <div className="hidden sm:flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">BSE Sensex:</span>
              <span className="font-semibold text-white">{MARKET_TICKERS[0].value}</span>
              <span className="text-emerald-400 font-medium">({MARKET_TICKERS[0].change})</span>
            </div>

            <div className="h-3 w-px bg-slate-700 hidden sm:block" />

            {/* Back to Portfolio Link */}
            <button
              type="button"
              id="back-to-portfolio-btn"
              onClick={onBackToPortfolio}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded text-[11px] font-medium"
              title="Return to Portfolio & Research Work"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Portfolio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Masthead Banner */}
      <div className="py-5 sm:py-7 px-4 sm:px-6 lg:px-8 border-b border-slate-100 bg-linear-to-b from-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          {/* Left: Editorial Tagline & Live status */}
          <div className="hidden lg:flex flex-col items-start text-xs text-slate-500 w-56">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold tracking-wide text-[10px] uppercase border border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
              Live Newsroom
            </span>
            <span className="mt-1 text-[11px] leading-relaxed text-slate-600">
              Real-time reporting across India, Maharashtra & international bureaus.
            </span>
          </div>

          {/* Center: Masthead Title */}
          <div className="text-center flex-1 flex flex-col items-center">
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-1">
              <BrandLogo size="md" className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 drop-shadow-xs" />
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 font-serif uppercase">
                The News Chronicle
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs tracking-wider uppercase text-slate-500 font-medium">
              Independent Journalism • Rigorous Verification • Grounded Analysis
            </p>
          </div>

          {/* Right: Search Toggle & Bookmarks */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center md:justify-end">
            {/* Search Input on larger screens */}
            <div className="relative flex-1 sm:w-64 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="news-header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search headlines, topics, regions..."
                className="w-full pl-9 pr-8 py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs text-slate-900 placeholder:text-slate-500 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Bookmarks / Saved filter toggle */}
            <button
              type="button"
              id="news-bookmarks-toggle-btn"
              onClick={onToggleSavedOnly}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                showSavedOnly
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
              title="View your saved articles"
            >
              <Bookmark className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-current' : ''}`} />
              <span className="hidden xs:inline">Saved</span>
              {savedCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    showSavedOnly ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
