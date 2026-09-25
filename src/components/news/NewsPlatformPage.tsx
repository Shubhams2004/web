import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { NewsArticle, NewsCategory } from '../../types';
import { SAMPLE_ARTICLES, NEWS_CATEGORIES } from '../../data/newsPlatformData';
import { NewsHeader } from './NewsHeader';
import { BreakingNewsBanner } from './BreakingNewsBanner';
import { CategoryNavbar } from './CategoryNavbar';
import { FeaturedHeadlines } from './FeaturedHeadlines';
import { NewsCard } from './NewsCard';
import { TrendingSidebar } from './TrendingSidebar';
import { NewsArticleModal } from './NewsArticleModal';
import { NewsFooter } from './NewsFooter';
import {
  Search,
  RotateCcw,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Radio,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { fetchNewsArticles, formatRelativeTime } from '../../utils/newsApi';

interface NewsPlatformPageProps {
  onBackToPortfolio: () => void;
  initialCategory?: NewsCategory;
}

export const NewsPlatformPage: React.FC<NewsPlatformPageProps> = ({
  onBackToPortfolio,
  initialCategory = 'All',
}) => {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [displayCount, setDisplayCount] = useState<number>(6);

  // Live News State
  const [articles, setArticles] = useState<NewsArticle[]>(SAMPLE_ARTICLES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLiveFeed, setIsLiveFeed] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [relativeUpdatedText, setRelativeUpdatedText] = useState<string>('Just now');

  // Guard against concurrent overlapping requests
  const isFetchingRef = useRef<boolean>(false);

  // Saved articles in localStorage
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('news_saved_articles');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('news_saved_articles', JSON.stringify(savedArticleIds));
    } catch {
      // ignore
    }
  }, [savedArticleIds]);

  // Set document title
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'The News Chronicle | Modern Digital Newsroom';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => {
      document.title = originalTitle;
    };
  }, []);

  // Primary data loader from live /api/news pipeline
  const loadNews = useCallback(
    async (isManualRefresh = false, targetCategory?: NewsCategory) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isManualRefresh) {
        setIsRefreshing(true);
      }
      setFetchError(null);

      try {
        const categoryToFetch = targetCategory || activeCategory;
        const res = await fetchNewsArticles(categoryToFetch, isManualRefresh);

        if (Array.isArray(res.articles) && res.articles.length > 0) {
          // If category is specific and we already have articles, merge or replace
          setArticles((prev) => {
            if (categoryToFetch === 'All') {
              return res.articles;
            }
            // Merge category items into broad pool without duplicates
            const others = prev.filter((p) => p.category !== categoryToFetch);
            return [...res.articles, ...others];
          });

          setIsLiveFeed(res.fromBackend);
          const updateTime = new Date();
          setLastUpdated(updateTime);
          setRelativeUpdatedText(formatRelativeTime(updateTime));
        } else {
          // Fallback to sample articles if empty response
          if (articles.length === 0) {
            setArticles(SAMPLE_ARTICLES);
          }
          setIsLiveFeed(false);
        }
      } catch (err) {
        console.warn('[NewsPlatform] Error loading live news:', err);
        setFetchError('Unable to sync live wire');
        // Preserve existing articles; only set sample if articles is completely empty
        setArticles((prev) => (prev.length > 0 ? prev : SAMPLE_ARTICLES));
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeCategory, articles.length]
  );

  // Initial fetch on mount
  useEffect(() => {
    loadNews(false, initialCategory);
  }, [initialCategory, loadNews]);

  // Automatic periodic refresh approximately every 15 minutes (900,000 ms)
  useEffect(() => {
    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    const interval = setInterval(() => {
      loadNews(false);
    }, FIFTEEN_MINUTES);

    return () => clearInterval(interval);
  }, [loadNews]);

  // Tick relative time every 30 seconds for the "Last updated" readout
  useEffect(() => {
    if (!lastUpdated) return;

    const tickInterval = setInterval(() => {
      setRelativeUpdatedText(formatRelativeTime(lastUpdated));
    }, 30000);

    return () => clearInterval(tickInterval);
  }, [lastUpdated]);

  const handleManualRefresh = () => {
    if (isRefreshing || isFetchingRef.current) return;
    loadNews(true);
  };

  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedArticleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Article count breakdown by category calculated dynamically from loaded articles
  const articleCountByCategory = useMemo(() => {
    const counts: Record<NewsCategory, number> = {
      All: articles.length,
      India: 0,
      Maharashtra: 0,
      World: 0,
      Politics: 0,
      Business: 0,
      Technology: 0,
      Sports: 0,
      Entertainment: 0,
    };

    articles.forEach((article) => {
      if (counts[article.category] !== undefined) {
        counts[article.category]++;
      }
    });

    return counts;
  }, [articles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // Saved filter
      if (showSavedOnly && !savedArticleIds.includes(article.id)) {
        return false;
      }

      // Category filter
      if (activeCategory !== 'All' && article.category !== activeCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = article.title.toLowerCase().includes(query);
        const matchesSummary = article.summary.toLowerCase().includes(query);
        const matchesLocation = article.location?.toLowerCase().includes(query);
        const matchesAuthor = article.author.name.toLowerCase().includes(query);
        const matchesTags = article.tags.some((tag) => tag.toLowerCase().includes(query));
        const matchesCategory = article.category.toLowerCase().includes(query);

        return (
          matchesTitle ||
          matchesSummary ||
          matchesLocation ||
          matchesAuthor ||
          matchesTags ||
          matchesCategory
        );
      }

      return true;
    });
  }, [articles, activeCategory, searchQuery, showSavedOnly, savedArticleIds]);

  // Trending articles (sorted by rank or views)
  const trendingArticles = useMemo(() => {
    const marked = articles.filter((a) => a.isTrending || a.trendingRank);
    const pool = marked.length >= 3 ? marked : articles;
    return [...pool]
      .sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99))
      .slice(0, 5);
  }, [articles]);

  // Handle breaking news click
  const handleSelectBreakingItem = (headline: string, category: NewsCategory) => {
    const matched = articles.find(
      (a) =>
        a.category === category ||
        a.title.toLowerCase().includes(headline.toLowerCase().slice(0, 20))
    );
    if (matched) {
      setSelectedArticle(matched);
    } else {
      setActiveCategory(category);
    }
  };

  const visibleArticles = filteredArticles.slice(0, displayCount);
  const hasMore = displayCount < filteredArticles.length;

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-800 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Newsroom Header */}
      <NewsHeader
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setDisplayCount(6);
        }}
        onBackToPortfolio={onBackToPortfolio}
        savedCount={savedArticleIds.length}
        showSavedOnly={showSavedOnly}
        onToggleSavedOnly={() => setShowSavedOnly((prev) => !prev)}
      />

      {/* 2. Breaking News Banner */}
      <BreakingNewsBanner onSelectBreakingItem={handleSelectBreakingItem} />

      {/* 3. Sticky Category Navigation */}
      <CategoryNavbar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setDisplayCount(6);
        }}
        articleCountByCategory={articleCountByCategory}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Subtle Non-intrusive Refresh Error Banner if present */}
        {fetchError && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{fetchError}. Preserving current dispatches.</span>
            </div>
            <button
              type="button"
              onClick={handleManualRefresh}
              className="px-2 py-1 rounded bg-amber-200/80 hover:bg-amber-300 font-bold transition-colors cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* 4. Featured / Top Headlines Section (Shown on 'All' when not searching or viewing saved only) */}
        {activeCategory === 'All' && !searchQuery && !showSavedOnly && (
          <FeaturedHeadlines
            articles={articles}
            onSelectArticle={(article) => setSelectedArticle(article)}
            savedArticleIds={savedArticleIds}
            onToggleSave={handleToggleSave}
          />
        )}

        {/* Section Heading, Live Status, Last Updated & Refresh Control */}
        <div className="pt-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 font-serif tracking-tight">
                {showSavedOnly
                  ? 'Your Bookmarked Articles'
                  : searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : activeCategory === 'All'
                  ? 'Latest News & Investigative Reports'
                  : `${activeCategory} Bureau Coverage`}
              </h2>

              {isLiveFeed && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Wire</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Showing {filteredArticles.length} verified{' '}
              {filteredArticles.length === 1 ? 'article' : 'articles'}
              {activeCategory !== 'All' && !showSavedOnly && ` under ${activeCategory}`}
            </p>
          </div>

          {/* Right Controls: Last Updated + Manual Refresh + Reset Filters */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {lastUpdated && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono border border-slate-200">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Updated {relativeUpdatedText}</span>
              </span>
            )}

            {/* Manual Refresh Button */}
            <button
              type="button"
              id="news-refresh-button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-950 text-xs font-semibold shadow-2xs transition-all disabled:opacity-60 cursor-pointer active:scale-95"
              title="Fetch fresh news from the repository live pipeline"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh News'}</span>
            </button>

            {/* Active filter badges / reset */}
            {(activeCategory !== 'All' || searchQuery || showSavedOnly) && (
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                  setShowSavedOnly(false);
                  setDisplayCount(6);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* 5. 2-Column Responsive News Layout (Main News Feed + Trending Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Primary Column: News Feed (Span 8 on lg) */}
          <section className="lg:col-span-8 flex flex-col">
            {isLoading && articles.length === 0 ? (
              /* Skeleton Loading Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden p-4 space-y-3 animate-pulse"
                  >
                    <div className="aspect-16/10 w-full bg-slate-200 rounded-lg" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-5/6" />
                  </div>
                ))}
              </div>
            ) : filteredArticles.length === 0 ? (
              /* Empty State */
              <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs my-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {showSavedOnly ? 'No saved articles yet' : 'No articles matched your criteria'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                  {showSavedOnly
                    ? 'Click the bookmark icon on any news card to save stories for offline reading.'
                    : `We couldn't find any dispatches matching "${searchQuery || activeCategory}". Try searching for another topic or reset filters.`}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('All');
                    setSearchQuery('');
                    setShowSavedOnly(false);
                  }}
                  className="mt-5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  View All Latest News
                </button>
              </div>
            ) : (
              /* News Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {visibleArticles.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    onSelect={(art) => setSelectedArticle(art)}
                    isSaved={savedArticleIds.includes(article.id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  id="load-more-news-btn"
                  onClick={() => setDisplayCount((prev) => prev + 6)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <span>
                    Load More Dispatches ({filteredArticles.length - displayCount} remaining)
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>

          {/* Right Column: Trending & Markets Sidebar (Span 4 on lg) */}
          <div className="lg:col-span-4">
            <TrendingSidebar
              trendingArticles={trendingArticles}
              onSelectArticle={(art) => setSelectedArticle(art)}
            />
          </div>
        </div>
      </main>

      {/* 6. Clean Newsroom Footer */}
      <NewsFooter
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onBackToPortfolio={onBackToPortfolio}
      />

      {/* 7. Full Article Reader Modal */}
      <NewsArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        isSaved={selectedArticle ? savedArticleIds.includes(selectedArticle.id) : false}
        onToggleSave={handleToggleSave}
        onSelectRelatedArticle={(art) => setSelectedArticle(art)}
        allArticles={articles}
      />
    </div>
  );
};
