import React, { useEffect, useState } from 'react';
import { NewsArticle } from '../../types';
import {
  X,
  Clock,
  Bookmark,
  Share2,
  Check,
  Volume2,
  VolumeX,
  Calendar,
  User,
  MapPin,
  Sparkles,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

interface NewsArticleModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectRelatedArticle?: (article: NewsArticle) => void;
  allArticles?: NewsArticle[];
}

export const NewsArticleModal: React.FC<NewsArticleModalProps> = ({
  article,
  onClose,
  isSaved,
  onToggleSave,
  onSelectRelatedArticle,
  allArticles = [],
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (article) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [article, onClose]);

  if (!article) return null;

  const handleShare = () => {
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

  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id && (a.category === article.category || a.tags.some((t) => article.tags.includes(t))))
    .slice(0, 3);

  return (
    <div
      id="news-article-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id={`news-article-modal-${article.id}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-modal-title"
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Sticky Action Top Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-600 text-white uppercase tracking-wider">
              {article.category}
            </span>
            <span className="text-slate-400 hidden sm:inline">·</span>
            <span className="text-slate-500 font-mono text-[11px] hidden sm:inline">
              {article.publishedAt}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Listen Simulator */}
            <button
              type="button"
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isPlayingAudio
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Listen to story audio dispatch"
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden xs:inline">Pause Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden xs:inline">Listen (3 min)</span>
                </>
              )}
            </button>

            {/* Bookmark button */}
            <button
              type="button"
              onClick={(e) => onToggleSave(article.id, e)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={isSaved ? 'Article Saved' : 'Save Article'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Share article"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Close modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer ml-1"
              aria-label="Close article modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Content */}
        <div className="max-h-[82vh] overflow-y-auto p-4 sm:p-8">
          {/* Article Header */}
          <header className="mb-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2.5">
              {article.location && (
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {article.location}
                </span>
              )}
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {article.readTime}
              </span>
              {article.viewsCount && (
                <>
                  <span>·</span>
                  <span>{article.viewsCount} reads</span>
                </>
              )}
            </div>

            <h1
              id="article-modal-title"
              className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-950 font-serif leading-tight tracking-tight mb-4"
            >
              {article.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans border-l-3 border-blue-600 pl-4 py-1">
              {article.summary}
            </p>

            {/* Author Byline Bar */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                {article.author.avatar ? (
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                    {article.author.name.charAt(0)}
                  </div>
                )}
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    By {article.author.name}
                  </span>
                  <span className="text-xs text-slate-500 block">
                    {article.author.role} · The News Chronicle Bureau
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                Published {article.publishedAt}
              </div>
            </div>
          </header>

          {/* Hero Image & Caption */}
          <div className="mb-8 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
            <img
              src={article.imageUrl}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[460px] object-cover"
            />
            {article.imageCaption && (
              <p className="p-3 text-xs text-slate-500 italic bg-slate-50 border-t border-slate-200">
                {article.imageCaption}
              </p>
            )}
          </div>

          {/* Key Takeaways Callout Box */}
          <div className="mb-8 p-4 sm:p-5 rounded-xl bg-blue-50/70 border border-blue-200/80">
            <div className="flex items-center gap-2 mb-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Key Takeaways & Significance</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <li>Direct policy and empirical impact evaluated across public infrastructure sectors.</li>
              <li>Multi-agency coordination backed by budgetary allocations and public review timelines.</li>
              <li>Stakeholder consultation rounds completed with academic and industry experts.</li>
            </ul>
          </div>

          {/* Full Article Body */}
          <div className="prose prose-slate max-w-none space-y-4 text-sm sm:text-base text-slate-800 leading-relaxed font-serif">
            {article.content.map((paragraph, idx) => (
              <p key={idx} className={idx === 0 ? 'first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:text-slate-950 font-serif' : ''}>
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="mt-8 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500">Related Tags:</span>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <div className="mt-10 pt-6 border-t border-slate-200">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">
                Recommended From The Same Beat
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedArticles.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelatedArticle && onSelectRelatedArticle(rel)}
                    className="group bg-slate-50 hover:bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                        {rel.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 mt-1">
                        {rel.title}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {rel.publishedAt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
