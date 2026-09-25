import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Building2,
  Calendar,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  ExternalLink,
  Sparkles,
  Rss,
  RefreshCw,
  LayoutGrid,
  List,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  ChevronRight,
  Radio,
  Layers,
} from 'lucide-react';
import { BusinessCaseStudy, BusinessRssStory } from '../../types';
import { CaseStudyDetailModal } from '../case-studies/CaseStudyDetailModal';
import { RssDiscoveryDrawer } from '../case-studies/RssDiscoveryDrawer';
import {
  fetchTrendingCaseStudies,
  fetchRecentBusinessStories,
  generateCaseStudyFromStory,
} from '../../utils/caseStudyApi';

export const TrendingCaseStudies: React.FC = () => {
  const [caseStudies, setCaseStudies] = useState<BusinessCaseStudy[]>([]);
  const [rssStories, setRssStories] = useState<BusinessRssStory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingRss, setIsLoadingRss] = useState<boolean>(false);
  const [groqConnected, setGroqConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLiveWire, setIsLiveWire] = useState<boolean>(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'LIVE' | 'BENCHMARK'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals & Drawers
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<BusinessCaseStudy | null>(null);
  const [isRssDrawerOpen, setIsRssDrawerOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load initial data
  const loadData = useCallback(async (force = false) => {
    setIsLoading(true);
    try {
      const res = await fetchTrendingCaseStudies(force);
      if (Array.isArray(res.caseStudies) && res.caseStudies.length > 0) {
        setCaseStudies(res.caseStudies);
      }
      setGroqConnected(res.groqConnected);
      setIsLiveWire(res.fromBackend);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load case studies:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRss = useCallback(async (force = false) => {
    setIsLoadingRss(true);
    try {
      const stories = await fetchRecentBusinessStories(force);
      if (Array.isArray(stories) && stories.length > 0) {
        setRssStories(stories);
      }
    } catch (err) {
      console.error('Failed to load RSS stories:', err);
    } finally {
      setIsLoadingRss(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
    loadRss(false);
  }, [loadData, loadRss]);

  // Periodic automatic refresh every 15 minutes while page is open
  useEffect(() => {
    const timer = setInterval(() => {
      loadData(false);
      loadRss(false);
    }, 15 * 60 * 1000);
    return () => clearInterval(timer);
  }, [loadData, loadRss]);

  // Distinct industries
  const industries = useMemo(() => {
    const set = new Set<string>();
    caseStudies.forEach((cs) => {
      if (cs.industry) set.add(cs.industry);
    });
    return ['All', ...Array.from(set)];
  }, [caseStudies]);

  // Scope counts
  const liveCount = useMemo(() => caseStudies.filter((cs) => cs.isLive).length, [caseStudies]);
  const benchmarkCount = useMemo(() => caseStudies.filter((cs) => !cs.isLive).length, [caseStudies]);

  // Filtered case studies
  const filteredCaseStudies = useMemo(() => {
    return caseStudies.filter((cs) => {
      // Scope match
      if (scopeFilter === 'LIVE' && !cs.isLive) return false;
      if (scopeFilter === 'BENCHMARK' && cs.isLive) return false;

      // Industry match
      const matchesIndustry =
        selectedIndustry === 'All' || cs.industry === selectedIndustry;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cs.company.toLowerCase().includes(q) ||
        (cs.ticker && cs.ticker.toLowerCase().includes(q)) ||
        cs.title.toLowerCase().includes(q) ||
        cs.industry.toLowerCase().includes(q) ||
        cs.whatHappened.toLowerCase().includes(q) ||
        cs.businessProblemOrOpportunity.toLowerCase().includes(q) ||
        cs.strategyActionTaken.toLowerCase().includes(q) ||
        cs.tags.some((t) => t.toLowerCase().includes(q));

      return matchesIndustry && matchesSearch;
    });
  }, [caseStudies, selectedIndustry, searchQuery, scopeFilter]);

  const handleCopyLink = (cs: BusinessCaseStudy, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${cs.company}: ${cs.title}\nKey Lesson: ${cs.keyLessons[0] || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(cs.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewGeneratedStudy = (newStudy: BusinessCaseStudy) => {
    setCaseStudies((prev) => [newStudy, ...prev.filter((p) => p.id !== newStudy.id)]);
    setSelectedCaseStudy(newStudy);
  };

  return (
    <section id="case-studies" className="py-16 md:py-24 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-200">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>Executive Research & Intelligence</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>Live Business Wire Sourced</span>
              </span>
              {lastUpdated && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  • Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Latest Business Case Studies
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Synthesizing real-time corporate catalysts, strategic dilemmas, and public filings into publication-grade, original business case studies. Researched using live RSS wires and Groq inference.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              id="discover-rss-btn"
              onClick={() => setIsRssDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Rss className="w-4 h-4 text-amber-300" />
              <span>Discover from Live RSS Feed</span>
              {rssStories.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-md text-[11px] bg-white/20 text-white font-mono">
                  {rssStories.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                loadData(true);
                loadRss(true);
              }}
              title="Refresh Case Studies"
              className="p-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Toolbar: Scope Tabs, Search, Filters & View Mode */}
        <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Scope Filters (All, Live Dispatches, Benchmark Dives) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl max-w-full overflow-x-auto">
            <button
              type="button"
              onClick={() => setScopeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                scopeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Studies ({caseStudies.length})
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter('LIVE')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                scopeFilter === 'LIVE'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="w-3 h-3 text-amber-300" />
              <span>Live Dispatches ({liveCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter('BENCHMARK')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                scopeFilter === 'BENCHMARK'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3 h-3 text-slate-300" />
              <span>Benchmark Deep Dives ({benchmarkCount})</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 md:justify-end">
            {/* Search Box */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search company, problem, lesson..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Industry Dropdown Filter */}
            <select
              aria-label="Filter by Industry"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 focus:outline-hidden cursor-pointer shadow-2xs"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind === 'All' ? 'All Industries' : ind}
                </option>
              ))}
            </select>

            {/* Layout Toggle */}
            <div className="hidden sm:flex items-center border border-slate-200 bg-white rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="List view"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter & Freshness Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pb-4">
          <span>
            Showing <strong className="text-slate-800">{filteredCaseStudies.length}</strong> of{' '}
            {caseStudies.length} case studies
            {selectedIndustry !== 'All' && ` in "${selectedIndustry}"`}
          </span>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full 9-Part Case Study Schema Included</span>
            </span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-80 rounded-2xl bg-white border border-slate-200 p-6 animate-pulse space-y-4"
              >
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-16 bg-slate-100 rounded" />
                <div className="h-12 bg-slate-100 rounded" />
                <div className="h-8 bg-slate-200 rounded mt-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Empty Search State */}
        {!isLoading && filteredCaseStudies.length === 0 && (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No case studies match your query</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search terms or generate a brand new case study from our live business RSS wire.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedIndustry('All');
                  setScopeFilter('ALL');
                }}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => setIsRssDrawerOpen(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Research from Live RSS
              </button>
            </div>
          </div>
        )}

        {/* Case Studies Grid View */}
        {!isLoading && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCaseStudies.map((study) => {
              const primaryMetric = study.importantDataOrResults?.metrics?.[0];
              const primarySource = study.sources?.[0];

              return (
                <article
                  key={study.id}
                  onClick={() => setSelectedCaseStudy(study)}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400/80 shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden cursor-pointer group hover:-translate-y-0.5"
                >
                  {/* Card Top Pill Bar with Authentic Ranking Badge & Company */}
                  <div className="p-5 pb-3 border-b border-slate-100 flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          <Building2 className="w-3 h-3 text-blue-600" />
                          <span>{study.company}</span>
                          {study.ticker && (
                            <span className="font-mono text-[10px] text-blue-500">
                              ({study.ticker})
                            </span>
                          )}
                        </span>

                        <span className="text-[11px] font-medium text-slate-500 px-2 py-0.5 rounded-md bg-slate-100 truncate max-w-[130px]">
                          {study.industry}
                        </span>
                      </div>

                      {/* Genuine Ranking Signal Badge */}
                      {study.rankingSignal && (
                        <div className="flex items-center gap-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              study.isLive
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {study.isLive && <Radio className="w-2.5 h-2.5 text-amber-600" />}
                            <span>{study.rankingSignal}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    <span className="text-[11px] font-medium text-slate-400 shrink-0 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{study.date}</span>
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col space-y-4">
                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                      {study.title}
                    </h3>

                    {/* What Happened (Concise snippet) */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        What Happened
                      </span>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {study.whatHappened}
                      </p>
                    </div>

                    {/* Primary Highlight Metric Box */}
                    {primaryMetric && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                            Key Indicator ({primaryMetric.label})
                          </span>
                          <span className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                            {primaryMetric.value}
                          </span>
                        </div>
                        {primaryMetric.change && (
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-md ${
                              primaryMetric.isPositive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {primaryMetric.change}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Strategic Lesson Snippet */}
                    {study.keyLessons && study.keyLessons.length > 0 && (
                      <div className="mt-auto pt-2 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-purple-600" />
                          <span>Core Takeaway ({study.keyLessons.length} Lessons)</span>
                        </span>
                        <p className="text-xs text-slate-700 font-medium line-clamp-2 italic bg-purple-50/40 p-2.5 rounded-lg border border-purple-100/60">
                          "{study.keyLessons[0]}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Real Publisher Attribution & Real Source Link */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-auto">
                    <div className="flex items-center gap-2 min-w-0">
                      {primarySource ? (
                        <a
                          href={primarySource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 transition-colors truncate"
                          title={`Original reporting by ${primarySource.publisher || 'Source'}`}
                        >
                          <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{primarySource.publisher || 'Verified Source'}</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">Research Archive</span>
                      )}
                      <span>·</span>
                      <span className="text-[11px] text-slate-400 shrink-0">{study.readTime}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(study, e)}
                        title="Copy synthesis takeaway"
                        className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      >
                        {copiedId === study.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-700">
                        <span>Read Study</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Case Studies List View */}
        {!isLoading && viewMode === 'list' && (
          <div className="space-y-3">
            {filteredCaseStudies.map((study) => {
              const primarySource = study.sources?.[0];
              return (
                <article
                  key={study.id}
                  onClick={() => setSelectedCaseStudy(study)}
                  className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-4 sm:p-5 transition-all shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {study.company}
                      </span>
                      <span className="text-xs text-slate-500 px-2 py-0.5 rounded bg-slate-100">
                        {study.industry}
                      </span>
                      {study.rankingSignal && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            study.isLive
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {study.rankingSignal}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-400">{study.date}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {study.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      {study.whatHappened}
                    </p>

                    {primarySource && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                        <span>Source:</span>
                        <a
                          href={primarySource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          {primarySource.publisher || 'Verified Wire'}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 group-hover:bg-blue-600 text-white text-xs font-bold transition-colors">
                      <span>Read Study</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Case Study Detail Modal */}
      <CaseStudyDetailModal
        caseStudy={selectedCaseStudy}
        onClose={() => setSelectedCaseStudy(null)}
      />

      {/* RSS Discovery Drawer */}
      <RssDiscoveryDrawer
        isOpen={isRssDrawerOpen}
        onClose={() => setIsRssDrawerOpen(false)}
        stories={rssStories}
        isLoadingStories={isLoadingRss}
        onRefreshStories={() => loadRss(true)}
        onGenerateCaseStudy={generateCaseStudyFromStory}
        onCaseStudyGenerated={handleNewGeneratedStudy}
        groqConnected={groqConnected}
      />
    </section>
  );
};
