import React, { useState, useEffect } from 'react';
import { Navbar, Footer } from './components/common';
import { Hero, About, TrendingCaseStudies, Contact } from './components/sections';
import { FeaturedExperienceCard, LiveWorldFeed } from './components/playground';
import { CaseStudyPage } from './components/case-studies';
import { NewsPlatformPage } from './components/news';
import { RetroGamePage, ZombieGamePage, PixelDungeonPage, GameId } from './games';
import { MissionControlPage } from './mission-control';
import { portfolioData } from './data';
import { updatePageSEO, SECTION_SEO_PRESETS } from './utils';
import { NewsCategory } from './types';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [caseStudyProjectId, setCaseStudyProjectId] = useState<string | null>(null);
  const [isNewsPlatformPage, setIsNewsPlatformPage] = useState<boolean>(false);
  const [isGamePage, setIsGamePage] = useState<boolean>(false);
  const [isMissionControlPage, setIsMissionControlPage] = useState<boolean>(false);
  const [activeGameId, setActiveGameId] = useState<GameId>('pixel-dungeon');
  const [newsInitialCategory, setNewsInitialCategory] = useState<NewsCategory>('All');

  // Standalone routing for /game, dedicated case study page, news platform, and Mission Control
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash || '';
      const path = window.location.pathname || '';

      // Check Mission Control command center access
      const isMissionControl =
        hash === '#/mission-control' ||
        hash === '#mission-control' ||
        hash === '#control' ||
        hash === '#/control' ||
        hash === '#/hq' ||
        hash === '#hq';

      if (isMissionControl) {
        setIsMissionControlPage(true);
        setIsGamePage(false);
        setIsNewsPlatformPage(false);
        setCaseStudyProjectId(null);
        return;
      }

      setIsMissionControlPage(false);

      // Check if user is navigating to /game or #/game or /web/game
      const isGame =
        hash === '#/game' ||
        hash === '#game' ||
        hash.startsWith('#/game/') ||
        hash.startsWith('#game-') ||
        path.endsWith('/game') ||
        path.endsWith('/game/');

      if (isGame) {
        setIsGamePage(true);
        setIsNewsPlatformPage(false);
        setCaseStudyProjectId(null);

        // Check specific game requested in hash
        if (
          hash.includes('dungeon') ||
          hash === '#game-dungeon' ||
          hash.startsWith('#/game/pixel') ||
          hash.startsWith('#/game/dungeon')
        ) {
          setActiveGameId('pixel-dungeon');
        } else if (
          hash.includes('zombie') ||
          hash === '#game-zombie' ||
          hash.startsWith('#/game/zombie')
        ) {
          setActiveGameId('zombie-survival');
        } else if (
          hash.includes('racer') ||
          hash.includes('retro') ||
          hash === '#game-racer' ||
          hash.startsWith('#/game/retro')
        ) {
          setActiveGameId('retro-racer');
        }
        return;
      }

      setIsGamePage(false);

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

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Global shortcut to toggle Mission Control command center (Ctrl+Shift+M or Cmd+Shift+M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        if (isMissionControlPage) {
          window.location.hash = '#home';
        } else {
          window.location.hash = '#/mission-control';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMissionControlPage]);

  // Update dynamic SEO meta tags whenever the active section context changes
  useEffect(() => {
    if (caseStudyProjectId || isNewsPlatformPage || isGamePage || isMissionControlPage) return;
    const preset = SECTION_SEO_PRESETS[activeSection];
    if (preset) {
      updatePageSEO(preset);
    }
  }, [activeSection, caseStudyProjectId, isNewsPlatformPage, isGamePage, isMissionControlPage]);

  useEffect(() => {
    if (caseStudyProjectId || isNewsPlatformPage || isGamePage || isMissionControlPage) return;
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
  }, [caseStudyProjectId, isNewsPlatformPage, isGamePage, isMissionControlPage]);

  // If the secret Mission Control command center is requested
  if (isMissionControlPage) {
    const handleBack = () => {
      const base = import.meta.env.BASE_URL || '/';
      if (window.history && window.history.pushState) {
        window.history.pushState({}, '', base);
      }
      window.location.hash = '#home';
      setIsMissionControlPage(false);
    };

    const handleLaunchGame = (route: string) => {
      window.location.hash = route;
    };

    return (
      <MissionControlPage
        onBack={handleBack}
        onLaunchGame={handleLaunchGame}
      />
    );
  }

  // If the Arcade Game page is requested
  if (isGamePage) {
    const handleBack = () => {
      const base = import.meta.env.BASE_URL || '/';
      if (window.history && window.history.pushState) {
        window.history.pushState({}, '', base);
      }
      window.location.hash = '#home';
      setIsGamePage(false);
    };

    const handleSwitchGame = (gameId: string) => {
      const id = gameId as GameId;
      setActiveGameId(id);
      window.location.hash = `#/game/${id}`;
    };

    if (activeGameId === 'pixel-dungeon') {
      return (
        <PixelDungeonPage
          onBack={handleBack}
          onSwitchGame={handleSwitchGame}
        />
      );
    }

    if (activeGameId === 'zombie-survival') {
      return (
        <ZombieGamePage
          onBack={handleBack}
          onSwitchGame={handleSwitchGame}
        />
      );
    }

    return (
      <RetroGamePage
        onBack={handleBack}
        onSwitchGame={handleSwitchGame}
      />
    );
  }

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

      {/* Main Content Sections: Living Retro Playground (Hero + Signal Console + Featured Experience + Live World Feed) + Trending Business Case Studies + About + Contact */}
      <main className="flex-1">
        <Hero
          onLaunchGame={(id) => {
            setActiveGameId(id as GameId);
            setIsGamePage(true);
            window.location.hash = `#/game/${id}`;
          }}
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
        <FeaturedExperienceCard
          onLaunchGame={(id) => {
            setActiveGameId(id as GameId);
            setIsGamePage(true);
            window.location.hash = `#/game/${id}`;
          }}
        />
        <LiveWorldFeed />
        <TrendingCaseStudies />
        <About />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
