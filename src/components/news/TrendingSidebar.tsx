import React, { useState } from 'react';
import { NewsArticle } from '../../types';
import { Flame, TrendingUp, ShieldCheck, Mail, Check, ArrowRight } from 'lucide-react';
import { MARKET_TICKERS } from '../../data/newsPlatformData';

interface TrendingSidebarProps {
  trendingArticles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const TrendingSidebar: React.FC<TrendingSidebarProps> = ({
  trendingArticles,
  onSelectArticle,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
    }, 3000);
  };

  return (
    <aside id="news-trending-sidebar" className="space-y-6">
      {/* Trending / Most Read Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-sans">
              Trending & Popular
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Past 24 Hours</span>
        </div>

        <div className="divide-y divide-slate-100">
          {trendingArticles.map((article, index) => {
            const rank = (index + 1).toString().padStart(2, '0');
            return (
              <div
                key={article.id}
                id={`trending-item-${article.id}`}
                onClick={() => onSelectArticle(article)}
                className="py-3 first:pt-0 last:pb-0 group cursor-pointer flex items-start gap-3.5 transition-colors"
              >
                {/* Ordinal Rank Number */}
                <span className="text-xl sm:text-2xl font-black font-serif text-slate-300 group-hover:text-blue-600 transition-colors w-7 shrink-0 text-center">
                  {rank}
                </span>

                {/* Article Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-600 uppercase tracking-wider">
                      {article.category}
                    </span>
                    <span>·</span>
                    <span className="truncate max-w-[130px] font-medium text-slate-500">
                      {article.source || 'Wire'}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h4>

                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {article.publishedAt}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Markets Ticker Card */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Markets & Currencies
            </h4>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">NSE / BSE LIVE</span>
        </div>

        <div className="space-y-2.5">
          {MARKET_TICKERS.map((ticker) => (
            <div
              key={ticker.symbol}
              className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0"
            >
              <div>
                <span className="font-semibold text-slate-200 block text-[11px]">
                  {ticker.symbol}
                </span>
                <span className="text-[10px] text-slate-400">{ticker.name}</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-white block text-xs">
                  {ticker.value}
                </span>
                <span
                  className={`text-[10px] font-mono font-medium ${
                    ticker.isPositive ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {ticker.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Morning Dispatch Newsletter Signup */}
      <div className="bg-linear-to-br from-blue-50 to-slate-50 border border-blue-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 text-blue-900 mb-2">
          <Mail className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider">The Morning Dispatch</h4>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-3">
          Curated intelligence and fact-checked news briefs delivered to your inbox every morning at 7:00 AM.
        </p>

        {subscribed ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Thank you! You are subscribed to The Morning Dispatch.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-2">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address..."
              className="w-full px-3 py-2 bg-white text-xs text-slate-900 placeholder:text-slate-400 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <button
              type="submit"
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Subscribe Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

      {/* Fact-checking Trust & Standards Badge */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h5 className="text-xs font-bold text-slate-900">Verified Editorial Code</h5>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
            All dispatches undergo two-source verification and follow strict journalistic attribution principles.
          </p>
        </div>
      </div>
    </aside>
  );
};
