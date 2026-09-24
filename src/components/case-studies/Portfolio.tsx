import React, { useState, useMemo } from 'react';
import { ArrowUpRight, CheckCircle, Tag, FileText, Sparkles, ExternalLink } from 'lucide-react';
import { portfolioData, projects } from '../../data/portfolioData';
import { Project } from '../../types';
import { ProjectModal } from './ProjectModal';
import { ScrollReveal } from '../common/ScrollReveal';
import { useInViewAnimation } from '../../hooks/useInViewAnimation';

export const Portfolio: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalFullScreen, setModalFullScreen] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const { ref, animationClasses } = useInViewAnimation<HTMLElement>({
    threshold: 0.08,
    rootMargin: '0px 0px -60px 0px',
  });

  // Source the case studies directly and exclusively from portfolioData.ts
  const caseStudies: Project[] = useMemo(() => {
    if (Array.isArray(portfolioData?.projects)) {
      return portfolioData.projects;
    }
    if (Array.isArray(projects)) {
      return projects;
    }
    return [];
  }, []);

  // Derive filter categories dynamically from the loaded case studies
  const categories = useMemo(() => {
    const uniqueTags = Array.from(
      new Set(caseStudies.map((p) => p.categoryTag).filter(Boolean))
    );
    return uniqueTags.length > 0 ? ['All', ...uniqueTags] : ['All'];
  }, [caseStudies]);

  // Filter projects strictly based on the active selection
  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') return caseStudies;
    return caseStudies.filter(
      (p) => p.categoryTag.toLowerCase() === activeFilter.toLowerCase()
    );
  }, [caseStudies, activeFilter]);

  // Color mapping utility for project category badges
  const getBadgeStyle = (color?: string) => {
    switch (color) {
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'slate':
        return 'bg-slate-100 text-slate-700 border-slate-200/60';
      case 'blue':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
    }
  };

  return (
    <section
      id="portfolio"
      ref={ref}
      className={`py-20 sm:py-24 bg-slate-50/70 border-b border-slate-200/70 ${animationClasses}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              {caseStudies.length === 1 ? 'Research Case Study' : 'Research Case Studies'}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              {caseStudies.length === 1 ? 'Featured Case Study' : 'Selected Case Studies'}
            </h2>
            <p className="text-base text-slate-600 mt-3">
              {caseStudies.length === 1
                ? 'In-depth architecture specification and research case study loaded directly from portfolio specifications.'
                : 'Curated research case studies detailing empirical methodologies, system architectures, and measurable outcomes.'}
            </p>
          </div>

          {/* Quick Filter Pill Tabs (only shown when multiple categories exist) */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs self-start md:self-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveFilter(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    activeFilter === cat
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </ScrollReveal>

        {/* Project Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 mb-12">
            No research case studies found for the selected category.
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 ${
              filteredProjects.length > 1 ? 'md:grid-cols-2 gap-6 lg:gap-8' : 'max-w-3xl'
            } mb-12`}
          >
            {filteredProjects.map((project, index) => (
              <ScrollReveal
                key={project.id}
                id={`portfolio-card-${project.id}`}
                delay={index * 0.08}
                className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between hover:border-blue-400 hover:shadow-lg transition-all duration-200 group relative cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div>
                  {/* Header Tag and Counter */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${getBadgeStyle(
                        project.tagColor
                      )}`}
                    >
                      <Tag className="w-3 h-3" />
                      {project.categoryTag}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Project Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                    {project.title}
                  </h3>

                  {/* Optional Subtitle */}
                  {project.subtitle && (
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">
                      {project.subtitle}
                    </p>
                  )}

                  {/* Brief Description */}
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">
                    {project.briefDescription}
                  </p>

                  {/* Methods / Technologies Used */}
                  {project.methodsUsed && project.methodsUsed.length > 0 && (
                    <div className="mb-5 flex flex-wrap gap-1.5">
                      {project.methodsUsed.map((method, mIdx) => (
                        <span
                          key={mIdx}
                          className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Key Outcome & Action Buttons */}
                <div className="pt-4 border-t border-slate-100 mt-2 space-y-2.5">
                  {project.keyOutcome && (
                    <div className="flex items-start gap-2 mb-3 text-xs sm:text-sm text-slate-700 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{project.keyOutcome}</span>
                    </div>
                  )}

                  <div className="w-full">
                    <button
                      type="button"
                      id={`view-details-${project.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalFullScreen(true);
                        setSelectedProject(project);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      <span>Read Case Study</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.hash = `#/case-study/${project.id}`;
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-medium py-1 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in dedicated separate page</span>
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Mobile Optimized
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* Data Source Confirmation Badge */}
        <ScrollReveal
          delay={0.15}
          className="p-4 sm:p-5 rounded-xl bg-white border border-dashed border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-3xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <span>Loaded from portfolioData.ts</span>
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              </p>
              <p className="text-xs text-slate-500">
                Rendering {caseStudies.length} case study specification directly from <code className="text-blue-600 font-mono">/src/data/portfolioData.ts</code>.
              </p>
            </div>
          </div>
          <a
            href="#contact"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 shrink-0 inline-flex items-center gap-1"
          >
            Have questions? Let's talk &rarr;
          </a>
        </ScrollReveal>
      </div>

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        defaultFullScreen={modalFullScreen}
      />
    </section>
  );
};

