import React, { useEffect } from 'react';
import { X, Calendar, Layers, Award, ArrowUpRight } from 'lucide-react';
import { Project } from '../types';
import { updatePageSEO, SECTION_SEO_PRESETS } from '../utils/seo';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);

      // Dynamically update SEO meta tags & structured data for this specific case study
      const desc = project.fullOverview || project.briefDescription;
      const projectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}#project-${project.id}`
        : `https://shubhamsonale.com/#project-${project.id}`;

      updatePageSEO({
        title: project.title,
        description: desc,
        canonicalUrl: projectUrl,
        ogType: 'article',
        lang: 'en',
        locale: 'en_US',
        section: project.categoryTag,
        keywords: [
          project.categoryTag,
          'Case Study',
          'Research Paper',
          ...project.methodsUsed,
          'Shubham Sonale',
        ],
        alternates: [
          { lang: 'en', href: projectUrl },
          { lang: 'x-default', href: projectUrl },
        ],
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: project.title,
          description: desc,
          mainEntityOfPage: projectUrl,
          author: {
            '@type': 'Person',
            name: 'Shubham Sonale',
          },
          genre: project.categoryTag,
          keywords: project.methodsUsed.join(', '),
        },
      });
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
      // Restore section SEO when modal closes
      if (project) {
        updatePageSEO(SECTION_SEO_PRESETS.portfolio);
      }
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      id="project-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="project-detail-modal-card"
        className="bg-white rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close project modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tag & Timeframe */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            {project.categoryTag}
          </span>
          {project.timeframe && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {project.timeframe}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 pr-8">
          {project.title}
        </h3>

        {/* Overview */}
        <div className="space-y-4 mb-6">
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
            {project.fullOverview || project.briefDescription}
          </p>
        </div>

        {/* Methods Used */}
        <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
            <Layers className="w-4 h-4 text-blue-600" />
            Methods & Execution
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {project.methodsUsed.map((method, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>{method}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Outcome / Impact */}
        <div className="p-4 rounded-lg bg-emerald-50/80 border border-emerald-200/80 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            Key Outcome & Impact
          </div>
          <p className="text-sm text-emerald-950 font-medium leading-relaxed">
            {project.keyOutcome}
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400 italic">
            Configured via src/data/portfolioData.ts
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
