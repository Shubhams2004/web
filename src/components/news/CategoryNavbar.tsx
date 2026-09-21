import React from 'react';
import { NewsCategory } from '../../types';
import { NEWS_CATEGORIES } from '../../data/newsPlatformData';
import { Compass, Flame } from 'lucide-react';

interface CategoryNavbarProps {
  activeCategory: NewsCategory;
  onSelectCategory: (cat: NewsCategory) => void;
  articleCountByCategory?: Record<NewsCategory, number>;
}

export const CategoryNavbar: React.FC<CategoryNavbarProps> = ({
  activeCategory,
  onSelectCategory,
  articleCountByCategory,
}) => {
  return (
    <nav
      id="news-category-navbar"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs"
      aria-label="News Topics and Categories"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-2">
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 min-w-max">
            {NEWS_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.key;
              const count = articleCountByCategory ? articleCountByCategory[cat.key] : null;

              return (
                <button
                  key={cat.key}
                  type="button"
                  id={`cat-nav-${cat.key.toLowerCase()}`}
                  onClick={() => onSelectCategory(cat.key)}
                  className={`relative px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                  title={cat.description}
                >
                  {cat.key === 'Maharashtra' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                  )}
                  {cat.key === 'India' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                  )}
                  <span>{cat.label}</span>
                  {typeof count === 'number' && count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
