import React, { useState, useEffect, useMemo } from 'react';
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
import { Search, RotateCcw, Filter, Sparkles, ChevronDown } from 'lucide-react';

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

  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedArticleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Article count breakdown by category
  const articleCountByCategory = useMemo(() => {
    const counts: Record<NewsCategory, number> = {
      All: SAMPLE_ARTICLES.length,
      India: 0,
      Maharashtra: 0,
      World: 0,
      Politics: 0,
      Business: 0,
      Technology: 0,
      Sports: 0,
      Entertainment: 0,
    };

    SAMPLE_ARTICLES.forEach((article) => {
      if (counts[article.category] !== undefined) {
        counts[article.category]++;
      }
    });

    return counts;
  }, []);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return SAMPLE_ARTICLES.filter((article) => {
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

        return matchesTitle || matchesSummary || matchesLocation || matchesAuthor || matchesTags || matchesCategory;
      }

      return true;
    });
  }, [activeCategory, searchQuery, showSavedOnly, savedArticleIds]);

  // Trending articles (sorted by rank or views)
  const trendingArticles = useMemo(() => {
    return [...SAMPLE_ARTICLES]
      .filter((a) => a.isTrending || a.trendingRank)
      .sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99))
      .slice(0, 5);
  }, []);

  // Handle breaking news click
  const handleSelectBreakingItem = (headline: string, category: NewsCategory) => {
    // Find if we have an article matching category or topic
    const matched = SAMPLE_ARTICLES.find(
      (a) => a.category === category || a.title.toLowerCase().includes(headline.toLowerCase().slice(0, 20))
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
        {/* 4. Featured / Top Headlines Section (Shown on 'All' when not searching or viewing saved only) */}
        {activeCategory === 'All' && !searchQuery && !showSavedOnly && (
          <FeaturedHeadlines
            articles={SAMPLE_ARTICLES}
            onSelectArticle={(article) => setSelectedArticle(article)}
            savedArticleIds={savedArticleIds}
            onToggleSave={handleToggleSave}
          />
        )}

        {/* Section Heading & Filter Indicators */}
        <div className="pt-8 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 font-serif tracking-tight">
                {showSavedOnly
                  ? 'Your Bookmarked Articles'
                  : searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : activeCategory === 'All'
                  ? 'Latest News & Investigative Reports'
                  : `${activeCategory} Bureau Coverage`}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Showing {filteredArticles.length} verified {filteredArticles.length === 1 ? 'article' : 'articles'}
              {activeCategory !== 'All' && !showSavedOnly && ` under ${activeCategory}`}
            </p>
          </div>

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
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* 5. 2-Column Responsive News Layout (Main News Feed + Trending Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Primary Column: News Feed (Span 8 on lg) */}
          <section className="lg:col-span-8 flex flex-col">
            {filteredArticles.length === 0 ? (
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
                  <span>Load More Dispatches ({filteredArticles.length - displayCount} remaining)</span>
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
        allArticles={SAMPLE_ARTICLES}
      />
    </div>
  );
};
