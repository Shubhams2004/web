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

  return (
    <article
      id={`news-card-${article.id}`}
      onClick={() => onSelect(article)}
      className="group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Article Image Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={article.imageUrl}
          alt={article.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
        />
        {/* Category Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-900/85 text-white backdrop-blur-xs tracking-wider uppercase">
            {article.category}
          </span>
          {article.isBreaking && (
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white uppercase tracking-wider animate-pulse">
              Breaking
            </span>
          )}
        </div>

        {/* Action icons (Bookmark & Share) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-slate-200 backdrop-blur-xs transition-colors"
            title="Share article"
            aria-label="Share article"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={(e) => onToggleSave(article.id, e)}
            className={`p-1.5 rounded-full backdrop-blur-xs transition-colors ${
              isSaved
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900/60 hover:bg-slate-900 text-slate-200'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save article'}
            aria-label={isSaved ? 'Remove from saved' : 'Save article'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Article Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span className="font-semibold text-blue-700 uppercase tracking-wider">
              {article.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.publishedAt}
            </span>
          </div>

          {/* Headline */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 font-serif">
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2 line-clamp-3">
            {article.summary}
          </p>
        </div>

        {/* Footer: Authentic Source Attribution & Read Time */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-800 truncate max-w-[150px]">
              {article.source || article.author?.name || 'Verified Source'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>{article.readTime}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>
      </div>
    </article>
  );
};
