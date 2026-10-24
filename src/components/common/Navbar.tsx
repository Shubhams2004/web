import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { portfolioData } from '../../data/portfolioData';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href === '#/game' || href === '/game' || href.startsWith('#/game')) {
      if (window.history && window.history.pushState) {
        const base = import.meta.env.BASE_URL || '/';
        const target = base.endsWith('/') ? `${base}game` : `${base}/game`;
        window.history.pushState({}, '', target);
      }
      window.location.hash = '#/game';
      return;
    }
    if (href.startsWith('#/')) {
      window.location.hash = href;
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-slate-950/95 backdrop-blur-md shadow-md shadow-black/30 border-b border-slate-800 py-2.5 sm:py-3'
          : 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 py-3 sm:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Zone: Clean Wordmark */}
        <a
          href="#home"
          id="logo-brand-link"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('#home');
          }}
          className="group flex items-center gap-3 text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl p-1 transition-all"
          aria-label="Home - Shubham Sonale"
        >
          <div className="relative p-0.5 rounded-xl transition-transform group-hover:scale-105">
            <BrandLogo
              size="md"
              className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-xs"
              withGlow={false}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-base sm:text-lg leading-tight tracking-tight group-hover:text-blue-400 transition-colors">
              {portfolioData.person.fullName}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium tracking-normal">
              {portfolioData.person.headline}
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
          {portfolioData.navigation.map((item) => {
            const sectionId = item.href.replace('#', '');
            const isActive = activeSection === sectionId;
            return (
              <a
                key={item.label}
                id={`nav-link-${sectionId}`}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-blue-400 bg-blue-950/60 border border-blue-800/50 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </a>
            );
          })}

          <div className="h-4 w-px bg-slate-800 mx-2" aria-hidden="true" />

          {/* Direct CTA button */}
          <a
            href="#contact"
            id="nav-cta-contact"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#contact');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-950/40 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap"
          >
            <span>Get in Touch</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          id="mobile-menu-toggle-btn"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-drawer" className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 shadow-2xl">
          <div className="flex items-center gap-2.5 px-2 pb-3 mb-2 border-b border-slate-800">
            <BrandLogo size="sm" className="w-8 h-8" />
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm leading-tight">{portfolioData.person.fullName}</span>
              <span className="text-[11px] text-slate-400 leading-tight">{portfolioData.person.headline}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 mb-4">
            {portfolioData.navigation.map((item) => {
              const sectionId = item.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={item.label}
                  id={`mobile-nav-link-${sectionId}`}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    isActive
                      ? 'text-blue-400 bg-blue-950/60 border border-blue-800/40 font-semibold'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                </a>
              );
            })}

            <div className="h-px bg-slate-800 my-2" />

            {/* Quick access links to deeper areas in mobile drawer */}
            <a
              href="#/game"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 flex items-center justify-between"
            >
              <span>Arcade Games</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <a
              href="#/playground"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 flex items-center justify-between"
            >
              <span>Experimental Laboratory</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <a
              href="#/news"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 flex items-center justify-between"
            >
              <span>Newsroom Platform</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{portfolioData.person.statusBadge}</span>
            </div>
            <a
              href="#contact"
              id="mobile-nav-cta-contact"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#contact');
              }}
              className="w-full text-center py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-500 shadow-xs transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

