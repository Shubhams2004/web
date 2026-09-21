import React from 'react';
import { NewsArticle } from '../../types';
import { Clock, Eye, Sparkles, TrendingUp, ArrowRight, Bookmark } from 'lucide-react';

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
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
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
            onClick={() => onSelectArticle(leadArticle)}
            className="group relative flex-1 flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            {/* Lead Image with Category Badge & Bookmark */}
            <div className="relative aspect-16/9 sm:aspect-16/10 w-full overflow-hidden bg-slate-100">
              <img
                src={leadArticle.imageUrl}
                alt={leadArticle.title}
                referrerPolicy="no-referrer"
                loading="eager"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

              {/* Category Pill & Location */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-600 text-white shadow-xs tracking-wide uppercase">
                  {leadArticle.category}
                </span>
                {leadArticle.location && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900/80 text-slate-200 backdrop-blur-xs">
                    {leadArticle.location}
                  </span>
                )}
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={(e) => onToggleSave(leadArticle.id, e)}
                className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                  isLeadSaved
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900/70 hover:bg-slate-900 text-slate-200'
                }`}
                title={isLeadSaved ? 'Saved to bookmarks' : 'Save article'}
              >
                <Bookmark className={`w-4 h-4 ${isLeadSaved ? 'fill-current' : ''}`} />
              </button>

              {/* Text overlay on image for impact */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                <span className="text-[11px] font-mono text-blue-300 uppercase tracking-wider mb-1 block">
                  Featured Investigation
                </span>
                <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-snug group-hover:text-blue-200 transition-colors font-serif">
                  {leadArticle.title}
                </h3>
              </div>
            </div>

            {/* Lead Content Box */}
            <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between bg-white">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                {leadArticle.summary}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2.5">
                  {leadArticle.author.avatar && (
                    <img
                      src={leadArticle.author.avatar}
                      alt={leadArticle.author.name}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                  )}
                  <div>
                    <span className="font-semibold text-slate-800 block text-xs">
                      {leadArticle.author.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {leadArticle.author.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {leadArticle.publishedAt}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span>{leadArticle.readTime}</span>
                </div>
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
                onClick={() => onSelectArticle(article)}
                className="group flex flex-col sm:flex-row bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="sm:w-2/5 aspect-16/10 sm:aspect-auto sm:h-auto overflow-hidden bg-slate-100 relative shrink-0">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white uppercase tracking-wider backdrop-blur-xs">
                    {article.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                      <span className="font-medium text-slate-500">{article.location || 'Report'}</span>
                      <span>{article.publishedAt}</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 font-serif">
                      {article.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">{article.author.name}</span>
                    <button
                      type="button"
                      onClick={(e) => onToggleSave(article.id, e)}
                      className="text-slate-400 hover:text-blue-600 p-1"
                      title={isSaved ? 'Saved' : 'Save'}
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
