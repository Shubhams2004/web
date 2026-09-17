import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

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
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 py-3'
          : 'bg-white/80 backdrop-blur-xs border-b border-slate-100 py-4'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Site Title / Logo with user's name */}
        <a
          href="#home"
          id="logo-brand-link"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('#home');
          }}
          className="group flex items-center gap-3 text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs group-hover:bg-blue-700 transition-colors">
            {portfolioData.person.avatarInitials}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-base leading-tight tracking-tight group-hover:text-blue-600 transition-colors">
              {portfolioData.person.fullName}
            </span>
            <span className="text-xs text-slate-500 font-medium tracking-normal flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Freelance Researcher & Analyst
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
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
                className={`px-3.5 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {item.label}
              </a>
            );
          })}

          <div className="h-4 w-px bg-slate-200 mx-2" aria-hidden="true" />

          {/* Direct CTA button */}
          <a
            href="#contact"
            id="nav-cta-contact"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#contact');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Get in Touch
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          id="mobile-menu-toggle-btn"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-drawer" className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-lg">
          <div className="flex flex-col gap-1.5 mb-4">
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
                  className={`px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{portfolioData.person.statusBadge}</span>
            </div>
            <a
              href="#contact"
              id="mobile-nav-cta-contact"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#contact');
              }}
              className="w-full text-center py-2.5 px-4 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 shadow-xs transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
