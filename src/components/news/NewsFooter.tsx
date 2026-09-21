import React from 'react';
import { ArrowUp, ArrowLeft, ShieldCheck, Globe, Mail, Rss } from 'lucide-react';
import { NEWS_CATEGORIES } from '../../data/newsPlatformData';
import { NewsCategory } from '../../types';

interface NewsFooterProps {
  onSelectCategory: (cat: NewsCategory) => void;
  onBackToPortfolio: () => void;
}

export const NewsFooter: React.FC<NewsFooterProps> = ({
  onSelectCategory,
  onBackToPortfolio,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="news-portal-footer" className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Masthead & Mission */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif uppercase tracking-tight">
              The News Chronicle
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              Independent digital reporting platform delivering comprehensive national, regional, and international news with verified attribution, data journalism, and policy research.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToPortfolio}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portfolio</span>
            </button>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              title="Scroll back to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Category Sitemap Grid */}
        <div className="py-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6 text-xs border-b border-slate-800/80">
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-white text-[11px] font-sans">
              National & Regional
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('India')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  India National News
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('Maharashtra')}
                  className="hover:text-white transition-colors cursor-pointer text-amber-400"
                >
                  Maharashtra & Mumbai Desk
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('Politics')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Politics & Parliament
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-white text-[11px] font-sans">
              Global & Economy
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('World')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  World Affairs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('Business')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Business & Markets
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('Technology')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Tech & Semiconductors
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-white text-[11px] font-sans">
              Culture & Sport
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('Sports')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Cricket & Global Sports
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('Entertainment')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Cinema & Arts Reviews
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('All')}
                  className="hover:text-white transition-colors cursor-pointer font-semibold text-slate-200"
                >
                  All News Wire
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-white text-[11px] font-sans">
              Editorial Standards
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fact-Check Policy</span>
              </li>
              <li><span>Corrections & Updates</span></li>
              <li><span>Source Attribution Code</span></li>
            </ul>
          </div>

          <div className="space-y-2 col-span-2 sm:col-span-4 lg:col-span-1">
            <h4 className="font-bold uppercase tracking-wider text-white text-[11px] font-sans">
              Newsroom Dispatches
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Real-time multi-bureau reporting verified by accredited research journalists.
            </p>
            <div className="flex items-center gap-2 pt-1 text-slate-400">
              <Rss className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[10px] font-mono">RSS 2.0 Syndicated</span>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 The News Chronicle. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>Accreditation Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
