import React from 'react';
import { ArrowUp, Heart } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="site-footer" className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              {portfolioData.person.avatarInitials}
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-tight block">
                {portfolioData.person.fullName}
              </span>
              <span className="text-xs text-slate-400">
                {portfolioData.person.headline}
              </span>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400">
            {portfolioData.navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={scrollToTop}
            id="back-to-top-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            aria-label="Scroll back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} {portfolioData.person.fullName}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Designed for clarity, empirical research, and publication-grade insights.
          </p>
        </div>
      </div>
    </footer>
  );
};
