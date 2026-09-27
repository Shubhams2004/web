import React from 'react';
import {
  ArrowUp,
  Radio,
  Gamepad2,
  FlaskConical,
  Newspaper,
  Compass,
} from 'lucide-react';
import { portfolioData } from '../../data/portfolioData';
import { BrandLogo } from './BrandLogo';
import { missionAudio } from '../../mission-control/audio';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    missionAudio.playBeep(520, 0.04);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="site-footer"
      className="bg-slate-950 text-slate-400 py-14 sm:py-16 border-t border-slate-800 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Primary Row: Identity & Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
          {/* Identity & Mission statement (Span 5) */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <BrandLogo size="sm" className="w-9 h-9" />
              <div>
                <span className="text-white font-bold text-base tracking-tight block font-sans">
                  {portfolioData.person.fullName}
                </span>
                <span className="text-xs text-slate-400">
                  {portfolioData.person.headline}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-sans mt-1">
              Synthesizing real-time market catalysts, corporate disruptions, and public filings into empirical, publication-grade business case studies and interactive software systems.
            </p>
          </div>

          {/* Directory Links (Span 4) */}
          <div className="md:col-span-4 flex flex-col gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold mb-1">
              Directory & Deep Links
            </span>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <a href="#case-studies" className="text-slate-400 hover:text-white transition-colors">
                Case Studies
              </a>
              <a href="#live-wire" className="text-slate-400 hover:text-white transition-colors">
                Market Dispatches
              </a>
              <a href="#explore" className="text-slate-400 hover:text-white transition-colors">
                Explore Ecosystem
              </a>
              <a href="#about" className="text-slate-400 hover:text-white transition-colors">
                About & Method
              </a>
              <a href="#contact" className="text-slate-400 hover:text-white transition-colors">
                Contact Inquiries
              </a>
              <a href="#/news" className="text-slate-400 hover:text-blue-400 transition-colors">
                News Platform
              </a>
              <a href="#/game" className="text-slate-400 hover:text-emerald-400 transition-colors">
                3D Arcade & Sprint Run
              </a>
              <a href="#/playground" className="text-slate-400 hover:text-cyan-400 transition-colors">
                Experimental Lab
              </a>
            </div>
          </div>

          {/* Quick Access & Back to Top (Span 3) */}
          <div className="md:col-span-3 flex flex-col justify-between items-start md:items-end gap-4">
            <button
              type="button"
              onClick={scrollToTop}
              id="back-to-top-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
              aria-label="Scroll back to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>

            {/* Mission Control shortcut */}
            <button
              type="button"
              onClick={() => {
                missionAudio.playRadarPing();
                window.location.hash = '#/mission-control';
              }}
              className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 py-1.5 px-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
              title="Open Command Deck (Shortcut: Ctrl+Shift+M)"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mission Control</span>
              <span className="text-[10px] text-slate-500 font-mono">⌘⇧M</span>
            </button>
          </div>
        </div>

        {/* Bottom Sub-Footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="font-sans">
            &copy; {new Date().getFullYear()} {portfolioData.person.fullName}. Empirical research synthesis & interactive digital laboratory.
          </p>

          <div className="flex items-center gap-3 text-xs">
            <span>Remote (Worldwide)</span>
            <span aria-hidden="true">·</span>
            <span>Available for Strategy Sprints</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
