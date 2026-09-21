import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { TrendingCaseStudies } from './components/TrendingCaseStudies';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { CaseStudyPage } from './components/CaseStudyPage';
import { NewsPlatformPage } from './components/news/NewsPlatformPage';
import { portfolioData } from './data/portfolioData';
import { updatePageSEO, SECTION_SEO_PRESETS } from './utils/seo';
import { NewsCategory } from './types';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [caseStudyProjectId, setCaseStudyProjectId] = useState<string | null>(null);
  const [isNewsPlatformPage, setIsNewsPlatformPage] = useState<boolean>(false);
  const [newsInitialCategory, setNewsInitialCategory] = useState<NewsCategory>('All');

  // Hash-based standalone routing for dedicated case study page and news platform
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '';
      if (hash.startsWith('#/case-study/') || hash.startsWith('#case-study-')) {
        const id = hash.replace('#/case-study/', '').replace('#case-study-', '');
        setCaseStudyProjectId(id);
        setIsNewsPlatformPage(false);
      } else if (
        hash === '#/news' ||
        hash === '#news-portal' ||
        hash === '#/newsroom' ||
        hash.startsWith('#/news/') ||
        hash.startsWith('#news-hub')
      ) {
        setCaseStudyProjectId(null);
        setIsNewsPlatformPage(true);
        if (hash.startsWith('#/news/')) {
          const rawCat = hash.replace('#/news/', '');
          const formatted = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
          setNewsInitialCategory((formatted as NewsCategory) || 'All');
        } else {
          setNewsInitialCategory('All');
        }
      } else {
        setCaseStudyProjectId(null);
        setIsNewsPlatformPage(false);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update dynamic SEO meta tags whenever the active section context changes
  useEffect(() => {
    if (caseStudyProjectId || isNewsPlatformPage) return;
    const preset = SECTION_SEO_PRESETS[activeSection];
    if (preset) {
      updatePageSEO(preset);
    }
  }, [activeSection, caseStudyProjectId, isNewsPlatformPage]);

  useEffect(() => {
    if (caseStudyProjectId || isNewsPlatformPage) return;
    const sections = ['home', 'case-studies', 'about', 'contact'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140; // offset for sticky header

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [caseStudyProjectId, isNewsPlatformPage]);

  // If the dedicated news platform page is requested
  if (isNewsPlatformPage) {
    return (
      <NewsPlatformPage
        initialCategory={newsInitialCategory}
        onBackToPortfolio={() => {
          window.location.hash = '#home';
        }}
      />
    );
  }

  // If a legacy project separate page is requested
  const activeCaseStudyProject = caseStudyProjectId
    ? portfolioData.projects.find((p) => p.id === caseStudyProjectId) ||
      portfolioData.projects[0]
    : null;

  if (caseStudyProjectId && activeCaseStudyProject) {
    return (
      <CaseStudyPage
        project={activeCaseStudyProject}
        onBack={() => {
          window.location.hash = '#case-studies';
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <Navbar activeSection={activeSection} />

      {/* Main Content Sections: Brief Intro + Trending Business Case Studies centerpiece + About + Contact */}
      <main className="flex-1">
        <Hero
          onOpenRssDiscovery={() => {
            const btn = document.getElementById('discover-rss-btn');
            if (btn) {
              btn.click();
            } else {
              const el = document.getElementById('case-studies');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />
        <TrendingCaseStudies />
        <About />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
