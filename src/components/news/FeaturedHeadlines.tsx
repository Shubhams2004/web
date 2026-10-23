import React from 'react';
import { NewsArticle } from '../../types';
import { Clock, Sparkles, ArrowRight, Bookmark } from 'lucide-react';

interface FeaturedHeadlinesProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  savedArticleIds: string[];
  onToggleSave: (id: string, e: React.MouseEvent) => void;
}

export const FeaturedHeadlines: React.FC<FeaturedHeadlinesProps> = ({
  articles,
  onSelectArticle,
  savedArticleIds,
  onToggleSave,
}) => {
  if (!articles || articles.length === 0) return null;

  // Lead story is first featured or first article
  const leadArticle = articles.find((a) => a.isFeatured) || articles[0];
  // Secondary stories (next 2)
  const secondaryArticles = articles.filter((a) => a.id !== leadArticle.id).slice(0, 2);
  // Quick Wire / Briefing items (next 4)
  const wireArticles = articles.filter((a) => a.id !== leadArticle.id && !secondaryArticles.some((s) => s.id === a.id)).slice(0, 4);

  const isLeadSaved = savedArticleIds.includes(leadArticle.id);

  return (
    <section id="featured-top-headlines" className="py-6 sm:py-8 border-b border-slate-200">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
            Top Story & Editorial Spotlight
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-500">Curated by Newsroom Desk</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Lead Headline Story (Span 7 on lg) */}
        <div className="lg:col-span-7 flex flex-col">
          <div
            id={`lead-story-${leadArticle.id}`}
            tabIndex={0}
            role="article"
            aria-label={leadArticle.title}
            onClick={() => onSelectArticle(leadArticle)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectArticle(leadArticle);
              }
            }}
            className="group relative flex-1 flex flex-col justify-between bg-white rounded-xl border border-slate-200/90 p-6 sm:p-8 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <div>
              {/* Lead Story Kicker & Bookmark */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-bold text-blue-700 uppercase tracking-wider text-[11px] sm:text-xs">
                    {leadArticle.category}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="font-medium text-slate-500 text-[11px]">
                    Featured Investigation
                  </span>
                  {leadArticle.location && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="font-medium text-slate-500 text-[11px]">
                        {leadArticle.location}
                      </span>
                    </>
                  )}
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(leadArticle.id, e);
                  }}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
                    isLeadSaved
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title={isLeadSaved ? 'Saved to bookmarks' : 'Save article'}
                  aria-label={isLeadSaved ? 'Saved to bookmarks' : 'Save article'}
                >
                  <Bookmark className={`w-4 h-4 ${isLeadSaved ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Lead Headline */}
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif text-slate-950 group-hover:text-blue-700 transition-colors leading-tight tracking-tight mt-2 mb-4">
                {leadArticle.title}
              </h3>

              {/* Lead Excerpt */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans line-clamp-4 mb-6">
                {leadArticle.summary}
              </p>
            </div>

            {/* Lead Metadata Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 text-xs">
                  {leadArticle.source || leadArticle.author?.name || 'Verified Wire'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {leadArticle.publishedAt}
                </span>
                <span className="text-slate-300">·</span>
                <span>{leadArticle.readTime}</span>
                <span className="inline-flex items-center gap-1 text-blue-700 font-sans font-bold group-hover:translate-x-0.5 transition-transform ml-1">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Headlines Column (Span 5 on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4 sm:gap-5">
          {secondaryArticles.map((article) => {
            const isSaved = savedArticleIds.includes(article.id);
            return (
              <div
                key={article.id}
                id={`secondary-story-${article.id}`}
                tabIndex={0}
                role="article"
                aria-label={article.title}
                onClick={() => onSelectArticle(article)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectArticle(article);
                  }
                }}
                className="group bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-700 uppercase tracking-wider">
                        {article.category}
                      </span>
                      {article.location && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="font-medium text-slate-500">{article.location}</span>
                        </>
                      )}
                    </div>
                    <span>{article.publishedAt}</span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold font-serif text-slate-900 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2 mb-2">
                    {article.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {article.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                    {article.source || article.author?.name || 'Verified Wire'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400">{article.readTime}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(article.id, e);
                      }}
                      className={`p-1 rounded-md transition-colors ${
                        isSaved
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={isSaved ? 'Saved' : 'Save'}
                      aria-label={isSaved ? 'Saved' : 'Save'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Wire Strip (Sub-section) */}
          <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-3.5 sm:p-4">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-200 text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Live Wire Bulletins
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-normal">Auto-Refreshed</span>
            </div>
            <div className="divide-y divide-slate-200/60">
              {wireArticles.slice(0, 3).map((wArticle) => (
                <div
                  key={wArticle.id}
                  onClick={() => onSelectArticle(wArticle)}
                  className="py-2 first:pt-0 last:pb-0 group cursor-pointer flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mr-1.5">
                      [{wArticle.category}]
                    </span>
                    <span className="text-xs text-slate-800 group-hover:text-blue-600 transition-colors font-medium line-clamp-1">
                      {wArticle.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 mt-0.5">
                    {wArticle.publishedAt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

