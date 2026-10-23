import React, { useState } from 'react';
import { NewsArticle } from '../../types';
import { Clock, Bookmark, Share2, Check, ArrowUpRight } from 'lucide-react';

interface NewsCardProps {
  article: NewsArticle;
  onSelect: (article: NewsArticle) => void;
  isSaved: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onSelect,
  isSaved,
  onToggleSave,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator
        .share({
          title: article.title,
          text: article.summary,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${article.title} - ${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(article);
    }
  };

  return (
    <article
      id={`news-card-${article.id}`}
      tabIndex={0}
      role="article"
      aria-label={article.title}
      onClick={() => onSelect(article)}
      onKeyDown={handleKeyDown}
      className="group relative flex flex-col justify-between bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent"
    >
      <div>
        {/* Top Header: Category kicker, Breaking indicator, and Quick Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
              {article.category}
            </span>
            {article.isBreaking && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white uppercase tracking-wider">
                Breaking
              </span>
            )}
            {article.location && (
              <>
                <span className="text-slate-300 text-xs hidden sm:inline">·</span>
                <span className="text-slate-400 text-xs hidden sm:inline font-normal">
                  {article.location}
                </span>
              </>
            )}
          </div>

          {/* Quick Actions (Share & Bookmark) */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Share article"
              aria-label="Share article"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={(e) => onToggleSave(article.id, e)}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                isSaved
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save article'}
              aria-label={isSaved ? 'Remove from saved' : 'Save article'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Headline */}
        <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-900 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2 mb-2">
          {article.title}
        </h3>

        {/* Excerpt / Short Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans line-clamp-3 mb-4">
          {article.summary}
        </p>
      </div>

      {/* Footer: Publication Date, Source Name & Read Time */}
      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-slate-800 truncate max-w-[160px] text-[11px] sm:text-xs">
            {article.source || article.author?.name || 'Verified Source'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono shrink-0">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.publishedAt}
          </span>
          <span>·</span>
          <span>{article.readTime}</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors ml-0.5" />
        </div>
      </div>
    </article>
  );
};

